# TrustRx Experience Blueprint

## Product form

TrustRx is a public-health infrastructure product delivered as a **deployed system**, not a standalone consumer app, an MCP server, a browser plugin or an API alone.

Each customer deployment has four connected surfaces:

| Surface | Primary user | Job to be done | V1 form |
|---|---|---|---|
| TrustRx Lite | CHW, nurse, facility focal person | send a minimum-necessary syndromic signal despite low connectivity | SMS/USSD, receipt/reference message |
| TrustRx Console | DSNO, epidemiologist, programme reviewer | investigate, verify, prioritise and hand off a signal | authenticated web application |
| TrustRx Bridge | partner technical team / approved systems | move approved events into the existing reporting system | FHIR-aware API and audited handoff adapter |
| TrustRx Verify | reviewer, auditor, programme lead | demonstrate when an event entered the chain of custody | event-verification view backed by private record plus HCS receipt |

An analyst copilot, MCP server and public developer API are extensions, not the initial product. They must not be allowed to access restricted health data without their own permission and governance model.

## Primary experience

### 1. Report a signal

The reporter does not complete a web form. They text or dial a structured short workflow, receive a confirmation request, and get an opaque receipt code. They should need no dashboard, no blockchain knowledge and no clinical decision from TrustRx.

`Report → validate → confirm → receipt`

### 2. Investigate a signal

The reviewer lands in an operational console, not a generic chart dashboard. The first screen answers:

- What needs attention now?
- Why has it been prioritised?
- Who owns the next decision?
- Can I trust the chain of custody?
- Has it been handed off to the official channel?

The central object is a **signal case**, with a legible lifecycle: `received → under review → verified/rejected → referred/submitted → acknowledged → closed`.

### 3. Verify provenance

Every eligible signal has a calm, understandable evidence view: private-event reference, event schema version, commitment status, Hedera consensus receipt, and verification result. It never exposes the data that was protected by the commitment.

### 4. Operate the deployment

An organisation administrator manages facilities, authorised reporters, reviewer roles, thresholds, data retention and integration health. This is an enterprise deployment console, not a consumer account page.

## Public site role

The public site sells the institutional outcome and earns a pilot conversation. It does not expose a self-serve health-data product.

### Navigation

`Platform` | `How it works` | `For public-health teams` | `Security and trust` | `Research` | `Request a pilot`

### Hero copy direction

**The first signal should not wait for the internet.**

TrustRx gives frontline health teams an offline path to submit, verify and act on outbreak signals—without replacing the surveillance systems they already rely on.

Primary CTA: `Request a pilot brief`  
Secondary CTA: `Explore the system`

Avoid “start free,” “predict outbreaks,” “immutable health data,” and mortality-reduction promises until validated. The buyer is an institution with an implementation and governance path, not an individual trying a free tool.

### Landing-page sections

1. **Latency is a systems problem** — paper-to-digital delay, low connectivity, and no provenance—not a failure of frontline staff.
2. **One signal, four layers** — Lite, Console, Bridge, Verify.
3. **The reviewer workflow** — receive, investigate, decide, hand off, retain evidence.
4. **Trust without exposure** — private health data; public cryptographic commitments only.
5. **Built around existing surveillance infrastructure** — IDSR, DSNO workflow, SORMAS/DHIS2-compatible integrations subject to approval.
6. **The controlled pilot** — fixed scope, governance, metrics and decision gate.
7. **Research and partner call to action** — pilot brief and conversation request.

## Visual system

The reference set points to a useful direction: editorial typography, disciplined information hierarchy, quiet interface frames, strong contrast and a product-first landing story. Use the principles, not the brands' layouts or copy.

- **Foundation:** warm off-white for the institutional public site; near-black/charcoal for the operational console; one restrained signal colour such as amber or verified green.
- **Type:** large, confident sans-serif headlines with a compact monospace layer for event IDs, timestamps, receipts and protocol states.
- **Graphic language:** field grids, thin rule lines, signal trails and geographic/temporal plots. Avoid generic medical crosses, stock ambulance imagery, crypto motifs or glowing blockchain graphics.
- **Product images:** show signal lifecycle, reviewer decision, integrity receipt and integration handoff—not fabricated epidemic maps or autonomous-AI claims.
- **Tone:** precise, calm and accountable. The system earns trust through evidence and workflow clarity.

## Build sequence

1. Build the reviewer-console information architecture using synthetic signals and the lifecycle states.
2. Build the event/provenance model and verifier that the console renders.
3. Build the controlled SMS/USSD ingress simulator, then connect a chosen telecom provider after governance approval.
4. Build the public site once the console screens can serve as genuine product proof.
