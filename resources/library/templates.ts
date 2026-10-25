import { illustrationSvg } from "../../lib/original-illustrations";

export const templateDefinitions = [
  {
    id: "atlas",
    name: "Atlas",
    subtitle: "SaaS landing page",
    description:
      "A product landing page with features, pricing and a newsletter form.",
    color: "#7460DB",
    kind: "SaaS",
  },
  {
    id: "pulse",
    name: "Pulse",
    subtitle: "Analytics dashboard",
    description:
      "A dashboard with searchable activity, navigation and a reporting chart.",
    color: "#17856D",
    kind: "Dashboard",
  },
  {
    id: "forma",
    name: "Forma",
    subtitle: "Studio portfolio",
    description:
      "An editorial portfolio with a project filter and contact form.",
    color: "#E7844B",
    kind: "Portfolio",
  },
  {
    id: "fieldnotes",
    name: "Fieldnotes",
    subtitle: "Editorial & blog",
    description:
      "A quiet reading experience with topic filters and article search.",
    color: "#868A54",
    kind: "Editorial",
  },
  {
    id: "supply",
    name: "Supply",
    subtitle: "Storefront",
    description:
      "A considered shop layout with product filters and a local demo cart.",
    color: "#B9744E",
    kind: "Commerce",
  },
  {
    id: "gather",
    name: "Gather",
    subtitle: "Event landing page",
    description:
      "An event page with a day-by-day schedule and frontend registration.",
    color: "#B7A2F7",
    kind: "Event",
  },
] as const;

