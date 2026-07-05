# Helder (iOS)

Native SwiftUI versie van Helder: dezelfde belofte als de PWA (`../../src`),
maar dan als echte iOS-app die met je systeem-Fotobibliotheek werkt via
PhotoKit — geen kopie van je foto's, geen upload, geen account.

## Belangrijk: dit is ongeteste code

Deze Swift/SwiftUI-code is geschreven in een cloud-omgeving zonder macOS/Xcode
— hij is dus **nooit gecompileerd of gedraaid**. Wat wél gecontroleerd is:

- Het `.xcodeproj`-bestand zelf is gevalideerd met de `xcodeproj` Ruby-gem
  (dezelfde bibliotheek die CocoaPods/Fastlane gebruiken) — het opent
  correct, alle 18 Swift-bestanden en de asset catalog zijn juist gekoppeld
  aan het target, met het juiste bundle-ID, deployment target (iOS 17) en
  Swift-versie (5.0).
- Alle Swift-bestanden zijn gecontroleerd op gebalanceerde `{}`/`()`.
- De kernlogica (gebeurtenis-clustering, perceptual hash, blur-detectie) is
  1:1 overgenomen uit de web-versie, waar dezelfde algoritmes wél 26 keer
  getest zijn met vitest.

Wat **niet** geverifieerd is: of de Swift-code daadwerkelijk compileert. Xcode
zal bij de eerste build waarschijnlijk een paar kleine dingen aanwijzen
(API-naam, type-mismatch) — dat hoort bij ongecompileerde code, geen reden tot
paniek.

## Openen en bouwen

1. Open `Helder.xcodeproj` in Xcode (15/16, iOS 17 SDK of nieuwer).
2. Ga naar het target "Helder" → **Signing & Capabilities** → kies je eigen
   Apple ID/team bij "Team" (Automatic signing staat al aan). Een gratis
   Apple ID volstaat om op je eigen fysieke iPhone te installeren (geen
   betaald Developer Program nodig) — de app verloopt dan na ongeveer 7 dagen
   en moet opnieuw gebouwd worden, wat met een gratis account de normale gang
   van zaken is.
3. Sluit je iPhone aan (of kies 'm als run-destination via Wi-Fi als die al
   eerder gekoppeld is), en druk op ▶️ (Run).
4. Bij eerste start vraagt de app toegang tot je Foto's — dat is de enige
   toestemming die nodig is; verder gebeurt alles lokaal.

## Architectuur

- **SwiftData** voor lokale opslag van foto-metadata (datum, GPS, hash,
  scherpte, status, favoriet, album-koppelingen) — nooit de foto's zelf.
- **PhotoKit** (`PHPhotoLibrary`, `PHAsset`, `PHImageManager`) voor toegang
  tot en weergave van de echte systeembibliotheek. "Definitief verwijderen"
  gebruikt `PHAssetChangeRequest.deleteAssets` — iOS toont daar sowieso zijn
  eigen bevestiging bij, dat kan een app niet omzeilen.
- Geen test-target: bewust weggelaten om het risico op een corrupt
  `.xcodeproj` te beperken, aangezien een tweede target de hand-geschreven
  projectstructuur aanzienlijk complexer maakt.
