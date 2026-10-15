export function siteNameFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return host.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
