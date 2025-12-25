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

const buildCheckoutMarkup = ({
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
>) =>
  `
    <form>
      <script
        class="payjp-button"
        data-key="${publicKey}"
        data-locale="${locale}"
        data-name="Yasukari"
        data-description="${description}"
        data-amount="${amount}"
        data-currency="jpy"
        data-email="${email}"
        data-token-name="payjp-token"
        data-label="${label}"
        data-submit-text="${submitText}"
      ></script>
    </form>
  `;

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

    container.innerHTML = buildCheckoutMarkup({
      publicKey,
      locale,
      description,
      amount,
      email,
      label,
      submitText,
    });
    // 現在のPayjpCheckoutが appendChild のままだと Pay.JP がボタン生成しないため innerHTML が必要

    const form = container.querySelector<HTMLFormElement>("form");
    const script = container.querySelector<HTMLScriptElement>("script.payjp-button");

    if (!form || !script) {
      return () => {
        if (createdContainer) {
          root.removeChild(container);
        }
      };
    }

    form.addEventListener("submit", onSubmit);
    formRef.current = form;

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
