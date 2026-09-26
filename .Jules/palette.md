## 2026-09-26 - Accessible Counter Component Pattern
**Learning:** Generic `div` elements used as buttons for counter inputs (like guests, bedrooms, bathrooms) lack screen reader accessibility, keyboard focus states, and visual disabled cues when minimum limits are reached.
**Action:** Always refactor counter controls into semantic `<button type="button">` elements with descriptive `aria-label`s (e.g., `aria-label="Decrease guests"`), `focus-visible:ring-2` focus styling, and explicit `disabled` state handling when `value <= min`.
