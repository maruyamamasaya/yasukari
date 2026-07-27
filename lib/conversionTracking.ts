export const SIGNUP_INTENT_KEY = 'signup_intent';
export const SIGNUP_COMPLETE_KEY = 'signup_complete_pending';
export const REGISTRATION_COMPLETE_KEY = 'registration_complete_pending';
export const PURCHASE_COMPLETE_KEY = 'purchase_complete_pending';

type DataLayerEvent =
  | { event: 'sign_up_complete' }
  | { event: 'complete_registration' }
  | { event: 'purchase_complete'; value: number; transaction_id: string };

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export const pushDataLayerEvent = (event: DataLayerEvent) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
};

export const consumeSessionFlag = (key: string): boolean => {
  if (sessionStorage.getItem(key) !== '1') return false;
  sessionStorage.removeItem(key);
  return true;
};

export const trackPurchaseOnce = (transactionId: string, value: number): boolean => {
  if (!transactionId || !Number.isFinite(value)) return false;

  const storageKey = `purchase_complete:${transactionId}`;
  if (localStorage.getItem(storageKey) === '1') return false;

  pushDataLayerEvent({ event: 'purchase_complete', value, transaction_id: transactionId });
  localStorage.setItem(storageKey, '1');
  return true;
};
