"""Wobbly Gags comment agent.

Each run:
  1. Finds recent comments on the channel's videos that the channel hasn't replied to yet.
  2. Asks Claude (in the Wobbly Gags voice) which ones deserve a reply and writes the replies.
  3. Leaves a conversation-starter comment on recent uploads that don't have one from the channel.

It is stateless: "already handled" is read back from YouTube itself (a thread the channel has
replied in is skipped), so it can run from a fresh checkout on any schedule.

Dry run is the default. Pass --live to actually post.

Env vars:
  ANTHROPIC_API_KEY                 Claude API key
  YT_CLIENT_ID, YT_CLIENT_SECRET    Google OAuth client (Desktop app type)
  YT_REFRESH_TOKEN                  from get_token.py, authorised for the channel
"""

import argparse
import datetime as dt
import json
import os
import random
import sys

import anthropic
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

MODEL = "claude-opus-5-5"
SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

PERSONA = """You run the comment section for Wobbly Gags, a YouTube Shorts channel of silent, hand-drawn
cartoon gags about embarrassing real-life moments (broken bathroom locks, stomach growls in exams,
waving at someone who wasn't waving at you, self-checkout meltdowns).

Voice: deadpan, dry, sarcastic in a friendly way, like the narrator captions in the videos
("the bathroom lock: purely decorative"). Short. Usually one line, never more than two sentences.
Lowercase is fine. At most one emoji, often none. Play along with the joke the viewer made,
add a small twist, or answer a real question plainly.

Rules:
- Never mean, never mock the viewer, no insults, no politics, no religion, nothing sexual.
- Never ask for subscribes, likes or shares, and never include links.
- Never claim to be a person you're not; if asked whether this is a bot or AI, say yes, the channel uses an AI helper for replies.
- Never promise future videos, dates or giveaways.
- Reply in the commenter's language.
- Don't repeat the same joke or phrasing across replies in one batch."""

DECIDE_SCHEMA = {
    "type": "object",
    "properties": {
        "decisions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "comment_id": {"type": "string"},
                    "action": {"type": "string", "enum": ["reply", "skip", "spam"]},
                    "reply": {"type": "string"},
                    "why": {"type": "string"},
                },
                "required": ["comment_id", "action", "reply", "why"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["decisions"],
    "additionalProperties": False,
}

STARTER_SCHEMA = {
    "type": "object",
    "properties": {"comment": {"type": "string"}},
    "required": ["comment"],
    "additionalProperties": False,
}


# ---------------- YouTube ----------------

def youtube_client():
    creds = Credentials(
        token=None,
        refresh_token=os.environ["YT_REFRESH_TOKEN"],
        client_id=os.environ["YT_CLIENT_ID"],
        client_secret=os.environ["YT_CLIENT_SECRET"],
        token_uri="https://oauth2.googleapis.com/token",
        scopes=SCOPES,
    )
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def my_channel(yt):
    r = yt.channels().list(part="id,snippet,contentDetails", mine=True).execute()
    ch = r["items"][0]
    return ch["id"], ch["snippet"]["title"], ch["contentDetails"]["relatedPlaylists"]["uploads"]


def recent_uploads(yt, uploads_playlist, days):
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)
    out = []
    r = yt.playlistItems().list(part="snippet,contentDetails", playlistId=uploads_playlist, maxResults=50).execute()
    for it in r.get("items", []):
        published = it["contentDetails"].get("videoPublishedAt")
        if not published:  # scheduled / not yet public
            continue
        when = dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
        if when >= cutoff:
            out.append({"id": it["contentDetails"]["videoId"], "title": it["snippet"]["title"],
                        "description": it["snippet"].get("description", "")[:500]})
    return out


def video_titles(yt, ids):
    titles = {}
    ids = list(ids)
    for i in range(0, len(ids), 50):
        r = yt.videos().list(part="snippet", id=",".join(ids[i:i + 50])).execute()
        for v in r.get("items", []):
            titles[v["id"]] = v["snippet"]["title"]
    return titles


