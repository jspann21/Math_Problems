import { topicCatalog } from './site-catalog.js';

const catalogContainer = document.getElementById('topic-catalog');

function renderProblemLink(problem) {
  if (problem.soon) {
    return `
      <span class="problem-link coming-soon" aria-disabled="true">
        <span class="problem-icon" aria-hidden="true">${problem.icon ?? '•'}</span>
        <span>${problem.label}</span>
      </span>
    `;
  }

  return `
    <a href="${problem.href}" class="problem-link">
      <span class="problem-icon" aria-hidden="true">${problem.icon ?? '•'}</span>
      <span>${problem.label}</span>
      ${problem.badge ? `<span class="new-badge">${problem.badge}</span>` : ''}
    </a>
  `;
}

function renderTopicSection(topic) {
  const links = topic.problems.map((problem) => renderProblemLink(problem)).join('');

  return `
    <section class="topic-section" aria-label="${topic.title}">
      <h2 class="topic-title">${topic.title}</h2>
      <div class="problem-links">
        ${links}
      </div>
    </section>
  `;
}

if (catalogContainer) {
  catalogContainer.innerHTML = topicCatalog.map((topic) => renderTopicSection(topic)).join('');
}
