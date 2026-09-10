-- ==============================================================================
-- Green Gardens Development & Agro-Export (جرين جاردنز للتطوير والتصدير الزراعي)
-- MySQL Database Schema - Production Ready for Hostinger & Local Server
-- Collation: utf8mb4_unicode_ci (Supports Full Arabic & English Text & Emojis)
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `greengardens_db` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `greengardens_db`;

-- ------------------------------------------------------------------------------
-- 1. Admins & Users Table (حسابات المشرفين والمديرين)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(60) NOT NULL UNIQUE,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(100) DEFAULT 'Admin',
  `role` ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. Categories Table (أقسام وتصنيفات المنتجات الزراعية)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(80) NOT NULL UNIQUE,
  `name_ar` VARCHAR(100) NOT NULL,
  `name_en` VARCHAR(100) NOT NULL,
  `name_ru` VARCHAR(100) DEFAULT NULL,
  `description_ar` TEXT DEFAULT NULL,
  `description_en` TEXT DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT 'Leaf',
  `image_url` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. Products Table (الحاصلات والمنتجات التصديرية)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `category_id` INT DEFAULT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `name_ru` VARCHAR(150) DEFAULT NULL,
  `tag_ar` VARCHAR(80) DEFAULT NULL,
  `tag_en` VARCHAR(80) DEFAULT NULL,
  `description_ar` TEXT DEFAULT NULL,
  `description_en` TEXT DEFAULT NULL,
  `description_ru` TEXT DEFAULT NULL,
  `variety_ar` VARCHAR(100) DEFAULT NULL,
  `variety_en` VARCHAR(100) DEFAULT NULL,
  `season_ar` VARCHAR(100) DEFAULT NULL,
  `season_en` VARCHAR(100) DEFAULT NULL,
  `packaging_ar` VARCHAR(200) DEFAULT NULL,
  `packaging_en` VARCHAR(200) DEFAULT NULL,
  `shipping_temp` VARCHAR(50) DEFAULT NULL,
  `shelf_life` VARCHAR(50) DEFAULT NULL,
  `specifications` JSON DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `gallery` JSON DEFAULT NULL,
  `is_featured` TINYINT(1) DEFAULT 1,
  `is_active` TINYINT(1) DEFAULT 1,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) 
    REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. Inquiries & RFQ Table (طلبات عروض الأسعار ورسائل التواصل)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('rfq', 'contact', 'partnership') DEFAULT 'rfq',
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `company` VARCHAR(150) DEFAULT NULL,
  `country` VARCHAR(100) DEFAULT NULL,
  `product_name` VARCHAR(150) DEFAULT NULL,
  `quantity` VARCHAR(100) DEFAULT NULL,
  `incoterms` VARCHAR(50) DEFAULT 'FOB',
  `message` TEXT DEFAULT NULL,
  `status` ENUM('new', 'contacted', 'quoted', 'in_progress', 'completed', 'cancelled') DEFAULT 'new',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. Invoices & Export Orders Table (الفواتير وأوامر التصدير)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `client_name` VARCHAR(150) NOT NULL,
  `client_company` VARCHAR(150) DEFAULT NULL,
  `client_email` VARCHAR(120) DEFAULT NULL,
  `client_country` VARCHAR(80) DEFAULT NULL,
  `issue_date` DATE NOT NULL,
  `due_date` DATE DEFAULT NULL,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `total_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `discount_amount` DECIMAL(10, 2) DEFAULT 0.00,
  `status` ENUM('draft', 'sent', 'pending', 'paid', 'partially_paid', 'cancelled') DEFAULT 'pending',
  `items_json` JSON DEFAULT NULL,
  `payment_terms` VARCHAR(150) DEFAULT 'LC / TT Transfer',
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. News & Articles Table (أخبار ومعارض ومقالات الشركة)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `news_articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `title_ar` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `summary_ar` TEXT DEFAULT NULL,
  `summary_en` TEXT DEFAULT NULL,
  `content_ar` LONGTEXT DEFAULT NULL,
  `content_en` LONGTEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(60) DEFAULT 'Exhibition',
  `is_published` TINYINT(1) DEFAULT 1,
  `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. Site Settings & Branding Table (إعدادات وبيانات الموقع)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` VARCHAR(100) PRIMARY KEY,
  `setting_value` LONGTEXT DEFAULT NULL,
  `group_name` VARCHAR(50) DEFAULT 'general',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. Board Members Table (مجلس الإدارة والقيادات)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `board_members` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `role_ar` VARCHAR(150) NOT NULL,
  `role_en` VARCHAR(150) NOT NULL,
  `bio_ar` TEXT DEFAULT NULL,
  `bio_en` TEXT DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT 'assets/images/board_avatar.png',
  `sort_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. Content Sections Table (أقسام ومحتوى الموقع)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `content_sections` (
  `section_key` VARCHAR(100) PRIMARY KEY,
  `section_data` JSON NOT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- Initial Seed Data (البيانات الابتدائية والتجريبية)
-- ==============================================================================

-- 1. Default Super Admin (Username: admin, Password: admin123#GreenGardens)
INSERT INTO `admins` (`username`, `email`, `password_hash`, `full_name`, `role`)
VALUES ('admin', 'admin@greengardens-eg.com', '$2a$10$wN10gBfUqj9aLlhDkJvGZegBffjM/nQ9oV9z8y9e9tKkWwWzZqTWW', 'Green Gardens Executive Admin', 'super_admin')
ON DUPLICATE KEY UPDATE `username` = `username`;

-- 2. Seed Categories
INSERT INTO `categories` (`id`, `slug`, `name_ar`, `name_en`, `icon`, `sort_order`) VALUES
(1, 'fresh-fruits', 'فواكه طازجة', 'Fresh Fruits', 'Apple', 1),
(2, 'fresh-veg', 'خضروات طازجة', 'Fresh Vegetables', 'Carrot', 2),
(3, 'frozen', 'مجمدات سريعة التجميد', 'IQF Frozen Products', 'Snowflake', 3),
(4, 'grains', 'حبوب ومحاصيل زراعية', 'Crops & Grains', 'Sprout', 4)
ON DUPLICATE KEY UPDATE `name_ar` = VALUES(`name_ar`), `name_en` = VALUES(`name_en`), `slug` = VALUES(`slug`), `icon` = VALUES(`icon`);

-- 3. Seed All 10 Core Products
INSERT INTO `products` (`id`, `slug`, `category_id`, `name_ar`, `name_en`, `tag_ar`, `tag_en`, `variety_ar`, `variety_en`, `season_ar`, `season_en`, `packaging_ar`, `packaging_en`, `image_url`, `is_featured`, `sort_order`) VALUES
(1, 'valencia-orange', 1, 'برتقال مصري فالنسيا وبسرة', 'Egyptian Valencia & Navel Oranges', 'الأكثر طلباً عالمياً', 'Most Demanded Globally', 'فالنسيا وبسرة عالي العصارة', 'Juicy Valencia & Navel', 'نوفمبر - مايو', 'November - May', 'كرتونة تلسكوبية 15 كجم، كرتونة مفتوحة 8 كجم، أكياس شبكية', '15kg Telescopic Carton, 8kg Open Top, Mesh Bags', 'assets/images/valencia-oranges.jpg', 1, 1),
(2, 'fresh-strawberries', 1, 'فراولة طازجة فاخرة', 'Premium Fresh Strawberries', 'شحن جوي وبحري سريع', 'Fast Air & Sea Freight', 'فستيفال، فورتونا، سنسيشن', 'Festival, Fortuna, Sensation', 'نوفمبر - أبريل', 'November - April', 'عبوات بلاستيكية شفافة 250 جم و 500 جم داخل كرتون تصدير 2 كجم و 2.5 كجم', '250g & 500g Punnets in 2kg / 2.5kg Cartons', 'assets/images/strawberries.jpg', 1, 2),
(3, 'fresh-pomegranates', 1, 'رمان وندرفول طازج', 'Fresh Wonderful Pomegranates', 'لون ياقوتي فاخر', 'Premium Ruby Red', 'وندرفول وبلدي', 'Wonderful & Baladi', 'سبتمبر - يناير', 'September - January', 'كرتون تصدير 4.5 كجم و 5 كجم أو صناديق بلاستيكية', '4.5kg & 5kg Open Top Cartons', 'assets/images/pomegranates.jpg', 1, 3),
(4, 'fresh-grapes', 1, 'عنب مائدة بدون بذور', 'Seedless Prime Table Grapes', 'أصناف سوبريور وفليم', 'Superior, Flame & Crimson', 'سوبريور أبيض، فليم أحمر، كريمسون', 'White Superior, Red Flame, Crimson', 'مايو - سبتمبر', 'May - September', 'أكياس حمل 500 جم أو عبوات 500 جم داخل كرتون 4.5 كجم و 5 كجم', '500g Carry Bags / Punnets in 4.5kg / 5kg Cartons', 'assets/images/grapes.jpg', 1, 4),
(5, 'fresh-potatoes', 2, 'بطاطس مائدة وتصنيع', 'Fresh Table & Processing Potatoes', 'خالية من العفن البني', 'Brown Rot Free Certified', 'سبونتا، هيرمس، روزيتا، كارا', 'Spunta, Hermes, Rosetta, Lady Claire', 'يناير - يونيو', 'January - June', 'أجولة شبكية 10 كجم و 25 كجم، أكياس جامبو 1000 كجم', '10kg & 25kg Mesh Bags, 1000kg Jumbo Bags', 'assets/images/potatoes.jpg', 1, 5),
(6, 'frozen-okra-extra', 3, 'بامية اكسترا مجمدة سريعة التجميد', 'IQF Frozen Extra Okra', 'تجميد فردي سريع', 'Quick IQF Frozen', 'اكسترا، زيرو، ون', 'Extra, Zero, One', 'متوفر طوال العام', 'Year-Round Supply', 'أكياس 400 جم، 1 كجم، 2.5 كجم، كراتين 10 كجم صب', '400g, 1kg, 2.5kg Polybags / 10kg Bulk Cartons', 'assets/images/products/frozen_iqf_packs.jpg', 1, 6),
(7, 'frozen-peas-carrots', 3, 'بسلة بالجزر وبسلة سادة مجمدة', 'IQF Frozen Green Peas & Diced Carrots', 'حبات سكرية طبيعية', '100% Natural Sweet', 'بسلة خضراء سكرية ومكعبات جزر', 'Sweet Green Peas & Diced Carrots', 'متوفر طوال العام', 'Year-Round Supply', 'أكياس 400 جم، 1 كجم، 10 كجم متينة', '400g, 1kg, 10kg Industrial Cartons', 'assets/images/products/frozen_iqf_packs.jpg', 1, 7),
(8, 'frozen-molokhia', 3, 'ملوخية مصرية مفرومة مجمدة', 'IQF Frozen Minced Egyptian Molokhia', 'أصل النكهة المصرية', 'Authentic Egyptian Greenery', 'مفرومة ناعمة أو أوراق كاملة', 'Fine Minced / Whole Leaves', 'متوفر طوال العام', 'Year-Round Supply', 'أكياس 400 جم في كراتين 20 كيس (8 كجم)، كراتين 10 كجم', '400g Retail Bags (8kg Master Box) / 10kg Bulk', 'assets/images/products/frozen_iqf_packs.jpg', 1, 8),
(9, 'frozen-peaches', 3, 'خوخ مجمد شرائح وأنصاف', 'IQF Frozen Peach Slices & Halves', 'جاهز للتصنيع والعصائر', 'Industrial & Retail Grade', 'خوخ فلوريدا وسكري', 'Florida & Sweet Peaches', 'متوفر طوال العام', 'Year-Round Supply', 'أكياس 1 كجم، 2.5 كجم، كراتين 10 كجم للصناعات الغذائية', '1kg, 2.5kg Bags / 10kg Master Cartons', 'assets/images/products/frozen_iqf_packs.jpg', 1, 9),
(10, 'grains-pulses', 4, 'حبوب ومحاصيل زراعية وبقوليات', 'Agricultural Grains, Pulses & Legumes', 'درجة نقاء 99% فأكثر', '99%+ Purity Certified', 'قمح، حمص، عدس، فاصوليا بيضاء، فول بلدي', 'Wheat, Chickpeas, Lentils, White Beans, Broad Beans', 'مواسم الحصاد السنوية', 'Annual Harvest Seasons', 'أكياس خيش وبولي بروبلين 25 كجم و 50 كجم، أكياس جامبو 1 طن', '25kg, 50kg PP Bags / 1 Ton Jumbo Bags', 'assets/images/products/grains_legumes_real.jpg', 1, 10)
ON DUPLICATE KEY UPDATE `name_ar` = VALUES(`name_ar`), `name_en` = VALUES(`name_en`), `category_id` = VALUES(`category_id`), `image_url` = VALUES(`image_url`), `tag_ar` = VALUES(`tag_ar`);

-- 4. Initial Site Settings
INSERT INTO `site_settings` (`setting_key`, `setting_value`, `group_name`) VALUES
('site_title_ar', 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي', 'general'),
('site_title_en', 'Green Gardens Development & Agro-Export Co.', 'general'),
('company_email', 'info@greengardens-eg.com', 'contact'),
('company_phone', '+20 100 000 0000', 'contact'),
('company_whatsapp', '+20 100 000 0000', 'contact'),
('company_address_ar', 'جمهورية مصر العربية - مزارع وادي النطرون والبستان', 'contact'),
('company_address_en', 'Egypt - Wadi El-Natrun & Bustan Agro Farms', 'contact')
ON DUPLICATE KEY UPDATE `setting_key` = `setting_key`;

-- 5. Seed Board Members
INSERT INTO `board_members` (`id`, `name_ar`, `name_en`, `role_ar`, `role_en`, `bio_ar`, `bio_en`, `image_url`, `sort_order`) VALUES
(1, 'السيدة / إيمان محمد الجداوي', 'Mrs. Eman Mohamed El-Jedawy', 'رئيس مجلس الإدارة', 'Chairwoman of the Board', 'قيادة الرؤية الاستراتيجية الشاملة لشركة جرين جاردنز والتوسع في القطاعات التنموية والاستثمارية المستدامة.', 'Leading the overall strategic vision of Green Gardens and expanding into sustainable agro-development.', 'assets/images/logo.png', 1),
(2, 'المهندس / عبده محمد عياد', 'Eng. Abdo Mohamed Ayyad', 'نائب رئيس مجلس الإدارة والعضو المنتدب', 'Vice Chairman & Managing Director', 'الإشراف التنفيذي الكامل على الخطط التشغيلية وتوسعات قطاع التصدير الزراعي والغذائي والمشروعات الكبرى.', 'Executive oversight on operational plans and major agro-export expansions.', 'assets/images/board/abdo_mohamed_ayyad.jpg', 2),
(3, 'المستشار الدكتور / سمير بن محمد بن الخطيب', 'Dr. Samir Mohamed El-Khatib', 'عضو مجلس الإدارة', 'Board Member', 'تطوير الشراكات الاستثمارية والتوجهات الاستراتيجية للتوسع في الأسواق الخليجية والدولية.', 'Developing strategic investment partnerships and expanding into Gulf and international markets.', 'assets/images/board/samir_el_khatib.jpg', 3),
(4, 'الدكتورة / ريماس عبده عياد', 'Dr. Remas Abdo Ayyad', 'عضوة مجلس الإدارة', 'Board Member', 'المساهمة في التخطيط الاستراتيجي وبرامج الجودة والتطوير المؤسسي المستمر.', 'Contributing to strategic planning, quality frameworks, and continuous development.', 'assets/images/logo.png', 4),
(5, 'الأستاذ / عماد سعد محمد', 'Mr. Emad Saad Mohamed', 'مدير ومراجع القطاع المالي', 'CFO & Financial Auditor', 'إدارة الحوكمة المالية، المراجعة المحاسبية، وتأمين التمويل والاعتمادات المستندية للتصدير الدولي.', 'Managing financial governance, auditing, and export letters of credit.', 'assets/images/board/emad_saad_mohamed.jpg', 5),
(6, 'المهندس / أحمد حسن عبدالعزيز', 'Eng. Ahmed Hassan Abdelaziz', 'مدير القطاع التجاري', 'Commercial Director', 'إدارة العقود التجارية الدولية، التسعير التنافسي، وفتح قنوات التوزيع العالمية.', 'Managing international trade contracts, competitive pricing, and global sales channels.', 'assets/images/board/ahmed_hassan_abdelaziz.jpg', 6),
(7, 'المهندس / محمد فتحي عياد', 'Eng. Mohamed Fathy Ayyad', 'مدير قطاع التسويق', 'Marketing Director', 'بناء الهوية المؤسسية الدولية، الحملات التسويقية لعلامة جرين جاردنز، والمشاركة في المعارض الغذائية العالمية.', 'Building international brand identity and managing global food exhibition participation.', 'assets/images/board/mohamed_fathy_ayyad.jpg', 7),
(8, 'الدكتور / أحمد محمد فايد', 'Dr. Ahmed Mohamed Fayed', 'مدير القطاع القانوني', 'Chief Legal Officer', 'صياغة ومراجعة العقود الدولية والاتفاقيات التجارية وضمان الامتثال للوائح التجارة العالمية.', 'Drafting international trade contracts and ensuring full regulatory compliance.', 'assets/images/board/ahmed_mohamed_fayed.jpg', 8),
(9, 'المستشار / صبري إبراهيم السيد', 'Mr. Sabry Ibrahim El-Sayed', 'مدير العلاقات الخارجية والتصدير', 'External Relations & Export Director', 'التنسيق التجاري مع البعثات التجارية ومتابعة تسهيلات الشحن والجمارك للتصدير.', 'Coordinating with trade missions and managing customs and international logistics.', 'assets/images/board/sabry_ibrahim_elsayed.jpg', 9),
(10, 'اللواء / شريف أنور زغلول', 'Gen. Sherif Anwar Zaghloul', 'مدير القطاع الأمني', 'Security & Facilities Director', 'تأمين سلاسل الإمداد ومواقع المزارع والمحطات وتطبيق بروتوكولات السلامة والحماية الشاملة.', 'Securing supply chains, farms, and facilities with comprehensive safety protocols.', 'assets/images/board/sherif_anwar_zaghloul.jpg', 10)
ON DUPLICATE KEY UPDATE `name_ar` = VALUES(`name_ar`), `name_en` = VALUES(`name_en`), `role_ar` = VALUES(`role_ar`), `role_en` = VALUES(`role_en`), `image_url` = VALUES(`image_url`);


