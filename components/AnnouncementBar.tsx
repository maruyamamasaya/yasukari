import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  const [dismissed, setDismissed] = useState(false);

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

  if (!message || dismissed) {
    return null;
  }

  const linkHref = banner ? buildLink(banner) : undefined;
  const isExternal = linkHref ? /^https?:\/\//.test(linkHref) : false;

  return (
    <div className="relative bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-2 text-sm px-8">
      <button
        type="button"
        aria-label="Close announcement"
        onClick={() => setDismissed(true)}
        className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/10 text-xs font-bold text-white shadow-sm transition hover:bg-white/20"
      >
        ×
      </button>
      {linkHref ? (
        isExternal ? (
          <a
            href={linkHref}
            target="_blank"
            rel="noreferrer"
            className="text-white no-underline"
          >
            {message}
          </a>
        ) : (
          <Link href={linkHref} className="text-white no-underline">
            {message}
          </Link>
        )
      ) : (
        message
      )}
    </div>
  );
}
