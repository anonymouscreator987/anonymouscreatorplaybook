# Wobbly Gags comment agent

Runs every 3 hours on GitHub Actions (free, your PC can be off) and:

- **Replies to new comments** on your videos in the channel's deadpan, sarcastic voice, picking the funniest jokes, real questions and people sharing their own embarrassing stories. Up to 15 replies per run.
- **Skips** emoji-only, "first", generic praise, and anything it can't add to.
- **Flags spam** (scams, links, self-promo, hate). With `--hold-spam` it hides those comments for your review.
- **Leaves a conversation-starter comment** on each upload from the last 3 days that doesn't have one from the channel yet.

It never asks for subs, never posts links, and says it's an AI helper if someone asks.
It only acts on **your own** channel's videos.

## What it can't do (YouTube API limits)

- **Pin comments or add hearts:** the API doesn't allow it. Pin the starter comment in Studio if you want.
- **Community posts:** there's no API for those. Use a Cowork scheduled task in Claude Desktop instead.

## One-time setup (about 15 minutes)

### 1. Google Cloud: get YouTube API access
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

### 3. Claude API key
Create one at <https://platform.claude.com/> → API keys (separate from your Claude subscription; billed per use).

### 4. Add the secrets to GitHub
Repo → **Settings → Secrets and variables → Actions → New repository secret**, add:
`ANTHROPIC_API_KEY`, `YT_CLIENT_ID`, `YT_CLIENT_SECRET`, `YT_REFRESH_TOKEN`.

### 5. Test, then switch on
1. Repo → **Actions → comment-agent → Run workflow** with "Post for real" **unticked**. That's a dry run: the log shows every reply it *would* post.
2. Happy with the tone? Run it once with the box ticked.
3. To let the 3-hourly schedule post on its own: **Settings → Secrets and variables → Actions → Variables →** add `COMMENT_AGENT_LIVE` = `true`. Delete that variable to pause it.

Scheduled runs only fire from the repo's default branch (`main`), so this folder and `.github/workflows/comment-agent.yml` need to be merged into `main`.

## Running it by hand
```
pip install -r comment-agent/requirements.txt
export ANTHROPIC_API_KEY=... YT_CLIENT_ID=... YT_CLIENT_SECRET=... YT_REFRESH_TOKEN=...
python comment-agent/agent.py                 # dry run
python comment-agent/agent.py --live          # post
python comment-agent/agent.py --live --hold-spam --max-replies 30 --hours 24
```

## Limits and cost
- **YouTube quota:** 10,000 units/day free. Each reply or comment costs 50 units, so about **190 posts/day max**. Reading comments is cheap. The defaults (15 replies every 3 hours, at most 120 a day) stay under the quota.
- **Claude:** one call per run plus one per new upload. Expect a few cents per run, so roughly **$0.25–$1 per day** at this schedule, depending on comment volume.
- To change how often it runs, edit the `cron` line in `.github/workflows/comment-agent.yml`.

## Changing the voice
Edit `PERSONA` at the top of `agent.py`. The reply rules (what to reply to, skip or flag) are in `decide_replies()`.
