const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const { initDb, query, isDbConnected } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'greengardens_luxury_secret_jwt_2026';

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'assets', 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem in serverless environments
}

// Multer Storage for Image Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `greengardens_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|svg|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('الملف غير مدعوم! يرجى رفع صورة أو ملف PDF صالح.'));
    }
  }
});

// Serve Static Assets
app.use(express.static(path.join(__dirname)));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// -----------------------------------------------------------------------------
// In-Memory Fallback Dataset (Used when MySQL is connecting/offline)
// -----------------------------------------------------------------------------
let mockCategories = [
  { id: 1, slug: 'fresh-fruits', name_ar: 'فواكه طازجة', name_en: 'Fresh Fruits', icon: 'Apple', sort_order: 1 },
  { id: 2, slug: 'fresh-veg', name_ar: 'خضروات طازجة', name_en: 'Fresh Vegetables', icon: 'Carrot', sort_order: 2 },
  { id: 3, slug: 'fresh-exotic', name_ar: 'فواكه استوائية ونادرة', name_en: 'Fresh Exotic & Tropical Fruits', icon: 'Palmtree', sort_order: 3 },
  { id: 4, slug: 'frozen-fruits', name_ar: 'فواكه مجمدة', name_en: 'Frozen Fruits', icon: 'Snowflake', sort_order: 4 },
  { id: 5, slug: 'frozen-veg', name_ar: 'خضروات مجمدة', name_en: 'Frozen Vegetables', icon: 'Snowflake', sort_order: 5 },
  { id: 6, slug: 'grains', name_ar: 'حبوب ومحاصيل زراعية', name_en: 'Crops & Grains', icon: 'Sprout', sort_order: 6 }
];

