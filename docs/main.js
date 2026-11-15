// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Gentle reveal on scroll (skipped when reduced motion is requested)
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.section').forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

// ---- Terminal mode (a nod to the original site) ----
const dialog = document.getElementById('terminal');
const out = document.getElementById('term-output');
const form = document.getElementById('term-form');
const input = document.getElementById('term-cmd');
const history = [];
let hIdx = 0;

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const link = (href, text) => `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;

const sections = {
  experience: [
    'AI Consultant & Web Developer   Alexander Sales Group    May 2026–now',
    'Operations Engineering Intern   LightningCath            Jun–Aug 2025',
    'Technical Assistant             Iowa State University    Jan–Jun 2025',
  ].join('\n'),
  projects: [
    `${link('https://github.com/marshfalex/fda-device-rag', 'fda-device-rag')}             hybrid RAG, 86% Hit Rate@5`,
    `${link('https://github.com/marshfalex/retail-demand-forecasting', 'retail-forecasting')}         XGBoost, -34.7% WAPE`,
    'risc-v-processor           5-stage pipelined CPU in VHDL',
    'doclink                    Android + Spring Boot healthcare app',
  ].join('\n'),
  skills: 'languages: Java, Python, C, C++, VHDL, Bash\nml/data:   XGBoost, scikit-learn, pandas, RAG, Chroma\ntools:     Git, GitHub Actions, Streamlit, Quartus, Questa',
  education: 'Iowa State University, B.S. Computer Engineering, expected Dec 2027',
  contact: `${link('mailto:marshfalex@gmail.com', 'marshfalex@gmail.com')}\n${link('https://www.linkedin.com/in/marshfalex', 'linkedin.com/in/marshfalex')}\n${link('resume.pdf', 'resume.pdf')}`,
};

const commands = {
  help: () => 'commands: ls, cat &lt;section&gt;, whoami, goto &lt;section&gt;, clear, exit',
  ls: () => Object.keys(sections).join('  '),
  whoami: () => 'guest. this is Marshall Alexander\'s site. try: cat projects',
  cat: (arg) => sections[arg] ?? (arg ? `cat: ${esc(arg)}: no such section` : 'usage: cat &lt;section&gt;'),
  goto: (arg) => {
    const el = document.getElementById(arg);
    if (!el) return `goto: ${esc(arg || '')}: no such section`;
    close(); el.scrollIntoView(); el.querySelector('h2')?.setAttribute('tabindex', '-1'); el.querySelector('h2')?.focus();
    return '';
  },
  clear: () => { out.innerHTML = ''; return null; },
  exit: () => { close(); return null; },
  sudo: () => 'nice try.',
};

function print(html, cls = 'out') {
  const div = document.createElement('div');
  div.className = cls;
  div.innerHTML = html;
  out.appendChild(div);
  out.scrollTop = out.scrollHeight;
}

function run(raw) {
  const line = raw.trim();
  print(`<span class="dim">~$</span> ${esc(line)}`, 'cmd');
  if (!line) return;
  history.push(line); hIdx = history.length;
  const [name, ...args] = line.split(/\s+/);
  const fn = commands[name.toLowerCase()];
  const result = fn ? fn(args[0]) : `command not found: ${esc(name)}. try 'help'`;
  if (result) print(result);
}

function open() {
  if (!out.childElementCount) print("Welcome! Type 'help' to see commands, or 'ls' to list sections.");
  dialog.showModal();
  input.focus();
}
function close() { dialog.close(); }

document.getElementById('open-terminal').addEventListener('click', open);
document.getElementById('close-terminal').addEventListener('click', close);
dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); input.value = ''; });
input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp' && hIdx > 0) { input.value = history[--hIdx]; e.preventDefault(); }
  if (e.key === 'ArrowDown') { hIdx = Math.min(hIdx + 1, history.length); input.value = history[hIdx] ?? ''; e.preventDefault(); }
});
// Backtick opens the terminal (unless typing in a field)
document.addEventListener('keydown', (e) => {
  if (e.key === '`' && !dialog.open && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); open(); }
});
