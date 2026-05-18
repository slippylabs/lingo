#!/bin/bash

set -euo pipefail

rootdir="$(cd "$(dirname "$0")/../.." && pwd)"

echo "⏳ Fetching audios for all YAML courses..."

cd "$rootdir" || {
    echo "⚠️ Wrong folder structure"
    exit 1
}

# Get all courses from the courses directory
for course_dir in courses/*/; do
    if [ -f "$course_dir/course.yaml" ]; then
        course_name=$(basename "$course_dir")
        echo "Processing course: $course_name"
        "$rootdir/scripts/updateAudioForYamlCourse.sh" "$course_name"
    fi
done

echo "✅ Finished fetching audios"