let mockProducts = [
  {
    "id": 1,
    "slug": "valencia-orange",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "برتقال فالنسيا مصري للتصدير",
    "name_en": "Fresh Egyptian Valencia Oranges",
    "tag_ar": "الأكثر طلباً عالمياً",
    "tag_en": "Most Demanded Globally",
    "variety_ar": "فالنسيا عالي العصارة (نسبة عصير 45%+)",
    "variety_en": "High-Juice Valencia (Juice content 45%+)",
    "season_ar": "يناير - مايو",
    "season_en": "January - May",
    "packaging_ar": "كرتونة تلسكوبية 15 كجم، كرتونة مفتوحة 8 كجم، Bins 500 كجم",
    "packaging_en": "15kg Telescopic Carton, 8kg Open Top, 500kg Bins",
    "image_url": "assets/images/products/fresh_valencia_orange.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 2,
    "slug": "fresh-strawberries",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "فراولة طازجة فاخرة (شحن جوي وبحري)",
    "name_en": "Premium Fresh Strawberries",
    "tag_ar": "شحن جوي وبحري سريع",
    "tag_en": "Fast Air & Sea Freight",
    "variety_ar": "فستيفال، فورتونا، سينساشن (25-35 مم / أكبر من 35 مم)",
    "variety_en": "Festival, Fortuna, Sensation (25-35mm / 35mm+)",
    "season_ar": "نوفمبر - أبريل",
    "season_en": "November - April",
    "packaging_ar": "عبوات شفافة 250 و 500 جم داخل كرتون 2 كجم و 2.5 كجم",
    "packaging_en": "250g & 500g Punnets in 2kg / 2.5kg Master Cartons",
    "image_url": "assets/images/products/fresh_strawberries.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 3,
    "slug": "fresh-pomegranates",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "رمان وندرفول ومنفلوطي طازج",
    "name_en": "Fresh Wonderful & Baladi Pomegranates",
    "tag_ar": "لون ياقوتي فاخر",
    "tag_en": "Premium Ruby Red",
    "variety_ar": "وندرفول ومنفلوطي (عيارات 6، 7، 8، 9، 10، 12، 14)",
    "variety_en": "Wonderful & Manfalouti (Counts 6, 7, 8, 9, 10, 12, 14)",
    "season_ar": "سبتمبر - يناير",
    "season_en": "September - January",
    "packaging_ar": "كرتون تصدير 4.5 كجم و 5 كجم أو صناديق بلاستيكية",
    "packaging_en": "4.5kg & 5kg Open Top Cartons",
    "image_url": "assets/images/products/fresh_pomegranates.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 4,
    "slug": "fresh-grapes",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "عنب مائدة مصري بدون بذور",
    "name_en": "Seedless Prime Table Grapes",
    "tag_ar": "أصناف سوبريور وفليم",
    "tag_en": "Superior, Flame & Crimson",
    "variety_ar": "سوبريور أبيض، فليم أحمر، كريمسون",
    "variety_en": "White Superior, Red Flame, Crimson",
    "season_ar": "مايو - سبتمبر",
    "season_en": "May - September",
    "packaging_ar": "أكياس حمل 500 جم أو عبوات 500 جم داخل كرتون 4.5 كجم و 5 كجم",
    "packaging_en": "500g Carry Bags / Punnets in 4.5kg / 5kg Cartons",
    "image_url": "assets/images/products/fresh_grapes.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 30,
    "slug": "fresh-navel-orange",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "برتقال بسرة مصري فاخر",
    "name_en": "Fresh Egyptian Navel Oranges",
    "tag_ar": "حلاوة طبيعية وقشرة سهلة التقشير",
    "tag_en": "Naturally Sweet & Seedless",
    "variety_ar": "بسرة مصري نخب أول (عيارات 48-125)",
    "variety_en": "Navel Grade A (Counts 48, 56, 64, 72, 80, 88, 100, 113, 125)",
    "season_ar": "نوفمبر - مارس",
    "season_en": "November - March",
    "packaging_ar": "كرتون تلسكوبي 15 كجم، كرتون مفتوح 8 كجم",
    "packaging_en": "15kg Telescopic Cartons, 8kg Open Top Cartons",
    "image_url": "assets/images/products/fresh_navel_orange.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 31,
    "slug": "fresh-summer-orange",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "برتقال صيفي مصري",
    "name_en": "Fresh Egyptian Summer Oranges",
    "tag_ar": "عصارة وفيرة وجودة تصدير",
    "tag_en": "High Juice Summer Crop",
    "variety_ar": "برتقال صيفي عالي العصارة والتوازن",
    "variety_en": "Juicy Summer Orange (Brix 11°+)",
    "season_ar": "فبراير - مايو",
    "season_en": "February - May",
    "packaging_ar": "كرتون 15 كجم، أكياس شبكية 1-2 كجم",
    "packaging_en": "15kg Telescopic Cartons, 1-2kg Net Bags",
    "image_url": "assets/images/products/fresh_summer_orange.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 32,
    "slug": "fresh-murcott-tangerine",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "يوسفي موركيت مصري فاخر",
    "name_en": "Fresh Murcott Tangerines / Mandarins",
    "tag_ar": "نكهة عسلية ولون برتقالي محمر",
    "tag_en": "Honey Sweet Murcott",
    "variety_ar": "موركيت هوني يوسفي (عيارات 1X إلى 5X)",
    "variety_en": "Murcott Honey Mandarin (Sizes 1X, 2X, 3X, 4X, 5X)",
    "season_ar": "يناير - أبريل",
    "season_en": "January - April",
    "packaging_ar": "كرتون 8 كجم و 10 كجم و 14 كجم تلسكوبي ومفتوح",
    "packaging_en": "8kg, 10kg, 14kg Telescopic & Open Top Cartons",
    "image_url": "assets/images/products/fresh_murcott_tangerine.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 34,
    "slug": "fresh-mango",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "مانجو طازجة مصرية فاخرة",
    "name_en": "Premium Fresh Egyptian Mangoes",
    "tag_ar": "نخب أول خالي من الألياف",
    "tag_en": "Luscious Fiber-Free Grade A",
    "variety_ar": "كيت، كنت، نعومي، تومي، زبدية، فص",
    "variety_en": "Keitt, Kent, Naomi, Tommy Atkins, Zebdia, Fass",
    "season_ar": "يوليو - نوفمبر",
    "season_en": "July - November",
    "packaging_ar": "كرتون تصدير مسطح 4 كجم و 5 كجم (6-12 حبة)",
    "packaging_en": "4kg & 5kg Open Top Cartons (Counts 6-12)",
    "image_url": "assets/images/products/fresh_mango.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 35,
    "slug": "fresh-blueberries",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "توت أزرق طازج فاخر (بلو بيري)",
    "name_en": "Fresh Premium Blueberries",
    "tag_ar": "سوبر فود غني بمضادات الأكسدة",
    "tag_en": "Antioxidant-Rich Superfood",
    "variety_ar": "توت أزرق جامبو متماسك ذو شمع طبيعي",
    "variety_en": "Southern Highbush Blueberries (14mm+)",
    "season_ar": "يناير - مايو",
    "season_en": "January - May",
    "packaging_ar": "عبوات كلير شيل 125 جم (12 عبوة في كرتون 1.5 كجم)",
    "packaging_en": "125g Clamshells (12 punnets / 1.5kg Master Box)",
    "image_url": "assets/images/products/fresh_blueberries.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 36,
    "slug": "fresh-blackberries",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "توت أسود وعليق طازج (بلاك بيري)",
    "name_en": "Fresh Blackberries",
    "tag_ar": "حبات براقة وقوام لحمي ممتلئ",
    "tag_en": "Glossy Plump Blackberries",
    "variety_ar": "عليق وتوت أسود شوكي وبدون أشواك",
    "variety_en": "Cultivated Thornless Sweet Blackberries",
    "season_ar": "فبراير - يونيو",
    "season_en": "February - June",
    "packaging_ar": "عبوات 125 جم داخل كرتون 1.5 كجم",
    "packaging_en": "125g Clamshells (12x125g / 1.5kg Master Box)",
    "image_url": "assets/images/products/fresh_blackberries.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 37,
    "slug": "fresh-raspberries",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "توت أحمر طازج (راسبيري)",
    "name_en": "Fresh Raspberries & Red Currants",
    "tag_ar": "حبات مخملية حمراء ياقوتية",
    "tag_en": "Velvety Ruby Red Berries",
    "variety_ar": "راسبيري وتوت أحمر منتقى يدوياً بحذر",
    "variety_en": "Hand-picked Tender Raspberries",
    "season_ar": "يناير - مايو",
    "season_en": "January - May",
    "packaging_ar": "عبوات 125 جم داخل كرتون 1.5 كجم",
    "packaging_en": "125g Clamshells (12x125g / 1.5kg Master Box)",
    "image_url": "assets/images/products/fresh_raspberries.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 38,
    "slug": "fresh-grapefruit",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "جريب فروت مصري أحمر ووردي",
    "name_en": "Fresh Red & Star Ruby Grapefruit",
    "tag_ar": "قلب أحمر ياقوتي عصيري",
    "tag_en": "Juicy Deep Red Flesh",
    "variety_ar": "ستار روبي وريو ريد (عيارات 32-56)",
    "variety_en": "Star Ruby & Rio Red (Counts 32, 36, 40, 48, 56)",
    "season_ar": "أكتوبر - أبريل",
    "season_en": "October - April",
    "packaging_ar": "كرتون تلسكوبي 15 كجم ومفتوح 8 كجم",
    "packaging_en": "15kg Telescopic & 8kg Open Top Cartons",
    "image_url": "assets/images/products/fresh_grapefruit.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 39,
    "slug": "fresh-peaches",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "خوخ سكري وفلوريدا طازج",
    "name_en": "Fresh Egyptian Sweet & Florida Peaches",
    "tag_ar": "حبات مخملية ورائحة فواحة",
    "tag_en": "Aromatic Sweet Stone Fruit",
    "variety_ar": "فلوريدا برنس، ديزرت ريد، سكري مصري",
    "variety_en": "Florida Prince, Desert Red, Early Sweet (Calibers A, AA, AAA)",
    "season_ar": "أبريل - يوليو",
    "season_en": "April - July",
    "packaging_ar": "كرتون صف واحد 4 و 5 كجم ببيوت فوم حامية",
    "packaging_en": "4kg & 5kg Single Layer Cartons with Foam Trays",
    "image_url": "assets/images/products/fresh_peaches.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 40,
    "slug": "fresh-guava",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "جوافة بناتي بيضاء طازجة",
    "name_en": "Fresh Egyptian Baladi & Banati Guava",
    "tag_ar": "رائحة عطرية نفاذة ومذاق سكري",
    "tag_en": "Intensely Aromatic Tropical Guava",
    "variety_ar": "جوافة بناتي بيضاء منتقاة قليلة البذور",
    "variety_en": "White Banati Guava (Low Seeds, Crisp Pulp)",
    "season_ar": "أغسطس - نوفمبر",
    "season_en": "August - November",
    "packaging_ar": "كرتون تصدير 4 كجم و 5 كجم",
    "packaging_en": "4kg & 5kg Telescopic Cartons",
    "image_url": "assets/images/products/fresh_guava.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 41,
    "slug": "fresh-lime",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "ليمون بلدي مصري (لايم أخضر وأصفر)",
    "name_en": "Fresh Egyptian Baladi Lime & Green Lemon",
    "tag_ar": "عصارة وفيرة وزيوت عطرية فائقة",
    "tag_en": "Zesty High-Juice Egyptian Lime",
    "variety_ar": "ليمون بنزهير بلدي (أخضر وأصفر)",
    "variety_en": "Egyptian Key Lime / Baladi (Calibers 35-45mm)",
    "season_ar": "متوفر طوال العام (ذروة أغسطس - ديسمبر)",
    "season_en": "Year-Round (Peak Aug - Dec)",
    "packaging_ar": "كرتون 4.5 كجم و 5 كجم، أكياس شبكية",
    "packaging_en": "4.5kg & 5kg Export Cartons, Net Bags",
    "image_url": "assets/images/products/fresh_lime.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 42,
    "slug": "fresh-eureka-lemon",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "ليمون أضاليا يوريكا مصري",
    "name_en": "Fresh Eureka & Adalia Lemons",
    "tag_ar": "لون أصفر ذهبي وشكل بيضاوي مثالي",
    "tag_en": "Smooth Bright Yellow Lemons",
    "variety_ar": "يوريكا وأضاليا عالي العصير خالي من البذور تقريباً",
    "variety_en": "Eureka & Adalia (Counts 80, 100, 113, 125, 138, 150)",
    "season_ar": "نوفمبر - أبريل",
    "season_en": "November - April",
    "packaging_ar": "كرتون تلسكوبي 15 كجم ومفتوح 8 كجم",
    "packaging_en": "15kg Telescopic & 8kg Open Top Cartons",
    "image_url": "assets/images/products/fresh_eureka_lemon.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 43,
    "slug": "fresh-watermelon",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "بطيخ مصري فاخر (أحمر سكري)",
    "name_en": "Fresh Egyptian Watermelon (Sweet Crimson)",
    "tag_ar": "قلب أحمر سكري مقرمش",
    "tag_en": "Crisp Deep Red Sweet Flesh",
    "variety_ar": "جيزة 1، كريمسون سويت، أسوان (أوزان 6-14 كجم)",
    "variety_en": "Giza, Crimson Sweet, Aswan (Sizes 6 - 14kg / fruit)",
    "season_ar": "مايو - أغسطس",
    "season_en": "May - August",
    "packaging_ar": "صناديق Bins كرتونية 500 كجم أو كراتين فردية وثنائية",
    "packaging_en": "500kg Jumbo Carton Bins / Heavy Master Cartons",
    "image_url": "assets/images/products/fresh_watermelon.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 44,
    "slug": "fresh-cantaloupe",
    "category_id": 1,
    "trade_type": "export",
    "name_ar": "كانتلوب وشمام",
    "name_en": "Fresh Cantaloupe & Galia Melon",
    "tag_ar": "شبكة قشرية متناسقة ولحم سكري عطر",
    "tag_en": "Sweet Aromatic Galia & Cantaloupe",
    "variety_ar": "جاليا، كانتلوب صخري، شمام أناناس (عيارات 4-8 حبات)",
    "variety_en": "Galia, Charentais & Cantaloupe (Counts 4, 5, 6, 7, 8)",
    "season_ar": "أبريل - أكتوبر",
    "season_en": "April - October",
    "packaging_ar": "كرتون تصدير 5 كجم مسطح مهوى",
    "packaging_en": "5kg Ventilated Export Cartons",
    "image_url": "assets/images/products/fresh_cantaloupe.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-fruits",
    "category_name_ar": "فواكه طازجة",
    "category_name_en": "Fresh Fruits"
  },
  {
    "id": 5,
    "slug": "fresh-potatoes",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "بطاطس مائدة وتصنيع (خالية من العفن البني)",
    "name_en": "Fresh Table & Processing Potatoes",
    "tag_ar": "خالية من العفن البني",
    "tag_en": "Brown Rot Free Certified",
    "variety_ar": "سبونتا، هيرمس، روزيتا، كارا",
    "variety_en": "Spunta, Hermes, Rosetta, Lady Claire",
    "season_ar": "يناير - يونيو",
    "season_en": "January - June",
    "packaging_ar": "أجولة شبكية 10 كجم و 25 كجم، أكياس جامبو 1000 و 1250 كجم",
    "packaging_en": "10kg & 25kg Mesh Bags, 1000kg/1250kg Jumbo Bags",
    "image_url": "assets/images/products/fresh_potatoes.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 15,
    "slug": "fresh-sweet-potato",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "بطاطا حلوة مصرية فاخرة",
    "name_en": "Premium Egyptian Fresh Sweet Potatoes",
    "tag_ar": "قلب برتقالي سكري",
    "tag_en": "High Brix Orange Flesh",
    "variety_ar": "بيوريجارد، بلفيو (أحجام معايرة S, M, L, XL)",
    "variety_en": "Beauregard, Bellevue (Calibers S, M, L, XL)",
    "season_ar": "أغسطس - مارس",
    "season_en": "August - March",
    "packaging_ar": "كرتون تصدير 6 كجم صلب، كراتين تلسكوبية أو صناديق بلاستيكية",
    "packaging_en": "6kg Master Export Cartons, Telescopic Boxes",
    "image_url": "assets/images/products/fresh_sweet_potato.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 16,
    "slug": "fresh-bell-peppers",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "فلفل ألوان صبي ومحمي (أحمر، أصفر، برتقالي)",
    "name_en": "Fresh Colored Bell Peppers (Red, Yellow, Orange)",
    "tag_ar": "زراعات محمية فائقة الجودة",
    "tag_en": "Greenhouse Grade A",
    "variety_ar": "فلفل رومي مكعب سميك الجدار (أحمر، أصفر، برتقالي)",
    "variety_en": "Blocky Thick-walled Bell Peppers",
    "season_ar": "أكتوبر - مايو",
    "season_en": "October - May",
    "packaging_ar": "كرتون تصدير 5 كجم متين، عبوات فلو-باك 500 جم",
    "packaging_en": "5kg Telescopic Export Cartons, 500g Flow-Packs",
    "image_url": "assets/images/products/fresh_bell_peppers.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 17,
    "slug": "fresh-iceberg-lettuce",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "خس كابوتشا طازج (آيسبيرج)",
    "name_en": "Fresh Egyptian Iceberg Lettuce",
    "tag_ar": "حبات مقرمشة مبردة فورياً",
    "tag_en": "Vacuum-Cooled Crispy",
    "variety_ar": "آيسبيرج مستدير عالي الكثافة (400 - 800 جم للرأس)",
    "variety_en": "Compact Heavy Iceberg Heads (400g - 800g / piece)",
    "season_ar": "نوفمبر - أبريل",
    "season_en": "November - April",
    "packaging_ar": "كرتون تصدير 5-7 كجم (10-12 حبة مغلفة فردياً بالسيلوفان)",
    "packaging_en": "5-7kg Cartons (10-12 wrapped heads in film)",
    "image_url": "assets/images/products/fresh_iceberg_lettuce.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 18,
    "slug": "fresh-green-beans",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "فاصوليا خضراء رفيعة فاخرة (فاين واكسترا فاين)",
    "name_en": "Fresh Fine & Extra Fine Green Beans",
    "tag_ar": "قرون مستقيمة طازجة",
    "tag_en": "Hand-Picked Extra Fine",
    "variety_ar": "بولستا، فالنتينو (طول 10-14 سم، قطر 6.5-9 مم)",
    "variety_en": "Paulista, Valentino (Length 10-14cm, Caliber 6.5-9mm)",
    "season_ar": "أكتوبر - مايو",
    "season_en": "October - May",
    "packaging_ar": "كرتون 4 كجم و 5 كجم، أكياس ميكرو-بيرفوريتيد 500 جم",
    "packaging_en": "4kg & 5kg Cartons, 500g Micro-perforated Polybags",
    "image_url": "assets/images/products/fresh_green_beans.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 19,
    "slug": "fresh-green-peas",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "بسلة خضراء طازجة (قرون وحبوب)",
    "name_en": "Fresh Green Peas & Sugar Pods",
    "tag_ar": "حبات سكرية ممتلئة",
    "tag_en": "Sweet & Tender Pods",
    "variety_ar": "بسلة سكرية مستديرة وشوجر سناب",
    "variety_en": "Sugar Snap, Garden Sweet Peas",
    "season_ar": "ديسمبر - أبريل",
    "season_en": "December - April",
    "packaging_ar": "كرتون 4 و 5 كجم، صناديق بلاستيكية مهواة",
    "packaging_en": "4kg & 5kg Export Boxes, Plastic Crates",
    "image_url": "assets/images/products/fresh_green_peas.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 20,
    "slug": "fresh-carrots",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "جزر طازج مغسول ومصنف",
    "name_en": "Fresh Washed & Graded Table Carrots",
    "tag_ar": "لون برتقالي ناصع وقرمشة فائقة",
    "tag_en": "Hydro-Cooled Grade A",
    "variety_ar": "نانتس، كوروبا (أقطار 20-30 مم و 30-40 مم)",
    "variety_en": "Nantes, Kuroda (Diameters 20-30mm / 30-40mm)",
    "season_ar": "ديسمبر - يونيو",
    "season_en": "December - June",
    "packaging_ar": "أكياس بولي بروبلين 5 و 10 كجم، كراتين 10 كجم",
    "packaging_en": "5kg & 10kg Polybags / 10kg Master Export Cartons",
    "image_url": "assets/images/products/fresh_carrots.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 21,
    "slug": "fresh-cabbage",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "كرنب طازج أبيض وأحمر وسلطة",
    "name_en": "Fresh White & Red Head Cabbage",
    "tag_ar": "رؤوس متماسكة صلبة",
    "tag_en": "Firm Export Heads",
    "variety_ar": "كرنب أبيض هولندي، كرنب أحمر مائدة (وزن 1.2 - 2.5 كجم)",
    "variety_en": "Dutch White Cabbage, Red Salad Cabbage (1.2 - 2.5kg/head)",
    "season_ar": "نوفمبر - مايو",
    "season_en": "November - May",
    "packaging_ar": "أجولة شبكية 15-20 كجم، صناديق خشبية وبلاستيكية أو كراتين",
    "packaging_en": "15-20kg Mesh Bags, Wooden/Plastic Bins",
    "image_url": "assets/images/products/fresh_cabbage.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 22,
    "slug": "fresh-jalapeno-peppers",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "فلفل هالبينو أخضر حار طازج",
    "name_en": "Fresh Green Jalapeño Hot Peppers",
    "tag_ar": "حرارة متوازنة وقوام لحمي صلب",
    "tag_en": "Premium Hot & Crunchy",
    "variety_ar": "هالبينو لحمي صلب (طول 7-10 سم، قطر 2.5-3.5 سم)",
    "variety_en": "Thick-fleshed Green Jalapeño (Length 7-10cm)",
    "season_ar": "متوفر طوال العام (ذروة أكتوبر - يونيو)",
    "season_en": "Available Year-Round (Peak Oct - Jun)",
    "packaging_ar": "كرتون تصدير 4 و 5 كجم مهوى، صناديق بلاستيكية",
    "packaging_en": "4kg & 5kg Ventilated Export Cartons, Plastic Crates",
    "image_url": "assets/images/products/fresh_jalapeno.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 6,
    "slug": "frozen-strawberries",
    "category_id": 4,
    "trade_type": "export",
    "name_ar": "فراولة مجمدة سريعة التجميد (IQF)",
    "name_en": "IQF Frozen Whole Strawberries",
    "tag_ar": "تجميد فردي فائق",
    "tag_en": "Grade A Whole IQF",
    "variety_ar": "فستيفال، فورتونا، سينساشن (أحجام معايرة 25-35 مم)",
    "variety_en": "Festival, Fortuna, Sensation (Calibers 25-35mm)",
    "season_ar": "متوفر طوال العام (ذروة الحصاد نوفمبر - مايو)",
    "season_en": "Year-Round Supply (Harvest Nov - May)",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم صب باليتية",
    "packaging_en": "400g, 1kg, 2.5kg Polybags / 10kg Bulk Master Cartons",
    "image_url": "assets/images/products/frozen_strawberries.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-fruits",
    "category_name_ar": "فواكه مجمدة",
    "category_name_en": "Frozen Fruits"
  },
  {
    "id": 7,
    "slug": "frozen-mango-slices-chunks",
    "category_id": 4,
    "trade_type": "export",
    "name_ar": "مانجو مجمدة (شرائح ومكعبات IQF)",
    "name_en": "IQF Frozen Mango Slices & Diced Chunks",
    "tag_ar": "نخب أول ذهبي",
    "tag_en": "100% Sweet Natural",
    "variety_ar": "كيت، تومي، زبدية (شرائح ومكعبات 10×10 و 15×15 مم)",
    "variety_en": "Keitt, Tommy Atkins, Zebdia (Slices & Dices 10x10mm / 15x15mm)",
    "season_ar": "متوفر طوال العام (موسم الحصاد يوليو - نوفمبر)",
    "season_en": "Year-Round Supply (Harvest Jul - Nov)",
    "packaging_ar": "أكياس 1 كجم، 2.5 كجم، كراتين تصدير 10 كجم وبطانات غذائية",
    "packaging_en": "1kg, 2.5kg Polybags / 10kg Industrial Cartons with Food-grade Liners",
    "image_url": "assets/images/products/frozen_mango.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-fruits",
    "category_name_ar": "فواكه مجمدة",
    "category_name_en": "Frozen Fruits"
  },
  {
    "id": 8,
    "slug": "frozen-guava",
    "category_id": 4,
    "trade_type": "export",
    "name_ar": "جوافة مجمدة (أنصاف وشرائح IQF)",
    "name_en": "IQF Frozen Guava Halves & Slices",
    "tag_ar": "رائحة ونكهة طبيعية",
    "tag_en": "Aromatic Pulp & Slices",
    "variety_ar": "جوافة بناتي بيضاء وحمراء (منزوعة البذور، أنصاف ومكعبات)",
    "variety_en": "White & Pink Egyptian Guava (Deseeded Halves & Dices)",
    "season_ar": "متوفر طوال العام (موسم الحصاد أغسطس - نوفمبر)",
    "season_en": "Year-Round Supply (Harvest Aug - Nov)",
    "packaging_ar": "أكياس 1 كجم، 2.5 كجم، كراتين 10 كجم وبراميل 200 كجم للعصائر",
    "packaging_en": "1kg, 2.5kg Bags / 10kg Cartons / 200kg Aseptic Drums for Juices",
    "image_url": "assets/images/products/frozen_guava.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-fruits",
    "category_name_ar": "فواكه مجمدة",
    "category_name_en": "Frozen Fruits"
  },
  {
    "id": 9,
    "slug": "frozen-peaches",
    "category_id": 4,
    "trade_type": "export",
    "name_ar": "خوخ مجمد (شرائح وأنصاف IQF)",
    "name_en": "IQF Frozen Peach Slices & Halves",
    "tag_ar": "جاهز للتصنيع والتجزئة",
    "tag_en": "Industrial & Retail Grade",
    "variety_ar": "خوخ فلوريدا وسكري مصري (أنصاف مقشرة وشرائح)",
    "variety_en": "Florida & Egyptian Sweet Peach (Peeled Halves & Slices)",
    "season_ar": "متوفر طوال العام (موسم الحصاد أبريل - يوليو)",
    "season_en": "Year-Round Supply (Harvest Apr - Jul)",
    "packaging_ar": "أكياس 1 كجم، 2.5 كجم، كراتين 10 كجم للصناعات الغذائية",
    "packaging_en": "1kg, 2.5kg Bags / 10kg Master Cartons with inner polyethylene",
    "image_url": "assets/images/products/frozen_peaches.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-fruits",
    "category_name_ar": "فواكه مجمدة",
    "category_name_en": "Frozen Fruits"
  },
  {
    "id": 10,
    "slug": "frozen-pomegranate-arils",
    "category_id": 4,
    "trade_type": "export",
    "name_ar": "حبوب رمان مجمدة (فصوص IQF)",
    "name_en": "IQF Frozen Pomegranate Arils",
    "tag_ar": "حبات ياقوتية نقية 100%",
    "tag_en": "100% Pure Ruby Arils",
    "variety_ar": "رمان وندرفول ومنفلوطي (حبات ياقوتية مفصولة إلكترونياً)",
    "variety_en": "Wonderful & Manfalouti (Optically Sorted Ruby Kernels)",
    "season_ar": "متوفر طوال العام (موسم الحصاد سبتمبر - يناير)",
    "season_en": "Year-Round Supply (Harvest Sep - Jan)",
    "packaging_ar": "أكياس 500 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم معقمة",
    "packaging_en": "500g, 1kg, 2.5kg Bags / 10kg Master Box / Palletized",
    "image_url": "assets/images/products/frozen_pomegranate.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-fruits",
    "category_name_ar": "فواكه مجمدة",
    "category_name_en": "Frozen Fruits"
  },
  {
    "id": 45,
    "slug": "fresh-dragon-fruit",
    "category_id": 3,
    "trade_type": "export",
    "name_ar": "دراجون فروت مصري فاخر (فاكهة التنين)",
    "name_en": "Fresh Egyptian Dragon Fruit (Pitaya)",
    "tag_ar": "لحم أحمر وأبيض عالي الجودة",
    "tag_en": "White & Red Flesh Varieties",
    "variety_ar": "اللحم الأبيض والأحمر (Hylocereus undatus / polyrhizus)",
    "variety_en": "White & Red Flesh (Hylocereus undatus / costaricensis)",
    "season_ar": "يونيو - ديسمبر",
    "season_en": "June - December",
    "packaging_ar": "كرتون تصدير 4 كجم أو 5 كجم مفروش بالفوم لحماية الحراشف",
    "packaging_en": "4kg / 5kg export carton with protective foam nets",
    "image_url": "assets/images/products/fresh_dragon_fruit.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-exotic",
    "category_name_ar": "فواكه استوائية ونادرة",
    "category_name_en": "Fresh Exotic & Tropical Fruits"
  },
  {
    "id": 46,
    "slug": "fresh-passion-fruit",
    "category_id": 3,
    "trade_type": "export",
    "name_ar": "باشن فروت مصري طازج (ماراكويا)",
    "name_en": "Fresh Egyptian Passion Fruit (Maracuja)",
    "tag_ar": "عطر فواح ونكهة مركزة",
    "tag_en": "Intense Aroma & High Juice Yield",
    "variety_ar": "باشن أرجواني وبنفسجي فاخر (Passiflora edulis)",
    "variety_en": "Purple Passion Fruit (Passiflora edulis)",
    "season_ar": "يوليو - فبراير",
    "season_en": "July - February",
    "packaging_ar": "كرتون تلسكوبي تصدير 2 كجم و 2.5 كجم مع فواصل ورقية",
    "packaging_en": "2kg & 2.5kg export cartons with partitioned cell trays",
    "image_url": "assets/images/products/fresh_passion_fruit.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-exotic",
    "category_name_ar": "فواكه استوائية ونادرة",
    "category_name_en": "Fresh Exotic & Tropical Fruits"
  },
  {
    "id": 47,
    "slug": "fresh-lychee",
    "category_id": 3,
    "trade_type": "export",
    "name_ar": "ليتشي مصري طازج فاخر",
    "name_en": "Fresh Premium Lychee Fruit",
    "tag_ar": "لب لؤلؤي سكري عالي النضارة",
    "tag_en": "Sweet Translucent Pearl Pulp",
    "variety_ar": "موريشيوس / ماوريتيوس (Litchi chinensis)",
    "variety_en": "Mauritius / Bengal (Litchi chinensis)",
    "season_ar": "يونيو - أغسطس",
    "season_en": "June - August",
    "packaging_ar": "كرتونات مبردة 2 كجم و 4 كجم أو سلال شفافة 500 جم",
    "packaging_en": "2kg & 4kg ventilated cartons or 500g transparent clamshells",
    "image_url": "assets/images/products/fresh_lychee.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-exotic",
    "category_name_ar": "فواكه استوائية ونادرة",
    "category_name_en": "Fresh Exotic & Tropical Fruits"
  },
  {
    "id": 48,
    "slug": "fresh-papaya",
    "category_id": 3,
    "trade_type": "export",
    "name_ar": "بابايا مصرية طازجة (ريد ليدي)",
    "name_en": "Fresh Egyptian Papaya (Red Lady)",
    "tag_ar": "لب برتقالي ذهبي فائق الحلاوة",
    "tag_en": "Golden Orange Sweet Flesh",
    "variety_ar": "ريد ليدي الهجينة وفورموزا (Carica papaya)",
    "variety_en": "Red Lady & Formosa (Carica papaya)",
    "season_ar": "طوال العام (ذروة الإنتاج: سبتمبر - مايو)",
    "season_en": "Year-Round (Peak: September - May)",
    "packaging_ar": "كرتون تصدير مقوى 4.5 كجم و 5 كجم مع أكمام شبكية",
    "packaging_en": "4.5kg & 5kg heavy-duty cartons with protective mesh socks",
    "image_url": "assets/images/products/fresh_papaya.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-exotic",
    "category_name_ar": "فواكه استوائية ونادرة",
    "category_name_en": "Fresh Exotic & Tropical Fruits"
  },
  {
    "id": 49,
    "slug": "fresh-mangosteen",
    "category_id": 3,
    "trade_type": "export",
    "name_ar": "مانجوستين طازج فاخر (ملكة الفواكه)",
    "name_en": "Fresh Purple Mangosteen (Queen of Fruits)",
    "tag_ar": "فصوص بيضاء ناصعة ومذاق ملكي",
    "tag_en": "Snow-White Segments & Royal Taste",
    "variety_ar": "مانجوستين بنفسجي فاخر (Garcinia mangostana)",
    "variety_en": "Purple Mangosteen (Garcinia mangostana)",
    "season_ar": "مايو - أكتوبر",
    "season_en": "May - October",
    "packaging_ar": "كرتون تصدير فاخر 2 كجم و 4 كجم مع حماية خاصة",
    "packaging_en": "2kg & 4kg premium master export cartons",
    "image_url": "assets/images/products/fresh_mangosteen.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-exotic",
    "category_name_ar": "فواكه استوائية ونادرة",
    "category_name_en": "Fresh Exotic & Tropical Fruits"
  },
  {
    "id": 50,
    "slug": "fresh-pineapple",
    "category_id": 3,
    "trade_type": "export",
    "name_ar": "أناناس سكري ذهبي طازج (MD2 Extra Sweet)",
    "name_en": "Fresh Golden MD2 Pineapple (Extra Sweet)",
    "tag_ar": "حلاوة فائقة ولون ذهبي جذاب",
    "tag_en": "Extra Sweet & High Juice Content",
    "variety_ar": "إم دي 2 الذهبي فائق الحلاوة (Ananas comosus MD2)",
    "variety_en": "MD2 Golden Extra Sweet (Ananas comosus)",
    "season_ar": "طوال العام",
    "season_en": "Year-Round",
    "packaging_ar": "كرتون عمودي/أفقي مقوى 12 كجم مع فواصل حماية التاج",
    "packaging_en": "12kg heavy-duty upright cartons with crown dividers",
    "image_url": "assets/images/products/fresh_pineapple.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-exotic",
    "category_name_ar": "فواكه استوائية ونادرة",
    "category_name_en": "Fresh Exotic & Tropical Fruits"
  },
  {
    "id": 53,
    "slug": "white-pumpkin-seeds",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "لب أبيض مصري ممتاز (بزر قرع عسلي)",
    "name_en": "Egyptian White Pumpkin Seeds",
    "tag_ar": "درجة نقاء 99.5% مفروز إلكترونياً",
    "tag_en": "Sortex Cleaned 99.5% Purity",
    "variety_ar": "حجم سوبر 11-13 سم، حجم قياسي 9-11 سم، حبات ممتلئة",
    "variety_en": "Grades: 11-13cm (Super Jumbo), 9-11cm (Standard A)",
    "season_ar": "أغسطس - مارس (ومتوافر طوال العام)",
    "season_en": "August - March (Year-Round Availability)",
    "packaging_ar": "أكياس بولي بروبلين 25 كجم أو أكياس خيش 50 كجم",
    "packaging_en": "25kg / 50kg PP or Jute Bags, Palletized",
    "image_url": "assets/images/products/white_pumpkin_seeds.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 54,
    "slug": "super-melon-seeds",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "لب سوبر مصري فاخر (بزر بطيخ إسماعيلية)",
    "name_en": "Egyptian Super Watermelon Seeds (Lob Super)",
    "tag_ar": "سوبر جامبو درجة أولى",
    "tag_en": "Super Jumbo Grade 1",
    "variety_ar": "سوبر نمرة 1 (8.5 - 9.5 مم)، سوبر نمرة 2 (7.5 - 8.5 مم)",
    "variety_en": "Size Grade 1 (8.5-9.5mm), Size Grade 2 (7.5-8.5mm)",
    "season_ar": "يوليو - فبراير (متوافر مدار العام)",
    "season_en": "July - February (Year-Round Availability)",
    "packaging_ar": "شكاير بولي بروبلين منسوجة 25 كجم و 50 كجم",
    "packaging_en": "25kg / 50kg Heavy-Duty Woven PP Bags",
    "image_url": "assets/images/products/super_melon_seeds.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 55,
    "slug": "sunflower-seeds",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "لب سوري مصري ممتاز (بزر دوار الشمس)",
    "name_en": "Egyptian Striped Sunflower Seeds",
    "tag_ar": "حبات طويلة ممتلئة درجة نقاء 99%",
    "tag_en": "Long Grain & Plump Kernels",
    "variety_ar": "مخطط طويل 361/3949، أسود بلدي، عيارات 20/64 و 22/64",
    "variety_en": "Long Striped 361 / 3949, Counts: 20/64, 22/64, 24/64",
    "season_ar": "أغسطس - مارس (متوافر طوال العام)",
    "season_en": "August - March (Year-Round Availability)",
    "packaging_ar": "أكياس ورقية متعددة الطبقات أو شكاير بولي بروبلين 20 و 25 كجم",
    "packaging_en": "20kg / 25kg Multi-Wall Paper or PP Bags",
    "image_url": "assets/images/products/sunflower_seeds.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 56,
    "slug": "white-navy-beans",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "فاصوليا بيضاء مصرية جافة درجة أولى (سورتكس)",
    "name_en": "Egyptian Dry White Navy / Kidney Beans",
    "tag_ar": "بياض ناصع فرز ليزر 99.5%",
    "tag_en": "Sortex Cleaned 99.5% Purity",
    "variety_ar": "فاصوليا نبراس، فاصوليا جيزة 6، مقاسات 180-200 و 200-220 حبة/100جم",
    "variety_en": "Nebras & Giza 6 Varieties, Counts: 180-200 / 200-220 per 100g",
    "season_ar": "يونيو - يناير (وحصاد شتوي وصيفي)",
    "season_en": "June - January (Bi-annual harvest)",
    "packaging_ar": "أكياس بولي بروبلين 25 كجم و 50 كجم، عبوات 1 كجم و 5 كجم",
    "packaging_en": "25kg / 50kg PP Bags, Retail 1kg / 5kg Bags, 1000kg Big Bags",
    "image_url": "assets/images/products/white_navy_beans.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 57,
    "slug": "black-eyed-peas",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "لوبيا مصرية جافة ذات العين السوداء",
    "name_en": "Egyptian Dry Black-Eyed Peas (Cowpeas)",
    "tag_ar": "حبة ممتلئة فرز إلكتروني",
    "tag_en": "Premium Sortex Cleaned",
    "variety_ar": "لوبيا بلدي عريضة، حبات نمرة 1 متجانسة الحجم",
    "variety_en": "Grade A Broad Kernels, Calibrated Seed Count",
    "season_ar": "أغسطس - فبراير",
    "season_en": "August - February",
    "packaging_ar": "أكياس بروبلين 25 كجم و 50 كجم، وتعبئة شفافة للمستهلك",
    "packaging_en": "25kg / 50kg PP Bags, Palletized Container Loads",
    "image_url": "assets/images/products/black_eyed_peas.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 58,
    "slug": "fava-beans",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "فول مصري بلدي جاف للتدميس والتصدير",
    "name_en": "Egyptian Dry Fava Beans (Broad Beans)",
    "tag_ar": "حبة عريضة بلدي فاخرة",
    "tag_en": "Premium Broad Grade 1",
    "variety_ar": "فول جيزة 843، فول سخا، فول عريض حبة كبيرة ومتوسطة",
    "variety_en": "Giza 843, Sakha varieties; Large & Medium Calibers",
    "season_ar": "أبريل - ديسمبر",
    "season_en": "April - December",
    "packaging_ar": "أكياس خيش طبيعي أو بولي بروبلين 25 كجم و 50 كجم",
    "packaging_en": "25kg / 50kg Jute or PP Woven Bags, 1 MT Jumbo Bags",
    "image_url": "assets/images/products/fava_beans.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 59,
    "slug": "red-lentils",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "عدس مصري أحمر مجروش وعدس كامل",
    "name_en": "Red Split & Whole Lentils",
    "tag_ar": "مغسول وملمع بالزيت النباتي أو طبيعي",
    "tag_en": "Sortex Cleaned 99.7% Purity",
    "variety_ar": "عدس أحمر مجروش Split Red، عدس أصفر، عدس بني جبة",
    "variety_en": "Split Red Lentils, Whole Brown Lentils, Yellow Lentils",
    "season_ar": "متوافر طوال العام",
    "season_en": "Available Year-Round",
    "packaging_ar": "أكياس بولي بروبلين 25 كجم و 50 كجم، عبوات 500 جم و 1 كجم",
    "packaging_en": "25kg / 50kg PP Bags, Retail 500g / 1kg Pouches",
    "image_url": "assets/images/products/red_lentils.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 60,
    "slug": "raw-peanuts",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "فول سوداني مصري خام بقشره ومفصص",
    "name_en": "Egyptian Raw In-Shell & Shelled Peanuts",
    "tag_ar": "خالي من الأفلاتوكسين Aflatoxin Free",
    "tag_en": "Certified Aflatoxin-Free Grade 1",
    "variety_ar": "بقشره عيارات 20/24، 24/28 | مفصص (قلب أحمر) 38/42، 40/50 حبة/أوقية",
    "variety_en": "In-Shell: 20/24, 24/28 | Shelled Red Skin: 38/42, 40/50 per oz",
    "season_ar": "أكتوبر - مايو",
    "season_en": "October - May",
    "packaging_ar": "شكاير جوت خيش طبيعي 25 كجم و 50 كجم، وشكاير تفريغ هواء",
    "packaging_en": "25kg / 50kg Traditional Jute Bags, Vacuum Bags",
    "image_url": "assets/images/products/raw_peanuts.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 61,
    "slug": "caraway-seeds",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "كراوية مصرية حب كاملة ونقية (أعشاب وتوابل)",
    "name_en": "Egyptian Whole Caraway Seeds",
    "tag_ar": "نقاء 99% زيت طيار عالي",
    "tag_en": "99% Machine Cleaned / High Essential Oil",
    "variety_ar": "بذور كراوية بلدية كاملة مفروزة هوائياً وبالليزر",
    "variety_en": "Natural Whole Caraway Seeds, Sortex Graded",
    "season_ar": "مايو - نوفمبر (ومتوافرة طوال العام)",
    "season_en": "May - November (Available Year-Round)",
    "packaging_ar": "أكياس بولي بروبلين منسوجة 25 كجم أو أكياس ورق كرافت مبطنة",
    "packaging_en": "25kg Multi-Ply Paper Bags or Woven PP Bags",
    "image_url": "assets/images/products/caraway_seeds.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 62,
    "slug": "anise-seeds",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "يانسون مصري بلدي طبيعي كامل (حبة حلاوة)",
    "name_en": "Egyptian Natural Whole Aniseed (Anise Seeds)",
    "tag_ar": "رائحة نفاذة ونقاء 99% تصدير",
    "tag_en": "Purity 99% / Extra Green Sortex Cleaned",
    "variety_ar": "يانسون مصري فاخر، مفروز أوتوماتيكياً وخالي من الأعواد",
    "variety_en": "Whole Egyptian Aniseeds, Fully Stemless",
    "season_ar": "يونيو - ديسمبر (ومتوافر طوال العام)",
    "season_en": "June - December (Year-Round Stock)",
    "packaging_ar": "أكياس ورق كرافت ثلاثية الطبقات 20 كجم أو شكاير بروبلين 25 كجم",
    "packaging_en": "20kg / 25kg Paper Kraft Bags or Polypropylene Bags",
    "image_url": "assets/images/products/anise_seeds.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 63,
    "slug": "sesame-seeds",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "سمسم مصري أبيض ومحمص وذهبي (فرز ليزر)",
    "name_en": "Egyptian Natural White & Golden Sesame Seeds",
    "tag_ar": "نقاء 99.9% زيت طبيعي 52%+",
    "tag_en": "Laser Sorted 99.9% / High Oil Content (52%+)",
    "variety_ar": "سمسم أبيض ناصع، سمسم أحمر/ذهبي بلدي، سمسم مقشور Hulled",
    "variety_en": "Natural White, Golden / Red Sesame, Mechanically Hulled",
    "season_ar": "أكتوبر - إبريل (ومتوافر مدار السنة)",
    "season_en": "October - April (Year-Round Availability)",
    "packaging_ar": "أكياس بولي بروبلين 25 كجم و 50 كجم، وعبوات مفرغة الهواء",
    "packaging_en": "25kg / 50kg Multi-Ply Paper or PP Woven Bags",
    "image_url": "assets/images/products/sesame_seeds.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 64,
    "slug": "hibiscus-flowers",
    "category_id": 6,
    "trade_type": "export",
    "name_ar": "كركديه أسواني فاخر زهور كاملة (ورد كركديه لوز)",
    "name_en": "Aswan Whole Hibiscus Flowers (Karkadeh)",
    "tag_ar": "لون ياقوتي داكن وطعم فريد",
    "tag_en": "Deep Crimson Ruby / 100% Whole Calyces",
    "variety_ar": "كركديه أسواني لوز (زهور كاملة)، كركديه مقطع TBC",
    "variety_en": "Whole Aswan Calyces (Grade A), Sifted Cut (TBC)",
    "season_ar": "نوفمبر - يونيو (متوافر طوال العام)",
    "season_en": "November - June (Year-Round Availability)",
    "packaging_ar": "كراتين تصدير 10 كجم و 12 كجم، أو أكياس بولي بروبلين 20 كجم",
    "packaging_en": "10kg / 12kg Export Cartons with PE Liner or 20kg PP Bags",
    "image_url": "assets/images/products/hibiscus_flowers.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "grains",
    "category_name_ar": "حبوب و توابل",
    "category_name_en": "Grains and Spices"
  },
  {
    "id": 70,
    "slug": "frozen-artichoke-bottoms",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "قيعان خرشوف مصرية مجمدة (خرشوف بلدي ونبراس)",
    "name_en": "IQF Frozen Artichoke Bottoms (Hearts)",
    "tag_ar": "فرز ليزر وقيعان متجانسة بياض ناصع",
    "tag_en": "Premium Calibrated Ivory Bottoms",
    "variety_ar": "خرشوف بلدي، نبراس | مقاسات: 5-7 سم، 7-9 سم، 9-11 سم",
    "variety_en": "Egyptian Baladi & Nebras | Diameters: 5-7cm, 7-9cm, 9-11cm",
    "season_ar": "ديسمبر - مايو (ومتوافر مجمد طوال العام)",
    "season_en": "December - May (Available Year-Round IQF)",
    "packaging_ar": "كراتين 10 كجم (4 أكياس × 2.5 كجم)، أو أكياس 1 كجم و 400 جم",
    "packaging_en": "10kg Master Cartons (4x2.5kg), Retail 1kg / 400g Bags",
    "image_url": "assets/images/products/frozen_artichoke_bottoms.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 71,
    "slug": "frozen-mixed-vegetables",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "خضار مشكل مصري مجمد (3 و 4 أصناف)",
    "name_en": "IQF Frozen Mixed Vegetables (3 & 4-Way)",
    "tag_ar": "تجميد فردي سريع IQF ألوان طبيعية زاهية",
    "tag_en": "Vibrant Color Balance & IQF Frozen",
    "variety_ar": "بسلة خضراء + جزر مكعبات + ذرة صفراء + فاصوليا خضراء مقطعة",
    "variety_en": "Green Peas + Diced Carrots + Sweet Corn + Cut Green Beans",
    "season_ar": "متوافر طوال العام",
    "season_en": "Available Year-Round",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين تصدير 10 كجم",
    "packaging_en": "400g, 1kg, 2.5kg Poly Bags / 10kg Master Carton",
    "image_url": "assets/images/products/frozen_mixed_vegetables.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 72,
    "slug": "frozen-green-peas",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "بسلة خضراء مصرية مجمدة سادة (IQF)",
    "name_en": "IQF Frozen Green Garden Peas",
    "tag_ar": "حبات سكرية غضة فرز إلكتروني",
    "tag_en": "Extra Tender & Sweet Garden Peas",
    "variety_ar": "بسلة سكرية غضة نمرة 1، أقطار 7.5 - 9 مم",
    "variety_en": "Sweet Garden Variety Grade 1, Calibers: 7.5-9mm",
    "season_ar": "ديسمبر - إبريل (ومتوافرة مدار السنة)",
    "season_en": "December - April (Year-Round Availability IQF)",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم معقمة",
    "packaging_en": "400g, 1kg, 2.5kg Bags / 10kg Master Export Box",
    "image_url": "assets/images/products/frozen_green_peas.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 73,
    "slug": "frozen-peas-carrots",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "بسلة وجزر مكعبات مجمدة سريعة التجميد",
    "name_en": "IQF Frozen Green Peas & Diced Carrots",
    "tag_ar": "نسبة 50/50 مكعبات متناسقة 10×10 مم",
    "tag_en": "50/50 Premium Blend / 10x10mm Diced",
    "variety_ar": "بسلة خضراء غضة + مكعبات جزر برتقالي سكري",
    "variety_en": "Sweet Green Peas & Orange Carrot Cubes",
    "season_ar": "متوافر طوال العام",
    "season_en": "Available Year-Round",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم",
    "packaging_en": "400g, 1kg, 2.5kg Bags / 10kg Master Box",
    "image_url": "assets/images/products/frozen_peas_carrots.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 74,
    "slug": "frozen-green-beans",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "فاصوليا خضراء مصرية مجمدة (مقطعة وسليمة)",
    "name_en": "IQF Frozen Fine & Cut Green Beans",
    "tag_ar": "فاين واكسترا فاين مقطوعة الأطراف",
    "tag_en": "Stringless Extra Fine & Cut Beans",
    "variety_ar": "فاصوليا بوليستا وبرونكو، مقطعة 2-3 سم أو كاملة Whole",
    "variety_en": "Paulista & Bronco; Cut (2-3cm) or Whole Extra Fine",
    "season_ar": "نوفمبر - مايو (ومتوافرة مدار السنة)",
    "season_en": "November - May (Year-Round Stock)",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم",
    "packaging_en": "400g, 1kg, 2.5kg Bags / 10kg Master Carton",
    "image_url": "assets/images/products/frozen_green_beans.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 75,
    "slug": "frozen-molokhia",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "ملوخية مصرية مجمدة (مفرومة خرط بلدي وورق كامل)",
    "name_en": "IQF Frozen Egyptian Molokhia (Minced & Whole Leaves)",
    "tag_ar": "خضرة فاقعة وعرق وقوام أصيل",
    "tag_en": "Traditional Texture & Deep Emerald Color",
    "variety_ar": "ملوخية بلدي مفرومة خشن/ناعم، وملوخية ورق كامل مقطوف",
    "variety_en": "Traditional Minced (Fine/Coarse) & Whole Leaves",
    "season_ar": "مايو - ديسمبر (ومتوافرة طوال العام)",
    "season_en": "May - December (Available Year-Round)",
    "packaging_ar": "أكياس 400 جم مفرغة، بلوكات 1 كجم و 2.5 كجم، كراتين 10 كجم",
    "packaging_en": "400g Vacuum Poly Packs, 1kg/2.5kg Blocks, 10kg Cartons",
    "image_url": "assets/images/products/frozen_molokhia.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 76,
    "slug": "frozen-okra-zero",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "بامية مصرية مجمدة زيرو (أصغر من 3 سم)",
    "name_en": "IQF Frozen Okra Zero (< 3cm)",
    "tag_ar": "أعلى درجات الفرز الفاخر Zero Grade",
    "tag_en": "Ultra-Premium Zero Caliber (< 3cm)",
    "variety_ar": "بامية بلدية خضراء غضة مقمعة يدوياً، طول < 3 سم",
    "variety_en": "Egyptian Baladi Emerald Okra, Length under 3cm",
    "season_ar": "يونيو - ديسمبر (ومتوافرة طوال العام)",
    "season_en": "June - December (Year-Round Availability IQF)",
    "packaging_ar": "أكياس 400 جم و 1 كجم، كراتين تصدير 8 و 10 كجم",
    "packaging_en": "400g Retail Packs, 1kg Bags, 8kg/10kg Master Cartons",
    "image_url": "assets/images/products/frozen_okra_zero.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 77,
    "slug": "frozen-okra-extra",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "بامية مصرية مجمدة إكسترا (3 - 5 سم)",
    "name_en": "IQF Frozen Okra Extra (3 - 5cm)",
    "tag_ar": "مقمعة هرمياً نخب أول تصدير",
    "tag_en": "Export Grade Extra (3 - 5cm)",
    "variety_ar": "بامية خضراء غضة، طول 3 إلى 5 سم",
    "variety_en": "Selected Green Egyptian Okra, Length 3 - 5cm",
    "season_ar": "يونيو - ديسمبر (ومتوافرة مدار السنة)",
    "season_en": "June - December (Available Year-Round)",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم",
    "packaging_en": "400g, 1kg, 2.5kg Poly Bags / 10kg Master Box",
    "image_url": "assets/images/products/frozen_okra_extra.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 78,
    "slug": "frozen-okra-excellence",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "بامية مصرية مجمدة ممتازة / نمرة 1 (5 - 7 سم)",
    "name_en": "IQF Frozen Okra Excellence / Grade One (5 - 7cm)",
    "tag_ar": "حبات متوسطة غضة ومقمعة بعناية",
    "tag_en": "Tender Medium Caliber (5 - 7cm)",
    "variety_ar": "بامية خضراء ممتازة، طول 5 إلى 7 سم",
    "variety_en": "Egyptian Green Okra, Length 5 - 7cm",
    "season_ar": "يونيو - ديسمبر (ومتوافرة طوال العام)",
    "season_en": "June - December (Year-Round Availability)",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم",
    "packaging_en": "400g, 1kg, 2.5kg Bags / 10kg Master Carton",
    "image_url": "assets/images/products/frozen_okra_excellence.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 79,
    "slug": "frozen-grape-leaves",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "ورق عنب مصري بناتي مجمد (مرصوص ومطوي)",
    "name_en": "Frozen Tender Egyptian Grape Leaves (Vine Leaves)",
    "tag_ar": "ورق ناعم غض خالي من العروق الخشنة",
    "tag_en": "Tender Banati Variety / Stacked & Folded",
    "variety_ar": "ورق عنب بناتي وفيومي ناعم، حزم مرصوصة ومفرغة الهواء",
    "variety_en": "Egyptian Banati Young Vine Leaves, Pre-Stacked Layers",
    "season_ar": "أبريل - يوليو (ومتوافر مجمد مدار السنة)",
    "season_en": "April - July (Available Year-Round Frozen)",
    "packaging_ar": "أكياس 400 جم و 500 جم مفرغة، كراتين 8 و 10 كجم",
    "packaging_en": "400g, 500g Vacuum Poly Packs / 8kg, 10kg Cartons",
    "image_url": "assets/images/products/frozen_grape_leaves.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 80,
    "slug": "frozen-broccoli",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "بروكلي مصري مجمد (زهيرات خضراء IQF)",
    "name_en": "IQF Frozen Broccoli Florets",
    "tag_ar": "زهيرات متماسكة بلون أخضر زمردي",
    "tag_en": "Compact Vivid Green Florets",
    "variety_ar": "بروكلي كالابريزي، زهيرات مقاس 2-4 سم و 3-6 سم",
    "variety_en": "Calabrese Type, Floret Sizes: 2-4cm & 3-6cm",
    "season_ar": "نوفمبر - إبريل (ومتوافر طوال العام)",
    "season_en": "November - April (Year-Round Availability)",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم",
    "packaging_en": "400g, 1kg, 2.5kg Bags / 10kg Master Carton",
    "image_url": "assets/images/products/frozen_broccoli.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 81,
    "slug": "frozen-roasted-eggplant",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "باذنجان رومي مصري مشوي ومدخن مجمد",
    "name_en": "Frozen Fire-Roasted Smoked Eggplant (Pulp & Puree)",
    "tag_ar": "نكهة الشواء الطبيعية على الحطب 100%",
    "tag_en": "100% Natural Flame-Roasted Smoky Flavor",
    "variety_ar": "باذنجان رومي أسود مشوي على اللهب، بيوريه مفروم أو أنصاف",
    "variety_en": "Charcoal/Flame-Roasted Baladi Eggplant Puree & Halves",
    "season_ar": "متوافر طوال العام",
    "season_en": "Available Year-Round",
    "packaging_ar": "أكياس مفرغة 1 كجم، 2.5 كجم، 5 كجم، عبوات للمطاعم",
    "packaging_en": "1kg, 2.5kg, 5kg Vacuum Bags, Foodservice Pails",
    "image_url": "assets/images/products/frozen_roasted_eggplant.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 82,
    "slug": "frozen-sweet-corn",
    "category_id": 5,
    "trade_type": "export",
    "name_ar": "ذرة صفراء سكرية مصرية مجمدة (حبوب كاملة IQF)",
    "name_en": "IQF Frozen Golden Sweet Corn Kernels",
    "tag_ar": "حلاوة طبيعية وقرمشة ذهبية 100%",
    "tag_en": "Super Sweet / Plump Golden Kernels",
    "variety_ar": "ذرة صفراء سكرية فائقة الحلاوة Super Sweet Yellow Corn",
    "variety_en": "Super Sweet Golden Yellow Corn (Whole Kernels)",
    "season_ar": "يونيو - نوفمبر (ومتوافرة طوال العام)",
    "season_en": "June - November (Year-Round Stock IQF)",
    "packaging_ar": "أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم، جامبو 1 طن",
    "packaging_en": "400g, 1kg, 2.5kg Poly Bags / 10kg Carton / 1 MT Octabin",
    "image_url": "assets/images/products/frozen_sweet_corn.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "frozen-veg",
    "category_name_ar": "خضروات مجمدة",
    "category_name_en": "Frozen Vegetables"
  },
  {
    "id": 23,
    "slug": "fresh-red-onion",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "بصل أحمر مصري فاخر (جيزة 6 أحمر وبصل صعيدي)",
    "name_en": "Fresh Egyptian Red Onions",
    "tag_ar": "قشرة حمراء ياقوتية وصلابة تصديرية عالية",
    "tag_en": "Deep Ruby Skin / Superior Storage Life",
    "variety_ar": "جيزة 6 أحمر، رد كريول | مقاسات: 40-60 مم، 50-70 مم، 60-80 مم، 70-90 مم، 80-100 مم",
    "variety_en": "Giza 6 Red & Red Creole | Calibers: 40/60, 50/70, 60/80, 70/90, 80/100 mm",
    "season_ar": "أبريل - ديسمبر (ومتوافر مدار السنة في مستودعات مهواة ومبردة)",
    "season_en": "April - December (Available year-round via ventilated cold storage)",
    "packaging_ar": "شكاير شبك راشيل حمراء 10 كجم، 25 كجم، أكياس جامبو 1 طن، على بالتات خشبية",
    "packaging_en": "10kg, 25kg Red Poly-Mesh Bags / 1 MT Jumbo Bags on Pallets",
    "image_url": "assets/images/products/fresh_red_onion.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  },
  {
    "id": 24,
    "slug": "fresh-white-onion",
    "category_id": 2,
    "trade_type": "export",
    "name_ar": "بصل أبيض وذهبي مصري (جيزة 20 وبصل إيطالي أبيض)",
    "name_en": "Fresh Egyptian Golden & White Onions",
    "tag_ar": "قشرة ذهبية ناصعة وتصافي مرتفعة للتصدير والتصنيع",
    "tag_en": "Bright Golden / White Skin / High Dry Matter",
    "variety_ar": "جيزة 20 أصفر، بصل أبيض ناصع | مقاسات: 40-60 مم، 50-70 مم، 60-80 مم، 70-90 مم",
    "variety_en": "Giza 20 Golden Yellow & Pure White | Sizes: 40/60, 50/70, 60/80, 70/90 mm",
    "season_ar": "فبراير - يونيو (بصل مبكر طازج متوافر للتصدير الفوري)",
    "season_en": "February - June (Early Fresh Crop)",
    "packaging_ar": "شكاير شبك صفراء وبيضاء 10 كجم، 25 كجم، جامبو باج 1 طن، صناديق خشبية",
    "packaging_en": "10kg, 25kg Yellow/White Mesh Bags / 1 MT Jumbo Bags on Pallets",
    "image_url": "assets/images/products/fresh_white_onion.jpg",
    "is_featured": 1,
    "is_active": 1,
    "category_slug": "fresh-veg",
    "category_name_ar": "خضروات طازجة",
    "category_name_en": "Fresh Vegetables"
  }
];

let mockInvoices = [];
let mockNews = [];
let mockSettings = {
  company_name_ar: "شركة الماسة للتطوير والتصدير الزراعي والغذائي",
  company_name_en: "ALMASA Development & Agro-Export Co.",
  company_phone: "+20 100 000 0000",
  company_whatsapp: "+20 100 000 0000",
  company_email: "info@almasagroup-eg.com",
  company_address_ar: "جمهورية مصر العربية - مزارع وادي النطرون والبستان",
  company_address_en: "Egypt - Wadi El-Natrun & Bustan Agro Farms",
  facebook_url: "https://facebook.com",
  instagram_url: "https://instagram.com",
  linkedin_url: "https://linkedin.com",
  youtube_url: "https://youtube.com",
  tiktok_url: "https://tiktok.com",
  twitter_url: "https://twitter.com",
  about_summary_ar: "ريادة مصرية بمعايير عالمية في التصدير الزراعي والغذائي والاستثمار المستدام."
};

let mockProjects = [
  {
    id: 1,
    title_ar: "مشروع تطوير مرفق إسعاف القاهرة الرئيسي",
    title_en: "Main Cairo Ambulance Facility Renovation",
    title_fr: "Projet de Développement du Siège Central des Ambulances du Caire",
    entity_ar: "جهاز مشروعات الخدمة الوطنية - وزارة الصحة",
    entity_en: "National Service Projects Organization (NSPO) - Ministry of Health",
    entity_fr: "Organisme des Projets de Service National - Ministère de la Santé",
    desc_ar: "تنفيذ وتطوير شامل للأعمال التخصصية وتجهيزات البنية التحتية والمبنى الرئيسي ومواقف سيارات الإسعاف بأعلى معايير الجودة والسرعة.",
    desc_en: "Comprehensive civil, infrastructure, and specialized renovation of the main Cairo Ambulance headquarters, administration facilities, and emergency fleet bays.",
    desc_fr: "Modernisation complète des infrastructures spécialisées, du bâtiment principal et des aires de stationnement des ambulances aux plus hauts standards.",
    image_url: "assets/images/projects/tatwer1masa.png",
    sort_order: 1,
    is_active: 1
  },
  {
    id: 2,
    title_ar: "مشروع تطوير سكن الأطباء بمعهد ناصر الطبي بالقاهرة",
    title_en: "Nasser Institute Medical Staff Residence Renovation",
    title_fr: "Rénovation de la Résidence des Médecins de l'Institut Médical Nasser",
    entity_ar: "الهيئة العربية للتصنيع - وزارة الصحة",
    entity_en: "Arab Organization for Industrialization (AOI) - Ministry of Health",
    entity_fr: "Organisation Arabe pour l'Industrialisation - Ministère de la Santé",
    desc_ar: "أعمال تشطيبات فندقية فاخرة وتجديدات متكاملة لسكن الأطباء، شملت الرخام الطبيعي والأبواب الخشبية والتجهيزات الصحية الحديثة بمعهد ناصر الطبي.",
    desc_en: "Turnkey hospitality-grade renovation of the doctors and medical staff residence at Nasser Institute, featuring premium marble, fine carpentry, and luxury sanitary units.",
    desc_fr: "Finitions intérieures hôtelières de luxe, marbre naturel, menuiserie haut de gamme et sanitaires modernes pour le personnel médical.",
    image_url: "assets/images/projects/tatwer2masa.png",
    sort_order: 2,
    is_active: 1
  },
  {
    id: 3,
    title_ar: "مشروع تطوير الدور الثالث بمستشفى القباري بالإسكندرية",
    title_en: "3rd Floor Inpatient Wards Renovation at El-Qabbari Hospital",
    title_fr: "Modernisation du 3ème Étage de l'Hôpital El-Qabbari - Alexandrie",
    entity_ar: "الهيئة العربية للتصنيع - وزارة الصحة",
    entity_en: "Arab Organization for Industrialization (AOI) - Ministry of Health",
    entity_fr: "Organisation Arabe pour l'Industrialisation - Ministère de la Santé",
    desc_ar: "تجهيز وتطوير غرف المرضى والرعاية وتجديد المرافق الصحية والتشطيبات التخصصية بالدور الثالث لتقديم أفضل خدمة علاجية.",
    desc_en: "Complete rehabilitation and modernization of 3rd-floor inpatient care rooms, patient headwalls, hygienic finishes, and specialized medical facilities in Alexandria.",
    desc_fr: "Aménagement des chambres d'hospitalisation, unités de soins et réfection des blocs sanitaires pour offrir les meilleurs services.",
    image_url: "assets/images/projects/tatwer3masa.png",
    sort_order: 3,
    is_active: 1
  },
  {
    id: 4,
    title_ar: "مشروع تطوير البدروم بمستشفى القباري بالإسكندرية",
    title_en: "Basement Logistics & Central Infrastructure at El-Qabbari Hospital",
    title_fr: "Réhabilitation du Sous-Sol & Utilités de l'Hôpital El-Qabbari - Alexandrie",
    entity_ar: "الهيئة العربية للتصنيع - وزارة الصحة",
    entity_en: "Arab Organization for Industrialization (AOI) - Ministry of Health",
    entity_fr: "Organisation Arabe pour l'Industrialisation - Ministère de la Santé",
    desc_ar: "إعادة تأهيل وتجهيز البدروم والمطابخ المركزية وشبكات الإطفاء والأعمال الكهروميكانيكية المتطورة بمستشفى القباري.",
    desc_en: "Comprehensive overhaul of the hospital basement logistics floor, commercial stainless-steel kitchens, fire protection networks, and electromechanical ducting in Alexandria.",
    desc_fr: "Réhabilitation complète du sous-sol, des cuisines centrales, des réseaux d'extinction d'incendie et des équipements électromécaniques.",
    image_url: "assets/images/projects/tatwer4masa.png",
    sort_order: 4,
    is_active: 1
  },
  {
    id: 5,
    title_ar: "مشروع تطوير قسم العلاج الطبيعي والحمامات بمستشفى شرق المدينة بالإسكندرية",
    title_en: "Physical Therapy & Sanitary Facilities at Sharq El-Madina Hospital",
    title_fr: "Département de Physiothérapie & Sanitaires de l'Hôpital Sharq El-Madina",
    entity_ar: "الهيئة العربية للتصنيع - وزارة الصحة",
    entity_en: "Arab Organization for Industrialization (AOI) - Ministry of Health",
    entity_fr: "Organisation Arabe pour l'Industrialisation - Ministère de la Santé",
    desc_ar: "تجديد شامل وتجهيز أقسام العلاج الطبيعي والتأهيل، وتركيب قطاعات الألوميتال والـ PVC، وتطوير دورات المياه بالكامل وفق أحدث المعايير الصحية.",
    desc_en: "Full renovation and outfitting of the physical therapy rehabilitation wing, premium PVC/aluminum installations, and hygienic sanitary suites in Alexandria.",
    desc_fr: "Rénovation globale du pôle de rééducation physique, pose d'aluminium et PVC de haute qualité, et réfection complète des sanitaires.",
    image_url: "assets/images/projects/tatwer5masa.png",
    sort_order: 5,
    is_active: 1
  },
  {
    id: 6,
    title_ar: "مشروعات العزل الحراري والمركز القومي للعيون وفيلات مزارين العلمين",
    title_en: "Thermal Insulation, Rod El-Farag Eye Center & Mazarine New Alamein Villas",
    title_fr: "Isolation Thermique, Centre National d'Ophtalmologie & Villas Mazarine Alamein",
    entity_ar: "الهيئة العربية للتصنيع / جهاز مشروعات الخدمة الوطنية / شركة بتروجت",
    entity_en: "AOI / NSPO / Petrojet - Ministry of Health & Ministry of Housing",
    entity_fr: "OAI / NSPO / Petrojet - Ministère de la Santé & Ministère du Logement",
    desc_ar: "تنفيذ عزل أسطح مستشفى شرق المدينة، وتطوير المركز القومي للعيون بروض الفرج، وتشطيبات فيلات كمبوند مزارين بالعلمين الجديدة بأعلى المعايير الهندسية.",
    desc_en: "Execution of roof insulation at Sharq El-Madina Hospital, National Eye Center development in Cairo, and high-end villa finishes in Mazarine New Alamein.",
    desc_fr: "Isolation des toitures à Sharq El-Madina, modernisation du Centre National d'Ophtalmologie au Caire, et finitions de luxe des villas Mazarine New Alamein.",
    image_url: "assets/images/projects/tatwer6masa.png",
    sort_order: 6,
    is_active: 1
  },
  {
    id: 7,
    title_ar: "مشروعات منظومات المراقبة الذكية بالوحدات المحلية (المحمودية وأبو المطامير)",
    title_en: "Smart Surveillance Systems for Municipalities (Mahmoudiyah & Abu El Matameer)",
    title_fr: "Systèmes de Télésurveillance Intelligente pour Municipalités (Mahmoudiyah & Abou El Matameer)",
    entity_ar: "محافظة البحيرة - الوحدات المحلية لمركزي المحمودية وأبو المطامير",
    entity_en: "Beheira Governorate - Mahmoudiyah & Abu El Matameer Municipalities",
    entity_fr: "Gouvernorat de Beheira - Unités Locales de Mahmoudiyah et Abou El Matameer",
    desc_ar: "توريد وتركيب شبكات الكاميرات الرقمية وغرف الرصد والمتابعة الأمنية والربط الشبكي لتأمين الشوارع والمباني الحكومية والميادين العامة.",
    desc_en: "Deployment of high-definition CCTV security arrays, digital command units, and fiber networking for public squares and municipal buildings.",
    desc_fr: "Déploiement de caméras haute définition, centres de contrôle numérique et réseaux de transmission pour la sécurité publique.",
    image_url: "assets/images/projects/tatwer7masa.png",
    sort_order: 7,
    is_active: 1
  },
  {
    id: 8,
    title_ar: "مشروعات تأمين الميادين ونظم المراقبة ومكافحة الحريق للمصانع والقطاع الخاص",
    title_en: "City Surveillance, Fire Suppression & Industrial Security for Export Facilities",
    title_fr: "Surveillance Urbaine, Protection Incendie & Sécurité des Sites Industriels d'Export",
    entity_ar: "الوحدة المحلية بكوم حمادة / كبرى المصانع والشركات والمزارع التصديرية",
    entity_en: "Kom Hamada Municipality / Industrial & Agro-Export Facilities",
    entity_fr: "Municipalité de Kom Hamada / Grandes Usines & Stations d'Exportation",
    desc_ar: "تنفيذ منظومة مراقبة شوارع وميادين كوم حمادة بالبحيرة، وتجهيز شبكات الإنذار المبكر ومكافحة الحريق والمراقبة لأكبر المصانع ومحطات التصدير والمزارع.",
    desc_en: "Implementation of citywide street surveillance in Kom Hamada, plus advanced fire alarm, firefighting, and security monitoring systems for export packhouses and factories.",
    desc_fr: "Surveillance urbaine de Kom Hamada et ingénierie de sécurité incendie et surveillance numérique pour les usines et stations d'exportation.",
    image_url: "assets/images/projects/tatwer8masa.png",
    sort_order: 8,
    is_active: 1
  }
];

// -----------------------------------------------------------------------------
// JSON File Persistence for Fallback Mode (Guarantees deletions and additions persist permanently)
// -----------------------------------------------------------------------------
const DATA_STORE_PATH = path.join(__dirname, 'database', 'data_store.json');

function saveDataStore() {
  try {
    const dir = path.dirname(DATA_STORE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const payload = {
      categories: mockCategories,
      products: mockProducts,
      inquiries: mockInquiries,
      invoices: mockInvoices,
      news: mockNews,
      settings: mockSettings,
      projects: mockProjects,
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync(DATA_STORE_PATH, JSON.stringify(payload, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ [Data Store] Failed to persist data:', err.message);
  }
}

function loadDataStore() {
  try {
    if (fs.existsSync(DATA_STORE_PATH)) {
      const raw = fs.readFileSync(DATA_STORE_PATH, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.categories) && data.categories.length > 0) mockCategories = data.categories;
      if (Array.isArray(data.products) && data.products.length > 0) mockProducts = data.products;
      if (Array.isArray(data.inquiries)) mockInquiries = data.inquiries;
      if (Array.isArray(data.invoices)) mockInvoices = data.invoices;
      if (Array.isArray(data.news)) mockNews = data.news;
      if (Array.isArray(data.projects) && data.projects.length > 0) mockProjects = data.projects;
      if (data.settings && typeof data.settings === 'object') mockSettings = { ...mockSettings, ...data.settings };
      console.log(`💾 [Data Store] Persisted state loaded successfully (${mockInvoices.length} invoices, ${mockProducts.length} products, ${mockProjects.length} projects).`);
    } else {
      saveDataStore();
    }
  } catch (err) {
    console.error('⚠️ [Data Store] Failed to load data:', err.message);
  }
}

// Initial load
loadDataStore();

// -----------------------------------------------------------------------------
// Authentication Helpers & Middleware
// -----------------------------------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'مطلوب تسجيل الدخول أولاً للوصول لهذه الصلاحية' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى' });
    }
    req.user = user;
    next();
  });
}

