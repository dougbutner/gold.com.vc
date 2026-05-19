// scripts/build-site.mjs
//
// Reads content/site-copy.md (single source of truth for all public-site
// copy) and regenerates the root *.html files using templates/ shells.
//
// Special slugs:
//   _meta      — frontmatter only; supplies nav, footer, home stats, hero text.
//   _concepts  — frontmatter + markdown body; rendered as a collapsible
//                <details class="concepts-panel"> and inlined on pages whose
//                frontmatter sets include_concepts: true.
//
// Run with `npm run build` (or `node scripts/build-site.mjs`).
// Optional `--watch` flag re-runs on changes to content/ or templates/.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import yaml from "js-yaml";
import { marked } from "marked";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const PATHS = {
  content: path.join(ROOT, "content", "site-copy.md"),
  templates: path.join(ROOT, "templates"),
  out: ROOT
};

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    heading(text, level, raw) {
      // marked v14 may pass an object (token) instead of separate args.
      let label;
      let depth;
      let source;
      if (typeof text === "object" && text !== null) {
        const token = text;
        label = this.parser.parseInline(token.tokens || []);
        depth = token.depth;
        source = token.text;
      } else {
        label = text;
        depth = level;
        source = raw;
      }
      const id = slugify(source || label || "");
      const idAttr = id ? ` id="${id}"` : "";
      return `<h${depth}${idAttr}>${label}</h${depth}>\n`;
    }
  }
});

// ---------- parsing -----------------------------------------------------

function readPages(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const lines = text.split(/\r?\n/);
  const order = [];
  const pages = Object.create(null);
  let currentSlug = null;
  let buffer = [];

  const flush = () => {
    if (currentSlug !== null) {
      pages[currentSlug] = buffer.join("\n");
    }
  };

  for (const line of lines) {
    const m = line.match(/^<!--\s*PAGE:\s*([\w-]+)\s*-->\s*$/);
    if (m) {
      flush();
      currentSlug = m[1];
      buffer = [];
      order.push(currentSlug);
    } else if (currentSlug !== null) {
      buffer.push(line);
    }
  }
  flush();

  return { order, pages };
}

function parsePage(raw) {
  const m = raw.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) {
    return { frontmatter: {}, body: raw.trim() };
  }
  const frontmatter = yaml.load(m[1]) || {};
  return { frontmatter, body: (m[2] || "").trim() };
}

// ---------- helpers -----------------------------------------------------

function escapeHtmlAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeJsString(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function indent(text, prefix) {
  return text
    .split("\n")
    .map((line) => (line.length ? prefix + line : line))
    .join("\n");
}

function applyTemplate(template, variables) {
  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
    if (!Object.prototype.hasOwnProperty.call(variables, key)) {
      return "";
    }
    return variables[key];
  });
}

// ---------- nav / footer ------------------------------------------------

function renderNavLink(item) {
  const href = escapeHtmlAttr(item.href);
  const cls = item.cta ? ' class="nav-cta"' : "";
  const gated = item.gatedTarget
    ? ` data-gated-target="${escapeHtmlAttr(item.gatedTarget)}"`
    : "";
  return `<a href="${href}"${cls}${gated}>${item.label}</a>`;
}

function renderNav(meta, slug) {
  const skip = new Set();
  // Home page omits its own "Home" link (matches existing index.html).
  if (slug === "index" && Array.isArray(meta.home_nav_skip)) {
    for (const label of meta.home_nav_skip) skip.add(label);
  }
  const links = (meta.nav || [])
    .filter((item) => !skip.has(item.label))
    .map((item) => `      ${renderNavLink(item)}`)
    .join("\n");

  return [
    '  <nav class="nav" data-mobile-nav>',
    '    <a href="index.html" class="nav-logo">',
    '      <img src="https://raw.githubusercontent.com/dougbutner/Bridged-EASY-Contracts/main/SOLOMON-logo-v2-1080.png" alt="SOLOMON" crossorigin="anonymous">',
    "    </a>",
    '    <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Toggle navigation">',
    '      <span class="nav-toggle-bar"></span>',
    '      <span class="nav-toggle-bar"></span>',
    '      <span class="nav-toggle-bar"></span>',
    "    </button>",
    '    <div class="nav-links">',
    links,
    "    </div>",
    "  </nav>"
  ].join("\n");
}

function hrefToSlug(href) {
  if (!href) return "";
  return String(href)
    .replace(/^https?:\/\/[^/]+/, "")
    .replace(/^[./]+/, "")
    .replace(/\.html$/, "")
    .replace(/\/$/, "")
    .toLowerCase();
}

function renderFooter(meta, slug) {
  const items = (meta.footer || []).filter((item) => {
    // Drop a footer link only when its plain href targets the same
    // page (e.g. `legal.html` on legal.html).
    // Gated targets (`Investor Info` -> `/info`) are conceptually different
    // destinations from the public page and are kept.
    const isGated = Boolean(item.gatedTarget);
    if (isGated) return true;
    return hrefToSlug(item.href) !== slug;
  });
  if (!items.length) return "";
  const inner = items
    .map((item) => `      ${renderNavLink(item)}`)
    .join(" ·\n");
  return [
    '  <footer class="site-footer">',
    "    <p>",
    inner,
    "    </p>",
    "  </footer>"
  ].join("\n");
}

