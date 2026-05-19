# Memory format (pipe lines)

Store each durable concept on **its own line**. Fields are separated by `|` only—**do not put `|` inside a field** (use `/`, `;`, or rephrase).

## Line shape

```text
t|id|s|w|r
```

| Field | Meaning |
| --- | --- |
| `t` | `d` = decision · `p` = preference · `l` = lesson · `x` = anti-pattern / mistake |
| `id` | Kebab-case slug; reuse the same `id` when updating that concept |
| `s` | One-line summary (~≤140 chars) |
| `w` | Why / trigger; use `-` if empty |
| `r` | Scope (`path`, package, service); use `-` if empty |

**Minimal row (omit trailing empties):** `t|id|s` — same as `t|id|s|-|-`.

## Examples

```text
d|runtime-node|Ship on Node 22 LTS for this monorepo|align with hosting|-
p|avoid-redux|No Redux unless concurrency proves it|-|frontend/
l|stripe-webhooks|Verify signature before any business logic|prod incident|payments/
```

## Placement

Append lines under the right `Brain/` file, or add `Brain/cogo-topic-<theme>.md` when a file gets crowded.

## Skip

Ephemeral tasks, chat filler, duplicates (merge into existing `id`), secrets.
