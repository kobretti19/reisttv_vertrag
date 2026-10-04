# Miet- und Servicevertrag – дигитален формулар (дизајн)

Датум: 2026-10-04
Извор: `D:\NextJS\Reist_TV\scan.pdf` (хартиен договор на Radio TV Reist), лого `D:\NextJS\Reist_TV\reist_logo.png`

## Цел

Хартиениот договор „Miet- und Servicevertrag“ да се пополнува на компјутер и да се печати со едно копче. Изгледот треба да е што поблиску до оригиналот. Обем: околу еден договор месечно, еден корисник.

## Што НЕ е дел од оваа верзија

- Нема база, нема најава, нема листа на стари договори. Архива = испечатени или зачувани PDF-ови.
- Нема посебна фактура („Rechnung“). Може подоцна.
- Нема сервер. Апликацијата е целосно статична.

## Технологија и хостинг

- Next.js (App Router, TypeScript), `output: 'export'`, па се гради само статичен HTML/JS.
- Стилови: Tailwind CSS.
- Хостинг: Cloudflare Pages, бесплатен план (дозволена комерцијална употреба). Кодот е на GitHub, а Cloudflare гради при секој push. Build командата е `npm run build`, а излезната папка `out`.
- Тестови: Vitest за функциите за пресметка.

## Јазик и формати

- Целиот интерфејс и печатениот документ се на германски, со текстовите од оригиналот.
- Износи во швајцарски формат: `Fr. 1'250.–` за цели франци, `Fr. 1'250.50` за износи со рапен.
- Датуми: `dd.mm.yyyy`.

## Изглед на страницата

Една страница (`/`) со два A4 „листа“ еден под друг, како хартијата. Над нив е лента со копчињата **Drucken** и **Neu**, која не се печати.

### Лист 1

1. **Заглавие**: логото (`public/reist_logo.png`) лево. Десно текстот за услуги, преземен од оригиналот:
   - Vermietung von Lautsprecheranlagen
   - Video-Überwachung-Satellitenanlagen (Camping)
   - Reparatur: TV + Audiogeräte-PC Support
   - Verkauf Reparatur und Installation aller Audio + TV Marken
2. Наслов **Miet- und Servicevertrag** и блокот **An** (Name, Adresse, Wohnort).
3. **Податоци за закупецот**: Name, Vorname, Strasse, Wohnort, Telefon P, Telefon G.
4. **Табела со опрема**, колони: Mietgegenstand | Marke | Modell | Preis | Anzahl | Mietpreis.
   - Редовите се фиксни, од `equipment.ts` (види подолу). Се внесува **Anzahl**. **Preis** е однапред пополнет, но може да се смени по ред.
   - Mietpreis = Preis × Anzahl. Ако Anzahl е празно или 0, Mietpreis останува празно.
   - Еден празен ред (Mietgegenstand, Marke, Modell, Preis, Anzahl се слободни) за опрема што ја нема на списокот, како празниот ред на хартијата.
5. **Услуги без фиксна цена**, каде се внесува само износ во Mietpreis:
   - Bedienung der LS-Anlage
   - Arbeit: Installation, inkl. Fahrt
   - Montage
   - Demontage
6. **Total** = збир од сите Mietpreis.
7. Текст: „Es würde uns freuen, Ihnen mit unseren modernsten Anlagen die Beschallung zu verbessern. Falls Sie sich für unsere Offerte entschliessen können, erwarten wir die Rücksendung des Vertrages.“
8. **Подножје**: Datum | Der Mieter: (линија за потпис) | Der Vermieter: Radio TV Reist, Unterschrift. Ред „Quittung Miete vom … bis …“ со два датума.

### Лист 2: членови

Членовите остануваат нумерирани како на хартијата (Art. 2–14, 16, 17), со наслов десно (Vorgesehener Gebrauch, Mietdauer итн.). Текстот се копира збор по збор од скенот, со поправени очигледни печатни грешки („Vetrag“ → „Vertrag“, „Mietgegestände“ → „Mietgegenstände“).

Полиња за внесување:

