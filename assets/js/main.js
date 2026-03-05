/* ============================================
   MAIN.JS — Component Loader, Sidebar, Dropdowns
   ============================================ */

// ---- Component Loader ----
async function loadComponent(selector, path) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    el.innerHTML = await res.text();
  } catch (e) {
    console.warn(`Component load error: ${e.message}`);
  }
}

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', async function () {
  // Determine depth for relative paths
  const depth = getPathDepth();
  const prefix = depth === 0 ? './' : '../'.repeat(depth);

  // Load components
  await Promise.all([
    loadComponent('#sidebar-container', prefix + 'components/sidebar.html'),
    loadComponent('#topbar-container', prefix + 'components/topbar.html'),
    loadComponent('#footer-container', prefix + 'components/footer.html')
  ]);

  // After components load
  highlightActiveLink();
  initProfileDropdown();
  initMobileToggle();
  initTabs();
  initDropdowns();
});

// ---- Path Depth ----
function getPathDepth() {
  const path = window.location.pathname;
  // Count segments after base
  const segments = path.split('/').filter(s => s && !s.includes('.'));
  // If we're at root (index.html or /), depth = 0
  // Otherwise count subdirectories
  return Math.max(0, segments.length - (path.endsWith('/') ? 0 : 0));
}

// ---- Sidebar Active Link ----
function highlightActiveLink() {
  const path = window.location.pathname.toLowerCase();
  const links = document.querySelectorAll('.sidebar-link');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Resolve the href relative to get its meaningful part
    let linkPath = href.toLowerCase();

    // Check if current page matches this link
    const currentPage = path.split('/').filter(Boolean);
    const linkParts = linkPath.replace(/\.\.\//g, '').split('/').filter(Boolean);

    // Match on the directory/file part
    if (linkParts.length > 0) {
      const linkKey = linkParts[0];
      const match = currentPage.some(p => p === linkKey) ||
        (linkKey === 'dashboard' && (path.endsWith('/') || currentPage.length === 0));

      if (match) {
        link.classList.add('active');
      }
    }
  });
}

// ---- Profile Dropdown ----
function initProfileDropdown() {
  const profileBtn = document.querySelector('.topbar-profile');
  const dropdown = document.querySelector('.profile-dropdown');
  if (!profileBtn || !dropdown) return;

  profileBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', function () {
    dropdown.classList.remove('show');
  });
}

// ---- Mobile Sidebar Toggle ----
function initMobileToggle() {
  const toggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  // Close on outside click
  document.querySelector('.main-wrapper')?.addEventListener('click', function () {
    sidebar.classList.remove('open');
  });
}

// ---- Tabs ----
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const tabGroup = this.closest('.tabs');
      const targetId = this.getAttribute('data-tab');

      // Deactivate all tabs in this group
      tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      // Show the right content
      const container = tabGroup.parentElement;
      container.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const target = container.querySelector(`#${targetId}`);
      if (target) target.classList.add('active');
    });
  });
}

// ---- Generic Dropdowns ----
function initDropdowns() {
  document.querySelectorAll('[data-dropdown]').forEach(trigger => {
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      const menu = this.nextElementSibling;
      if (menu && menu.classList.contains('dropdown-menu')) {
        // Close all others
        document.querySelectorAll('.dropdown-menu.show').forEach(m => {
          if (m !== menu) m.classList.remove('show');
        });
        menu.classList.toggle('show');
      }
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.dropdown-menu.show').forEach(m => m.classList.remove('show'));
  });
}

// ---- Utility: Navigate ----
function navigateTo(path) {
  window.location.href = path;
}
