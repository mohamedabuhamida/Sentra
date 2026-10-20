# Sentra — Visual Identity & UI Design System

> **Document purpose:** Single source of truth for Sentra's visual identity across presentations, dashboard UI, architecture diagrams, landing pages, and technical documentation.
>
> **Brand descriptor:** AI Gateway & Security
> **Working tagline:** *Intelligent AI Infrastructure. Built Securely.*
> **Status:** Initial v1 direction — review before public/commercial launch.

---

## 1. Brand foundation

### 1.1 Product positioning

Sentra is an intelligent GenAI gateway and security platform that sits between applications and model providers. Its visual language should communicate:

- **Intelligence:** model selection, routing, evaluation, and optimization.
- **Security:** prompt-injection and jailbreak detection, policy enforcement, and sensitive-data protection.
- **Infrastructure:** reliability, observability, provider abstraction, and operational control.

### 1.2 Brand personality

- Technical, precise, and trustworthy.
- Modern and polished, without looking flashy or game-like.
- Calm and readable under dense technical information.
- Product-led: diagrams and metrics should explain the system, not merely decorate it.

### 1.3 Design principles

1. **Clarity before decoration.** Keep visual effects subordinate to content.
2. **One system everywhere.** Slides, dashboard, diagrams, and documentation share the same tokens.
3. **Light-first interface.** Use a bright, neutral workspace with restrained accent colors.
4. **Semantic colors.** Reserve green, amber, red, and blue for meaningful statuses.
5. **Consistent geometry.** Reuse the same radius, spacing, border, and icon rules.
6. **Data integrity.** Any metrics shown in real product screens must come from actual data. Mockups must label illustrative data as sample data.
7. **Accessible contrast.** Do not rely on color alone to communicate status.

---

## 2. Logo direction

### 2.1 Concept

Use a simple geometric symbol that can suggest a secure gateway, a routed path, or an abstract **S**. Pair it with a clean wordmark reading **Sentra**.

### 2.2 Logo variants to prepare

- **Primary horizontal logo:** symbol + Sentra wordmark + optional descriptor.
- **Symbol only:** for the application icon, favicon, and compact sidebar.
- **Light-background version:** dark symbol/wordmark on a light surface.
- **Dark-background version:** light wordmark with the symbol adjusted for contrast.
- **Monochrome version:** for diagrams, print, or low-color contexts.

### 2.3 Logo rules

- Keep clear space around the symbol at least equal to the symbol's inner-unit width.
- Do not stretch, skew, rotate, or add arbitrary effects to the logo.
- Do not place the full logo over a visually busy background.
- Do not bake the tagline into every logo use.
- Treat any generated logo concept as exploratory until recreated as a clean vector and checked at small sizes.

**Important:** The symbol shown in concept mockups is not a finalized trademark-cleared logo.

---

## 3. Color system

The identity uses a light, neutral foundation, a confident blue primary accent, and a violet AI accent. Semantic colors remain separate from brand colors.

### 3.1 Core tokens

| Token                   | Hex         | Intended use                                         |
| ----------------------- | ----------- | ---------------------------------------------------- |
| `background`          | `#F8FAFC` | Main app canvas and slide background                 |
| `surface`             | `#FFFFFF` | Cards, panels, content surfaces                      |
| `surface-muted`       | `#F4F4F5` | Secondary panels and subtle fills                    |
| `border`              | `#E4E7EB` | Dividers, input and card borders                     |
| `text-primary`        | `#0F172A` | Main headings and important values                   |
| `text-secondary`      | `#64748B` | Supporting copy and descriptions                     |
| `text-muted`          | `#94A3B8` | Metadata and low-priority labels                     |
| `brand-primary`       | `#3382F6` | Primary links, selected states, chart series         |
| `brand-primary-hover` | `#2563EB` | Hover state for primary blue                         |
| `brand-ai`            | `#8B5CF6` | AI intelligence, routing, model-selection accents    |
| `brand-teal`          | `#10B981` | Optional restrained accent for healthy system states |
| `dark`                | `#0F172A` | Dark CTA, dark cover panels, high-emphasis elements  |

