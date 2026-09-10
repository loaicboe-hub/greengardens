const fs = require('fs');
const path = require('path');

console.log('🔄 Syncing contact numbers & branches for Green Gardens...');

// 1. Update assets/data/content.js
let contentJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'data', 'content.js'), 'utf8');

// Replace Beheira phone numbers
contentJs = contentJs.replace(/"phone":\s*"01090043999"/g, '"phone": "01222309944"');
contentJs = contentJs.replace(/"phoneClean":\s*"\+201090043999"/g, '"phoneClean": "+201222309944"');
contentJs = contentJs.replace(/"branchBeheiraPhone":\s*"01090043999"/g, '"branchBeheiraPhone": "01222309944"');

// Replace old emails and domains
contentJs = contentJs.replace(/gm-abdou@almasapremium\.com/g, 'gm@greengardens-eg.com');
contentJs = contentJs.replace(/ceo-remas@almasapremium\.com/g, 'export@greengardens-eg.com');
contentJs = contentJs.replace(/almasa-premium@gmail\.com/g, 'info@greengardens-eg.com');
contentJs = contentJs.replace(/www\.almasa-premium\.com/g, 'www.greengardens-eg.com');
contentJs = contentJs.replace(/www\.almasadevelopment\.com/g, 'www.greengardens-eg.com');

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'data', 'content.js'), contentJs, 'utf8');
console.log('✅ Updated assets/data/content.js contact data');

// 2. Update index.html floating WhatsApp and footer social
let indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
indexHtml = indexHtml.replace(/https:\/\/wa\.me\/201068868780/g, 'https://wa.me/201222309944');
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), indexHtml, 'utf8');
console.log('✅ Updated index.html WhatsApp links');

// 3. Update database/data_store.json
const dataStorePath = path.join(__dirname, '..', 'database', 'data_store.json');
if (fs.existsSync(dataStorePath)) {
  const store = JSON.parse(fs.readFileSync(dataStorePath, 'utf8'));
  if (store.settings) {
    store.settings.company_phone = '+201222309944';
    store.settings.company_whatsapp = '+201222309944';
    store.settings.company_address_ar = 'الجيزة: مدينة الشيخ زايد - الكورت يارد مول | البحيرة: أبو المطامير - بجوار مستشفى الحميات';
    store.settings.company_address_en = 'Giza: Sheikh Zayed City - The Courtyard Mall | Beheira: Abu El Matameer - Beside Fevers Hospital';
  }
  fs.writeFileSync(dataStorePath, JSON.stringify(store, null, 2), 'utf8');
  console.log('✅ Updated database/data_store.json settings');
}

// 4. Update assets/js/main.js to make settings dynamic for contacts & WhatsApp
let mainJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'main.js'), 'utf8');

// Enhance settings sync block in init()
const oldSettingsSyncRegex = /\/\/ 2\. Fetch live settings[\s\S]*?\/\/ 3\. Fetch live products/;
const newSettingsSync = `// 2. Fetch live settings (Contact phone, email, whatsapp)
    try {
      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      if (settingsData.success && settingsData.data) {
        const s = settingsData.data;
        AppState.liveSettings = s;
        
        // Update live data in memory
        for (const l of ['ar', 'en', 'fr', 'ru']) {
          if (ALMASA_DATA && ALMASA_DATA[l] && ALMASA_DATA[l].contacts) {
            if (s.company_phone) {
              ALMASA_DATA[l].contacts.branch2.phone = s.company_phone;
              ALMASA_DATA[l].contacts.branch2.phoneClean = s.company_phone.replace(/\\s+/g, '');
            }
            if (s.company_whatsapp) {
              ALMASA_DATA[l].contacts.whatsappNumber = s.company_whatsapp.replace(/\\s+/g, '');
            }
            if (s.company_email) {
              ALMASA_DATA[l].contacts.emails = [s.company_email];
            }
          }
        }

        // Update Floating WhatsApp & Footer WhatsApp
        if (s.company_whatsapp) {
          const cleanWa = s.company_whatsapp.replace(/[^0-9]/g, '');
          const floatWa = document.getElementById('floatingWhatsApp');
          if (floatWa) floatWa.href = 'https://wa.me/' + cleanWa;
          document.querySelectorAll('.social-whatsapp, .company-whatsapp-link').forEach(el => {
            el.href = 'https://wa.me/' + cleanWa;
          });
        }

        if (s.company_email) {
          document.querySelectorAll('.company-email-link').forEach(el => {
            el.textContent = s.company_email;
            el.href = 'mailto:' + s.company_email;
          });
        }

        // Re-render contacts with live settings
        renderContacts();
      }
    } catch (e) {
      console.warn('Could not sync live settings:', e.message);
    }

    // 3. Fetch live products`;

mainJs = mainJs.replace(oldSettingsSyncRegex, newSettingsSync);

fs.writeFileSync(path.join(__dirname, '..', 'assets', 'js', 'main.js'), mainJs, 'utf8');
console.log('✅ Updated assets/js/main.js to dynamically sync contact settings');

console.log('✨ All contact settings and branch numbers synced successfully!');
