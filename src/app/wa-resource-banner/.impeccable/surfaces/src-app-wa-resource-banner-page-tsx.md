---
version: 1
slug: "src-app-wa-resource-banner-page-tsx"
primary_target: "src/app/wa-resource-banner/page.tsx"
related_targets: ["src/app/wa-resource-banner/BannerMock.tsx","src/app/wa-resource-banner/page.module.css"]
---

## Scope and mode

`/wa-resource-banner` is an Operate/Read working mock kept visually separate from the portfolio
homepage.

## Audience and job

Public-health, advocacy, legislative, college, and college-IT stakeholders need to understand
how a lightweight banner could work on a Washington public-college website.

## Task and proof

The visitor selects a college, sees the matching service region, and can follow official
Washington State Department of Health care or privacy links. The simulated campus page proves
the banner's placement and the statewide fallback proves the routing behavior.

## Constraints

Use college-hostname mapping only. No IP geolocation, GPS, cookies, analytics, forms, ads, or
student data. Keep the route `noindex`, preserve Quick exit and keyboard access, and do not imply
an official Advocates for Youth logo.

## Direction and memorable moment

The Useful Campus Notice: one bright yellow strip with a blue care action and pink quick exit,
shown directly inside a simulated college page. The selected college name and region update
together in plain view.

## Unresolved decisions

The production ownership and release process for the maintained college-to-region directory
remain policy and implementation decisions outside this mock.
