/* ── TruthLens — AI Usage Detector ── */
/* app.js */

// ────────────────────────────────────────
// STATE
// ────────────────────────────────────────
let uploadedFiles = [];
let addedLinks    = [];
let activeTab     = 'upload';

// ────────────────────────────────────────
// TAB SWITCHING
// ────────────────────────────────────────
function switchTab(tab, btn) {
  activeTab = tab;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
}

// ────────────────────────────────────────
// FILE HANDLING
// ────────────────────────────────────────
function handleFiles(files) {
  Array.from(files).forEach(f => {
    if (!uploadedFiles.find(x => x.name === f.name)) {
      uploadedFiles.push(f);
    }
  });
  renderFileList();
}

function renderFileList() {
  const list = document.getElementById('file-list');
  list.innerHTML = uploadedFiles.map((f, i) => `
    <div class="file-item">
      <div class="file-icon ${getFileClass(f.name)}">${getFileExt(f.name)}</div>
      <div class="file-info">
        <div class="file-name">${escapeHtml(f.name)}</div>
        <div class="file-meta">${formatSize(f.size)}</div>
      </div>
      <button class="file-remove" onclick="removeFile(${i})" aria-label="Remove file">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M2 2l8 8M10 2l-8 8"/>
        </svg>
      </button>
    </div>
  `).join('');

  const count = uploadedFiles.length;
  document.getElementById('upload-count').innerHTML = count
    ? `<span>${count}</span> file${count !== 1 ? 's' : ''} selected`
    : '0 files selected';
  document.getElementById('analyze-upload-btn').disabled = count === 0;
}

function removeFile(i) {
  uploadedFiles.splice(i, 1);
  renderFileList();
}

function getFileClass(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['doc', 'docx'].includes(ext)) return 'word';
  if (['ppt', 'pptx'].includes(ext)) return 'ppt';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  return 'word';
}

function getFileExt(name) {
  return name.split('.').pop().toUpperCase().slice(0, 4);
}

function formatSize(bytes) {
  if (bytes < 1024)    return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ────────────────────────────────────────
// LINK HANDLING
// ────────────────────────────────────────
function addLink() {
  const input = document.getElementById('link-input');
  const url   = input.value.trim();
  if (!url || !url.startsWith('http')) return;
  if (!addedLinks.find(l => l.url === url)) {
    addedLinks.push({ url, service: detectService(url) });
  }
  input.value = '';
  renderLinkList();
}

function detectService(url) {
  if (url.includes('docs.google.com/document'))      return 'gdocs';
  if (url.includes('docs.google.com/presentation'))  return 'gslides';
  if (url.includes('docs.google.com/spreadsheets'))  return 'gsheets';
  return 'gdocs';
}

function serviceLabel(s) {
  return { gdocs: 'DOCS', gslides: 'SLIDE', gsheets: 'SHEET' }[s] || 'LINK';
}

function renderLinkList() {
  const list = document.getElementById('link-list');
  list.innerHTML = addedLinks.map((l, i) => `
    <div class="link-item">
      <div class="link-service-icon ${l.service}">${serviceLabel(l.service)}</div>
      <div class="link-url">${escapeHtml(l.url)}</div>
      <button class="file-remove" onclick="removeLink(${i})" aria-label="Remove link">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M2 2l8 8M10 2l-8 8"/>
        </svg>
      </button>
    </div>
  `).join('');

  const count = addedLinks.length;
  document.getElementById('link-count').innerHTML = count
    ? `<span>${count}</span> link${count !== 1 ? 's' : ''} added`
    : '0 links added';
  document.getElementById('analyze-link-btn').disabled = count === 0;
}

function removeLink(i) {
  addedLinks.splice(i, 1);
  renderLinkList();
}

// ────────────────────────────────────────
// DRAG & DROP
// ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const dropZone = document.getElementById('drop-zone');

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  // Enter key on link input
  const linkInput = document.getElementById('link-input');
  if (linkInput) {
    linkInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') addLink();
    });
  }
});

