#!/bin/bash

set -euo pipefail

rootdir="$(cd "$(dirname "$0")/.." && pwd)"

echo -en "⏳ Updating audio for course $1"
cd "$rootdir" ||
{
  echo -en "\r⚠️  Wrong folder structure"
  exit 1
}
if PYTHONPATH=src python3 src/librelingo_audios/cli.py "$rootdir/courses/$1" "$rootdir/apps/web/static/voice" "$1" "${@:2}"; then
    echo -en "\r✅ Updated audio for course $1"
else
    echo -en "\r⚠️  Couldn't update audio for course $1"
fi
echo
