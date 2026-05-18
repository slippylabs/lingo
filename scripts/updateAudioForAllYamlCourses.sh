#!/bin/bash

set -euo pipefail

rootdir="$(cd "$(dirname "$0")/.." && pwd)"

for d in "$rootdir"/courses/*/ ; do
    course_dir="$(basename "$d")"
    "$rootdir/scripts/updateAudioForYamlCourse.sh" "$course_dir" "$@"
done
