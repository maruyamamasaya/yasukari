import { type MutableRefObject, useEffect } from "react";

type PayjpCheckoutProps = {
  formRef: MutableRefObject<HTMLFormElement | null>;
  onSubmit: (event: Event) => void;
  onLoad: () => void;
  onError: () => void;
  locale: "ja" | "en";
  publicKey: string;
  description: string;
  amount: number;
  email: string;
  label: string;
  submitText: string;
};

const PORTAL_ROOT_ID = "payjp-root";
const CHECKOUT_CONTAINER_ID = "payjp-checkout-container";
const CHECKOUT_SCRIPT_ID = "payjp-checkout-script";

export default function PayjpCheckout({
  formRef,
  onSubmit,
  onLoad,
  onError,
  locale,
  publicKey,
  description,
  amount,
  email,
  label,
  submitText,
}: PayjpCheckoutProps) {
  useEffect(() => {
    const root = document.getElementById(PORTAL_ROOT_ID) ?? document.body;

    let container = root.querySelector<HTMLElement>(`#${CHECKOUT_CONTAINER_ID}`);
    let createdContainer = false;

    if (!container) {
      container = document.createElement("div");
      container.id = CHECKOUT_CONTAINER_ID;
      container.dataset.payjpCheckout = "true";
      root.appendChild(container);
      createdContainer = true;
    }

    let form = container.querySelector<HTMLFormElement>("form");
    if (!form) {
      form = document.createElement("form");
      container.appendChild(form);
    }

    // ✅ safety: remove any extra Pay.JP scripts injected elsewhere
    document.querySelectorAll<HTMLScriptElement>("script.payjp-button").forEach((existingScript) => {
      if (existingScript.id !== CHECKOUT_SCRIPT_ID) {
        existingScript.remove();
      }
    });

    form.addEventListener("submit", onSubmit);
    formRef.current = form;

    let script = form.querySelector<HTMLScriptElement>(`#${CHECKOUT_SCRIPT_ID}`);
    if (!script) {
      script = document.createElement("script");
      script.id = CHECKOUT_SCRIPT_ID;
      script.src = "https://checkout.pay.jp/";
      script.className = "payjp-button";
      form.appendChild(script);
    }

    script.dataset.key = publicKey;
    script.dataset.locale = locale;
    script.dataset.name = "Yasukari";
    script.dataset.description = description;
    script.dataset.amount = amount.toString();
    script.dataset.currency = "jpy";
    script.dataset.email = email;
    script.dataset.tokenName = "payjp-token";
    script.dataset.label = label;
    script.dataset.submitText = submitText;

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      form.removeEventListener("submit", onSubmit);
      formRef.current = null;

      if (createdContainer) {
        root.removeChild(container);
      }
    };
  }, [
    amount,
    description,
    email,
    formRef,
    label,
    locale,
    onError,
    onLoad,
    onSubmit,
    publicKey,
    submitText,
  ]);

  return null;
}
