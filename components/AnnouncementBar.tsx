import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AnnouncementBannerSettings } from "../types/announcement";

type BannerState = AnnouncementBannerSettings | null;

const DEFAULT_BANNER: AnnouncementBannerSettings = {
  text: "🎉 今週限定：初回レンタル30%OFF + 新着モデル入荷！",
  linkType: "none",
};

function buildLink(settings: AnnouncementBannerSettings): string | undefined {
  if (settings.linkType === "blog" && settings.blogSlug) {
    return `/blog_for_custmor/${settings.blogSlug}`;
  }
  if (settings.linkType === "external" && settings.externalUrl) {
    return settings.externalUrl;
  }
  return undefined;
}

export default function AnnouncementBar() {
  const [banner, setBanner] = useState<BannerState>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;
    const fetchBanner = async () => {
      try {
        const response = await fetch("/api/announcement-banner");
        if (!response.ok) {
          throw new Error("Failed to load banner");
        }
        const data = (await response.json()) as AnnouncementBannerSettings;
        if (!isCancelled) {
          setBanner(data);
        }
      } catch (error) {
        console.error("Failed to load announcement banner", error);
        if (!isCancelled) {
          setBanner(DEFAULT_BANNER);
        }
      }
    };

    void fetchBanner();

    return () => {
      isCancelled = true;
    };
  }, []);

  const message = useMemo(() => banner?.text?.trim() ?? "", [banner]);

  if (router.pathname !== "/") {
    return null;
  }

  if (!message) {
    return null;
  }

  const linkHref = banner ? buildLink(banner) : undefined;
  const isExternal = linkHref ? /^https?:\/\//.test(linkHref) : false;

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) {
      return;
    }

    const update = () => {
      setShouldScroll(content.scrollWidth > container.clientWidth);
    };

    update();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(update);
      observer.observe(container);
      observer.observe(content);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [message]);

  return (
    <div className="announcement-bar">
      <div className="announcement-bar__container" ref={containerRef}>
        <div
          className={`announcement-bar__track${shouldScroll ? " is-scrolling" : ""}`}
          ref={contentRef}
        >
          {linkHref ? (
            isExternal ? (
              <a
                href={linkHref}
                target="_blank"
                rel="noreferrer"
                className="announcement-bar__link"
              >
                {message}
              </a>
            ) : (
              <Link href={linkHref} className="announcement-bar__link">
                {message}
              </Link>
            )
          ) : (
            <span className="announcement-bar__text">{message}</span>
          )}
        </div>
      </div>
    </div>
  );
}
