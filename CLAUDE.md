# AGENTS.md

General rules for this project. These apply to all contributors and AI agents working on the codebase.

## Rules

1. **Tests are mandatory.** Every new feature and bug fix must include corresponding tests. Write tests during implementation — code a piece, verify it works with a test, move on. No exceptions.

2. **Descriptive commit messages.** Explain *why*, not just *what*. Use conventional commits with milestone tags (e.g., `feat(m2): add blood sugar form with context selector and validation`).

3. **Code review before committing.** For solo projects, use AI to review your code — check for bugs, test gaps, and quality issues before committing.

4. **Automated formatting and linting.** Code must be formatted and linted before committing. Use automated tools to enforce consistency — no manual formatting debates.

5. **Document complex logic.** Complex logic and public APIs must be documented. Write comments that explain *why*, not *what*. Keep READMEs up to date with setup instructions and project structure.

6. **Graceful error handling.** All code must handle errors gracefully and log meaningful messages. Never swallow exceptions silently — always either handle them or let them propagate with context.

7. **Never commit secrets.** API keys, credentials, and sensitive data must never be committed to the repository. Use environment variables or a `.env` file (added to `.gitignore`). When in doubt, assume any committed secret is compromised.

## Development Process

### Source of Truth
- **SPECIFICATION.md** is the contract. The specification wins when there is a disagreement.
- **PLAN.md** is the source of truth for development. All work must align with the milestones and acceptance criteria defined there.
- If a task in PLAN.md is ambiguous or incomplete, stop and clarify before proceeding.

### Subtask Workflow
1. **Start a subtask** — Read the relevant section of PLAN.md and understand what needs to be done.
2. **Grill-me activation** — If a design decision isn't fully specified in PLAN.md, activate the grill-me skill to resolve ambiguities before coding.
3. **Implement** — Write code and tests during implementation (Option C: code a piece, test it, move on).
4. **Report** — After completing the subtask, stop and report to the user what was done.
5. **Wait for acceptance** — Do not commit until the user explicitly accepts the task as finished.
6. **Commit** — Use conventional commits with milestone tags (e.g., `feat(m2): ...`).

### Grill-Me Skill
- **When active:** At the start of each milestone (to review the plan and clarify ambiguities) and whenever a design decision comes up that isn't fully specified in PLAN.md.
- **When not active:** Trivial implementation details (e.g., exact pixel dimensions, variable naming conventions) do not require grilling.

### Milestone Debrief
After each milestone is finished, conduct a debrief with two parts:

1. **Quality Gate** — Verify all acceptance criteria for the milestone pass. Review the feature end-to-end in the app.
2. **Retrospective** — Discuss what went well, what was frustrating, and any adjustments to the plan or process for the next milestone.

Only proceed to the next milestone after both parts of the debrief are complete and the user approves.
