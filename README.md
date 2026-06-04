# Ars Agentica

A static GitHub Pages essay and civic assay on what institutions owe people when expert judgment becomes software:

- Attention design: shaping the path of human judgment
- Ignorance distillation: turning missing facts, source silences, forbidden inferences, and stop rules into agent behavior

The page is plain HTML/CSS/JS. It frames AI as a magazine-style public argument: expertise is
being packaged into systems that route, rank, delay, and discipline. It includes a composite opening
scene, a why-now spread, a strong public-benefit counterargument, an institution-temptation section,
a civic question section, an eight-part Civic Agent Scorecard, a contestability test, composite case
files, an agent-response comparison, a worked ignorance-mapping example, public accountability cards, field
notes, a Liquidity Happy Hours field-lab bridge, a public-agent deployment checklist, and
scroll-triggered effects that keep text readable during anchor jumps and quick mobile scrolling.

Run local visual QA after starting a static server:

```text
node scripts/visual-qa.mjs http://127.0.0.1:4178/
```

The script writes screenshots and a JSON report to `qa-output/`, which is ignored by git.

No build step is required. If GitHub Pages points at the repository root, visit:

```text
/ars-agentica/
```

You can also copy this directory into the root of a standalone Pages repository.
