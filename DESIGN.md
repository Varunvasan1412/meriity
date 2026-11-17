---
name: Meriity
description: Melbourne growth partner. Trust made visible, staged with studio-grade motion.
colors:
  violet-deep: "#2f057b"
  violet-night: "#1a0347"
  violet-raised: "#3d0f94"
  violet-signal: "#6441c1"
  lavender: "#7360f2"
  lilac: "#cfc6f7"
  lilac-wash: "#e9e4fb"
  ground: "#f5f3fb"
  paper: "#ffffff"
  ink: "#1c0a3f"
  ink-soft: "#4b3d6b"
  coral: "#fb4b51"
  coral-deep: "#d92f36"
  coral-soft: "#ffb3b5"
  mint: "#2e9e74"
  amber: "#c27a12"
  on-violet: "#f4f0ff"
  on-violet-soft: "#c4b8ec"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7.6vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
    fontVariation: "\"opsz\" 96, \"wdth\" 100"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 2.4vw, 2.4rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.25
rounded:
  row: "16px"
  panel: "28px"
  card: "32px"
  stage: "48px"
  pill: "9999px"
spacing:
  gutter: "16px"
  gutter-md: "24px"
  section: "112px"
  section-md: "160px"
  container: "1320px"
components:
  button-primary:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.coral-deep}"
  button-ink:
    backgroundColor: "{colors.violet-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  button-ink-hover:
    backgroundColor: "{colors.violet-raised}"
  button-ghost-light:
    textColor: "{colors.on-violet}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-ghost-dark:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  panel:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "24px"
  field-on-violet:
    textColor: "{colors.on-violet}"
    rounded: "{rounded.row}"
    padding: "16px 20px"
  rating-chip:
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Meriity

## Overview

**Creative North Star: "The Trust Instrument"**

Meriity's world is two materials and one signal. A cool violet-white ground carries reading; deep Meriity violet fields own whole sections and are joined to the ground by soft curved shoulders rather than straight seams. Coral is the signal: it marks what to press and the single word the brand is about, and almost nothing else. Everything is set big. Headlines are heavy Bricolage Grotesque, tight-tracked, and arrive word by word out of blur, so the page reads as set type resolving into focus rather than as a stack of cards.

Density is low and confident: generous section padding, a 1320px container, one idea per band. Surfaces are large rounded panels (28 to 48px) that sit on the ground or on violet with soft, deep, violet-tinted shadows. Rules are hairlines. Motion is inertial and continuous (Lenis smooth scroll, scroll-scrubbed reveals, pinned horizontal tracks, sticky stacks), always on one expo-out curve, and always fully disabled under reduced motion with content visible by default.

The signature is something the visitor operates: the live Trust Check, a white panel of touchpoint rows with three-state chips and a score dial. Interaction, not illustration, carries the proof.

**Key Characteristics:**
- Light ground with deep-violet sections joined by curved notches.
- Coral reserved for action, the word "trust", and focus.
- Heavy Bricolage display type at -0.02em, resolving out of blur.
- Large rounded panels (28 to 48px) and pill buttons; hairline rules between rows.
- One easing curve, expo-out, for every transition and scroll effect.

## Colors

A two-field palette: deep violet and violet-white, with coral as the only warm voice.

### Primary
- **Meriity Deep Violet** (violet-deep): owns whole sections (hero, services, closing panel), the final framework card, the ink button, avatar discs, and the hover fill that rises behind industry rows.
- **Violet Night** (violet-night) and **Raised Violet** (violet-raised): atmosphere only. Large blurred blooms inside violet fields, and the ink button's hover state. The hero bloom stays within these brand violets.

### Secondary
- **Signal Violet** (violet-signal): the accent word in light-ground headlines ("Proof, *not promises*"), touchpoint hover, small labels on white panels, and one of the four result-card tones.
- **Lavender** (lavender): secondary signal; nav link hover wash at 15% and the large stage numeral on the dark framework card.
- **Lilac** (lilac) and **Lilac Wash** (lilac-wash): accent words on violet fields, stage numerals on white cards, the framework band background, testimonial and result card tones, the score dial track.

### Tertiary
- **Meriity Coral** (coral): primary buttons, the word "trust" in headlines, the "More industries" tile, the logo mark, focus rings, form focus and invalid rings, text selection, the framework progress line, hover arrows that point toward a destination, and the chevrons in the closing marquee.
- **Deep Coral** (coral-deep): hover state for coral fills; text of the "Needs work" chip.
- **Soft Coral** (coral-soft): check marks and error text on violet fields, where full coral would vibrate.