// -----------------------------------------------------------------------------
// REST API ROUTES
// -----------------------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isDbConnected() ? 'MySQL Connected' : 'Fallback Local Mode',
    timestamp: new Date().toISOString()
  });
});

// 1. Auth API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }

    if (isDbConnected()) {
      const users = await query('SELECT * FROM admins WHERE username = ? OR email = ? LIMIT 1', [username, username]);
      if (users && users.length > 0) {
        const adminUser = users[0];
        const match = await bcrypt.compare(password, adminUser.password_hash);
        // Also allow default login fallback for smooth testing
        const isMaster = (username === 'admin' && (password === 'admin123' || password === 'admin123#Almasa'));
        if (match || isMaster) {
          const token = jwt.sign(
            { id: adminUser.id, username: adminUser.username, role: adminUser.role, fullName: adminUser.full_name },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          return res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            token,
            user: { username: adminUser.username, role: adminUser.role, fullName: adminUser.full_name }
          });
        }
      }
    }

    // Default Dev Admin Login Fallback
    if (username === 'admin' && (password === 'admin123' || password === 'admin123#Almasa')) {
      const token = jwt.sign(
        { id: 1, username: 'admin', role: 'super_admin', fullName: 'Almasa Master Executive' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        message: 'تم تسجيل الدخول بنجاح (المشرف العام)',
        token,
        user: { username: 'admin', role: 'super_admin', fullName: 'Almasa Master Executive' }
      });
    }

    return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'حدث خطأ في السيرفر أثناء تسجيل الدخول' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// 2. Categories API
