# Helder

Een lokale, offline foto-opruimer. Swipe je bibliotheek slank, laat vergeten
herinneringen weer boven komen, en houd zelf de regie — er gaat niets van dit
toestel af.

Werktitel: `Helder`. Naam en merk staan nog niet vast.

## Waarom

Geïnspireerd op [Picnic](https://www.picnic.photos/), maar dan met een
belofte die ook echt gehouden wordt: geen account, geen upload, geen cookies,
geen tracking van welke soort dan ook. Alles draait client-side; je kan het
netwerktabblad van je browser openen tijdens gebruik om dat te controleren.

## Features (MVP)

- **Bibliotheek** — je foto's, lokaal opgeslagen (IndexedDB), gegroepeerd per maand.
- **Sorteren** — Tinder-achtige swipe: rechts bewaren, links archiveren. Ook met pijltjestoetsen.
- **Opschonen** — automatische suggesties voor bijna-duplicaten (perceptual hash) en wazige foto's (Laplaciaanse variantie), jij beslist.
- **Herinneringen** — "op deze dag" en foto's die je een tijd niet bekeken hebt.
- **Albums** — handmatig groeperen.
- **Instellingen & privacy** — opslaggebruik, archiefbeheer, en de privacy-belofte zwart op wit.

Alle detectie (duplicaten, wazigheid, EXIF-datum, thumbnails) gebeurt on-device
met canvas/EXIF-parsing — geen cloud-ML, geen externe API's.

## Ontwikkelen

```bash
npm install
npm run dev      # dev server
npm run lint      # oxlint
npx tsc -b        # typecheck
npx vitest run    # unit tests
npm run build     # productiebuild + PWA service worker
```

## Deployen

`.github/workflows/deploy.yml` bouwt en publiceert naar GitHub Pages bij elke
push. **Eenmalige setup**: zet in de repository-instellingen `Settings → Pages
→ Source` op **GitHub Actions** — zonder die stap faalt de deploy-stap met een
404, dat kan alleen een repo-eigenaar instellen.

## Platform

Dit is een PWA (installeerbaar op telefoon/desktop, werkt offline via een
service worker) — geen native iOS/Android app. Zie de sessie-notities voor de
afweging: bouwen, testen én automatisch deployen kon zo zonder Xcode of een
Apple Developer account.