| Член | Поле | Почетна вредност |
|------|------|------------------|
| Art. 2 | Die Mietgegenstände … (vorgesehener Gebrauch) | празно |
| Art. 3 | Mietdauer vom … bis … | празно (датуми) |
| Art. 4 | Mietzins Fr. … | = Total од лист 1, додека корисникот не го смени рачно |
| Art. 5 | Transportkosten Fr. … | празно |
| Art. 7 | Kaution Fr. … | = Mietzins / 3, заокружено на 0.05 Fr., додека корисникот не ја смени рачно |
| Art. 17 | Besondere Abmachungen | повеќелиниски текст (4 линии) |

Рачно сменетите вредности во Art. 4 и Art. 7 повеќе не се менуваат автоматски. Мало копче „↺“ до полето ги враќа на автоматска пресметка (не се печати).

## Список на опрема (`equipment.ts`)

| Mietgegenstand | Marke | Modell | Preis |
|---|---|---|---|
| Verstärker | Philips | LBB 1143 | 80 |
| | Sony | Mini-Disc inkl. LS | 150 |
| | Dynacord | Disco inkl. LS | 250 |
| Lautsprecher | TOA | Trichter LS | 45 |
| | El. Voice | Musicaster | 45 |
| | Jamo | Pro 200ex | 45 |
| | El. Voice | 100S | 45 |
| Funkanlage | TOA | WT 02 | 150 |
| | ANCOR | Explorer | 100 |
| Tonsystem | Lindaco | 2519 | 50 |
| | Schauf | DS - 50 | 70 |
| Mikrophon | Sennheiser | Profi Power | 35 |
| | Sennheiser | MD 442 | 35 |
| Mischpult | Grauer + Müller | PH 15 B | 45 |
| | Roclab | MPX 7801 | 45 |
| Tonband | Kenwood | | 20 |
| CD-Player | Philips | | 25 |
| Stativ | | | 10 |
| Autobeschallung | Fiat Panda | | 250 |
| | Toyota Bus | | 250 |

Списокот е во еден фајл, за цените и уредите лесно да се менуваат подоцна.

## Структура на кодот

- `src/data/equipment.ts`: списокот погоре и фиксните текстови (услуги, членови).
- `src/lib/calc.ts`: чисти функции `rowPrice`, `total`, `kaution` (заокружување на 0.05), `formatChf`. Сите пресметки се во рапени (цели броеви), за да нема грешки со децимали.
- `src/lib/storage.ts`: читање и зачувување на нацрт во `localStorage` (клуч `reist-vertrag-draft`). Ако читањето не успее, тивко се почнува од празен формулар.
- `src/components/`: `Page1`, `Page2`, `EquipmentTable`, `CustomerFields`, `Toolbar`, и `PrintField` (input што на печатење изгледа како обичен текст на линија).
- `src/app/page.tsx`: држи ја состојбата на формуларот (еден објект), ја зачувува во localStorage при секоја промена и ја дава на листовите.

## Печатење

- **Drucken** повикува `window.print()`.
- Print CSS: `@page { size: A4; margin: 12mm }`. Лист 2 почнува на нова страница (`break-before: page`). Лентата со копчиња, рамките на полињата и копчињата „↺“ се кријат.
- Празните полиња се печатат како празни линии, како на хартијата, за да може да се дополнат со пенкало.
- Целта е секој лист да собере на една A4 страница. Ова се проверува со печатење во Chrome и Edge.

## Копче „Neu“

Пред бришење прашува со дијалог во самата страница: „Alle Eingaben löschen?“ со Ja / Abbrechen. Потоа го брише нацртот од localStorage и го враќа формуларот на почетни вредности.

## Тестирање

- Vitest: `rowPrice`, `total`, заокружување на `kaution` (на пр. 100 → 33.35, 250 → 83.35), `formatChf` (1250 → `1'250.–`, 1250.5 → `1'250.50`).
- Рачно: пополнување, затворање и отворање на табот (нацртот останува), печатење во PDF во Chrome (точно 2 страници).
