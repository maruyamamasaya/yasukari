import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PayjpPortalProps = {
  children: ReactNode;
};

const PORTAL_ROOT_ID = "payjp-root";

export default function PayjpPortal({ children }: PayjpPortalProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.getElementById(PORTAL_ROOT_ID);
    if (!root) return;

    const container = document.createElement("div");
    root.appendChild(container);
    setPortalContainer(container);

    return () => {
      root.removeChild(container);
    };
  }, []);

  if (!portalContainer) {
    return <>{children}</>;
  }

  return createPortal(children, portalContainer);
}
