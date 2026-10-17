MINNI'S BIRTHDAY — how to use
=============================

OPEN IT
  Double-click index.html (works offline; fonts need internet, otherwise elegant
  fallback fonts are used). To share it, upload this whole folder to any static
  host (Netlify Drop, GitHub Pages, Cloudflare Pages…) and send her the link.

CHANGE WORDS OR PHOTOS  ->  src/story.js   (the only file with story content)
  - Each memory card lists its photos, e.g.  photos: ["photos/photo-08"]
    (no extension needed: .jpg .jpeg .png .webp are detected)
  - "gallery" is the final collage. The FIRST photo opens the grand reveal.
  - The bus clip sits on the "Unstoppable Duo" card (video: {...}).
  - Missing photos/videos are skipped quietly — nothing breaks.

MUSIC (optional)
  Put a file at  music/song.mp3  (or change the path in story.js).
  It never autoplays; Minni taps the round button at the top right.

KEYS
  Right arrow = next, Left arrow = back.
