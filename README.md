# LibreLingoRelive
*a community-owned language-learning platform*

LibreLingo's mission is to create a modern language-learning platform that is owned by the community of its users. All software is licensed under AGPLv3, which guarantees the freedom to run, study, share, and modify the software. Course authors can choose their license freely. 

Here there is an article of [why the original author has built LibreLingo](https://dev.to/kantord/why-i-built-librelingo-280o).

# Why LibreLingoRelive?
LibreLingo is/was an open-source language learning platform originally created by Dániel Kántor. Due to technical issues with the Svelte framework, the project became non-functional a few years ago. Greg later forked the project as LibreLingoCommunity, successfully reviving it. However, due to time constraints, this version also stopped working. In November 2025, we decided to revive LibreLingo once again. We forked the project from LibreLingoCommunity (a fork of a fork) and are now actively maintaining and improving it.

# Documentation

..coming soon
    
## Development

```
(Starting from the root of the repo)

cd src
uv sync

mkdir -p ../apps/web/src/courses/
uv run python3 -m librelingo_json_export.cli $PATH_TO_COURSE_YAML_SOURCE_DIR ../apps/web/src/courses/$CONVERTED_COURSE_NAME

# E.g. like this:
uv run python3 -m librelingo_json_export.cli ~/dev/librelingo/courses/LibreLingo-ES-from-EN ../apps/web/src/courses/converted_ES-from-en

cd ../apps/web
npm ci
npm run dev
```

## Contribution

.. coming soon

## License

LibreLingoRelive is licensed under the AGPL-3.0 license. In addition, course content and other creative content might be licensed under different licenses, such as CC. 
