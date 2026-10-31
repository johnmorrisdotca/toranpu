/**
 * EVERY WORD TORANPU SAYS TO A PERSON, in English and Japanese: the games'
 * names and what each is in a line, the cards' names, a move in words, the
 * command line's lines, and the demo table's. One table, so that the two
 * languages are kept side by side and a test can hold them together.
 * `{n}` and the other braces are filled in with `fillIn`; a table of your own
 * must keep them.
 */

/** The languages Toranpu speaks.
 *
 * @example
 * ```ts
 * import type { Language } from "@johnmorrisdotca/toranpu";
 *
 * const value: Language = "ja";
 * console.log(value);
 * ```
 */
export type Language = "en" | "ja";

/** The names of the strings. Each is one line or one block of text.
 *
 * @example
 * ```ts
 * import type { ToranpuStrings } from "@johnmorrisdotca/toranpu";
 * import { STRINGS } from "@johnmorrisdotca/toranpu";
 *
 * const value: ToranpuStrings = STRINGS.ja;
 * console.log(value.gameHearts);
 * ```
 */
export type ToranpuStrings = {
  gameHearts: string;
  gameSpades: string;
  gameEuchre: string;
  gameCribbage: string;
  gameOhHell: string;
  gameCrazyEights: string;
  gameGoFish: string;
  gameBigTwo: string;
  gamePresident: string;
  gameGinRummy: string;
  gameWar: string;
  saysHearts: string;
  saysSpades: string;
  saysEuchre: string;
  saysCribbage: string;
  saysOhHell: string;
  saysCrazyEights: string;
  saysGoFish: string;
  saysBigTwo: string;
  saysPresident: string;
  saysGinRummy: string;
  saysWar: string;
  suitS: string;
  suitH: string;
  suitD: string;
  suitC: string;
  rank1: string;
  rank11: string;
  rank12: string;
  rank13: string;
  cardName: string;
  offerPlay: string;
  offerPlaySuit: string;
  offerPassCards: string;
  offerPass: string;
  offerCrib: string;
  offerGive: string;
  offerDraw: string;
  offerTakeDiscard: string;
  offerDiscard: string;
  offerKnock: string;
  offerOrder: string;
  offerCall: string;
  offerBid: string;
  offerBidNil: string;
  offerAsk: string;
  offerTurn: string;
  didPlay: string;
  didPlaySuit: string;
  didPassCards: string;
  didPass: string;
  didCrib: string;
  didGive: string;
  didDraw: string;
  didTakeDiscard: string;
  didDiscard: string;
  didKnock: string;
  didOrder: string;
  didCall: string;
  didBid: string;
  didBidNil: string;
  didAsk: string;
  didTurn: string;
  hidPassCards: string;
  hidCrib: string;
  hidGive: string;
  recordHead: string;
  recordOver: string;
  recordGoing: string;
  listJoin: string;
  seatName: string;
  /** The command line's help, whole. */
  cliUsage: string;
  cliUnknown: string;
  cliNeeds: string;
  cliTryHelp: string;
  cliNoCommand: string;
  cliNoGame: string;
  cliSeedBad: string;
  cliPlayersBad: string;
  cliSizeBad: string;
  cliHandsBad: string;
  cliLangBad: string;
  cliBoth: string;
  cliFresh: string;
  cliGameLine: string;
  cliHand: string;
  cliRest: string;
  cliTurned: string;
  cliNoSave: string;
  cliNotSaved: string;
  cliSavedOver: string;
  cliSavedGoing: string;
  cliPlayed: string;
  cliScores: string;
  pagePitch: string;
  pageName: string;
  pageNameLink: string;
  pageFoot: string;
  pageChoose: string;
  pagePlayers: string;
  pageSeed: string;
  pageDeal: string;
  pageYourHand: string;
  pageYou: string;
  pageComputer: string;
  pageCards: string;
  pageScore: string;
  pageBid: string;
  pageTricks: string;
  pageBooks: string;
  pageTrick: string;
  pageLastTrick: string;
  pageToBeat: string;
  pageCount: string;
  pageDiscard: string;
  pageSuitToFollow: string;
  pageTurnedUp: string;
  pageTrump: string;
  pageStarter: string;
  pageStock: string;
  /** War at the table: the turn the game is at, who took the last turn's cards, and how many wars it took. */
  pageWarTurn: string;
  pageWarTook: string;
  pageWarWars: string;
  pageWarDraw: string;
  pageThinking: string;
  pageYourTurn: string;
  pageYourTurnPick: string;
  pageYourTurnPass: string;
  pageYourTurnCrib: string;
  pageYourTurnGive: string;
  pageOver: string;
  pageLog: string;
  pageLogStart: string;
  pageRules: string;
  pageDeck: string;
  pageDeckNote: string;
  pageShuffle: string;
  pageHands: string;
  pageEach: string;
  /** The demo deck: how long each seat waits after the one before when the cards are dealt again, and a time in milliseconds. */
  pageSeatAfter: string;
  pageMs: string;
  pageDeckCode: string;
  pageLeft: string;
  pageKeep: string;
  pageKeepNote: string;
  pageAsCode: string;
  pageAsJson: string;
  pageAsText: string;
  pageAsCsv: string;
  pageCopy: string;
  pageCopied: string;
  pageCopyFailed: string;
  pagePaste: string;
  pagePasteHint: string;
  pageRead: string;
  pageReadBad: string;
  pageApi: string;
  pageApiIntro: string;
  pageBack: string;
  pageDeckSeed: string;
  pageToPlay: string;
  pageSound: string;
  pageSounds: string;
  pageSoundsNote: string;
  pageSoundShuffle: string;
  pageSoundDeal: string;
  pageSoundFlip: string;
  pageSoundPlay: string;
  pageSoundGather: string;
  pageSoundFan: string;
  pageBacks: string;
  pageBacksNote: string;
  pageBackClassicRed: string;
  pageBackClassicBlue: string;
  pageBackInkDots: string;
  pageBackColour: string;
  pageBackOwnColour: string;
  pageBackMark: string;
  cardRedJoker: string;
  cardBlackJoker: string;
  /** The extras of a deck: a rules card of each game, and the blank. */
  cardRulesHearts: string;
  cardRulesSpades: string;
  cardBlank: string;
  /** What a rules card says: its game's name at the head, then five short lines, one to a line of the text. */
  rulesHeartsTitle: string;
  rulesHearts: string;
  rulesSpadesTitle: string;
  rulesSpades: string;
  /** The branding panel: a site's own backs, faces for the standard cards, and cards no deck has. */
  pageBranding: string;
  pageBrandingNote: string;
  pageBrandingTurn: string;
  pageBrandingTerritories: string;
  pageBrandingKings: string;
  pageBrandingBacks: string;
  pageBrandingSlot: string;
  pageDesigns: string;
  pageDesignsNote: string;
  pageDesignPlain: string;
  pageDesignFourColour: string;
  pageDesignEnglish: string;
  pageDesignRealistic: string;
  cardFaceDown: string;
  /** A card that carries a mark, as a screen reader hears it: its name, or that it is face down. */
  cardMarked: string;
  pageOneCard: string;
  pageOneCardNote: string;
  pageCardPick: string;
  pageAsElement: string;
  pageAsPicture: string;
  handLabel: string;
  handFaceDown: string;
  handScrunched: string;
  /** A hand squared up face up: its top card, and never how many. */
  handSquared: string;
  pageHide: string;
  pageHideNote: string;
  pageHideAll: string;
  pageHideOneByOne: string;
  pageShowHand: string;
  pageScrunch: string;
  /** The demo hand: sorted by rank, grouped by suit, and back as dealt. */
  pageSort: string;
  pageGroup: string;
  pageUnsort: string;
  /** The demo hand: mixed up, a card tossed out, a card replaced, and where a new one lands. */
  pageMix: string;
  pageToss: string;
  pageReplace: string;
  pageLands: string;
  pageAtEnd: string;
  pageAtFront: string;
  pageSpread: string;
  pageNewHand: string;
  /** The demo hand's rows of controls, each named by what its buttons do. */
  pageRowTurn: string;
  pageRowGather: string;
  pageRowOrder: string;
  pageRowChange: string;
  pageRowMark: string;
  /** The card the one-card controls act on. */
  pageWhichCard: string;
  /** The demo hand: one card turned over, parted out and closed up again, grouped by face, marked, spun. */
  pageToggle: string;
  pageToggleAll: string;
  pagePart: string;
  pageUnpart: string;
  pageGroupFace: string;
  pageMark: string;
  pageUnmark: string;
  pageSpin: string;
  pageSpinAll: string;
  pageClockwise: string;
  pageAnticlockwise: string;
  pageReveal: string;
  pageRevealNote: string;
  pageClosed: string;
  pileFaceDown: string;
  pileFaceUp: string;
  pileEmpty: string;
  pagePiles: string;
  pagePilesNote: string;
  /** The demo's panel for <toranpu-table>: its heading, its note, and the game chosen for it. */
  pageTablePanel: string;
  pageTablePanelNote: string;
  pageTableGame: string;
  pageMessiness: string;
  pagePileSeed: string;
  pageDrawCard: string;
  pageStockPile: string;
  embedTurn: string;
  embedBad: string;
  pageEmbed: string;
  pageEmbedNote: string;
  pageEmbedCards: string;
  pageEmbedSize: string;
  pageSizeSmall: string;
  pageSizeMedium: string;
  pageSizeLarge: string;
  pageAsFrame: string;
  pageAsTag: string;
};

