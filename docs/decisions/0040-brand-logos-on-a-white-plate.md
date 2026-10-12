# 0040. Brand logos on a white plate, drawn at one visual weight

- **Status:** Accepted (Phase 1)
- **Date:** 2026-10-12
- **Source:** the owner supplied the brands' official logo files and asked for them wherever a brand is shown, uniform in size and premium

## Context

ADR 0036 showed a brand as a letter (a monogram) and said no logos would be used until the owner had checked the trademark question. The
owner has now supplied official marks and asked for them to be used. Later the same day Fortune's mark was added, Katraj was removed
from the sample catalogue, and the owner said more trusted brands would follow with their images.

## Decision

1. **The twenty-one supplied marks are used** wherever a brand is shown as a tile or a mark: Shop by brand on Home, "Brands in this category" on
   the product page, brands in search results, the brand page's card and the product page's brand row. The names in chips and under tiles
   are unchanged.
   - Amul, Britannia, Aashirvaad, KitKat, Lay's and Parle came as SVG; India Gate, Gokul, Chitale and Fortune as pictures. The Dairy Milk tile uses
     the Cadbury wordmark that was supplied, white on the brand's purple, because the file is white and would not show on a white tile.
2. **Each is a trimmed PNG** in `apps/customer/assets/brands`, drawn about four times the size it shows at, so a phone does not parse
   drawings at runtime and the JavaScript bundle does not grow. The SVGs were not shipped.
3. **A logo always sits on a white plate**, in both themes (`logoPlate` in the palette), because logos are made for white. The plate has
   the app's usual hairline border and rounding.
4. **Every logo has one visual weight** (`fitLogo`): each gets the same area inside the plate, limited by the plate's width or height, so
   a wide wordmark (Amul) and a tall one (India Gate) look equally big, and nothing touches the edge.
5. **A brand with no logo yet keeps its letter** on the same plate, so adding a brand never leaves a gap. Ten popular Maharashtra and
   national brands were added the same day (Mother Dairy, Warana, Gowardhan, Pillsbury, Daawat, Kohinoor, Saffola, Sunfeast,
   Haldiram's, Bingo; Dhara was added and then removed at the owner's word) and each then received its mark. Today every brand in the
   catalogue has its own logo.

## Consequences

- A brand's logo can be changed by replacing its PNG and the two numbers beside it in `ui/BrandMark.tsx`.
- Some supplied pictures are small (Gokul 154 px, Fortune 200 px, Gowardhan 120 px, Saffola 187 px, Bingo 128 px wide), so they are a little
  soft on 3x screens. Larger originals would sharpen them.
- Using each company's mark is the owner's decision (they supplied the files); before a public release, confirm each brand's permission
  to show its mark beside its products. Nothing implies an endorsement: the marks only name the product's maker.
- The loading skeleton for brand tiles is unchanged: it draws the same plate without a picture.
