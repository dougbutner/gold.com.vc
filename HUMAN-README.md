# Human commands (COGO)

**Routing table** (triggers + supporting docs): [COGO/Human/command-index.md](COGO/Human/command-index.md)

## Commands — open the workflow

| Command | Hotwords | Workflow |
| --- | --- | --- |
| `/bootstrap-project` | set up project, create template, cogo, setup, new project | [bootstrap-project.md](COGO/Human/bootstrap-project.md) |
| `/install-project` | invite cogo, load cogo, set-up install cogo, set up cogo for this repo | [install-project.md](COGO/Human/install-project.md) — **Workflow A** |
| `/rewrite-project` | rewrite to [stack], migrate from [a] to [b] | [install-project.md](COGO/Human/install-project.md) — **Workflow B** |
| `/handoff` | handoff, prepare the repo for a new project | [handoff.md](COGO/Human/handoff.md) |
| `/review` | review PR, review architecture | [review.md](COGO/Human/review.md) |
| `/test-plan` | what tests, test plan | [test-plan.md](COGO/Human/test-plan.md) |
| `/release-notes` | changelog, release notes | [release-notes.md](COGO/Human/release-notes.md) |

**Incidents** — hotwords: *prod down*, *outage*, *incident*, *staging broken*: [incident-or-debug.md](COGO/Human/incident-or-debug.md)

## How COGO runs a command

1. Match intent (slash or paraphrase — see [command-index.md](COGO/Human/command-index.md)).
2. If destructive, prod-impacting, or secrets: read [safety-and-confirmations.md](COGO/Human/safety-and-confirmations.md) first.
3. Open the linked workflow above; execute step-by-step; ask only for missing required inputs.

## Supporting links

- [project-constraints-template.md](COGO/Human/project-constraints-template.md) — paste constraints once  
- [Current-Project.md](COGO/Current-Project.md) — active objective / stack overrides  
- [STACK.md](COGO/STACK.md) — default stack  
- [example-env.md](COGO/Human/example-env.md) — env **names** only (no secrets in git)  
- [CHANGELOG.md](COGO/Human/CHANGELOG.md) — COGO bundle changes  

## Notes

- Short explicit prompts; put constraints in the template or Current Project.  
- Rewrites: **target stack** must be stated.
