# Silesian: plausible but NOT fixed (unsure), plus course-wide issues

## Course-wide (affects all 16 Slavic template courses: checked polish/kashubian/czech/russian too)
- EVERY mini-dictionary gloss is the literal string `undefined` (4298 of 4303 entries here; same in
  the siblings). The exporter merges them into hints, so learners see "undefined" as a hint meaning
  (index.json dict: "jo": ["I","undefined"]; challenge chips: "definition": "brat\nundefined").
  Best fixed once in code (drop `undefined` definitions in fetch_courses.py or the loader), not per course.
- The intro .md notes are machine-made: Interslavic leftovers, a different spelling system, wrong
  grammar claims. I fixed the clear errors and aligned spellings/number words with the lessons, but
  they would be better replaced by our own notes (as for Dutch/French).
- course.yaml `Repository:` points at LibreLingo-Isv-from-EN (template placeholder). Left alone.

## Unsure word meanings (left as is)
- srogi taught as "strong": in Silesian srogi mostly means big/huge. Used in ~6 phrases.
- szolka taught as "glass" in drinks (and "cup" in kitchen): szolka is a cup/mug.
- lica = "face": lica are cheeks; "Lica som podobne" = "The face is similar" (plural/singular mismatch).
- widly = "fork": widły is a pitchfork in Polish; Silesian table fork is usually gabel.
- kupec = "customer": kupiec usually means merchant/buyer-trader.
- tyn taught as "that" while ta/to are "this" (tyn is this/that).
- snoc = "maybe/can", dej = "let's go" (dej = give), "Co to mianuje?" = "What does this mean?"
  (mianuje = names; Co to znaczy?), jeiś (je) = to eat, rajzrkōło = bicycle (rad/kolo?).
- t-šyrt (š is not Silesian; correct spelling unclear), łóżko/mój/ksiónżka use ó while the course
  otherwise writes ō; som vs Ślabikorz sōm.
- "Ôn złe jymu godo robić" (angrily = źle?), "Zawiśnie ôn glōndo na jymu" (na niego?),
  "Dźwiyrze wiedzōm do kuchnie" (wiedzōm = they know; lead = wiedōm/prowadzōm),
  "Rzyka cine bez dolina" (cine?), "Juter je za fest" = "Tomorrow is too late",
  "Tym kierzy leżōm spać spokojnego sny", "Ôn dowo sobie pokōj" = "He stops troubling others",
  "Wieczorym my szli we restauracyjo" (do restauracyje?), "Szofer wiedzie autobus".
- Ordinals "dwanaściyj"/"jedynaściyj" (twelfth/eleventh), "dwasetny" (two hundredth).
- Locative after we: "We jesiyń", "We wiosna", "We środa" (nominative where locative expected).
- -naście: I aligned 13-19 with jedenaście/dwanaście (the course's own forms); Silesian may prefer -noście.
