# TrustRx Agent Governance

## Purpose

Agents accelerate engineering, research synthesis and operational drafting. They do not become independent clinical, regulatory or deployment authorities. This policy applies to coding agents, LLM features in the product, autonomous jobs and any future MCP integration.

## Agent classes

| Class | Permitted work | Human approval required |
|---|---|---|
| Research agent | source discovery, evidence extraction, draft workflow maps | use of evidence in product claims or regulatory decisions |
| Engineering agent | scoped code, tests, documentation, local analysis | merge, release, migrations, production configuration |
| Operations agent | draft incident summaries, reconcile non-sensitive operational metadata | external notification, user/account changes, data access |
| Product copilot | assist authorised reviewers with summaries of permitted data | clinical/surveillance decision, official handoff, public notification |

## Controls

- **Identity and scope:** each agent run has a named owner, task ID, bounded tool list and maximum authority.
- **Data:** default to synthetic/de-identified inputs. Restricted data needs a recorded purpose, approved access path, retention limit and no model-training use unless separately authorised.
- **Actions:** agents can propose; humans approve irreversible actions, external messages, official-system handoffs and privileged changes.
- **Evidence:** preserve prompt/version, tool actions, relevant source references, produced artefacts, test results and human approval for material actions.
- **Evaluation:** before release, test representative safe, ambiguous, malicious and failure inputs. Measure correctness, unsupported-claim rate, unsafe-action rate, latency and cost.
- **Fallback:** every agent-assisted workflow has a manual path, escalation owner, timeout and disable switch.

## MCP and tool integrations

An MCP server is an integration boundary, not a shortcut around governance. Each tool must define its data classification, caller identity, permitted action, input validation, idempotency, audit event, rate limit, timeout, error response and human-approval condition. Start read-only; grant write tools only when a workflow owner has accepted the risk.

## Change control

Any new agent capability requires an ADR covering purpose, users, data, model/provider, tool permissions, prompt-injection controls, evaluation plan, monitoring, kill switch and accountable owner. It must pass the same CI and review controls as other production code.

## Commit discipline

An engineering agent creates a small, meaningful Git commit after each coherent
and verified unit of work. Commit messages state the product or engineering
outcome; commits remain narrow, reviewable and reversible. Agents must not use
commits to snapshot incomplete experiments, unrelated formatting, generated
noise or controlled material.
