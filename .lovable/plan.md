## Remove stroke from "AEO Auditor" pill

In `src/pages/Index.tsx`, the hero currently renders:

```tsx
<span className="tag-solid">AEO Auditor</span>
```

The `.tag-solid` utility (in `src/index.css`) applies a 1px border and pill padding. I'll swap it for plain text styling so only the text "AEO Auditor" shows — no border, no pill background.

### Change

**File:** `src/pages/Index.tsx` (hero section, ~line 96)

Replace:
```tsx
<span className="tag-solid">AEO Auditor</span>
```

With:
```tsx
<span className="text-sm font-medium text-foreground">AEO Auditor</span>
```

- Same font/size as before (`tag-solid` was `0.875rem` = `text-sm`).
- Color stays full-strength foreground so it reads as a label, not muted.
- No border, no padding, no pill background.

### Out of scope

- Not touching the `.tag-solid` utility itself in `src/index.css` (other pages may still use it).
- Not touching the second uploaded image (image-28.png) — waiting for your re-upload before doing anything logo-related.