const fs = require('fs');
const path = require('path');

console.log('🌿 Refactoring layout: Removing Board & Projects, resizing logo, and applying transparent styling...');

// 1. Refactor index.html
let html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

// Remove navBoard link
html = html.replace(/\s*<a href="#board" class="nav-link" id="navBoard">.*?<\/a>/g, '');

// Remove board section
html = html.replace(/\s*<!-- =+\s*BOARD OF DIRECTORS & LEADERSHIP[\s\S]*?<\/section>/g, '');

// Remove projects section
html = html.replace(/\s*<!-- =+\s*TRACK RECORD & MAJOR PROJECTS[\s\S]*?<\/section>/g, '');

// Remove footer links for board and projects
html = html.replace(/\s*<a href="#board" class="footer-link" id="footerNavBoard">.*?<\/a>/g, '');
html = html.replace(/\s*<a href="#projects" class="footer-link" id="footerNavProjects">.*?<\/a>/g, '');

// Refactor About Section: replace management message box with an elegant Company Pillars / Overview Card
const oldAboutGridRegex = /<!-- About Details Grid -->[\s\S]*?<!-- 6 Values & Principles -->/;
const newAboutGrid = `<!-- About Details Grid -->
        <div class="about-grid">
          <!-- Company Pillars & Heritage Card -->
          <div class="about-card-gold">
            <div class="about-badge-tag" style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(212,175,55,0.15); border:1px solid rgba(212,175,55,0.4); padding:0.4rem 1rem; border-radius:30px; margin-bottom:1.25rem;">
              <span style="font-size:1.1rem;">🌱</span>
              <span style="color:var(--gold-bright); font-weight:700; font-size:0.88rem;" id="aboutTagBadge">ريادة وتميز زراعي</span>
            </div>
            <h3 style="color:var(--gold-light); font-size:1.45rem; font-weight:800; margin-bottom:1.1rem; line-height:1.4;" id="aboutManagementTitle">ريادة التصدير الزراعي والغذائي المستدام</h3>
            <p class="management-quote" id="aboutManagementQuote" style="font-size:1.05rem; line-height:1.85; color:rgba(255,255,255,0.9);">
              تلتزم شركة جرين جاردنز بتقديم أعلى معايير الجودة العالمية في زراعة وإنتاج وتصدير الحاصلات الزراعية الطازجة والمجمدة، من خلال إدارة مزارع نموذجية حديثة بنظم الري المحوري المتطورة وضمان سلامة الغذاء والتتبع الدقيق لكافة الشحنات.
            </p>
            <div class="about-highlights-list" style="margin-top:1.5rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem;">
              <div style="background:rgba(255,255,255,0.05); padding:0.85rem 1rem; border-radius:12px; border-inline-start:3px solid var(--gold-bright);">
                <div style="font-size:1.25rem; font-weight:800; color:#fff;">620+ فدان</div>
                <div style="font-size:0.82rem; color:rgba(255,255,255,0.7);">مزارع ذاتية حديثة</div>
              </div>
              <div style="background:rgba(255,255,255,0.05); padding:0.85rem 1rem; border-radius:12px; border-inline-start:3px solid var(--gold-bright);">
                <div style="font-size:1.25rem; font-weight:800; color:#fff;">Global GAP & ISO</div>
                <div style="font-size:0.82rem; color:rgba(255,255,255,0.7);">أعلى معايير الأمان</div>
              </div>
            </div>
          </div>

          <!-- Vision & Mission Column -->
          <div class="vm-grid">
            <div class="vm-card">
              <div class="vm-header">
                <span style="font-size:1.5rem; margin-inline-end:0.5rem;">🎯</span>
                <h3 id="visionTitleText" style="display:inline;">رؤيتنا</h3>
              </div>
              <p id="visionBodyText" style="line-height:1.8;">
                <!-- Populated by JS -->
              </p>
            </div>

            <div class="vm-card">
              <div class="vm-header">
                <span style="font-size:1.5rem; margin-inline-end:0.5rem;">🚀</span>
                <h3 id="missionTitleText" style="display:inline;">رسالتنا</h3>
              </div>
              <p id="missionBodyText" style="line-height:1.8;">
                <!-- Populated by JS -->
              </p>
            </div>
          </div>
        </div>

        <!-- 6 Values & Principles -->`;

