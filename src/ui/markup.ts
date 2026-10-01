/**
 * THE PAGE'S OWN ARTWORK, MADE SAFE TO DRAW. A site that brands its cards hands Toranpu SVG for a back, a face or a
 * logo, and an address for a picture. The markup is the page's own, but it is drawn into a shadow root and into
 * other people's pages as a string, so what could run script, or fetch a page's data, is taken out first: the
 * elements that run or embed things, every `on…` handler, and any address that is not a picture.
 */

/** Elements that can run script, embed a page or animate an address into a script, taken out with everything inside them. */
const DANGEROUS_ELEMENTS = /<\s*(script|foreignObject|iframe|object|embed|audio|video|animate|animateMotion|animateTransform|set|style|link|meta|base)\b[\s\S]*?(?:<\s*\/\s*\1\s*>|$)/gi;
/** The same elements when they stand alone, with no closing tag. */
const DANGEROUS_LONE = /<\s*\/?\s*(script|foreignObject|iframe|object|embed|audio|video|animate|animateMotion|animateTransform|set|style|link|meta|base)\b[^>]*>/gi;
/** An event handler: `onload="…"`, `onclick='…'`, or one with no quotes. */
const HANDLERS = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
/** An address in `href` or `xlink:href`. */
const ADDRESSES = /(\s(?:xlink:)?href\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

/**
 * A picture's address, or null when it is anything else. A picture is a `data:image/` address (png, jpeg, gif, webp,
 * avif or svg), an `https:` or `http:` address, an address on the same site (`/logo.svg`, `./logo.svg`, `../logo.svg`)
 * or a plain file name. A `javascript:` address, any other `data:` address, and anything with a quote or an angle
 * bracket in it, is not one.
 */
export function safeImageUrl(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const text = url.trim();
  // eslint-disable-next-line no-control-regex
  if (text === "" || text.length > 600_000 || /["<>\u0000-\u001f]/.test(text)) return null;
  if (/^data:image\/(png|jpe?g|gif|webp|avif|svg\+xml)[;,]/i.test(text)) return text;
  if (/\s/.test(text)) return null;
  if (/^https?:\/\//i.test(text)) return text;
  if (/^[a-z][a-z0-9+.-]*:/i.test(text)) return null;
  return text;
}

/**
 * SVG markup with what could run or fetch taken out: scripts, `foreignObject`, frames, animation elements and
 * styles, every `on…` handler, and any `href` that is not a picture or a `#fragment` of the drawing itself. Anything
 * else is kept as it was written. This is a guard for markup that came from a page's own code, not a sanitiser for
 * strangers' files: never hand it what a visitor typed.
 */
export function cleanMarkup(markup: unknown): string {
  if (typeof markup !== "string") return "";
  return markup
    .replace(DANGEROUS_ELEMENTS, "")
    .replace(DANGEROUS_LONE, "")
    .replace(HANDLERS, "")
    .replace(ADDRESSES, (whole, head: string, double?: string, single?: string, bare?: string) => {
      const address = double ?? single ?? bare ?? "";
      if (address.startsWith("#")) return whole;
      const safe = safeImageUrl(address.replace(/&amp;/g, "&"));
      return safe === null ? "" : `${head}"${safe.replace(/&/g, "&amp;")}"`;
    });
}