def unanswered_comments(yt, channel_id, hours, limit_pages=3):
    """Top-level comments newer than `hours` with no reply from the channel."""
    cutoff = dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=hours)
    out, token = [], None
    for _ in range(limit_pages):
        r = yt.commentThreads().list(
            part="snippet,replies", allThreadsRelatedToChannelId=channel_id,
            order="time", maxResults=100, textFormat="plainText", pageToken=token,
        ).execute()
        stop = False
        for th in r.get("items", []):
            top = th["snippet"]["topLevelComment"]["snippet"]
            when = dt.datetime.fromisoformat(top["publishedAt"].replace("Z", "+00:00"))
            if when < cutoff:
                stop = True
                break
            if top.get("authorChannelId", {}).get("value") == channel_id:
                continue
            replies = th.get("replies", {}).get("comments", [])
            if any(c["snippet"].get("authorChannelId", {}).get("value") == channel_id for c in replies):
                continue
            if th["snippet"].get("totalReplyCount", 0) > len(replies):
                # replies list is truncated; fetch the full set to be sure we haven't answered
                full = yt.comments().list(part="snippet", parentId=th["id"], maxResults=100, textFormat="plainText").execute()
                if any(c["snippet"].get("authorChannelId", {}).get("value") == channel_id for c in full.get("items", [])):
                    continue
            out.append({
                "comment_id": th["id"],
                "video_id": th["snippet"].get("videoId", ""),
                "author": top.get("authorDisplayName", ""),
                "text": top.get("textDisplay", "")[:1000],
                "likes": top.get("likeCount", 0),
                "published": top["publishedAt"],
            })
        token = r.get("nextPageToken")
        if stop or not token:
            break
    return out


def has_own_top_comment(yt, video_id, channel_id):
    r = yt.commentThreads().list(part="snippet", videoId=video_id, order="time", maxResults=100).execute()
    return any(th["snippet"]["topLevelComment"]["snippet"].get("authorChannelId", {}).get("value") == channel_id
               for th in r.get("items", []))


def post_reply(yt, parent_id, text):
    return yt.comments().insert(part="snippet", body={"snippet": {"parentId": parent_id, "textOriginal": text}}).execute()


def post_top_comment(yt, channel_id, video_id, text):
    body = {"snippet": {"channelId": channel_id, "videoId": video_id,
                        "topLevelComment": {"snippet": {"textOriginal": text}}}}
    return yt.commentThreads().insert(part="snippet", body=body).execute()


def hold_for_review(yt, comment_id):
    yt.comments().setModerationStatus(id=comment_id, moderationStatus="heldForReview").execute()


# ---------------- Claude ----------------

def ask_claude(client, schema, user_text):
    resp = client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        system=PERSONA,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        output_config={"effort": "medium", "format": {"type": "json_schema", "schema": schema}},
        messages=[{"role": "user", "content": user_text}],
    )
    if resp.stop_reason == "refusal":
        raise RuntimeError(f"Claude declined this batch: {resp.stop_details}")
    if resp.stop_reason == "max_tokens":
        raise RuntimeError("Claude's answer was cut off (max_tokens); try a smaller --batch")
    text = next(b.text for b in resp.content if b.type == "text")
    return json.loads(text)


def decide_replies(client, comments, titles, max_replies):
    lines = []
    for c in comments:
        lines.append(json.dumps({"comment_id": c["comment_id"], "video": titles.get(c["video_id"], "?"),
                                 "author": c["author"], "likes": c["likes"], "text": c["text"]}, ensure_ascii=False))
    prompt = (
        f"New comments on the channel (one JSON object per line). Pick at most {max_replies} to reply to.\n"
        "Reply to: jokes you can riff on, genuine questions, people sharing their own embarrassing story, "
        "and the funniest or most-liked comments. Skip: bare emojis, 'first', generic 'nice video', "
        "anything you can't add to. Mark as spam: scams, links, self-promotion, bots, hate or harassment.\n"
        "Return a decision for EVERY comment; use an empty reply string for skip/spam.\n\n" + "\n".join(lines)
    )
    out = ask_claude(client, DECIDE_SCHEMA, prompt)["decisions"]
    known = {c["comment_id"] for c in comments}
    out = [d for d in out if d["comment_id"] in known]
    replies = [d for d in out if d["action"] == "reply" and d["reply"].strip()]
    return replies[:max_replies], [d for d in out if d["action"] == "spam"]


