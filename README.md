# keyframe

Source for [tonyvideo.co](https://tonyvideo.co), the tonymode portfolio: motion design, 3D animation and editing.

Plain HTML, CSS and JavaScript with no build step, hosted on GitHub Pages.

## Layout

```
index.html            the whole site: hero, work grid, about, contact
css/style.css         styles
js/main.js            hero loop, scroll playhead/timecode, filters, video player
assets/loops/         hero background loops (mp4 + poster jpg), picked at random per visit
assets/thumbs/        work thumbnails, 960x540 .webp
assets/img/           favicon + social share image
```

## Adding a video

1. Export a 1920x1080 thumbnail and convert it:
   `convert thumb.jpg -resize 960x540 -quality 78 assets/thumbs/<slug>.webp`
2. Copy an existing `<li class="card">` in `index.html` and set:
   - `data-id`: the YouTube video ID (unlisted is fine)
   - `data-cat`: `motion`, `social` or `sports` (these drive the filter chips)
   - the `href`, thumbnail path, tag, title and one-line description
3. For the big tile, move `card--feature` to that card.

Cards open in an in-page player (youtube-nocookie embed). Cmd/Ctrl-click opens YouTube directly.

## Hero loops

Re-encode any new loop small before adding it:

```
ffmpeg -i in.mp4 -an -vf "scale=1280:-2,fps=30,format=yuv420p" -c:v libx264 -preset slow -crf 30 -movflags +faststart assets/loops/loop-6.mp4
ffmpeg -ss 1 -i assets/loops/loop-6.mp4 -frames:v 1 -q:v 5 assets/loops/loop-6.jpg
```

Then bump `LOOPS` in `js/main.js`.

## Local preview

```
python3 -m http.server 8000
```
