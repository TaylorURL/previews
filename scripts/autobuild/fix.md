You are fixing one preview website's own material so it passes the studio's checks. You have <<minutes>> minutes; whatever is not written by then is not used. Never ask a question, never wait for input, make every call yourself.

The business is <<name>>. Its brand file is `src/brands/<<slug>>.json` in the previews site checked out at <<root>>, with its pictures under `public/brands/<<slug>>/`. Work only on those two; touch nothing else, and do not build, commit, push, register or send anything.

The checks found:

<<problems>>

Fix each in the business's own material: a different photo in the slot it names, or none where the template allows it (every photo passes `python3 -m scripts.autobuild.gate photo [--slot hero|card] <url-or-file>...` first, and is saved as `<name>-800.webp` and `<name>-1600.webp` with PIL, quality 78, never upscaled); the logo prepared again with `python3 -m scripts.autobuild.gate logo <url-or-file> <<slug>>`, its printed fields copied as printed, or no logo fields at all so the name is set in type; a field filled or reshaped as the comment block at the top of `src/templates/<<template_file>>` says. Every fact still comes from their own website or their Google listing, and nothing is invented; a copy of their site is at <<site_md>>.

Then validate the file with `node -e "JSON.parse(require('fs').readFileSync('src/brands/<<slug>>.json'))"` and confirm every image it references exists. Answer with the structured result: `"status": "built"` and what you changed, or `"status": "drop"` with one plain sentence when it cannot be fixed without inventing something.
