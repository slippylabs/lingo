#!/usr/bin/env bash

set -euo pipefail

if output=$(git status --porcelain) && [ -z "$output" ]; then
  echo "Working directory clean. Fetching course data..."
else
  echo "Working directory not clean. Please commit your changes before running this script."
  exit 1
fi

# fetch things
npm run exportCourse -- 1
npm run fetchAudios
npm run fetchPhotos


# commit changes
git add dumps/courseData.json
git add src/courses/
git add static
git commit -m "feat: update course data"
