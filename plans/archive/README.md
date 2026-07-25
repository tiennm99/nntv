# Archived plans

Completed work programs. Each directory holds the plan and the reports produced
while executing it, so the reasoning behind a change stays with the change.

Active plans live one level up in `plans/`; new reports go to `plans/reports/`.

| Plan | Date | Outcome |
|---|---|---|
| [260725-2208-playable-hard-offline](260725-2208-playable-hard-offline/plan.md) | 2026-07-25/26 | Made the stealth mechanics actually execute, retuned levels 1–11, added offline play, responsive UI, and a hint system. |

## Why the reports are kept

The audits record measurements that are expensive to reproduce and hard to
believe without evidence — most importantly that, before this work, deleting
every guard from every level changed the optimal solution by zero moves, and
the final playable level could be beaten by walking down the left edge and
across the bottom. If a future change makes levels feel flat again, the
ablation numbers in `puzzle-design-difficulty-audit-*` and
`from-level-retune-phase3-*` are the baseline to compare against.
