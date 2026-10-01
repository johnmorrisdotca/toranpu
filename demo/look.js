// The look the demo is shown in, shared by its panels and kept in the address: the back chosen,
// its colour and the words in its middle. Each panel draws from here and says when it changes.
const asked = new URLSearchParams(location.search);
const BACKS = ["classic-red", "classic-blue", "ink-dots"];
const colour = asked.get("back-colour");

export const look = {
  back: BACKS.includes(asked.get("back")) ? asked.get("back") : "classic-red",
  colour: /^[0-9a-f]{6}$/i.test(colour ?? "") ? `#${colour.toLowerCase()}` : null,
  mark: (asked.get("mark") ?? "").slice(0, 12),
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
}
