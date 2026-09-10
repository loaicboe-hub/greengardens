const fs = require('fs');
const path = require('path');

console.log('🚀 Updating Headquarters (Giza) and Operations (Beheira) phone & WhatsApp to +201222309944...');

// 1. Update assets/data/content.js
const contentJsPath = path.join(__dirname, '..', 'assets', 'data', 'content.js');
let contentJs = fs.readFileSync(contentJsPath, 'utf8');

// Replace all occurrences of old phone numbers and WhatsApp in content.js
contentJs = contentJs.replace(/"phone":\s*"01068868780"/g, '"phone": "+201222309944"');
contentJs = contentJs.replace(/"phoneClean":\s*"\+201068868780"/g, '"phoneClean": "+201222309944"');
contentJs = contentJs.replace(/"whatsappNumber":\s*"\+201068868780"/g, '"whatsappNumber": "+201222309944"');
contentJs = contentJs.replace(/"branchCairoPhone":\s*"01068868780"/g, '"branchCairoPhone": "+201222309944"');

fs.writeFileSync(contentJsPath, contentJs, 'utf8');
console.log('✅ Updated assets/data/content.js');

// 2. Update assets/js/main.js
const mainJsPath = path.join(__dirname, '..', 'assets', 'js', 'main.js');
let mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Update fetchLiveContent to set both branch1 and branch2
mainJs = mainJs.replace(
  /ALMASA_DATA\[l\]\.contacts\.branch2\.phone = s\.company_phone;[\s\S]*?ALMASA_DATA\[l\]\.contacts\.branch2\.phoneClean = s\.company_phone\.replace\(\/\\s\+\/g, ''\);/g,
  `ALMASA_DATA[l].contacts.branch1.phone = s.company_phone;
              ALMASA_DATA[l].contacts.branch1.phoneClean = s.company_phone.replace(/\\s+/g, '');
              ALMASA_DATA[l].contacts.branch2.phone = s.company_phone;
              ALMASA_DATA[l].contacts.branch2.phoneClean = s.company_phone.replace(/\\s+/g, '');`
);

// Update brand name in waText
mainJs = mainJs.replace(/شركة الماسة/g, 'شركة جرين جاردنز للتطوير');
mainJs = mainJs.replace(/d'ALMASA/g, "de Green Gardens");
mainJs = mainJs.replace(/ALMASA\./g, 'Green Gardens.');
mainJs = mainJs.replace(/from ALMASA/g, 'from Green Gardens');

// Ensure wa.me regex cleans any non-digits safely
mainJs = mainJs.replace(
  /href="https:\/\/wa\.me\/\$\{c\.branch1\.phoneClean\.replace\('\+',''\)\}"/g,
  `href="https://wa.me/\${c.branch1.phoneClean.replace(/[^0-9]/g, '')}"`
);
mainJs = mainJs.replace(
  /href="https:\/\/wa\.me\/\$\{c\.branch2\.phoneClean\.replace\('\+',''\)\}"/g,
  `href="https://wa.me/\${c.branch2.phoneClean.replace(/[^0-9]/g, '')}"`
);

fs.writeFileSync(mainJsPath, mainJs, 'utf8');
console.log('✅ Updated assets/js/main.js');

// 3. Update database/data_store.json
const dataStorePath = path.join(__dirname, '..', 'database', 'data_store.json');
if (fs.existsSync(dataStorePath)) {
  const store = JSON.parse(fs.readFileSync(dataStorePath, 'utf8'));
  if (!store.settings) {
    store.settings = {};
  }
  store.settings.company_phone = '+201222309944';
  store.settings.company_whatsapp = '+201222309944';
  fs.writeFileSync(dataStorePath, JSON.stringify(store, null, 2), 'utf8');
  console.log('✅ Updated database/data_store.json');
}

// 4. Update index.html cache busters
const indexHtmlPath = path.join(__dirname, '..', 'index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
indexHtml = indexHtml.replace(/\?v=[0-9.]+/g, '?v=3.6');
fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
console.log('✅ Updated index.html cache buster to ?v=3.6');

console.log('✨ All contact details synchronized to +201222309944 successfully!');
