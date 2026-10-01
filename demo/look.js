// The look the demo is shown in, shared by its panels and kept in the address: the back chosen,
// its colour and the words in its middle. Each panel draws from here and says when it changes.
import { CARD_BACKS } from "./dist/card-backs.js";
import { CARD_DESIGNS } from "./dist/card-faces.js";

const asked = new URLSearchParams(location.search);
// The backs and designs as the package lists them, so a new one is chosen from the address without anyone remembering these lines.
const BACKS = CARD_BACKS;
const colour = asked.get("back-colour");
const DESIGNS = CARD_DESIGNS;

export const look = {
  back: BACKS.includes(asked.get("back")) ? asked.get("back") : "classic-red",
  colour: /^[0-9a-f]{6}$/i.test(colour ?? "") ? `#${colour.toLowerCase()}` : null,
  mark: (asked.get("mark") ?? "").slice(0, 12),
  design: DESIGNS.includes(asked.get("design")) ? asked.get("design") : "plain",
  messiness: /^(0(\.\d{1,2})?|1)$/.test(asked.get("mess") ?? "") ? Number(asked.get("mess")) : 0.3,
};

const listeners = [];
/** Run `draw` whenever the look changes. */
export const onLook = (draw) => listeners.push(draw);
/** Change part of the look, and redraw everything that shows it. */
export function setLook(change) {
  Object.assign(look, change);
  for (const draw of listeners) draw();
}
/** The back's options as `cardBackSvg` takes them. */
export const backOptions = () => ({ ...(look.colour === null ? {} : { colour: look.colour }), ...(look.mark.trim() === "" ? {} : { mark: look.mark.trim() }) });
/** The look's part of the page's address. */
export function lookQuery(query) {
  if (look.back !== "classic-red") query.set("back", look.back);
  if (look.colour !== null) query.set("back-colour", look.colour.slice(1));
  if (look.mark.trim() !== "") query.set("mark", look.mark.trim());
  if (look.design !== "plain") query.set("design", look.design);
  if (look.messiness !== 0.3) query.set("mess", String(look.messiness));
}

/** The look's attributes, as every element on the page wears them. */
export function wear(element) {
  for (const name of ["design", "back", "back-colour", "mark"]) element.removeAttribute(name);
  if (look.design !== "plain") element.setAttribute("design", look.design);
  if (look.back !== "classic-red") element.setAttribute("back", look.back);
  if (look.colour !== null) element.setAttribute("back-colour", look.colour);
  if (look.mark.trim() !== "") element.setAttribute("mark", look.mark.trim());
}
