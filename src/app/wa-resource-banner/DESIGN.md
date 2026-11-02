---
name: Washington College Resource Banner
description: A bright, plainspoken campus notice for trusted abortion resources.
colors:
  action-blue: "#0076C0"
  notice-yellow: "#FCCB36"
  quick-exit-pink: "#F83180"
  ink: "#0B0B0B"
  paper: "#FFFFFF"
  page: "#F5F5F2"
  line: "#D7D7D2"
typography:
  display:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.65rem, 4vw, 2.55rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  banner-headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.35rem, 3vw, 2rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  section-title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 700
    lineHeight: 1.15
  navigation:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.45
  control-label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 700
    lineHeight: 1.45
  region-label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 700
    lineHeight: 1.45
  small-action:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.78rem"
    fontWeight: 700
    lineHeight: 1.45
  attribution:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.45
  mobile-body:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  square: "0"
spacing:
  compact: "8px"
  control: "16px"
  section: "24px"
components:
  primary-action:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "10px 18px"
    height: "46px"
---

# Design System: Washington College Resource Banner

## Overview

**Creative North Star: "The Useful Campus Notice"**

The route is a faithful port of the approved mock. It should feel like a real resource placed
inside a college website—not an advertisement, portal, or generic software card. The design is
flat, bright, compact, and intentionally separate from the surrounding portfolio identity.

**Key Characteristics:**

- One saturated yellow notice with a blue primary action and pink quick exit.
- Black, plainspoken typography with a serif body voice.
- A simulated college page that makes the implementation context immediately legible.
- No decorative branding that could imply an official organizational logo.

## Colors

The full palette is functional: yellow carries the notice, blue carries the primary action, and
pink is reserved for the quick exit.

**The Assigned-Role Rule.** Never use the three saturated colors as interchangeable decoration;
each color has one job.

## Typography

Arial/Helvetica gives headings, labels, and controls an institutional directness. Georgia/Times
New Roman makes explanatory copy readable and human. Headings are dense and confident; body
copy stays within a comfortable line length.

## Layout

The page uses a centered container with a college preview selector above a simulated campus
page. The banner is a two-column strip on wide screens and a single-column stack below 760px.
The primary action remains visually dominant at both sizes, and the mock never scrolls
horizontally.

## Elevation & Depth

The system is entirely flat. Borders and solid color fields establish separation; there are no
shadows, gradients, blur, or glass effects.

## Shapes

Controls and colored surfaces use square corners. This keeps the banner feeling like a practical
campus notice rather than a promotional card.

## Components

### Resource Banner

The yellow strip contains the headline, help categories, region match, primary and privacy
actions, source attribution, and quick exit. It is the only saturated field at page scale.

### College Preview Selector

A native select with a two-pixel black border changes the simulated college and region. Unknown
hosts demonstrate the statewide fallback.

### Primary Action

A square blue button with white bold text. Hover changes to black; focus uses a high-contrast
purple outline that remains distinct on yellow and blue.

## Do's and Don'ts

### Do:

- **Do** keep the Department of Health source and Advocates for Youth maintenance visible.
- **Do** preserve keyboard focus, Quick exit, responsive stacking, and the statewide fallback.
- **Do** describe the region as belonging to the college website, not the visitor.

### Don't:

- **Don't** use IP geolocation, GPS, cookies, or student data.
- **Don't** add gradients, shadows, glass effects, decorative icons, or nested cards.
- **Don't** recreate or imply an official Advocates for Youth logo.
