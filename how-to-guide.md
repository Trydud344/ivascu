# How to Use Your Website

## What Changed

Your website now has **two pages** instead of one:

- **Home** — your name, hero intro, rotating skills
- **Camera Roll** — a photo gallery where you can show your personal pictures

When you click "camera roll" in the navigation bar, the page fades in smoothly. The back button in your browser works too — you can send someone a link like `yoursite.com/camera-roll` and it will open straight to the gallery.

---

## How to Add Photos

### Step 1: Put your photos in a folder

Pick a folder on your computer/server where you'll keep your photos. For example:

```
/home/ivascu/photos/
```

You can drop any file type into it — JPG, PNG, HEIC (iPhone photos), whatever. You can add photos by:

- Copying them from a USB drive
- Downloading them from your phone
- Using SCP/SFTP from another computer
- Any other method you like

### Step 2: Run the photo script

Open a terminal and run:

```sh
cd /home/ivascu/site
PHOTO_DIR=/home/ivascu/photos node scripts/generate-photos-json.js
```

This does three things:

1. Looks at every photo in your folder
2. Creates a small "thumbnail" version (600px wide) and a "full-size" version (1920px wide) — both in WebP format, which loads fast in browsers
3. Writes a file called `photos.json` that tells the website what photos exist and their sizes

You only need to re-run this command when you **add new photos** or **delete old ones**.

### Step 3: Refresh the website

Just navigate to the Camera Roll page on your site. It will automatically pick up the new photos.

---

## How to Set It Up on Your Server (One Time)

### First time setup

```sh
# Go to your site folder
cd /home/ivascu/site

# Install everything the site needs
npm ci

# Create a shortcut from your photo folder to the website
ln -s /home/ivascu/photos public/photos

# Process all your photos into web-friendly formats
PHOTO_DIR=/home/ivascu/photos node scripts/generate-photos-json.js

# Build the website
npm run build

# Copy the built site to where nginx can serve it
cp -r dist/* /var/www/ivascu/
cp public/photos.json /var/www/ivascu/photos.json
ln -s /home/ivascu/photos /var/www/ivascu/photos
```

### Each time you add photos

```sh
cd /home/ivascu/site
PHOTO_DIR=/home/ivascu/photos node scripts/generate-photos-json.js
npm run build
cp -r dist/* /var/www/ivascu/
cp public/photos.json /var/www/ivascu/photos.json
```

Or just run the `start.sh` script which does all of this automatically:

```sh
PHOTO_DIR=/home/ivascu/photos ./start.sh
```

---

## How the Gallery Works

When you visit the Camera Roll page:

- Photos appear in a **grid** — 3 columns on a computer, 2 on a tablet, 1 on a phone
- They're ordered from **oldest to newest** (by when the file was last modified)
- Each photo loads as a small thumbnail first so the page is fast
- **Click any photo** to open it full-screen
- In the full-screen view you can:
  - Click the **left/right arrows** to go through photos
  - Press **Escape** or click the background to close
  - Use your **keyboard arrow keys** to navigate
- Hovering over a photo makes it gently zoom in

---

## What's Safe and What's Not

### Safe ✅
- Only image files (JPG, PNG, WebP) are served to visitors — no scripts, no zip files, nothing dangerous
- Your original photos are never deleted or modified — the script creates *new* smaller copies
- No one can upload anything to your site — there's no upload button
- Directory listing is disabled — no one can browse your photo folder through the browser

### Not handled automatically ⚠️
- If you delete a photo from your folder, you need to re-run the script to update `photos.json` — otherwise the website will show a broken image
- HEIC photos (from iPhones) will not work in most browsers directly — but the script converts them to WebP automatically, so they'll show up fine

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Gallery says "No photos yet" | Run the `generate-photos-json.js` script — `photos.json` might be missing or empty |
| Photos look blurry | The script creates thumbnails at 600px wide. Full-size versions are 1920px — click to see the crisp version |
| New photo isn't showing up | Re-run `generate-photos-json.js` and rebuild. The gallery only knows about photos listed in `photos.json` |
| Broken image icon | The photo was deleted from the folder but `photos.json` still references it. Re-run the script to refresh the list |
| HEIC photo not showing | Re-run the script — it should convert HEIC to WebP. Make sure sharp is installed (`npm ls sharp` should show a version) |
