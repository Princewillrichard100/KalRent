## 2025-05-18 - Modal Dialog Accessibility and Keyboard Dismiss
**Learning:** Custom overlay modal components often omit essential ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) and keyboard dismissal handling (`Escape` key), preventing screen readers from identifying modal dialogs and hindering keyboard navigation.
**Action:** Ensure custom modal overlay components include standard dialog accessibility semantics, accessible close button labels, focus ring styles, and Escape key listeners.
