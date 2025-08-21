export const withVersion = (url, v) => {
  if (!url) return url;
  try {
    const u = new URL(url, window.location.origin); // на случай относительных URL
    u.searchParams.set('v', String(v));
    return u.toString();
  } catch {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}v=${v}`;
  }
};