### Neutral
- **Violet-White Ground** (ground): page background and the inset rows inside the Trust Check.
- **Paper** (paper): panels and cards on the ground or on violet.
- **Violet Ink** (ink): all text on light surfaces; hairlines at 10 to 15% opacity.
- **Soft Ink** (ink-soft): body copy and secondary lines on light surfaces.
- **On-Violet** (on-violet) and **On-Violet Soft** (on-violet-soft): text and body copy on violet fields; white at 10 to 15% for hairlines there.
- **Mint** (mint) and **Amber** (amber): status only, in the Trust Check ("Solid", "Patchy") and the dial when the score is strong.

### Named Rules
**The One Warm Voice Rule.** Coral is the only warm color and it means "act here" or "trust". It never fills a section, a card background (the single exception is the "More industries" tile, which is itself a call to action), or a headline word other than "trust".

**The Two Fields Rule.** A section is either ground or deep violet, never a gradient between them. The seam between them is a curved notch filled with the next section's color.

## Typography

**Display Font:** Bricolage Grotesque (with system-ui, sans-serif), variable, opsz 96, wdth 100
**Body Font:** Hanken Grotesk (with system-ui, sans-serif)

**Character:** A heavy, slightly quirky grotesque for everything that should be read from across the room, paired with a calm, even grotesque for everything that should be read closely.

### Hierarchy
- **Display** (800, clamp(3rem, 7.6vw, 6rem), 0.95): the hero statement. Results uses a larger cut, up to 7.5rem; the closing marquee runs up to 9.5rem.
- **Headline** (800, clamp(2.6rem, 6vw, 5.5rem), 0.95): every section title, with one accent phrase in signal violet or lilac.
- **Title** (800, 1.5 to 2.4rem, 0.95; quotes and statements loosen to 1.05 to 1.15): card names, stage names, touchpoints, industry rows, service rows.
- **Body** (400, 17 to 18px, 1.625): intros and card copy, held to 34 to 58ch.
- **Label** (600, 13 to 15px): buttons, chips, footer column heads, small meta lines. Sentence case, no tracking, never uppercase.

### Named Rules
**The Every-Display-Is-Bold Rule.** Anything set in Bricolage is weight 800 at -0.02em with balanced wrapping. There is no light or medium display; size alone creates the hierarchy.

**The Resolve Rule.** Section headlines enter word by word from blur(14px), 40% below, staggered 0.07s, on expo-out. The text is in the DOM and visible without JavaScript.

## Layout

A single 1320px container with 16px gutters (24px from md). Sections breathe at 112px vertical padding, 160px from md. Headline blocks are asymmetric two-column grids (roughly 1.2 to 1.4fr against 1fr) with the intro paragraph bottom-aligned to the headline. Lists are full-width rows separated by hairlines, not grids of equal cards. On large screens the framework pins to the viewport and its cards travel as a horizontal track with a coral progress line; results stack as sticky cards offset 18px each, each receding to 90% scale and 85% brightness as the next slides over. Testimonials sit on a 12-column grid as overlapping offset panels with negative top margins. Everything collapses to a single column on mobile, with pinning and stacking released.

## Elevation & Depth

Depth is ambient and violet-tinted. Shadows are long, soft and pulled in by a negative spread so panels feel lifted off the field rather than outlined. Flat surfaces (rows, hairline lists, the ground) carry no shadow; only floating panels and the scrolled nav do. Inside violet fields, depth comes from huge blurred blooms of violet-night and raised violet plus a 3.5% white chevron watermark.

### Shadow Vocabulary
- **Instrument lift** (`box-shadow: 0 40px 80px -30px rgba(10,0,40,0.6)`): a white panel floating on deep violet (the Trust Check).
- **Card stack** (`box-shadow: 0 30px 60px -30px rgba(28,10,63,0.35)`): large cards on the ground (results).
- **Floating chrome** (`box-shadow: 0 12px 40px -12px rgba(47,5,123,0.25)`): the nav pill once scrolled, with white at 85% and backdrop blur.
- **Menu sheet** (`box-shadow: 0 24px 60px -20px rgba(47,5,123,0.35)`): the mobile menu panel.

