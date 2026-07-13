export const DEFAULT_NAMES = { matias: 'Matias', reka: 'Réka' };

export const DEFAULT_BANK = {
  name: 'Your Name',
  bankName: 'Your Bank',
  sortCode: '00-00-00',
  accountNumber: '00000000'
};

// Ensures a draft coming from the server (which may predate the names/bank
// fields) always has the expected shape, so the UI never crashes on missing
// properties. Existing values are preserved; only absent keys get defaults.
export function normalizeDraft(draft) {
  if (!draft) return draft;
  return {
    period: draft.period || '',
    dueDate: draft.dueDate || '',
    names: { ...DEFAULT_NAMES, ...(draft.names || {}) },
    bills: draft.bills || [],
    matiasExtras: draft.matiasExtras || [],
    rekaExtras: draft.rekaExtras || [],
    matiasFullPriceExtras: draft.matiasFullPriceExtras || [],
    rekaFullPriceExtras: draft.rekaFullPriceExtras || [],
    matiasNote: draft.matiasNote || '',
    rekaNote: draft.rekaNote || '',
    matiasDiscounts: draft.matiasDiscounts || [],
    rekaDiscounts: draft.rekaDiscounts || [],
    splitPercent: draft.splitPercent ?? 50,
    bankDetails: { ...DEFAULT_BANK, ...(draft.bankDetails || {}) }
  };
}