export { STRINGS } from "./strings.data.ts";

/** Put values into a string's braces: `fillIn("Bid {n}", { n: 3 })` is "Bid 3". A brace with no value is left as it is.
 *
 * @param template - The text with named braces to fill.
 * @param values - Replacement values keyed by the braces in the template.
 * @returns Put values into a string's braces: `fillIn("Bid {n}", { n: 3 })` is "Bid 3". A brace with no value is left as it is.
 *
 * @example
 * ```ts
 * import { fillIn } from "@johnmorrisdotca/toranpu";
 *
 * console.log(fillIn("Seat {seat}: {name}", { seat: 1, name: "Aki" }));
 * ```
 */
export function fillIn(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/** The language a tag such as `ja-JP` or `en_US.UTF-8` names: Japanese for anything that starts `ja`, English otherwise.
 *
 * @param tag - The language tag or custom-element tag specified by the call.
 * @returns The language a tag such as `ja-JP` or `en_US.UTF-8` names: Japanese for anything that starts `ja`, English otherwise.
 *
 * @example
 * ```ts
 * import { languageOf } from "@johnmorrisdotca/toranpu";
 *
 * console.log(languageOf("ja-JP"));
 * ```
 */
export function languageOf(tag: string | null | undefined): Language {
  return String(tag ?? "")
    .toLowerCase()
    .startsWith("ja")
    ? "ja"
    : "en";
}
