#!/usr/bin/env bash

# Be careful! Imagemagick and jpegoptim is required!

# Please run sudo apt-get update && sudo apt-get install imagemagick jpegoptim
# Macos: brew install jpegoptim

set -euo pipefail

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

if [ -e "./static/images/$image_name.jpg" ]; then
	exit 0
fi
# Check if the URL is from Unsplash and extract the image ID
if [[ "$url" =~ ^https://unsplash.com/photos/.*-([a-zA-Z0-9_-]+)$ ]]; then
  image_id="${BASH_REMATCH[1]}"
  download_url=$(curl -L "https://unsplash.com/photos/$image_id" | tidy  2> /dev/null | grep non-sponsored-photo-download-button -C 5 | grep https | sed 's/^[^"]*"//' | sed 's/".*//') || true
elif [[ "$url" =~ ^https://images.unsplash.com/.*$ ]]; then
  image_id=$(basename "$url")
  download_url=$url
else
  image_id=$(echo "$url" | cut -d'/' -f5)
  download_url=$(curl -L "https://unsplash.com/photos/$image_id" | tidy  2> /dev/null | grep non-sponsored-photo-download-button -C 5 | grep https | sed 's/^[^"]*"//' | sed 's/".*//') || true
fi



echo "Image ID $image_id"
echo "Fetching URL $url"
echo "Download url: $download_url"
wget "$download_url" -O "/tmp/$image_id.jpg"

$convert_command "/tmp/$image_id.jpg" -resize 512x -resize 'x512<' -gravity center  -crop 512x512+0+0 +repage "/tmp/$image_id\_cropped.jpg"
$convert_command "/tmp/$image_id.jpg" -resize 240x -resize 'x240<' -gravity center  -crop 240x240+0+0 +repage "/tmp/$image_id\_tiny.jpg"
$convert_command "/tmp/$image_id.jpg" -resize 100x -resize 'x100<' -gravity center  -crop 100x100+0+0 +repage "/tmp/$image_id\_tinier.jpg"
jpegoptim "/tmp/$image_id\_cropped.jpg" -d "./static/images/" -s -m85
jpegoptim "/tmp/$image_id\_tiny.jpg" -d "./static/images/" -s -m75
jpegoptim "/tmp/$image_id\_tinier.jpg" -d "./static/images/" -s -m55
mv  "./static/images/$image_id\_cropped.jpg" "./static/images/$image_name.jpg"
mv  "./static/images/$image_id\_tiny.jpg" "./static/images/$image_name""_tiny.jpg"
mv  "./static/images/$image_id\_tinier.jpg" "./static/images/$image_name""_tinier.jpg"
