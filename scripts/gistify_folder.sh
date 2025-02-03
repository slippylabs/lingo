#!/bin/bash

set -euo pipefail

cd /LibreLingo/app/ ||
{
  echo -en "\r⚠️  Wrong folder structure"
  exit 1
}
if pdm run python librelingo_gistify_folders/cli.py /LibreLingo/librelingo-web/src/courses/$1 /LibreLingo/librelingo-web/src/courses/"$1"_gistified; then
    echo -en "\r✅ course $1 gistyfied."
else
    echo -en "\r⚠️  Could not extract course $1"
fi
echo
