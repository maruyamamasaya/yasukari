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

  if (!message) {
    return null;
  }

  const linkHref = banner ? buildLink(banner) : undefined;
  const isExternal = linkHref ? /^https?:\/\//.test(linkHref) : false;

  return (
    <div className="bg-gradient-to-r from-red-600 to-red-500 text-white text-center py-2 text-sm px-2">
      {linkHref ? (
        isExternal ? (
          <a href={linkHref} target="_blank" rel="noreferrer" className="underline">
            {message}
          </a>
        ) : (
          <Link href={linkHref} className="underline">
            {message}
          </Link>
        )
      ) : (
        message
      )}
    </div>
  );
}
