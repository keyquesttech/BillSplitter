import { mergedExtras } from './calculations.js';

export const DEFAULT_NAMES = { matias: 'Matias', reka: 'Réka' };

export const DEFAULT_BANK = {
  name: 'Your Name',
  bankName: 'Your Bank',
  sortCode: '00-00-00',
  accountNumber: '00000000'
};

// Bills predating the per-bill discount percent used a checkbox
// (discounted: true meant a 100% discount); fold that into discountPercent
// and drop the flag so the form always edits one representation.
function normalizeBill(bill) {
  const { discounted, ...rest } = bill;
  return {
    ...rest,
    discountPercent: bill.discountPercent ?? (discounted ? '100' : ''),
    discountedFrom: bill.discountedFrom || 'na'
  };
}

// Ensures a draft coming from the server (which may predate the names/bank
// fields) always has the expected shape, so the UI never crashes on missing
// properties. Existing values are preserved; only absent keys get defaults.
export function normalizeDraft(draft) {
  if (!draft) return draft;
  return {
    period: draft.period || '',
    dueDate: draft.dueDate || '',
    // A filled payment date is what marks the invoice paid (PAID stamp)
    paidDate: draft.paidDate || '',
    names: { ...DEFAULT_NAMES, ...(draft.names || {}) },
    bills: (draft.bills || []).map(normalizeBill),
    // Extras are one list per person with a per-item percent; legacy
    // full-price lists are folded in as 100% items (see mergedExtras).
    matiasExtras: mergedExtras(draft, 'matias'),
    rekaExtras: mergedExtras(draft, 'reka'),
    matiasFullPriceExtras: [],
    rekaFullPriceExtras: [],
    matiasNote: draft.matiasNote || '',
    rekaNote: draft.rekaNote || '',
    matiasDiscounts: draft.matiasDiscounts || [],
    rekaDiscounts: draft.rekaDiscounts || [],
    splitPercent: draft.splitPercent ?? 50,
    bankDetails: { ...DEFAULT_BANK, ...(draft.bankDetails || {}) }
  };
}
