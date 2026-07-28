#!/usr/bin/env python3
"""Serve this folder and open the site. Windows, macOS and Linux.

Double-click it, or run:  python serve.py
It always serves the folder it is saved in, picks a port that is
actually free, and opens the right page. Leave the window open.
"""

import http.server
import os
import socket
import socketserver
import sys
import threading
import urllib.parse
import webbrowser

PREFERRED = "index.html"

here = os.path.dirname(os.path.abspath(__file__))
os.chdir(here)


def pause_and_exit(code=1):
    print("\nPress Enter to close.")
    try:
        input()
    except EOFError:
        pass
    sys.exit(code)


# 1. Find the page. Browsers rename downloads ("... (1).html"), so fall
#    back to any HTML file sitting here rather than 404-ing later.
page = PREFERRED
if not os.path.isfile(page):
    candidates = sorted(f for f in os.listdir(".") if f.lower().endswith(".html"))
    if not candidates:
        print("No .html file found in this folder:")
        print("   ", here)
        print("\nPut serve.py in the SAME folder as the site file, then run it again.")
        print("This folder currently contains:")
        for f in sorted(os.listdir("."))[:20]:
            print("   ", f)
        pause_and_exit()
    page = candidates[0]
    print(f"'{PREFERRED}' not found — serving '{page}' instead.")

# 2. Take a port that is genuinely free, so a server you already have
#    running cannot shadow this one.
port = None
for candidate in range(8000, 8060):
    probe = socket.socket()
    try:
        probe.bind(("127.0.0.1", candidate))
        port = candidate
        break
    except OSError:
        continue
    finally:
        probe.close()

if port is None:
    print("Could not find a free port between 8000 and 8059.")
    pause_and_exit()


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):  # keep the window readable
        pass

    def end_headers(self):
        # Always serve fresh files, so edits show up on reload.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


url = f"http://localhost:{port}/{urllib.parse.quote(page)}"
print()
print(f"  Serving : {here}")
print(f"  Open    : {url}")
print(f"  Debug   : {url}?debug=1")
print()
print("  Leave this window open while you use the site.")
print("  Press Ctrl+C to stop.")
print()

threading.Timer(1.0, lambda: webbrowser.open(url)).start()

try:
    with socketserver.TCPServer(("", port), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nStopped.")
except OSError as exc:
    print(f"\nCould not start the server: {exc}")
    pause_and_exit()
