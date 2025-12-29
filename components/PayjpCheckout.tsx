import { type MutableRefObject, useEffect, useRef } from "react";

type PayjpCheckoutProps = {
  formRef: MutableRefObject<HTMLFormElement | null>;
  placeholderRef: MutableRefObject<HTMLDivElement | null>;
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
const CHECKOUT_SCRIPT_SRC = "https://checkout.pay.jp/";

/**
 * PayJPはscriptタグをDOMに挿入した瞬間に初期化されるので、
 * datasetは必ず appendChild() より前にセットすること。
 */
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
  script.id = CHECKOUT_SCRIPT_ID;
  script.src = CHECKOUT_SCRIPT_SRC;
  script.className = "payjp-button";

  // ✅ append前に必ずdatasetセット
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

/**
 * 既存scriptやboxを破壊せずに「このcontainerだけ」を初期化
 * ✅ PayJPは古いDOMを残すと不安定になるので container内だけは確実に消す
 */
const resetContainerInside = (container: HTMLElement) => {
  container.innerHTML = "";
};

export default function PayjpCheckout({
  formRef,
  placeholderRef,
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
  const submitHandlerRef = useRef(onSubmit);
  const loadHandlerRef = useRef(onLoad);
  const errorHandlerRef = useRef(onError);

  useEffect(() => {
    submitHandlerRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    loadHandlerRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    errorHandlerRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const portalRoot = document.getElementById(PORTAL_ROOT_ID);
    if (!portalRoot) {
      console.error(`[PayjpCheckout] #${PORTAL_ROOT_ID} not found`);
      return;
    }

    // ✅ containerは常に1つ
    let container = document.getElementById(CHECKOUT_CONTAINER_ID) as HTMLElement | null;
    if (!container) {
      container = document.createElement("div");
      container.id = CHECKOUT_CONTAINER_ID;
      container.dataset.payjpCheckout = "true";
      portalRoot.appendChild(container);
    }

    // ✅ placeholder があれば container ごと移動（form構造を壊さない）
    const placeholder = placeholderRef.current;
    if (placeholder && container.parentElement !== placeholder) {
      placeholder.appendChild(container);
    } else if (!placeholder && container.parentElement !== portalRoot) {
      portalRoot.appendChild(container);
    }

    // ✅ containerの中身だけを初期化（container自体は保持）
    resetContainerInside(container);

    // ✅ form作成
    const form = document.createElement("form");
    form.dataset.payjpCheckout = "true";

    // ✅ script作成（append前にdatasetセット済）
    const script = createCheckoutScript({
      publicKey,
      locale,
      description,
      amount,
      email,
      label,
      submitText,
    });

    // ✅ append（この瞬間にPayJPが初期化される）
    form.appendChild(script);
    container.appendChild(form);

    // ✅ formRefをセット（token参照に使う）
    formRef.current = form;

    // ✅ submit handler
    const handleSubmit = (event: Event) => submitHandlerRef.current(event);
    form.addEventListener("submit", handleSubmit);
    const nativeSubmit = form.submit.bind(form);
    const interceptSubmit = () => {
      const submitEvent = new Event("submit", { cancelable: true, bubbles: true });
      const shouldSubmit = form.dispatchEvent(submitEvent);
      if (shouldSubmit) {
        nativeSubmit();
      }
    };
    form.submit = interceptSubmit;

    // ✅ PayJPが box を作ったら onLoad
    let ready = false;
    const observer = new MutationObserver(() => {
      if (ready) return;
      const box = container.querySelector("#payjp_checkout_box");
      if (box) {
        ready = true;
        loadHandlerRef.current();
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    const handleError = () => {
      if (!ready) {
        errorHandlerRef.current();
      }
      observer.disconnect();
    };

    script.addEventListener("error", handleError);

    return () => {
      observer.disconnect();
      script.removeEventListener("error", handleError);
      form.removeEventListener("submit", handleSubmit);
      form.submit = nativeSubmit;
      formRef.current = null;

      // ✅ cleanupで container を消すと壊れるので消さない
      // ✅ 中身だけリセット
      resetContainerInside(container);
    };
  }, [
    publicKey,
    locale,
    description,
    amount,
    email,
    label,
    submitText,
    formRef,
    placeholderRef,
  ]);

  return null;
}
