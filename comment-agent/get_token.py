"""One-time helper: run this on YOUR computer to authorise the agent for your channel.

  pip install google-auth-oauthlib
  python get_token.py path/to/client_secret.json

A browser opens; sign in with the Google account that owns the channel (pick the channel
if you have several) and allow access. It prints the three values to store as secrets.
"""
import json
import sys

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube.force-ssl"]

if len(sys.argv) != 2:
    sys.exit("usage: python get_token.py client_secret.json")

flow = InstalledAppFlow.from_client_secrets_file(sys.argv[1], SCOPES)
creds = flow.run_local_server(port=0, access_type="offline", prompt="consent")
info = json.load(open(sys.argv[1]))
client = info.get("installed") or info.get("web")
print("\nStore these as secrets (never commit them):\n")
print("YT_CLIENT_ID     =", client["client_id"])
print("YT_CLIENT_SECRET =", client["client_secret"])
print("YT_REFRESH_TOKEN =", creds.refresh_token)
