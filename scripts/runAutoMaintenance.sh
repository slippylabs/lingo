#!/bin/bash

set -euo pipefail

npm run exportAllCourses
./scripts/updatePypiReadmeFiles.sh