// ────────────────────────────────────────
// ANALYSIS (simulated UI — wire to real API here)
// ────────────────────────────────────────
function runAnalysis() {
  const overlay = document.getElementById('loading');
  overlay.classList.add('visible');

  // Reset step states
  ['step1', 'step2', 'step3', 'step4'].forEach(id => {
    const el = document.getElementById(id);
    el.classList.remove('active', 'done');
  });

  const steps = ['step1', 'step2', 'step3', 'step4'];
  let s = 0;

  function nextStep() {
    if (s > 0) {
      document.getElementById(steps[s - 1]).classList.replace('active', 'done');
    }
    if (s < steps.length) {
      document.getElementById(steps[s]).classList.add('active');
      s++;
      setTimeout(nextStep, 700 + Math.random() * 400);
    } else {
      setTimeout(() => {
        overlay.classList.remove('visible');
        showResults();
      }, 500);
    }
  }

  nextStep();
}

// ────────────────────────────────────────
// RESULTS
// ────────────────────────────────────────
function showResults() {
  const items = activeTab === 'upload'
    ? uploadedFiles.map(f => ({ name: f.name, type: getFileClass(f.name) }))
    : addedLinks.map(l => ({
        name: l.url.split('/').filter(Boolean).slice(-1)[0] || 'Google Doc',
        type: l.service
      }));

  // Simulated scores — replace with real API response values
  const scores = items.map(() => Math.floor(Math.random() * 88) + 5);

  const grid = document.getElementById('results-grid');
  grid.innerHTML = items.map((item, i) => {
    const score   = scores[i];
    const cls     = score < 30 ? 'safe' : score < 65 ? 'warning' : 'danger';
    const verdict = score < 30 ? 'Likely Human' : score < 65 ? 'Mixed Content' : 'Likely AI';
    const words   = Math.floor(Math.random() * 3000) + 400;
    const sents   = Math.floor(words / 7);
    const flagged = Math.round(score * sents / 100);
    const conf    = Math.floor(80 + Math.random() * 18);
    const label   = escapeHtml(item.name.length > 30 ? item.name.slice(0, 30) + '…' : item.name);

    return `
      <div class="result-card ${cls}">
        <div class="result-doc-name">
          <div class="result-doc-icon ${item.type}"
               style="background:var(--surface2);border:1px solid var(--border);font-size:0.5rem;">
            ${getFileExt(item.name)}
          </div>
          ${label}
        </div>
        <div class="result-percent">${score}%</div>
        <div class="result-label">AI CONTENT DETECTED — ${verdict.toUpperCase()}</div>
        <div class="result-bar-bg">
          <div class="result-bar-fill" style="width:0%" data-target="${score}"></div>
        </div>
        <div class="result-detail">
          <strong>${words.toLocaleString()} words</strong> · ${sents} sentences analyzed<br>
          ${flagged} AI-flagged sentences · confidence <strong>${conf}%</strong>
        </div>
      </div>
    `;
  }).join('');

  // Summary stats
  const avg       = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const high      = scores.filter(s => s >= 65).length;
  const totalWords = items.reduce(() => Math.floor(Math.random() * 3000 + 400), 0) * items.length;

  document.getElementById('sum-docs').textContent  = items.length;
  document.getElementById('sum-avg').textContent   = avg + '%';
  document.getElementById('sum-high').textContent  = high;
  document.getElementById('sum-words').textContent = (totalWords / 1000).toFixed(1) + 'k';
  document.getElementById('results-ts').textContent = 'Analyzed ' + new Date().toLocaleTimeString();

  const rs = document.getElementById('results-section');
  rs.classList.add('visible');
  rs.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Animate progress bars (after paint)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.result-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.target + '%';
      });
    });
  });
}

// ────────────────────────────────────────
// RESET
// ────────────────────────────────────────
function resetAll() {
  uploadedFiles = [];
  addedLinks    = [];
  renderFileList();
  renderLinkList();
  document.getElementById('results-section').classList.remove('visible');
  document.getElementById('results-grid').innerHTML = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