const css = `
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg,#fbfbfa);color:var(--ink,#25232d);font:15px/1.6 Arial,sans-serif}a{color:inherit;text-decoration:none}button,input,select{font:inherit}button,a,input,select{outline-offset:4px}button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible{outline:3px solid var(--accent)}.wrap{width:min(1140px,90%);margin:auto}
.top{height:84px;display:flex;align-items:center;justify-content:space-between;gap:24px;border-bottom:1px solid #8882}.brand{font-size:24px;letter-spacing:-1px;font-weight:800}.brand span{color:var(--accent);margin-right:8px}.links{display:flex;align-items:center;gap:28px;font-size:13px}.pill{border:1px solid #8884;border-radius:8px;padding:10px 18px;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:transparent;color:inherit}.solid{background:var(--accent);color:var(--button-ink,#fff);border-color:transparent}
.eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:11px;font-weight:700;color:var(--muted,#777)}h1{font-size:clamp(40px,6.5vw,82px);letter-spacing:-.065em;line-height:1.06;margin:18px 0 26px;font-weight:600}h1 em{font-family:Georgia,serif;font-weight:400}h2{font-size:34px;letter-spacing:-1.3px;line-height:1.2}h3{font-size:19px;letter-spacing:-.4px}.muted{color:var(--muted,#777)}
.hero{padding:75px 0 60px;display:grid;grid-template-columns:1.05fr 1fr;align-items:center;gap:54px}.hero p{max-width:480px;font-size:17px}.hero-art{border-radius:22px;overflow:hidden}.hero-art svg{width:100%;display:block}.actions{display:flex;gap:12px;margin-top:28px;flex-wrap:wrap}.section{padding:45px 0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.card{border:1px solid #8883;border-radius:14px;padding:26px;background:var(--card,#fff);min-width:0}.card h3{margin:10px 0}.card p{font-size:14px}.number{font:32px Georgia,serif;color:var(--accent)}.price{font-size:46px;letter-spacing:-2px}.price small{font-size:13px;letter-spacing:0}.features{padding-left:18px;font-size:14px;line-height:2.3}
.form-row{display:flex;gap:10px;flex-wrap:wrap}.form-row input,.search{padding:12px 16px;border:1px solid #8884;border-radius:8px;background:var(--card,#fff);color:inherit;min-width:0}.footer{border-top:1px solid #8883;margin-top:54px;padding:28px 0;display:flex;gap:20px;justify-content:space-between;font-size:12px}.filters{display:flex;gap:8px;flex-wrap:wrap;margin:26px 0}.filters button{border:1px solid #8884;border-radius:30px;padding:8px 16px;background:transparent;color:inherit}.filters button[aria-pressed=true]{background:var(--ink,#25232d);color:var(--bg,#fbfbfa)}
.art{border-radius:10px;overflow:hidden;margin:-10px -10px 20px}.art svg{display:block;width:100%;height:210px}.project-card{padding:20px}.label{display:inline-flex;padding:4px 9px;border-radius:4px;background:#8881;font-size:11px}.dashboard{display:grid;grid-template-columns:210px minmax(0,1fr);min-height:100vh}.sidebar{padding:30px 22px;border-right:1px solid #8882;background:#fff}.sidebar .brand{margin-bottom:38px}.sidebar button{display:block;width:100%;border:0;border-radius:8px;padding:12px 14px;text-align:left;margin:4px 0;background:transparent;color:#777;font-size:13px}.sidebar button.active{background:#e7f3ee;color:#166c58}
.dashboard-main{padding:24px 36px;min-width:0}.dash-head{display:flex;gap:14px;justify-content:space-between;align-items:center;margin-bottom:26px}.dash-head h1{font-size:30px;margin:0}.stat strong{display:block;font-size:30px;letter-spacing:-1px}.trend{font-size:11px;color:#16876a}.chart{padding:30px;margin-top:22px;border-radius:14px;border:1px solid #8882;background:white}.chart svg{display:block;width:100%;height:240px}.activity{width:100%;border-collapse:collapse;font-size:13px}.activity td,.activity th{text-align:left;padding:14px 10px;border-bottom:1px solid #8882}.table-scroll{overflow:auto}
.article-card h3{font:27px/1.2 Georgia,serif}.article-card p{font-size:14px}.article-card a{text-decoration:underline}.event{--bg:#22212c;--ink:#f4f1f8;--muted:#b4adbd;--card:#2c2b39;--button-ink:#211f2b}.schedule{display:flex;align-items:center;gap:30px;padding:24px 0;border-bottom:1px solid #8883}.schedule time{font-size:22px;color:var(--accent);min-width:85px}.cart-total{border:1px solid #8884;border-radius:10px;padding:18px;margin:24px 0;display:flex;align-items:center;gap:18px;flex-wrap:wrap}.product-price{font-weight:700;font-size:19px}.contact{max-width:660px}.contact label{display:block;margin-bottom:12px}.contact input{display:block;width:100%;margin-top:5px}.status{min-height:24px;font-size:13px;color:var(--accent)}[hidden]{display:none!important}
@media(max-width:720px){.hero{grid-template-columns:1fr;padding-top:45px;gap:24px}.hero-art{max-width:500px}.grid{grid-template-columns:1fr}.links{gap:12px;flex-wrap:wrap;font-size:11px;justify-content:flex-end}.top{height:auto;min-height:84px;padding:15px 0;align-items:flex-start}.links .pill{padding:6px 10px}.dashboard{grid-template-columns:1fr}.sidebar{border-right:0;border-bottom:1px solid #8882;padding:16px 5%}.sidebar .brand{margin-bottom:12px}.sidebar button{display:inline-block;width:auto;margin:0;font-size:11px;padding:8px}.dashboard-main{padding:22px 5%}.dashboard .grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.dashboard .stat{padding:15px 10px}.stat strong{font-size:23px}.stat p{font-size:10px}.dash-head{align-items:flex-start;flex-direction:column}.footer{flex-direction:column;gap:7px}.chart{padding:15px}.activity{min-width:500px}.event h1{font-size:55px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*::before,*::after{transition:none!important;animation:none!important}}
`;

const script = `(function(){
function applyVisibility(){var search=document.querySelector('[data-search]');var query=search?search.value.toLowerCase():'';document.querySelectorAll('[data-item],[data-search-item]').forEach(function(item){var active=document.querySelector('[data-filter][data-group="'+(item.dataset.group||'items')+'"][aria-pressed="true"]');var matchesType=!active||active.dataset.filter==='all'||item.dataset.kind===active.dataset.filter;var matchesSearch=!item.hasAttribute('data-search-item')||item.textContent.toLowerCase().includes(query);item.hidden=!matchesType||!matchesSearch})}
document.querySelectorAll('[data-filter]').forEach(function(button){button.addEventListener('click',function(){var group=button.dataset.group||'items';document.querySelectorAll('[data-filter][data-group="'+group+'"]').forEach(function(b){b.setAttribute('aria-pressed',String(b===button))});applyVisibility()})});
document.querySelectorAll('[data-search]').forEach(function(input){input.addEventListener('input',applyVisibility)});
document.querySelectorAll('.sidebar button').forEach(function(button){button.addEventListener('click',function(){document.querySelectorAll('.sidebar button').forEach(function(b){b.classList.toggle('active',b===button)});document.querySelector('[data-dashboard-title]').textContent=button.textContent.trim();document.querySelector('[data-dashboard-status]').textContent=button.textContent.trim()+' demo view selected.'})});
var count=0,total=0;document.querySelectorAll('[data-add-cart]').forEach(function(button){button.addEventListener('click',function(){count++;total+=Number(button.dataset.price);document.querySelector('[data-cart-count]').textContent=String(count);document.querySelector('[data-cart-total]').textContent='$'+total.toFixed(2);button.textContent='Added ✓';setTimeout(function(){button.textContent='Add to cart'},900)})});
document.querySelectorAll('form').forEach(function(form){form.addEventListener('submit',function(event){event.preventDefault();var status=form.querySelector('[role="status"]');if(status)status.textContent='Thanks! This is a frontend template preview; no information has been sent.'})});
document.querySelectorAll('[data-demo-checkout]').forEach(function(button){button.addEventListener('click',function(){document.querySelector('[data-cart-status]').textContent='Demo checkout. Connect a payment provider before launching your store.'})});
})();`;
const nav = (brand: string, links: string) =>
  `<header class="top wrap"><a class="brand" href="#"><span>✳</span>${brand}</a><nav class="links" aria-label="Main navigation">${links}</nav></header>`;
