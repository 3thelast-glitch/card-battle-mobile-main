# Components

Each component does one thing.

---

| Component | Does |
|---|---|
| `CardTile` | Shows a card in the selection grid. |
| `DeckSlot` | Shows an empty or filled deck position. |
| `BattleCard` | Shows the active card in the arena. |
| `StatBadge` | Displays one stat: ATK, DEF, or HP. |
| `HPBar` | Shows current HP. Changes color as HP drops. |
| `RoundCounter` | Shows current round and total. |
| `ScoreBoard` | Shows player score vs bot score. |
| `ResultBanner` | Shows the round or match outcome. |
| `ActionButton` | The one button the player needs to press. |

---

## Rules

- No component owns logic. Logic lives in the game layer.
- Every component must work with any card data.
- `BattleCard` is the most important component. It must always be readable.
