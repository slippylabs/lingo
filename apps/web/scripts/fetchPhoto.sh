#!/usr/bin/env bash

# Requirements: ImageMagick and jpegoptim
# Linux: sudo apt-get install imagemagick jpegoptim
# macOS: brew install imagemagick jpegoptim

set -euo pipefail

# Detect OS and set convert command
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    convert_command="convert"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    convert_command="magick"
else
    echo "OS not supported for image conversion"
    exit 1
fi

url=$(echo "$1" | cut -d',' -f2)
image_name=$(echo "$1" | cut -d',' -f1)

# Skip if image already exists
if [ -e "./static/images/$image_name.jpg" ]; then
    exit 0
fi

# Extract image ID and build download URL
download_url=""

if [[ "$url" =~ ^https://images.unsplash.com/.*$ ]]; then
    # Direct Unsplash CDN URL - use as-is
    download_url="$url"
    image_id=$(echo "$url" | grep -oP '(?<=/)[a-zA-Z0-9_-]+(?=\?)' | head -1 || echo "unsplash_image")
elif [[ "$url" =~ ^https://unsplash.com/photos/(.+)-([a-zA-Z0-9_-]+)$ ]]; then
    # Unsplash page URL - extract ID and build CDN URL
    image_id="${BASH_REMATCH[2]}"
    download_url="https://images.unsplash.com/${image_id}?w=2400&q=75"
else
    # Fallback for other URLs
    image_id=$(echo "$url" | grep -oP '[a-zA-Z0-9_-]+' | tail -1)
    download_url="$url"
fi

echo "Image: $image_name"
echo "ID: $image_id"
echo "URL: $download_url"

# Download image
if ! wget -q "$download_url" -O "/tmp/${image_id}.jpg" 2>/dev/null; then
    echo "⚠️  Failed to download image: $image_name"
    exit 1
fi

# Create resized versions
$convert_command "/tmp/${image_id}.jpg" -resize 512x -resize 'x512<' -gravity center -crop 512x512+0+0 +repage "/tmp/${image_id}_cropped.jpg"
$convert_command "/tmp/${image_id}.jpg" -resize 240x -resize 'x240<' -gravity center -crop 240x240+0+0 +repage "/tmp/${image_id}_tiny.jpg"
$convert_command "/tmp/${image_id}.jpg" -resize 100x -resize 'x100<' -gravity center -crop 100x100+0+0 +repage "/tmp/${image_id}_tinier.jpg"

# Optimize and move to destination
jpegoptim "/tmp/${image_id}_cropped.jpg" -d "./static/images/" -s -m85 --quiet
jpegoptim "/tmp/${image_id}_tiny.jpg" -d "./static/images/" -s -m75 --quiet
jpegoptim "/tmp/${image_id}_tinier.jpg" -d "./static/images/" -s -m55 --quiet

mv "./static/images/${image_id}_cropped.jpg" "./static/images/${image_name}.jpg"
mv "./static/images/${image_id}_tiny.jpg" "./static/images/${image_name}_tiny.jpg"
mv "./static/images/${image_id}_tinier.jpg" "./static/images/${image_name}_tinier.jpg"

echo "✅ Image downloaded: $image_name"
