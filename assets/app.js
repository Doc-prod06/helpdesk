// Shared helpers used by every page.
const CFG = window.HELPDESK_CONFIG;

const STATUS_LABELS = {
  open: "Open",
  in_progress: "In progress",
  waiting_on_customer: "Waiting on you",
  resolved: "Resolved",
  closed: "Closed",
};

const PRIORITY_LABELS = { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" };

function isConfigured() {
  return !CFG.supabaseUrl.includes("YOUR-PROJECT") && !CFG.supabaseAnonKey.includes("YOUR-SUPABASE");
}

let _db = null;
function getDb() {
  if (!_db) _db = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey);
  return _db;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function statusBadge(status) {
  return `<span class="badge badge-${esc(status)}">${esc(STATUS_LABELS[status] || status)}</span>`;
}

function categoryName(id) {
  const c = CFG.categories.find((c) => c.id === id);
  return c ? c.name : id;
}

function errorMessage(err) {
  return (err && (err.message || err.error_description)) || "Something went wrong. Please try again.";
}

function notConfiguredHtml() {
  return `<div class="notice notice-warn"><strong>Ticketing isn't connected yet.</strong>
    Add your Supabase URL and anon key to <code>assets/config.js</code>.
    Until then, email <a href="mailto:${esc(CFG.contact.email)}">${esc(CFG.contact.email)}</a>.</div>`;
}

// ---------------------------------------------------------------------------
// Header and footer
// ---------------------------------------------------------------------------

function renderChrome(active) {
  document.title = document.title ? `${document.title} · ${CFG.siteName}` : CFG.siteName;
  const links = [
    ["home", "index.html", "Home"],
    ["faq", "index.html#faq", "Help articles"],
    ["submit", "submit.html", "Submit a ticket"],
    ["status", "status.html", "Check status"],
  ];
  const header = document.getElementById("site-header");
  if (header) {
    header.innerHTML = `<div class="container header-inner">
      <a class="brand" href="index.html"><span class="brand-mark">?</span>${esc(CFG.siteName)}</a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false">☰</button>
      <nav class="nav">${links
        .map(([id, href, label]) => `<a href="${href}"${id === active ? ' aria-current="page"' : ""}>${label}</a>`)
        .join("")}</nav>
    </div>`;
    const toggle = header.querySelector(".nav-toggle");
    toggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }
  const footer = document.getElementById("site-footer");
  if (footer) {
    footer.innerHTML = `<div class="container footer-inner">
      <span>© ${new Date().getFullYear()} ${esc(CFG.companyName)}</span>
      <span><a href="mailto:${esc(CFG.contact.email)}">${esc(CFG.contact.email)}</a> · <a href="admin.html">Staff sign-in</a></span>
    </div>`;
  }
}

// ---------------------------------------------------------------------------
// Business hours
// ---------------------------------------------------------------------------

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_NAMES = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

function fmtTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

function hoursStatus() {
  const { timezone, schedule } = CFG.hours;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value])
  );
  const today = parts.weekday.toLowerCase().slice(0, 3);
  const now = `${parts.hour}:${parts.minute}`;
  const span = schedule[today];
  return { today, isOpen: !!span && now >= span[0] && now < span[1] };
}

function hoursTableHtml() {
  const { today } = hoursStatus();
  const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  return `<table class="hours-table">${order
    .map((d) => {
      const span = CFG.hours.schedule[d];
      return `<tr${d === today ? ' class="today"' : ""}><th>${DAY_NAMES[d]}</th>
        <td>${span ? `${fmtTime(span[0])} – ${fmtTime(span[1])}` : "Closed"}</td></tr>`;
    })
    .join("")}</table>
    <p class="muted small">All times ${esc(CFG.hours.timezoneLabel)}.</p>`;
}

function openBadgeHtml() {
  const { isOpen } = hoursStatus();
  return isOpen
    ? `<span class="open-pill open">● Open now</span>`
    : `<span class="open-pill closed">● Closed now</span>`;
}

// ---------------------------------------------------------------------------
// FAQ search
// ---------------------------------------------------------------------------

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

function searchFaq(query, limit = Infinity) {
  const words = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  if (!words.length) return [];
  return window.HELPDESK_FAQ
    .map((item) => {
      const q = item.question.toLowerCase();
      const a = stripHtml(item.answer).toLowerCase();
      const score = words.reduce((s, w) => s + (q.includes(w) ? 3 : 0) + (a.includes(w) ? 1 : 0), 0);
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}

// FAQ answers are authored by you in faq.js, so they are inserted as HTML.
function faqItemHtml(item) {
  return `<details class="faq-item">
    <summary><span>${esc(item.question)}</span><span class="faq-cat">${esc(categoryName(item.category))}</span></summary>
    <div class="faq-answer">${item.answer}</div>
  </details>`;
}
