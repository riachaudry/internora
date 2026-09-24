# Internora brand assets

| File | Use |
| --- | --- |
| `logo-full-light.svg` | Full lockup on light backgrounds — website header, offer letter, certificate, LOR |
| `logo-full-dark.svg` | Full lockup on dark backgrounds — footer, dark dashboard header, social covers |
| `logo-icon.svg` | Icon only — app icon, avatars, email header, favicon source |
| `../favicon.svg` | Browser favicon |

The React component at `src/components/Logo.tsx` renders the same mark with a
`variant` prop (`color`, `light`, `dark`) so documents and emails stay consistent.

**Concept.** Three rising bars read as a growth sequence; the tallest is the "I"
of Internora, and the diagonal tying them together forms the "N". No third-party
marks, fonts or clip art are used — everything is drawn from primitives.

**Clear space.** Keep at least the height of the badge's corner radius clear on
all sides. Minimum icon size: 24px. Do not recolour the badge, stretch the
lockup, or place the light variant on a light background.
