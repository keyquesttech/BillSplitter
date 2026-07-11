import React, { forwardRef } from 'react';
import {
  calculateInvoice,
  extraTotal,
  formatCurrency,
  formatExtraLabel,
  getInvoiceExtrasSection
} from '../utils/calculations';
import { DEFAULT_NAMES, DEFAULT_BANK } from '../utils/defaults';

const InvoicePreview = forwardRef(({ data }, ref) => {
  const names = { ...DEFAULT_NAMES, ...(data.names || {}) };
  const bank = { ...DEFAULT_BANK, ...(data.bankDetails || {}) };

  const {
    billsTotal,
    billsTotalEach,
    matiasShareExtras,
    rekaShareExtras,
    matiasTotalDue,
    rekaTotalDue,
    netTotal
  } = calculateInvoice(
    data.bills,
    data.matiasExtras,
    data.rekaExtras,
    data.matiasFullPriceExtras,
    data.rekaFullPriceExtras
  );

  const extrasSections = [
    { key: 'matias', name: names.matias, ...getInvoiceExtrasSection('matias', data) },
    { key: 'reka', name: names.reka, ...getInvoiceExtrasSection('reka', data) }
  ].filter((person) => person.items.length > 0);

  const dueSections = [
    { key: 'matias', name: names.matias, shareExtras: matiasShareExtras, total: matiasTotalDue, note: data.matiasNote },
    { key: 'reka', name: names.reka, shareExtras: rekaShareExtras, total: rekaTotalDue, note: data.rekaNote }
  ];

  const periodDate = data.period ? new Date(data.period + '-01T00:00:00Z') : null;
  const periodLabel = periodDate && !isNaN(periodDate)
    ? periodDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', timeZone: 'UTC' })
    : 'Monthly';

  return (
    <div className="invoice-frame" ref={ref} id="invoice-preview">
      <div className="invoice-orb invoice-orb-lime" aria-hidden="true" />
      <div className="invoice-orb invoice-orb-pink" aria-hidden="true" />
      <div className="invoice-card">
      <div className="invoice-header">
        <h2>{periodLabel} Bills</h2>
        <div className="text-muted invoice-meta">
          <span>Issued on: <strong>{(data.timestamp ? new Date(data.timestamp) : new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
        </div>
      </div>

      <div className="invoice-section">
        <div className="due-card due-card-bills">
          <div className="due-card-name">Bills</div>
          {data.bills.map((bill) => (
            <div className="due-line" key={bill.id}>
              <span>{bill.thing}</span>
              <span>{formatCurrency(bill.amount)}</span>
            </div>
          ))}
          <div className="due-card-total">
            <span>Bills total</span>
            <span>{formatCurrency(billsTotal)}</span>
          </div>
          <div className="due-card-total due-card-total-secondary">
            <span>Bills total each</span>
            <span>{formatCurrency(billsTotalEach)}</span>
          </div>
        </div>
      </div>

      {extrasSections.length > 0 && (
        <div className="invoice-section">
          {extrasSections.map((person) => (
            <div className="due-card due-card-extras" key={person.key}>
              <div className="due-card-name">{person.name} Extras</div>
              {person.items.map((extra) => (
                <div className="due-line" key={extra.id}>
                  <span>{formatExtraLabel(extra, names)}</span>
                  <span>{formatCurrency(extraTotal(extra))}</span>
                </div>
              ))}
              <div className="due-card-total">
                <span>Total</span>
                <span>{formatCurrency(person.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="invoice-section">
        {dueSections.map((person) => (
          <div className="due-card due-card-summary" key={person.key}>
            <div className="due-card-name">{person.name} Total</div>
            <div className="due-line">
              <span>Share of bills</span>
              <span>{formatCurrency(billsTotalEach)}</span>
            </div>
            <div className="due-line">
              <span>Share of extras</span>
              <span>{formatCurrency(person.shareExtras)}</span>
            </div>
            <div className="due-card-total">
              <span>Total due</span>
              <span>{formatCurrency(person.total)}</span>
            </div>
          </div>
        ))}

        <div className="due-card due-card-total-grand">
          <div className="due-card-total grand-total-line">
            <span>Grand total (bills + all extras)</span>
            <span className="grand-total-amount">{formatCurrency(netTotal)}</span>
          </div>
        </div>

        {dueSections.filter((person) => person.note?.trim()).map((person) => (
          <div className="due-card due-card-note" key={`${person.key}-note`}>
            <div className="due-card-name">{person.name} Note</div>
            <p className="due-note-text">{person.note}</p>
          </div>
        ))}
      </div>

      <div className="invoice-section">
        <div className="due-card due-card-bank">
          <div className="due-card-name">Bank Details</div>
          <div className="due-line due-line-text">
            <span>Name:</span>
            <span>{bank.name}</span>
          </div>
          <div className="due-line due-line-text">
            <span>Bank name:</span>
            <span>{bank.bankName}</span>
          </div>
          <div className="due-line due-line-text">
            <span>Sort code:</span>
            <span>{bank.sortCode}</span>
          </div>
          <div className="due-line due-line-text">
            <span>Account number:</span>
            <span>{bank.accountNumber}</span>
          </div>
        </div>
      </div>

      <div className="invoice-footer">
        <p>Thank you for settling the bills promptly!</p>
        {data.dueDate && (
          <p className="invoice-due-date">
            Due by: {new Date(data.dueDate + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </p>
        )}
      </div>
      </div>
    </div>
  );
});

export default InvoicePreview;