html = html.replace(oldAboutGridRegex, newAboutGrid);

fs.writeFileSync(path.join(__dirname, '..', 'index.html'), html, 'utf8');
console.log('✅ Updated index.html');


// 2. Refactor CSS Logo Sizing in assets/css/style.css
let css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'style.css'), 'utf8');

// Replace standard logo sizing
css = css.replace(/\.logo-img-wrapper\s*\{[\s\S]*?transition: var\(--transition-smooth\);\s*\}/, `.logo-img-wrapper {
  width: clamp(52px, 4.5vw, 68px);
  height: clamp(52px, 4.5vw, 68px);
  border-radius: 0;
  padding: 0;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: visible;
  flex-shrink: 0;
  transition: var(--transition-smooth);
}`);

css = css.replace(/\.site-header\.scrolled \.logo-img-wrapper\s*\{[\s\S]*?\}/, `.site-header.scrolled .logo-img-wrapper {
  width: clamp(42px, 3.5vw, 52px);
  height: clamp(42px, 3.5vw, 52px);
}`);

css = css.replace(/\.logo-img-wrapper img\s*\{[\s\S]*?transition: var\(--transition-smooth\);\s*\}/, `.logo-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0;
  filter: drop-shadow(0 4px 15px rgba(0, 0, 0, 0.35));
  transition: var(--transition-smooth);
}`);

css = css.replace(/\.brand-logo:hover \.logo-img-wrapper img\s*\{[\s\S]*?\}/, `.brand-logo:hover .logo-img-wrapper img {
  transform: scale(1.06) rotate(1deg);
  filter: drop-shadow(0 6px 20px rgba(212, 175, 55, 0.6));
}`);

// Replace section badge logo image sizing
css = css.replace(/\.section-brand-badge img\s*\{[\s\S]*?filter 0\.4s ease;\s*\}/, `.section-brand-badge img {
  width: clamp(38px, 4vw, 50px);
  height: clamp(38px, 4vw, 50px);
  object-fit: contain;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding: 0 !important;
  filter: drop-shadow(0 4px 14px rgba(212, 175, 55, 0.45));
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
}`);

// Replace footer logo sizing
css = css.replace(/\.footer-brand \.logo-img-wrapper\s*\{[\s\S]*?box-shadow: none !important;\s*\}/, `.footer-brand .logo-img-wrapper {
  width: 65px;
  height: 65px;
  border-radius: 0;
  padding: 0;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}`);

css = css.replace(/\.footer-brand \.logo-img-wrapper img\s*\{[\s\S]*?\}/, `.footer-brand .logo-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 0;
  filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.4));
}`);

// Replace all media query oversized logo-img-wrapper rules
css = css.replace(/width:\s*125px\s*!important;\s*height:\s*125px\s*!important;/g, 'width: 56px !important; height: 56px !important;');
css = css.replace(/width:\s*110px\s*!important;\s*height:\s*110px\s*!important;/g, 'width: 52px !important; height: 52px !important;');
css = css.replace(/width:\s*106px\s*!important;\s*height:\s*106px\s*!important;/g, 'width: 48px !important; height: 48px !important;');
css = css.replace(/width:\s*72px\s*!important;\s*height:\s*72px\s*!important;/g, 'width: 44px !important; height: 44px !important;');
css = css.replace(/width:\s*390px;\s*height:\s*390px;/g, 'width: 65px; height: 65px;');

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'css', 'style.css'), css, 'utf8');
console.log('✅ Updated assets/css/style.css');

console.log('✨ Refactoring completed successfully!');
