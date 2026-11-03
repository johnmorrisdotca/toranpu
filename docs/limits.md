# Limits

From [the README's Limits section](../README.md#limits): every limit, its value and the constant or function that holds it.

| Limit | Value | Where |
| --- | --- | --- |
| Players | each game's own, from 2 to 8 | `CARD_GAME_TABLES` |
| A game's length | one of the sizes its table offers | `CARD_GAME_TABLES` |
| A seed | a whole number; the games draw 1 to 2,147,483,647 | `randomSeed` |
| The deck the games deal | fifty-two cards, no jokers (the faces draw two) | `DECK_SIZE` |
| A saved game's format | 1 | `SAVE_FORMAT` |
| The id of a card of your own | letters, digits, `-`, `_`, `.` or `:`, up to 40 | `CUSTOM_CARD_ID` |
| The name of a design or a back you register | kebab case, up to 40 characters, never one of the package's own | `registerCardDesign`, `registerCardBack` |
| Words in the middle of a back | twelve characters | `mark` |
| A picture or logo for a back | a `data:image/`, `https:` or same-site address; as an image of its own only `data:image/` loads | `safeImageUrl` |
| Languages | English and Japanese | `STRINGS` |
