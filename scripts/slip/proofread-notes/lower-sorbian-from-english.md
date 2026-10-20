# lower-sorbian-from-english: not fixed (unsure, systemic, or too big to patch)

Checked against the Sorbian Institute's German–Lower Sorbian dictionary (dolnoserbski.de/dnw) and Starosta 1999
(dolnoserbski.de/ndw). Everything those settled is now in course_fixes.json (2026-10-19). What is left:

- **Comparatives** (physical-appearance skill): the course builds them as *wušej X njež* ("Wón jo wušej wusoki a sylny
  njež wón"), which is not Lower Sorbian. The DNW gives a comparative form plus *ako / nježli / kaž* ("Wóna jo wětša ako
  wón"). Fixing it means the right comparative of each adjective (wušy? sylnjejšy? mudrjejšy? zelenjejšy?) in ~8
  phrases; I only fixed the circular English ("than he is" -> "than him"). Native check: the comparative forms.
- **Conditional skill** is garbled throughout ("Kak ty był by słysał, to wóni byli by śiche", "... byli by jim
  pomagali"). It needs rewriting with the real conditional (*by* + l-participle, *gaby*), not patching.
- "Tym, kenž lažyju spaś, měrny sna." is garbled (the noun is *seń*, gen. *sni*, and the verb does not fit). The Word is
  now *seń*; the sentence needs a native rewrite.
- **"want"**: the course uses *kśěś* (*kśě*, *kśěš*, *kśěmy*, "nje kśě"). The DNW uses *coś* (*co*, *coš*, negative
  *njoco*). Swapping the verb touches many phrases and their negatives; not done.
- "Wóni lušćijo sport" = "They love sport": *lušćiś* is in neither dictionary (love = *lubowaś*). Unknown word.
- *woblac* for "clothes": the DNW has *woblak* m (a garment; *spódny woblak* = underwear) and *drastwa* / *woblekanje*
  for clothing. Which one the course should teach needs a native call.
- Noun forms after compound numbers ("tysac a jaden zegerow", "sto a dwa słyńcy", "styri a dwaźasća wěcy"): the numbers
  are now the standard forms, but the noun case after a compound ending in 1-4 is unverified.
- "Kak wjele jo casa?" for "What time is it?" is literal ("how much time is there"); the idiomatic question is unverified.

## Noticed while fixing (not in the first proofread)
- *ranim* / *wjacorim* ("in the morning / evening"): the DNW gives *zajtša* and *wjacor* ("źinsa wjacor").
- *źinsaj* (today) is *źinsa* in the DNW.
- "Powětš jo cyšći" (the air is clean): clean = *cysty* (DNW sauber).
- "Sněg ležy na zemji": the course elsewhere uses *lažy*.
