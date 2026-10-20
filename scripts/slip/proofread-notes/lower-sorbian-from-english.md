# lower-sorbian-from-english: not fixed (unsure, systemic, or too big to patch)

## SYSTEMIC (parent decision) — affects 15 of the 16 Slavic courses
- **Every mini-dictionary gloss is the literal string `undefined`** (4307/4312 entries here; same in all
  Slavic courses except Ukrainian). The exporter passes it through, so learners' word hints read
  "undefined" (e.g. cat -> "kócka\nundefined"; 53 of 119 challenges in the dative skill). Fix belongs in code
  (drop `undefined` values in fetch_courses or the exporter / hint renderer), not in per-entry fixes.
- The course reads as machine-translated from the Polish/Interslavic template: many words are Polish/Czech/
  Upper-Sorbian look-alikes. Only clear-cut errors were fixed; the rest needs a native speaker.
- The 19 intro .md notes contradict the lessons in many places (numbers, future tense, examples using words
  the course never teaches: nanś, zegark, wcora, škola, šoł, zrobili, rodarjam, bez...). I fixed only claims
  that contradict the course itself. Strong recommendation: replace them with our own notes like Dutch/French.

## Probably wrong, high confidence but not certain (recommend fixing with a reference dictionary)
- Weekdays: standard LS is pónjeźele, wałtora, srjoda, stwórtk, pětk, sobota, njeźela. Course has
  póńźele, wałpš, styrstwjertk, pěśtwjertk (weekdaysmonths.yaml + inflected forms in phrases).
- Numbers: standard LS is styri (4), wósym (8), źaseś (10), dwaźasća (20) ... Course yaml has styrjo,
  wosym, źaset, dwójcasć, tśójcasć, styrjźasć (the course's own numbers .md even gives styri/wósym/źaseś,
  but different 20-90 forms again). Not patched because every derived form (wosymnasć, wosymsćo, wosymy...) would need changing.
- 3sg future of byś is probably buźo, not buźe (seasons yaml + my .md fix keeps the yaml's buźe for consistency).
- "Very" = wjelgin: fixed where it was 'wjele' in to-be lesson + emotions; other 'wjele' uses mean 'much/a lot' and were left.
- Tomorrow is probably witśe (course: zajtša, which means 'morning'); yesterday probably cora (course: cera).
- "How much" is kak wjele (course: gaž wjele; gaž = when/if).
- "right" (direction) is napšawo; course uses rědne = 'beautiful' (askingfordirections, cardinalpoints).
- "fast" is malsny/malsnje; course uses snadny/snadnje (snadny ~ 'easy/small') in ~6 phrases.
- maś instrumental is probably maśerju (course: maśoju).
- Negative nje + verb is written as one word in Sorbian (njewěm, njerozmějom, njesłyšo); the course
  writes it separately throughout (~25 phrases). Left as is (systemic).
- 'źiwe' for 'lives' (family, nationalities) is not LS (bydli).
- 'zdrow'/'Zdrow!' as 'hello': å was certainly wrong, but the greeting itself is doubtful (Dobry źeń is the normal hello).
- 'Dobro ranjo!' for good morning: LS says Dobre zajtšo.
- 'Kak se gronjo?' means 'what is it called', not 'what is your name' (Kak se mjenujoš?).
- 'Což to wóznamjenja?' -> probably 'Co to wóznamjenijo?' ; 'Daj!' means 'give!', not 'let's go'.
- 'mroczne' (cloudy): 'cz' is not Sorbian spelling; correct word unknown to me.
- 'prázdniny' (á is Czech) in weekdaysmonths; LS word unsure.
- Mixed spellings inside the course: góźina/goźina (hour), kafa/kafi, kupc/Kupec, mjadwjeź/mjedwjedź,
  měsće/městśe, univerzum/uniwersumje, šedli/šeźeli, luściś/lušćijo, wjasoły/wjaseły. Which is right needs a dictionary.
- 'Wón jo wušej wusoki a sylny njež wón' (English 'than he is'), 'Wjasołe jomu se napołniło wutšoba',
  'To jo z domom z familiju', 'Woblac jo cyšća a jano južo běłe' (English mentions underwear), 'Měgo wón nje ma',
  'To waš kafa abo jen?' (English 'or her'), 'Wałpš jo z źeń sporta', 'Kak ty był by słysał...' : garbled, need rewriting.
- 'dwě žoni' probably dwě žonje; 'psu' (gen. pl. of pjas) probably psow; 'Brata how nje ma' vs bratš.
- 'staršy' for 'parent' (probably starjejšy); 'mjase' and 'mjelny' for 'kind': unknown words.
- 'wrota' = gate, used for doors (door is źurja). 'cokel' is 'glass' in drinks and 'cup' in kitchen.
- 'sna' for dream (nominative is son/sen).
