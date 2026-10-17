#!/bin/sh
# Deploys lingo.slippylabs.com from a commit (default HEAD), never from the working tree.
#   deploy/deploy.sh [rev]
# The courses and the Piper audio are NOT in git (third-party content, regenerable):
# they come from this checkout's courses/ and apps/web/static/voice/, filled by
#   .venv/bin/python scripts/slip/fetch_courses.py && .venv/bin/python scripts/slip/make_audio.py
set -eu
REV=${1:-HEAD}
REPO=$(cd "$(dirname "$0")/.." && pwd)
SHA=$(git -C "$REPO" rev-parse --short "$REV")
TAG=$(git -C "$REPO" describe --tags --always "$REV")
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git -C "$REPO" archive "$REV" | tar -x -C "$TMP"
git -C "$REPO" lfs ls-files -n >/dev/null 2>&1 || { echo "git-lfs missing"; exit 1; }
# git archive writes LFS pointers, not the images: copy the real files over.
cp -a "$REPO/apps/web/static/images/." "$TMP/apps/web/static/images/"

for c in "$REPO"/courses/*/; do
  n=$(basename "$c"); case "$n" in test-*) continue;; esac
  cp -a "$c" "$TMP/courses/$n"
done
mkdir -p "$TMP/apps/web/static/voice"
cp -a "$REPO/apps/web/static/voice/." "$TMP/apps/web/static/voice/"
rm -rf "$TMP/courses"/test-*

( cd "$TMP" && npm ci --no-audit --no-fund >/dev/null )
( cd "$TMP/apps/web" && PYTHON_BIN="$REPO/.venv/bin/python" npm run build >/dev/null )
BUILD="$TMP/apps/web/build"
test -f "$BUILD/index.html" || { echo "build produced no index.html"; exit 1; }
echo "$TAG ($SHA)" > "$BUILD/REVISION"
# gzip_static siblings for the text assets (nginx serves them when present).
find "$BUILD" -type f \( -name '*.html' -o -name '*.js' -o -name '*.css' -o -name '*.json' -o -name '*.svg' \) -size +1k -exec gzip -9 -k -f {} \;

# No rsync on this box: stage beside the target and swap with two renames.
WWW=/var/www/lingo.slippylabs.com
sudo rm -rf "$WWW.new" "$WWW.old"
sudo cp -a "$BUILD" "$WWW.new"
sudo chown -R root:root "$WWW.new"
sudo find "$WWW.new" -type d -exec chmod 755 {} + -o -type f -exec chmod 644 {} +
if [ -e "$WWW" ]; then sudo mv "$WWW" "$WWW.old"; fi
sudo mv "$WWW.new" "$WWW"
sudo rm -rf "$WWW.old"
echo "deployed $TAG ($SHA)"
