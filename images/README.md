# Image assets

The data file (`nigerian-currency-directory.json`) is already wired for the photos
below. Drop each file into place with the exact path shown and it will appear
automatically — on the currency's card in the catalog grid and as the hero image
on its detail page. Until a file exists, the site shows the grey placeholder
plate instead (nothing breaks).

| Photo | Save as |
|---|---|
| Bronze/copper manillas laid out on wood | `images/manillas/manilla-collection.jpg` |
| Strand of cowrie shells on fibre cord | `images/cowries/cowrie-strand.jpg` |
| Black-and-white open-air market scene | `images/trade-by-barter/market-scene.jpg` |
| Barclays Bank D.C.O. £5 note (1958) | `images/west-african-pound/1958-barclays-dco-five-pounds.jpg` |
| Bank of Biafra 10/- note, reverse | `images/biafran-pound/ten-shillings-reverse.jpg` |

JPEG, PNG and WebP all work — if you use a different extension, update the
matching `src` in the JSON. Roughly 1200 px on the long edge is plenty; card
plates crop to 4:3 (`object-fit: cover`).

To add more photos, follow `meta.image_convention` in the JSON:
save to `images/<currency-slug>/<year>-<short-label>.jpg`, then add an entry to
that currency's `images` array (`alt` and `credit` required; `change_ref: null`
for a cover image, or a `change_no` to attach it to a changelog slide).