### 3.2 Semantic colors

| Token              | Hex         | Use                                              |
| ------------------ | ----------- | ------------------------------------------------ |
| `success`        | `#10B981` | Healthy, passed, completed                       |
| `warning`        | `#F59E0B` | Degraded, needs attention, approaching threshold |
| `danger`         | `#EF4444` | Blocked threat, failure, critical security event |
| `info`           | `#3B82F6` | Informational event or neutral notification      |
| `neutral-status` | `#71717A` | Unknown, inactive, or not applicable             |

### 3.3 Status badge recipe

Use a pale background, a subtle border, readable foreground text, and an optional small dot.

| Status  | Background  | Text        | Border      |
| ------- | ----------- | ----------- | ----------- |
| Success | `#ECFDF5` | `#047857` | `#A7F3D0` |
| Warning | `#FFFBEB` | `#B45309` | `#FDE68A` |
| Danger  | `#FEF2F2` | `#B91C1C` | `#FECACA` |
| Info    | `#EFF6FF` | `#1D4ED8` | `#BFDBFE` |
| Neutral | `#F4F4F5` | `#52525B` | `#E4E4E7` |

### 3.4 Color usage rules

- Use neutral backgrounds for at least 80–90% of dashboard surfaces.
- Use blue for primary actions and current selections.
- Use violet selectively for AI-specific functions; do not color every AI-related panel violet.
- Use green only when the status is genuinely healthy or successful.
- Use red for security detections, blocked requests, failures, and critical warnings.
- Keep chart colors consistent across every screen and slide.
- Never use color as the only status indicator; pair it with text or an icon.
- Avoid large, saturated gradients behind dense content.

---

## 4. Typography

### 4.1 Typeface

- **Primary:** Geist Sans.
- **Monospace:** Geist Mono for request IDs, trace IDs, code, tokens, latency samples, and log metadata.
- Use a sensible system sans-serif fallback if Geist is unavailable.

### 4.2 Dashboard type scale

| Role            | Suggested style                          |
| --------------- | ---------------------------------------- |
| Page title      | 24–30 px, bold, slightly tight tracking |
| Section title   | 14–16 px, semibold or bold              |
| KPI value       | 26–32 px, bold                          |
| Body            | 13–14 px, regular or medium             |
| Supporting copy | 12–13 px                                |
| Field label     | 11–12 px, semibold                      |
| Metadata / IDs  | 10–12 px, Geist Mono                    |

### 4.3 Presentation type scale

| Role                | Suggested style |
| ------------------- | --------------- |
| Cover title         | 34–44 pt       |
| Slide title         | 26–32 pt       |
| Section heading     | 18–24 pt       |
| Body                | 16–20 pt       |
| Diagram label       | 12–16 pt       |
| Footnote / citation | 9–11 pt        |

### 4.4 Typography rules

- Keep slide titles short and use sentence case.
- Use one typeface family for most content; reserve monospace for technical identifiers.
- Avoid paragraphs of tiny text. Split dense information across slides.
- Use bold to establish hierarchy, not to emphasize every phrase.
- Keep line lengths comfortable and line spacing generous.

---

## 5. Layout, spacing, and geometry

### 5.1 Spacing scale

Use a consistent 4 px base scale:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80 px`

### 5.2 Radius scale

| Element                 | Radius        |
| ----------------------- | ------------- |
| Small controls / badges | 8–12 px      |
| Inputs / buttons        | 10–12 px     |
| Cards / panels          | 14–18 px     |
| Modals                  | 16–20 px     |
| Pills                   | Fully rounded |

### 5.3 Borders and shadows

- Default border: `1px solid #E4E7EB`.
- Card shadow: extremely subtle; avoid heavy floating-card effects.
- Use stronger shadow only for menus, popovers, and modals.
- Prefer separation through whitespace and borders rather than stacked shadows.

