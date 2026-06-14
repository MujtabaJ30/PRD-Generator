# PRD Generator – Product Requirements Document

## Problem Statement
Product managers spend 2-3 hours drafting PRDs for every feature. Much of this time is spent on repetitive boilerplate: user stories, acceptance criteria, success metrics, and edge cases. The PRD Generator automates the first 80% of this work so PMs can spend time on creative thinking instead of formatting.

## Target Users
- **Primary:** Early-stage PMs and interns who need to learn PRD structure
- **Secondary:** PMs in fast-moving startups who need to spec features quickly

## User Stories
1. As a PM, I want to input a problem statement and receive a structured PRD draft so I can iterate faster.
2. As a PM, I want the output to include user stories, acceptance criteria, success metrics, and edge cases so I don't miss critical sections.
3. As a PM, I want the output to be grounded in real product principles so it is credible and usable.

## Acceptance Criteria
- Input: a free-text problem statement (e.g., "Design a class booking system for a university")
- Output: a structured PRD containing
  - Problem statement (reframed)
  - Target user persona
  - 3-5 user stories
  - 3-5 acceptance criteria
  - 3-5 success metrics
  - 3-5 edge cases
  - 2-3 open questions
- Evaluation: 80%+ of generated sections are rated "useful" by manual review against real PRDs
- Performance: completes in <10 seconds per generation
- Input validation: rejects empty or overly vague input (<10 characters)

## Success Metrics
- Time saved: draft PRD in <10 seconds vs. 2-3 hours manual
- Coverage: 6 core PRD sections generated automatically
- Quality: 80%+ of sections rated useful by manual review
- Adoption: (if deployed) number of generations per week

## Open Questions
- Should we support multi-file input (e.g., existing PRD + new requirement)?
- Should we integrate with Notion/Confluence for export?
- Should we allow users to tune creativity vs. structure?
