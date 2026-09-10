const fs = require('fs');
const path = require('path');

console.log('🔄 Ensuring +201222309944 is set everywhere for Operations & Farm Hub (Beheira)...');

// 1. Update assets/data/content.js Russian section
let contentJs = fs.readFileSync(path.join(__dirname, '..', 'assets', 'data', 'content.js'), 'utf8');

const oldRuContacts = `"contacts": {
      "branch1": {
        "title": "Головной офис управления проектами (Каир)",
        "address": "Аббасия — башня Миср для туризма, 9-й этаж, Каир, Египет",
        "phone": "+20 100 234 5678",
        "phoneClean": "+201002345678"
      },
      "branch2": {
        "title": "Департамент агроэкспорта и упаковочные комплексы",
        "address": "Трасса Каир-Александрия (км 84) — Вади-эль-Натрун, провинция Бухейра, Египет",
        "phone": "+20 111 987 6543",
        "phoneClean": "+201119876543"
      },
      "whatsappNumber": "+201002345678"
    }`;

const newRuContacts = `"contacts": {
      "branch1": {
        "title": "Главный офис (Гиза)",
        "address": "Гиза — Город Шейх Заид — Торговый центр The Courtyard",
        "phone": "01068868780",
        "phoneClean": "+201068868780"
      },
      "branch2": {
        "title": "Операционный и агроэкспортный центр (Бухейра)",
        "address": "Провинция Бухейра — Абу-эль-Матамир — Рядом с инфекционной больницей",
        "phone": "+201222309944",
        "phoneClean": "+201222309944"
      },
      "emails": [
        "gm@greengardens-eg.com",
        "export@greengardens-eg.com",
        "info@greengardens-eg.com"
      ],
      "websites": [
        "www.greengardens-eg.com",
        "www.greengardens-eg.com"
      ],
      "whatsappNumber": "+201222309944"
    }`;

contentJs = contentJs.replace(oldRuContacts, newRuContacts);
fs.writeFileSync(path.join(__dirname, '..', 'assets', 'data', 'content.js'), contentJs, 'utf8');
console.log('✅ Updated Russian contacts in content.js');

// 2. Update server.js
let serverJs = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
serverJs = serverJs.replace(/company_phone:\s*"\+20 100 000 0000"/g, 'company_phone: "+201222309944"');
serverJs = serverJs.replace(/company_whatsapp:\s*"\+20 100 000 0000"/g, 'company_whatsapp: "+201222309944"');
fs.writeFileSync(path.join(__dirname, '..', 'server.js'), serverJs, 'utf8');
console.log('✅ Updated server.js mockSettings');

// 3. Update cache-busting in index.html
let indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
indexHtml = indexHtml.replace(/\?v=[0-9.]+/g, '?v=3.5');
fs.writeFileSync(path.join(__dirname, '..', 'index.html'), indexHtml, 'utf8');
console.log('✅ Updated cache-busting query strings in index.html to ?v=3.5');

console.log('✨ All contact data completely unified!');
