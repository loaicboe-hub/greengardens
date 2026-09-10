/**
 * ALMASA DEVELOPMENT & AGRO-EXPORT - PURE BILINGUAL CONTROLLER
 */

// Application State
const AppState = {
  currentLang: localStorage.getItem('almasa_lang') || 'ar',
  activeTradeType: 'export',
  activeSubcategory: 'all',
  selectedProduct: null
};

// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', async () => {
  initSplashScreen();
  initLanguage();
  initNavigation();
  renderAllSections();
  initModals();
  initInquiryForm();
  initScrollAnimations();
  await fetchLiveContent();
});

async function fetchLiveContent() {
  try {
    // 1. Fetch content (Hero, About, Board, Stats, Values)
    const contentRes = await fetch('/api/content');
    const contentData = await contentRes.json();
    if (contentData.success && contentData.data) {
      const c = contentData.data;

      // Update Arabic Data
      if (ALMASA_DATA && ALMASA_DATA.ar) {
        if (c.hero) {
          if (c.hero.badge_ar) ALMASA_DATA.ar.ui.heroBadge = c.hero.badge_ar;
          if (c.hero.cta_catalog_ar) ALMASA_DATA.ar.ui.heroCtaCatalog = c.hero.cta_catalog_ar;
          if (c.hero.cta_rfq_ar) ALMASA_DATA.ar.ui.heroCtaRfq = c.hero.cta_rfq_ar;
          if (c.hero.float1_title_ar) ALMASA_DATA.ar.ui.heroFloating1Title = c.hero.float1_title_ar;
          if (c.hero.float1_sub_ar) ALMASA_DATA.ar.ui.heroFloating1Sub = c.hero.float1_sub_ar;
          if (c.hero.float2_title_ar) ALMASA_DATA.ar.ui.heroFloating2Title = c.hero.float2_title_ar;
          if (c.hero.float2_sub_ar) ALMASA_DATA.ar.ui.heroFloating2Sub = c.hero.float2_sub_ar;
          if (c.hero.subtitle_ar) ALMASA_DATA.ar.company.aboutSummary = c.hero.subtitle_ar;
        }
        if (c.about) {
          if (c.about.title_ar) ALMASA_DATA.ar.ui.aboutTitle = c.about.title_ar;
          if (c.about.desc_ar) ALMASA_DATA.ar.ui.aboutDesc = c.about.desc_ar;
          if (c.about.vision_text_ar) ALMASA_DATA.ar.company.visionText = c.about.vision_text_ar;
          if (c.about.mission_text_ar) ALMASA_DATA.ar.company.missionText = c.about.mission_text_ar;
          if (c.about.msg_text_ar) ALMASA_DATA.ar.company.managementMsg = c.about.msg_text_ar;
          if (c.about.sign_ar) ALMASA_DATA.ar.company.managementSign = c.about.sign_ar;
        }
        if (c.farms) {
          if (c.farms.title_ar) ALMASA_DATA.ar.ui.farmsTitle = c.farms.title_ar;
          if (c.farms.desc_ar) ALMASA_DATA.ar.ui.farmsDesc = c.farms.desc_ar;
        }
        if (c.stats && Array.isArray(c.stats)) {
          ALMASA_DATA.ar.company.stats = c.stats.map(s => ({ value: s.value, label: s.label_ar }));
        }
        if (c.values && Array.isArray(c.values)) {
          ALMASA_DATA.ar.company.values = c.values.map(v => ({ num: v.num, title: v.title_ar, desc: v.desc_ar }));
        }
        if (c.board && Array.isArray(c.board)) {
          ALMASA_DATA.ar.board = c.board.map(b => {
            let badge = 'قيادة تنفيذية';
            const r = b.role_ar || '';
            if (r.includes('رئيس مجلس')) badge = 'القيادة العليا';
            else if (r.includes('نائب')) badge = 'العضو المنتدب';
            else if (r.includes('عضو') || r.includes('عضوة')) badge = 'مجلس الإدارة';
            else if (r.includes('مالي')) badge = 'القطاع المالي';
            else if (r.includes('تجاري')) badge = 'القطاع التجاري';
            else if (r.includes('تسويق')) badge = 'قطاع التسويق';
            else if (r.includes('قانوني')) badge = 'القطاع القانوني';
            else if (r.includes('علاقات') || r.includes('تصدير')) badge = 'العلاقات والتصدير';
            else if (r.includes('أمني')) badge = 'القطاع الأمني';

            return {
              id: String(b.id),
              name: b.name_ar,
              role: b.role_ar,
              desc: b.bio_ar || '',
              image: b.image_url || 'assets/images/logo.png',
              badge
            };
          });
        }
      }

      // Update English Data
      if (ALMASA_DATA && ALMASA_DATA.en) {
        if (c.hero) {
          if (c.hero.badge_en) ALMASA_DATA.en.ui.heroBadge = c.hero.badge_en;
          if (c.hero.cta_catalog_en) ALMASA_DATA.en.ui.heroCtaCatalog = c.hero.cta_catalog_en;
          if (c.hero.cta_rfq_en) ALMASA_DATA.en.ui.heroCtaRfq = c.hero.cta_rfq_en;
          if (c.hero.float1_title_en) ALMASA_DATA.en.ui.heroFloating1Title = c.hero.float1_title_en;
          if (c.hero.float1_sub_en) ALMASA_DATA.en.ui.heroFloating1Sub = c.hero.float1_sub_en;
          if (c.hero.float2_title_en) ALMASA_DATA.en.ui.heroFloating2Title = c.hero.float2_title_en;
          if (c.hero.float2_sub_en) ALMASA_DATA.en.ui.heroFloating2Sub = c.hero.float2_sub_en;
          if (c.hero.subtitle_en) ALMASA_DATA.en.company.aboutSummary = c.hero.subtitle_en;
        }
        if (c.about) {
          if (c.about.title_en) ALMASA_DATA.en.ui.aboutTitle = c.about.title_en;
          if (c.about.desc_en) ALMASA_DATA.en.ui.aboutDesc = c.about.desc_en;
          if (c.about.vision_text_en) ALMASA_DATA.en.company.visionText = c.about.vision_text_en;
          if (c.about.mission_text_en) ALMASA_DATA.en.company.missionText = c.about.mission_text_en;
          if (c.about.msg_text_en) ALMASA_DATA.en.company.managementMsg = c.about.msg_text_en;
          if (c.about.sign_en) ALMASA_DATA.en.company.managementSign = c.about.sign_en;
        }
        if (c.farms) {
          if (c.farms.title_en) ALMASA_DATA.en.ui.farmsTitle = c.farms.title_en;
          if (c.farms.desc_en) ALMASA_DATA.en.ui.farmsDesc = c.farms.desc_en;
        }
        if (c.stats && Array.isArray(c.stats)) {
          ALMASA_DATA.en.company.stats = c.stats.map(s => ({ value: s.value, label: s.label_en || s.label_ar }));
        }
        if (c.values && Array.isArray(c.values)) {
          ALMASA_DATA.en.company.values = c.values.map(v => ({ num: v.num, title: v.title_en || v.title_ar, desc: v.desc_en || v.desc_ar }));
        }
        if (c.board && Array.isArray(c.board)) {
          ALMASA_DATA.en.board = c.board.map(b => {
            let badge = 'Executive Leadership';
            const role = (b.role_en || '').toLowerCase();
            if (role.includes('chairwoman') || role.includes('chairman')) badge = 'Top Leadership';
            else if (role.includes('managing director') || role.includes('vice')) badge = 'Managing Director';
            else if (role.includes('board member')) badge = 'Board Member';
            else if (role.includes('financial') || role.includes('cfo')) badge = 'Finance';
            else if (role.includes('commercial')) badge = 'Commercial';
            else if (role.includes('marketing')) badge = 'Marketing';
            else if (role.includes('legal')) badge = 'Legal';
            else if (role.includes('export') || role.includes('relations')) badge = 'Export & Relations';
            else if (role.includes('security')) badge = 'Security';

            return {
              id: String(b.id),
              name: b.name_en || b.name_ar,
              role: b.role_en || b.role_ar,
              desc: b.bio_en || b.bio_ar || '',
              image: b.image_url || 'assets/images/logo.png',
              badge
            };
          });
        }
      }

      // Update French Data
      if (ALMASA_DATA && ALMASA_DATA.fr) {
        if (c.hero) {
          if (c.hero.badge_fr) ALMASA_DATA.fr.ui.heroBadge = c.hero.badge_fr;
          if (c.hero.subtitle_fr) ALMASA_DATA.fr.company.aboutSummary = c.hero.subtitle_fr;
        }
        if (c.about) {
          if (c.about.title_fr) ALMASA_DATA.fr.ui.aboutTitle = c.about.title_fr;
          if (c.about.desc_fr) ALMASA_DATA.fr.ui.aboutDesc = c.about.desc_fr;
          if (c.about.vision_text_fr) ALMASA_DATA.fr.company.visionText = c.about.vision_text_fr;
          if (c.about.mission_text_fr) ALMASA_DATA.fr.company.missionText = c.about.mission_text_fr;
          if (c.about.msg_text_fr) ALMASA_DATA.fr.company.managementMsg = c.about.msg_text_fr;
        }
        if (c.stats && Array.isArray(c.stats)) {
          ALMASA_DATA.fr.company.stats = c.stats.map((s, idx) => ({
            value: s.value,
            label: s.label_fr || (ALMASA_DATA.fr.company.stats[idx] ? ALMASA_DATA.fr.company.stats[idx].label : (s.label_en || s.label_ar))
          }));
        }
        if (c.values && Array.isArray(c.values)) {
          ALMASA_DATA.fr.company.values = c.values.map((v, idx) => ({
            num: v.num,
            title: v.title_fr || (ALMASA_DATA.fr.company.values[idx] ? ALMASA_DATA.fr.company.values[idx].title : (v.title_en || v.title_ar)),
            desc: v.desc_fr || (ALMASA_DATA.fr.company.values[idx] ? ALMASA_DATA.fr.company.values[idx].desc : (v.desc_en || v.desc_ar))
          }));
        }
      }

      // Update Russian Data
      if (ALMASA_DATA && ALMASA_DATA.ru) {
        if (c.hero) {
          if (c.hero.badge_ru) ALMASA_DATA.ru.ui.heroBadge = c.hero.badge_ru;
          if (c.hero.subtitle_ru) ALMASA_DATA.ru.company.aboutSummary = c.hero.subtitle_ru;
        }
        if (c.about) {
          if (c.about.title_ru) ALMASA_DATA.ru.ui.aboutTitle = c.about.title_ru;
          if (c.about.desc_ru) ALMASA_DATA.ru.ui.aboutDesc = c.about.desc_ru;
          if (c.about.vision_text_ru) ALMASA_DATA.ru.company.visionText = c.about.vision_text_ru;
          if (c.about.mission_text_ru) ALMASA_DATA.ru.company.missionText = c.about.mission_text_ru;
          if (c.about.msg_text_ru) ALMASA_DATA.ru.company.managementMsg = c.about.msg_text_ru;
        }
        if (c.stats && Array.isArray(c.stats)) {
          ALMASA_DATA.ru.company.stats = c.stats.map((s, idx) => ({
            value: s.value,
            label: s.label_ru || (ALMASA_DATA.ru.company.stats[idx] ? ALMASA_DATA.ru.company.stats[idx].label : (s.label_en || s.label_ar))
          }));
        }
        if (c.values && Array.isArray(c.values)) {
          ALMASA_DATA.ru.company.values = c.values.map((v, idx) => ({
            num: v.num,
            title: v.title_ru || (ALMASA_DATA.ru.company.values[idx] ? ALMASA_DATA.ru.company.values[idx].title : (v.title_en || v.title_ar)),
            desc: v.desc_ru || (ALMASA_DATA.ru.company.values[idx] ? ALMASA_DATA.ru.company.values[idx].desc : (v.desc_en || v.desc_ar))
          }));
        }
      }
    }

    // 2. Fetch live settings (Contact phone, email, whatsapp)
    const settingsRes = await fetch('/api/settings');
    const settingsData = await settingsRes.json();
    if (settingsData.success && settingsData.data) {
      const s = settingsData.data;
      if (s.company_phone) {
        document.querySelectorAll('.company-phone-link').forEach(el => {
          el.textContent = s.company_phone;
          el.href = `tel:${s.company_phone.replace(/\s+/g, '')}`;
        });
      }
      if (s.company_whatsapp) {
        document.querySelectorAll('.company-whatsapp-link').forEach(el => {
          el.href = `https://wa.me/${s.company_whatsapp.replace(/[^0-9]/g, '')}`;
        });
      }
      if (s.company_email) {
        document.querySelectorAll('.company-email-link').forEach(el => {
          el.textContent = s.company_email;
          el.href = `mailto:${s.company_email}`;
        });
      }
    }

    // 3. Fetch live products from database / API
    try {
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      if (prodData.success && Array.isArray(prodData.data) && prodData.data.length > 0) {
        const catMap = {
          1: 'fresh-fruits',
          2: 'fresh-veg',
          3: 'fresh-exotic',
          4: 'frozen-fruits',
          5: 'frozen-veg',
          6: 'grains'
        };
        const catNameMapAr = {
          1: 'فواكه طازجة',
          2: 'خضروات طازجة',
          3: 'فواكه استوائية ونادرة',
          4: 'فواكه مجمدة',
          5: 'خضروات مجمدة',
          6: 'حبوب ومحاصيل'
        };
        const catNameMapEn = {
          1: 'Fresh Fruits',
          2: 'Fresh Vegetables',
          3: 'Fresh Exotic & Tropical Fruits',
          4: 'Frozen Fruits',
          5: 'Frozen Vegetables',
          6: 'Crops & Grains'
        };

        if (ALMASA_DATA && ALMASA_DATA.ar) {
          ALMASA_DATA.ar.products = prodData.data.map(p => {
            const pImages = (Array.isArray(p.images) && p.images.length > 0)
              ? p.images.filter(Boolean).slice(0, 5)
              : [p.image_url || 'assets/images/valencia-oranges.jpg'];
            const primaryImg = pImages[0] || p.image_url || 'assets/images/valencia-oranges.jpg';

            return {
              id: p.slug || String(p.id),
              name: p.name_ar,
              tradeType: p.trade_type || 'export',
              category: catMap[p.category_id] || (p.category_slug || 'fresh-fruits'),
              categoryName: p.category_name_ar || catNameMapAr[p.category_id] || 'فواكه طازجة',
              image: primaryImg,
              images: pImages,
              badge: p.tag_ar || 'صادرات ممتازة',
              season: p.season_ar || 'موسمي',
              origin: 'مصر (مزارع شركة الماسة)',
              sizes: p.variety_ar || 'أصناف متعددة',
              packaging: p.packaging_ar || 'كرتون تصدير دولي',
              temp: (p.category_id == 4 || p.category_id == 5) ? '-18° مئوية' : '+2° إلى +6° مئوية',
              specs: p.variety_ar ? `${p.variety_ar} - مطابقة لأعلى معايير التصدير الدولية.` : 'خالي من متبقيات المبيدات ومطابق لمواصفات التصدير الدولية.',
              description: `${p.name_ar} فائق الجودة، مفرز ومغسول ومصنف بأحدث خطوط الفرز الإلكتروني للتصدير لكافة الأسواق العالمية.`
            };
          });
        }

        if (ALMASA_DATA && ALMASA_DATA.en) {
          ALMASA_DATA.en.products = prodData.data.map(p => {
            const pImages = (Array.isArray(p.images) && p.images.length > 0)
              ? p.images.filter(Boolean).slice(0, 5)
              : [p.image_url || 'assets/images/valencia-oranges.jpg'];
            const primaryImg = pImages[0] || p.image_url || 'assets/images/valencia-oranges.jpg';

            return {
              id: p.slug || String(p.id),
              name: p.name_en || p.name_ar,
              tradeType: p.trade_type || 'export',
              category: catMap[p.category_id] || (p.category_slug || 'fresh-fruits'),
              categoryName: p.category_name_en || catNameMapEn[p.category_id] || 'Fresh Fruits',
              image: primaryImg,
              images: pImages,
              badge: p.tag_en || p.tag_ar || 'Premium Export',
              season: p.season_en || p.season_ar || 'Seasonal',
              origin: 'Egypt (ALMASA Farms)',
              sizes: p.variety_en || p.variety_ar || 'Standard Grades',
              packaging: p.packaging_en || p.packaging_ar || 'International Export Cartons',
              temp: (p.category_id == 4 || p.category_id == 5) ? '-18°C or below' : '+2°C to +6°C',
              specs: p.variety_en ? `${p.variety_en} - compliant with international export standards.` : 'Zero pesticide residues, full compliance with EU and Global standards.',
              description: `Top grade ${p.name_en || p.name_ar}, harvested at optimal maturity and packed with advanced electronic sorting lines.`
            };
          });
        }

        if (ALMASA_DATA && ALMASA_DATA.fr) {
          const catNameMapFr = {
            1: 'Fruits Frais',
            2: 'Légumes Frais',
            3: 'Fruits Exotiques & Tropicaux',
            4: 'Fruits Surgelés',
            5: 'Légumes Surgelés',
            6: 'Céréales & Légumineuses'
          };
          ALMASA_DATA.fr.products = prodData.data.map(p => {
            const pImages = (Array.isArray(p.images) && p.images.length > 0)
              ? p.images.filter(Boolean).slice(0, 5)
              : [p.image_url || 'assets/images/valencia-oranges.jpg'];
            const primaryImg = pImages[0] || p.image_url || 'assets/images/valencia-oranges.jpg';

            return {
              id: p.slug || String(p.id),
              name: p.name_en || p.name_ar,
              tradeType: p.trade_type || 'export',
              category: catMap[p.category_id] || (p.category_slug || 'fresh-fruits'),
              categoryName: catNameMapFr[p.category_id] || 'Fruits Frais',
              image: primaryImg,
              images: pImages,
              badge: 'Export Premium',
              season: p.season_en || 'Saisonnier',
              origin: 'Égypte (Domaines ALMASA)',
              sizes: p.variety_en || 'Calibres Standards',
              packaging: p.packaging_en || 'Cartons Master Export',
              temp: (p.category_id == 4 || p.category_id == 5) ? '-18°C ou inférieur' : '+2°C à +6°C',
              specs: 'Zéro résidu de pesticides, conforme aux normes européennes et internationales.',
              description: `Récolte d'excellence ${p.name_en || p.name_ar}, conditionnée avec un tri optique de précision.`
            };
          });
        }

        if (ALMASA_DATA && ALMASA_DATA.ru) {
          const catNameMapRu = {
            1: 'Свежие фрукты',
            2: 'Свежие овощи',
            3: 'Экзотические фрукты',
            4: 'Замороженные фрукты',
            5: 'Замороженные овощи',
            6: 'Зерновые и бобовые'
          };
          ALMASA_DATA.ru.products = prodData.data.map(p => {
            const existing = (ALMASA_DATA.ru.products || []).find(ep => ep.id === (p.slug || String(p.id)));
            const pImages = (Array.isArray(p.images) && p.images.length > 0)
              ? p.images.filter(Boolean).slice(0, 5)
              : [p.image_url || (existing ? existing.image : 'assets/images/valencia-oranges.jpg')];
            const primaryImg = pImages[0] || p.image_url || (existing ? existing.image : 'assets/images/valencia-oranges.jpg');

            return {
              id: p.slug || String(p.id),
              name: existing ? existing.name : (p.name_en || p.name_ar),
              tradeType: p.trade_type || 'export',
              category: catMap[p.category_id] || (p.category_slug || 'fresh-fruits'),
              categoryName: catNameMapRu[p.category_id] || 'Сельхозпродукция',
              image: primaryImg,
              images: pImages,
              badge: existing ? existing.badge : 'Премиум экспорт',
              season: existing ? existing.season : (p.season_en || 'Сезонный урожай'),
              origin: existing ? existing.origin : 'Египет (Фермы «Аль-Маса»)',
              sizes: existing ? existing.sizes : (p.variety_en || 'Калиброванные сорта'),
              packaging: existing ? existing.packaging : (p.packaging_en || 'Экспортная упаковка'),
              temp: (p.category_id == 4 || p.category_id == 5) ? '-18°C или ниже' : '+2°C до +6°C',
              specs: existing ? existing.specs : 'Без остатков пестицидов, полное соответствие стандартам ISO и GlobalGAP.',
              description: existing ? existing.description : `Отборная продукция ${p.name_en || p.name_ar}, откалиброванная на оптических линиях.`
            };
          });
        }
      }
    } catch (e) {
      console.warn('Products live sync fallback to static data.');
    }

    // Re-render UI with latest dynamic database data
    renderAllSections();
  } catch (err) {
    console.warn('Using offline dataset fallback for main website.');
  }
}


