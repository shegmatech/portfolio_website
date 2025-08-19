/* =========================================
   App JS – navigation, sections, data, modals
   ========================================= */

// ---- Config (update as needed) ----
const CONTACT_EMAIL = 'projects@olusegunabiola.xyz';
const WHATSAPP_NUMBER = '2347036792585'; // no "+"

// ---- State ----
let BLOG_POSTS = []; // cache of published posts

// Helper: smooth set body scroll lock
function setBodyLock(locked) {
  document.body.style.overflow = locked ? 'hidden' : '';
}

// =========================
// DOM Ready
// =========================
document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  setupSectionAnimations();
  setupSkillsRadials();
  setupDelegatedBlogClicks();
  setupPostModal();
  setupContactModal();
  setupCVButton();
  setupContactForm();

  // Initial data
  loadProjects();
  loadBlogPosts();

  // Live updates via localStorage (admin)
  window.addEventListener('storage', (e) => {
    if (e.key === 'portfolio_projects') loadProjects();
    if (e.key === 'portfolio_blog') loadBlogPosts();
  });
});

// =========================
// Navbar & Navigation
// =========================
function setupNavbar() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const navLinksEl = document.getElementById('nav-links');
  const mobileOverlay = document.getElementById('mobile-overlay');

  function toggleMobileMenu() {
    const active = !mobileToggle.classList.contains('active');
    mobileToggle.classList.toggle('active');
    navLinksEl.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    setBodyLock(active);
    mobileToggle.setAttribute('aria-expanded', String(active));
  }
  function closeMobileMenu() {
    mobileToggle.classList.remove('active');
    navLinksEl.classList.remove('active');
    mobileOverlay.classList.remove('active');
    setBodyLock(false);
    mobileToggle.setAttribute('aria-expanded', 'false');
  }

  if (mobileToggle) mobileToggle.addEventListener('click', toggleMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);

  // Close on nav link click (same page anchors)
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) {
        e.preventDefault();
        const el = document.getElementById(href.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        closeMobileMenu();
      }
    });
  });

  // Style on scroll
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Active section highlighting
  const sections = document.querySelectorAll('section');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= (section.offsetTop - 200)) current = section.id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#') && href.substring(1) === current) link.classList.add('active');
    });
  });
}

// =========================
// Section Animations
// =========================
function setupSectionAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

  setTimeout(() => {
    document.querySelectorAll('section').forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'opacity .6s ease, transform .6s ease';
      observer.observe(section);
    });
  }, 100);
}

// =========================
// Skills – radial animation once on view
// =========================
function setupSkillsRadials() {
  const skillsGrid = document.getElementById('skills-grid');
  if (!skillsGrid) return;

  const animateRadials = () => {
    const cards = skillsGrid.querySelectorAll('.skill-radial');
    cards.forEach(card => {
      const val = Number(card.dataset.value || 0);
      const radial = card.querySelector('.radial');
      const valueEl = card.querySelector('.radial-value');
      radial.style.setProperty('--p', val);

      // Count-up value
      const duration = 1000;
      const start = performance.now();
      const from = 0, to = val;
      const step = (t) => {
        const p = Math.min((t - start) / duration, 1);
        const current = Math.round(from + (to - from) * p);
        valueEl.textContent = current + '%';
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  const skillsObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateRadials();
      obs.unobserve(entry.target); // only once
    });
  }, { threshold: 0.3 });

  skillsObserver.observe(skillsGrid);
}

// =========================
/* Projects */
// =========================
async function loadProjects() {
  const container = document.getElementById('projects-container');
  try {
    let projects;
    const stored = localStorage.getItem('portfolio_projects');
    if (stored) {
      projects = JSON.parse(stored);
    } else {
      try {
        const res = await fetch('./projects.json', { cache: 'no-cache' });
        if (res.ok) projects = await res.json();
        else throw new Error('File not found');
      } catch {
        // Fallback demo data
        projects = [
          { id:1, title:"E-Commerce Platform", description:"A modern e-commerce platform with real-time inventory and secure payment processing.", image:"", technologies:["React","Node.js","MongoDB","Stripe"], githubUrl:"https://github.com/yourusername/ecommerce", liveUrl:"https://demo.example.com", featured:true },
          { id:2, title:"Task Management App", description:"Collaborative tasks with real-time updates, drag-and-drop, and team features.", image:"", technologies:["Vue.js","Express","Socket.io","PostgreSQL"], githubUrl:"https://github.com/yourusername/taskapp", liveUrl:"https://tasks.example.com", featured:true },
          { id:3, title:"Weather Dashboard", description:"Responsive dashboard with location-based forecasts and clean charts.", image:"", technologies:["JavaScript","Chart.js","Weather API","CSS Grid"], githubUrl:"https://github.com/yourusername/weather", liveUrl:"https://weather.example.com", featured:false }
        ];
      }
    }
    renderProjects(projects);
  } catch {
    container.innerHTML = '<div class="error">Failed to load projects. Please check your projects.json file or use the admin panel.</div>';
  }
}

