# Contributing

Thank you for helping. Bug reports, ideas, corrections to the Japanese and pull
requests are all welcome.

This first part is the same in every package of the family. It is the master
text kept in
[johnmorrisdotca/.github](https://github.com/johnmorrisdotca/.github/blob/main/CONTRIBUTING.md),
copied unchanged into `scripts/community/CONTRIBUTING.md`, and a test holds
this file to that copy. What is particular to the package follows it, under
the heading "Particular to" and the package's name.

## Before you start

Open an issue first for anything bigger than a typo, so that we can agree on the
shape before you spend time on it. Taking part follows the
[Code of Conduct](CODE_OF_CONDUCT.md); report a security concern privately, as
[SECURITY.md](SECURITY.md) says.

## Making a change

```sh
pnpm install
pnpm check          # lint, types and tests: the same as CI
pnpm test:package   # pack it as npm does, install it in an empty project, import every entry
pnpm site           # build the demo into ./site, as GitHub Pages publishes it
```

The package's own further commands (its browser tests, its command line, its
data scripts) are listed under its own heading below.

## House rules, shared by every package of the family

- **No runtime dependencies.** Development dependencies are for tests, builds and
  documentation only.
- **The core is pure.** Every function in it returns new values and never
  changes what it was given.
- **Test what you change.** Tests sit beside the code they test. A rule you
  change has a test that would have caught it.
- **Words a person reads come in English and Japanese.** If you cannot write the
  Japanese, say so in the pull request and someone will.
- **Option values and names are kebab case.**
- **Art and sound are CC0 or public domain only**, checked at the source and
  credited. Data and word lists may be under another licence that lets them be
  shipped, with its notice kept in `NOTICE.md`. No GPL or LGPL code.
- **Needs Node 22 or later.**
- **A README table, example or count that a test holds to the code** changes
  together with the code.
- **The family's own files are the same in every package**: `demo/family.css`,
  `scripts/family-template.mjs`, `scripts/family-readme.mjs`,
  `scripts/release-notes.mjs`, the files in `scripts/community/` and
  `family.test.js` (in `src/`, or in `test/`). Do not edit one here. To change
  one, change it in every repository at once, bump `FAMILY_TEMPLATE_VERSION` for
  the template, and record the new hash in `family.test.js`. What is the
  package's own goes in its own stylesheet, `demo/<name>.css`, and its page
  builder, `scripts/site.mjs`.
- **The list of the family in the README is made, not written.**
  `pnpm family:readme` writes it between its markers from
  `scripts/family-template.mjs`.
- **The workflows are the family's too.** `ci.yml` runs `pnpm check`, the demo's
  browser tests and the packed package on Linux, macOS and Windows; `pages.yml`
  is the same text in every package. A package adds jobs of its own after those.

## Pull requests

One change per pull request. Say what changed and how you checked it, and add a
line to `CHANGELOG.md` under **Unreleased**: for a change a user would notice,
and for one to the repository alone.

## Releasing

Maintainers bump the version in `package.json` (and in `src/version.ts`, where
the package has one), move *Unreleased* to the new version in `CHANGELOG.md`,
dated, push, wait for CI and tag `vX.Y.Z`, the same as `package.json`'s version.
The Release workflow (`.github/workflows/release.yml`) checks and builds the
package, attaches the tarball to a GitHub release and publishes it to npm by
trusted publishing, with provenance and no token. A version already on npm is
not published again.

## Particular to Toranpu

### Reporting a bug

Open an issue with the game, the number of players, the seed and what
happened. A seed and the moves reproduce any game exactly, so the quickest
report is the demo's address (it carries the game, the players and the seed)
or the text from `encode`, with a line on what you expected instead.

### Commands and rules

```sh
pnpm check            # lint, types and tests: the same as CI
pnpm test:demo        # the demo in real browsers: builds it, then plays it by taps
pnpm test:cli         # the command line, run as a child process
pnpm test:package     # npm pack, install the tarball, import every entry, run the command
pnpm test:frameworks  # React, Vue, Svelte, Angular and a plain page, built from the tarball
pnpm site             # builds the demo and the API reference into ./site
```

Two commands remake what is made from outside material, and are run by hand,
once, not in CI: `node scripts/sounds-cut.mjs <Audio folder>` then
`pnpm sounds` remake the card sounds from Kenney's Casino Audio pack (on a
Mac: it uses `afconvert`), and `node scripts/designs.mjs <folder>` remakes the
English pattern from Dmitry Fomin's files on Wikimedia Commons, and
`node scripts/designs-realistic.mjs <folder>` the realistic design from Byron
Knoll's (both need svgo, installed for the run and not kept). Anything new
from outside must be CC0 or public domain, read at its source, and named in
[docs/credits.md](./docs/credits.md) with the date it was checked; a test
holds each file to that page. Nothing GPL or LGPL.

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
