# tonyvideo.co

The code for [tonyvideo.co](https://tonyvideo.co), my video portfolio. I do motion design, 3D animation and
editing under the name tonymode.

It's plain HTML, CSS and JavaScript. No framework, no build step. GitHub Pages hosts it.

## Details

The design is based on a video editing timeline. As you scroll, a playhead moves across the top of the page
and a timecode counts up, like scrubbing through a one minute clip.

The background at the top plays one of five short video loops, picked at random. You won't get the same one
twice in a row. If your device has reduced motion or data saver turned on, it shows a still image instead.

Videos in the work section open in a player on the page. YouTube doesn't load until you hit play, which keeps
the page fast.

## Files

```
index.html       the whole site
css/style.css    styles
js/main.js       video loops, timeline, filters, player
assets/loops/    background loops and their still frames
assets/thumbs/   video thumbnails
assets/img/      favicon and link preview image
```

## Adding a video

1. Make a 960x540 thumbnail:
   `convert thumb.jpg -resize 960x540 -quality 78 assets/thumbs/<name>.webp`
2. Copy one of the `<li class="card">` blocks in `index.html` and change:
   - `data-id` to the YouTube video ID. Unlisted videos work fine.
   - `data-cat` to one or more of `product`, `motion`, `social`, `sports`. These power the filter buttons.
   - The link, thumbnail, title and description.
3. To make it the big featured tile, move the `card--feature` class onto it.

## Adding a background loop

Compress it first so the page stays light:

```
ffmpeg -i in.mp4 -an -vf "scale=1280:-2,fps=30,format=yuv420p" -c:v libx264 -preset slow -crf 30 -movflags +faststart assets/loops/loop-6.mp4
ffmpeg -ss 1 -i assets/loops/loop-6.mp4 -frames:v 1 -q:v 5 assets/loops/loop-6.jpg
```

Then raise `LOOPS` in `js/main.js` by one.

## Running locally

```
python3 -m http.server 8000
```
