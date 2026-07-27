import {
  consumeSessionFlag,
  pushDataLayerEvent,
  trackPurchaseOnce,
} from '../lib/conversionTracking';

describe('conversion tracking', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    window.dataLayer = [];
  });

  it('consumes a session flag only once', () => {
    sessionStorage.setItem('pending', '1');
    expect(consumeSessionFlag('pending')).toBe(true);
    expect(consumeSessionFlag('pending')).toBe(false);
  });

  it('pushes the exact registration event name', () => {
    pushDataLayerEvent({ event: 'complete_registration' });
    expect(window.dataLayer).toEqual([{ event: 'complete_registration' }]);
  });

  it('deduplicates purchases by transaction id and sends a numeric value', () => {
    expect(trackPurchaseOnce('BJ250A-014733', 4480)).toBe(true);
    expect(trackPurchaseOnce('BJ250A-014733', 4480)).toBe(false);
    expect(window.dataLayer).toEqual([
      { event: 'purchase_complete', value: 4480, transaction_id: 'BJ250A-014733' },
    ]);
  });
});
