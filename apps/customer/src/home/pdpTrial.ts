/**
 * Trial switches for the product page (sub-phase 1k). Each one is a change the owner wanted to try and may go back on: setting a
 * switch to `false` brings back what the page did before that change, and nothing else. The code for the old behaviour stays until
 * the owner has decided, so going back is one word, not a revert.
 */
export const PDP_TRIAL = {
  /** Each card in "Other brands of {name}" shows its price per litre, kilogram or piece, in green when it is lower than this item's. */
  unitPriceOnBrands: true,
  /** Each size card says what it saves ("Save ₹2") when it has a printed price above it. */
  sizeSavings: true,
  /** The page opens with the best-value size chosen, not the size the card showed. */
  preselectBestValue: true,
  /**
   * One tinted-pill style (the View details button's tint) for "Packed today", "Also at N shops", "Best value" and View details, so
   * green means "worth a look"; the pistachio fill stays for the price badge alone.
   */
  singleGreen: true,
  /** Sold by, the brand row and the replacement row are one card with dividers, not three cards. */
  groupedRows: true,
} as const;