function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  const grid = document.createElement('div');
  grid.className = 'projects-grid';

  projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';

    // Image area – object-fit cover
    const imgWrap = document.createElement('div');
    imgWrap.className = 'project-image';

    const img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = `${project.title || 'Project'} preview`;
    img.src = project.image || ''; // admin supplies URL
    imgWrap.appendChild(img);

    const body = document.createElement('div');
    body.className = 'project-content';
    body.innerHTML = `
      <h3 class="project-title">${project.title || ''}</h3>
      <p class="project-description">${project.description || ''}</p>
      <div class="project-tech">
        ${(project.technologies || []).map(t => `<span class="tech-tag">${String(t)}</span>`).join('')}
      </div>
      <div class="project-links">
        ${project.liveUrl ? `<a href="${project.liveUrl}" class="project-link primary" target="_blank" rel="noopener">Live Demo</a>` : ''}
        ${project.githubUrl ? `<a href="${project.githubUrl}" class="project-link secondary" target="_blank" rel="noopener">GitHub</a>` : ''}
      </div>
    `;

    card.appendChild(imgWrap);
    card.appendChild(body);
    grid.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(grid);
}

// =========================
/* Blog */
// =========================
async function loadBlogPosts() {
  const container = document.getElementById('blog-container');
  try {
    let posts;
    const stored = localStorage.getItem('portfolio_blog');
    if (stored) {
      posts = JSON.parse(stored);
    } else {
      try {
        const res = await fetch('./blog.json', { cache: 'no-cache' });
        if (res.ok) posts = await res.json();
        else throw new Error('File not found');
      } catch {
        // Fallback demo posts
        posts = [
          { id:1, title:"Building Scalable React Applications", excerpt:"Best practices for large-scale React apps—architecture, state, performance.", content:"<p><strong>Full blog post content here...</strong> Include code samples, sections, and images as needed.</p>".repeat(12), date:"2025-07-20", tags:["React","JavaScript","Architecture"], published:true },
          { id:2, title:"The Future of Web Development", excerpt:"Emerging trends: WebAssembly, serverless, and the next-gen JavaScript ecosystem.", content:"<p>Full blog post content here... Trends, predictions, and insights.</p>".repeat(10), date:"2025-07-15", tags:["Web Development","Trends","Future"], published:true },
          { id:3, title:"CSS Grid vs Flexbox: When to Use What", excerpt:"Understand the differences with practical examples and patterns.", content:"<p>Full blog post content here... comparisons and examples.</p>".repeat(8), date:"2025-07-10", tags:["CSS","Layout","Design"], published:true }
        ];
      }
    }
    BLOG_POSTS = (posts || []).filter(p => p.published);
    renderBlogPosts(BLOG_POSTS);
  } catch {
    container.innerHTML = '<div class="error">Failed to load blog posts. Please check your blog.json file or use the admin panel.</div>';
  }
}

