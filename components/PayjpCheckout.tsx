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
 * container内を完全にクリーンにしてから再生成する
 * PayJPは内部DOM(#payjp_checkout_boxなど)を作るので残骸が混じると壊れる
 */
const clearCheckoutContainer = (container: HTMLElement) => {
  // PayJPのscriptを全部削除
  container.querySelectorAll("script.payjp-button").forEach((script) => script.remove());
  // PayJPの生成DOMを削除
  container.querySelectorAll("#payjp_checkout_box").forEach((el) => el.remove());
  // 他にも何か生成してたら全部消す
  container.innerHTML = "";
};

/**
 * ページ全体に script.payjp-button が複数あったら危険なので強制削除
 */
const removeGlobalExtraScripts = () => {
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>("script.payjp-button"));
  scripts.forEach((s) => {
    if (s.id !== CHECKOUT_SCRIPT_ID) {
      s.remove();
    }
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
  useEffect(() => {
    const root = document.getElementById(PORTAL_ROOT_ID) ?? document.body;

    // ① containerを用意
    let container = root.querySelector<HTMLElement>(`#${CHECKOUT_CONTAINER_ID}`);
    const createdContainer = !container;

    if (!container) {
      container = document.createElement("div");
      container.id = CHECKOUT_CONTAINER_ID;
      container.dataset.payjpCheckout = "true";
      root.appendChild(container);
    }

    // ② 外部から混入してるscriptを先に消す（安全策）
    removeGlobalExtraScripts();

    // ③ containerを毎回クリーンにしてから再生成
    clearCheckoutContainer(container);

    // ④ form/scriptを作成（datasetは append 前にセット）
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

    // ⑤ append
    form.appendChild(script);
    container.appendChild(form);

    // ⑥ refをセット
    formRef.current = form;

    // ⑦ submitイベント
    form.addEventListener("submit", onSubmit);

    // ⑧ onLoad/onError が確実に呼ばれるように監視
    let alreadyLoaded = false;
    const observer = new MutationObserver(() => {
      if (alreadyLoaded) return;
      const box = container.querySelector("#payjp_checkout_box");
      if (box) {
        alreadyLoaded = true;
        onLoad();
        observer.disconnect();
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    // ⑨ script load/errorイベントも一応取る
    const handleLoad = () => {
      // loadが来ても box生成されるとは限らないので observerと併用
    };

    const handleError = () => {
      if (!alreadyLoaded) {
        onError();
      }
      observer.disconnect();
    };

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    return () => {
      observer.disconnect();
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
      form.removeEventListener("submit", onSubmit);
      formRef.current = null;

      // rootに container が常設される場合もあるので createdContainerで分岐
      if (createdContainer) {
        root.removeChild(container);
      } else {
        clearCheckoutContainer(container); // ✅ 重要：中身だけ消す
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