const footer = (name: string) =>
  `<footer class="footer wrap"><span>${name} · An original Migbits template</span><span>Built with a little care. © 2026</span></footer>`;
const filters = (items: string[], group = "items") =>
  `<div class="filters" aria-label="Filter">${["All", ...items].map((item, i) => `<button type="button" data-filter="${item.toLowerCase()}" data-group="${group}" aria-pressed="${i === 0}">${item}</button>`).join("")}</div>`;
const hero = (
  eyebrow: string,
  title: string,
  copy: string,
  art: string,
  cta = "",
) =>
  `<section class="hero"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p class="muted">${copy}</p>${cta}</div><div class="hero-art">${illustrationSvg(art)}</div></section>`;
const form = (label: string) =>
  `<form><div class="form-row"><input type="email" required placeholder="you@yourstudio.com" aria-label="Email address"><button class="pill solid">${label}</button></div><p role="status" class="status" aria-live="polite"></p></form>`;

export function templateHtml(id: string) {
  const d = templateDefinitions.find((item) => item.id === id);
  if (!d) throw new Error("Unknown template");
  let content = "";
  if (id === "atlas")
    content =
      nav(
        "atlas",
        '<a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#newsletter" class="pill solid">Get started ↗</a>',
      ) +
      `<main class="wrap">${hero("A LITTLE LESS BUSY. A LOT MORE DONE.", "Your work,<br/><em>in a better place.</em>", "Bring projects, plans and the people behind them together in one thoughtful workspace.", "workspace", '<div class="actions"><a class="pill solid" href="#pricing">Find your plan ↗</a><a class="pill" href="#features">Take a look around</a></div>')}<section class="section" id="features"><span class="eyebrow">EVERYTHING HAS A PLACE</span><h2>A calmer way to make progress.</h2><div class="grid">${[
        [
          "01",
          "A clear next step",
          "Turn a big idea into small, satisfying steps.",
        ],
        [
          "02",
          "The whole picture",
          "Keep notes, decisions and projects in context.",
        ],
        [
          "03",
          "Made for your people",
          "A shared space that feels natural from day one.",
        ],
      ]
        .map(
          ([n, t, text]) =>
            `<article class="card"><span class="number">${n}</span><h3>${t}</h3><p class="muted">${text}</p></article>`,
        )
        .join(
          "",
        )}</div></section><section class="section" id="pricing"><h2>A plan with room to grow.</h2><div class="grid">${[
        ["Personal", "0", "For your own ideas."],
        ["Studio", "12", "For a few good people."],
        ["Team", "24", "For your next big thing."],
      ]
        .map(
          ([name, price, text]) =>
            `<article class="card"><span class="eyebrow">${name}</span><p class="price">$${price}<small> / month</small></p><p class="muted">${text}</p><ul class="features"><li>Thoughtful project spaces</li><li>Notes, tasks and timelines</li><li>Flexible views</li></ul><a class="pill solid" href="#newsletter">Choose ${name}</a></article>`,
        )
        .join(
          "",
        )}</div></section><section class="section" id="newsletter"><h2>Something good starts here.</h2>${form("Keep me in the loop")}</section></main>` +
      footer("Atlas");
  if (id === "pulse")
    content = `<main class="dashboard"><aside class="sidebar"><div class="brand"><span>◉</span> pulse</div>${["Overview", "Projects", "Customers", "Reports", "Settings"].map((name, i) => `<button class="${i === 0 ? "active" : ""}">${name}</button>`).join("")}</aside><section class="dashboard-main"><header class="dash-head"><div><span class="eyebrow">WORKSPACE / GOOD MORNING</span><h1 data-dashboard-title>Overview</h1></div><input class="search" type="search" placeholder="Search activity…" aria-label="Search activity" data-search></header><p class="status" data-dashboard-status role="status">A little perspective on your progress.</p><div class="grid">${[
      ["Revenue", "$24,800", "↑ 12.8% this month"],
      ["Customers", "1,284", "↑ 8.2% this month"],
      ["Conversion", "4.62%", "↑ 1.4% this month"],
    ]
      .map(
        ([name, val, trend]) =>
          `<article class="card stat"><p class="muted">${name}</p><strong>${val}</strong><span class="trend">${trend}</span></article>`,
      )
      .join(
        "",
      )}</div><section class="chart"><h3>Revenue over time</h3><svg viewBox="0 0 900 250" role="img" aria-label="Revenue trend growing from January to June"><defs><linearGradient id="area" x2="0" y2="1"><stop stop-color="#17856d" stop-opacity=".2"/><stop offset="1" stop-color="#17856d" stop-opacity="0"/></linearGradient></defs>${[40, 90, 140, 190].map((y) => `<path d="M30 ${y}H870" stroke="#eee"/>`).join("")}<path d="M30 190C90 180 110 210 180 160S260 182 330 128 400 166 480 100 570 129 650 66 730 94 870 30V220H30Z" fill="url(#area)"/><path d="M30 190C90 180 110 210 180 160S260 182 330 128 400 166 480 100 570 129 650 66 730 94 870 30" stroke="#17856d" stroke-width="4" fill="none"/>${["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => `<text x="${30 + i * 163}" y="246" fill="#999" font-size="12">${m}</text>`).join("")}</svg></section><section class="card" style="margin-top:22px"><h3>Recent activity</h3><div class="table-scroll"><table class="activity"><thead><tr><th>Customer</th><th>Project</th><th>Status</th><th>Amount</th></tr></thead><tbody>${[
      ["Alex Morgan", "Website refresh", "Completed", "$2,400"],
      ["Casey Park", "Product design", "In progress", "$1,800"],
      ["Sam Rivera", "Brand system", "Completed", "$3,200"],
      ["Jordan Lee", "Research sprint", "In progress", "$950"],
    ]
      .map(
        (row) =>
          `<tr data-search-item>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`,
      )
      .join(
        "",
      )}</tbody></table></div></section><p class="muted" style="font-size:11px">Illustrative dashboard data · original Migbits template</p></section></main>`;
  if (id === "forma")
    content =
      nav(
        "forma.",
        '<a href="#work">Selected work</a><a href="#about">About</a><a class="pill" href="#contact">Say hello ↗</a>',
      ) +
      `<main class="wrap">${hero("INDEPENDENT DESIGN STUDIO", "Less noise.<br/><em>More meaning.</em>", "We turn thoughtful ideas into useful identities, websites and digital experiences.", "design", '<a class="pill solid" href="#work">Explore our work ↓</a>')}<section class="section" id="work"><span class="eyebrow">A FEW THINGS WE MADE</span><h2>Selected, with care.</h2>${filters(["Brand", "Digital"])}<div class="grid">${[
        ["A new perspective", "Brand", "ideas"],
        ["A place for progress", "Digital", "workspace"],
        ["Something that connects", "Brand", "collaboration"],
      ]
        .map(
          ([name, kind, art]) =>
            `<article class="card project-card" data-item data-group="items" data-kind="${kind.toLowerCase()}"><div class="art">${illustrationSvg(art)}</div><span class="label">${kind}</span><h3>${name}</h3><p class="muted">Strategy, identity and a few unexpected details.</p></article>`,
        )
        .join(
          "",
        )}</div></section><section class="section" id="about"><h2>Small team. Wide perspective.</h2><p class="muted contact">From first conversation to final detail, good work starts with understanding.</p></section><section class="section" id="contact"><h2>Have something in mind?</h2>${form("Start a conversation ↗")}</section></main>` +
      footer("Forma");
  if (id === "fieldnotes")
    content =
      nav(
        "fieldnotes",
        '<a href="#stories">Stories</a><a href="#subscribe">The newsletter</a>',
      ) +
      `<main class="wrap">${hero("A JOURNAL FOR THE CURIOUS", "Pay attention<br/><em>to the good things.</em>", "Notes on design, making things, and finding a little perspective along the way.", "learning")}<section class="section" id="stories"><input class="search" aria-label="Search stories" placeholder="Find a story…" type="search" data-search>${filters(["Design", "Life", "Making"])}<div class="grid">${[
        ["The value of a little space", "Design", "workspace"],
        ["Make room for a new idea", "Making", "ideas"],
        ["Better conversations, better work", "Life", "collaboration"],
        ["A practice of paying attention", "Design", "design"],
        ["The good kind of unfinished", "Making", "files"],
        ["Being a beginner again", "Life", "learning"],
      ]
        .map(
          ([name, kind, art]) =>
            `<article class="card article-card" data-item data-group="items" data-kind="${kind.toLowerCase()}" data-search-item><div class="art">${illustrationSvg(art)}</div><span class="eyebrow">${kind} / 5 MIN READ</span><h3>${name}</h3><p class="muted">A few thoughts for people who care about how things are made.</p><a href="#subscribe">More in the newsletter ↗</a></article>`,
        )
        .join(
          "",
        )}</div></section><section id="subscribe" class="section"><h2>A good thing in your inbox.</h2>${form("Subscribe")}</section></main>` +
      footer("Fieldnotes");
  if (id === "supply")
    content =
      nav(
        "supply /",
        '<a href="#products">The collection</a><a href="#cart" class="pill">Bag <span data-cart-count>0</span></a>',
      ) +
      `<main class="wrap">${hero("EVERYDAY OBJECTS. A LITTLE BETTER.", "Good things<br/><em>to have around.</em>", "Considered objects for the spaces where you live, work and make things.", "commerce", '<a class="pill solid" href="#products">Meet the collection ↗</a>')}<section class="section" id="products">${filters(["Workspace", "Everyday"])}<div class="grid">${[
        ["The desk set", "Workspace", "workspace", 48],
        ["The everyday bag", "Everyday", "commerce", 64],
        ["The notebook collection", "Workspace", "learning", 24],
        ["The organizer", "Workspace", "files", 32],
        ["The weekend edition", "Everyday", "community", 42],
        ["The maker set", "Everyday", "design", 56],
      ]
        .map(
          ([name, kind, art, price]) =>
            `<article class="card project-card" data-item data-group="items" data-kind="${String(kind).toLowerCase()}"><div class="art">${illustrationSvg(String(art))}</div><span class="eyebrow">${kind}</span><h3>${name}</h3><p class="product-price">$${price}</p><button class="pill" data-add-cart data-price="${price}">Add to cart</button></article>`,
        )
        .join(
          "",
        )}</div></section><section id="cart" class="section"><h2>Your bag</h2><div class="cart-total"><span>Total</span><strong data-cart-total>$0.00</strong><button class="pill solid" data-demo-checkout>Preview checkout</button></div><p class="status" data-cart-status role="status" aria-live="polite"></p></section></main>` +
      footer("Supply");
  if (id === "gather")
    content =
      nav(
        "gather / 26",
        '<a href="#schedule">The schedule</a><a class="pill solid" href="#register">Join us ↗</a>',
      ) +
      `<main class="wrap">${hero("TWO DAYS OF GOOD CONVERSATION", "Good people.<br/><em>Better ideas.</em>", "A gathering for people who build, design and question how things could be a little better.", "community", '<p>November 12–13, 2026 · Online & everywhere</p><a class="pill solid" href="#register">Save your place ↗</a>')}<section class="section" id="schedule"><span class="eyebrow">MAKE A LITTLE ROOM IN YOUR CALENDAR</span><h2>The conversations.</h2>${filters(["Day one", "Day two"], "schedule")}${[
        [
          "09:00",
          "A good place to begin",
          "Opening notes and a shared perspective",
          "day one",
        ],
        [
          "11:00",
          "The space between ideas",
          "A conversation about making thoughtful things",
          "day one",
        ],
        [
          "14:00",
          "Better together",
          "Building practices for collaborative work",
          "day two",
        ],
        [
          "16:00",
          "Take something with you",
          "Small ideas to put into practice",
          "day two",
        ],
      ]
        .map(
          ([time, title, note, day]) =>
            `<article class="schedule" data-item data-group="schedule" data-kind="${day}"><time>${time}</time><div><h3>${title}</h3><p class="muted">${note}</p></div></article>`,
        )
        .join(
          "",
        )}</section><section class="section" id="register"><h2>There is a place for you.</h2>${form("Save my place")}</section></main>` +
      footer("Gather");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${d.name} — ${d.subtitle}</title><meta name="description" content="${d.description}"><style>${css}</style></head><body ${id === "gather" ? 'class="event"' : ""} style="--accent:${d.color};${id === "forma" ? "--bg:#f6f3ed;" : id === "fieldnotes" ? "--bg:#f7f5ec;" : ""}">${content}<script>${script}</script></body></html>`;
}
