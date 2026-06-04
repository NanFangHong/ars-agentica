# Ars Agentica

A static GitHub Pages essay and civic assay on what institutions owe people when expert judgment becomes software. It frames two old human crafts as public duties in the agent era:

- The sculptor / attention designer: shaping what appears first, what recedes, and what remains contestable
- The oenologist / ignorance distiller: classifying uncertainty before an institution converts it into action

The page is plain HTML/CSS/JS. It frames AI as a magazine-style public argument: expertise is
being packaged into systems that route, rank, delay, and discipline. It includes a composite opening
studio-and-cellar scene, a civilizational claim, an HR room scene, a strong public-benefit counterargument,
two craft sections, an institution-temptation section, composite case files, a public assay, an eight-part
Civic Agent Scorecard, a contestability test, an agent-response comparison, a worked ignorance-mapping example, field
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