### 5.4 Grid rules

- Use consistent alignment across the entire screen or slide.
- Dashboard desktop layout: navigation sidebar + flexible main content.
- Keep KPI cards equal in height and align values and labels.
- In slides, use a clear grid and generous outer margins.
- Avoid squeezing multiple unrelated diagrams onto one slide.

---

## 6. Iconography and illustration

### 6.1 Icons

- Use a consistent outline icon family, preferably Heroicons Outline or Lucide.
- Navigation icons: approximately 16–20 px, stroke around 1.75–2.
- Action icons: approximately 16 px, stroke around 2.
- Avoid mixing filled, outline, 3D, and hand-drawn icon styles in the same interface.

### 6.2 Illustration style

Use abstract technical illustrations only where they add meaning:

- Layered gateway blocks.
- Model-provider nodes connected by clean paths.
- Security shield or policy boundary.
- Request-flow nodes and directional arrows.
- Observability signals and trace paths.

**Visual style:** clean, geometric, soft blue/violet gradients, subtle glass-like layers, very light shadows, white/light background.

### 6.3 Diagram rules

- Use consistent shapes for consistent concepts: rounded rectangles for services, cylinders only when representing databases, diamonds for decisions.
- Use arrows to show direction of data flow.
- Label each boundary and provider clearly.
- Use blue for standard request flow, violet for AI selection/intelligence, red for blocked or dangerous paths, and green for successful outcomes.
- Include a legend whenever more than three semantic colors appear.
- Ensure diagrams remain understandable in grayscale.

---

## 7. UI component standards

### 7.1 Buttons

**Primary**

- Background: `#0F172A` or `#3382F6` depending on context; choose one per screen hierarchy.
- Text: white.
- Radius: 10–12 px.
- Height: 36–44 px in dashboard UI.
- Hover: slightly darker background; subtle transition.

**Secondary**

- White background, `#E4E7EB` border, `#0F172A` text.
- Same dimensions as primary buttons.

**Ghost**

- Transparent background, muted text, subtle neutral hover fill.

Use blue for the key product action when strong brand recognition is needed; use dark primary actions for restrained admin interfaces. Do not give every button the primary treatment.

### 7.2 Cards and panels

- Background: white.
- Border: `#E4E7EB`.
- Radius: 14–18 px.
- Padding: 16–24 px.
- Shadow: none or very subtle.
- Optional panel header separated by a thin divider.

### 7.3 Inputs and filters

- Background: white or `#F8FAFC`.
- Border: `#E4E7EB`.
- Radius: 10–12 px.
- Focus: blue border and visible focus ring.
- Labels: 11–12 px, medium/semibold.
- Use clear empty, loading, error, and disabled states.

### 7.4 Tables

- Header: subtle neutral fill and medium-weight labels.
- Rows: white, separated by thin horizontal borders.
- Hover: very light neutral fill.
- IDs and technical values: Geist Mono.
- Status: semantic badge with text.
- Provide loading, empty, error, and pagination states.
- Keep row actions consistent and avoid excessive icons.

### 7.5 Dashboard cards

Use KPI cards for a small set of high-value metrics:

- Total requests.
- Threats blocked.
- Average latency.
- Estimated cost savings.

Every metric needs a clear time range and definition. Avoid displaying sample metrics as if they were real.

### 7.6 Modals and notifications

- Modals: white surface, 16–20 px radius, restrained shadow, clear header and footer.
- Toasts: semantic status colors, concise message, dismiss control.
- Respect keyboard focus and Escape-to-close where appropriate.

---

## 8. Presentation design system

### 8.1 Canvas

- Default format: 16:9 widescreen.
- Light background: `#F8FAFC` or white.
- Use a small brand mark in a consistent location on content slides.
- Maintain consistent title, footer, and page-number placement.