/* ==========================================================================
   LANGUAGE & LOCALIZATION CONTROLLER (TRILINGUAL: AR, EN, FR)
   ========================================================================== */
function closeMobileMenu() {
  const navMenu = document.getElementById('navMenu');
  const mobileToggle = document.getElementById('mobileMenuBtn');
  if (navMenu) {
    navMenu.classList.remove('open');
  }
  if (mobileToggle) {
    mobileToggle.classList.remove('active');
    mobileToggle.innerHTML = '☰';
  }
  document.body.style.overflow = '';
}

function initLanguage() {
  const langToggleBtn = document.getElementById('langToggleBtn');
  const langWrapper = document.getElementById('langDropdownWrapper');
  const langOptions = document.querySelectorAll('.lang-option-btn, .mobile-lang-chip');

  // Dropdown open / close toggle
  if (langToggleBtn && langWrapper) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langWrapper.classList.toggle('open');
      const isExpanded = langWrapper.classList.contains('open');
      langToggleBtn.setAttribute('aria-expanded', isExpanded);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!langWrapper.contains(e.target)) {
        langWrapper.classList.remove('open');
        langToggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Option selection
  langOptions.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetLang = btn.dataset.lang;
      if (targetLang && ALMASA_DATA[targetLang]) {
        applyLanguage(targetLang);
        langWrapper?.classList.remove('open');
        langToggleBtn?.setAttribute('aria-expanded', 'false');
        closeMobileMenu();
      }
    });
  });

  applyLanguage(AppState.currentLang);
}