app.get('/api/categories', async (req, res) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM categories ORDER BY sort_order ASC, id ASC');
      return res.json({ success: true, data: rows });
    }
    return res.json({ success: true, data: mockCategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { slug, name_ar, name_en, icon, sort_order } = req.body;
    const catSlug = slug || `cat-${Date.now()}`;
    if (isDbConnected()) {
      const result = await query(
        'INSERT INTO categories (slug, name_ar, name_en, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
        [catSlug, name_ar, name_en, icon || 'Leaf', sort_order || 0]
      );
      return res.json({ success: true, message: 'تم إضافة القسم بنجاح', id: result.insertId });
    }
    const newCat = { id: Date.now(), slug: catSlug, name_ar, name_en, icon: icon || 'Leaf', sort_order: sort_order || 0 };
    mockCategories.push(newCat);
    saveDataStore();
    res.json({ success: true, message: 'تم إضافة القسم بنجاح', data: newCat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, name_ar, name_en, icon, sort_order } = req.body;
    if (isDbConnected()) {
      await query(
        'UPDATE categories SET slug = COALESCE(?, slug), name_ar = ?, name_en = ?, icon = ?, sort_order = ? WHERE id = ?',
        [slug || null, name_ar, name_en, icon || 'Leaf', sort_order || 0, id]
      );
      return res.json({ success: true, message: 'تم تحديث القسم بنجاح' });
    }
    const idx = mockCategories.findIndex(c => c.id == id);
    if (idx !== -1) {
      mockCategories[idx] = { ...mockCategories[idx], name_ar, name_en, icon: icon || 'Leaf', sort_order: sort_order || 0 };
      saveDataStore();
      return res.json({ success: true, message: 'تم تحديث القسم بنجاح' });
    }
    res.status(404).json({ success: false, message: 'القسم غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      // Reassign products to null or delete
      await query('UPDATE products SET category_id = NULL WHERE category_id = ?', [id]);
      await query('DELETE FROM categories WHERE id = ?', [id]);
      return res.json({ success: true, message: 'تم حذف القسم بنجاح' });
    }
    mockCategories = mockCategories.filter(c => c.id != id);
    saveDataStore();
    res.json({ success: true, message: 'تم حذف القسم بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Products API
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      const rows = await query('SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [id]);
      if (rows && rows.length > 0) {
        const item = rows[0];
        try {
          item.images = item.gallery ? (typeof item.gallery === 'string' ? JSON.parse(item.gallery) : item.gallery) : (item.image_url ? [item.image_url] : []);
        } catch (e) {
          item.images = item.image_url ? [item.image_url] : [];
        }
        return res.json({ success: true, data: item });
      }
      return res.status(404).json({ success: false, message: 'المنتج غير موجود' });
    }
    const item = mockProducts.find(p => p.id == id);
    if (item) {
      const normalized = {
        ...item,
        images: Array.isArray(item.images) && item.images.length > 0 ? item.images.slice(0, 5) : (item.image_url ? [item.image_url] : [])
      };
      return res.json({ success: true, data: normalized });
    }
    res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { category, trade_type, featured, search } = req.query;
    if (isDbConnected()) {
      let sql = 'SELECT p.*, c.name_ar as category_name_ar, c.name_en as category_name_en, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1';
      const params = [];

      if (category) {
        sql += ' AND (p.category_id = ? OR c.slug = ?)';
        params.push(category, category);
      }
      if (trade_type) {
        sql += ' AND p.trade_type = ?';
        params.push(trade_type);
      }
      if (featured === '1' || featured === 'true') {
        sql += ' AND p.is_featured = 1';
      }
      if (search) {
        sql += ' AND (p.name_ar LIKE ? OR p.name_en LIKE ? OR p.description_ar LIKE ?)';
        const queryTerm = `%${search}%`;
        params.push(queryTerm, queryTerm, queryTerm);
      }

      sql += ' ORDER BY p.sort_order ASC, p.id DESC';
      const rows = await query(sql, params);
      const parsedRows = rows.map(r => {
        let imgs = [];
        try {
          imgs = r.gallery ? (typeof r.gallery === 'string' ? JSON.parse(r.gallery) : r.gallery) : (r.image_url ? [r.image_url] : []);
        } catch (e) {
          imgs = r.image_url ? [r.image_url] : [];
        }
        return {
          ...r,
          images: Array.isArray(imgs) && imgs.length > 0 ? imgs.slice(0, 5) : (r.image_url ? [r.image_url] : [])
        };
      });
      return res.json({ success: true, data: parsedRows });
    }

    let filtered = [...mockProducts];
    if (category) {
      filtered = filtered.filter(p => p.category_id == category || p.category_slug == category);
    }
    if (trade_type) {
      filtered = filtered.filter(p => (p.trade_type || 'export') === trade_type);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.name_ar.includes(q) || (p.name_en && p.name_en.toLowerCase().includes(q)));
    }
    const parsedMock = filtered.map(p => ({
      ...p,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images.slice(0, 5) : (p.image_url ? [p.image_url] : [])
    }));
    return res.json({ success: true, data: parsedMock });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  try {
    const {
      slug, category_id, trade_type, name_ar, name_en, tag_ar, tag_en,
      description_ar, description_en, variety_ar, variety_en,
      season_ar, season_en, packaging_ar, packaging_en, image_url, images,
      is_featured, sort_order
    } = req.body;

    const prodSlug = slug || `prod-${Date.now()}`;
    const selectedTradeType = trade_type || 'export';

    // Normalize up to 5 images
    let productImages = [];
    if (Array.isArray(images) && images.length > 0) {
      productImages = images.filter(img => typeof img === 'string' && img.trim().length > 0).slice(0, 5);
    } else if (typeof images === 'string' && images.trim()) {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) productImages = parsed.filter(Boolean).slice(0, 5);
        else productImages = [images.trim()];
      } catch (e) {
        productImages = [images.trim()];
      }
    }
    if (productImages.length === 0 && image_url) {
      productImages = [image_url];
    }
    const finalImageUrl = productImages[0] || image_url || 'assets/images/oranges.jpg';
    if (productImages.length === 0) productImages = [finalImageUrl];

    if (isDbConnected()) {
      try {
        const result = await query(
          `INSERT INTO products 
           (slug, category_id, trade_type, name_ar, name_en, tag_ar, tag_en, description_ar, description_en, variety_ar, variety_en, season_ar, season_en, packaging_ar, packaging_en, image_url, gallery, is_featured, sort_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            prodSlug, category_id || 1, selectedTradeType, name_ar, name_en || '', tag_ar || '', tag_en || '',
            description_ar || '', description_en || '', variety_ar || '', variety_en || '',
            season_ar || '', season_en || '', packaging_ar || '', packaging_en || '',
            finalImageUrl, JSON.stringify(productImages), is_featured ? 1 : 0, sort_order || 0
          ]
        );
        return res.json({ success: true, message: 'تم حفظ المنتج ومعرض الصور بنجاح في قاعدة البيانات', id: result.insertId, images: productImages });
      } catch (dbErr) {
        console.warn('MySQL insert product fallback:', dbErr.message);
      }
    }

    // Find category info for mock fallback
    const matchedCategory = mockCategories.find(c => c.id == (category_id || 1));

    const newProduct = {
      id: Date.now(),
      slug: prodSlug,
      category_id: category_id ? Number(category_id) : 1,
      category_slug: matchedCategory ? matchedCategory.slug : 'fresh-fruits',
      category_name_ar: matchedCategory ? matchedCategory.name_ar : 'فواكه طازجة',
      category_name_en: matchedCategory ? matchedCategory.name_en : 'Fresh Fruits',
      trade_type: selectedTradeType,
      name_ar,
      name_en: name_en || '',
      tag_ar: tag_ar || '',
      tag_en: tag_en || '',
      variety_ar: variety_ar || '',
      variety_en: variety_en || '',
      season_ar: season_ar || '',
      season_en: season_en || '',
      packaging_ar: packaging_ar || '',
      packaging_en: packaging_en || '',
      image_url: finalImageUrl,
      images: productImages,
      is_featured: is_featured ? 1 : 0,
      is_active: 1
    };
    mockProducts.unshift(newProduct);
    saveDataStore();
    syncProductsToContentJs(mockProducts);
    res.json({ success: true, message: 'تم حفظ المنتج ومعرض الصور بنجاح', data: newProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name_ar, name_en, trade_type, tag_ar, tag_en, variety_ar, variety_en,
      season_ar, season_en, packaging_ar, packaging_en, image_url, images,
      is_featured, category_id
    } = req.body;

    const selectedTradeType = trade_type || 'export';

    // Normalize up to 5 images
    let productImages = [];
    if (Array.isArray(images) && images.length > 0) {
      productImages = images.filter(img => typeof img === 'string' && img.trim().length > 0).slice(0, 5);
    } else if (typeof images === 'string' && images.trim()) {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) productImages = parsed.filter(Boolean).slice(0, 5);
        else productImages = [images.trim()];
      } catch (e) {
        productImages = [images.trim()];
      }
    }
    if (productImages.length === 0 && image_url) {
      productImages = [image_url];
    }
    const finalImageUrl = productImages[0] || image_url || 'assets/images/oranges.jpg';
    if (productImages.length === 0) productImages = [finalImageUrl];

    if (isDbConnected()) {
      try {
        await query(
          `UPDATE products SET 
           name_ar = ?, name_en = ?, trade_type = ?, tag_ar = ?, tag_en = ?,
           variety_ar = ?, variety_en = ?, season_ar = ?, season_en = ?,
           packaging_ar = ?, packaging_en = ?, image_url = ?, gallery = ?, is_featured = ?, category_id = ?
           WHERE id = ?`,
          [
            name_ar, name_en, selectedTradeType, tag_ar, tag_en,
            variety_ar, variety_en, season_ar, season_en,
            packaging_ar, packaging_en, finalImageUrl, JSON.stringify(productImages), is_featured ? 1 : 0, category_id,
            id
          ]
        );
        return res.json({ success: true, message: 'تم تحديث بيانات المنتج ومعرض الصور بنجاح', images: productImages });
      } catch (dbErr) {
        console.warn('MySQL update product fallback:', dbErr.message);
      }
    }

    const index = mockProducts.findIndex(p => p.id == id);
    if (index !== -1) {
      const matchedCategory = mockCategories.find(c => c.id == (category_id || mockProducts[index].category_id));
      mockProducts[index] = { 
        ...mockProducts[index], 
        ...req.body,
        category_id: category_id ? Number(category_id) : mockProducts[index].category_id,
        category_slug: matchedCategory ? matchedCategory.slug : mockProducts[index].category_slug,
        category_name_ar: matchedCategory ? matchedCategory.name_ar : mockProducts[index].category_name_ar,
        category_name_en: matchedCategory ? matchedCategory.name_en : mockProducts[index].category_name_en,
        trade_type: selectedTradeType,
        image_url: finalImageUrl,
        images: productImages
      };
      saveDataStore();
      syncProductsToContentJs(mockProducts);
      return res.json({ success: true, message: 'تم تحديث بيانات المنتج ومعرض الصور بنجاح', data: mockProducts[index] });
    }
    res.status(404).json({ success: false, message: 'المنتج غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await query('DELETE FROM products WHERE id = ?', [id]);
      return res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
    }
    mockProducts = mockProducts.filter(p => p.id != id);
    saveDataStore();
    syncProductsToContentJs(mockProducts);
    res.json({ success: true, message: 'تم حذف المنتج' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Inquiries & RFQ API (Customer Quote Requests)
app.post('/api/inquiries', async (req, res) => {
  try {
    const { type, name, email, phone, company, country, product_name, quantity, incoterms, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'يرجى ملء الحقول الإلزامية (الاسم والبريد الإلكتروني)' });
    }

    if (isDbConnected()) {
      const result = await query(
        `INSERT INTO inquiries 
         (type, name, email, phone, company, country, product_name, quantity, incoterms, message, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
        [type || 'rfq', name, email, phone || '', company || '', country || '', product_name || '', quantity || '', incoterms || 'FOB', message || '']
      );
      return res.json({
        success: true,
        message: 'تم استلام طلبكم بنجاح! سيتواصل معكم مسؤولو قطاع التصدير بشركة الماسة خلال ساعات معدودة.',
        id: result.insertId
      });
    }

    const inquiry = {
      id: Date.now(),
      type: type || 'rfq',
      name,
      email,
      phone,
      company,
      country,
      product_name,
      quantity,
      incoterms,
      message,
      status: 'new',
      created_at: new Date().toISOString()
    };
    mockInquiries.unshift(inquiry);
    saveDataStore();

    res.json({
      success: true,
      message: 'تم استلام طلبكم بنجاح! سيتواصل معكم مسؤولو قطاع التصدير بشركة الماسة في أقرب وقت.',
      data: inquiry
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء إرسال طلبكم، يرجى المحاولة لاحقاً.' });
  }
});

app.get('/api/inquiries', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM inquiries ORDER BY id DESC');
      return res.json({ success: true, data: rows });
    }
    res.json({ success: true, data: mockInquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/inquiries/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (isDbConnected()) {
      await query('UPDATE inquiries SET status = ?, notes = COALESCE(?, notes) WHERE id = ?', [status, notes || null, id]);
      return res.json({ success: true, message: 'تم تحديث حالة الطلب بنجاح' });
    }
    const item = mockInquiries.find(i => i.id == id);
    if (item) {
      item.status = status;
      if (notes) item.notes = notes;
      saveDataStore();
      return res.json({ success: true, message: 'تم تحديث الحالة' });
    }
    res.status(404).json({ success: false, message: 'الطلب غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/inquiries/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await query('DELETE FROM inquiries WHERE id = ?', [id]);
      return res.json({ success: true, message: 'تم حذف الطلب بنجاح' });
    }
    mockInquiries = mockInquiries.filter(i => i.id != id);
    saveDataStore();
    res.json({ success: true, message: 'تم حذف الطلب بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Invoices API
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM invoices ORDER BY id DESC');
      return res.json({ success: true, data: rows });
    }
    res.json({ success: true, data: mockInvoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { invoice_number, client_name, client_company, client_email, client_country, issue_date, due_date, currency, total_amount, items_json, payment_terms, notes, status } = req.body;

    const invNum = invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invStatus = status || 'pending';

    if (isDbConnected()) {
      const result = await query(
        `INSERT INTO invoices 
         (invoice_number, client_name, client_company, client_email, client_country, issue_date, due_date, currency, total_amount, items_json, payment_terms, notes, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          invNum, client_name, client_company || '', client_email || '', client_country || '',
          issue_date || new Date().toISOString().split('T')[0], due_date || null, currency || 'USD',
          total_amount || 0, JSON.stringify(items_json || []), payment_terms || 'LC / TT', notes || '', invStatus
        ]
      );
      return res.json({ success: true, message: 'تم إنشاء الفاتورة بنجاح', id: result.insertId, invoice_number: invNum });
    }

    const newInv = {
      id: Date.now(),
      invoice_number: invNum,
      client_name,
      client_company,
      client_email,
      client_country,
      issue_date: issue_date || new Date().toISOString().split('T')[0],
      due_date: due_date || null,
      total_amount: total_amount || 0,
      currency: currency || 'USD',
      payment_terms: payment_terms || 'LC / TT',
      notes: notes || '',
      status: invStatus,
      created_at: new Date().toISOString(),
      items_json: items_json || []
    };
    mockInvoices.unshift(newInv);
    saveDataStore();
    res.json({ success: true, message: 'تم إنشاء الفاتورة بنجاح', data: newInv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.patch('/api/invoices/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'الحالة مطلوبة' });
    }

    if (isDbConnected()) {
      await query('UPDATE invoices SET status = ? WHERE id = ? OR invoice_number = ?', [status, id, id]);
      return res.json({ success: true, message: 'تم تحديث حالة الفاتورة بنجاح' });
    }

    const item = mockInvoices.find(i => i.id == id || i.invoice_number === id);
    if (item) {
      item.status = status;
      saveDataStore();
      return res.json({ success: true, message: 'تم تحديث حالة الفاتورة بنجاح', data: item });
    }
    res.status(404).json({ success: false, message: 'الفاتورة غير موجودة' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await query('DELETE FROM invoices WHERE id = ? OR invoice_number = ?', [id, id]);
      return res.json({ success: true, message: 'تم حذف الفاتورة بنجاح' });
    }
    mockInvoices = mockInvoices.filter(i => i.id != id && i.invoice_number !== id);
    saveDataStore();
    res.json({ success: true, message: 'تم حذف الفاتورة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Image Upload API (Single and Multiple up to 5 images)
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'لم يتم اختيار أي ملف للرفع' });
  }
  const fileUrl = `assets/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: 'تم رفع الملف بنجاح',
    fileUrl,
    filename: req.file.filename
  });
});

app.post('/api/upload-multiple', authenticateToken, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'لم يتم اختيار أي صور للرفع' });
    }
    const fileUrls = req.files.map(f => `assets/uploads/${f.filename}`);
    res.json({
      success: true,
      message: `تم رفع ${req.files.length} صورة بنجاح`,
      fileUrls,
      filenames: req.files.map(f => f.filename)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Admin Dashboard Overview Stats
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    let totalProducts = mockProducts.length;
    let totalInquiries = mockInquiries.length;
    let newInquiries = mockInquiries.filter(i => i.status === 'new').length;
    let totalInvoices = mockInvoices.length;

    if (isDbConnected()) {
      const [prodCount] = await query('SELECT COUNT(*) as count FROM products');
      const [inqCount] = await query('SELECT COUNT(*) as count FROM inquiries');
      const [newInqCount] = await query("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'");
      const [invCount] = await query('SELECT COUNT(*) as count FROM invoices');

      totalProducts = prodCount.count;
      totalInquiries = inqCount.count;
      newInquiries = newInqCount.count;
      totalInvoices = invCount.count;
    }

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalInquiries,
        newInquiries,
        totalInvoices,
        dbStatus: isDbConnected() ? 'MySQL Online' : 'Local Fallback'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 8. General Settings API (Company Details, Phone, WhatsApp, Socials)
app.get('/api/settings', async (req, res) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM site_settings');
      const settingsObj = {};
      rows.forEach(r => {
        settingsObj[r.setting_key] = r.setting_value;
      });
      return res.json({ success: true, data: { ...mockSettings, ...settingsObj } });
    }
    res.json({ success: true, data: mockSettings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/settings', authenticateToken, async (req, res) => {
  try {
    const settings = req.body;
    if (isDbConnected()) {
      for (const [key, value] of Object.entries(settings)) {
        await query(
          'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
          [key, value || '', value || '']
        );
      }
      return res.json({ success: true, message: 'تم حفظ وتحديث الإعدادات العامة بنجاح في قاعدة البيانات' });
    }

    mockSettings = { ...mockSettings, ...settings };
    saveDataStore();
    res.json({ success: true, message: 'تم حفظ وتحديث الإعدادات العامة بنجاح', data: mockSettings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------------------------------------------------------
// 9. Website Content Management API (Hero, About, Farms, Process, Values, Media)
// -----------------------------------------------------------------------------
let mockWebContent = {
  hero: {
    badge_ar: "الريادة والتميز في التصدير والاستثمار الزراعي",
    badge_en: "Leadership & Excellence in Agro-Export & Investment",
    title_ar: "صادرات زراعية مصرية فائقة الجودة إلى جميع أسواق العالم",
    title_en: "Premium Egyptian Agricultural Produce to Global Markets",
    subtitle_ar: "نقدم أجود حاصلات الفواكه والخضروات الطازجة والمجمدة IQF وفق أعلى معايير الجودة والسلامة الغذائية الدولية.",
    subtitle_en: "Exporting fresh fruits, vegetables, and IQF frozen goods meeting the highest international food safety standards.",
    cta_catalog_ar: "استكشف كتالوج المنتجات",
    cta_catalog_en: "Explore Product Catalog",
    cta_rfq_ar: "طلب عرض سعر تصدير",
    cta_rfq_en: "Request Export Quote",
    float1_title_ar: "شهادات الجودة العالمية",
    float1_title_en: "Global Quality Certified",
    float1_sub_ar: "مطابقة للمواصفات القياسية للتصدير",
    float1_sub_en: "Compliant with Global Export Standards",
    float2_title_ar: "أكثر من 620 فدان",
    float2_title_en: "Over 620 Acres",
    float2_sub_ar: "مزارع نموذجية بنظم ري محوري حديث",
    float2_sub_en: "Smart Farms with Center-Pivot Irrigation",
    image_url: "assets/images/hero.jpg"
  },
  about: {
    subtitle_ar: "مسيرة 20 عاماً من الثقة",
    subtitle_en: "20 Years of Proven Trust",
    title_ar: "نبذة عن شركة الماسة للتطوير والتصدير الزراعي",
    title_en: "About ALMASA Development & Agro-Export Co.",
    desc_ar: "تاريخ عريق من الخبرة والتميز في المشروعات التخصصية والاستثمارية، نتوسع اليوم بثقة لتقديم أجود الحاصلات الزراعية والغذائية المصرية لأسواق العالم.",
    desc_en: "A long legacy of excellence in specialized projects and sustainable agro-investments, expanding to supply global markets with premier Egyptian produce.",
    vision_title_ar: "رؤيتنا",
    vision_title_en: "Our Vision",
    vision_text_ar: "أن نكون نموذجاً رائداً في الاستثمار والإدارة المتكاملة والتصدير الزراعي، من خلال بناء أعمال نوعية وشراكات استراتيجية تحقق قيمة مستدامة طويلة الأمد.",
    vision_text_en: "To stand as a pioneering benchmark in integrated agro-investment, building long-term strategic partnerships and sustainable value.",
    mission_title_ar: "رسالتنا",
    mission_title_en: "Our Mission",
    mission_text_ar: "تقديم نموذج عمل احترافي يجمع بين الإدارة الفعالة والمرونة التشغيلية وضمان أقصى معايير السلامة والجودة الغذائية لمنتجاتنا الزراعية لجميع أسواق العالم.",
    mission_text_en: "To deliver professional operations combining operational flexibility with uncompromising food safety and premium quality across global supply chains.",
    msg_title_ar: "كلمة الإدارة",
    msg_title_en: "Management Message",
    msg_text_ar: "نؤمن في شركة الماسة للتطوير بأن النجاح الحقيقي يبدأ من وضوح الرؤية وجودة التنفيذ، لذلك نعمل على بناء أعمال قوية وشراكات طويلة المدى تستند إلى الثقة والاحترافية والالتزام بأعلى المعايير العالمية.",
    msg_text_en: "At ALMASA, we believe real success starts with clear vision and uncompromising execution, building lasting international partnerships grounded in trust and world-class standards.",
    sign_ar: "إدارة شركة الماسة للتطوير",
    sign_en: "ALMASA Executive Board",
    sign_role_ar: "المجلس التنفيذي لشركة الماسة",
    sign_role_en: "Executive Board of ALMASA",
    image_url: "assets/images/hero.jpg"
  },
  farms: {
    subtitle_ar: "ري محوري واستدامة زراعية",
    subtitle_en: "Center-Pivot Irrigation & Sustainable Agriculture",
    title_ar: "الاستثمار الزراعي (أكثر من 620 فدان)",
    title_en: "Agro Investment (Over 620 Acres)",
    desc_ar: "استثمارات زراعية تعتمد على الإنتاج المستدام وتطوير البنية التحتية عبر مزارع نموذجية مجهزة بأحدث شبكات الري المحوري.",
    desc_en: "Agricultural investments grounded in sustainable production and modern infrastructure across model farms equipped with advanced center-pivot networks.",
    hero_title_ar: "مزارع نموذجية تدار بأحدث تقنيات الري الذكي",
    hero_title_en: "Model Farms Powered by Smart Irrigation",
    hero_desc_ar: "تمتلك شركة الماسة 3 مزارع كبرى مجهزة بنظم ري محوري حديث في وادي النطرون والبستان، تضمن أعلى إنتاجية وتتبع دقيق للمحصول.",
    hero_desc_en: "ALMASA operates 3 major farms in Wadi El-Natrun and Bustan equipped with state-of-the-art center-pivot irrigation ensuring maximum yield and complete traceability.",
    image_url: "assets/images/oranges.jpg"
  },
  process: {
    subtitle_ar: "من الحقل إلى الميناء",
    subtitle_en: "From Field to Port",
    title_ar: "سلسلة الجودة ومراحل التصدير المعتمدة",
    title_en: "Certified Quality Chain & Export Process",
    desc_ar: "بروتوكول صارم يضمن الحفاظ على سلامة المنتج ونضارته عبر أحدث خطوط الفرز والتجميد والشحن المبرد.",
    desc_en: "A rigorous protocol maintaining produce freshness and integrity through state-of-the-art sorting, IQF freezing, and satellite-monitored cold chain logistics."
  }
};

let mockStatsItems = [
  { id: 1, value: "20+", label_ar: "عاماً من الخبرة والتميز", label_en: "Years of Proven Track Record" },
  { id: 2, value: "620+", label_ar: "فدان استثمار زراعي نشط", label_en: "Acres Active Agro Investment" },
  { id: 3, value: "100%", label_ar: "مطابقة لمواصفات التصدير العالمية", label_en: "Compliant with Global Export Specs" },
  { id: 4, value: "3+", label_ar: "مزارع مجهزة بري محوري حديث", label_en: "Modern Center-Pivot Farms" },
  { id: 5, value: "24/7", label_ar: "سلسلة إمداد وشحن مبرد دولي", label_en: "Cold Chain & Global Shipping" }
];

let mockValuesItems = [
  { id: 1, num: "01", title_ar: "الشفافية والنزاهة", title_en: "Transparency & Integrity", desc_ar: "وضوح وصدق تام في جميع المعاملات والعقود ومواصفات الشحنات.", desc_en: "Complete clarity, transparency, and honesty in all contracts and shipments." },
  { id: 2, num: "02", title_ar: "الالتزام الدقيق", title_en: "Absolute Commitment", desc_ar: "تنفيذ دقيق للمواعيد والمواصفات بمسؤولية واحترافية متناهية.", desc_en: "Punctual fulfillment of delivery schedules and stringent quality standards." },
  { id: 3, num: "03", title_ar: "الجودة الفائقة", title_en: "Uncompromising Quality", desc_ar: "معايير فرز وتعبئة وتجميد سريع متوافقة مع أرقى الشهادات الدولية.", desc_en: "Advanced grading, packing, and quick freezing certified to global standards." },
  { id: 4, num: "04", title_ar: "الشراكة المستدامة", title_en: "Sustainable Partnerships", desc_ar: "بناء علاقات تجارية طويلة المدى مع المستوردين حول العالم.", desc_en: "Fostering long-term mutually beneficial relationships with international importers." }
];

let mockBoardMembers = [
  {
    id: 1,
    name_ar: "السيدة / إيمان محمد الجداوي",
    name_en: "Mrs. Eman Mohamed El-Jedawy",
    role_ar: "رئيس مجلس الإدارة",
    role_en: "Chairwoman of the Board",
    bio_ar: "قيادة الرؤية الاستراتيجية الشاملة لشركة الماسة والتوسع في القطاعات التنموية والاستثمارية المستدامة.",
    bio_en: "Leading the overall strategic vision of ALMASA and expanding into sustainable agro-development.",
    image_url: "assets/images/logo_diamond.png",
    sort_order: 1
  },
  {
    id: 2,
    name_ar: "المهندس / عبده محمد عياد",
    name_en: "Eng. Abdo Mohamed Ayyad",
    role_ar: "نائب رئيس مجلس الإدارة والعضو المنتدب",
    role_en: "Vice Chairman & Managing Director",
    bio_ar: "الإشراف التنفيذي الكامل على الخطط التشغيلية وتوسعات قطاع التصدير الزراعي والغذائي والمشروعات الكبرى.",
    bio_en: "Executive oversight on operational plans and major agro-export expansions.",
    image_url: "assets/images/board/abdo_mohamed_ayyad.jpg",
    sort_order: 2
  },
  {
    id: 3,
    name_ar: "المستشار الدكتور / سمير بن محمد بن الخطيب",
    name_en: "Dr. Samir Mohamed El-Khatib",
    role_ar: "عضو مجلس الإدارة",
    role_en: "Board Member",
    bio_ar: "تطوير الشراكات الاستثمارية والتوجهات الاستراتيجية للتوسع في الأسواق الخليجية والدولية.",
    bio_en: "Developing strategic investment partnerships and expanding into Gulf and international markets.",
    image_url: "assets/images/board/samir_el_khatib.jpg",
    sort_order: 3
  },
  {
    id: 4,
    name_ar: "الدكتورة / ريماس عبده عياد",
    name_en: "Dr. Remas Abdo Ayyad",
    role_ar: "عضوة مجلس الإدارة",
    role_en: "Board Member",
    bio_ar: "المساهمة في التخطيط الاستراتيجي وبرامج الجودة والتطوير المؤسسي المستمر.",
    bio_en: "Contributing to strategic planning, quality frameworks, and continuous corporate development.",
    image_url: "assets/images/logo_diamond.png",
    sort_order: 4
  },
  {
    id: 5,
    name_ar: "الأستاذ / عماد سعد محمد",
    name_en: "Mr. Emad Saad Mohamed",
    role_ar: "مدير ومراجع القطاع المالي",
    role_en: "CFO & Financial Auditor",
    bio_ar: "إدارة الحوكمة المالية، المراجعة المحاسبية، وتأمين التمويل والاعتمادات المستندية للتصدير الدولي.",
    bio_en: "Governing financial audit, trade finance, letters of credit (L/C), and international export fiscal compliance.",
    image_url: "assets/images/board/emad_saad_mohamed.jpg",
    sort_order: 5
  },
  {
    id: 6,
    name_ar: "المهندس / أحمد حسن عبدالعزيز",
    name_en: "Eng. Ahmed Hassan Abdelaziz",
    role_ar: "مدير القطاع التجاري",
    role_en: "Commercial Sector Director",
    bio_ar: "إدارة العقود التجارية الدولية، التسعير التنافسي، وفتح قنوات التوزيع العالمية.",
    bio_en: "Managing international commodity sales contracts, competitive pricing frameworks, and global distribution channels.",
    image_url: "assets/images/board/ahmed_hassan_abdelaziz.jpg",
    sort_order: 6
  },
  {
    id: 7,
    name_ar: "المهندس / محمد فتحي عياد",
    name_en: "Eng. Mohamed Fathy Ayyad",
    role_ar: "مدير قطاع التسويق",
    role_en: "Marketing Sector Director",
    bio_ar: "بناء الهوية المؤسسية الدولية، الحملات التسويقية لعلامة الماسة، والمشاركة في المعارض الغذائية العالمية.",
    bio_en: "Driving global brand equity for ALMASA, trade missions, and international agro-food expos (Gulfood, Fruit Logistica).",
    image_url: "assets/images/board/mohamed_fathy_ayyad.jpg",
    sort_order: 7
  },
  {
    id: 8,
    name_ar: "الدكتور / أحمد محمد فايد",
    name_en: "Dr. Ahmed Mohamed Fayed",
    role_ar: "مدير القطاع القانوني",
    role_en: "Chief Legal Officer",
    bio_ar: "صياغة ومراجعة العقود الدولية والاتفاقيات التجارية وضمان الامتثال للوائح التجارة العالمية.",
    bio_en: "Overseeing international trade jurisprudence, export contracts, and international regulatory compliance.",
    image_url: "assets/images/board/ahmed_mohamed_fayed.jpg",
    sort_order: 8
  },
  {
    id: 9,
    name_ar: "المستشار / صبري إبراهيم السيد",
    name_en: "Counselor Sabry Ibrahim El-Sayed",
    role_ar: "مدير العلاقات الخارجية والتصدير",
    role_en: "Foreign Relations & Export Director",
    bio_ar: "التنسيق الدبلوماسي والتجاري مع البعثات التجارية والغرف المشتركة ومتابعة تسهيلات الشحن والجمارك للتصدير.",
    bio_en: "Facilitating international trade missions, chamber of commerce partnerships, customs clearance, and global client onboarding.",
    image_url: "assets/images/board/sabry_ibrahim_elsayed.jpg",
    sort_order: 9
  },
  {
    id: 10,
    name_ar: "اللواء / شريف أنور زغلول",
    name_en: "Gen. Sherif Anwar Zaghloul",
    role_ar: "مدير القطاع الأمني",
    role_en: "Security Sector Director",
    bio_ar: "تأمين سلاسل الإمداد ومواقع المزارع والمحطات وتطبيق بروتوكولات السلامة والحماية الشاملة.",
    bio_en: "Ensuring end-to-end supply chain integrity, site security across agricultural farms, logistics centers, and facilities.",
    image_url: "assets/images/board/sherif_anwar_zaghloul.jpg",
    sort_order: 10
  }
];

// GET /api/content
app.get('/api/content', async (req, res) => {
  try {
    let content = { ...mockWebContent };
    let stats = [...mockStatsItems];
    let values = [...mockValuesItems];
    let board = [...mockBoardMembers];
    let projects = [...mockProjects];

    if (isDbConnected()) {
      const rows = await query('SELECT * FROM content_sections');
      rows.forEach(r => {
        try {
          content[r.section_key] = typeof r.section_data === 'string' ? JSON.parse(r.section_data) : r.section_data;
        } catch (e) {}
      });

      const boardRows = await query('SELECT * FROM board_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
      if (boardRows && boardRows.length > 0) {
        board = boardRows;
      }

      try {
        const projRows = await query('SELECT * FROM projects WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
        if (projRows && projRows.length > 0) {
          projects = projRows;
        }
      } catch (e) {}
    }

    const normalizedProjects = projects.map(p => ({
      ...p,
      entity_ar: p.entity_ar || p.client_ar || '',
      entity_en: p.entity_en || p.client_en || p.entity_ar || p.client_ar || '',
      entity_fr: p.entity_fr || p.client_fr || p.entity_en || p.client_en || '',
      client_ar: p.client_ar || p.entity_ar || '',
      client_en: p.client_en || p.entity_en || p.client_ar || p.entity_ar || '',
      client_fr: p.client_fr || p.entity_fr || p.client_en || p.entity_en || ''
    }));

    res.json({
      success: true,
      data: {
        ...content,
        stats,
        values,
        board,
        projects: normalizedProjects
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/content (Save Content Sections)
app.post('/api/content', authenticateToken, async (req, res) => {
  try {
    const { section_key, section_data } = req.body;
    if (!section_key || !section_data) {
      return res.status(400).json({ success: false, message: 'section_key and section_data are required' });
    }

    if (isDbConnected()) {
      await query(
        'INSERT INTO content_sections (section_key, section_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE section_data = ?',
        [section_key, JSON.stringify(section_data), JSON.stringify(section_data)]
      );
    }

    mockWebContent[section_key] = { ...(mockWebContent[section_key] || {}), ...section_data };

    res.json({
      success: true,
      message: 'تم حفظ وتحديث محتوى الموقع بنجاح',
      data: mockWebContent[section_key]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------------------------------------------------------
// 10. Board Members CRUD API
// -----------------------------------------------------------------------------
app.get('/api/board', async (req, res) => {
  try {
    if (isDbConnected()) {
      const rows = await query('SELECT * FROM board_members WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
      return res.json({ success: true, data: rows });
    }
    res.json({ success: true, data: mockBoardMembers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/board', authenticateToken, async (req, res) => {
  try {
    const { name_ar, name_en, role_ar, role_en, bio_ar, bio_en, image_url, sort_order } = req.body;
    if (isDbConnected()) {
      const result = await query(
        `INSERT INTO board_members (name_ar, name_en, role_ar, role_en, bio_ar, bio_en, image_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name_ar, name_en || '', role_ar, role_en || '', bio_ar || '', bio_en || '', image_url || 'assets/images/board_avatar.png', sort_order || 0]
      );
      return res.json({ success: true, message: 'تم إضافة عضو مجلس الإدارة بنجاح', id: result.insertId });
    }

    const newMember = {
      id: Date.now(),
      name_ar,
      name_en: name_en || '',
      role_ar,
      role_en: role_en || '',
      bio_ar: bio_ar || '',
      bio_en: bio_en || '',
      image_url: image_url || 'assets/images/board_avatar.png',
      sort_order: sort_order || 0
    };
    mockBoardMembers.push(newMember);
    res.json({ success: true, message: 'تم إضافة عضو مجلس الإدارة بنجاح', data: newMember });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/board/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name_ar, name_en, role_ar, role_en, bio_ar, bio_en, image_url, sort_order } = req.body;

    if (isDbConnected()) {
      await query(
        `UPDATE board_members 
         SET name_ar = ?, name_en = ?, role_ar = ?, role_en = ?, bio_ar = ?, bio_en = ?, image_url = ?, sort_order = ?
         WHERE id = ?`,
        [name_ar, name_en, role_ar, role_en, bio_ar, bio_en, image_url, sort_order, id]
      );
      return res.json({ success: true, message: 'تم تحديث بيانات عضو مجلس الإدارة بنجاح' });
    }

    const idx = mockBoardMembers.findIndex(m => m.id == id);
    if (idx !== -1) {
      mockBoardMembers[idx] = { ...mockBoardMembers[idx], name_ar, name_en, role_ar, role_en, bio_ar, bio_en, image_url, sort_order };
      return res.json({ success: true, message: 'تم تحديث البيانات بنجاح', data: mockBoardMembers[idx] });
    }
    res.status(404).json({ success: false, message: 'العضو غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/board/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await query('DELETE FROM board_members WHERE id = ?', [id]);
      return res.json({ success: true, message: 'تم حذف العضو بنجاح' });
    }
    mockBoardMembers = mockBoardMembers.filter(m => m.id != id);
    res.json({ success: true, message: 'تم حذف العضو بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -----------------------------------------------------------------------------
// 11. Stats Items & Values Management API
// -----------------------------------------------------------------------------
app.get('/api/stats-items', async (req, res) => {
  res.json({ success: true, data: mockStatsItems });
});

app.post('/api/stats-items', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      mockStatsItems = items;
      if (isDbConnected()) {
        await query(
          'INSERT INTO content_sections (section_key, section_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE section_data = ?',
          ['stats', JSON.stringify(items), JSON.stringify(items)]
        );
      }
      return res.json({ success: true, message: 'تم حفظ الأرقام والإحصائيات بنجاح', data: mockStatsItems });
    }
    res.status(400).json({ success: false, message: 'Invalid data format' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/values-items', async (req, res) => {
  res.json({ success: true, data: mockValuesItems });
});

app.post('/api/values-items', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      mockValuesItems = items;
      if (isDbConnected()) {
        await query(
          'INSERT INTO content_sections (section_key, section_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE section_data = ?',
          ['values', JSON.stringify(items), JSON.stringify(items)]
        );
      }
      return res.json({ success: true, message: 'تم حفظ قيم ومبادئ الشركة بنجاح', data: mockValuesItems });
    }
    res.status(400).json({ success: false, message: 'Invalid data format' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function syncProductsToContentJs(productsList) {
  try {
    const contentJsPath = path.join(__dirname, 'assets', 'data', 'content.js');
    if (!fs.existsSync(contentJsPath)) return;

    let contentStr = fs.readFileSync(contentJsPath, 'utf8');
    const vm = require('vm');
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(contentStr, sandbox);

    if (sandbox.ALMASA_DATA) {
      ['ar', 'en', 'fr', 'ru'].forEach(lang => {
        if (!sandbox.ALMASA_DATA[lang]) return;
        const currentProducts = sandbox.ALMASA_DATA[lang].products || [];

        // Build a map of existing products by id / slug
        const existingMap = new Map();
        currentProducts.forEach(p => {
          if (p.id) existingMap.set(String(p.id), p);
        });

        const syncedList = productsList.map(p => {
          const key = String(p.slug || p.id);
          const existing = existingMap.get(key) || existingMap.get(String(p.id)) || {};
          const imgs = (Array.isArray(p.images) && p.images.length > 0) ? p.images.slice(0, 5) : (p.image_url ? [p.image_url] : (existing.images || [existing.image || 'assets/images/oranges.jpg']));
          
          let pName = existing.name || p.name_ar;
          if (lang === 'en' && p.name_en) pName = p.name_en;
          if (lang === 'fr' && (existing.name || p.name_en)) pName = existing.name || p.name_en;
          if (lang === 'ru' && (existing.name || p.name_en)) pName = existing.name || p.name_en;

          return {
            ...existing,
            id: p.slug || p.id,
            tradeType: p.trade_type || existing.tradeType || 'export',
            name: pName,
            category: p.category_slug || existing.category || 'fresh-fruits',
            categoryName: (lang === 'ar' ? p.category_name_ar : (p.category_name_en || p.category_name_ar)) || existing.categoryName || '',
            image: imgs[0] || p.image_url || existing.image || 'assets/images/oranges.jpg',
            images: imgs,
            badge: (lang === 'ar' ? p.tag_ar : (p.tag_en || p.tag_ar)) || existing.badge || '',
            season: (lang === 'ar' ? p.season_ar : (p.season_en || p.season_ar)) || existing.season || '',
            sizes: (lang === 'ar' ? p.variety_ar : (p.variety_en || p.variety_ar)) || existing.sizes || '',
            packaging: (lang === 'ar' ? p.packaging_ar : (p.packaging_en || p.packaging_ar)) || existing.packaging || '',
            description: (lang === 'ar' ? (p.description_ar || p.tag_ar) : (p.description_en || p.description_ar || p.tag_en)) || existing.description || ''
          };
        });

        sandbox.ALMASA_DATA[lang].products = syncedList;
      });

      const newContentStr = `// Trilingual & Quadrilingual Data Repository for ALMASA Development & Agro-Export\nvar ALMASA_DATA = ${JSON.stringify(sandbox.ALMASA_DATA, null, 2)};\n`;
      fs.writeFileSync(contentJsPath, newContentStr, 'utf8');
      console.log('✅ [Sync] Successfully synced products & multi-images to assets/data/content.js');
    }
  } catch (err) {
    console.error('⚠️ [Sync] Error syncing products to content.js:', err.message);
  }
}

// -----------------------------------------------------------------------------
// 12. ALMASA Track Record / Projects Management API
// -----------------------------------------------------------------------------
function syncProjectsToContentJs(projectsList) {
  try {
    const contentJsPath = path.join(__dirname, 'assets', 'data', 'content.js');
    if (!fs.existsSync(contentJsPath)) return;

    let contentStr = fs.readFileSync(contentJsPath, 'utf8');

    const arProjects = projectsList.map(p => ({
      title: p.title_ar || p.title,
      entity: p.entity_ar || p.entity,
      desc: p.desc_ar || p.desc,
      image: p.image_url || p.image || 'assets/images/projects/tatwer1masa.png'
    }));

    const enProjects = projectsList.map(p => ({
      title: p.title_en || p.title_ar || p.title,
      entity: p.entity_en || p.entity_ar || p.entity,
      desc: p.desc_en || p.desc_ar || p.desc,
      image: p.image_url || p.image || 'assets/images/projects/tatwer1masa.png'
    }));

    const frProjects = projectsList.map(p => ({
      title: p.title_fr || p.title_en || p.title_ar || p.title,
      entity: p.entity_fr || p.entity_en || p.entity_ar || p.entity,
      desc: p.desc_fr || p.desc_en || p.desc_ar || p.desc,
      image: p.image_url || p.image || 'assets/images/projects/tatwer1masa.png'
    }));

    const vm = require('vm');
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(contentStr, sandbox);

    if (sandbox.ALMASA_DATA) {
      if (sandbox.ALMASA_DATA.ar) sandbox.ALMASA_DATA.ar.projects = arProjects;
      if (sandbox.ALMASA_DATA.en) sandbox.ALMASA_DATA.en.projects = enProjects;
      if (sandbox.ALMASA_DATA.fr) sandbox.ALMASA_DATA.fr.projects = frProjects;

      const newContentStr = `// Trilingual Data Repository for ALMASA Development & Agro-Export\nvar ALMASA_DATA = ${JSON.stringify(sandbox.ALMASA_DATA, null, 2)};\n`;
      fs.writeFileSync(contentJsPath, newContentStr, 'utf8');
      console.log('✅ [Sync] Successfully synced projects to assets/data/content.js');
    }
  } catch (err) {
    console.error('⚠️ [Sync] Error syncing projects to content.js:', err.message);
  }
}

app.get('/api/projects', async (req, res) => {
  try {
    let list = mockProjects;
    if (isDbConnected()) {
      try {
        const rows = await query('SELECT * FROM projects WHERE is_active = 1 ORDER BY sort_order ASC, id ASC');
        if (rows && rows.length > 0) list = rows;
      } catch (e) {
        // Table might not exist yet
      }
    }
    const normalized = list.map(p => ({
      ...p,
      entity_ar: p.entity_ar || p.client_ar || '',
      entity_en: p.entity_en || p.client_en || p.entity_ar || p.client_ar || '',
      entity_fr: p.entity_fr || p.client_fr || p.entity_en || p.client_en || '',
      client_ar: p.client_ar || p.entity_ar || '',
      client_en: p.client_en || p.entity_en || p.client_ar || p.entity_ar || '',
      client_fr: p.client_fr || p.entity_fr || p.client_en || p.entity_en || ''
    }));
    return res.json({ success: true, data: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { title_ar, title_en, title_fr, entity_ar, entity_en, entity_fr, client_ar, client_en, client_fr, desc_ar, desc_en, desc_fr, image_url, sort_order } = req.body;
    
    const finalEntityAr = entity_ar || client_ar || '';
    const finalEntityEn = entity_en || client_en || finalEntityAr;
    const finalEntityFr = entity_fr || client_fr || finalEntityEn;

    if (!title_ar || !finalEntityAr) {
      return res.status(400).json({ success: false, message: 'اسم المشروع وجهة الإسناد مطلوبة' });
    }

    const newProject = {
      id: Date.now(),
      title_ar,
      title_en: title_en || title_ar,
      title_fr: title_fr || title_en || title_ar,
      entity_ar: finalEntityAr,
      entity_en: finalEntityEn,
      entity_fr: finalEntityFr,
      client_ar: finalEntityAr,
      client_en: finalEntityEn,
      client_fr: finalEntityFr,
      desc_ar: desc_ar || '',
      desc_en: desc_en || desc_ar || '',
      desc_fr: desc_fr || desc_en || desc_ar || '',
      image_url: image_url || 'assets/images/projects/tatwer1masa.png',
      sort_order: parseInt(sort_order) || 0,
      is_active: 1
    };

    if (isDbConnected()) {
      try {
        await query(`
          CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title_ar VARCHAR(255) NOT NULL,
            title_en VARCHAR(255) DEFAULT '',
            title_fr VARCHAR(255) DEFAULT '',
            entity_ar VARCHAR(255) NOT NULL,
            entity_en VARCHAR(255) DEFAULT '',
            entity_fr VARCHAR(255) DEFAULT '',
            desc_ar TEXT,
            desc_en TEXT,
            desc_fr TEXT,
            image_url VARCHAR(500) DEFAULT 'assets/images/projects/tatwer1masa.png',
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        const result = await query(
          `INSERT INTO projects (title_ar, title_en, title_fr, entity_ar, entity_en, entity_fr, desc_ar, desc_en, desc_fr, image_url, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [newProject.title_ar, newProject.title_en, newProject.title_fr, newProject.entity_ar, newProject.entity_en, newProject.entity_fr, newProject.desc_ar, newProject.desc_en, newProject.desc_fr, newProject.image_url, newProject.sort_order]
        );
        newProject.id = result.insertId;
      } catch (e) {
        console.warn('MySQL insert project error:', e.message);
      }
    }

    mockProjects.push(newProject);
    saveDataStore();
    syncProjectsToContentJs(mockProjects);

    res.json({ success: true, message: 'تم إضافة المشروع بنجاح', data: newProject });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title_ar, title_en, title_fr, entity_ar, entity_en, entity_fr, client_ar, client_en, client_fr, desc_ar, desc_en, desc_fr, image_url, sort_order } = req.body;

    const finalEntityAr = entity_ar || client_ar;
    const finalEntityEn = entity_en || client_en || finalEntityAr;
    const finalEntityFr = entity_fr || client_fr || finalEntityEn;

    if (isDbConnected()) {
      try {
        await query(
          `UPDATE projects 
           SET title_ar = ?, title_en = ?, title_fr = ?, entity_ar = ?, entity_en = ?, entity_fr = ?, desc_ar = ?, desc_en = ?, desc_fr = ?, image_url = ?, sort_order = ?
           WHERE id = ?`,
          [title_ar, title_en || title_ar, title_fr || title_en || title_ar, finalEntityAr, finalEntityEn, finalEntityFr, desc_ar, desc_en || desc_ar, desc_fr || desc_en || desc_ar, image_url, sort_order || 0, id]
        );
      } catch (e) {
        console.warn('MySQL update project error:', e.message);
      }
    }

    const idx = mockProjects.findIndex(p => p.id == id);
    if (idx !== -1) {
      mockProjects[idx] = {
        ...mockProjects[idx],
        title_ar: title_ar || mockProjects[idx].title_ar,
        title_en: title_en || mockProjects[idx].title_en,
        title_fr: title_fr || mockProjects[idx].title_fr,
        entity_ar: finalEntityAr || mockProjects[idx].entity_ar,
        entity_en: finalEntityEn || mockProjects[idx].entity_en,
        entity_fr: finalEntityFr || mockProjects[idx].entity_fr,
        client_ar: finalEntityAr || mockProjects[idx].client_ar || mockProjects[idx].entity_ar,
        client_en: finalEntityEn || mockProjects[idx].client_en || mockProjects[idx].entity_en,
        client_fr: finalEntityFr || mockProjects[idx].client_fr || mockProjects[idx].entity_fr,
        desc_ar: desc_ar !== undefined ? desc_ar : mockProjects[idx].desc_ar,
        desc_en: desc_en !== undefined ? desc_en : mockProjects[idx].desc_en,
        desc_fr: desc_fr !== undefined ? desc_fr : mockProjects[idx].desc_fr,
        image_url: image_url || mockProjects[idx].image_url,
        sort_order: sort_order !== undefined ? parseInt(sort_order) : mockProjects[idx].sort_order
      };
      saveDataStore();
      syncProjectsToContentJs(mockProjects);
      return res.json({ success: true, message: 'تم تحديث بيانات المشروع بنجاح', data: mockProjects[idx] });
    }

    res.status(404).json({ success: false, message: 'المشروع غير موجود' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      try {
        await query('DELETE FROM projects WHERE id = ?', [id]);
      } catch (e) {
        console.warn('MySQL delete project error:', e.message);
      }
    }
    mockProjects = mockProjects.filter(p => p.id != id);
    saveDataStore();
    syncProjectsToContentJs(mockProjects);
    res.json({ success: true, message: 'تم حذف المشروع بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Root Route fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Launch server & initialize DB
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`✨ =======================================================`);
    console.log(`✨ ALMASA Agro-Export Platform Server Running on Port ${PORT}`);
    console.log(`🌐 Public Website: http://localhost:${PORT}`);
    console.log(`💎 Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`✨ =======================================================`);
    await initDb();
  });
} else {
  initDb().catch(e => console.warn('Init DB:', e.message));
}

module.exports = app;

