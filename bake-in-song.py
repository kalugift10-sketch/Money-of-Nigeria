#!/usr/bin/env python3
"""Bake the song into the page, producing one self-contained HTML file.

Put this next to money-of-nigeria.html and your track, then run it
(double-click, or: python bake-in-song.py). It writes a new file with
the audio embedded, so there is no folder to keep together — you can
move that single file anywhere and the music still plays.

Everything happens on this machine. Nothing is uploaded.
"""

import base64
import mimetypes
import os
import sys

PAGE_IN = "money-of-nigeria.html"
PAGE_OUT = "money-of-nigeria-with-song.html"
AUDIO_EXTS = (".mp3", ".m4a", ".wav", ".ogg", ".aac", ".flac")

here = os.path.dirname(os.path.abspath(__file__))
os.chdir(here)


def pause_and_exit(code=1):
    print("\nPress Enter to close.")
    try:
        input()
    except EOFError:
        pass
    sys.exit(code)


page = PAGE_IN
if not os.path.isfile(page):
    pages = sorted(
        f for f in os.listdir(".")
        if f.lower().endswith(".html") and f != PAGE_OUT
    )
    if not pages:
        print(f"Could not find {PAGE_IN} in this folder:\n    {here}")
        pause_and_exit()
    page = pages[0]
    print(f"'{PAGE_IN}' not found — using '{page}'.")

tracks = sorted(f for f in os.listdir(".") if f.lower().endswith(AUDIO_EXTS))
if not tracks:
    print(f"No audio file found in this folder:\n    {here}")
    print("\nPut your track here (.mp3, .m4a, .wav ...) and run this again.")
    pause_and_exit()

track = tracks[0]
if len(tracks) > 1:
    print("Several audio files found; using the first:")
    for t in tracks:
        print("   ", t, "  <-- using this" if t == track else "")

mime = mimetypes.guess_type(track)[0] or "audio/mpeg"
raw = open(track, "rb").read()
data_uri = f"data:{mime};base64," + base64.b64encode(raw).decode("ascii")

html = open(page, encoding="utf-8").read()

# The page lists candidate filenames; replace that list with the embedded
# track so it needs nothing else on disk.
needle = "files: ["
start = html.find(needle)
if start == -1:
    print(f"'{page}' does not look like the Money of Nigeria page —")
    print("no playlist file list found in it. Nothing changed.")
    pause_and_exit()

end = html.find("]", start)
html = html[:start] + "files: ['" + data_uri + "'" + html[end:]

open(PAGE_OUT, "w", encoding="utf-8").write(html)

size_mb = len(html) / (1024 * 1024)
print()
print(f"  Track embedded : {track}  ({len(raw)/(1024*1024):.1f} MB)")
print(f"  Written        : {PAGE_OUT}  ({size_mb:.1f} MB)")
print()
print("  Double-click that file. It plays on its own, from anywhere.")
print("  Keep it for yourself — it now contains the song.")
pause_and_exit(0)