const FLAG_ICONS = {
  ar: `<svg class="lang-flag-icon" viewBox="0 0 640 480" width="20" height="15" aria-hidden="true"><rect width="640" height="160" fill="#ce1126"/><rect y="160" width="640" height="160" fill="#ffffff"/><rect y="320" width="640" height="160" fill="#000000"/><path d="M320 200 c-12 0 -22 10 -22 25 c0 20 12 40 22 55 c10 -15 22 -35 22 -55 c0 -15 -10 -25 -22 -25 z" fill="#c59b27"/><path d="M305 225 c-15 -10 -25 5 -18 20 c8 18 22 30 33 35 c11 -5 25 -17 33 -35 c7 -15 -3 -30 -18 -20 c-5 5 -12 8 -15 8 c-3 0 -10 -3 -15 -8 z" fill="#d4af37"/><circle cx="320" cy="210" r="5" fill="#a17c1a"/><rect x="312" y="235" width="16" height="20" rx="2" fill="#c59b27" stroke="#8b6814" stroke-width="1"/></svg>`,
  en: `<svg class="lang-flag-icon" viewBox="0 0 640 480" width="20" height="15" aria-hidden="true"><clipPath id="uk-flag-clip-current"><rect width="640" height="480" rx="2"/></clipPath><g clip-path="url(#uk-flag-clip-current)"><rect width="640" height="480" fill="#012169"/><path d="M0 0 L640 480 M640 0 L0 480" stroke="#ffffff" stroke-width="60"/><path d="M0 0 L640 480 M640 0 L0 480" stroke="#c8102e" stroke-width="40"/><path d="M0 0 L320 240 M640 480 L320 240" stroke="#ffffff" stroke-width="20"/><path d="M0 0 L320 240 M640 480 L320 240" stroke="#c8102e" stroke-width="15"/><path d="M320 0 v480 M0 240 h640" stroke="#ffffff" stroke-width="100"/><path d="M320 0 v480 M0 240 h640" stroke="#c8102e" stroke-width="60"/></g></svg>`,
  fr: `<svg class="lang-flag-icon" viewBox="0 0 640 480" width="20" height="15" aria-hidden="true"><rect width="213.3" height="480" fill="#002654"/><rect x="213.3" width="213.3" height="480" fill="#ffffff"/><rect x="426.6" width="213.4" height="480" fill="#ce1126"/></svg>`,
  ru: `<svg class="lang-flag-icon" viewBox="0 0 640 480" width="20" height="15" aria-hidden="true"><rect width="640" height="160" fill="#ffffff"/><rect y="160" width="640" height="160" fill="#0039a6"/><rect y="320" width="640" height="160" fill="#d52b1e"/></svg>`
};