// ---------- concepts ----------------------------------------------------

function renderConcepts(conceptsPage) {
  if (!conceptsPage) return "";
  const { frontmatter, body } = conceptsPage;
  const summary = frontmatter.summary || "Concepts";
  const rendered = marked.parse(body).trim();
  return [
    '    <section class="concepts-section" aria-label="Concepts glossary">',
    '      <details class="concepts-panel">',
    `        <summary>${summary}</summary>`,
    '        <div class="concepts-body">',
    indent(rendered, "          "),
    "        </div>",
    "      </details>",
    "    </section>"
  ].join("\n");
}

// ---------- home stats / hints -----------------------------------------

function renderHomeStats(meta) {
  const stats = meta.home_stats || [];
  return stats
    .map(
      (s) =>
        `  <div class="stat"><div class="stat-num">${s.value}</div><div class="stat-lbl">${s.label}</div></div>`
    )
    .join("\n");
}

// ---------- main rendering ----------------------------------------------

function renderStandardPage(template, slug, page, meta, conceptsPage) {
  const fm = page.frontmatter;
  const bodyHtml = marked.parse(page.body).trim();
  const headMeta = fm.description
    ? `  <meta name="description" content="${escapeHtmlAttr(fm.description)}">`
    : "";
  const eyebrow = fm.eyebrow
    ? `    <span class="page-eyebrow">${fm.eyebrow}</span>`
    : "";
  const mainClass = fm.main_class || "page-main";
  const bodyClass = fm.body_class || "site-page";
  const concepts =
    fm.include_concepts === true ? renderConcepts(conceptsPage) : "";

  return applyTemplate(template, {
    HEAD_META: headMeta,
    TITLE: escapeHtmlAttr(fm.title || ""),
    BODY_CLASS: escapeHtmlAttr(bodyClass),
    NAV: renderNav(meta, slug),
    EYEBROW: eyebrow,
    MAIN_CLASS: escapeHtmlAttr(mainClass),
    CONTENT: indent(bodyHtml, "    "),
    CONCEPTS: concepts,
    FOOTER: renderFooter(meta, slug)
  });
}

function renderHomePage(template, slug, page, meta) {
  const fm = page.frontmatter;
  const hero = meta.home_hero || {};
  const headMeta = fm.description
    ? `<meta name="description" content="${escapeHtmlAttr(fm.description)}">`
    : "";
  const statsBlock = renderHomeStats(meta);

  return applyTemplate(template, {
    HEAD_META: headMeta,
    TITLE: escapeHtmlAttr(fm.title || ""),
    NAV: renderNav(meta, slug),
    HOME_STATS: statsBlock,
    HOME_HINT: escapeHtmlAttr(meta.home_hint || ""),
    HERO_TITLE: escapeJsString(hero.title || ""),
    HERO_LINE_1: escapeJsString(hero.line1 || ""),
    HERO_LINE_2: escapeJsString(hero.line2 || ""),
    HERO_SUBTITLE: escapeJsString(hero.subtitle || ""),
    HOME_FRONT_SECTION: meta.home_front_section || ""
  });
}

// ---------- build entry -------------------------------------------------

function build() {
  const startMs = Date.now();
  const { order, pages: rawPages } = readPages(PATHS.content);

  const parsed = Object.create(null);
  for (const slug of order) {
    parsed[slug] = parsePage(rawPages[slug]);
  }

  const meta = parsed._meta ? parsed._meta.frontmatter : {};
  const conceptsPage = parsed._concepts;

  const pageTemplate = fs.readFileSync(
    path.join(PATHS.templates, "page.html"),
    "utf8"
  );
  const homeTemplate = fs.readFileSync(
    path.join(PATHS.templates, "home.html"),
    "utf8"
  );

  const written = [];
  for (const slug of order) {
    if (slug.startsWith("_")) continue;
    const page = parsed[slug];
    let html;
    if (page.frontmatter.template === "home") {
      html = renderHomePage(homeTemplate, slug, page, meta);
    } else {
      html = renderStandardPage(pageTemplate, slug, page, meta, conceptsPage);
    }
    const outPath = path.join(PATHS.out, `${slug}.html`);
    fs.writeFileSync(outPath, html);
    written.push(path.relative(ROOT, outPath));
  }

  const elapsed = Date.now() - startMs;
  console.log(`build-site: wrote ${written.length} files in ${elapsed}ms`);
  for (const f of written) console.log(`  - ${f}`);
}

function watch() {
  build();
  const watched = [PATHS.content, PATHS.templates];
  console.log("build-site: watching for changes…");
  let pending = null;
  const trigger = () => {
    clearTimeout(pending);
    pending = setTimeout(() => {
      try {
        build();
      } catch (err) {
        console.error("build-site: error", err.message);
      }
    }, 80);
  };
  for (const target of watched) {
    fs.watch(target, { recursive: true }, trigger);
  }
}

const args = process.argv.slice(2);
if (args.includes("--watch")) {
  watch();
} else {
  build();
}
