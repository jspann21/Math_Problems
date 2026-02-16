# Math Problems

**Live site:** https://jspann21.github.io/Math_Problems/

I created this site so that my daughter doesn't have to watch 30-second ads or pay a subscription to practice math problems. My plan is to expand the quantity and types of problems over time.

Ad-free math practice pages built with static HTML/CSS/JavaScript, deployed on GitHub Pages.

## Usage

Visit the live site and pick a topic from the homepage. Each problem page shows a question with multiple-choice answers. Use **Previous** and **Next** to move between problems. Open the **scratchpad** to work out solutions on a drawing canvas (undo, redo, clear). Use the **Home** button to return to the topic list.

## Problem Types

- **Customary Units of Length:** Using 3 One or Two Digit Numbers, Units Up to 100, Appropriate Metric Unit of Length
- **Word Problems:** Length Word Problems
- **Basic Operations:** Addition & Subtraction (0–20), Flashcards: Add & Subtract (0–20)
- **Time:** Telling Time Problems, Read Clock Time (Minute Tick Marks)

## Current Stack

- Static HTML pages for each problem type
- Shared ES modules for animations, scratchpad, and utilities
- Data-driven homepage catalog (`site-catalog.js` + `index.js`)
- Single global stylesheet (`styles.css`) with reusable design tokens

## Local Development

Use any static file server from the repo root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Project Structure

- `index.html`: homepage shell
- `index.js`: renders topic cards from catalog data
- `site-catalog.js`: single source of truth for homepage links/topics
- `shared.js`: shared scratchpad + utility functions
- `animations.js`: reusable correct/wrong answer feedback
- `*.html` + matching `*.js`: individual problem pages and logic
- `styles.css`: global and page-specific styling

## Add A New Page

1. Create `your-topic.html` and `your-topic.js`.
2. Reuse existing page structure and include module scripts.
3. Import shared helpers in your script:
   - `setupScratchpad()` for scratchpad controls
   - `shuffleArray()` and other shared utilities as needed
4. Add your page link to `site-catalog.js` in the correct topic section.
5. Commit and push to `main` for GitHub Pages deployment.
