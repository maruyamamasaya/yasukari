export type AnnouncementBannerSettings = {
  text: string;
  linkType: "blog" | "external" | "none";
  blogSlug?: string;
  externalUrl?: string;
};
