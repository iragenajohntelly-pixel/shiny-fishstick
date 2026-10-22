# Imboni | Katalogi y'icyitegererezo ya serivisi zo mu Rwanda

Imboni ni porototipi yigenga ya React, TypeScript na Vite. Igaragaza mu Kinyarwanda cyangwa Icyongereza serivisi eshanu z’icyitegererezo zabitswe muri SQLite. Iyi si katalogi yuzuye ya IremboGov, kandi Imboni ntifitanye isano na IremboGov cyangwa Leta y’u Rwanda.

## Run locally

Requirements: Node.js 22.13+ and npm. The local API uses Node's built-in SQLite support.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. In Windows PowerShell, use `npm.cmd install` and `npm.cmd run dev` if script execution policy blocks `npm`.

## Available commands

- `npm run dev` — start the local API, SQLite database, and Vite development server.
- `npm run build` — type-check the app and create a production build in `dist/`.
- `npm run preview` — serve the production build and API locally after building.
- `npm run start` — start the production server; run `npm run build` first.

## Konti z'igerageza na SQLite

Kwiyandikisha no kwinjira bikoresha SQLite ibitse kuri `data/imboni.sqlite`; imiterere n'amakuru y'icyitegererezo biri muri `database/schema.sql` kandi bitangizwa na server. Katalogi ibika ibyiciro n'amakuru ya serivisi mu ndimi ebyiri (Icyongereza n'Ikinyarwanda), amafaranga, igihe cyatanzwe nk'urugero, aho serivisi iboneka kuri IremboGov, n'uko amakuru yagenzuwe. Konti zibika amazina, imeli, ururimi rwatoranyijwe n'ijambo ry'ibanga ryabitswe nka scrypt hash. Konti yinjiyemo ibika amateka y'imirongo yafunguye gusa (ntibika ubusabe bwa serivisi). Amakuru y'igihe cyose arakomeza kubaho iyo porogaramu yongeye gutangizwa; ububiko bwa data ntibushyirwa muri Git. Shyiraho `DATABASE_PATH` kugira ngo uhitemo ahandi ububiko bwa SQLite.

Ibyo bisabwa, amafaranga n'iminsi byatanzwe mu ngero ntabwo byagenzuwe; ntibifatwe nk'amakuru yemewe. Banza ugenzure kuri IremboGov cyangwa ku rwego rubishinzwe. Koresha amazina, imeli n'amagambo y'ibanga by'igerageza gusa. Ntukinjize nomero z'indangamuntu, inyandiko z'ubusabe cyangwa andi makuru bwite. Kanda kuri IremboGov kugira ngo usabe serivisi; Imboni ibika gusa amateka y'imirongo ya IremboGov yafunguwe n'umukoresha winjiye, ntimenya niba ubusabe bwarangijwe cyangwa bwaratanzwe. Amakuru yo muri SQLite ntabwo abikwa mu buryo bwabugenewe bwo kurinda amakuru ari kuri disiki kandi iyi porototipi ntigenewe konti z'umusaruro. Gushyira porogaramu ku rubuga bisaba HTTPS, igenzura ry'umutekano n'iry'ibanga, gukurikirana sisitemu, backup, n'ubuyobozi bwemewe bwa database.

## Ibyo porototipi ikora

- Hindura ururimi hagati y'Ikinyarwanda n'Icyongereza; shakisha serivisi cyangwa uyungurure hakurikijwe icyiciro.
- Reba amakuru y'icyitegererezo abitswe muri SQLite. Katalogi irimo serivisi eshanu gusa zatanzwe n'uyu mushinga; ntabwo ari urutonde rwuzuye rwa IremboGov.
- Fungura IremboGov mu rundi rubuga kugira ngo ushake cyangwa usabe serivisi. Katalogi y'ubu ikoresha umurongo rusange wa IremboGov, si urubuga rwihariye rwa serivisi.
- Fungura konti y'igerageza, winjire cyangwa usohoke; konti ihitamo ishobora kureba amateka y'imirongo yafunguye. Ibyo ntibyerekana ko ubusabe bwatanzwe.

## Iby'ingenzi

Iyi ni porototipi yigenga, si urubuga rwemewe rwa IremboGov cyangwa urwego rwa Leta. Ihuza serivisi ku rubuga rwa IremboGov gusa; nta API cyangwa uburyo bwo kohereza ubusabe buhujwe na Leta. Imboni ntibika amakuru y'amafishi y'ubusabe, ntiyakira ubwishyu cyangwa inyandiko, kandi ntimenya uko dosiye zihagaze. Emeza serivisi, ibisabwa, amafaranga n'igihe n'urwego rubishinzwe.

Gushyira ku mugaragaro serivisi nyakuri bisaba uburenganzira, ubufatanye n'abatanga serivisi, amakuru yemejwe kandi ahora avugururwa, igenamigambi ry'umutekano n'iry'ibanga, gupima ko abantu bose bashobora kuyikoresha, n'ubuyobozi buhamye bwa backend.
