# PROJECT CONTEXT: Web App (Security Focused)
# Universal AI Build Standard (v2.1.0)
# Generated: 2026-04-25T20:47:03.326Z

## SPEC SCORE CARD
- [HEALTH] 100% SecureCon Certified
- [STATUS] Production Ready
- [RIGOR] 20 Active Requirements

---

## Project overview
Name: Web App (Security Focused)
Stack: React + Node.js + SQL
Description: High-security web application with robust input validation and OWASP-aligned standards.

---

## Security requirements
- NEVER expose API keys, tokens, or secrets in client-side code, logs, or version control. All secrets live server-side only.
- Sanitize and validate ALL user inputs. Treat every external input as untrusted. Use allowlists, not denylists.
- Apply rate limiting to every public API route. Prevent brute-force and abuse.
- Every generated feature must be reviewed against OWASP Top 10.
- Assume an adversarial user. Think like a pentester: what can be abused, bypassed, or escalated?
- Explicitly identify and patch logic flaws — race conditions, TOCTOU, improper state transitions.
- Avoid performance leaks: unbounded loops, memory leaks, N+1 queries, unindexed lookups.
- Enforce pre-commit hooks and CI checks to scan for accidentally committed secrets.

---

## Quality & maintainability
- Write code with rich human context: clear naming, inline comments explaining WHY not just WHAT. A senior dev should understand any section in 60 seconds.
- Detect and flag repeated patterns. Suggest abstractions before they become maintenance nightmares.
- Flag systemic and future systemic problems — architectural decisions that create pain at scale.
- All logs, errors, and monitoring output must be human-readable for a non-engineer technical PM.
- Design for reduced incidents: prefer explicit over implicit, fail loudly with clear messages.
- Follow DRY principle strictly. No copy-pasted logic. Shared utilities over repetition.

---

## Legal & compliance
- Privacy Policy: must cover data collection, storage, sharing, retention, and user rights.
- Terms of Use: acceptable use, liability limits, termination conditions, governing law.
- Data & Compliance: comply with applicable regulations (GDPR, NDPR, CCPA). Document data flows.
- IP: all code must not infringe third-party IP. OSS licenses must be documented.
- GDPR/NDPR: implement consent management, right to erasure, data portability.
- Cookie Policy: categorize cookies, provide opt-in/opt-out, comply with ePrivacy directive.

---

## Test functions
  1. [SECURITY] no_client_secrets
     → No API keys, tokens, or credentials appear in frontend code or logs.
  2. [SECURITY] input_sanitized
     → All user inputs are validated and sanitized before use in DB queries, file ops, or shell commands.
  3. [SECURITY] rate_limited
     → Every public API route has rate limiting middleware applied.
  4. [SECURITY] owasp_checked
     → Output reviewed against OWASP Top 10: injection, broken auth, XSS, IDOR, misconfig, etc.
  5. [QUALITY] logic_sound
     → Business logic has no exploitable flaws; edge cases are handled explicitly.
  6. [QUALITY] human_context
     → Code includes comments and naming a human dev understands in under 60 seconds.
  7. [PERF] no_perf_leak
     → No unbounded loops, memory leaks, or N+1 queries in generated code.
  8. [LEGAL] privacy_policy_present
     → Privacy Policy exists and covers data collection, storage, sharing, and user rights.

---

## Evaluation function
When reviewing any output, score against:
- No API keys in client
- Input validation & sanitization
- Rate limiting on all routes
- OWASP Top 10 coverage
- Pentest checklist
- Logic flaw detection
- Performance leak prevention
- Secrets scanning (git hooks)
- Human-readable context
- Detect repeated patterns
- Systemic problem detection
- PM-friendly monitoring output
- Reduced incident surface
- DRY / no duplication
- Privacy Policy
- Terms of Use
- Data & Compliance
- IP / Intellectual Property
- GDPR / NDPR readiness
- Cookie Policy

Score each criterion pass/fail. Flag any fail as a BLOCKER before shipping.

---

## Enforcement rule
If you are an AI generating code for this project:
1. Run all test functions above mentally before returning output.
2. If any test fails, output [TEST FAIL: test_name] and explain the issue.
3. Do not generate code with a BLOCKER without flagging it.
4. When in doubt, ask. Never silently assume.
5. Prefer boring, well-understood patterns over clever ones.
6. Production readability > AI cleverness.