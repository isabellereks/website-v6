# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Isabelle Reksopuro uses the site as her personal portfolio. Its main audience reviews her work
at the intersection of technology and public policy. The `/wa-resource-banner` route is for
public-health, advocacy, legislative, college, and college-IT stakeholders reviewing a working
abortion-resource banner concept.

## Product Purpose

The site presents Isabelle's work and provides stable links to project demonstrations. The
Washington resource-banner mock shows how a public college could point students to official
abortion resources with minimal implementation work.

## Positioning

The portfolio demonstrates policy work through interactive, inspectable projects. The resource
banner is a Washington State Department of Health-led experience maintained by Advocates for
Youth and adapted to each college website's assigned region without using a student's location.

## Operating Context

The site is a Next.js application served over HTTPS. The banner mock may be shared with
legislative, advocacy, public-health, and college-IT stakeholders.

## Capabilities and Constraints

- The banner mock lives on a separate route and must not alter the portfolio homepage.
- Washington State Department of Health is the source for health information.
- Advocates for Youth is presented as the banner maintainer.
- The resource label is selected from a college-hostname-to-region table only.
- The experience does not use IP geolocation, GPS, cookies, forms, analytics, ads, or health
  data.
- Unknown hostnames fall back to statewide Washington resources.
- The route is a working mock and should not be indexed by search engines.

## Brand Commitments

The portfolio uses a restrained editorial interface with direct, plainspoken copy. The banner
mock preserves the separately approved Advocates for Youth-inspired blue, yellow, and pink
palette without copying the organization's logo.

## Evidence on Hand

- An approved working banner mock and implementation from the earlier portfolio repository.
- Washington State Department of Health abortion and privacy resource pages.
- The current portfolio's project, writing, and biographical content in this repository.

## Product Principles

- Make public-policy work understandable through concrete demonstrations.
- Keep the main action and information provenance obvious.
- Collect no location or health data for the resource banner.
- Preserve stable, shareable project URLs as the portfolio evolves.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Support keyboard navigation, visible focus, semantic structure, reduced
motion preferences, and responsive layouts without horizontal scrolling.
