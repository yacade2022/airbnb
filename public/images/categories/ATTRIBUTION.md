# Category photos

Photos for the 12 listing categories, 4 per category, stored as `<category>/01.png` to `04.png`.
They are **illustrative only** and are not photos of any real rental. Each one is the photo of a
demo listing (`lib/demoListings.json`, added with `npm run seed-demo`).

All 48 come from Wikimedia Commons: 23 CC BY-SA 4.0, 16 CC0, 7 CC BY 4.0, 2 Public domain. Licenses were read from each file's
Commons metadata (`extmetadata`: `License`, `LicenseShortName`, `LicenseUrl`, `Restrictions`).
Files with listed restrictions (such as trademark or personality rights) were rejected, and
each image was checked visually for text, signs, logos and watermarks.

## Where credit is given

No photo has a credit caption next to it. Every photo is credited on the **Image credits** page
(`/credits`), linked from the footer of every page, with its title, creator, source link and
license link.

- **CC BY 4.0 / CC BY-SA 4.0**: section 3(a)(2) of the 4.0 licenses allows the credit to be
  given "by providing a URI or hyperlink to a resource that includes the required information",
  which the footer link to `/credits` does.
- **CC0 / public domain**: no credit is required; they are listed on `/credits` as a courtesy.
- **Older licenses (CC 2.0, 2.5, 3.0) are not used.** They have no equivalent clause, so the
  photos that used them were replaced with CC0 photos instead of removing their captions.
  `lib/demoListings.test.ts` fails if a photo under any other license is added.

## Changes made

Every file was downloaded as a Commons rendition, resized to 1280px wide (aspect ratio kept,
no cropping) and re-encoded as PNG. The conversion decodes the image and writes new PNG data;
extensions were not renamed. No other edits were made. For the CC BY-SA files these PNGs are
adaptations, so they stay under CC BY-SA 4.0.

## Files