function applyLanguage(lang) {
  if (!ALMASA_DATA[lang]) lang = 'ar';
  AppState.currentLang = lang;
  localStorage.setItem('almasa_lang', lang);

  const isRTL = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  // Update header language label and flag
  const langLabel = document.getElementById('langLabel');
  const langFlag = document.getElementById('currentLangFlag');
  if (langFlag) {
    langFlag.innerHTML = FLAG_ICONS[lang] || FLAG_ICONS.ar;
  }
  if (langLabel) {
    if (lang === 'ar') {
      langLabel.textContent = 'العربية';
    } else if (lang === 'fr') {
      langLabel.textContent = 'Français';
    } else if (lang === 'ru') {
      langLabel.textContent = 'Русский';
    } else {
      langLabel.textContent = 'English';
    }
  }

  // Update active class on dropdown items & mobile chips
  document.querySelectorAll('.lang-option-btn, .mobile-lang-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Re-render whole UI seamlessly
  renderAllSections();
}

function getLangData() {
  return ALMASA_DATA[AppState.currentLang] || ALMASA_DATA.ar;
}

/* ==========================================================================
   SECTION RENDERERS
   ========================================================================== */
function renderAllSections() {
  renderStaticTexts();
  renderProducts();
  renderFarms();
  renderProcess();
  renderBoard();
  renderProjects();
  renderValues();
  renderContacts();
  populateFormSelects();
}

function renderStaticTexts() {
  const d = getLangData();
  const ui = d.ui;
  const c = d.company;
  const lang = AppState.currentLang;

  // Update Page Title
  if (ui.pageTitle) {
    document.title = ui.pageTitle;
  }

  // Brand Header Logo Texts
  setElText('brandMainTitle', ui.brandTitle);
  setElText('brandSubTitle', ui.brandSub);

  // Splash Screen Brand & Badges
  setElText('splashBrandTitle', ui.brandTitle);
  setElText('splashBadgeText', ui.splashBadge || 'PREMIUM AGRO-FOOD EXPORT');
  if (lang === 'ar') {
    setElText('splashBrandSub', 'ريادة مصرية بمعايير عالمية في التصدير والاستثمار الزراعي');
    setElText('skipSplashText', 'تخطي ✕');
  } else if (lang === 'fr') {
    setElText('splashBrandSub', "Une signature égyptienne d'excellence dans l'exportation agroalimentaire");
    setElText('skipSplashText', 'Passer ✕');
  } else if (lang === 'ru') {
    setElText('splashBrandSub', 'Египетское лидерство по мировым стандартам в экспорте агропродукции');
    setElText('skipSplashText', 'Пропустить ✕');
  } else {
    setElText('splashBrandSub', 'Egyptian Leadership with Global Standards in Agri-Food Export');
    setElText('skipSplashText', 'Skip ✕');
  }

  // Section Brand Badges
  setElText('badgeAboutText', ui.badgeAbout || ui.brandTitle);
  setElText('badgeProductsText', ui.badgeProducts || 'GREEN GARDENS EXPORT CROPS');
  setElText('badgeFarmsText', ui.badgeFarms || 'GREEN GARDENS FARMS & INVESTMENT');
  setElText('badgeProcessText', ui.badgeProcess || 'GREEN GARDENS QUALITY ASSURANCE');
  setElText('badgeRfqText', ui.badgeRfq || 'GREEN GARDENS EXPORT INQUIRY');
  setElText('badgeContactText', ui.badgeContact || 'GREEN GARDENS CONTACT & BRANCHES');

  // Navigation Links
  setElText('navHome', ui.navHome);
  setElText('navAbout', ui.navAbout);
  setElText('navFarms', ui.navFarms);
  setElText('navProducts', ui.navProducts);
  setElText('navExportTitle', ui.navExportProducts || ui.navExportTitle);
  setElText('navExportSub', ui.navExportSub);
  setElText('navImportTitle', ui.navImportProducts || ui.navImportTitle);
  setElText('navImportSub', ui.navImportSub);
  setElText('navBoard', ui.navBoard);
  setElText('navContact', ui.navContact);

  // Hero Section
  setElText('heroBadgeText', ui.heroBadge);
  
  const heroTitleEl = document.getElementById('heroTitle');
  if (heroTitleEl) {
    if (lang === 'ar') {
      heroTitleEl.innerHTML = `ريادة مصرية بمعايير عالمية في <span class="hero-title-highlight">التصدير الزراعي والغذائي</span>`;
    } else if (lang === 'fr') {
      heroTitleEl.innerHTML = `Leadership Égyptien aux Standards Mondiaux dans <span class="hero-title-highlight">l'Export Agroalimentaire</span>`;
    } else if (lang === 'ru') {
      heroTitleEl.innerHTML = `Египетское лидерство мирового уровня в <span class="hero-title-highlight">экспорте агропродукции</span>`;
    } else {
      heroTitleEl.innerHTML = `Egyptian Leadership with Global Standards in <span class="hero-title-highlight">Agri-Food Export</span>`;
    }
  }

  setElText('heroDesc', c.aboutSummary);
  setElText('heroCtaCatalogText', ui.heroCtaCatalog);
  setElText('heroCtaRfqText', ui.heroCtaRfq);

  // Hero Floating Badges & Cards
  setElText('heroFloating1Title', ui.heroFloating1Title);
  setElText('heroFloating1Sub', ui.heroFloating1Sub);
  setElText('heroFloating2Title', ui.heroFloating2Title);
  setElText('heroFloating2Sub', ui.heroFloating2Sub);
  setElText('heroCardTag', ui.heroCardTag);
  setElText('heroCardTitle', ui.heroCardTitle);

  // Hero Stats Bar
  const statsContainer = document.getElementById('heroStatsContainer');
  if (statsContainer) {
    statsContainer.innerHTML = c.stats.map(s => `
      <div class="hero-stat-item">
        <div class="stat-number">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');
  }

  // About Section
  setElText('aboutSectionSubtitle', ui.aboutSubtitle);
  setElText('aboutSectionTitle', ui.aboutTitle);
  setElText('aboutSectionDesc', ui.aboutDesc);
  setElText('aboutManagementTitle', c.managementMsgTitle);
  setElText('aboutManagementQuote', `"${c.managementMsg}"`);
  setElText('aboutManagementSign', c.managementSign);
  setElText('aboutManagementSignRole', ui.managementSignRole);

  setElText('visionTitleText', c.visionTitle);
  setElText('visionBodyText', c.visionText);
  setElText('missionTitleText', c.missionTitle);
  setElText('missionBodyText', c.missionText);

  // Values Section
  setElText('valuesSectionSubtitle', ui.valuesSubtitle);
  setElText('valuesSectionTitle', ui.valuesTitle);

  // Products Section
  setElText('productsSectionSubtitle', ui.productsSubtitle);
  setElText('productsSectionTitle', ui.productsTitle);
  setElText('productsSectionDesc', ui.productsDesc);

  // Primary Trade Tabs & Sub-Category Filters
  setElText('tabExportText', ui.navExportProducts || 'منتجات التصدير');
  setElText('tabImportText', ui.navImportProducts || 'منتجات الاستيراد');
  setElText('filterAll', ui.filterAll || 'الكل');
  setElText('filterFreshFruits', ui.filterFreshFruits);
  setElText('filterFreshVeg', ui.filterFreshVeg);
  setElText('filterFreshExotic', ui.filterFreshExotic);
  setElText('filterFrozenFruits', ui.filterFrozenFruits);
  setElText('filterFrozenVeg', ui.filterFrozenVeg);
  setElText('filterGrains', ui.filterGrains);

  // Farms Section
  setElText('farmsSectionSubtitle', ui.farmsSubtitle);
  setElText('farmsSectionTitle', ui.farmsTitle);
  setElText('farmsSectionDesc', ui.farmsDesc);
  setElText('farmsHeroTitle', ui.farmsHeroTitle);
  setElText('farmsHeroDesc', ui.farmsHeroDesc);

  // Process Section
  setElText('processSectionSubtitle', ui.processSubtitle);
  setElText('processSectionTitle', ui.processTitle);
  setElText('processSectionDesc', ui.processDesc);

  // Board Section
  setElText('boardSectionSubtitle', ui.boardSubtitle);
  setElText('boardSectionTitle', ui.boardTitle);
  setElText('boardSectionDesc', ui.boardDesc);

  // Projects Section
  setElText('projectsSectionSubtitle', ui.projectsSubtitle);
  setElText('projectsSectionTitle', ui.projectsTitle);
  setElText('projectsSectionDesc', ui.projectsDesc);

  // RFQ Section
  setElText('rfqSectionSubtitle', ui.rfqSubtitle);
  setElText('rfqSectionTitle', ui.rfqTitle);
  setElText('rfqInfoTitle', ui.rfqInfoTitle);
  setElText('rfqInfoDesc', ui.rfqInfoDesc);
  setElText('rfqPerk1Text', ui.rfqPerk1);
  setElText('rfqPerk2Text', ui.rfqPerk2);
  setElText('rfqPerk3Text', ui.rfqPerk3);
  setElText('rfqPerk4Text', ui.rfqPerk4);

  // RFQ Form Labels & Placeholders
  setElText('lblFormName', ui.formNameLabel);
  setElAttr('rfqName', 'placeholder', ui.formNamePlaceholder);

  setElText('lblFormCompany', ui.formCompanyLabel);
  setElAttr('rfqCompany', 'placeholder', ui.formCompanyPlaceholder);

  setElText('lblFormEmail', ui.formEmailLabel);
  setElAttr('rfqEmail', 'placeholder', ui.formEmailPlaceholder);

  setElText('lblFormPhone', ui.formPhoneLabel);
  setElAttr('rfqPhone', 'placeholder', ui.formPhonePlaceholder);

  setElText('lblFormProduct', ui.formProductLabel);

  setElText('lblFormQuantity', ui.formQuantityLabel);
  setElAttr('rfqQuantity', 'placeholder', ui.formQuantityPlaceholder);

  setElText('lblFormDestination', ui.formDestinationLabel);
  setElAttr('rfqDestination', 'placeholder', ui.formDestinationPlaceholder);

  setElText('lblFormIncoterm', ui.formIncotermLabel);

  setElText('lblFormNotes', ui.formNotesLabel);
  setElAttr('rfqNotes', 'placeholder', ui.formNotesPlaceholder);

  setElText('rfqSubmitBtnText', ui.formSubmitBtn);

  // Contacts Section
  setElText('contactSectionSubtitle', ui.contactSubtitle || ui.contactsSubtitle);
  setElText('contactSectionTitle', ui.contactTitle || ui.contactsTitle);
  setElText('contactSectionDesc', ui.contactDesc || ui.contactsDesc);

  // Footer
  setElText('footerBrandTitle', ui.brandTitle);
  setElText('footerBrandSub', ui.brandSub);
  setElText('footerDescText', ui.footerDesc);
  setElText('footerColQuick', ui.footerColQuick);
  setElText('footerColCrops', ui.footerColCrops);
  setElText('footerColEmails', ui.footerColEmails);

  setElText('footerNavHome', ui.navHome);
  setElText('footerNavAbout', ui.navAbout);
  setElText('footerNavProducts', ui.navProducts);
  setElText('footerNavFarms', ui.navFarms);
  setElText('footerNavProcess', ui.footerNavProcess);
  setElText('footerNavBoard', ui.navBoard);
  setElText('footerNavProjects', ui.footerNavProjects);
  setElText('footerNavContact', ui.footerNavContact);

  setElText('footerCrop1', ui.footerCrop1);
  setElText('footerCrop2', ui.footerCrop2);
  setElText('footerCrop3', ui.footerCrop3);
  setElText('footerCrop4', ui.footerCrop4);
  setElText('footerCrop5', ui.footerCrop5);

  setElText('footerRightsText', `© 2026 ${ui.footerRights}`);
  setElText('footerCert1Text', ui.footerCert1);
  setElText('footerCert2Text', ui.footerCert2);
  setElText('footerCert3Text', ui.footerCert3);

  // Floating WhatsApp Tooltip
  const floatingWa = document.getElementById('floatingWhatsApp');
  if (floatingWa) {
    floatingWa.title = ui.chatWhatsAppBtn;
  }
}

function setElText(id, text) {
  const el = document.getElementById(id);
  if (el && text !== undefined) el.textContent = text;
}

function setElAttr(id, attr, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) el.setAttribute(attr, value);
}

/* ==========================================================================
   RENDER VALUES
   ========================================================================== */
function renderValues() {
  const container = document.getElementById('valuesGridContainer');
  if (!container) return;

  const d = getLangData();
  container.innerHTML = d.company.values.map(val => `
    <div class="value-card">
      <div class="value-num">${val.num}</div>
      <h4 class="value-title">${val.title}</h4>
      <p class="value-desc">${val.desc}</p>
    </div>
  `).join('');
}

/* ==========================================================================
   RENDER PRODUCTS CATALOG
   ========================================================================== */
function renderProducts() {
  const container = document.getElementById('productsGridContainer');
  if (!container) return;

  const d = getLangData();
  const ui = d.ui;
  const isAr = AppState.currentLang === 'ar';
  const isFr = AppState.currentLang === 'fr';

  const isRu = AppState.currentLang === 'ru';

  // 1. Filter by Trade Type (Export vs Import)
  let products = (d.products || []).filter(p => {
    if (AppState.activeTradeType === 'import') {
      return p.tradeType === 'import' || p.type === 'import';
    } else {
      return !p.tradeType || p.tradeType === 'export' || p.type === 'export';
    }
  });

  // 2. Filter by Sub-category
  if (AppState.activeSubcategory !== 'all') {
    products = products.filter(p => p.category === AppState.activeSubcategory);
  }

  // Update Trade Tab Buttons Active State
  document.querySelectorAll('.trade-tab-btn').forEach(btn => {
    const isTabActive = btn.dataset.trade === AppState.activeTradeType;
    btn.classList.toggle('active', isTabActive);
    btn.onclick = () => {
      AppState.activeTradeType = btn.dataset.trade;
      AppState.activeSubcategory = 'all';
      renderProducts();
    };
  });

  // Update Sub-Filter Buttons Active State
  document.querySelectorAll('.subfilter-btn').forEach(btn => {
    const isSubActive = btn.dataset.subcategory === AppState.activeSubcategory;
    btn.classList.toggle('active', isSubActive);
    btn.onclick = () => {
      AppState.activeSubcategory = btn.dataset.subcategory;
      renderProducts();
      // Smoothly scroll active button into view on mobile
      try {
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } catch (e) {}
    };
  });

  // Empty state handling
  if (products.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4.5rem 2rem; background: var(--bg-card); border: 1.5px dashed var(--gold-border); border-radius: var(--radius-lg); backdrop-filter: blur(14px);">
        <div style="font-size: 3.5rem; margin-bottom: 1.2rem; filter: drop-shadow(0 0 15px rgba(251, 191, 36, 0.4));">📦</div>
        <h3 style="color: var(--gold-light); font-size: 1.45rem; font-weight: 800; margin-bottom: 0.6rem;">
          ${isAr ? 'جاري إضافة وتحديث قائمة حاصلات ومنتجات الاستيراد' : (isFr ? 'Mise à jour du catalogue d\'importation' : (isRu ? 'Каталог импортной продукции обновляется' : 'Import Products Catalog is Being Synchronized'))}
        </h3>
        <p style="color: var(--text-secondary); max-width: 540px; margin-inline: auto; font-size: 0.96rem; line-height: 1.6;">
          ${isAr ? 'يتم تحديث وإدراج كافة السلع والمحاصيل المستوردة مباشرة وفق أحدث التعاقدات والمواصفات الدولية.' : (isFr ? 'Toutes les denrées d\'importation sont synchronisées selon les normes internationales.' : (isRu ? 'Все импортные товары и культуры активно обновляются в соответствии с международными стандартами торговли.' : 'All imported commodities and crops are actively updated in accordance with international trade specs.'))}
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(p => {
    const pImages = (Array.isArray(p.images) && p.images.length > 0)
      ? p.images.filter(Boolean).slice(0, 5)
      : [p.image || 'assets/images/valencia-oranges.jpg'];
    const mainCover = pImages[0] || p.image || 'assets/images/valencia-oranges.jpg';
    const hasMultiple = pImages.length > 1;

    return `
    <div class="product-card" data-id="${p.id}">
      <div class="product-img-wrapper" onclick="openProductSpecsModal('${p.id}')" style="cursor: pointer;">
        <img src="${mainCover}" id="cardImg_${p.id}" alt="${p.name}" loading="lazy">
        <span class="product-badge">${p.badge}</span>
        ${hasMultiple ? `<span class="product-images-count-badge">📷 ${pImages.length} ${isAr ? 'صور' : (isFr ? 'photos' : (isRu ? 'фото' : 'photos'))}</span>` : ''}
        <span class="product-category-pill">${p.categoryName}</span>
      </div>

      ${hasMultiple ? `
        <div class="card-mini-gallery-strip" onclick="event.stopPropagation()">
          ${pImages.map((imgUrl, idx) => `
            <button type="button" class="card-mini-thumb ${idx === 0 ? 'active' : ''}" 
              title="${isAr ? `صورة ${idx + 1}` : `Image ${idx + 1}`}"
              onmouseover="switchCardImage('${p.id}', '${imgUrl}', this)"
              onclick="switchCardImage('${p.id}', '${imgUrl}', this)">
              <img src="${imgUrl}" alt="${p.name} - ${idx + 1}" loading="lazy">
            </button>
          `).join('')}
        </div>
      ` : ''}

      <div class="product-body">
        <h3 class="product-title" onclick="openProductSpecsModal('${p.id}')" style="cursor: pointer;">${p.name}</h3>
        <p class="product-brief">${p.description}</p>
        
        <div class="product-specs-list">
          <div class="product-spec-row">
            <span class="spec-label">${ui.lblSeason}</span>
            <span class="spec-val">${p.season}</span>
          </div>
          <div class="product-spec-row">
            <span class="spec-label">${ui.lblOrigin}</span>
            <span class="spec-val">${p.origin}</span>
          </div>
          <div class="product-spec-row">
            <span class="spec-label">${ui.lblReefer}</span>
            <span class="spec-val">${p.temp}</span>
          </div>
        </div>

        <div class="product-actions">
          <button class="btn btn-gold btn-sm" onclick="openRfqModal('${p.id}')">
            <span>${ui.btnGetQuote}</span>
          </button>
          <button class="btn btn-outline-gold btn-sm" onclick="openProductSpecsModal('${p.id}')">
            <span>${ui.btnViewSpecs}</span>
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');
}

window.switchCardImage = function(productId, imgUrl, thumbEl) {
  const cardImg = document.getElementById(`cardImg_${productId}`);
  if (cardImg && imgUrl) {
    cardImg.src = imgUrl;
  }
  if (thumbEl) {
    const parentStrip = thumbEl.closest('.card-mini-gallery-strip');
    if (parentStrip) {
      parentStrip.querySelectorAll('.card-mini-thumb').forEach(t => t.classList.remove('active'));
      thumbEl.classList.add('active');
    }
  }
};

/* ==========================================================================
   RENDER FARMS
   ========================================================================== */
function renderFarms() {
  const container = document.getElementById('farmsGridContainer');
  if (!container) return;

  const d = getLangData();
  const lang = AppState.currentLang;
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';
  const isRu = lang === 'ru';

  container.innerHTML = d.farms.map(f => {
    const farmImg = f.image || 'assets/images/pivot-farms.jpg';
    return `
      <div class="farm-card">
        <div class="farm-img-wrapper">
          <img src="${farmImg}" alt="${f.name}" class="farm-real-img" loading="lazy" onerror="this.onerror=null;this.src='assets/images/pivot-farms.jpg';">
          <span class="farm-badge-area">${f.area}</span>
        </div>
        <div class="farm-card-content">
          <h4 class="farm-title">${f.name}</h4>
          <div class="farm-meta">
            <div class="farm-meta-item">
              <strong>${isAr ? 'الموقع:' : (isFr ? 'Emplacement :' : (isRu ? 'Расположение:' : 'Location:'))}</strong>
              <span>${f.location}</span>
            </div>
            <div class="farm-meta-item">
              <strong>${isAr ? 'نظام الري:' : (isFr ? 'Système d\'Irrigation :' : (isRu ? 'Система орошения:' : 'Irrigation:'))}</strong>
              <span>${f.irrigation}</span>
            </div>
            <div class="farm-meta-item">
              <strong>${isAr ? 'أهم المحاصيل:' : (isFr ? 'Principales Cultures :' : (isRu ? 'Основные культуры:' : 'Key Crops:'))}</strong>
              <span>${f.crops}</span>
            </div>
          </div>
          <div class="farm-features-list">
            ${(f.features || []).map(feat => `
              <div class="farm-feature-pill">${feat}</div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   RENDER EXPORT PROCESS TIMELINE (QUALITY ASSURANCE 5 STEPS WITH IMAGES)
   ========================================================================== */
function renderProcess() {
  const container = document.getElementById('processTimelineContainer');
  if (!container) return;

  const d = getLangData();
  const steps = d.exportSteps || d.process || [];
  container.innerHTML = steps.map(step => `
    <div class="process-step-card">
      <div class="process-card-media">
        <img src="${step.image || 'assets/images/products/valencia_orange.jpg'}" alt="${step.title}" class="process-card-img" loading="lazy">
        <div class="process-media-overlay"></div>
        <div class="step-circle">${step.step}</div>
      </div>
      <div class="process-card-body">
        <h4 class="step-title">${step.title}</h4>
        <p class="step-desc">${step.desc}</p>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   RENDER BOARD OF DIRECTORS & TEAM
   ========================================================================== */
function renderBoard() {
  const container = document.getElementById('boardGridContainer');
  if (!container) return;

  const d = getLangData();
  container.innerHTML = d.board.map(m => `
    <div class="board-card">
      <div class="board-avatar-wrapper">
        <div class="board-avatar-inner">
          ${m.image ? `
            <img src="${m.image}" alt="${m.name}" class="board-avatar-img" loading="lazy">
          ` : `
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          `}
        </div>
      </div>
      <span class="board-badge">${m.badge}</span>
      <h4 class="board-name">${m.name}</h4>
      <div class="board-role">${m.role}</div>
      <p class="board-desc">${m.desc}</p>
    </div>
  `).join('');
}

/* ==========================================================================
   RENDER PROJECTS & TRACK RECORD
   ========================================================================== */
function renderProjects() {
  const container = document.getElementById('projectsGridContainer');
  if (!container) return;

  const d = getLangData();
  const lang = AppState.currentLang;
  const zoomLabel = lang === 'ar' ? 'عرض تفاصيل المشروع' : (lang === 'fr' ? 'Agrandir' : (lang === 'ru' ? 'Подробнее о проекте' : 'View Full Details'));

  container.innerHTML = d.projects.map((p, idx) => `
    <div class="project-item-card" onclick="openProjectModal(${idx})">
      ${p.image ? `
        <div class="project-img-wrapper">
          <img src="${p.image}" alt="${p.title}" class="project-real-img" loading="lazy">
          <div class="project-img-overlay">
            <span class="project-zoom-badge">🔍 ${zoomLabel}</span>
          </div>
        </div>
      ` : ''}
      <div class="project-content">
        <div class="project-entity">${p.entity}</div>
        <h4 class="project-name">${p.title}</h4>
        <p class="project-desc">${p.desc}</p>
      </div>
    </div>
  `).join('');
}

function openProjectModal(index) {
  const d = getLangData();
  const p = d.projects && d.projects[index];
  if (!p) return;

  const modalBody = document.getElementById('modalContentBody');
  const modalBackdrop = document.getElementById('appModal');

  modalBody.innerHTML = `
    <div class="modal-header-bar">
      <div class="modal-brand-tag">
        <div class="modal-logo-icon">
          <img src="assets/images/logo_diamond.png" alt="ALMASA">
        </div>
        <div>
          <h4 class="modal-brand-name">${d.ui.brandTitle}</h4>
          <span class="modal-brand-sector">${d.ui.badgeProjects}</span>
        </div>
      </div>
      <span class="product-badge modal-badge-static">${p.entity}</span>
    </div>

    <div class="modal-project-layout">
      ${p.image ? `
        <div class="modal-project-img-box">
          <img src="${p.image}" alt="${p.title}" class="modal-project-full-img">
        </div>
      ` : ''}
      <div class="modal-project-details">
        <h3 class="modal-product-title" style="margin-bottom:0.75rem;">${p.title}</h3>
        <div style="font-size:0.95rem; color:var(--gold-bright); font-weight:700; margin-bottom:1rem;">${p.entity}</div>
        <p class="modal-product-desc" style="font-size:1.02rem; line-height:1.75;">${p.desc}</p>
      </div>
    </div>
  `;

  modalBackdrop?.classList.add('active');
}

/* ==========================================================================
   RENDER CONTACTS & BRANCHES
   ========================================================================== */
function renderContacts() {
  const container = document.getElementById('branchesGridContainer');
  if (!container) return;

  const d = getLangData();
  const c = d.contacts;
  const lang = AppState.currentLang;
  const isAr = lang === 'ar';
  const isFr = lang === 'fr';
  const isRu = lang === 'ru';
  const chatLabel = d.ui.chatWhatsAppBtn;

  container.innerHTML = `
    <div class="branch-card">
      <div class="branch-header">
        <div class="branch-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
        <h4 class="branch-title">${c.branch1.title}</h4>
      </div>
      <div class="branch-info-list">
        <div class="branch-info-item">
          <strong>${isAr ? 'العنوان:' : (isFr ? 'Adresse :' : (isRu ? 'Адрес:' : 'Address:'))}</strong>
          <span>${c.branch1.address}</span>
        </div>
        <div class="branch-info-item">
          <strong>${isAr ? 'الهاتف المباشر:' : (isFr ? 'Téléphone Direct :' : (isRu ? 'Прямой телефон:' : 'Direct Phone:'))}</strong>
          <a href="tel:${c.branch1.phoneClean}" class="phone-link">${c.branch1.phone}</a>
        </div>
      </div>
      <a href="https://wa.me/${c.branch1.phoneClean.replace('+','')}" target="_blank" class="btn btn-whatsapp-outline btn-sm" style="margin-top:auto;">
        <span>${chatLabel}</span>
      </a>
    </div>

    <div class="branch-card">
      <div class="branch-header">
        <div class="branch-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        </div>
        <h4 class="branch-title">${c.branch2.title}</h4>
      </div>
      <div class="branch-info-list">
        <div class="branch-info-item">
          <strong>${isAr ? 'العنوان:' : (isFr ? 'Adresse :' : (isRu ? 'Адрес:' : 'Address:'))}</strong>
          <span>${c.branch2.address}</span>
        </div>
        <div class="branch-info-item">
          <strong>${isAr ? 'الهاتف المباشر:' : (isFr ? 'Téléphone Direct :' : (isRu ? 'Прямой телефон:' : 'Direct Phone:'))}</strong>
          <a href="tel:${c.branch2.phoneClean}" class="phone-link">${c.branch2.phone}</a>
        </div>
      </div>
      <a href="https://wa.me/${c.branch2.phoneClean.replace('+','')}" target="_blank" class="btn btn-whatsapp-outline btn-sm" style="margin-top:auto;">
        <span>${chatLabel}</span>
      </a>
    </div>
  `;

  // Update floating WhatsApp link
  const floatingWa = document.getElementById('floatingWhatsApp');
  if (floatingWa) {
    const waNum = c.whatsappNumber.replace('+', '');
    const waText = isAr 
      ? 'مرحباً، أود الاستفسار عن تفاصيل وحاصلات التصدير لدى شركة الماسة.' 
      : (isFr 
          ? 'Bonjour, je souhaite me renseigner sur les produits d\'exportation agricole et agroalimentaire d\'ALMASA.' 
          : (isRu
              ? 'Здравствуйте, я хотел бы узнать подробнее об экспортной продукции компании ALMASA.'
              : 'Hello, I would like to inquire about agricultural export products from ALMASA.'));
    floatingWa.href = `https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`;
  }
}

function populateFormSelects() {
  const d = getLangData();
  const ui = d.ui;

  // Populate Product Select
  const productSelect = document.getElementById('rfqProductSelect');
  if (productSelect) {
    const defaultPlaceholder = ui.formProductSelectPlaceholder || ui.formSelectProduct || '-- Select Product --';
    productSelect.innerHTML = `
      <option value="">${defaultPlaceholder}</option>
      ${d.products.map(p => `
        <option value="${p.name}">${p.name} - ${p.categoryName}</option>
      `).join('')}
    `;
  }

  // Populate Incoterm Select
  const incotermSelect = document.getElementById('rfqIncoterm');
  if (incotermSelect) {
    incotermSelect.innerHTML = `
      <option value="FOB">${ui.incotermFob}</option>
      <option value="CIF">${ui.incotermCif}</option>
      <option value="CFR">${ui.incotermCfr}</option>
      <option value="EXW">${ui.incotermExw}</option>
    `;
  }
}

/* ==========================================================================
   NAVIGATION & UI INTERACTIVITY
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('siteHeader');
  const mobileToggle = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const scrollTopBtn = document.getElementById('scrollTopBtn');

  // Scroll Header Effect & Scroll to top
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
      scrollTopBtn?.classList.add('visible');
    } else {
      header?.classList.remove('scrolled');
      scrollTopBtn?.classList.remove('visible');
    }
  });

  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Mobile Menu Toggle & State Sync
  mobileToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navMenu?.classList.toggle('open');
    mobileToggle.classList.toggle('active', isOpen);
    mobileToggle.innerHTML = isOpen ? '✕' : '☰';
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu?.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle?.contains(e.target)) {
      closeMobileMenu();
    }
  });

  // Close mobile menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu?.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Products Dropdown Wrapper & Trigger
  const productsDropdownWrapper = document.getElementById('productsDropdownWrapper');
  const navProductsLink = document.getElementById('navProductsLink');

  if (navProductsLink && productsDropdownWrapper) {
    navProductsLink.addEventListener('click', (e) => {
      // Toggle dropdown open state on click
      e.stopPropagation();
      productsDropdownWrapper.classList.toggle('open');
    });

    // Close on clicking outside
    document.addEventListener('click', (e) => {
      if (!productsDropdownWrapper.contains(e.target)) {
        productsDropdownWrapper.classList.remove('open');
      }
    });
  }

  // Handle Product Dropdown Items click (Export & Import)
  document.querySelectorAll('.nav-dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const filter = item.getAttribute('data-filter');
      if (filter === 'export' || filter === 'import') {
        AppState.activeTradeType = filter;
        AppState.activeSubcategory = 'all';
        renderProducts();
      }
      productsDropdownWrapper?.classList.remove('open');
      closeMobileMenu();
      
      const productsSec = document.getElementById('products');
      if (productsSec) {
        productsSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Close mobile menu on regular link click (excluding dropdown trigger)
  document.querySelectorAll('.nav-menu > a.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });
}

/* ==========================================================================
   MODALS: PRODUCT SPECS & EXPORT RFQ
   ========================================================================== */
function initModals() {
  const modalBackdrop = document.getElementById('appModal');
  const modalClose = document.getElementById('modalCloseBtn');

  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function closeModal() {
  const modalBackdrop = document.getElementById('appModal');
  modalBackdrop?.classList.remove('active');
}

function openProductSpecsModal(productId) {
  const d = getLangData();
  const ui = d.ui;
  const product = d.products.find(p => p.id === productId || String(p.id) === String(productId));
  if (!product) return;

  const modalBody = document.getElementById('modalContentBody');
  const modalBackdrop = document.getElementById('appModal');

  const images = (Array.isArray(product.images) && product.images.length > 0)
    ? product.images.filter(Boolean).slice(0, 5)
    : [product.image || product.image_url || 'assets/images/oranges.jpg'];

  modalBody.innerHTML = `
    <div class="modal-header-bar">
      <div class="modal-brand-tag">
        <div class="modal-logo-icon">
          <img src="assets/images/logo_diamond.png" alt="ALMASA">
        </div>
        <div>
          <h4 class="modal-brand-name">${ui.brandTitle}</h4>
          <span class="modal-brand-sector">${ui.brandSub}</span>
        </div>
      </div>
      <span class="product-badge modal-badge-static">${product.badge || ''}</span>
    </div>

    <div class="modal-product-layout">
      <div class="modal-product-gallery">
        <div class="modal-gallery-main">
          <img src="${images[0]}" id="modalMainImg" alt="${product.name}" class="modal-product-img">
          ${images.length > 1 ? `
            <button class="modal-gallery-arrow prev" id="modalGalleryPrev" aria-label="Previous image">‹</button>
            <button class="modal-gallery-arrow next" id="modalGalleryNext" aria-label="Next image">›</button>
            <div class="modal-gallery-index-badge" id="modalGalleryIndex">1 / ${images.length}</div>
          ` : ''}
        </div>
        ${images.length > 1 ? `
          <div class="modal-thumbnails-strip" id="modalThumbnailsStrip">
            ${images.map((img, idx) => `
              <button type="button" class="modal-thumb-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="View image ${idx + 1}">
                <img src="${img}" alt="${product.name} ${idx + 1}">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="modal-product-details">
        <h3 class="modal-product-title">${product.name}</h3>
        <p class="modal-product-desc">${product.description || ''}</p>
        
        <div class="modal-specs-box">
          <div class="modal-spec-row">
            <strong class="spec-label">${ui.lblSizes}</strong>
            <span class="spec-val">${product.sizes || ui.unspecified || 'Standard'}</span>
          </div>
          <div class="modal-spec-row">
            <strong class="spec-label">${ui.lblPackaging}</strong>
            <span class="spec-val">${product.packaging || ui.unspecified || 'Export Standard'}</span>
          </div>
          <div class="modal-spec-row">
            <strong class="spec-label">${ui.lblReefer}</strong>
            <span class="spec-val">${product.temp || '+3°C to +5°C'}</span>
          </div>
          <div class="modal-spec-row">
            <strong class="spec-label">${ui.lblSpecs}</strong>
            <span class="spec-val">${product.specs || ui.lblQualityCertified || 'Grade A Quality'}</span>
          </div>
        </div>

        <div class="modal-actions-box">
          <button class="btn btn-gold modal-cta-btn" onclick="closeModal(); openRfqModal('${product.id}')">
            <span>${ui.btnRfqModalCta}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Gallery Navigation Handlers
  if (images.length > 1) {
    let activeIdx = 0;
    const mainImg = document.getElementById('modalMainImg');
    const badge = document.getElementById('modalGalleryIndex');
    const thumbBtns = modalBody.querySelectorAll('.modal-thumb-btn');

    const setGalleryImage = (idx) => {
      if (idx < 0) idx = images.length - 1;
      if (idx >= images.length) idx = 0;
      activeIdx = idx;
      if (mainImg) {
        mainImg.style.opacity = '0.3';
        mainImg.src = images[activeIdx];
        mainImg.onload = () => { mainImg.style.opacity = '1'; };
      }
      if (badge) badge.textContent = `${activeIdx + 1} / ${images.length}`;
      thumbBtns.forEach((btn, i) => btn.classList.toggle('active', i === activeIdx));
    };

    thumbBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.index, 10);
        setGalleryImage(i);
      });
    });

    document.getElementById('modalGalleryPrev')?.addEventListener('click', () => setGalleryImage(activeIdx - 1));
    document.getElementById('modalGalleryNext')?.addEventListener('click', () => setGalleryImage(activeIdx + 1));
  }

  modalBackdrop?.classList.add('active');
}

function openRfqModal(productId) {
  const rfqSection = document.getElementById('rfqSection');
  if (rfqSection) {
    rfqSection.scrollIntoView({ behavior: 'smooth' });
    if (productId) {
      const d = getLangData();
      const product = d.products.find(p => p.id === productId);
      const select = document.getElementById('rfqProductSelect');
      if (select && product) {
        select.value = `${product.name} - ${product.categoryName}`;
      }
    }
  }
}

/* ==========================================================================
   INQUIRY FORM & WHATSAPP INTEGRATION
   ========================================================================== */
function initInquiryForm() {
  const form = document.getElementById('rfqInquiryForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = getLangData();
    const lang = AppState.currentLang;
    const isAr = lang === 'ar';
    const isFr = lang === 'fr';
    const isRu = lang === 'ru';

    const companyName = document.getElementById('rfqCompany')?.value || '';
    const contactName = document.getElementById('rfqName')?.value || '';
    const email = document.getElementById('rfqEmail')?.value || '';
    const phone = document.getElementById('rfqPhone')?.value || '';
    const product = document.getElementById('rfqProductSelect')?.value || (isAr ? 'حاصلات زراعية وغذائية' : (isFr ? 'Produits Agricoles & Alimentaires' : (isRu ? 'Сельхозпродукция и продукты питания' : 'Agricultural & Food Products')));
    const quantity = document.getElementById('rfqQuantity')?.value || (isAr ? 'غير محدد' : (isFr ? 'Non spécifié' : (isRu ? 'Не указано' : 'Unspecified')));
    const destination = document.getElementById('rfqDestination')?.value || (isAr ? 'غير محدد' : (isFr ? 'Non spécifié' : (isRu ? 'Не указано' : 'Unspecified')));
    const incoterm = document.getElementById('rfqIncoterm')?.value || 'FOB';
    const notes = document.getElementById('rfqNotes')?.value || '';

    // Prepare WhatsApp Message in purely active language
    let msg = '';
    if (isAr) {
      msg = `*طلب عرض سعر تصدير جديد (شركة الماسة للتطوير)*\n\n` +
        `👤 *الاسم:* ${contactName}\n` +
        `🏢 *الشركة:* ${companyName}\n` +
        `📱 *الهاتف:* ${phone}\n` +
        `✉️ *البريد:* ${email}\n` +
        `📦 *المنتج المطلوب:* ${product}\n` +
        `⚖️ *الكمية:* ${quantity}\n` +
        `🚢 *ميناء / بلد الوصول:* ${destination}\n` +
        `📑 *شرط الشحن:* ${incoterm}\n` +
        `📝 *ملاحظات:* ${notes || 'لا يوجد'}\n\n` +
        `_تم الإرسال عبر البوابة الرسمية لشركة الماسة للتطوير والتصدير._`;
    } else if (isFr) {
      msg = `*NOUVELLE DEMANDE DE DEVIS D'EXPORTATION (ALMASA DÉVELOPPEMENT)*\n\n` +
        `👤 *Nom / Responsable:* ${contactName}\n` +
        `🏢 *Société / Importateur:* ${companyName}\n` +
        `📱 *Téléphone:* ${phone}\n` +
        `✉️ *E-mail:* ${email}\n` +
        `📦 *Produit Demandé:* ${product}\n` +
        `⚖️ *Quantité Estimée:* ${quantity}\n` +
        `🚢 *Port / Pays de Destination:* ${destination}\n` +
        `📑 *Incoterm:* ${incoterm}\n` +
        `📝 *Spécifications & Notes:* ${notes || 'Aucune'}\n\n` +
        `_Envoyé via le portail officiel d'exportation ALMASA Développement._`;
    } else if (isRu) {
      msg = `*НОВЫЙ ЗАПРОС НА ЭКСПОРТНУЮ КОТИРОВКУ («АЛЬ-МАСА» ДЛЯ РАЗВИТИЯ)*\n\n` +
        `👤 *Контактное лицо:* ${contactName}\n` +
        `🏢 *Компания:* ${companyName}\n` +
        `📱 *Телефон:* ${phone}\n` +
        `✉️ *Email:* ${email}\n` +
        `📦 *Продукция:* ${product}\n` +
        `⚖️ *Объем:* ${quantity}\n` +
        `🚢 *Порт / Страна назначения:* ${destination}\n` +
        `📑 *Условия поставки (Incoterms):* ${incoterm}\n` +
        `📝 *Спецификации & Примечания:* ${notes || 'Нет'}\n\n` +
        `_Отправлено через официальный портал экспорта компании «Аль-Маса» для развития._`;
    } else {
      msg = `*NEW EXPORT QUOTATION REQUEST (ALMASA DEVELOPMENT)*\n\n` +
        `👤 *Contact Name:* ${contactName}\n` +
        `🏢 *Company:* ${companyName}\n` +
        `📱 *Phone:* ${phone}\n` +
        `✉️ *Email:* ${email}\n` +
        `📦 *Requested Product:* ${product}\n` +
        `⚖️ *Estimated Quantity:* ${quantity}\n` +
        `🚢 *Destination Port / Country:* ${destination}\n` +
        `📑 *Incoterm:* ${incoterm}\n` +
        `📝 *Specifications:* ${notes || 'None'}\n\n` +
        `_Sent via ALMASA Development Official Export Portal._`;
    }

    // Send inquiry to MySQL Backend API
    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'rfq',
        name: contactName,
        company: companyName,
        email: email,
        phone: phone,
        product_name: product,
        quantity: quantity,
        country: destination,
        incoterms: incoterm,
        message: notes
      })
    }).then(res => res.json())
      .then(data => {
        console.log('RFQ saved to Database:', data);
      }).catch(err => {
        console.warn('API sync fallback:', err);
      });

    const waNum = d.contacts.whatsappNumber.replace('+', '');
    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;

    window.open(waUrl, '_blank');
    alert(d.ui.quoteSuccessAlert);
    form.reset();
  });
}

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.section, .product-card, .farm-card, .board-card, .project-item-card').forEach(el => {
    observer.observe(el);
  });
}