### 8.2 Slide types

1. **Cover:** logo, project title, short descriptor, one abstract gateway illustration.
2. **Problem:** concise problem statement with 2–4 key pain points.
3. **Solution:** one central product diagram with short callouts.
4. **Architecture:** layered system diagram with consistent colors and directional arrows.
5. **Request lifecycle:** incoming request → security checks → routing → provider → response evaluation/logging.
6. **Security:** threat categories, detection/policy flow, and response actions.
7. **Intelligent routing:** routing criteria such as cost, latency, capability, and policy.
8. **Evaluation:** metric cards and charts with explicit dataset/test context.
9. **Results:** evidence-led graphs and tables; do not fabricate performance claims.
10. **Limitations and future work:** honest constraints and next steps.
11. **Conclusion:** key contribution and a restrained closing visual.

### 8.3 Slide layout patterns

- **Hero slide:** large title, concise subtitle, illustration occupying one side.
- **Two-column:** explanation on one side, diagram or evidence on the other.
- **Full-width diagram:** for architecture and request flow.
- **Metric slide:** 3–4 aligned metric cards and one chart.
- **Comparison slide:** structured table with limited rows.
- **Section divider:** one short title and abstract brand motif.

### 8.4 Presentation rules

- One central message per slide.
- Prefer diagrams, charts, and short labels over long prose.
- Keep content away from the edges.
- Use blue for primary concepts and violet for AI-specific concepts.
- Use semantic colors consistently for security states.
- Keep source citations and footnotes readable.
- Use the same logo, typography, and palette as the dashboard.

---

## 9. Product UI information architecture

Recommended primary navigation for the platform:

- **Overview** — system health and key operational metrics.
- **Requests** — request logs, filtering, trace details, and latency/cost.
- **Model Routing** — routing policies, selection decisions, and fallback behavior.
- **Security** — prompt injection, jailbreak, PII/secret detection, policy violations, and security events.
- **Providers** — provider configuration, health, limits, and usage.
- **Analytics** — cost, latency, token usage, cache hit rate, and routing outcomes.
- **Playground** — compare models and test prompts/policies.
- **API Keys** — key creation, rotation, scope, and revocation.
- **Settings** — project configuration, members, and access control.

Platform-level admin may additionally need:

- Organizations / workspaces.
- Users and roles.
- Plans and quotas.
- Billing and usage limits.
- Audit log.
- Platform-wide provider and service health.

Keep platform-admin functionality distinct from project/workspace administration if the product supports both roles.

---

## 10. Dashboard layout reference

### Header

- Brand mark and Sentra wordmark.
- Global search.
- Time-range selector.
- Notifications.
- User menu.

### Overview content

- Page title and brief context.
- System health status.
- Four KPI cards.
- Request-flow visualization.
- Provider usage chart.
- Recent requests table.
- Security events feed.

### Dashboard design rules

- Keep the overview scannable.
- Make charts and tables functional, not decorative.
- Include filters and drill-down links for important metrics.
- Display time range, units, and definitions.
- Clearly distinguish platform-wide metrics from workspace-specific metrics.

---

## 11. Motion and interaction

- Default transitions: 150–200 ms.
- Prefer subtle color and opacity transitions.
- Small elevation changes on hover are acceptable; avoid exaggerated movement.
- Loading indicators should communicate ongoing work.
- Use skeletons for large data panels when useful.
- Motion must never be the only indicator of state.
- Respect reduced-motion preferences.

---

## 12. Accessibility and responsive behavior

- Maintain readable text/background contrast.
- Pair status colors with labels/icons.
- Provide visible keyboard focus states.
- Ensure all actions work with keyboard navigation.
- On small screens, collapse the sidebar into a navigation drawer.
- Stack KPI cards and forms on mobile.
- Tables should scroll horizontally or offer a mobile-friendly alternative.
- Keep diagrams legible when scaled down; split large diagrams instead of shrinking labels excessively.