| File | Title | Creator | License | Requirement | Source page |
| --- | --- | --- | --- | --- | --- |
| `lake/01.png` | Kesusjön June 2015 05 | Arild Vågen | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Kesusj%C3%B6n_June_2015_05.jpg |
| `lake/02.png` | Lake Stevens lakefront houses | ECTran71 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Lake_Stevens_lakefront_houses.JPG |
| `lake/03.png` | Sankt Moritz Lake Piz Muragl | Isiwal | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Sankt_Moritz_Lake_Piz_Muragl.jpg |
| `lake/04.png` | Lake Mary Mammoth September 2016 | King of Hearts | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Lake_Mary_Mammoth_September_2016.jpg |
| `mountain/01.png` | Mittelberg Landscape (Unsplash) | Mike Kotsch mike | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Mittelberg_Landscape_(Unsplash).jpg |
| `mountain/02.png` | Quiet cabin in the mountains (Unsplash) | Ravi Pinisetti ravipinisetti | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Quiet_cabin_in_the_mountains_(Unsplash).jpg |
| `mountain/03.png` | Right Bank Pin Mudh Spiti Himachal Jun18 D72 7114 | This Photo was taken by Timothy A. Gonsalves. Feel free to use my photos, but please mention me as the author. I would much appreciate if you send me an email tagooty@yahoo.com or write on my talk page, for my information. Please contact me before commercial use. Please do not upload an edited image here without consulting me. I would like to make corrections only at my own source to ensure that the changes improve the image and are preserved.Otherwise you may upload an edited image with a new name. Please use one of the templates derivative or extract. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Right_Bank_Pin_Mudh_Spiti_Himachal_Jun18_D72_7114.jpg |
| `mountain/04.png` | Mountain Ridge in the Olympic village Psekhako 1 | Александр Вайнер | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Mountain_Ridge_in_the_Olympic_village_Psekhako_1.JPG |
| `urban/01.png` | Rooftops by Igor Ovsyannykov | Igor Ovsyannykov | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Rooftops_by_Igor_Ovsyannykov.jpg |
| `urban/02.png` | Kopenhagen (DK), Blick vom Runden Turm -- 2017 -- 1619 | Dietmar Rabich | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Kopenhagen_(DK),_Blick_vom_Runden_Turm_--_2017_--_1619.jpg |
| `urban/03.png` | MoMA PS1 rooftop August 2013 001 | King of Hearts | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:MoMA_PS1_rooftop_August_2013_001.jpg |
| `urban/04.png` | Brooklyn Bridge from 60 water | ThibautRe | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Brooklyn_Bridge_from_60_water.jpg |
| `beach/01.png` | Beach house at Misquamicut Beach, Rhode Island | Juliancolton | Public domain | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Beach_house_at_Misquamicut_Beach,_Rhode_Island.JPG |
| `beach/02.png` | Diamonds Thudufushi Beach and Water Villas, May 2017 -01 | Martin Falbisoner | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Diamonds_Thudufushi_Beach_and_Water_Villas,_May_2017_-01.jpg |
| `beach/03.png` | Diamonds Thudufushi Beach and Water Villas, May 2017 -09 | Martin Falbisoner | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Diamonds_Thudufushi_Beach_and_Water_Villas,_May_2017_-09.jpg |
| `beach/04.png` | White house with a small beach in Norra Grundsund 1 | W.carter | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:White_house_with_a_small_beach_in_Norra_Grundsund_1.jpg |
| `vineyard/01.png` | Ausblick auf die Südsteiermark | A,Ocram | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Ausblick_auf_die_S%C3%BCdsteiermark.jpg |
| `vineyard/02.png` | Vineyard in Slovenia 2008 | IgorMar | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Vineyard_in_Slovenia_2008.jpg |
| `vineyard/03.png` | Former windmill, Salasc 01 | Christian Ferrer | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | Credit, link, note changes | https://commons.wikimedia.org/wiki/File:Former_windmill,_Salasc_01.jpg |
| `vineyard/04.png` | Mazet in vineyards, Mèze cf02 | Christian Ferrer | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | Credit, link, note changes | https://commons.wikimedia.org/wiki/File:Mazet_in_vineyards,_M%C3%A8ze_cf02.jpg |
| `desert/01.png` | 2022-06-14 USA, AZ, Saguaro DSC 6078 DxO | Laurens R. Krol | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | Credit, link, note changes | https://commons.wikimedia.org/wiki/File:2022-06-14_USA,_AZ,_Saguaro_DSC_6078_DxO.jpg |
| `desert/02.png` | Adobe pueblo revival | Daniel Schwen | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Adobe_pueblo_revival.jpg |
| `desert/03.png` | Monument Valley Arizona | Filio | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Monument_Valley_Arizona.jpg |
| `desert/04.png` | Oljato-Monument Valley, United States (Unsplash R9S19dOFlcs) | Dawn Armfield darmfield | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Oljato-Monument_Valley,_United_States_(Unsplash_R9S19dOFlcs).jpg |
| `tropical/01.png` | Koh Mak (island), Thailand, Palm trees on the beach | Vyacheslav Argenberg | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | Credit, link, note changes | https://commons.wikimedia.org/wiki/File:Koh_Mak_(island),_Thailand,_Palm_trees_on_the_beach.jpg |
| `tropical/02.png` | Koh Mak (island), Thailand, Palms on the beach | Vyacheslav Argenberg | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | Credit, link, note changes | https://commons.wikimedia.org/wiki/File:Koh_Mak_(island),_Thailand,_Palms_on_the_beach.jpg |
| `tropical/03.png` | Island lagoon in Bacuit Bay, El Nido, Palawan, Philippines | Vyacheslav Argenberg | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | Credit, link, note changes | https://commons.wikimedia.org/wiki/File:Island_lagoon_in_Bacuit_Bay,_El_Nido,_Palawan,_Philippines.jpg |
| `tropical/04.png` | Havelock Island, Sandy lagoon, Andaman Islands | Vyacheslav Argenberg | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) | Credit, link, note changes | https://commons.wikimedia.org/wiki/File:Havelock_Island,_Sandy_lagoon,_Andaman_Islands.jpg |
| `historic/01.png` | Scotland-2016-West Lothian-Hopetoun House 02 | Godot13 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Scotland-2016-West_Lothian-Hopetoun_House_02.jpg |
| `historic/02.png` | Himeji Castle 0804 1 | Gorgo | Public domain | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Himeji_Castle_0804_1.jpg |
| `historic/03.png` | Bodiam Castle, south east corner | Poliphilo | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Bodiam_Castle,_south_east_corner.jpg |
| `historic/04.png` | Carisbrooke Castle gatehouse | DeFacto | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Carisbrooke_Castle_gatehouse.jpg |
| `forest/01.png` | Poertschach Winklern Quellweg 09122012 821 | Johann Jaritz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Poertschach_Winklern_Quellweg_09122012_821.jpg |
| `forest/02.png` | Pörtschach Winklern Gaisrückenstraße Am Kåte Streuobstwiese Dörrkasten 25122017 2170 | Johann Jaritz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:P%C3%B6rtschach_Winklern_Gaisr%C3%BCckenstra%C3%9Fe_Am_K%C3%A5te_Streuobstwiese_D%C3%B6rrkasten_25122017_2170.jpg |
| `forest/03.png` | Pörtschach Winklern Quellweg altes Bienenhaus OSO-Ansicht 30032019 6259 | Johann Jaritz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:P%C3%B6rtschach_Winklern_Quellweg_altes_Bienenhaus_OSO-Ansicht_30032019_6259.jpg |
| `forest/04.png` | Pörtschach Winklern Gaisrückenstrasse Am Kåte Streuobstwiese Dörrkasten 25082019 7043 | Johann Jaritz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:P%C3%B6rtschach_Winklern_Gaisr%C3%BCckenstrasse_Am_K%C3%A5te_Streuobstwiese_D%C3%B6rrkasten_25082019_7043.jpg |
| `farmhouse/01.png` | Ljungdalen December 2016 04 | Arild Vågen | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Ljungdalen_December_2016_04.jpg |
| `farmhouse/02.png` | Karakteristieke boerderij, Aldlansdyk in Cornjum 02 | Dominicus Johannes Bergsma | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Karakteristieke_boerderij,_Aldlansdyk_in_Cornjum_02.jpg |
| `farmhouse/03.png` | Disused historic farmhouse in rural South Australia | Hallo3800 | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Disused_historic_farmhouse_in_rural_South_Australia.jpg |
| `farmhouse/04.png` | Ol-Ers July 2014 | Arild Vågen | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Ol-Ers_July_2014.jpg |
| `ski/01.png` | Rock on the north side of Sommet Nord de Sarenne, Le Freney-d'Oisans, 2026 | DimiTalen | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Rock_on_the_north_side_of_Sommet_Nord_de_Sarenne,_Le_Freney-d%27Oisans,_2026.jpg |
| `ski/02.png` | Ski lift Derby crosses Bosses slope, Peisey-Vallandry, 2020 | DimiTalen | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Ski_lift_Derby_crosses_Bosses_slope,_Peisey-Vallandry,_2020.jpg |
| `ski/03.png` | View of the Eau d'Olle Valley from Grande Sure, Huez, 2026 | DimiTalen | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:View_of_the_Eau_d%27Olle_Valley_from_Grande_Sure,_Huez,_2026.jpg |
| `ski/04.png` | Looking down the Mandarines slope, Megève, 2025 | DimiTalen | [CC0](http://creativecommons.org/publicdomain/zero/1.0/deed.en) | None (credit given as a courtesy) | https://commons.wikimedia.org/wiki/File:Looking_down_the_Mandarines_slope,_Meg%C3%A8ve,_2025.jpg |
| `island/01.png` | Aerial image of the Fraueninsel | Carsten Steger | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Aerial_image_of_the_Fraueninsel.jpg |
| `island/02.png` | Aerial image of Alicudi (view from the south) | Carsten Steger | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Aerial_image_of_Alicudi_(view_from_the_south).jpg |
| `island/03.png` | Aerial image of Filicudi (view from the south) | Carsten Steger | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Aerial_image_of_Filicudi_(view_from_the_south).jpg |
| `island/04.png` | Aerial image of Salina (view from the southwest) | Carsten Steger | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) | Credit, link, note changes; adaptations stay CC BY-SA 4.0 | https://commons.wikimedia.org/wiki/File:Aerial_image_of_Salina_(view_from_the_southwest).jpg |
