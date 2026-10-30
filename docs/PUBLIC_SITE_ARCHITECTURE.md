# TrustRx Public Site Architecture

## Purpose and boundary

TrustRx Public is the institutional front door, not the operational product and
not a health-data intake channel. Its job is to establish understanding and
trust, qualify a conversation, and direct the right visitor to a human-led next
step without exposing private workflow, partner, security, pilot or patient
information.

## Audiences and primary outcomes

| Audience | Question they need answered | Primary action |
|---|---|---|
| Public-health leader | Is this a credible complement to our reporting workflow? | Request a pilot briefing |
| Implementing partner | Can it be adapted to a defined low-connectivity programme? | Discuss an implementation pathway |
| Funder / ecosystem partner | Is the problem, governance model and learning plan serious? | Request a founder briefing |
| Technical reviewer | What is the trust boundary and what is deliberately not claimed? | Read system and trust pages |
| Prospective team member | What is being built and what standards guide it? | Contact TrustRx |

Reporters, patients and the general public are **not** asked to submit health
signals through the public site.

## Initial route map

| Route | Purpose | Readiness |
|---|---|---|
| `/` | Narrative landing page and audience routing | Draft implemented locally |
| `/system` | Field-to-reviewer workflow and product surfaces | Planned |
| `/trust` | Privacy, integrity, human oversight and explicit non-claims | Planned |
| `/pilot` | Pilot scope, engagement process and briefing request | Planned |
| `/research` | Public-safe publications, methods and learning updates | Planned; no private evidence |
| `/about` | Mission, founder story and contact | Planned |
| `/security` | Responsible disclosure route and public-safe security posture | Planned |
| `/privacy` | Website privacy notice | Requires legal review before publication |
| `/terms` | Website terms | Requires legal review before publication |
| `/contact` | Accessible, non-sensitive contact route | Planned |
| `/status` | Future public service-status page; never exposes pilot data | Deferred |

Operational routes, auth, reviewer console, reporter workflows, verification
records and administration live on a separate protected application origin.

## Conversion architecture

Every public page uses one controlled outcome: a pilot/founder briefing. The
contact form or mail link collects only business-contact information needed to
respond. It must state that health data, patient data and urgent reports must
not be submitted. No self-serve account, “start free”, fake demo data or
unqualified deployment claim belongs on the site.

## Design system foundation

| Token family | Direction |
|---|---|
| Colour | Ink/deep-indigo operational ground; warm signal accent; mint trust state; paper editorial surface; never use colour alone for status. |
| Type | Large, tightly tracked editorial display face plus highly legible system sans body copy; monospaced metadata only. |
| Spacing | 4px base scale; generous page rhythm; 1180px content maximum; mobile-first breakpoints. |
| Layout | Responsive grid, thin technical rules, strong contrast, intentional whitespace; no stock-health visual clichés. |
| Motion | Purposeful and optional; respects reduced-motion; never conveys state only through animation. |
| Components | Navigation, announcement, eyebrow, CTA, system-node, trust-card, proof callout, route footer, form field, consent text. |

## Site quality gates

- Source-backed claims review; no implied deployment, customer, regulatory or
  integration claim.
- Keyboard, focus, contrast, semantic-heading and reduced-motion review.
- Mobile 320px onward and desktop review; no horizontal overflow.
- Performance budget and metadata/canonical/Open Graph review.
- Form abuse protection, privacy notice, consent copy and no health-data intake.
- Browser QA against the approved design system before deployment.

## Build sequence

1. Establish route templates and shared token/component CSS.
2. Build `/`, `/system`, `/trust` and `/pilot` with reviewed copy.
3. Add legal/contact routes after approved content exists.
4. Run responsive, accessibility, performance and claim review.
5. Deploy only after founder approval; operational product remains separate.