---

## 13. Tailwind CSS v4 token reference

The following is a proposed starting point for `app/globals.css`. Treat these as project tokens and keep component styles consistent with them.

```css
@import "tailwindcss";

@theme {
  --color-sentra-bg: #F8FAFC;
  --color-sentra-surface: #FFFFFF;
  --color-sentra-surface-muted: #F4F4F5;
  --color-sentra-border: #E4E7EB;

  --color-sentra-text: #0F172A;
  --color-sentra-text-secondary: #64748B;
  --color-sentra-text-muted: #94A3B8;

  --color-sentra-primary: #3382F6;
  --color-sentra-primary-hover: #2563EB;
  --color-sentra-ai: #8B5CF6;
  --color-sentra-teal: #10B981;

  --color-sentra-success: #10B981;
  --color-sentra-warning: #F59E0B;
  --color-sentra-danger: #EF4444;
  --color-sentra-info: #3B82F6;

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Suggested root defaults:

```css
:root {
  color-scheme: light;
  --background: #F8FAFC;
  --foreground: #0F172A;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans), Arial, sans-serif;
}
```

### Implementation notes

- Load Geist Sans and Geist Mono through `next/font/google` or package them locally if deployment constraints require it.
- Do not introduce a second competing palette in individual components.
- Use semantic tokens for status colors rather than ad hoc hex values.
- Confirm contrast and focus visibility during implementation.
- If adding dark mode later, define a deliberate dark token set instead of inverting colors mechanically.

---

## 14. Asset checklist

Prepare these assets for a coherent brand package:

- [ ] Primary horizontal logo in SVG and PNG.
- [ ] Symbol-only mark in SVG and PNG.
- [ ] Light and dark logo variants.
- [ ] Favicon and app icon.
- [ ] 16:9 presentation master / slide templates.
- [ ] Color and typography reference page.
- [ ] Architecture diagram shapes and color legend.
- [ ] UI icon set.
- [ ] Dashboard mockup.
- [ ] Landing-page hero illustration.
- [ ] Social/cover image if needed.

Generated visual concepts should be recreated as editable vectors or components before production use.

---

## 15. Brand consistency checklist

Before approving any slide, screen, or diagram, check:

- [ ] Does it use the approved palette?
- [ ] Are headings and body text using the correct type scale?
- [ ] Are margins, spacing, and alignment consistent?
- [ ] Are icon styles consistent?
- [ ] Are semantic colors used correctly?
- [ ] Is there one clear focal point?
- [ ] Are labels readable at presentation size?
- [ ] Are charts labeled with units and context?
- [ ] Are sample values identified as illustrative?
- [ ] Does it feel like Sentra rather than a generic template?

---

## 16. Decisions still open

These are intentional open items and should be confirmed before a public launch:

- Final logo vector and trademark review.
- Domain and brand-name clearance.
- Whether the product will support a full dark theme.
- Finalized presentation copy and verified evaluation results.
- Exact division between platform-admin and workspace-admin permissions.

Until these are resolved, this document is the **working visual identity v1** for Sentra.

---

## Quick reference

- **Brand:** Sentra
- **Descriptor:** AI Gateway & Security
- **Tagline:** Intelligent AI Infrastructure. Built Securely.
- **Primary background:** `#F8FAFC`
- **Surface:** `#FFFFFF`
- **Text:** `#0F172A`
- **Primary accent:** `#3382F6`
- **AI accent:** `#8B5CF6`
- **Success:** `#10B981`
- **Warning:** `#F59E0B`
- **Danger:** `#EF4444`
- **Typography:** Geist Sans + Geist Mono
- **Icon style:** consistent outline icons
- **UI style:** light-first, clean, structured, subtle borders, restrained shadows
- **Presentation:** 16:9, one key message per slide, diagrams over dense prose