function renderBlogPosts(posts) {
  const container = document.getElementById('blog-container');
  const grid = document.createElement('div');
  grid.className = 'blog-grid';

  posts.forEach(post => {
    const formattedDate = new Date(post.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.innerHTML = `
      <div class="blog-content">
        <div class="blog-date">${formattedDate}</div>
        <h3 class="blog-title">${post.title}</h3>
        <p class="blog-excerpt">${post.excerpt}</p>
        <a href="#" class="blog-link" data-postid="${post.id}">Read More →</a>
      </div>`;
    grid.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(grid);
}

// Delegated click so it works after re-renders (no refresh needed)
function setupDelegatedBlogClicks() {
  const blogContainer = document.getElementById('blog-container');
  if (!blogContainer) return;
  if (blogContainer.dataset.listenerBound) return;
  blogContainer.addEventListener('click', (e) => {
    const link = e.target.closest('.blog-link');
    if (!link) return;
    e.preventDefault();
    const id = Number(link.getAttribute('data-postid'));
    if (!Number.isNaN(id)) openBlogPost(id);
  });
  blogContainer.dataset.listenerBound = 'true';
}

// =========================
/* Blog Modal */
// =========================
function openBlogPost(postId) {
  const post = BLOG_POSTS.find(p => p.id === postId);
  if (!post) return;

  const modal = document.getElementById('post-modal');
  const dialog = modal.querySelector('.modal-dialog');

  document.getElementById('post-modal-title').textContent = post.title;
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  document.getElementById('post-modal-meta').textContent = formattedDate + (post.tags?.length ? ` • ${post.tags.join(' · ')}` : '');
  document.getElementById('post-modal-content').innerHTML = (post.content && post.content.trim()) ? post.content : post.excerpt;

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  setBodyLock(true);
  dialog.focus();
}

function closePostModal() {
  const modal = document.getElementById('post-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  setBodyLock(false);
}

function setupPostModal() {
  document.getElementById('post-modal').addEventListener('click', (e) => {
    if (e.target.dataset.close === 'true') closePostModal();
  });
  document.getElementById('modal-close').addEventListener('click', closePostModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('post-modal').classList.contains('active')) {
      closePostModal();
    }
  });
}

// =========================
/* Contact / CV Modal */
// =========================
function setupContactModal() {
  const emailEl = document.getElementById('contact-email');
  const mailBtn = document.getElementById('mailto-button');
  const waBtn = document.getElementById('whatsapp-button');

  // Populate contact targets
  emailEl.textContent = CONTACT_EMAIL;
  mailBtn.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("CV Request")}&body=${encodeURIComponent("Hi Olusegun, kindly share your CV with me. Thank you.")}`;

  const waMsg = "Hi Olusegun, I'd like to request your CV.";
  waBtn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  // Copy email to clipboard
  document.getElementById('copy-email').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      const btn = document.getElementById('copy-email');
      const prev = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => (btn.textContent = prev), 1200);
    } catch { /* noop */ }
  });

  // Backdrop & close button
  document.getElementById('contact-modal').addEventListener('click', (e) => {
    if (e.target.dataset.close === 'true') closeContactModal();
  });
  document.getElementById('contact-close').addEventListener('click', closeContactModal);

  // Esc support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('contact-modal').classList.contains('active')) {
      closeContactModal();
    }
  });
}

function openContactModal() {
  const modal = document.getElementById('contact-modal');
  const dialog = modal.querySelector('.modal-dialog');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  setBodyLock(true);
  dialog.focus();
}
function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  setBodyLock(false);
}

// Bind header CTA without inline handlers
function setupCVButton() {
  const cvLink = document.getElementById('download-cv-link');
  if (!cvLink) return;
  cvLink.addEventListener('click', (e) => {
    e.preventDefault();
    openContactModal();
  });
}

// =========================
/* Contact form -> WhatsApp + optional email */
// =========================
function setupContactForm() {
  const waForm = document.getElementById('whatsapp-form');
  const alsoEmail = document.getElementById('also-email');
  const emailInsteadBtn = document.getElementById('email-instead');
  if (!waForm) return;

  function composeMessage() {
    const name = (document.getElementById('name').value || '').trim();
    const email = (document.getElementById('email').value || '').trim();
    const message = (document.getElementById('message').value || '').trim();
    return { name, email, message };
  }
  function buildText({ name, email, message }) {
    return `Hello Olusegun, my name is ${name}.\n\n${message}${email ? `\n\nEmail: ${email}` : ''}`;
  }

  // Submit via WhatsApp (+ optional email)
  waForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = composeMessage();
    if (!data.name || !data.message) { alert('Please provide your name and a message.'); return; }
    const txt = buildText(data);
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`;
    window.open(waUrl, '_blank');

    if (alsoEmail && alsoEmail.checked) {
      const subject = `Website Contact – ${data.name}`;
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(txt)}`;
      setTimeout(() => { window.location.href = mailto; }, 400);
    }
  });

  // Email-only path
  if (emailInsteadBtn) {
    emailInsteadBtn.addEventListener('click', () => {
      const data = composeMessage();
      if (!data.name || !data.message) { alert('Please provide your name and a message.'); return; }
      const txt = buildText(data);
      const subject = `Website Contact – ${data.name}`;
      const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(txt)}`;
      window.location.href = mailto;
    });
  }
}
