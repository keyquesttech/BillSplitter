export function parseAmount(val) {
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

export function packsOf(extra) {
  const n = parseInt(extra?.packs, 10);
  return isNaN(n) || n < 1 ? 1 : n;
}

// An extra's price field is the price per pack; the charged amount is packs × price.
export function extraTotal(extra) {
  return packsOf(extra) * parseAmount(extra?.price);
}

export function sumExtras(extras) {
  return (extras || []).reduce((sum, e) => sum + extraTotal(e), 0);
}

// The split percent is flatmate 1 (matias)'s share of all shared costs;
// flatmate 2 (reka) pays the remainder. Invalid input falls back to 50/50.
export function clampSplitPercent(value) {
  const n = parseFloat(value);
  if (isNaN(n)) return 50;
  return Math.round(Math.min(100, Math.max(0, n)) * 100) / 100;
}

// A discount is { thing, type: 'amount'|'percent', value }. Percent discounts
// apply to that person's pre-discount total (bills share + extras share).
export function discountAmount(discount, base) {
  const v = parseAmount(discount?.value);
  return discount?.type === 'percent' ? (base * v) / 100 : v;
}

export function sumDiscounts(discounts, base) {
  return (discounts || []).reduce((sum, d) => sum + discountAmount(d, base), 0);
}

export function calculateInvoice(data) {
  const splitPercent = clampSplitPercent(data.splitPercent ?? 50);
  const p = splitPercent / 100;

  const billsTotal = (data.bills || []).reduce((sum, b) => sum + parseAmount(b.amount), 0);
  const matiasBillsShare = billsTotal * p;
  const rekaBillsShare = billsTotal * (1 - p);

  const matiasRegular = sumExtras(data.matiasExtras);
  const rekaRegular = sumExtras(data.rekaExtras);
  const matiasFullPrice = sumExtras(data.matiasFullPriceExtras);
  const rekaFullPrice = sumExtras(data.rekaFullPriceExtras);

  const regularTotal = matiasRegular + rekaRegular;
  const matiasShareExtras = regularTotal * p + rekaFullPrice;
  const rekaShareExtras = regularTotal * (1 - p) + matiasFullPrice;

  const matiasBeforeDiscounts = matiasBillsShare + matiasShareExtras;
  const rekaBeforeDiscounts = rekaBillsShare + rekaShareExtras;

  const matiasDiscountTotal = sumDiscounts(data.matiasDiscounts, matiasBeforeDiscounts);
  const rekaDiscountTotal = sumDiscounts(data.rekaDiscounts, rekaBeforeDiscounts);

  const matiasTotalDue = matiasBeforeDiscounts - matiasDiscountTotal;
  const rekaTotalDue = rekaBeforeDiscounts - rekaDiscountTotal;

  return {
    splitPercent,
    billsTotal,
    billsTotalEach: billsTotal / 2,
    matiasBillsShare,
    rekaBillsShare,
    matiasRegular,
    rekaRegular,
    matiasFullPrice,
    rekaFullPrice,
    matiasShareExtras,
    rekaShareExtras,
    matiasBeforeDiscounts,
    rekaBeforeDiscounts,
    matiasDiscountTotal,
    rekaDiscountTotal,
    matiasTotalDue,
    rekaTotalDue,
    netTotal: matiasTotalDue + rekaTotalDue
  };
}

export function getInvoiceExtrasSection(personKey, data) {
  const otherKey = personKey === 'matias' ? 'reka' : 'matias';
  const regular = data[`${personKey}Extras`] || [];
  const fromOtherFullPrice = (data[`${otherKey}FullPriceExtras`] || []).map((e) => ({
    ...e,
    fullPriceFrom: otherKey
  }));

  const items = [...regular, ...fromOtherFullPrice];
  const regularTotal = sumExtras(regular);
  const fullPriceTotal = sumExtras(fromOtherFullPrice);
  const total = regularTotal + fullPriceTotal;
  const totalEach = regularTotal / 2 + fullPriceTotal;

  return { items, regularTotal, fullPriceTotal, total, totalEach };
}

const GBP = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP'
});

export function formatCurrency(amount) {
  return GBP.format(parseAmount(amount));
}

// Always shows the pack count and per-pack price, e.g. "Bulbs (2 × £7.50)".
export function formatExtraLabel(extra, names) {
  const packs = ` (${packsOf(extra)} × ${formatCurrency(extra.price)})`;
  if (extra.fullPriceFrom) {
    const fromName = names[extra.fullPriceFrom] || extra.fullPriceFrom;
    return `${extra.thing || 'Unnamed item'}${packs} (full price from ${fromName})`;
  }
  return `${extra.thing || 'Unnamed item'}${packs}`;
}
