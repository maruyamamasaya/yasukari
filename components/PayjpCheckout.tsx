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
 * container 内を毎回初期化して安全な状態に戻す
 * (PayJPが生成する #payjp_checkout_box なども全部消す)
 */
const resetContainer = (container: HTMLElement) => {
  container.innerHTML = "";
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
  // Reactの再レンダリングで handler が変わっても listener を張り替えなくて済むように ref 化
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

    // ✅ container を 1つだけ作って固定
    let container = portalRoot.querySelector<HTMLElement>(`#${CHECKOUT_CONTAINER_ID}`);
    if (!container) {
      container = document.createElement("div");
      container.id = CHECKOUT_CONTAINER_ID;
      container.dataset.payjpCheckout = "true";
      portalRoot.appendChild(container);
    }

    // ✅ 重要：毎回 container を初期化してから作り直す
    resetContainer(container);

    // ✅ form作成
    const form = document.createElement("form");
    form.dataset.payjpCheckout = "true";

    // ✅ script作成（必ず append前にdatasetセット済）
    const script = createCheckoutScript({
      publicKey,
      locale,
      description,
      amount,
      email,
      label,
      submitText,
    });

    // ✅ append（この瞬間に PayJP が初期化される）
    form.appendChild(script);
    container.appendChild(form);

    // ✅ formRef を更新（token取得に使う）
    formRef.current = form;

    // ✅ submit handler
    const handleSubmit = (event: Event) => submitHandlerRef.current(event);
    form.addEventListener("submit", handleSubmit);

    // ✅ PayJPが #payjp_checkout_box を生成したら onLoad を呼ぶ
    let alreadyReady = false;
    const observer = new MutationObserver(() => {
      if (alreadyReady) return;
      const box = container.querySelector("#payjp_checkout_box");
      if (box) {
        alreadyReady = true;
        loadHandlerRef.current();
        observer.disconnect();
      }
    });
    observer.observe(container, { childList: true, subtree: true });

    const handleError = () => {
      if (!alreadyReady) {
        errorHandlerRef.current();
      }
      observer.disconnect();
    };

    // script load は PayJP 内部処理完了とは別なので error のみ監視
    script.addEventListener("error", handleError);

    return () => {
      observer.disconnect();
      script.removeEventListener("error", handleError);
      form.removeEventListener("submit", handleSubmit);
      formRef.current = null;

      // ✅ cleanup：rootごと消さない。containerの中身だけ消す
      resetContainer(container);
    };
  }, [
    // ✅ ここが重要：PayJPは props が変わったら再初期化が必要なので deps に含める
    publicKey,
    locale,
    description,
    amount,
    email,
    label,
    submitText,
    formRef,
  ]);

  return null;
}
