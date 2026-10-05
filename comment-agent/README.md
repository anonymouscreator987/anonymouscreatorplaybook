# Wobbly Gags comment agent

Runs every 4 hours as a Claude Routine (free on your Claude plan, your PC can be off) and:

- **Replies to new comments** on your videos in the channel's deadpan, sarcastic voice, picking the funniest jokes, real questions and people sharing their own embarrassing stories. Up to 15 replies per run.
- **Skips** emoji-only, "first", generic praise, and anything it can't add to.
- **Flags spam** (scams, links, self-promo, hate). With `--hold-spam` it hides those comments for your review.
- **Leaves a conversation-starter comment** on each upload from the last 3 days that doesn't have one from the channel yet.

It never asks for subs, never posts links, and says it's an AI helper if someone asks.
It only acts on **your own** channel's videos.

## What it can't do (YouTube API limits)

- **Pin comments or add hearts:** the API doesn't allow it. Pin the starter comment in Studio if you want.
- **Community posts:** there's no API for those. Use a Cowork scheduled task in Claude Desktop instead.

## How it runs (free)

A **Claude Routine** (a scheduled Claude Code cloud session on your Claude plan) fires every 4 hours.
Each run follows [`ROUTINE_PROMPT.md`](ROUTINE_PROMPT.md): `agent.py fetch` pulls unanswered comments,
Claude writes the replies itself, and `agent.py post` publishes them. No API key and no server are needed;
it only uses your Claude plan's normal usage allowance (a few minutes of session time per run).

## One-time setup (about 15 minutes)

### 1. Google Cloud: get YouTube API access (free)
1. Go to <https://console.cloud.google.com/>, create a project (e.g. "wobbly-gags-agent").
2. **APIs & Services → Library →** enable **YouTube Data API v3**.
3. **APIs & Services → OAuth consent screen:** User type **External**, fill in the app name and your email, add yourself under **Test users**. Then press **Publish app** (set it to "In production"). In "Testing" mode Google expires the login after 7 days, and the agent would stop.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID →** type **Desktop app**. Download the JSON (`client_secret_....json`).

### 2. Authorise your channel (on your computer)
```
pip install google-auth-oauthlib
python comment-agent/get_token.py client_secret_XXXX.json
```
Sign in with the account that owns Wobbly Gags, pick the channel, and allow access. It prints
`YT_CLIENT_ID`, `YT_CLIENT_SECRET` and `YT_REFRESH_TOKEN`. **Never commit these or the JSON file: this repo is public.**

### 3. Put them in the cloud environment
In Claude (web/app): open a Claude Code session in this environment → the environment menu in the
session title bar → **Edit** → add environment variables:
`YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`.
Leave `COMMENT_AGENT_LIVE` unset at first: runs are dry runs that only report what they *would* post.
When you like the tone, add `COMMENT_AGENT_LIVE` = `true`. Remove it to pause posting.

### 4. Allow it to post on its own (one time)
Claude won't post publicly from an unattended run unless you allow it. In the same **Edit environment**
window (Code `</>` → **+ New** → ☁️ **Default** → ⚙️), paste this into the **Setup script** box and **Save**:
```
mkdir -p /root/.claude
cat > /root/.claude/settings.json <<'JSON'
{"permissions":{"allow":["Bash(python /root/wg-agent/comment-agent/agent.py:*)","Bash(git clone -q --depth 1 -b claude/determined-galileo-8no6z9 https://github.com/anonymouscreator987/anonymouscreatorplaybook /root/wg-agent)","Bash(pip install -q google-api-python-client google-auth)","Bash(cat /root/.claude/settings.json)"]}}
JSON
```

## Running it by hand
```
pip install -r comment-agent/requirements.txt
python comment-agent/agent.py fetch > inbox.json
python comment-agent/agent.py persona            # voice + rules + plan format
# write plan.json, then:
python comment-agent/agent.py post plan.json --inbox inbox.json          # dry run
python comment-agent/agent.py post plan.json --inbox inbox.json --live   # post
```
(`agent.py auto --live` does everything in one go but needs a paid `ANTHROPIC_API_KEY`.)

## Limits
- **YouTube quota:** 10,000 units/day free. Each reply or comment costs 50 units, so about **190 posts/day max**. At 15 replies every 4 hours you post at most 90 a day, well under the quota.
- **Claude plan usage:** each run is a short session. If you hit your plan's limit, runs pause until it resets and nothing breaks.

## Changing the voice
Edit `PERSONA` at the top of `agent.py`. The reply rules (what to reply to, skip or flag) are `REPLY_RULES` and `STARTER_RULES`.