### Named Rules
**The Tinted Shadow Rule.** Shadows are always violet or violet-black, never neutral grey, and always negative-spread.

## Shapes

Generously rounded and soft. Pills (fully rounded) for every button, chip, nav link and the nav bar itself. Rows and inputs at 16px. Panels at 28px, large cards at 32px, and the closing stage at 36px (48px from md). Section seams are a single organic SVG shoulder (a 64px-tall curve) filled with the next section's color, flipped vertically at the top of a violet band. Rules are 1px hairlines at 10 to 15% of the text color; the only heavier rule is the 2px violet bar above each "why" point. The Meriity chevron (two stacked chevrons) is the one recurring brand glyph, used as a watermark and as the marquee separator.

## Components

### Buttons
Confident pills with a kinetic arrow.
- **Shape:** fully rounded (9999px).
- **Primary:** coral fill, white label, 14px 24px, 15px semibold.
- **Hover / Focus:** fill deepens to deep coral over 300ms; the arrow exits right while a twin enters from the left (500ms, expo-out). Focus is a 2px coral outline at 3px offset.
- **Ink:** deep-violet fill for secondary actions inside white panels; hover to raised violet.
- **Ghost light / dark:** text-only with a 1px inset ring at 40% (light) or 25% (dark) that strengthens to full on hover.

### Chips
- **Style:** small pills (12px semibold, 4px 10px) with a 1px inset ring.
- **State:** unselected is soft ink at 70% with a transparent ring; selected takes a 12% tint and 30% ring of its status color (coral-deep for "Needs work", amber for "Patchy", mint for "Solid").

### Cards / Containers
- **Corner Style:** 28px panels, 32px cards, 36 to 48px stage.
- **Background:** paper on ground or violet; result tones cycle paper, lilac wash, deep violet, signal violet; testimonial tones cycle lilac, paper, lilac wash.
- **Shadow Strategy:** see Elevation; only floating panels and stacked cards cast.
- **Border:** none.
- **Internal Padding:** 24px compact, 28px default, 40 to 48px from md.

### Inputs / Fields
- **Style:** on violet, a 16px-radius field at white 6% with a 1px inset ring at white 15%, 16px text, 16px 20px padding, labels visually hidden with placeholder prompts.
- **Focus:** background lifts to white 9% and the ring becomes 2px coral.
- **Error / Disabled:** invalid fields take the coral ring; error text in soft coral beneath. Disabled buttons drop to 60% opacity.

### Navigation
A floating pill fixed 12 to 16px from the top. Transparent over the violet hero with on-violet links; after 40px of scroll it becomes white at 85% with backdrop blur and floating-chrome shadow, links turn ink. Links are 14.5px medium pills with a lavender 15% hover wash. Below lg, a round menu button opens a white 28px sheet listing links in display type.

### Trust Check (signature)
A white 28px panel: verdict title in display, a signal-violet sublabel, and a 76px score dial (7px stroke, lilac-wash track, coral or mint arc drawn over 1200ms expo-out). Below, five ground-colored 16px rows each holding a touchpoint name, its question, and three rating chips. The score updates live and is announced politely.

### Hairline Row List
Services and industries are full-width rows between hairlines. On hover, service names slide 12px right and brighten; industry rows fill from the bottom with deep violet while their text inverts and a coral arrow slides in.

## Do's and Don'ts

### Do:
- **Do** give each section one field, ground or deep violet, and join opposite fields with the curved notch.
- **Do** keep coral to buttons, the word "trust", focus rings, and arrows that lead somewhere.
- **Do** set every display line in Bricolage 800 at -0.02em, and let section headlines resolve out of blur on expo-out (cubic-bezier(0.16, 1, 0.3, 1)).
- **Do** use pills for every action and 28 to 32px radii for panels and cards.
- **Do** tint every shadow violet and pull it in with negative spread.
- **Do** disable every scroll and reveal animation under prefers-reduced-motion, with content visible by default.

### Don't:
- **Don't** put coral on headline words other than "trust", or use it as a section or card background (the "More industries" call-to-action tile is the only coral surface).
- **Don't** blend violet into the ground with a gradient; the seam is a curve, not a fade.
- **Don't** use grey or neutral black shadows, or hard offset shadows.
- **Don't** set display type at a lighter weight or with positive tracking.
- **Don't** lay out lists as rows of equal icon cards; use hairline rows, pinned tracks, or stacked panels.
- **Don't** set labels in uppercase with wide tracking.
