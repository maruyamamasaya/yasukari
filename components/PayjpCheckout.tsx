import { type MutableRefObject, useEffect, useRef } from "react";

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
  script.src = "https://checkout.pay.jp/";
  script.className = "payjp-button";

  // datasetは append 前に必ずセット
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
 * datasetは append 前に必ずセットされている前提で更新する
 */
const updateCheckoutScriptDataset = (
  script: HTMLScriptElement,
  {
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
  >,
) => {
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
};

/**
 * #payjp-root 内に script.payjp-button が複数あったら危険なので強制削除
 */
const removeExtraScriptsInRoot = (root: HTMLElement, keepScript: HTMLScriptElement | null) => {
  const scripts = Array.from(root.querySelectorAll<HTMLScriptElement>("script.payjp-button"));
  scripts.forEach((script) => {
    if (keepScript && script === keepScript) {
      return;
    }
    script.remove();
  });
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
  const submitHandlerRef = useRef(onSubmit);
  const loadHandlerRef = useRef(onLoad);
  const errorHandlerRef = useRef(onError);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const formElementRef = useRef<HTMLFormElement | null>(null);

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
    const root = document.getElementById(PORTAL_ROOT_ID) ?? document.body;

    let container = root.querySelector<HTMLElement>(`#${CHECKOUT_CONTAINER_ID}`);

    if (!container) {
      container = document.createElement("div");
      container.id = CHECKOUT_CONTAINER_ID;
      container.dataset.payjpCheckout = "true";
      root.appendChild(container);
    }

    let form = container.querySelector<HTMLFormElement>("form[data-payjp-checkout]");
    if (!form) {
      form = document.createElement("form");
      form.dataset.payjpCheckout = "true";
      container.appendChild(form);
    }

    let script = container.querySelector<HTMLScriptElement>("script.payjp-button");
    if (!script) {
      script = createCheckoutScript({
        publicKey,
        locale,
        description,
        amount,
        email,
        label,
        submitText,
      });
    } else {
      script.id = CHECKOUT_SCRIPT_ID;
      if (!script.src) {
        script.src = "https://checkout.pay.jp/";
      }
      script.className = "payjp-button";
      updateCheckoutScriptDataset(script, {
        publicKey,
        locale,
        description,
        amount,
        email,
        label,
        submitText,
      });
    }

    if (script.parentElement !== form) {
      form.appendChild(script);
    }

    scriptRef.current = script;
    formElementRef.current = form;
    formRef.current = form;

    removeExtraScriptsInRoot(root, script);

    const handleSubmit = (event: Event) => {
      submitHandlerRef.current(event);
    };

    form.addEventListener("submit", handleSubmit);

    let alreadyLoaded = false;
    const observer = new MutationObserver(() => {
      if (alreadyLoaded) return;
      const box = container.querySelector("#payjp_checkout_box");
      if (box) {
        alreadyLoaded = true;
        loadHandlerRef.current();
        observer.disconnect();
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    const handleLoad = () => {
      // loadが来ても box生成されるとは限らないので observerと併用
    };

    const handleError = () => {
      if (!alreadyLoaded) {
        errorHandlerRef.current();
      }
      observer.disconnect();
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    return () => {
      observer.disconnect();
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      form.removeEventListener("submit", handleSubmit);
      formRef.current = null;
    };
  }, [formRef]);

  useEffect(() => {
    const script = scriptRef.current;
    if (!script) return;
    updateCheckoutScriptDataset(script, {
      publicKey,
      locale,
      description,
      amount,
      email,
      label,
      submitText,
    });
  }, [publicKey, locale, description, amount, email, label, submitText]);

  return null;
}
