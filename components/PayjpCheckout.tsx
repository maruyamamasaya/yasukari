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

const createCheckoutScript = ({
  publicKey,
  locale,
  description,
  amount,
  email,
  label,
  submitText,
}: Pick<
  PayjpCheckoutProps,
  "publicKey" | "locale" | "description" | "amount" | "email" | "label" | "submitText"
>) => {
  const script = document.createElement("script");
  script.id = "payjp-checkout-script";
  script.src = "https://checkout.pay.jp/";
  script.className = "payjp-button";
  script.dataset.key = publicKey;
  script.dataset.locale = locale;
  script.dataset.name = "Yasukari";
  script.dataset.description = description;
  script.dataset.amount = String(amount);
  script.dataset.currency = "jpy";
  script.dataset.email = email;
  script.dataset.tokenName = "payjp-token";
  script.dataset.label = label;
  script.dataset.submitText = submitText;
  return script;
};

const clearCheckoutContainer = (container: HTMLElement) => {
  container.querySelectorAll("script.payjp-button").forEach((script) => script.remove());
  container.querySelectorAll("#payjp_checkout_box").forEach((element) => element.remove());
  container.textContent = "";
};

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

    clearCheckoutContainer(container);

    const form = document.createElement("form");
    const script = createCheckoutScript({
      publicKey,
      locale,
      description,
      amount,
      email,
      label,
      submitText,
    });

    form.appendChild(script);
    container.appendChild(form);

    const checkoutScript = container.querySelector<HTMLScriptElement>("script.payjp-button");

    if (!checkoutScript) {
      return () => {
        if (createdContainer) {
          root.removeChild(container);
        }
      };
    }

    form.addEventListener("submit", onSubmit);
    formRef.current = form;

    checkoutScript.addEventListener("load", onLoad);
    checkoutScript.addEventListener("error", onError);

    return () => {
      checkoutScript.removeEventListener("load", onLoad);
      checkoutScript.removeEventListener("error", onError);
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
