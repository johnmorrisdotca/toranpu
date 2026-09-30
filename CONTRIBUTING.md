# Contributing to Toranpu

Thank you for helping. Bug reports, ideas and pull requests are all welcome.

## Reporting a bug

Open an issue with the game, the number of players, the seed and what
happened. A seed and the moves reproduce any game exactly, so the quickest
report is the demo's address (it carries the game, the players and the seed)
or the text from `encode`, with a line on what you expected instead.

## Making a change

```sh
git clone https://github.com/johnmorrisdotca/toranpu
cd toranpu
pnpm install
pnpm check            # lint, types and tests: the same as CI
pnpm test:demo        # the demo in real browsers: builds it, then plays it by taps
pnpm test:cli         # the command line, run as a child process
pnpm test:package     # npm pack, install the tarball, import every entry, run the command
pnpm test:frameworks  # React, Vue, Svelte, Angular and a plain page, built from the tarball
pnpm site             # builds the demo and the API reference into ./site
pnpm dlx serve site   # or any static server
```

- **Keep the rules pure.** Every function takes plain data and returns new
  plain data, leaving what it was given alone. No classes, no mutation, no
  timers, no DOM, no dependencies.
- **Test the rule you change.** Tests sit beside their source as `*.test.ts`.
  A rule change needs a test that deals the position it is about.
- **Check the rule against a source, and say so.** `docs/games.md` says which
  rules each game is played by, in our own words, with a link. A change to a
  rule changes that page in the same pull request, and `src/docs.test.js`
  holds its figures to the code. Do not copy a rulebook's text.
- **Never break a seed.** A saved game is its seed and its moves, so
  `seededRandom`, `shuffled` and each game's dealing must deal the same cards
  for the same seed for ever. `random.test.ts` pins the stream, and
  [Tane's specification](https://github.com/johnmorrisdotca/tane/blob/main/docs/spec.md)
  has the vectors it must give.
- **Never break a save.** A game written by an older version must read back.
  A new shape of save is a new `format`, and the old one is still read.
- **A computer sees only its seat.** Each computer reads a view of the game
  built for it (`heartsView` and so on). Never give one another player's hand.
- **A new game** answers `CardGameRules`, joins `CARD_GAME_RULES`,
  `CARD_GAME_TABLES` and the entry points, and passes the simulation in
  `cardGames.simulation.test.ts`: computers alone finish every table, every
  seat can win, the computer beats random play, and a save reads back. It
  also needs its name and its line in `src/strings.ts`, its moves in
  `moveText`, and its section in `docs/games.md`.
- **Nothing played for stakes.** No bets, chips or payouts: children use the
  site this was built for.
- **Words go in `src/strings.ts`**, in English and Japanese, then
  `pnpm docs:make` to bring `docs/strings-ja.md` up to date. Japanese is plain
  and polite, and uses the words Japanese card players use: トリック, 切り札,
  ビッド, 手札, 山札, 捨て札.
- **Examples in the README are run by `src/docs.test.js`.** Change a number in
  one and the other has to follow. The framework examples are the components
  `scripts/check-frameworks.mjs` builds, to the letter.
- **Every export gets a doc comment.** A test fails without one, and the API
  reference on the demo site is made from them (`scripts/api.mjs`).
- **The demo is tested by playing it.** `e2e/*.demo.mjs` are Playwright tests
  that open the built demo in Chromium and WebKit, at a phone's width by touch
  and at a desktop's by mouse, and play each game by tapping. After every flow
  they check that nothing is wider than the screen, nothing to tap is under
  44px, and the page complained of nothing. The first time,
  `pnpm exec playwright install chromium webkit` fetches the browsers.
- **`demo/family.css` and `scripts/family-template.mjs` are the family's**, the
  same in every sibling package. Do not edit them here: a test holds each to
  its hash. What is Toranpu's own goes in `demo/site.css`.
- One change per pull request, with a line in `CHANGELOG.md` under
  *Unreleased*.

## Releasing

Maintainers bump the version in `package.json` and `src/version.ts`, and move
*Unreleased* to the new version in `CHANGELOG.md`, dated. Pushing the tag
`vX.Y.Z` runs the Release workflow, which checks that the tag matches
`package.json`, runs the checks, builds and packs the package with npm,
installs that tarball into an empty project and uses it, attaches the tarball
to a GitHub release, and publishes it to npm with provenance, through npm's
trusted publishing (no token is kept). A version already on npm is not
published again. The workflow can also be run by hand.
