## 2026-09-27 - Dynamic ARIA state on favorite toggle buttons
**Learning:** Toggle buttons with static ARIA labels (e.g. always reading "Save to favorites") mislead screen reader users when activated.
**Action:** Always provide dynamic `aria-label` (e.g., toggling between "Remove from favorites" and "Save to favorites") and `aria-pressed` attributes based on active state in toggle components.
