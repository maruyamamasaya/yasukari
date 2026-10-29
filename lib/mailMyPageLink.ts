export function withMyPageLink<T extends { text: string; html?: string }>(payload: T): T {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yasukari.com').replace(/\/$/, '');
  const url = `${siteUrl}/mypage`;
  const text = payload.text.includes(url)
    ? payload.text
    : `${payload.text}\n\nマイページ / My page\nご予約内容・最新の解錠用QRはこちらからご確認ください。\n${url}`;
  let html = payload.html;
  if (html && !html.includes(url)) {
    const link = `<p>ご予約内容・最新の解錠用QRはマイページでご確認ください。<br /><a href="${url}">マイページ / My page</a></p>`;
    html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${link}</body>`) : `${html}${link}`;
  }
  return { ...payload, text, html };
}