/* ==========================================================================
   MAJESTIC 3D ROTATING DIAMOND SPLASH SCREEN (ALMASA INTRO ENGINE)
   ========================================================================== */
function initSplashScreen() {
  const splash = document.getElementById('almasaSplashScreen');
  if (!splash) return;

  const skipBtn = document.getElementById('skipSplashBtn');
  const canvas = document.getElementById('diamondDustCanvas');
  const progressBar = document.getElementById('splashProgressBar');

  let isOpening = false;
  let autoOpenTimer = null;

  // Animate the golden loading progress bar
  if (progressBar) {
    setTimeout(() => {
      progressBar.style.width = '100%';
    }, 100);
  }

  // Sparkling Diamond Dust & Golden Embers Particle Engine
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8 - 0.2,
        opacity: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * 0.05 + 0.015,
        isGold: Math.random() > 0.35
      });
    }

    function renderParticles() {
      if (splash.classList.contains('closed-complete') || splash.style.display === 'none') return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity += Math.sin(Date.now() * p.twinkle) * 0.02;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.isGold 
          ? `rgba(251, 191, 36, ${Math.max(0.1, Math.min(1, p.opacity))})` 
          : `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, p.opacity))})`;
        ctx.shadowColor = p.isGold ? '#fbbf24' : '#ffffff';
        ctx.shadowBlur = p.size * 3;
        ctx.fill();
      });

      requestAnimationFrame(renderParticles);
    }
    renderParticles();
  }

  function triggerOpen() {
    if (isOpening) return;
    isOpening = true;
    if (autoOpenTimer) clearTimeout(autoOpenTimer);

    // Step 1: Smooth fade out
    splash.classList.add('opening');
    document.body.style.overflow = 'auto';

    // Step 2: Hide and free DOM completely
    setTimeout(() => {
      splash.classList.add('closed-complete');
      splash.style.display = 'none';
    }, 450);
  }

  function skipSplash(e) {
    if (e) e.stopPropagation();
    if (autoOpenTimer) clearTimeout(autoOpenTimer);
    isOpening = true;
    splash.classList.add('closed-complete');
    splash.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  // Allow clicking anywhere on splash screen or skip button
  splash.addEventListener('click', triggerOpen);
  if (skipBtn) {
    skipBtn.addEventListener('click', skipSplash);
    skipBtn.addEventListener('touchstart', skipSplash, { passive: true });
  }

  // Allow pressing Escape key to skip intro instantly
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      skipSplash(e);
    }
  });

  // Automated smooth transition after 3.8 seconds
  autoOpenTimer = setTimeout(() => {
    triggerOpen();
  }, 3800);
}
