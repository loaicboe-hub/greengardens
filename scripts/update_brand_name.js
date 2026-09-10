const fs = require('fs');
const path = require('path');

console.log('🔄 Starting full brand rename to Green Gardens / جرين جاردنز...');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [from, to] of replacements) {
    if (typeof from === 'string') {
      content = content.split(from).join(to);
    } else if (from instanceof RegExp) {
      content = content.replace(from, to);
    }
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️ No changes needed: ${filePath}`);
  }
}

// 1. Update index.html
replaceInFile(path.join(__dirname, '..', 'index.html'), [
  ['شركة الماسة للتطوير والتصدير الزراعي والغذائي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي'],
  ['شركة الماسة للتطوير والتصدير الزراعي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي'],
  ['شركة الماسة للتطوير', 'شركة جرين جاردنز للتطوير'],
  ['شركة الماسة', 'شركة جرين جاردنز'],
  ['إدارة شركة الماسة', 'إدارة شركة جرين جاردنز'],
  ['المجلس التنفيذي لشركة الماسة', 'المجلس التنفيذي لشركة جرين جاردنز'],
  ['مزارع الماسة', 'مزارع جرين جاردنز'],
  ['محاصيل الماسة', 'محاصيل جرين جاردنز'],
  ['عن الماسة', 'عن جرين جاردنز'],
  ['ALMASA Development & Export', 'Green Gardens Development & Export'],
  ['ALMASA Development & Agro-Export Co.', 'Green Gardens Development & Agro-Export Co.'],
  ['ALMASA Development & Agro-Export', 'Green Gardens Development & Agro-Export'],
  ['ALMASA Development', 'Green Gardens Development'],
  ['ALMASA Agro-Export', 'Green Gardens Agro-Export'],
  ['ALMASA EXPORT CROPS', 'GREEN GARDENS EXPORT CROPS'],
  ['ALMASA FARMS & INVESTMENT', 'GREEN GARDENS FARMS & INVESTMENT'],
  ['ALMASA QUALITY ASSURANCE', 'GREEN GARDENS QUALITY ASSURANCE'],
  ['ALMASA EXECUTIVE BOARD', 'GREEN GARDENS EXECUTIVE BOARD'],
  ['ALMASA TRACK RECORD', 'GREEN GARDENS TRACK RECORD'],
  ['ALMASA EXPORT INQUIRY', 'GREEN GARDENS EXPORT INQUIRY'],
  ['ALMASA CONTACT & BRANCHES', 'GREEN GARDENS CONTACT & BRANCHES'],
  ['ALMASA Golden Diamond Emblem', 'Green Gardens Emblem'],
  ['ALMASA Logo', 'Green Gardens Logo'],
  ['ALMASA Export Harvest', 'Green Gardens Export Harvest'],
  ['ALMASA Pivot Farms', 'Green Gardens Pivot Farms'],
  ['ALMASA Quality Sorting', 'Green Gardens Quality Sorting'],
  ['ALMASA Board', 'Green Gardens Board'],
  ['ALMASA Track Record', 'Green Gardens Track Record'],
  ['gm-abdou@almasapremium.com', 'gm@greengardens-eg.com'],
  ['ceo-remas@almasapremium.com', 'export@greengardens-eg.com'],
  ['almasa-premium@gmail.com', 'info@greengardens-eg.com'],
  ['www.almasa-premium.com', 'www.greengardens-eg.com'],
  ['https://www.almasa-premium.com', 'https://www.greengardens-eg.com'],
  ['Almasa Export', 'Green Gardens Export'],
  ['ALMASA', 'Green Gardens']
]);

// 2. Update assets/data/content.js
replaceInFile(path.join(__dirname, '..', 'assets', 'data', 'content.js'), [
  ['شركة الماسة للتطوير والتصدير الزراعي والغذائي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي'],
  ['شركة الماسة للتطوير والتصدير الزراعي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي'],
  ['شركة الماسة للتطوير', 'شركة جرين جاردنز للتطوير'],
  ['شركة الماسة', 'شركة جرين جاردنز'],
  ['إدارة شركة الماسة للتطوير', 'إدارة شركة جرين جاردنز للتطوير'],
  ['إدارة شركة الماسة', 'إدارة شركة جرين جاردنز'],
  ['المجلس التنفيذي لشركة الماسة', 'المجلس التنفيذي لشركة جرين جاردنز'],
  ['مزارع الماسة', 'مزارع جرين جاردنز'],
  ['محاصيل الماسة', 'محاصيل جرين جاردنز'],
  ['عن الماسة', 'عن جرين جاردنز'],
  ['الماسة للتطوير', 'جرين جاردنز للتطوير'],
  ['«الماسة»', '«جرين جاردنز»'],
  ['«الماسه»', '«جرين جاردنز»'],
  ['ALMASA Development & Agro-Export Co.', 'Green Gardens Development & Agro-Export Co.'],
  ['ALMASA Development & Export', 'Green Gardens Development & Export'],
  ['ALMASA Development & Agro-Export', 'Green Gardens Development & Agro-Export'],
  ['ALMASA Development', 'Green Gardens Development'],
  ['ALMASA Agro-Export', 'Green Gardens Agro-Export'],
  ['ALMASA Développement', 'Green Gardens Développement'],
  ['ALMASA EXPORT CROPS', 'GREEN GARDENS EXPORT CROPS'],
  ['ALMASA FARMS & INVESTMENT', 'GREEN GARDENS FARMS & INVESTMENT'],
  ['ALMASA QUALITY ASSURANCE', 'GREEN GARDENS QUALITY ASSURANCE'],
  ['ALMASA EXECUTIVE BOARD', 'GREEN GARDENS EXECUTIVE BOARD'],
  ['ALMASA TRACK RECORD', 'GREEN GARDENS TRACK RECORD'],
  ['ALMASA EXPORT INQUIRY', 'GREEN GARDENS EXPORT INQUIRY'],
  ['ALMASA CONTACT & BRANCHES', 'GREEN GARDENS CONTACT & BRANCHES'],
  ['«Аль-Маса» для развития', '«Грин Гарденс» для развития'],
  ['«Аль-Маса»', '«Грин Гарденс»'],
  ['Аль-Маса', 'Грин Гарденс'],
  ['Almasa', 'Green Gardens'],
  [/\bALMASA\b/g, 'Green Gardens']
]);

// 3. Update database/data_store.json
const dataStorePath = path.join(__dirname, '..', 'database', 'data_store.json');
if (fs.existsSync(dataStorePath)) {
  const store = JSON.parse(fs.readFileSync(dataStorePath, 'utf8'));
  if (store.settings) {
    store.settings.company_name_ar = "شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي";
    store.settings.company_name_en = "Green Gardens Development & Agro-Export Co.";
    store.settings.company_email = "info@greengardens-eg.com";
    store.settings.company_address_ar = "جمهورية مصر العربية - مزارع وادي النطرون والبستان";
    store.settings.company_address_en = "Egypt - Wadi El-Natrun & Bustan Agro Farms";
    store.settings.facebook_url = "https://facebook.com/greengardens";
    store.settings.instagram_url = "https://instagram.com/greengardens";
    store.settings.linkedin_url = "https://linkedin.com/company/greengardens";
    store.settings.youtube_url = "https://youtube.com/@greengardens";
    store.settings.tiktok_url = "https://tiktok.com/@greengardens";
    store.settings.twitter_url = "https://twitter.com/greengardens";
  }
  fs.writeFileSync(dataStorePath, JSON.stringify(store, null, 2), 'utf8');
  console.log(`✅ Updated database/data_store.json settings`);
}

// 4. Update admin/index.html
replaceInFile(path.join(__dirname, '..', 'admin', 'index.html'), [
  ['شركة الماسة للتطوير والتصدير الزراعي والغذائي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي'],
  ['شركة الماسة للتطوير والتصدير الزراعي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي'],
  ['شركة الماسة للتطوير', 'شركة جرين جاردنز للتطوير'],
  ['شركة الماسة', 'شركة جرين جاردنز'],
  ['مشرف الماسة', 'مشرف جرين جاردنز'],
  ['لوحة تحكم شركة الماسة', 'لوحة تحكم شركة جرين جاردنز'],
  ['قيم ومبادئ شركة الماسة', 'قيم ومبادئ شركة جرين جاردنز'],
  ['بوابة الإدارة والتصدير لشركة الماسة', 'بوابة الإدارة والتصدير لشركة جرين جاردنز'],
  ['ALMASA Diamond Emblem', 'Green Gardens Emblem'],
  ['ALMASA TRACK RECORD', 'GREEN GARDENS TRACK RECORD'],
  ['ALMASA Development & Agro-Export Co.', 'Green Gardens Development & Agro-Export Co.'],
  ['ALMASA Development', 'Green Gardens Development'],
  ['ALMASA Track Record', 'Green Gardens Track Record'],
  ['info@almasagroup-eg.com', 'info@greengardens-eg.com'],
  ['almasa-export', 'greengardens-export'],
  ['company/almasa', 'company/greengardens'],
  ['almasa_agro', 'greengardens_agro'],
  ['@almasagroup', '@greengardens']
]);

// 5. Update admin/admin.js
replaceInFile(path.join(__dirname, '..', 'admin', 'admin.js'), [
  ['شركة الماسة للتطوير والتصدير الزراعي والغذائي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي'],
  ['شركة الماسة للتطوير والتصدير الزراعي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي'],
  ['شركة الماسة للتطوير', 'شركة جرين جاردنز للتطوير'],
  ['شركة الماسة', 'شركة جرين جاردنز'],
  ['فاتورة تصدير شركة الماسة الرسمية', 'فاتورة تصدير شركة جرين جاردنز الرسمية'],
  ['مزارع شركة الماسة', 'مزارع شركة جرين جاردنز'],
  ['مشرف الماسة', 'مشرف جرين جاردنز'],
  ['لوحة تحكم شركة الماسة', 'لوحة تحكم شركة جرين جاردنز'],
  ['المشروعات الكبرى وسابقة الأعمال (ALMASA TRACK RECORD)', 'المشروعات الكبرى وسابقة الأعمال (GREEN GARDENS TRACK RECORD)'],
  ['ALMASA Official Export Invoice', 'Green Gardens Official Export Invoice'],
  ['ALMASA EXPORT', 'GREEN GARDENS EXPORT'],
  ['ALMASA Development & Agro-Export Co.', 'Green Gardens Development & Agro-Export Co.'],
  ['ALMASA Development & Agro-Export', 'Green Gardens Development & Agro-Export'],
  ['ALMASA Development', 'Green Gardens Development'],
  ['ALMASA Control Panel', 'Green Gardens Control Panel'],
  ['ALMASA Track Record', 'Green Gardens Track Record'],
  ['ALMASA export excellence', 'Green Gardens export excellence'],
  ['ALMASA Agro-Export & Administration System', 'Green Gardens Agro-Export & Administration System'],
  ['info@almasagroup-eg.com', 'info@greengardens-eg.com'],
  ['www.almasapremium.com', 'www.greengardens-eg.com'],
  ['ALMASA Farms', 'Green Gardens Farms'],
  ['ALMASA Logo', 'Green Gardens Logo']
]);

// 6. Update server.js
replaceInFile(path.join(__dirname, '..', 'server.js'), [
  ['company_name_ar: "شركة الماسة للتطوير والتصدير الزراعي والغذائي"', 'company_name_ar: "شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي"'],
  ['company_name_en: "ALMASA Development & Agro-Export Co."', 'company_name_en: "Green Gardens Development & Agro-Export Co."'],
  ['company_email: "info@almasagroup-eg.com"', 'company_email: "info@greengardens-eg.com"'],
  ['Almasa Master Executive', 'Green Gardens Master Executive'],
  ['About ALMASA Development & Agro-Export Co.', 'About Green Gardens Development & Agro-Export Co.'],
  ['At ALMASA, we believe', 'At Green Gardens, we believe'],
  ['ALMASA Executive Board', 'Green Gardens Executive Board'],
  ['Executive Board of ALMASA', 'Executive Board of Green Gardens'],
  ['ALMASA operates 3 major farms', 'Green Gardens operates 3 major farms'],
  ['strategic vision of ALMASA', 'strategic vision of Green Gardens'],
  ['brand equity for ALMASA', 'brand equity for Green Gardens'],
  ['// 12. ALMASA Track Record / Projects Management API', '// 12. Green Gardens Track Record / Projects Management API'],
  ['ALMASA Agro-Export Platform Server Running', 'Green Gardens Agro-Export Platform Server Running'],
  ['شركة الماسة للتطوير والتصدير الزراعي والغذائي', 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي'],
  ['شركة الماسة للتطوير', 'شركة جرين جاردنز للتطوير'],
  ['شركة الماسة', 'شركة جرين جاردنز'],
  ['ALMASA Development & Agro-Export', 'Green Gardens Development & Agro-Export'],
  ['ALMASA Development', 'Green Gardens Development']
]);

console.log('✨ All files updated to Green Gardens / جرين جاردنز successfully!');
