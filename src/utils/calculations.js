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

export function calculateInvoice(
  bills,
  matiasExtras,
  rekaExtras,
  matiasFullPriceExtras = [],
  rekaFullPriceExtras = []
) {
  const billsTotal = bills.reduce((sum, b) => sum + parseAmount(b.amount), 0);
  const billsTotalEach = billsTotal / 2;

  const matiasRegular = sumExtras(matiasExtras);
  const rekaRegular = sumExtras(rekaExtras);
  const matiasFullPrice = sumExtras(matiasFullPriceExtras);
  const rekaFullPrice = sumExtras(rekaFullPriceExtras);

  const regularExtrasEach = (matiasRegular + rekaRegular) / 2;

  const netTotal = billsTotal + matiasRegular + rekaRegular + matiasFullPrice + rekaFullPrice;

  const matiasShareExtras = regularExtrasEach + rekaFullPrice;
  const rekaShareExtras = regularExtrasEach + matiasFullPrice;

  const matiasTotalDue = billsTotalEach + matiasShareExtras;
  const rekaTotalDue = billsTotalEach + rekaShareExtras;

  return {
    billsTotal,
    billsTotalEach,
    matiasRegular,
    rekaRegular,
    matiasFullPrice,
    rekaFullPrice,
    regularExtrasEach,
    matiasShareExtras,
    rekaShareExtras,
    matiasTotalDue,
    rekaTotalDue,
    netTotal
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