def write_starter(client, video):
    prompt = (
        "Write the channel's own first comment for this new Short. It should get people talking: "
        "ask viewers for their own version of the embarrassing moment, or a quick either/or question. "
        "One or two short lines, in the channel voice. No links, no 'subscribe'.\n\n"
        f"Title: {video['title']}\nDescription: {video['description']}"
    )
    return ask_claude(client, STARTER_SCHEMA, prompt)["comment"].strip()


# ---------------- main ----------------

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--live", action="store_true", help="actually post (default is a dry run that only prints)")
    ap.add_argument("--hours", type=float, default=48, help="look at comments from the last N hours")
    ap.add_argument("--max-replies", type=int, default=20, help="cap on replies per run")
    ap.add_argument("--batch", type=int, default=60, help="max comments sent to Claude per run")
    ap.add_argument("--starter-days", type=float, default=3, help="leave a starter comment on uploads from the last N days")
    ap.add_argument("--no-starters", action="store_true", help="don't post starter comments")
    ap.add_argument("--hold-spam", action="store_true", help="hold comments Claude marks as spam for review (needs --live)")
    args = ap.parse_args()

    yt = youtube_client()
    client = anthropic.Anthropic()
    channel_id, channel_name, uploads = my_channel(yt)
    mode = "LIVE" if args.live else "DRY RUN"
    print(f"[{mode}] channel: {channel_name} ({channel_id})")

    posted = 0

    # 1) starter comments on fresh uploads
    if not args.no_starters:
        for v in recent_uploads(yt, uploads, args.starter_days):
            if has_own_top_comment(yt, v["id"], channel_id):
                continue
            text = write_starter(client, v)
            print(f"\nSTARTER on '{v['title']}':\n  {text}")
            if args.live:
                post_top_comment(yt, channel_id, v["id"], text)
                posted += 1
                print("  -> posted (pin it in Studio if you like; the API can't pin)")

    # 2) replies
    comments = unanswered_comments(yt, channel_id, args.hours)
    print(f"\n{len(comments)} unanswered comments in the last {args.hours:g}h")
    if not comments:
        return
    # favour liked comments, keep some randomness so replies don't look mechanical
    comments.sort(key=lambda c: (c["likes"], random.random()), reverse=True)
    comments = comments[: args.batch]
    titles = video_titles(yt, {c["video_id"] for c in comments if c["video_id"]})
    replies, spam = decide_replies(client, comments, titles, args.max_replies)
    by_id = {c["comment_id"]: c for c in comments}

    for d in replies:
        c = by_id[d["comment_id"]]
        print(f"\n@{c['author']} on '{titles.get(c['video_id'], '?')}': {c['text'][:200]}\n  REPLY: {d['reply']}")
        if args.live:
            try:
                post_reply(yt, d["comment_id"], d["reply"])
                posted += 1
            except HttpError as e:
                print(f"  !! failed: {e}")
                if e.resp.status == 403 and "quota" in str(e).lower():
                    print("YouTube API daily quota reached; stopping.")
                    break

    for d in spam:
        c = by_id[d["comment_id"]]
        print(f"\nSPAM? @{c['author']}: {c['text'][:200]}  ({d['why']})")
        if args.live and args.hold_spam:
            try:
                hold_for_review(yt, d["comment_id"])
                print("  -> held for review")
            except HttpError as e:
                print(f"  !! failed to hold: {e}")

    print(f"\n[{mode}] done: {len(replies)} replies planned, {len(spam)} flagged, {posted} posted")


if __name__ == "__main__":
    try:
        main()
    except KeyError as e:
        sys.exit(f"Missing environment variable {e}. See comment-agent/README.md.")
