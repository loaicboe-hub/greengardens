// ==============================================================================
// ALMASA LUXURY ADMIN CONTROLLER
// Client-Side Management Logic for Products, Website Content, RFQs, Invoices & DB
// Pure Separation: Arabic mode is 100% Arabic, English mode is 100% English.
// ==============================================================================

const API_BASE = '/api';
let currentToken = localStorage.getItem('almasa_admin_token') || '';
let currentUser = JSON.parse(localStorage.getItem('almasa_admin_user') || 'null');
let categoriesCache = [];
let boardCache = [];
let statsItemsCache = [];
let valuesItemsCache = [];
let projectsCache = [];
let currentAdminLang = localStorage.getItem('almasa_admin_lang') || 'ar';

// -----------------------------------------------------------------------------
// Bilingual Dictionary (100% Pure Arabic & 100% Pure English)
// -----------------------------------------------------------------------------
const ADM_FLAGS = {
  ar: `<svg class="adm-flag-icon" viewBox="0 0 640 480" width="18" height="13" aria-hidden="true" style="border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3);vertical-align:middle;display:inline-block;"><rect width="640" height="160" fill="#ce1126"/><rect y="160" width="640" height="160" fill="#ffffff"/><rect y="320" width="640" height="160" fill="#000000"/><path d="M320 200 c-12 0 -22 10 -22 25 c0 20 12 40 22 55 c10 -15 22 -35 22 -55 c0 -15 -10 -25 -22 -25 z" fill="#c59b27"/><path d="M305 225 c-15 -10 -25 5 -18 20 c8 18 22 30 33 35 c11 -5 25 -17 33 -35 c7 -15 -3 -30 -18 -20 c-5 5 -12 8 -15 8 c-3 0 -10 -3 -15 -8 z" fill="#d4af37"/><circle cx="320" cy="210" r="5" fill="#a17c1a"/><rect x="312" y="235" width="16" height="20" rx="2" fill="#c59b27" stroke="#8b6814" stroke-width="1"/></svg>`,
  en: `<svg class="adm-flag-icon" viewBox="0 0 640 480" width="18" height="13" aria-hidden="true" style="border-radius:2px;box-shadow:0 1px 3px rgba(0,0,0,0.3);vertical-align:middle;display:inline-block;"><clipPath id="adm-uk-clip"><rect width="640" height="480" rx="2"/></clipPath><g clip-path="url(#adm-uk-clip)"><rect width="640" height="480" fill="#012169"/><path d="M0 0 L640 480 M640 0 L0 480" stroke="#ffffff" stroke-width="60"/><path d="M0 0 L640 480 M640 0 L0 480" stroke="#c8102e" stroke-width="40"/><path d="M0 0 L320 240 M640 480 L320 240" stroke="#ffffff" stroke-width="20"/><path d="M0 0 L320 240 M640 480 L320 240" stroke="#c8102e" stroke-width="15"/><path d="M320 0 v480 M0 240 h640" stroke="#ffffff" stroke-width="100"/><path d="M320 0 v480 M0 240 h640" stroke="#c8102e" stroke-width="60"/></g></svg>`
};

const ADMIN_I18N = {
  ar: {
    flag: ADM_FLAGS.en,
    langBtnText: 'English',
    docTitle: 'لوحة الإدارة والتحكم | شركة جرين جاردنز للتطوير والتصدير الزراعي',
    brandTitle: 'شركة جرين جاردنز للتطوير',
    brandSub: 'قطاع التصدير الزراعي والغذائي',
    navOverview: 'نظرة عامة',
    navCategories: 'الأقسام الزراعية',
    navProducts: 'المنتجات والحاصلات',
    navContent: 'محتوى الموقع',
    navInquiries: 'طلبات الأسعار والرسائل',
    navInvoices: 'فواتير التصدير',
    navSettings: 'الإعدادات العامة',
    headerTitle: 'لوحة تحكم شركة جرين جاردنز',
    headerSub: 'نظام إدارة المحتوى والتصدير وقاعدة بيانات MySQL',
    visitSite: 'زيارة الموقع',
    dbStatus: 'قاعدة البيانات متصلة',
    adminRole: 'المشرف العام',
    roleSuperAdmin: 'المدير العام',
    roleAdmin: 'مشرف النظام',
    logoutTooltip: 'تسجيل الخروج',

    // Stats Cards
    statTotalProducts: 'إجمالي الحاصلات المسجلة',
    statTotalInquiries: 'طلبات الأسعار والعروض',
    statNewInquiries: 'طلبات جديدة غير مقروءة',
    statTotalInvoices: 'فواتير وعقود التصدير',
    guideTitle: 'دليل وتوجيهات تشغيل النظام',
    guideDesc: 'تم تجهيز هذا النظام ليعمل بكفاءة وسرعة فائقة بالاعتماد على قاعدة بيانات MySQL. يمكنك تصدير أو استيراد البيانات وإدارة كافة العمليات من خلال هذه اللوحة المتطورة.',

    // Categories Section
    catHeaderTitle: 'الأقسام والتصنيفات الزراعية الرئيسية',
    catHeaderSub: 'إضافة وتعديل الأقسام الرئيسية وتصنيف المحاصيل تحتها',
    btnAddCategory: 'إضافة قسم جديد',
    thCatNameAr: 'اسم القسم بالعربية',
    thCatNameEn: 'اسم القسم بالإنجليزية',
    thCatSlug: 'الاسم التعريفي',
    thCatIcon: 'الرمز التعبيري',
    thActions: 'الإجراءات',

    // Products Section
    prodHeaderTitle: 'قائمة المنتجات والحاصلات الزراعية',
    prodHeaderSub: 'إدارة كافة المحاصيل وربطها بالأقسام الرئيسية للتصدير والاستيراد',
    optAllCategories: 'جميع الأقسام الزراعية',
    optAllTradeTypes: 'جميع المعاملات (تصدير واستيراد)',
    optExport: '🚢 حاصلات التصدير (Export)',
    optImport: '📦 منتجات الاستيراد (Import)',
    btnAddProduct: 'إضافة حاصلات جديدة',
    thImage: 'الصورة',
    thProductName: 'اسم المحصول',
    thTradeType: 'نوع المعاملة',
    thCategory: 'القسم الزراعي',
    thSeason: 'الموسم',
    thPackaging: 'التعبئة والتغليف',
    badgeExport: '🚢 تصدير',
    badgeImport: '📦 استيراد',
    lblProdGalleryTitle: '📸 معرض صور المحصول (5 صور بدقة عالية)',
    lblProdGallerySub: 'يمكنك رفع حتى 5 صور للمنتج من الخانات أدناه أو رفعها دفعة واحدة. الصورة 1 هي الصورة الرئيسية في واجهة الموقع.',
    lblProdMultiUpload: '📁 رفع حتى 5 صور دفعة واحدة من جهازك',
    lblProdAddUrlPlaceholder: 'أو اكتب رابط الصورة (assets/images/products/...jpg)',
    btnAddUrl: '＋ إضافة رابط',

    // Website Content Section
    contentHeaderTitle: 'إدارة وتعديل محتوى الموقع بالكامل',
    contentHeaderSub: 'التحكم في نصوص وصور الواجهة الرئيسية، من نحن، الرؤية، القيادات، الإحصائيات، وسلسلة التصدير',
    subtabHero: 'الواجهة الرئيسية',
    subtabAbout: 'عن الشركة والرؤية',
    subtabBoard: 'مجلس الإدارة والقيادات',
    subtabStats: 'الأرقام والإحصائيات',
    subtabValues: 'القيم والمبادئ',
    subtabFarms: 'المزارع وسلسلة التصدير',
    subtabProjects: 'سابقة الأعمال والمشروعات',
    lblHeroBadgeAr: 'الشريط الترويجي العلوي بالعربية',
    lblHeroBadgeEn: 'الشريط الترويجي العلوي بالإنجليزية',
    lblHeroTitleAr: 'العنوان الرئيسي للواجهة بالعربية',
    lblHeroTitleEn: 'العنوان الرئيسي للواجهة بالإنجليزية',
    lblHeroSubAr: 'الوصف الترويجي بالعربية',
    lblHeroSubEn: 'الوصف الترويجي بالإنجليزية',
    lblHeroCtaCatalogAr: 'نص زر الكتالوج بالعربية',
    lblHeroCtaCatalogEn: 'نص زر الكتالوج بالإنجليزية',
    lblHeroCtaRfqAr: 'نص زر طلب التسعير بالعربية',
    lblHeroCtaRfqEn: 'نص زر طلب التسعير بالإنجليزية',
    lblHeroFloat1Ar: 'البطاقة العائمة 1 (العنوان والوصف بالعربية)',
    lblHeroFloat1En: 'البطاقة العائمة 1 (العنوان والوصف بالإنجليزية)',
    lblHeroFloat2Ar: 'البطاقة العائمة 2 (العنوان والوصف بالعربية)',
    lblHeroFloat2En: 'البطاقة العائمة 2 (العنوان والوصف بالإنجليزية)',
    lblHeroImage: 'صورة خلفية الواجهة الرئيسية (رفع ملف أو مسار)',
    lblHeroImageUpload: 'رفع صورة جديدة',
    btnSaveHero: 'حفظ تعديلات الواجهة الرئيسية',

    lblAboutTitleAr: 'عنوان قسم من نحن بالعربية',
    lblAboutTitleEn: 'عنوان قسم من نحن بالإنجليزية',
    lblAboutDescAr: 'قصة وتاريخ الشركة بالعربية',
    lblAboutDescEn: 'قصة وتاريخ الشركة بالإنجليزية',
    lblVisionTextAr: 'نص الرؤية بالعربية',
    lblVisionTextEn: 'نص الرؤية بالإنجليزية',
    lblMissionTextAr: 'نص الرسالة بالعربية',
    lblMissionTextEn: 'نص الرسالة بالإنجليزية',
    lblMgmtMsgAr: 'كلمة الإدارة بالعربية',
    lblMgmtMsgEn: 'كلمة الإدارة بالإنجليزية',
    lblMgmtSignAr: 'توقيع وصفة الإدارة بالعربية',
    lblMgmtSignEn: 'توقيع وصفة الإدارة بالإنجليزية',
    btnSaveAbout: 'حفظ تعديلات قسم من نحن والرؤية',

    boardListTitle: 'أعضاء مجلس الإدارة والقيادات التنفيذية',
    boardListSub: 'إضافة وتعديل وحذف قيادات الشركة وتحديد أدوارهم وسيرهم المهنية',
    btnAddBoardMember: 'إضافة عضو مجلس إدارة',
    thBoardPhoto: 'الصورة',
    thBoardName: 'الاسم والصفة',
    thBoardRole: 'المسمى الوظيفي',
    thBoardBio: 'نبذة مهنية',

    statsListTitle: 'أرقام وإحصائيات النجاح في الموقع',
    statsListSub: 'إدارة البطاقات الرقمية المميزة مثل عدد الأفدنة وسنوات الخبرة والاعتمادات',
    btnAddStat: 'إضافة رقم إحصائي جديد',
    lblStatValue: 'الرقم أو القيمة *',
    lblStatLabelAr: 'الوصف بالعربية *',
    lblStatLabelEn: 'الوصف بالإنجليزية *',
    btnSaveStatItem: 'حفظ الرقم الإحصائي',

    valuesListTitle: 'قيم ومبادئ شركة جرين جاردنز',
    valuesListSub: 'التحكم في المبادئ الستة التي تقود تميز الشركة في التصدير والاستثمار',
    btnAddValue: 'إضافة قيمة جديدة',
    lblValueNum: 'الرقم التسلسلي *',
    lblValueTitleAr: 'عنوان القيمة بالعربية *',
    lblValueTitleEn: 'عنوان القيمة بالإنجليزية *',
    lblValueDescAr: 'شرح القيمة بالعربية',
    lblValueDescEn: 'شرح القيمة بالإنجليزية',
    btnSaveValueItem: 'حفظ القيمة',

    farmsHeaderSection: 'بيانات قسم المزارع والاستثمار الزراعي',
    lblFarmsTitleAr: 'عنوان قسم المزارع بالعربية',
    lblFarmsTitleEn: 'عنوان قسم المزارع بالإنجليزية',
    lblFarmsDescAr: 'وصف قسم المزارع والري المحوري بالعربية',
    lblFarmsDescEn: 'وصف قسم المزارع والري المحوري بالإنجليزية',
    processHeaderSection: 'سلسلة الجودة ومراحل التصدير',
    lblProcessTitleAr: 'عنوان سلسلة الجودة والتصدير بالعربية',
    lblProcessTitleEn: 'عنوان سلسلة الجودة والتصدير بالإنجليزية',
    lblProcessDescAr: 'شرح بروتوكول الجودة والتصدير بالعربية',
    lblProcessDescEn: 'شرح بروتوكول الجودة والتصدير بالإنجليزية',
    btnSaveFarms: 'حفظ تعديلات المزارع وسلسلة التصدير',

    projectsListTitle: 'المشروعات الكبرى وسابقة الأعمال (GREEN GARDENS TRACK RECORD)',
    projectsListSub: 'إضافة وتعديل وحذف مشروعات وسلايدات سابقة الأعمال ورفع الصور والتعديل الفوري على الموقع الرئيسي',
    btnAddProject: 'إضافة مشروع / سابقة أعمال',
    thProjectImage: 'صورة المشروع',
    thProjectTitle: 'اسم المشروع',
    thProjectEntity: 'جهة الإسناد / التعاقد',
    thProjectDesc: 'الوصف ونطاق العمل',

    // Inquiries Section
    inqHeaderTitle: 'صندوق طلبات عروض الأسعار والتواصل',
    thClient: 'العميل / الشركة',
    thContact: 'وسيلة التواصل',
    thCountry: 'الدولة',
    thProductQty: 'المنتج والكمية',
    thStatus: 'الحالة',
    thAction: 'الإجراء',

    // Invoices Section
    invHeaderTitle: 'فواتير وعقود التصدير الدولية',
    btnCreateInvoice: 'إنشاء فاتورة تصدير',
    thInvoiceNum: 'رقم الفاتورة',
    thImporter: 'المستورد / العميل',
    thDestination: 'دولة الوصول',
    thTotalVal: 'إجمالي القيمة',

    // Settings Section
    settingsHeader: 'الإعدادات العامة للشركة',
    settingsSub: 'تعديل أرقام الهواتف والواتساب والعناوين وحسابات التواصل الاجتماعي',
    secContactTitle: 'أرقام الهواتف والتواصل المباشر',
    lblCompanyPhone: 'رقم الهاتف الرسمي *',
    lblCompanyWhatsapp: 'رقم الواتساب للتصدير *',
    lblCompanyEmail: 'البريد الإلكتروني الرسمي *',
    secIdentityTitle: 'بيانات وهوية الشركة',
    lblCompanyNameAr: 'اسم الشركة بالعربية',
    lblCompanyNameEn: 'اسم الشركة بالإنجليزية',
    lblCompanyAddressAr: 'عنوان المقر والمزارع بالعربية',
    lblCompanyAddressEn: 'عنوان المقر والمزارع بالإنجليزية',
    lblAboutSummary: 'نبذة تعريفية عن الشركة',
    secSocialTitle: 'روابط حسابات التواصل الاجتماعي',
    lblFacebook: 'رابط صفحة فيسبوك',
    lblLinkedin: 'رابط منصة لينكد إن',
    lblInstagram: 'رابط حساب إنستجرام',
    lblYoutube: 'رابط قناة يوتيوب',
    lblTiktok: 'رابط حساب تيك توك',
    lblTwitter: 'رابط منصة إكس',
    btnSaveSettings: 'حفظ التعديلات في قاعدة البيانات',

    // Common Buttons & Statuses
    btnEdit: 'تعديل',
    btnDelete: 'حذف',
    btnDetails: 'تفاصيل',
    btnPrint: 'طباعة الفاتورة',
    statusNew: 'جديد',
    statusContacted: 'تم التواصل',
    statusCompleted: 'مكتمل ومؤكد',
    statusPaid: 'مدفوعة ومؤكدة',
    statusPartiallyPaid: 'مدفوعة جزئياً',
    statusPending: 'قيد الإجراء والتحصيل',
    statusDraft: 'مسودة',
    statusCancelled: 'ملغاة',
    lblInvStatus: 'حالة الفاتورة',
    lblInvDueDate: 'تاريخ الاستحقاق',
    toastStatusUpdated: 'تم تحديث حالة الفاتورة بنجاح',
    toastDeleteConfirmInv: 'هل أنت متأكد من حذف هذه الفاتورة من السجلات؟',
    unassignedCategory: 'غير مصنف',
    unspecifiedQty: 'كمية غير محددة',
    generalRequest: 'طلب عام',
    internationalClient: 'مستورد دولي',
    globalDestination: 'دولي',

    // Modals
    loginTitle: 'تسجيل دخول الإدارة',
    loginSub: 'بوابة الإدارة والتصدير لشركة جرين جاردنز',
    lblLoginUsername: 'اسم المستخدم أو البريد الإلكتروني',
    lblLoginPassword: 'كلمة المرور',
    btnLoginSubmit: 'دخول لوحة التحكم',

    boardModalAddTitle: 'إضافة عضو مجلس إدارة جديد',
    boardModalEditTitle: 'تعديل بيانات عضو مجلس الإدارة',
    lblBoardNameAr: 'الاسم واللقب بالعربية *',
    lblBoardNameEn: 'الاسم واللقب بالإنجليزية *',
    lblBoardRoleAr: 'المسمى والمنصب بالعربية *',
    lblBoardRoleEn: 'المسمى والمنصب بالإنجليزية *',
    lblBoardBioAr: 'النبذة المهنية بالعربية',
    lblBoardBioEn: 'النبذة المهنية بالإنجليزية',
    lblBoardImage: 'الصورة الشخصية (رفع أو مسار)',
    lblBoardImageUpload: 'رفع صورة العضو',
    lblBoardOrder: 'ترتيب الظهور',
    btnSaveBoardMember: 'حفظ العضو في قاعدة البيانات',

    statModalAddTitle: 'إضافة رقم إحصائي جديد',
    statModalEditTitle: 'تعديل الرقم الإحصائي',
    valueModalAddTitle: 'إضافة قيمة ومبدأ جديد',
    valueModalEditTitle: 'تعديل القيمة والمبدأ',

    projectModalAddTitle: 'إضافة مشروع / سابقة أعمال جديدة',
    projectModalEditTitle: 'تعديل بيانات المشروع',
    lblProjectTitleAr: 'اسم المشروع بالعربية *',
    lblProjectTitleEn: 'اسم المشروع بالإنجليزية',
    lblProjectEntityAr: 'جهة الإسناد / التعاقد بالعربية *',
    lblProjectEntityEn: 'جهة الإسناد / التعاقد بالإنجليزية',
    lblProjectDescAr: 'تفاصيل ونطاق تنفيذ المشروع بالعربية *',
    lblProjectDescEn: 'تفاصيل ونطاق تنفيذ المشروع بالإنجليزية',
    lblProjectImageUrl: 'مسار أو رابط الصورة / السلايد',
    lblProjectImageUpload: 'رفع صورة جديدة من جهازك',
    lblProjectPreview: 'معاينة الصورة المحددة:',
    lblSortOrder: 'ترتيب الظهور',
    btnCancel: 'إلغاء',
    btnSaveProject: 'حفظ المشروع في سابقة الأعمال',

    catModalAddTitle: 'إضافة قسم زراعي جديد',
    catModalEditTitle: 'تعديل القسم الزراعي',
    lblCatNameAr: 'اسم القسم بالعربية *',
    lblCatNameEn: 'اسم القسم بالإنجليزية *',
    lblCatSlug: 'الاسم التعريفي',
    lblCatIcon: 'الرمز التعبيري',
    lblCatSortOrder: 'ترتيب الظهور',
    btnSaveCategory: 'حفظ القسم في قاعدة البيانات',

    prodModalAddTitle: 'إضافة حاصلات زراعية جديدة',
    prodModalEditTitle: 'تعديل المحصول أو السلعة',
    lblProdTradeType: 'نوع المعاملة التجارية (تصدير / استيراد) *',
    lblProdNameAr: 'اسم المحصول بالعربية *',
    lblProdNameEn: 'اسم المحصول بالإنجليزية',
    lblProdCategory: 'القسم والتصنيف الزراعي *',
    lblProdTag: 'الوسم المميز',
    lblProdVariety: 'الصنف والنوع',
    lblProdSeason: 'مواسم الإنتاج والتصدير',
    lblProdPackaging: 'مواصفات التعبئة والتغليف والشحن',
    lblProdGalleryTitle: 'معرض صور المحصول (حتى 5 صور بدقة عالية)',
    lblProdGallerySub: 'يمكنك رفع حتى 5 صور للمنتج، الصورة الأولى ذات الشارة الذهبية هي الصورة الرئيسية في الواجهة',
    lblProdMultiUpload: 'رفع صور متعددة من جهازك (اختيار حتى 5 ملفات دفعة واحدة)',
    lblProdAddUrl: 'أو إضافة رابط صورة مباشر',
    btnAddUrl: '＋ إضافة',
    badgePrimary: '★ الرئيسية',
    btnSetPrimary: 'تعيين كرئيسية',
    btnRemove: 'حذف',
    btnAddImage: 'إضافة صورة',
    lblProdImageFile: 'صورة المنتج (رفع ملف جديد)',
    lblProdImageUrl: 'أو مسار الصورة المباشر',
    lblProdFeatured: 'عرض في الصفحة الرئيسية كمنتج رئيسي مميز',
    btnSaveDatabase: 'حفظ في قاعدة البيانات',

    inqModalTitle: 'تفاصيل طلب عرض السعر والتواصل',
    lblInqName: 'اسم المسؤول:',
    lblInqCompany: 'الشركة والمؤسسة:',
    lblInqEmail: 'البريد الإلكتروني:',
    lblInqPhone: 'رقم الهاتف / الواتساب:',
    lblInqCountry: 'دولة المستورد:',
    lblInqProduct: 'المنتج المطلوب:',
    lblInqQuantity: 'الكمية:',
    lblInqShipping: 'شرط الشحن:',
    lblInqMessage: 'نص الرسالة والملاحظات:',
    lblInqUpdateStatus: 'تحديث حالة المتابعة',
    btnSaveStatus: 'حفظ الحالة',

    invModalTitle: 'إنشاء فاتورة تصدير جديدة',
    lblInvClientName: 'اسم العميل / المستورد *',
    lblInvCompany: 'اسم الشركة',
    lblInvEmail: 'البريد الإلكتروني',
    lblInvDestination: 'دولة الوصول والميناء',
    lblInvTotal: 'إجمالي القيمة *',
    lblInvCurrency: 'العملة',
    lblInvTerms: 'شروط الدفع والشحن',
    lblInvNotes: 'ملاحظات إضافية',
    btnIssueInvoice: 'إصدار وحفظ الفاتورة',

    // Toasts & Alerts
    toastLoginSuccess: 'تم تسجيل الدخول بنجاح! مرحباً بكم في لوحة تحكم الماسة.',
    toastLogoutSuccess: 'تم تسجيل الخروج بنجاح.',
    toastLoginError: 'بيانات الدخول غير صحيحة',
    toastSaveSuccess: 'تم حفظ وتحديث البيانات بنجاح!',
    toastDeleted: 'تم حذف العنصر بنجاح.',
    toastDeleteConfirmCat: 'هل أنت متأكد من رغبتك في حذف هذا القسم الزراعي؟ سيتم إزالة تصنيف المنتجات التابعة له.',
    toastDeleteConfirmProd: 'هل أنت متأكد من رغبتك في حذف هذا المحصول من قاعدة البيانات؟',
    toastDeleteConfirmBoard: 'هل أنت متأكد من رغبتك في حذف هذا العضو من مجلس الإدارة؟',
    toastDeleteConfirmStat: 'هل أنت متأكد من رغبتك في حذف هذا الرقم الإحصائي؟',
    toastDeleteConfirmValue: 'هل أنت متأكد من رغبتك في حذف هذه القيمة؟',
    toastDeleteConfirmProject: 'هل أنت متأكد من رغبتك في حذف هذا المشروع من سابقة الأعمال؟',
    toastImageUploading: 'جاري رفع الصورة...',
    toastImageUploaded: 'تم رفع الصورة بنجاح!',
    toastSavingSettings: 'جاري حفظ الإعدادات في قاعدة البيانات...',
    loadingCategories: 'جاري تحميل الأقسام الزراعية...',
    noCategoriesFound: 'لا توجد أقسام مسجلة. اضغط على إضافة قسم جديد للبدء.',
    loadingProducts: 'جاري تحميل المنتجات من قاعدة البيانات...',
    noProductsFound: 'لا توجد حاصلات مسجلة في هذا القسم حالياً. اضغط على إضافة حاصلات جديدة.',
    loadingInquiries: 'جاري فحص صندوق الرسائل وطلبات الأسعار...',
    noInquiriesFound: 'لا توجد رسائل أو طلبات أسعار جديدة في الوقت الحالي.',
    loadingInvoices: 'جاري جلب سجل الفواتير وعقود التصدير...',
    noInvoicesFound: 'لا توجد فواتير تصدير منشأة حالياً. اضغط على إنشاء فاتورة تصدير للبدء.',
    loadingBoard: 'جاري تحميل أعضاء مجلس الإدارة...',
    noBoardFound: 'لا يوجد أعضاء مسجلين حالياً. اضغط على إضافة عضو مجلس إدارة.',
    loadingProjects: 'جاري تحميل مشروعات سابقة الأعمال...',
    noProjectsFound: 'لا توجد مشروعات مسجلة حالياً. اضغط على إضافة مشروع للبدء.'
  },

  en: {
    flag: ADM_FLAGS.ar,
    langBtnText: 'العربية',
    docTitle: 'Admin & Control Panel | Green Gardens Development & Agro-Export',
    brandTitle: 'Green Gardens Development',
    brandSub: 'Agro-Export & Food Division',
    navOverview: 'Overview',
    navCategories: 'Agro Categories',
    navProducts: 'Products & Crops',
    navContent: 'Website Content',
    navInquiries: 'RFQs & Inquiries',
    navInvoices: 'Export Invoices',
    navSettings: 'General Settings',
    headerTitle: 'Green Gardens Control Panel',
    headerSub: 'Agro-Export Content Management System & MySQL Database',
    visitSite: 'Visit Website',
    dbStatus: 'Database Online',
    adminRole: 'Super Admin',
    roleSuperAdmin: 'General Manager',
    roleAdmin: 'System Administrator',
    logoutTooltip: 'Logout',

    // Stats Cards
    statTotalProducts: 'Total Registered Crops',
    statTotalInquiries: 'Price Quotations (RFQ)',
    statNewInquiries: 'New Unread Requests',
    statTotalInvoices: 'Export Invoices & Contracts',
    guideTitle: 'System Deployment & Operations Guide',
    guideDesc: 'This system is configured to run at high speed and stability backed by MySQL database. You can export or import data and manage all export operations seamlessly.',

    // Categories Section
    catHeaderTitle: 'Main Agro Categories & Classifications',
    catHeaderSub: 'Manage main categories and organize export crops underneath',
    btnAddCategory: 'Add New Category',
    thCatNameAr: 'Category Name (Arabic)',
    thCatNameEn: 'Category Name (English)',
    thCatSlug: 'Slug Identifier',
    thCatIcon: 'Icon Symbol',
    thActions: 'Actions',

    // Products Section
    prodHeaderTitle: 'Agro Products & Export/Import Crops List',
    prodHeaderSub: 'Manage crops and link them with primary trade categories',
    optAllCategories: 'All Agro Categories',
    optAllTradeTypes: 'All Trade Types (Export & Import)',
    optExport: '🚢 Export Products',
    optImport: '📦 Import Products',
    btnAddProduct: 'Add New Crop',
    thImage: 'Image',
    thProductName: 'Crop Name',
    thTradeType: 'Trade Type',
    thCategory: 'Agro Category',
    thSeason: 'Season',
    thPackaging: 'Packaging & Shipping',
    badgeExport: '🚢 Export',
    badgeImport: '📦 Import',

    // Website Content Section
    contentHeaderTitle: 'Full Website Content Management',
    contentHeaderSub: 'Complete control over Hero section, About Us, Vision, Leadership, Statistics, and Export Quality Chain',
    subtabHero: 'Home & Hero',
    subtabAbout: 'About & Vision',
    subtabBoard: 'Leadership & Board',
    subtabStats: 'Stats & Numbers',
    subtabValues: 'Values & Pillars',
    subtabFarms: 'Farms & Quality Chain',
    subtabProjects: 'Track Record & Projects',
    lblHeroBadgeAr: 'Top Promo Badge (Arabic)',
    lblHeroBadgeEn: 'Top Promo Badge (English)',
    lblHeroTitleAr: 'Main Hero Headline (Arabic)',
    lblHeroTitleEn: 'Main Hero Headline (English)',
    lblHeroSubAr: 'Hero Subtitle & Description (Arabic)',
    lblHeroSubEn: 'Hero Subtitle & Description (English)',
    lblHeroCtaCatalogAr: 'Catalog Button Text (Arabic)',
    lblHeroCtaCatalogEn: 'Catalog Button Text (English)',
    lblHeroCtaRfqAr: 'RFQ Button Text (Arabic)',
    lblHeroCtaRfqEn: 'RFQ Button Text (English)',
    lblHeroFloat1Ar: 'Floating Card 1 (Title & Sub in Arabic)',
    lblHeroFloat1En: 'Floating Card 1 (Title & Sub in English)',
    lblHeroFloat2Ar: 'Floating Card 2 (Title & Sub in Arabic)',
    lblHeroFloat2En: 'Floating Card 2 (Title & Sub in English)',
    lblHeroImage: 'Hero Background Media (Upload or URL)',
    lblHeroImageUpload: 'Upload New Image',
    btnSaveHero: 'Save Hero Section Changes',

    lblAboutTitleAr: 'About Section Title (Arabic)',
    lblAboutTitleEn: 'About Section Title (English)',
    lblAboutDescAr: 'Company Story & History (Arabic)',
    lblAboutDescEn: 'Company Story & History (English)',
    lblVisionTextAr: 'Vision Statement (Arabic)',
    lblVisionTextEn: 'Vision Statement (English)',
    lblMissionTextAr: 'Mission Statement (Arabic)',
    lblMissionTextEn: 'Mission Statement (English)',
    lblMgmtMsgAr: 'Management Message (Arabic)',
    lblMgmtMsgEn: 'Management Message (English)',
    lblMgmtSignAr: 'Management Signee & Role (Arabic)',
    lblMgmtSignEn: 'Management Signee & Role (English)',
    btnSaveAbout: 'Save About & Vision Changes',

    boardListTitle: 'Executive Board & Leadership Team',
    boardListSub: 'Manage corporate leaders, bios, executive roles, and member photos',
    btnAddBoardMember: 'Add Board Member',
    thBoardPhoto: 'Photo',
    thBoardName: 'Name & Honorific',
    thBoardRole: 'Executive Title',
    thBoardBio: 'Professional Bio',

    statsListTitle: 'Website Key Figures & Statistics',
    statsListSub: 'Manage numeric milestone cards including acreage, experience years, and export compliance',
    btnAddStat: 'Add Statistical Milestone',
    lblStatValue: 'Number or Metric Value *',
    lblStatLabelAr: 'Metric Description (Arabic) *',
    lblStatLabelEn: 'Metric Description (English) *',
    btnSaveStatItem: 'Save Milestone',

    valuesListTitle: 'Corporate Core Values & Principles',
    valuesListSub: 'Manage the core principles driving Green Gardens export excellence and integrity',
    btnAddValue: 'Add New Principle',
    lblValueNum: 'Sequence Number *',
    lblValueTitleAr: 'Principle Title (Arabic) *',
    lblValueTitleEn: 'Principle Title (English) *',
    lblValueDescAr: 'Principle Explanation (Arabic)',
    lblValueDescEn: 'Principle Explanation (English)',
    btnSaveValueItem: 'Save Principle',

    farmsHeaderSection: 'Farms & Agro-Investment Section',
    lblFarmsTitleAr: 'Farms Section Title (Arabic)',
    lblFarmsTitleEn: 'Farms Section Title (English)',
    lblFarmsDescAr: 'Farms & Irrigation Description (Arabic)',
    lblFarmsDescEn: 'Farms & Irrigation Description (English)',
    processHeaderSection: 'Quality Chain & Export Protocol',
    lblProcessTitleAr: 'Quality Chain Title (Arabic)',
    lblProcessTitleEn: 'Quality Chain Title (English)',
    lblProcessDescAr: 'Export Protocol Description (Arabic)',
    lblProcessDescEn: 'Export Protocol Description (English)',
    btnSaveFarms: 'Save Farms & Export Chain Changes',

    projectsListTitle: 'Mega Projects & Green Gardens Track Record',
    projectsListSub: 'Add, edit, delete projects and slide showcases, upload photos and update public landing page in real-time',
    btnAddProject: 'Add Track Record Project',
    thProjectImage: 'Project Slide / Photo',
    thProjectTitle: 'Project Title',
    thProjectEntity: 'Contracting Entity / Client',
    thProjectDesc: 'Scope & Description',

    // Inquiries Section
    inqHeaderTitle: 'Quotation Requests & Inquiries Inbox',
    thClient: 'Client / Company',
    thContact: 'Contact Channel',
    thCountry: 'Country',
    thProductQty: 'Product & Quantity',
    thStatus: 'Status',
    thAction: 'Action',

    // Invoices Section
    invHeaderTitle: 'International Export Invoices & Contracts',
    btnCreateInvoice: 'Create Export Invoice',
    thInvoiceNum: 'Invoice Number',
    thImporter: 'Importer / Client',
    thDestination: 'Destination Country',
    thTotalVal: 'Total Value',

    // Settings Section
    settingsHeader: 'General Company Settings',
    settingsSub: 'Configure company phones, WhatsApp, export emails, addresses and social media links',
    secContactTitle: 'Direct Contact & Numbers',
    lblCompanyPhone: 'Official Phone Number *',
    lblCompanyWhatsapp: 'Export WhatsApp Number *',
    lblCompanyEmail: 'Official Export Email *',
    secIdentityTitle: 'Company Identity & Bio',
    lblCompanyNameAr: 'Company Name (Arabic)',
    lblCompanyNameEn: 'Company Name (English)',
    lblCompanyAddressAr: 'Headquarters & Farms Address (Arabic)',
    lblCompanyAddressEn: 'Headquarters & Farms Address (English)',
    lblAboutSummary: 'About Company Summary',
    secSocialTitle: 'Social Media Channels',
    lblFacebook: 'Facebook Page URL',
    lblLinkedin: 'LinkedIn Profile URL',
    lblInstagram: 'Instagram Profile URL',
    lblYoutube: 'YouTube Channel URL',
    lblTiktok: 'TikTok Account URL',
    lblTwitter: 'X (Twitter) URL',
    btnSaveSettings: 'Save Changes to Database',

    // Common Buttons & Statuses
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    btnDetails: 'Details',
    btnPrint: 'Print Invoice',
    statusNew: 'New',
    statusContacted: 'Contacted',
    statusCompleted: 'Completed',
    statusPaid: 'Paid & Settled',
    statusPartiallyPaid: 'Partially Paid',
    statusPending: 'Pending Settlement',
    statusDraft: 'Draft',
    statusCancelled: 'Cancelled',
    lblInvStatus: 'Invoice Status',
    lblInvDueDate: 'Due Date',
    toastStatusUpdated: 'Invoice status updated successfully',
    toastDeleteConfirmInv: 'Are you sure you want to delete this invoice record?',
    unassignedCategory: 'Unassigned',
    unspecifiedQty: 'Unspecified Quantity',
    generalRequest: 'General Request',
    internationalClient: 'International Importer',
    globalDestination: 'Global',

    // Modals
    loginTitle: 'Admin Portal Login',
    loginSub: 'Green Gardens Agro-Export & Administration System',
    lblLoginUsername: 'Username or Email Address',
    lblLoginPassword: 'Password',
    btnLoginSubmit: 'Sign In to Dashboard',

    boardModalAddTitle: 'Add New Board Member',
    boardModalEditTitle: 'Edit Board Member Details',
    lblBoardNameAr: 'Name & Honorific (Arabic) *',
    lblBoardNameEn: 'Name & Honorific (English) *',
    lblBoardRoleAr: 'Executive Title (Arabic) *',
    lblBoardRoleEn: 'Executive Title (English) *',
    lblBoardBioAr: 'Professional Bio (Arabic)',
    lblBoardBioEn: 'Professional Bio (English)',
    lblBoardImage: 'Profile Photo (Upload or URL)',
    lblBoardImageUpload: 'Upload Photo',
    lblBoardOrder: 'Display Order',
    btnSaveBoardMember: 'Save Member to Database',

    statModalAddTitle: 'Add Statistical Milestone',
    statModalEditTitle: 'Edit Statistical Milestone',
    valueModalAddTitle: 'Add Core Principle',
    valueModalEditTitle: 'Edit Core Principle',

    projectModalAddTitle: 'Add New Track Record Project',
    projectModalEditTitle: 'Edit Project Details',
    lblProjectTitleAr: 'Project Title (Arabic) *',
    lblProjectTitleEn: 'Project Title (English)',
    lblProjectEntityAr: 'Contracting Entity (Arabic) *',
    lblProjectEntityEn: 'Contracting Entity (English)',
    lblProjectDescAr: 'Project Scope & Details (Arabic) *',
    lblProjectDescEn: 'Project Scope & Details (English)',
    lblProjectImageUrl: 'Image Path or URL',
    lblProjectImageUpload: 'Upload New Image from Device',
    lblProjectPreview: 'Selected Image Preview:',
    lblSortOrder: 'Display Order',
    btnCancel: 'Cancel',
    btnSaveProject: 'Save Project to Track Record',

    catModalAddTitle: 'Add New Agro Category',
    catModalEditTitle: 'Edit Agro Category',
    lblCatNameAr: 'Category Name (Arabic) *',
    lblCatNameEn: 'Category Name (English) *',
    lblCatSlug: 'Slug Identifier',
    lblCatIcon: 'Icon Symbol',
    lblCatSortOrder: 'Display Order',
    btnSaveCategory: 'Save Category to Database',

    prodModalAddTitle: 'Add New Crop / Product',
    prodModalEditTitle: 'Edit Crop / Commodity',
    lblProdTradeType: 'Commercial Trade Type (Export / Import) *',
    lblProdNameAr: 'Crop Name (Arabic) *',
    lblProdNameEn: 'Crop Name (English)',
    lblProdCategory: 'Agro Category *',
    lblProdTag: 'Featured Tag',
    lblProdVariety: 'Variety & Grade',
    lblProdSeason: 'Production & Export Season',
    lblProdPackaging: 'Packaging & Shipping Specifications',
    lblProdGalleryTitle: 'Product Image Gallery (Up to 5 High-Res Images)',
    lblProdGallerySub: 'Upload up to 5 photos. The first image with golden badge is the primary featured cover.',
    lblProdMultiUpload: '📁 Upload up to 5 images from device',
    lblProdAddUrl: 'Or Add Direct Image URL',
    lblProdAddUrlPlaceholder: 'Or paste direct image URL (assets/images/products/...jpg)',
    btnAddUrl: '＋ Add',
    badgePrimary: '★ Primary',
    btnSetPrimary: 'Set Primary',
    btnRemove: 'Remove',
    btnAddImage: 'Add Image',
    lblProdImageFile: 'Product Image (Upload File)',
    lblProdImageUrl: 'Or Direct Image URL',
    lblProdFeatured: 'Feature on Homepage as Premier Product',
    btnSaveDatabase: 'Save to Database',

    inqModalTitle: 'Quotation Request & Inquiry Details',
    lblInqName: 'Representative Name:',
    lblInqCompany: 'Company & Organization:',
    lblInqEmail: 'Email Address:',
    lblInqPhone: 'Phone / WhatsApp:',
    lblInqCountry: 'Importer Country:',
    lblInqProduct: 'Requested Product:',
    lblInqQuantity: 'Quantity:',
    lblInqShipping: 'Shipping Terms:',
    lblInqMessage: 'Message & Notes:',
    lblInqUpdateStatus: 'Update Follow-up Status',
    btnSaveStatus: 'Save Status',

    invModalTitle: 'Create New Export Invoice',
    lblInvClientName: 'Client / Importer Name *',
    lblInvCompany: 'Company Name',
    lblInvEmail: 'Email Address',
    lblInvDestination: 'Destination Country & Port',
    lblInvTotal: 'Total Amount *',
    lblInvCurrency: 'Currency',
    lblInvTerms: 'Payment & Incoterms',
    lblInvNotes: 'Additional Notes',
    btnIssueInvoice: 'Issue & Save Invoice',

    // Toasts & Alerts
    toastLoginSuccess: 'Login successful! Welcome to Green Gardens Control Panel.',
    toastLogoutSuccess: 'Logged out successfully.',
    toastLoginError: 'Invalid username or password.',
    toastSaveSuccess: 'Settings and data saved successfully!',
    toastDeleted: 'Item deleted successfully.',
    toastDeleteConfirmCat: 'Are you sure you want to delete this category? Products under it will be unassigned.',
    toastDeleteConfirmProd: 'Are you sure you want to delete this crop from the database?',
    toastDeleteConfirmBoard: 'Are you sure you want to delete this board member from the database?',
    toastDeleteConfirmStat: 'Are you sure you want to delete this statistical metric?',
    toastDeleteConfirmValue: 'Are you sure you want to delete this core value?',
    toastDeleteConfirmProject: 'Are you sure you want to delete this project from the track record?',
    toastImageUploading: 'Uploading image...',
    toastImageUploaded: 'Image uploaded successfully!',
    toastSavingSettings: 'Saving settings to database...',
    loadingCategories: 'Loading categories...',
    noCategoriesFound: 'No categories found. Click "Add New Category" to create one.',
    loadingProducts: 'Loading products from database...',
    noProductsFound: 'No products found under this selection. Click "Add New Crop" to add one.',
    loadingInquiries: 'Checking customer inquiries inbox...',
    noInquiriesFound: 'No quotation requests or messages received yet.',
    loadingInvoices: 'Loading export invoices log...',
    noInvoicesFound: 'No export invoices issued yet. Click "Create Export Invoice" to start.',
    loadingBoard: 'Loading board members...',
    noBoardFound: 'No board members registered yet. Click "Add Board Member" to start.',
    loadingProjects: 'Loading projects list...',
    noProjectsFound: 'No track record projects registered yet. Click "Add Track Record Project" to start.'
  }
};

// -----------------------------------------------------------------------------
// Initialization
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  initAdminLanguage();
  setupNavigation();
  setupContentSubTabs();
  setupAuthModal();
  setupCategoryModal();
  setupProductModal();
  setupBoardModal();
  setupStatModal();
  setupValueModal();
  setupProjectModal();
  setupInquiryModal();
  setupInvoiceModal();
  setupSettingsForm();
  setupContentForms();

  // Check initial authentication
  if (currentToken) {
    const valid = await verifyToken();
    if (valid) {
      initDashboard();
    } else {
      showLoginModal();
    }
  } else {
    showLoginModal();
  }
});

// -----------------------------------------------------------------------------
// Internationalization & Language Switcher
// -----------------------------------------------------------------------------
function initAdminLanguage() {
  const toggleBtn = document.getElementById('admLangToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const targetLang = currentAdminLang === 'ar' ? 'en' : 'ar';
      applyAdminLanguage(targetLang);
      populateCategorySelects();
      loadCategories();
      loadProducts();
      loadContentData();
      loadProjects();
      loadInquiries();
      loadInvoices();
    });
  }
  applyAdminLanguage(currentAdminLang);
}

function applyAdminLanguage(lang) {
  currentAdminLang = lang;
  localStorage.setItem('almasa_admin_lang', lang);
  const isRTL = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

  const t = ADMIN_I18N[lang] || ADMIN_I18N.ar;

  // Update Page Title
  if (document.getElementById('docTitle')) {
    document.getElementById('docTitle').textContent = t.docTitle;
  }

  // Update Header Button Flag & Text
  const flagEl = document.getElementById('admLangFlag');
  const textEl = document.getElementById('admLangText');
  if (flagEl) flagEl.innerHTML = t.flag;
  if (textEl) textEl.textContent = t.langBtnText;

  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Update static dropdown options
  updateDropdownsLanguage(lang);

  // Update user profile labels
  updateUserProfileUI();

  // Sync gallery slot card texts
  syncSlotCardsFromImages();
}

function updateDropdownsLanguage(lang) {
  const isEn = lang === 'en';

  const catIconSelect = document.getElementById('catIcon');
  if (catIconSelect) {
    catIconSelect.innerHTML = isEn ? `
      <option value="Apple">Fresh Fruits</option>
      <option value="Carrot">Fresh Vegetables</option>
      <option value="Snowflake">IQF Frozen Fruits & Veg</option>
      <option value="Sprout">Crops & Grains</option>
      <option value="Leaf">Herbs & Aromatic Plants</option>
    ` : `
      <option value="Apple">فواكه طازجة</option>
      <option value="Carrot">خضروات طازجة</option>
      <option value="Snowflake">فواكه وخضروات مجمدة</option>
      <option value="Sprout">محاصيل وحبوب زراعية</option>
      <option value="Leaf">أعشاب ونباتات عطرية</option>
    `;
  }

  const inqStatusSelect = document.getElementById('inqStatusSelect');
  if (inqStatusSelect) {
    const currentVal = inqStatusSelect.value || 'new';
    inqStatusSelect.innerHTML = isEn ? `
      <option value="new">New</option>
      <option value="contacted">Contacted & Responded</option>
      <option value="completed">Completed & Confirmed</option>
    ` : `
      <option value="new">جديد</option>
      <option value="contacted">تم التواصل والرد</option>
      <option value="completed">مكتمل ومؤكد</option>
    `;
    inqStatusSelect.value = currentVal;
  }

  const invCurrencySelect = document.getElementById('invCurrency');
  if (invCurrencySelect) {
    const currentVal = invCurrencySelect.value || 'USD';
    invCurrencySelect.innerHTML = isEn ? `
      <option value="USD">US Dollar (USD)</option>
      <option value="EUR">Euro (EUR)</option>
      <option value="EGP">Egyptian Pound (EGP)</option>
      <option value="SAR">Saudi Riyal (SAR)</option>
    ` : `
      <option value="USD">دولار أمريكي</option>
      <option value="EUR">يورو</option>
      <option value="EGP">جنيه مصري</option>
      <option value="SAR">ريال سعودي</option>
    `;
    invCurrencySelect.value = currentVal;
  }
}

// -----------------------------------------------------------------------------
// Toast Helper
// -----------------------------------------------------------------------------
function showToast(message, type = 'success') {
  const container = document.getElementById('admToastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `adm-toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// -----------------------------------------------------------------------------
// Authentication
// -----------------------------------------------------------------------------
async function verifyToken() {
  try {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      updateUserProfileUI();
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

function updateUserProfileUI() {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  if (currentUser) {
    const nameEl = document.getElementById('admUserName');
    const roleEl = document.getElementById('admUserRole');
    if (nameEl) nameEl.textContent = currentUser.fullName || currentUser.username;
    if (roleEl) roleEl.textContent = currentUser.role === 'super_admin' ? t.roleSuperAdmin : t.roleAdmin;
  }
}

function showLoginModal() {
  document.getElementById('loginModal').classList.add('active');
}

function hideLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

function setupAuthModal() {
  const form = document.getElementById('loginForm');
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errorEl = document.getElementById('loginError');
    errorEl.style.display = 'none';

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        currentToken = data.token;
        currentUser = data.user;
        localStorage.setItem('almasa_admin_token', currentToken);
        localStorage.setItem('almasa_admin_user', JSON.stringify(currentUser));
        updateUserProfileUI();
        hideLoginModal();
        showToast(t().toastLoginSuccess);
        initDashboard();
      } else {
        errorEl.textContent = data.message || t().toastLoginError;
        errorEl.style.display = 'block';
      }
    } catch (err) {
      errorEl.textContent = currentAdminLang === 'en' ? 'Unable to connect to server' : 'تعذر الاتصال بالسيرفر';
      errorEl.style.display = 'block';
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('almasa_admin_token');
    localStorage.removeItem('almasa_admin_user');
    currentToken = '';
    currentUser = null;
    showToast(t().toastLogoutSuccess);
    showLoginModal();
  });
}

// -----------------------------------------------------------------------------
// Navigation & Sections (With Full Mobile Drawer Support)
// -----------------------------------------------------------------------------
function setupNavigation() {
  const navItems = document.querySelectorAll('.adm-nav-item');
  const sidebar = document.querySelector('.adm-sidebar');
  const mobileToggle = document.getElementById('admMobileToggle');
  const overlay = document.getElementById('admSidebarOverlay');

  const closeSidebarMobile = () => {
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('active');
  };

  mobileToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar?.classList.toggle('mobile-open');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', closeSidebarMobile);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar?.classList.contains('mobile-open')) {
      closeSidebarMobile();
    }
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const targetSection = item.getAttribute('data-section');
      document.querySelectorAll('.adm-section').forEach(sec => sec.classList.remove('active'));
      const activeSec = document.getElementById(`sec-${targetSection}`);
      if (activeSec) activeSec.classList.add('active');

      // Automatically dismiss sidebar drawer on mobile
      if (window.innerWidth <= 900) {
        closeSidebarMobile();
      }

      // Refresh section content
      if (targetSection === 'products') loadProducts();
      if (targetSection === 'categories') loadCategories();
      if (targetSection === 'content') loadContentData();
      if (targetSection === 'inquiries') loadInquiries();
      if (targetSection === 'invoices') loadInvoices();
      if (targetSection === 'settings') loadSettings();
      if (targetSection === 'overview') loadStats();
    });
  });
}

function setupContentSubTabs() {
  const tabBtns = document.querySelectorAll('.adm-subtab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetSub = btn.getAttribute('data-subtab');
      document.querySelectorAll('.adm-content-subpanel').forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`subpanel-${targetSub}`);
      if (activePanel) activePanel.classList.add('active');

      if (targetSub === 'projects') loadProjects();
    });
  });
}

async function initDashboard() {
  await loadCategories();
  loadStats();
  loadProducts();
  loadContentData();
  loadProjects();
  loadInquiries();
  loadInvoices();
  loadSettings();
}

// -----------------------------------------------------------------------------
// Overview Stats
// -----------------------------------------------------------------------------
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('statTotalProducts').textContent = data.stats.totalProducts;
      document.getElementById('statTotalInquiries').textContent = data.stats.totalInquiries;
      document.getElementById('statNewInquiries').textContent = data.stats.newInquiries;
      document.getElementById('statTotalInvoices').textContent = data.stats.totalInvoices;
      
      const badge = document.getElementById('inquiryNavBadge');
      if (data.stats.newInquiries > 0) {
        badge.textContent = data.stats.newInquiries;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (err) {
    console.warn('Failed to load stats:', err);
  }
}

// -----------------------------------------------------------------------------
// Categories Manager (CRUD & Linking)
// -----------------------------------------------------------------------------
async function loadCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  const isEn = currentAdminLang === 'en';

  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--adm-text-muted);">${t.loadingCategories}</td></tr>`;
  }

  try {
    const res = await fetch(`${API_BASE}/categories`);
    const data = await res.json();
    if (data.success) {
      categoriesCache = data.data;
      populateCategorySelects();

      if (tbody) {
        if (categoriesCache.length > 0) {
          tbody.innerHTML = categoriesCache.map((c) => `
            <tr>
              <td><strong>#${c.id}</strong></td>
              <td><strong>${c.name_ar}</strong></td>
              <td><span style="color:var(--adm-gold-light); font-weight:600;">${c.name_en || ''}</span></td>
              <td><code>${c.slug}</code></td>
              <td><span class="adm-status-badge contacted">${getIconLabel(c.icon, isEn)}</span></td>
              <td>
                <div class="adm-action-btns">
                  <button class="adm-action-btn" onclick="editCategory(${c.id})">${t.btnEdit}</button>
                  <button class="adm-action-btn delete" onclick="deleteCategory(${c.id})">${t.btnDelete}</button>
                </div>
              </td>
            </tr>
          `).join('');
        } else {
          tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px;">${t.noCategoriesFound}</td></tr>`;
        }
      }
    }
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--adm-red);">${isEn ? 'Error loading categories' : 'حدث خطأ أثناء تحميل الأقسام'}</td></tr>`;
  }
}

function getIconLabel(icon, isEn) {
  const iconMap = {
    Apple: isEn ? 'Fruits' : 'فواكه',
    Carrot: isEn ? 'Vegetables' : 'خضروات',
    Snowflake: isEn ? 'IQF Frozen' : 'مجمدات',
    Sprout: isEn ? 'Crops & Grains' : 'محاصيل وحبوب',
    Leaf: isEn ? 'Herbs & Plants' : 'نباتات وأعشاب'
  };
  return iconMap[icon] || icon || (isEn ? 'General' : 'عام');
}

function populateCategorySelects() {
  const select = document.getElementById('prodCategory');
  const filterSelect = document.getElementById('prodCategoryFilter');
  const isEn = currentAdminLang === 'en';
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (select) {
    select.innerHTML = categoriesCache.map(c => `
      <option value="${c.id}">${isEn ? (c.name_en || c.name_ar) : c.name_ar}</option>
    `).join('');
  }

  if (filterSelect) {
    const currentVal = filterSelect.value;
    filterSelect.innerHTML = `<option value="">${t.optAllCategories}</option>` +
      categoriesCache.map(c => `<option value="${c.id}" ${currentVal == c.id ? 'selected' : ''}>${isEn ? (c.name_en || c.name_ar) : c.name_ar}</option>`).join('');
  }
}

function setupCategoryModal() {
  const modal = document.getElementById('categoryModal');
  const openBtn = document.getElementById('openAddCategoryBtn');
  const closeBtn = document.getElementById('closeCategoryModal');
  const form = document.getElementById('categoryForm');
  const filterSelect = document.getElementById('prodCategoryFilter');
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('catId').value = '';
      document.getElementById('categoryModalTitle').textContent = t().catModalAddTitle;
      modal.classList.add('active');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('catId').value;
      const body = {
        name_ar: document.getElementById('catNameAr').value.trim(),
        name_en: document.getElementById('catNameEn').value.trim(),
        slug: document.getElementById('catSlug').value.trim() || undefined,
        icon: document.getElementById('catIcon').value,
        sort_order: parseInt(document.getElementById('catSortOrder').value) || 0
      };

      try {
        const url = id ? `${API_BASE}/categories/${id}` : `${API_BASE}/categories`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          showToast(t().toastSaveSuccess);
          modal.classList.remove('active');
          await loadCategories();
          loadProducts();
        } else {
          showToast(data.message || (currentAdminLang === 'en' ? 'Error saving category' : 'خطأ في حفظ القسم'), 'error');
        }
      } catch (err) {
        showToast(currentAdminLang === 'en' ? 'Failed to save category' : 'تعذر حفظ القسم', 'error');
      }
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      loadProducts(filterSelect.value);
    });
  }
}

window.editCategory = function(id) {
  const cat = categoriesCache.find(c => c.id == id);
  if (!cat) return;
  const modal = document.getElementById('categoryModal');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  document.getElementById('catId').value = cat.id;
  document.getElementById('catNameAr').value = cat.name_ar;
  document.getElementById('catNameEn').value = cat.name_en || '';
  document.getElementById('catSlug').value = cat.slug || '';
  document.getElementById('catIcon').value = cat.icon || 'Leaf';
  document.getElementById('catSortOrder').value = cat.sort_order || 0;
  document.getElementById('categoryModalTitle').textContent = t.catModalEditTitle;
  modal.classList.add('active');
};

window.deleteCategory = async function(id) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  if (!confirm(t.toastDeleteConfirmCat)) return;

  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(t.toastDeleted);
      await loadCategories();
      loadProducts();
    }
  } catch (err) {
    showToast(currentAdminLang === 'en' ? 'Failed to delete category' : 'تعذر حذف القسم', 'error');
  }
};

// -----------------------------------------------------------------------------
// Products Manager (CRUD & Category Linking & Trade Type: Export/Import)
// -----------------------------------------------------------------------------
async function loadProducts(categoryId = '', tradeType = '') {
  const tbody = document.getElementById('productsTableBody');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  const isEn = currentAdminLang === 'en';
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--adm-text-muted);">${t.loadingProducts}</td></tr>`;

  const catVal = categoryId !== '' ? categoryId : (document.getElementById('prodCategoryFilter')?.value || '');
  const tradeVal = tradeType !== '' ? tradeType : (document.getElementById('prodTradeFilter')?.value || '');

  try {
    const params = new URLSearchParams();
    if (catVal) params.append('category', catVal);
    if (tradeVal) params.append('trade_type', tradeVal);
    const query = params.toString() ? `?${params.toString()}` : '';

    const url = `${API_BASE}/products${query}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(p => {
        const prodName = isEn ? (p.name_en || p.name_ar) : p.name_ar;
        const catName = isEn ? (p.category_name_en || p.category_name_ar || t.unassignedCategory) : (p.category_name_ar || t.unassignedCategory);
        const season = isEn ? (p.season_en || p.season_ar || 'Seasonal') : (p.season_ar || 'موسمي');
        const packaging = isEn ? (p.packaging_en || p.packaging_ar || 'Standard Carton') : (p.packaging_ar || 'كرتون قياسي');
        const isImport = (p.trade_type === 'import' || p.tradeType === 'import');
        const tradeBadge = isImport 
          ? `<span class="adm-status-badge pending" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-weight: 700;">${t.badgeImport}</span>`
          : `<span class="adm-status-badge completed" style="background: rgba(212, 175, 55, 0.15); color: #d4af37; border: 1px solid rgba(212, 175, 55, 0.3); font-weight: 700;">${t.badgeExport}</span>`;

        const imgCount = (p.images && Array.isArray(p.images) && p.images.length > 0) ? p.images.length : 1;
        const countBadge = imgCount > 1 ? `<span class="adm-table-multi-pill">📷 ${imgCount}</span>` : '';
        const mainImgUrl = (p.images && p.images[0]) || p.image_url || 'assets/images/oranges.jpg';
        const cleanImgSrc = mainImgUrl.startsWith('/') ? mainImgUrl.slice(1) : mainImgUrl;

        return `
          <tr>
            <td>
              <div class="adm-table-image-cell">
                <img src="/${cleanImgSrc}" class="adm-table-img" alt="${prodName}">
                ${countBadge}
              </div>
            </td>
            <td>
              <strong>${prodName}</strong>
            </td>
            <td>${tradeBadge}</td>
            <td><span class="adm-status-badge contacted">${catName}</span></td>
            <td>${season}</td>
            <td>${packaging}</td>
            <td>
              <div class="adm-action-btns">
                <button class="adm-action-btn" onclick="editProduct(${p.id})">${t.btnEdit}</button>
                <button class="adm-action-btn delete" onclick="deleteProduct(${p.id})">${t.btnDelete}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px;">${t.noProductsFound}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--adm-red);">${isEn ? 'Error loading products' : 'حدث خطأ أثناء تحميل المنتجات'}</td></tr>`;
  }
}

// -----------------------------------------------------------------------------
// 5-Image Gallery Manager State & Functions
// -----------------------------------------------------------------------------
let currentProductImages = [];

function syncSlotCardsFromImages() {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  const countBadge = document.getElementById('galleryCountBadge');
  const isEn = currentAdminLang === 'en';
  
  // Clean array
  currentProductImages = currentProductImages.filter(Boolean).slice(0, 5);
  const total = currentProductImages.length;
  if (countBadge) {
    countBadge.textContent = `${total} / 5 ${isEn ? 'Images' : 'صور'}`;
  }

  // Update batch upload button & placeholder text
  const batchBtnText = document.getElementById('batchUploadBtnText');
  if (batchBtnText) batchBtnText.textContent = isEn ? '📁 Upload up to 5 images from device' : '📁 رفع حتى 5 صور دفعة واحدة من جهازك';

  const addUrlInput = document.getElementById('prodAddImageUrlInput');
  if (addUrlInput) addUrlInput.placeholder = isEn ? 'Or paste direct image URL (assets/images/products/...jpg)' : 'أو اكتب رابط الصورة (assets/images/products/...jpg)';

  const addUrlBtnSpan = document.querySelector('#btnAddImageUrlBtn span');
  if (addUrlBtnSpan) addUrlBtnSpan.textContent = isEn ? '＋ Add' : '＋ إضافة رابط';

  for (let i = 0; i < 5; i++) {
    const card = document.getElementById(`slotCard_${i}`);
    const preview = document.getElementById(`slotPreview_${i}`);
    const pill = document.getElementById(`slotPill_${i}`);
    const uploadBtn = document.getElementById(`slotUploadBtn_${i}`);
    const urlInput = document.getElementById(`slotUrl_${i}`);
    const delBtn = document.getElementById(`slotDelBtn_${i}`);
    const mainBtn = document.getElementById(`slotMainBtn_${i}`);

    if (!card || !preview) continue;

    // Update Pill label text
    if (pill) {
      if (i === 0) {
        pill.textContent = isEn ? '★ Image 1 (Cover)' : '★ الصورة 1 (الرئيسية)';
      } else {
        pill.textContent = isEn ? `Image ${i + 1} (Gallery)` : `الصورة ${i + 1} (إضافية)`;
      }
    }

    // Update Upload button text
    if (uploadBtn) {
      uploadBtn.textContent = isEn ? 'Upload File' : 'رفع من الجهاز';
    }

    // Update Make Main button text
    if (mainBtn) {
      mainBtn.textContent = isEn ? 'Set Cover ⭐' : 'رئيسية ⭐';
    }

    // Update Delete button text
    if (delBtn) {
      delBtn.textContent = isEn ? 'Delete ✕' : 'حذف ✕';
    }

    if (i < currentProductImages.length) {
      const imgUrl = currentProductImages[i];
      const cleanSrc = imgUrl.startsWith('/') ? imgUrl.slice(1) : imgUrl;
      card.classList.add('has-image');
      preview.innerHTML = `<img src="/${cleanSrc}" class="adm-slot-img" alt="Product Image ${i + 1}" onerror="this.src='/${cleanSrc}'">`;
      if (urlInput) urlInput.value = imgUrl;
      if (delBtn) delBtn.style.display = 'inline-flex';
      if (mainBtn && i > 0) mainBtn.style.display = 'inline-flex';
    } else {
      card.classList.remove('has-image');
      const placeholderText = i === 0 
        ? (isEn ? '+ Upload Primary Cover' : '+ رفع الصورة الرئيسية')
        : (isEn ? `+ Upload Image ${i + 1}` : `+ رفع صورة ${i + 1}`);
      preview.innerHTML = `
        <div class="adm-slot-placeholder">
          <span class="adm-slot-icon">📷</span>
          <span class="adm-slot-text" id="slotText_${i}">${placeholderText}</span>
        </div>
      `;
      if (urlInput) urlInput.value = '';
      if (delBtn) delBtn.style.display = 'none';
      if (mainBtn) mainBtn.style.display = 'none';
    }
  }

  // Sync hidden main image input
  const hiddenInput = document.getElementById('prodImageUrl');
  if (hiddenInput) {
    hiddenInput.value = currentProductImages[0] || '';
  }
}

function renderProductGallerySlots() {
  syncSlotCardsFromImages();
}

window.triggerSlotUpload = function(idx) {
  const fileInput = document.getElementById(`slotFile_${idx}`);
  if (fileInput) fileInput.click();
};

window.handleSingleSlotUpload = async function(idx, input) {
  const file = input.files && input.files[0];
  if (!file) return;

  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  const formData = new FormData();
  formData.append('file', file);

  try {
    showToast(t.toastImageUploading || 'جاري رفع الصورة...');
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` },
      body: formData
    });
    const data = await res.json();
    if (data.success && data.fileUrl) {
      if (idx < currentProductImages.length) {
        currentProductImages[idx] = data.fileUrl;
      } else {
        currentProductImages.push(data.fileUrl);
      }
      syncSlotCardsFromImages();
      showToast(t.toastImageUploaded || 'تم رفع الصورة بنجاح!');
    } else {
      showToast(data.message || (currentAdminLang === 'en' ? 'Upload failed' : 'فشل رفع الصورة'), 'error');
    }
  } catch (err) {
    showToast(currentAdminLang === 'en' ? 'Upload failed' : 'فشل رفع الصورة', 'error');
  }
  input.value = '';
};

window.makeSlotImagePrimary = function(index) {
  if (index > 0 && index < currentProductImages.length) {
    const item = currentProductImages.splice(index, 1)[0];
    currentProductImages.unshift(item);
    syncSlotCardsFromImages();
  }
};

window.removeSlotImage = function(index) {
  if (index >= 0 && index < currentProductImages.length) {
    currentProductImages.splice(index, 1);
    syncSlotCardsFromImages();
  }
};

window.makeGalleryImagePrimary = window.makeSlotImagePrimary;
window.removeGalleryImage = window.removeSlotImage;
window.triggerMultiUpload = function() {
  document.getElementById('prodMultiImagesFile')?.click();
};

function setupProductModal() {
  const modal = document.getElementById('productModal');
  const openBtn = document.getElementById('openAddProductBtn');
  const closeBtn = document.getElementById('closeProductModal');
  const form = document.getElementById('productForm');
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  const catFilter = document.getElementById('prodCategoryFilter');
  const tradeFilter = document.getElementById('prodTradeFilter');

  if (catFilter) {
    catFilter.addEventListener('change', () => loadProducts(catFilter.value, tradeFilter?.value || ''));
  }
  if (tradeFilter) {
    tradeFilter.addEventListener('change', () => loadProducts(catFilter?.value || '', tradeFilter.value));
  }

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('prodId').value = '';
      if (document.getElementById('prodTradeType')) {
        document.getElementById('prodTradeType').value = tradeFilter?.value || 'export';
      }
      currentProductImages = [];
      syncSlotCardsFromImages();
      document.getElementById('productModalTitle').textContent = t().prodModalAddTitle;
      modal.classList.add('active');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  // Multi-Image Batch Upload File Input
  const multiInput = document.getElementById('prodMultiImagesFile');
  if (multiInput) {
    multiInput.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      if (!files || files.length === 0) return;

      const remainingSlots = 5 - currentProductImages.length;
      if (remainingSlots <= 0) {
        showToast(currentAdminLang === 'en' ? 'Maximum 5 images allowed per product' : 'الحد الأقصى هو 5 صور لكل محصول', 'error');
        multiInput.value = '';
        return;
      }

      const filesToUpload = files.slice(0, remainingSlots);
      if (files.length > remainingSlots) {
        showToast(currentAdminLang === 'en' ? `Only ${remainingSlots} images were uploaded (limit is 5)` : `تم رفع أول ${remainingSlots} صور فقط (الحد الأقصى 5 صور)`, 'warning');
      }

      const formData = new FormData();
      filesToUpload.forEach(f => formData.append('files', f));

      try {
        showToast(t().toastImageUploading || 'جاري رفع الصور...');
        const res = await fetch(`${API_BASE}/upload-multiple`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${currentToken}` },
          body: formData
        });
        const data = await res.json();
        if (data.success && data.fileUrls) {
          data.fileUrls.forEach(url => {
            if (currentProductImages.length < 5) currentProductImages.push(url);
          });
          syncSlotCardsFromImages();
          showToast(t().toastImageUploaded || 'تم رفع الصور بنجاح!');
        } else {
          // Fallback single upload
          for (const file of filesToUpload) {
            if (currentProductImages.length < 5) {
              const fd = new FormData();
              fd.append('file', file);
              const r = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentToken}` },
                body: fd
              });
              const d = await r.json();
              if (d.success && d.fileUrl) {
                currentProductImages.push(d.fileUrl);
              }
            }
          }
          syncSlotCardsFromImages();
          showToast(t().toastImageUploaded || 'تم رفع الصور بنجاح!');
        }
      } catch (err) {
        for (const file of filesToUpload) {
          if (currentProductImages.length < 5) {
            const fd = new FormData();
            fd.append('file', file);
            try {
              const r = await fetch(`${API_BASE}/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${currentToken}` },
                body: fd
              });
              const d = await r.json();
              if (d.success && d.fileUrl) {
                currentProductImages.push(d.fileUrl);
              }
            } catch (singleErr) {}
          }
        }
        syncSlotCardsFromImages();
        showToast(t().toastImageUploaded || 'تم رفع الصور بنجاح!');
      }
      multiInput.value = '';
    });
  }

  // Add Direct Image URL Button
  const addUrlBtn = document.getElementById('btnAddImageUrlBtn');
  const addUrlInput = document.getElementById('prodAddImageUrlInput');
  if (addUrlBtn && addUrlInput) {
    addUrlBtn.addEventListener('click', () => {
      const url = addUrlInput.value.trim();
      if (!url) return;
      if (currentProductImages.length >= 5) {
        showToast(currentAdminLang === 'en' ? 'Maximum 5 images allowed per product' : 'الحد الأقصى هو 5 صور لكل محصول', 'error');
        return;
      }
      currentProductImages.push(url);
      addUrlInput.value = '';
      syncSlotCardsFromImages();
    });
    addUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addUrlBtn.click();
      }
    });
  }

  // Save Product (Create or Update)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('prodId').value;
      const finalImages = currentProductImages.slice(0, 5);
      const primaryUrl = finalImages[0] || document.getElementById('prodImageUrl')?.value.trim() || 'assets/images/oranges.jpg';

      const body = {
        name_ar: document.getElementById('prodNameAr').value.trim(),
        name_en: document.getElementById('prodNameEn').value.trim(),
        trade_type: document.getElementById('prodTradeType')?.value || 'export',
        category_id: document.getElementById('prodCategory').value,
        tag_ar: document.getElementById('prodTagAr').value.trim(),
        variety_ar: document.getElementById('prodVarietyAr').value.trim(),
        season_ar: document.getElementById('prodSeasonAr').value.trim(),
        packaging_ar: document.getElementById('prodPackagingAr').value.trim(),
        image_url: primaryUrl,
        images: finalImages.length > 0 ? finalImages : [primaryUrl],
        is_featured: document.getElementById('prodFeatured').checked ? 1 : 0
      };

      try {
        const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          showToast(t().toastSaveSuccess);
          modal.classList.remove('active');
          const filterCat = document.getElementById('prodCategoryFilter')?.value || '';
          const filterTrade = document.getElementById('prodTradeFilter')?.value || '';
          loadProducts(filterCat, filterTrade);
          loadStats();
        } else {
          showToast(data.message || (currentAdminLang === 'en' ? 'Error saving product' : 'حدث خطأ أثناء الحفظ'), 'error');
        }
      } catch (err) {
        showToast(currentAdminLang === 'en' ? 'Failed to save product' : 'تعذر حفظ المنتج', 'error');
      }
    });
  }
}

window.editProduct = async function(id) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    const data = await res.json();
    if (data.success && data.data) {
      const p = data.data;
      const modal = document.getElementById('productModal');
      document.getElementById('prodId').value = p.id;
      document.getElementById('prodNameAr').value = p.name_ar || '';
      document.getElementById('prodNameEn').value = p.name_en || '';
      if (document.getElementById('prodTradeType')) {
        document.getElementById('prodTradeType').value = p.trade_type || 'export';
      }
      document.getElementById('prodCategory').value = p.category_id || (categoriesCache[0] ? categoriesCache[0].id : 1);
      document.getElementById('prodTagAr').value = p.tag_ar || '';
      document.getElementById('prodVarietyAr').value = p.variety_ar || '';
      document.getElementById('prodSeasonAr').value = p.season_ar || '';
      document.getElementById('prodPackagingAr').value = p.packaging_ar || '';
      document.getElementById('prodFeatured').checked = p.is_featured == 1;

      // Extract up to 5 images
      if (Array.isArray(p.images) && p.images.length > 0) {
        currentProductImages = p.images.filter(Boolean).slice(0, 5);
      } else if (p.image_url) {
        currentProductImages = [p.image_url];
      } else if (p.image) {
        currentProductImages = [p.image];
      } else {
        currentProductImages = [];
      }
      syncSlotCardsFromImages();
      
      const displayName = currentAdminLang === 'en' ? (p.name_en || p.name_ar) : p.name_ar;
      document.getElementById('productModalTitle').textContent = `${t.prodModalEditTitle}: ${displayName}`;
      modal.classList.add('active');
    }
  } catch (err) {
    showToast(currentAdminLang === 'en' ? 'Failed to load product details' : 'تعذر جلب تفاصيل المنتج للتعديل', 'error');
  }
};

window.deleteProduct = async function(id) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  if (!confirm(t.toastDeleteConfirmProd)) return;
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(t.toastDeleted);
      loadProducts();
      loadStats();
    }
  } catch (err) {
    showToast(currentAdminLang === 'en' ? 'Failed to delete product' : 'تعذر حذف المنتج', 'error');
  }
};

// -----------------------------------------------------------------------------
// 10. Website Content Management Controllers (Hero, About, Board, Stats, Values, Farms)
// -----------------------------------------------------------------------------
async function loadContentData() {
  try {
    const res = await fetch(`${API_BASE}/content`);
    const data = await res.json();
    if (data.success && data.data) {
      const c = data.data;

      // Hero Section
      if (c.hero) {
        if (document.getElementById('heroBadgeAr')) document.getElementById('heroBadgeAr').value = c.hero.badge_ar || '';
        if (document.getElementById('heroBadgeEn')) document.getElementById('heroBadgeEn').value = c.hero.badge_en || '';
        if (document.getElementById('heroTitleAr')) document.getElementById('heroTitleAr').value = c.hero.title_ar || '';
        if (document.getElementById('heroTitleEn')) document.getElementById('heroTitleEn').value = c.hero.title_en || '';
        if (document.getElementById('heroSubAr')) document.getElementById('heroSubAr').value = c.hero.subtitle_ar || '';
        if (document.getElementById('heroSubEn')) document.getElementById('heroSubEn').value = c.hero.subtitle_en || '';
        if (document.getElementById('heroCtaCatalogAr')) document.getElementById('heroCtaCatalogAr').value = c.hero.cta_catalog_ar || '';
        if (document.getElementById('heroCtaCatalogEn')) document.getElementById('heroCtaCatalogEn').value = c.hero.cta_catalog_en || '';
        if (document.getElementById('heroCtaRfqAr')) document.getElementById('heroCtaRfqAr').value = c.hero.cta_rfq_ar || '';
        if (document.getElementById('heroCtaRfqEn')) document.getElementById('heroCtaRfqEn').value = c.hero.cta_rfq_en || '';
        if (document.getElementById('heroFloat1TitleAr')) document.getElementById('heroFloat1TitleAr').value = c.hero.float1_title_ar || '';
        if (document.getElementById('heroFloat1SubAr')) document.getElementById('heroFloat1SubAr').value = c.hero.float1_sub_ar || '';
        if (document.getElementById('heroFloat1TitleEn')) document.getElementById('heroFloat1TitleEn').value = c.hero.float1_title_en || '';
        if (document.getElementById('heroFloat1SubEn')) document.getElementById('heroFloat1SubEn').value = c.hero.float1_sub_en || '';
        if (document.getElementById('heroFloat2TitleAr')) document.getElementById('heroFloat2TitleAr').value = c.hero.float2_title_ar || '';
        if (document.getElementById('heroFloat2SubAr')) document.getElementById('heroFloat2SubAr').value = c.hero.float2_sub_ar || '';
        if (document.getElementById('heroFloat2TitleEn')) document.getElementById('heroFloat2TitleEn').value = c.hero.float2_title_en || '';
        if (document.getElementById('heroFloat2SubEn')) document.getElementById('heroFloat2SubEn').value = c.hero.float2_sub_en || '';
        if (document.getElementById('heroImageUrl')) document.getElementById('heroImageUrl').value = c.hero.image_url || '';
      }

      // About Section
      if (c.about) {
        if (document.getElementById('aboutTitleAr')) document.getElementById('aboutTitleAr').value = c.about.title_ar || '';
        if (document.getElementById('aboutTitleEn')) document.getElementById('aboutTitleEn').value = c.about.title_en || '';
        if (document.getElementById('aboutDescAr')) document.getElementById('aboutDescAr').value = c.about.desc_ar || '';
        if (document.getElementById('aboutDescEn')) document.getElementById('aboutDescEn').value = c.about.desc_en || '';
        if (document.getElementById('aboutVisionAr')) document.getElementById('aboutVisionAr').value = c.about.vision_text_ar || '';
        if (document.getElementById('aboutVisionEn')) document.getElementById('aboutVisionEn').value = c.about.vision_text_en || '';
        if (document.getElementById('aboutMissionAr')) document.getElementById('aboutMissionAr').value = c.about.mission_text_ar || '';
        if (document.getElementById('aboutMissionEn')) document.getElementById('aboutMissionEn').value = c.about.mission_text_en || '';
        if (document.getElementById('aboutMsgAr')) document.getElementById('aboutMsgAr').value = c.about.msg_text_ar || '';
        if (document.getElementById('aboutMsgEn')) document.getElementById('aboutMsgEn').value = c.about.msg_text_en || '';
        if (document.getElementById('aboutSignAr')) document.getElementById('aboutSignAr').value = c.about.sign_ar || '';
        if (document.getElementById('aboutSignEn')) document.getElementById('aboutSignEn').value = c.about.sign_en || '';
      }

      // Farms & Process
      if (c.farms) {
        if (document.getElementById('farmsTitleAr')) document.getElementById('farmsTitleAr').value = c.farms.title_ar || '';
        if (document.getElementById('farmsTitleEn')) document.getElementById('farmsTitleEn').value = c.farms.title_en || '';
        if (document.getElementById('farmsDescAr')) document.getElementById('farmsDescAr').value = c.farms.desc_ar || '';
        if (document.getElementById('farmsDescEn')) document.getElementById('farmsDescEn').value = c.farms.desc_en || '';
      }
      if (c.process) {
        if (document.getElementById('processTitleAr')) document.getElementById('processTitleAr').value = c.process.title_ar || '';
        if (document.getElementById('processTitleEn')) document.getElementById('processTitleEn').value = c.process.title_en || '';
        if (document.getElementById('processDescAr')) document.getElementById('processDescAr').value = c.process.desc_ar || '';
        if (document.getElementById('processDescEn')) document.getElementById('processDescEn').value = c.process.desc_en || '';
      }

      // Board Members
      boardCache = c.board || [];
      renderBoardTable();

      // Stats Items
      statsItemsCache = c.stats || [];
      renderStatsItems();

      // Values Items
      valuesItemsCache = c.values || [];
      renderValuesItems();

      // Projects (Green Gardens Track Record)
      if (c.projects && Array.isArray(c.projects)) {
        projectsCache = c.projects;
        renderProjectsTable();
      }
    }
  } catch (err) {
    console.warn('Failed to load website content:', err);
  }
}

function setupContentForms() {
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  // Hero form
  const heroForm = document.getElementById('heroContentForm');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const heroData = {
        badge_ar: document.getElementById('heroBadgeAr').value.trim(),
        badge_en: document.getElementById('heroBadgeEn').value.trim(),
        title_ar: document.getElementById('heroTitleAr').value.trim(),
        title_en: document.getElementById('heroTitleEn').value.trim(),
        subtitle_ar: document.getElementById('heroSubAr').value.trim(),
        subtitle_en: document.getElementById('heroSubEn').value.trim(),
        cta_catalog_ar: document.getElementById('heroCtaCatalogAr').value.trim(),
        cta_catalog_en: document.getElementById('heroCtaCatalogEn').value.trim(),
        cta_rfq_ar: document.getElementById('heroCtaRfqAr').value.trim(),
        cta_rfq_en: document.getElementById('heroCtaRfqEn').value.trim(),
        float1_title_ar: document.getElementById('heroFloat1TitleAr').value.trim(),
        float1_sub_ar: document.getElementById('heroFloat1SubAr').value.trim(),
        float1_title_en: document.getElementById('heroFloat1TitleEn').value.trim(),
        float1_sub_en: document.getElementById('heroFloat1SubEn').value.trim(),
        float2_title_ar: document.getElementById('heroFloat2TitleAr').value.trim(),
        float2_sub_ar: document.getElementById('heroFloat2SubAr').value.trim(),
        float2_title_en: document.getElementById('heroFloat2TitleEn').value.trim(),
        float2_sub_en: document.getElementById('heroFloat2SubEn').value.trim(),
        image_url: document.getElementById('heroImageUrl').value.trim() || 'assets/images/hero.jpg'
      };
      await saveContentSection('hero', heroData);
    });

    // Hero image upload
    document.getElementById('heroImageFile')?.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = await uploadImageFile(file);
      if (url) document.getElementById('heroImageUrl').value = url;
    });
  }

  // About form
  const aboutForm = document.getElementById('aboutContentForm');
  if (aboutForm) {
    aboutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const aboutData = {
        title_ar: document.getElementById('aboutTitleAr').value.trim(),
        title_en: document.getElementById('aboutTitleEn').value.trim(),
        desc_ar: document.getElementById('aboutDescAr').value.trim(),
        desc_en: document.getElementById('aboutDescEn').value.trim(),
        vision_text_ar: document.getElementById('aboutVisionAr').value.trim(),
        vision_text_en: document.getElementById('aboutVisionEn').value.trim(),
        mission_text_ar: document.getElementById('aboutMissionAr').value.trim(),
        mission_text_en: document.getElementById('aboutMissionEn').value.trim(),
        msg_text_ar: document.getElementById('aboutMsgAr').value.trim(),
        msg_text_en: document.getElementById('aboutMsgEn').value.trim(),
        sign_ar: document.getElementById('aboutSignAr').value.trim(),
        sign_en: document.getElementById('aboutSignEn').value.trim()
      };
      await saveContentSection('about', aboutData);
    });
  }

  // Farms form
  const farmsForm = document.getElementById('farmsContentForm');
  if (farmsForm) {
    farmsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const farmsData = {
        title_ar: document.getElementById('farmsTitleAr').value.trim(),
        title_en: document.getElementById('farmsTitleEn').value.trim(),
        desc_ar: document.getElementById('farmsDescAr').value.trim(),
        desc_en: document.getElementById('farmsDescEn').value.trim()
      };
      const processData = {
        title_ar: document.getElementById('processTitleAr').value.trim(),
        title_en: document.getElementById('processTitleEn').value.trim(),
        desc_ar: document.getElementById('processDescAr').value.trim(),
        desc_en: document.getElementById('processDescEn').value.trim()
      };
      await saveContentSection('farms', farmsData);
      await saveContentSection('process', processData);
    });
  }
}

async function saveContentSection(section_key, section_data) {
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  try {
    showToast(t().toastSavingSettings);
    const res = await fetch(`${API_BASE}/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ section_key, section_data })
    });
    const data = await res.json();
    if (data.success) {
      showToast(t().toastSaveSuccess);
    } else {
      showToast(data.message || 'Error', 'error');
    }
  } catch (err) {
    showToast(currentAdminLang === 'en' ? 'Server connection error' : 'تعذر الاتصال بالسيرفر', 'error');
  }
}

async function uploadImageFile(file) {
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  const formData = new FormData();
  formData.append('file', file);
  try {
    showToast(t().toastImageUploading);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      showToast(t().toastImageUploaded);
      return data.fileUrl;
    }
    showToast(data.message || 'Upload error', 'error');
    return null;
  } catch (err) {
    showToast('Upload error', 'error');
    return null;
  }
}

// -----------------------------------------------------------------------------
// Board Members CRUD
// -----------------------------------------------------------------------------
function renderBoardTable() {
  const tbody = document.getElementById('boardTableBody');
  if (!tbody) return;
  const isEn = currentAdminLang === 'en';
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (boardCache.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px;">${t.noBoardFound}</td></tr>`;
    return;
  }

  tbody.innerHTML = boardCache.map(m => `
    <tr>
      <td><img src="/${m.image_url || 'assets/images/board_avatar.png'}" class="adm-item-avatar" alt="${m.name_ar}"></td>
      <td><strong>${isEn ? (m.name_en || m.name_ar) : m.name_ar}</strong></td>
      <td><span style="color:var(--adm-gold-light); font-weight:600;">${isEn ? (m.role_en || m.role_ar) : m.role_ar}</span></td>
      <td><small style="color:var(--adm-text-muted);">${isEn ? (m.bio_en || m.bio_ar || '') : (m.bio_ar || '')}</small></td>
      <td>
        <div class="adm-action-btns">
          <button class="adm-action-btn" onclick="editBoardMember(${m.id})">${t.btnEdit}</button>
          <button class="adm-action-btn delete" onclick="deleteBoardMember(${m.id})">${t.btnDelete}</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function setupBoardModal() {
  const modal = document.getElementById('boardModal');
  const openBtn = document.getElementById('openAddBoardBtn');
  const closeBtn = document.getElementById('closeBoardModal');
  const form = document.getElementById('boardForm');
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('boardId').value = '';
      document.getElementById('boardModalTitle').textContent = t().boardModalAddTitle;
      modal.classList.add('active');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  // Photo upload
  document.getElementById('boardImageFile')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImageFile(file);
    if (url) document.getElementById('boardImageUrl').value = url;
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('boardId').value;
      const body = {
        name_ar: document.getElementById('boardNameAr').value.trim(),
        name_en: document.getElementById('boardNameEn').value.trim(),
        role_ar: document.getElementById('boardRoleAr').value.trim(),
        role_en: document.getElementById('boardRoleEn').value.trim(),
        bio_ar: document.getElementById('boardBioAr').value.trim(),
        bio_en: document.getElementById('boardBioEn').value.trim(),
        image_url: document.getElementById('boardImageUrl').value.trim() || 'assets/images/board_avatar.png',
        sort_order: parseInt(document.getElementById('boardSortOrder').value) || 0
      };

      try {
        const url = id ? `${API_BASE}/board/${id}` : `${API_BASE}/board`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          showToast(t().toastSaveSuccess);
          modal.classList.remove('active');
          await loadContentData();
        } else {
          showToast(data.message || 'Error', 'error');
        }
      } catch (err) {
        showToast('Error', 'error');
      }
    });
  }
}

window.editBoardMember = function(id) {
  const m = boardCache.find(x => x.id == id);
  if (!m) return;
  const modal = document.getElementById('boardModal');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  document.getElementById('boardId').value = m.id;
  document.getElementById('boardNameAr').value = m.name_ar || '';
  document.getElementById('boardNameEn').value = m.name_en || '';
  document.getElementById('boardRoleAr').value = m.role_ar || '';
  document.getElementById('boardRoleEn').value = m.role_en || '';
  document.getElementById('boardBioAr').value = m.bio_ar || '';
  document.getElementById('boardBioEn').value = m.bio_en || '';
  document.getElementById('boardImageUrl').value = m.image_url || '';
  document.getElementById('boardSortOrder').value = m.sort_order || 0;
  document.getElementById('boardModalTitle').textContent = t.boardModalEditTitle;
  modal.classList.add('active');
};

window.deleteBoardMember = async function(id) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  if (!confirm(t.toastDeleteConfirmBoard)) return;
  try {
    const res = await fetch(`${API_BASE}/board/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(t.toastDeleted);
      await loadContentData();
    }
  } catch (err) {
    showToast('Error deleting member', 'error');
  }
};

// -----------------------------------------------------------------------------
// Stats Items CRUD
// -----------------------------------------------------------------------------
function renderStatsItems() {
  const container = document.getElementById('statsItemsContainer');
  if (!container) return;
  const isEn = currentAdminLang === 'en';
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  container.innerHTML = statsItemsCache.map((s, idx) => `
    <div class="adm-item-card">
      <div class="adm-item-info">
        <span style="font-size: 1.4rem; font-weight: 900; color: var(--adm-gold); min-width: 70px;">${s.value}</span>
        <div>
          <strong style="font-size: 0.95rem;">${isEn ? (s.label_en || s.label_ar) : s.label_ar}</strong>
          <div style="font-size: 0.78rem; color: var(--adm-text-muted);">${isEn ? s.label_ar : (s.label_en || '')}</div>
        </div>
      </div>
      <div class="adm-action-btns">
        <button class="adm-action-btn" onclick="editStatItem(${s.id})">${t.btnEdit}</button>
        <button class="adm-action-btn delete" onclick="deleteStatItem(${s.id})">${t.btnDelete}</button>
      </div>
    </div>
  `).join('');
}

function setupStatModal() {
  const modal = document.getElementById('statModal');
  const openBtn = document.getElementById('openAddStatBtn');
  const closeBtn = document.getElementById('closeStatModal');
  const form = document.getElementById('statForm');
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('statItemId').value = '';
      document.getElementById('statModalTitle').textContent = t().statModalAddTitle;
      modal.classList.add('active');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('statItemId').value;
      const value = document.getElementById('statItemValue').value.trim();
      const label_ar = document.getElementById('statItemLabelAr').value.trim();
      const label_en = document.getElementById('statItemLabelEn').value.trim();

      if (id) {
        const idx = statsItemsCache.findIndex(x => x.id == id);
        if (idx !== -1) {
          statsItemsCache[idx] = { ...statsItemsCache[idx], value, label_ar, label_en };
        }
      } else {
        statsItemsCache.push({ id: Date.now(), value, label_ar, label_en });
      }

      await saveStatsItemsToServer();
      modal.classList.remove('active');
    });
  }
}

async function saveStatsItemsToServer() {
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  try {
    const res = await fetch(`${API_BASE}/stats-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ items: statsItemsCache })
    });
    const data = await res.json();
    if (data.success) {
      showToast(t().toastSaveSuccess);
      renderStatsItems();
    }
  } catch (err) {
    showToast('Error', 'error');
  }
}

window.editStatItem = function(id) {
  const s = statsItemsCache.find(x => x.id == id);
  if (!s) return;
  const modal = document.getElementById('statModal');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  document.getElementById('statItemId').value = s.id;
  document.getElementById('statItemValue').value = s.value;
  document.getElementById('statItemLabelAr').value = s.label_ar;
  document.getElementById('statItemLabelEn').value = s.label_en || '';
  document.getElementById('statModalTitle').textContent = t.statModalEditTitle;
  modal.classList.add('active');
};

window.deleteStatItem = async function(id) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  if (!confirm(t.toastDeleteConfirmStat)) return;
  statsItemsCache = statsItemsCache.filter(x => x.id != id);
  await saveStatsItemsToServer();
};

// -----------------------------------------------------------------------------
// Values Items CRUD
// -----------------------------------------------------------------------------
function renderValuesItems() {
  const container = document.getElementById('valuesItemsContainer');
  if (!container) return;
  const isEn = currentAdminLang === 'en';
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  container.innerHTML = valuesItemsCache.map((v) => `
    <div class="adm-item-card">
      <div class="adm-item-info">
        <span style="font-size: 1.2rem; font-weight: 900; color: var(--adm-gold-bright); background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3); padding: 6px 12px; border-radius: 8px;">${v.num}</span>
        <div>
          <strong style="font-size: 0.95rem; color: #fff;">${isEn ? (v.title_en || v.title_ar) : v.title_ar}</strong>
          <div style="font-size: 0.8rem; color: var(--adm-text-muted); margin-top: 2px;">${isEn ? (v.desc_en || v.desc_ar || '') : (v.desc_ar || '')}</div>
        </div>
      </div>
      <div class="adm-action-btns">
        <button class="adm-action-btn" onclick="editValueItem(${v.id})">${t.btnEdit}</button>
        <button class="adm-action-btn delete" onclick="deleteValueItem(${v.id})">${t.btnDelete}</button>
      </div>
    </div>
  `).join('');
}

function setupValueModal() {
  const modal = document.getElementById('valueModal');
  const openBtn = document.getElementById('openAddValueBtn');
  const closeBtn = document.getElementById('closeValueModal');
  const form = document.getElementById('valueForm');
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('valueItemId').value = '';
      document.getElementById('valueModalTitle').textContent = t().valueModalAddTitle;
      modal.classList.add('active');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('valueItemId').value;
      const num = document.getElementById('valueItemNum').value.trim();
      const title_ar = document.getElementById('valueItemTitleAr').value.trim();
      const title_en = document.getElementById('valueItemTitleEn').value.trim();
      const desc_ar = document.getElementById('valueItemDescAr').value.trim();
      const desc_en = document.getElementById('valueItemDescEn').value.trim();

      if (id) {
        const idx = valuesItemsCache.findIndex(x => x.id == id);
        if (idx !== -1) {
          valuesItemsCache[idx] = { ...valuesItemsCache[idx], num, title_ar, title_en, desc_ar, desc_en };
        }
      } else {
        valuesItemsCache.push({ id: Date.now(), num, title_ar, title_en, desc_ar, desc_en });
      }

      await saveValuesItemsToServer();
      modal.classList.remove('active');
    });
  }
}

async function saveValuesItemsToServer() {
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  try {
    const res = await fetch(`${API_BASE}/values-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ items: valuesItemsCache })
    });
    const data = await res.json();
    if (data.success) {
      showToast(t().toastSaveSuccess);
      renderValuesItems();
    }
  } catch (err) {
    showToast('Error', 'error');
  }
}

window.editValueItem = function(id) {
  const v = valuesItemsCache.find(x => x.id == id);
  if (!v) return;
  const modal = document.getElementById('valueModal');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  document.getElementById('valueItemId').value = v.id;
  document.getElementById('valueItemNum').value = v.num;
  document.getElementById('valueItemTitleAr').value = v.title_ar;
  document.getElementById('valueItemTitleEn').value = v.title_en || '';
  document.getElementById('valueItemDescAr').value = v.desc_ar || '';
  document.getElementById('valueItemDescEn').value = v.desc_en || '';
  document.getElementById('valueModalTitle').textContent = t.valueModalEditTitle;
  modal.classList.add('active');
};

window.deleteValueItem = async function(id) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  if (!confirm(t.toastDeleteConfirmValue)) return;
  valuesItemsCache = valuesItemsCache.filter(x => x.id != id);
  await saveValuesItemsToServer();
};

// -----------------------------------------------------------------------------
// Green Gardens Track Record & Projects CRUD
// -----------------------------------------------------------------------------
async function loadProjects() {
  const tbody = document.getElementById('projectsTableBody');
  if (!tbody) return;
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--adm-text-muted);">${t.loadingProjects}</td></tr>`;

  try {
    const res = await fetch(`${API_BASE}/projects`);
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      projectsCache = data.data;
      renderProjectsTable();
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px;">${t.noProjectsFound}</td></tr>`;
    }
  } catch (err) {
    console.warn('Failed to load projects:', err);
    renderProjectsTable();
  }
}

function renderProjectsTable() {
  const tbody = document.getElementById('projectsTableBody');
  if (!tbody) return;
  const isEn = currentAdminLang === 'en';
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (projectsCache.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px;">${t.noProjectsFound}</td></tr>`;
    return;
  }

  tbody.innerHTML = projectsCache.map(p => {
    const rawImg = p.image_url || 'assets/images/projects/tatwer1masa.png';
    const imgUrl = rawImg.startsWith('http') || rawImg.startsWith('/') ? rawImg : '/' + rawImg;
    const title = isEn ? (p.title_en || p.title_ar) : p.title_ar;
    const subTitle = isEn ? p.title_ar : (p.title_en || '');
    const client = isEn ? (p.client_en || p.entity_en || p.client_ar || p.entity_ar || '') : (p.client_ar || p.entity_ar || '');
    const subClient = isEn ? (p.client_ar || p.entity_ar || '') : (p.client_en || p.entity_en || '');
    const desc = isEn ? (p.desc_en || p.desc_ar || '') : (p.desc_ar || '');

    return `
      <tr>
        <td style="text-align: center;">
          <a href="${imgUrl}" target="_blank" title="${isEn ? 'View Full Image' : 'عرض الصورة كاملة'}" style="display: inline-block;">
            <img src="${imgUrl}" class="adm-item-slide-preview" alt="${p.title_ar}" onerror="this.src='/assets/images/projects/tatwer1masa.png'">
          </a>
        </td>
        <td>
          <strong style="font-size: 0.92rem; color: #ffffff; line-height: 1.35; display: block;">${title}</strong>
          ${subTitle ? `<div style="font-size: 0.76rem; color: var(--adm-gold-light); margin-top: 3px;">${subTitle}</div>` : ''}
        </td>
        <td>
          <strong style="color: var(--adm-gold-bright); font-size: 0.88rem; line-height: 1.35; display: block;">${client}</strong>
          ${subClient ? `<div style="font-size: 0.74rem; color: var(--adm-text-muted); margin-top: 3px;">${subClient}</div>` : ''}
        </td>
        <td>
          <small style="color: var(--adm-text-muted); line-height: 1.45; display: block;">${desc}</small>
        </td>
        <td style="text-align: center;">
          <div class="adm-action-btns" style="justify-content: center;">
            <button class="adm-action-btn" onclick="editProject(${p.id})">${t.btnEdit}</button>
            <button class="adm-action-btn delete" onclick="deleteProject(${p.id})">${t.btnDelete}</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function setupProjectModal() {
  const modal = document.getElementById('projectModal');
  const openBtn = document.getElementById('openAddProjectBtn');
  const closeBtn = document.getElementById('closeProjectModal');
  const cancelBtn = document.getElementById('cancelProjectModal');
  const form = document.getElementById('projectForm');
  const imgInput = document.getElementById('projImageUrl');
  const previewImg = document.getElementById('projPreviewImg');
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      document.getElementById('projId').value = '';
      document.getElementById('projSortOrder').value = (projectsCache.length + 1);
      if (previewImg) previewImg.src = '/assets/images/projects/tatwer1masa.png';
      document.getElementById('projectModalTitle').textContent = t().projectModalAddTitle;
      modal.classList.add('active');
    });
  }

  const closeModal = () => modal.classList.remove('active');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (imgInput && previewImg) {
    imgInput.addEventListener('input', () => {
      const val = imgInput.value.trim();
      if (val) {
        previewImg.src = val.startsWith('http') || val.startsWith('/') ? val : '/' + val;
      }
    });
  }

  // Upload image file
  document.getElementById('projImageFile')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = await uploadImageFile(file);
    if (url) {
      if (imgInput) imgInput.value = url;
      if (previewImg) previewImg.src = url.startsWith('/') ? url : '/' + url;
    }
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('projId').value;
      const body = {
        title_ar: document.getElementById('projTitleAr').value.trim(),
        title_en: document.getElementById('projTitleEn').value.trim(),
        client_ar: document.getElementById('projEntityAr').value.trim(),
        client_en: document.getElementById('projEntityEn').value.trim(),
        desc_ar: document.getElementById('projDescAr').value.trim(),
        desc_en: document.getElementById('projDescEn').value.trim(),
        image_url: document.getElementById('projImageUrl').value.trim() || 'assets/images/projects/tatwer1masa.png',
        sort_order: parseInt(document.getElementById('projSortOrder').value) || 0
      };

      try {
        const url = id ? `${API_BASE}/projects/${id}` : `${API_BASE}/projects`;
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          showToast(t().toastSaveSuccess);
          modal.classList.remove('active');
          await loadProjects();
        } else {
          showToast(data.message || 'Error saving project', 'error');
        }
      } catch (err) {
        showToast('Error connecting to server', 'error');
      }
    });
  }
}

window.editProject = function(id) {
  const p = projectsCache.find(x => x.id == id);
  if (!p) return;
  const modal = document.getElementById('projectModal');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  document.getElementById('projId').value = p.id;
  document.getElementById('projTitleAr').value = p.title_ar || '';
  document.getElementById('projTitleEn').value = p.title_en || '';
  document.getElementById('projEntityAr').value = p.client_ar || p.entity_ar || '';
  document.getElementById('projEntityEn').value = p.client_en || p.entity_en || '';
  document.getElementById('projDescAr').value = p.desc_ar || '';
  document.getElementById('projDescEn').value = p.desc_en || '';
  document.getElementById('projImageUrl').value = p.image_url || '';
  document.getElementById('projSortOrder').value = p.sort_order || 0;

  const previewImg = document.getElementById('projPreviewImg');
  if (previewImg) {
    const rawUrl = p.image_url || 'assets/images/projects/tatwer1masa.png';
    previewImg.src = rawUrl.startsWith('http') || rawUrl.startsWith('/') ? rawUrl : '/' + rawUrl;
  }

  document.getElementById('projectModalTitle').textContent = t.projectModalEditTitle;
  modal.classList.add('active');
};

window.deleteProject = async function(id) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  if (!confirm(t.toastDeleteConfirmProject)) return;
  try {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(t.toastDeleted);
      await loadProjects();
    } else {
      showToast(data.message || 'Error', 'error');
    }
  } catch (err) {
    showToast('Error deleting project', 'error');
  }
};

// -----------------------------------------------------------------------------
// Inquiries & RFQ Inbox
// -----------------------------------------------------------------------------
async function loadInquiries() {
  const tbody = document.getElementById('inquiriesTableBody');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  const isEn = currentAdminLang === 'en';
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--adm-text-muted);">${t.loadingInquiries}</td></tr>`;

  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      tbody.innerHTML = data.data.map(inq => {
        let badgeClass = 'new';
        let statusText = t.statusNew;
        if (inq.status === 'contacted') { badgeClass = 'contacted'; statusText = t.statusContacted; }
        if (inq.status === 'completed') { badgeClass = 'completed'; statusText = t.statusCompleted; }

        return `
          <tr>
            <td><strong>#${inq.id}</strong></td>
            <td>
              <strong>${inq.name}</strong>
              <div style="font-size:0.75rem; color:var(--adm-text-muted);">${inq.company || t.internationalClient}</div>
            </td>
            <td>
              <div>${inq.email}</div>
              <small style="color:var(--adm-blue);">${inq.phone || ''}</small>
            </td>
            <td>${inq.country || t.globalDestination}</td>
            <td><strong>${inq.product_name || inq.type || t.generalRequest}</strong> (${inq.quantity || t.unspecifiedQty})</td>
            <td><span class="adm-status-badge ${badgeClass}">${statusText}</span></td>
            <td>
              <div class="adm-action-btns">
                <button class="adm-action-btn" onclick='viewInquiryDetails(${JSON.stringify(inq)})'>${t.btnDetails}</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px;">${t.noInquiriesFound}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--adm-red);">${isEn ? 'Error loading inquiries' : 'حدث خطأ أثناء تحميل الرسائل'}</td></tr>`;
  }
}

function setupInquiryModal() {
  const modal = document.getElementById('inquiryDetailModal');
  document.getElementById('closeInquiryModal').addEventListener('click', () => modal.classList.remove('active'));
}

window.viewInquiryDetails = function(inq) {
  const modal = document.getElementById('inquiryDetailModal');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  const isEn = currentAdminLang === 'en';

  document.getElementById('inqDetailName').textContent = inq.name;
  document.getElementById('inqDetailCompany').textContent = inq.company || (isEn ? 'Not specified' : 'غير محدد');
  document.getElementById('inqDetailEmail').textContent = inq.email;
  document.getElementById('inqDetailPhone').textContent = inq.phone || (isEn ? 'Not specified' : 'غير محدد');
  document.getElementById('inqDetailCountry').textContent = inq.country || (isEn ? 'Not specified' : 'غير محدد');
  document.getElementById('inqDetailProduct').textContent = inq.product_name || (isEn ? 'General Request' : 'عام');
  document.getElementById('inqDetailQuantity').textContent = inq.quantity || (isEn ? 'Unspecified' : 'غير محدد');
  document.getElementById('inqDetailIncoterms').textContent = inq.incoterms || 'FOB';
  document.getElementById('inqDetailMessage').textContent = inq.message || (isEn ? 'No additional notes provided' : 'لا توجد ملاحظات إضافية');
  document.getElementById('inqStatusSelect').value = inq.status || 'new';

  document.getElementById('saveInqStatusBtn').onclick = async () => {
    const status = document.getElementById('inqStatusSelect').value;
    try {
      const res = await fetch(`${API_BASE}/inquiries/${inq.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        showToast(t.toastSaveSuccess);
        modal.classList.remove('active');
        loadInquiries();
        loadStats();
      }
    } catch (err) {
      showToast(isEn ? 'Failed to update status' : 'فشل تحديث الحالة', 'error');
    }
  };

  modal.classList.add('active');
};

// -----------------------------------------------------------------------------
// Invoices
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Invoices Management & Luxury Export Commercial Invoice Generator
// -----------------------------------------------------------------------------
let invoicesCache = [];

async function loadInvoices() {
  const tbody = document.getElementById('invoicesTableBody');
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  const isEn = currentAdminLang === 'en';
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: var(--adm-text-muted);">${t.loadingInvoices}</td></tr>`;

  try {
    const res = await fetch(`${API_BASE}/invoices`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      invoicesCache = data.data;
      tbody.innerHTML = data.data.map(inv => {
        let badgeColor = '#059669';
        let badgeBg = 'rgba(5, 150, 105, 0.15)';
        if (inv.status === 'partially_paid') { badgeColor = '#0284c7'; badgeBg = 'rgba(2, 132, 199, 0.15)'; }
        else if (inv.status === 'pending' || inv.status === 'sent') { badgeColor = '#d97706'; badgeBg = 'rgba(217, 119, 6, 0.15)'; }
        else if (inv.status === 'draft') { badgeColor = '#64748b'; badgeBg = 'rgba(100, 116, 139, 0.15)'; }
        else if (inv.status === 'cancelled') { badgeColor = '#e11d48'; badgeBg = 'rgba(225, 29, 72, 0.15)'; }

        return `
          <tr>
            <td><strong>${inv.invoice_number}</strong></td>
            <td>
              <strong>${inv.client_name}</strong>
              <div style="font-size:0.75rem; color:var(--adm-text-muted);">${inv.client_company || ''}</div>
            </td>
            <td>${inv.client_country || t.globalDestination}</td>
            <td><strong>${Number(inv.total_amount).toLocaleString()} ${inv.currency || 'USD'}</strong></td>
            <td>
              <select class="adm-form-control" style="width: auto; min-width: 140px; padding: 5px 8px; font-size: 0.8rem; font-weight: 700; color: ${badgeColor}; background: ${badgeBg}; border: 1.5px solid ${badgeColor}; border-radius: 6px; cursor: pointer;" onchange="changeInvoiceStatus('${inv.invoice_number}', this.value)">
                <option value="paid" ${inv.status === 'paid' ? 'selected' : ''} style="color: #059669; background: #fff;">${t.statusPaid}</option>
                <option value="partially_paid" ${inv.status === 'partially_paid' ? 'selected' : ''} style="color: #0284c7; background: #fff;">${t.statusPartiallyPaid}</option>
                <option value="pending" ${inv.status === 'pending' || inv.status === 'sent' ? 'selected' : ''} style="color: #d97706; background: #fff;">${t.statusPending}</option>
                <option value="draft" ${inv.status === 'draft' ? 'selected' : ''} style="color: #64748b; background: #fff;">${t.statusDraft}</option>
                <option value="cancelled" ${inv.status === 'cancelled' ? 'selected' : ''} style="color: #e11d48; background: #fff;">${t.statusCancelled}</option>
              </select>
            </td>
            <td>
              <div class="adm-action-btns">
                <button class="adm-action-btn" onclick="printInvoice('${inv.invoice_number}')" title="${t.btnPrint}">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-inline-end: 4px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  ${t.btnPrint} / PDF
                </button>
                <button class="adm-action-btn delete" onclick="deleteInvoice('${inv.invoice_number}')" title="${t.btnDelete}">
                  ✕
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px;">${t.noInvoicesFound}</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--adm-red);">${isEn ? 'Error loading invoices' : 'حدث خطأ أثناء تحميل الفواتير'}</td></tr>`;
  }
}

window.changeInvoiceStatus = async function(invRef, newStatus) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  try {
    const res = await fetch(`${API_BASE}/invoices/${invRef}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(t.toastStatusUpdated);
      await loadInvoices();
      loadStats();
    } else {
      showToast(data.message || 'Error', 'error');
    }
  } catch (err) {
    showToast(currentAdminLang === 'en' ? 'Failed to update invoice status' : 'تعذر تحديث حالة الفاتورة', 'error');
  }
};

window.deleteInvoice = async function(invRef) {
  const t = ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;
  if (!confirm(t.toastDeleteConfirmInv)) return;

  try {
    const res = await fetch(`${API_BASE}/invoices/${invRef}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      showToast(t.toastDeleted);
      await loadInvoices();
      loadStats();
    } else {
      showToast(data.message || 'Error', 'error');
    }
  } catch (err) {
    showToast(currentAdminLang === 'en' ? 'Failed to delete invoice' : 'تعذر حذف الفاتورة', 'error');
  }
};

function setupInvoiceModal() {
  const modal = document.getElementById('invoiceModal');
  const openBtn = document.getElementById('openAddInvoiceBtn');
  const closeBtn = document.getElementById('closeInvoiceModal');
  const form = document.getElementById('invoiceForm');
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      form.reset();
      modal.classList.add('active');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const body = {
        client_name: document.getElementById('invClientName').value,
        client_company: document.getElementById('invClientCompany').value,
        client_email: document.getElementById('invClientEmail').value,
        client_country: document.getElementById('invClientCountry').value,
        total_amount: document.getElementById('invTotalAmount').value,
        currency: document.getElementById('invCurrency').value,
        status: document.getElementById('invStatus')?.value || 'pending',
        due_date: document.getElementById('invDueDate')?.value || null,
        payment_terms: document.getElementById('invTerms').value,
        notes: document.getElementById('invNotes').value
      };

      try {
        const res = await fetch(`${API_BASE}/invoices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (data.success) {
          showToast(`${t().toastSaveSuccess} (${data.invoice_number || ''})`);
          modal.classList.remove('active');
          await loadInvoices();
          loadStats();
          if (data.invoice_number) {
            printInvoice(data.invoice_number);
          }
        }
      } catch (err) {
        showToast(currentAdminLang === 'en' ? 'Failed to create invoice' : 'تعذر إنشاء الفاتورة', 'error');
      }
    });
  }
}

window.printInvoice = function(invRef, client, amount, currency) {
  const isEn = currentAdminLang === 'en';
  let inv = typeof invRef === 'object' ? invRef : invoicesCache.find(i => i.invoice_number === invRef || i.id == invRef);

  if (!inv) {
    inv = {
      invoice_number: invRef || `INV-${new Date().getFullYear()}-001`,
      client_name: client || (isEn ? 'International Consignee' : 'المستورد الدولي'),
      client_company: isEn ? 'Global Agri-Food Import Co.' : 'شركة الاستيراد الزراعي والغذائي',
      client_email: 'import@partner-trade.com',
      client_country: isEn ? 'Europe / Global Port' : 'دولي - ميناء الوصول',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      currency: currency || 'USD',
      total_amount: amount || '45000.00',
      status: 'paid',
      payment_terms: 'Irrevocable Confirmed L/C at Sight / T/T (CIF Port of Discharge)',
      notes: isEn 
        ? 'High-Cube Reefer Containers with satellite GPS temperature loggers. 100% compliant with EU/Gulf phytosanitary clearance.' 
        : 'حاويات مبردة مجهزة بأجهزة تتبع حراري لحظية. مطابقة بنسبة 100% لاشتراطات الحجر الزراعي والمواصفات القياسية للتصدير.',
      items_json: [
        {
          name: isEn ? 'Premium Egyptian Valencia Oranges (Class 1, Extra Quality)' : 'برتقال مصري فالنسيا درجة أولى فاخر (صادرات ممتازة)',
          packaging: isEn ? '15kg Telescopic Export Cartons (3,000 Boxes in 40ft Reefer)' : 'كرتونة تلسكوبية 15 كجم (3,000 كرتونة داخل حاوية 40 قدم)',
          quantity: isEn ? '45.0 Metric Tons' : '45.0 طن متري',
          unit_price: '920.00',
          total: '41400.00'
        },
        {
          name: isEn ? 'Phytosanitary Health Certificate, Global GAP & Export Lab Analysis' : 'شهادات الصحة النباتية الرسمية، فحص متبقيات المبيدات واعتمادات Global GAP',
          packaging: isEn ? 'Official Clearance Documentation Package' : 'ملف التخليص والشهادات الرسمية المعتمدة',
          quantity: isEn ? '1 Full Set' : 'مجموعة كاملة',
          unit_price: '3600.00',
          total: '3600.00'
        }
      ]
    };
  }

  // Parse items
  let items = [];
  if (Array.isArray(inv.items_json)) {
    items = inv.items_json;
  } else if (typeof inv.items_json === 'string') {
    try { items = JSON.parse(inv.items_json); } catch (e) { items = []; }
  }

  if (!items || items.length === 0) {
    const numAmount = parseFloat(inv.total_amount) || 45000;
    const item1Amount = (numAmount * 0.92).toFixed(2);
    const item2Amount = (numAmount * 0.08).toFixed(2);
    items = [
      {
        name: isEn ? 'Egyptian Agricultural Produce (Selected Export Grade A)' : 'حاصلات ومنتجات زراعية مصرية فاخرة (صادرات درجة أولى)',
        packaging: isEn ? 'Export Standard Packaging in 40ft High-Cube Reefer' : 'تعبئة تصدير قياسية مبردة في حاويات 40 قدم',
        quantity: isEn ? 'Full Consignment' : 'شحنة كاملة',
        unit_price: item1Amount,
        total: item1Amount
      },
      {
        name: isEn ? 'Official Phytosanitary Inspection & Export Handling Documentation' : 'فحص الحجر الزراعي وإصدار الشهادات الصحية النباتية والمنشأ',
        packaging: isEn ? 'Official Ministerial Documents' : 'شهادات وزارة الزراعة والمنشأ',
        quantity: isEn ? '1 Consignment Set' : 'ملف شحنة معتمد',
        unit_price: item2Amount,
        total: item2Amount
      }
    ];
  }

  const numTotal = Number(inv.total_amount || 0);
  const formattedTotal = numTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const curr = inv.currency || 'USD';

  const win = window.open('', '_blank');
  win.document.write(`
<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'ar'}" dir="${isEn ? 'ltr' : 'rtl'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isEn ? 'Commercial Export Invoice' : 'فاتورة تصدير تجارية'} - ${inv.invoice_number}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #07172b;
      --primary-light: #0d284a;
      --gold: #d4af37;
      --gold-light: #f59e0b;
      --gold-bg: #fffbeb;
      --emerald: #059669;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --card-bg: #ffffff;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${isEn ? "'Outfit', 'Cairo', sans-serif" : "'Cairo', 'Outfit', sans-serif"};
      background: #f1f5f9;
      color: var(--text);
      line-height: 1.5;
      padding: 30px 15px;
      -webkit-font-smoothing: antialiased;
    }
    .action-bar {
      max-width: 860px;
      margin: 0 auto 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0b1f3a;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      border: 1px solid rgba(212,175,55,0.3);
    }
    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      text-decoration: none;
      font-family: inherit;
    }
    .btn-download {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #07172b;
    }
    .btn-download:hover {
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(245,158,11,0.4);
    }
    .btn-print {
      background: rgba(255,255,255,0.15);
      color: #ffffff;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .btn-print:hover {
      background: rgba(255,255,255,0.25);
      color: #ffffff;
    }
    .btn-close {
      background: transparent;
      color: #94a3b8;
    }
    .btn-close:hover { color: #ffffff; }

    .invoice-sheet {
      max-width: 860px;
      margin: 0 auto;
      background: #ffffff;
      padding: 45px 50px;
      border-radius: 16px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      position: relative;
      overflow: hidden;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 6rem;
      font-weight: 900;
      color: rgba(212, 175, 55, 0.04);
      pointer-events: none;
      white-space: nowrap;
      user-select: none;
      text-transform: uppercase;
      letter-spacing: 12px;
    }

    /* Header */
    .inv-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #d4af37;
      padding-bottom: 24px;
      margin-bottom: 24px;
      gap: 20px;
    }
    .brand-block {
      display: flex;
      align-items: center;
      gap: 18px;
    }
    .brand-logo {
      width: 78px;
      height: 78px;
      object-fit: contain;
      border-radius: 12px;
      padding: 5px;
      background: #0b1f3a;
      border: 1.5px solid #d4af37;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .brand-text h1 {
      font-size: 1.35rem;
      font-weight: 900;
      color: #07172b;
      line-height: 1.3;
    }
    .brand-text h2 {
      font-size: 0.95rem;
      font-weight: 700;
      color: #b45309;
      margin-top: 2px;
    }
    .brand-text p {
      font-size: 0.78rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .doc-meta {
      text-align: ${isEn ? 'right' : 'left'};
    }
    .doc-title-badge {
      display: inline-block;
      background: #07172b;
      color: #f59e0b;
      font-size: 0.85rem;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 6px;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      border: 1px solid #d4af37;
    }
    .doc-meta-item {
      font-size: 0.85rem;
      color: var(--text);
      margin-bottom: 3px;
    }
    .doc-meta-item strong {
      color: #07172b;
    }

    /* Parties Section */
    .parties-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 26px;
    }
    .party-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 18px;
      position: relative;
    }
    .party-card.consignee {
      background: #fffdf5;
      border-color: #fde68a;
    }
    .party-card-title {
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #d97706;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .party-name {
      font-size: 1.05rem;
      font-weight: 800;
      color: #07172b;
      margin-bottom: 4px;
    }
    .party-detail {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    /* Items Table */
    .table-container {
      margin-bottom: 26px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    .inv-table {
      width: 100%;
      border-collapse: collapse;
      text-align: ${isEn ? 'left' : 'right'};
      font-size: 0.88rem;
    }
    .inv-table th {
      background: #07172b;
      color: #ffffff;
      padding: 12px 14px;
      font-weight: 700;
      font-size: 0.82rem;
      border: none;
    }
    .inv-table th:first-child { width: 45px; text-align: center; }
    .inv-table th:last-child { text-align: ${isEn ? 'right' : 'left'}; }
    .inv-table td {
      padding: 14px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
      vertical-align: top;
    }
    .inv-table tr:last-child td { border-bottom: none; }
    .inv-table tr:nth-child(even) td { background: #fafafa; }
    .inv-table td:first-child { text-align: center; font-weight: bold; color: var(--text-muted); }
    .inv-table td:last-child { text-align: ${isEn ? 'right' : 'left'}; font-weight: 800; color: #07172b; }
    .item-desc {
      font-weight: 700;
      color: #07172b;
      margin-bottom: 2px;
    }
    .item-sub {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    /* Calculation Summary */
    .summary-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 24px;
      margin-bottom: 26px;
    }
    .terms-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      font-size: 0.82rem;
      color: #334155;
      line-height: 1.6;
    }
    .terms-box h4 {
      font-size: 0.85rem;
      font-weight: 800;
      color: #07172b;
      margin-bottom: 6px;
    }
    .calc-box {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
    }
    .calc-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.88rem;
      color: #475569;
      margin-bottom: 8px;
    }
    .calc-row.total {
      border-top: 2px dashed #cbd5e1;
      padding-top: 10px;
      margin-top: 10px;
      font-size: 1.25rem;
      font-weight: 900;
      color: #07172b;
    }
    .calc-row.total .total-amount {
      color: #b45309;
    }

    /* Bank Wire Box */
    .wire-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 26px;
      font-size: 0.82rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .wire-title {
      font-weight: 800;
      color: #166534;
      margin-bottom: 3px;
    }
    .wire-details {
      color: #15803d;
      font-family: monospace;
      font-size: 0.85rem;
    }

    /* Signatures & Seal Footer */
    .sign-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .quality-seal-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .seal-badge {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 2px dashed #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #059669;
      font-weight: 900;
      font-size: 0.65rem;
      text-align: center;
      line-height: 1.1;
      text-transform: uppercase;
      padding: 4px;
    }
    .seal-text {
      font-size: 0.78rem;
      color: var(--text-muted);
      max-width: 280px;
      line-height: 1.4;
    }
    .signature-box {
      text-align: center;
      width: 220px;
    }
    .sig-line {
      height: 48px;
      border-bottom: 1.5px solid #07172b;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Brush Script MT', cursive, sans-serif;
      font-size: 1.5rem;
      color: #0f2c59;
    }
    .sig-title {
      font-size: 0.82rem;
      font-weight: 800;
      color: #07172b;
    }
    .sig-sub {
      font-size: 0.72rem;
      color: var(--text-muted);
    }

    /* Bottom Footer Note */
    .inv-footer-note {
      text-align: center;
      margin-top: 24px;
      font-size: 0.75rem;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }

    @media print {
      body { background: #ffffff !important; padding: 0 !important; }
      .action-bar { display: none !important; }
      .invoice-sheet {
        max-width: 100% !important;
        border: none !important;
        box-shadow: none !important;
        padding: 20px 25px !important;
        border-radius: 0 !important;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
    }
  </style>
</head>
<body>

  <!-- Floating Action Bar -->
  <div class="action-bar no-print">
    <div style="color: #f59e0b; font-weight: 800; display: flex; align-items: center; gap: 8px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>
      <span>${isEn ? 'Green Gardens Official Export Invoice' : 'فاتورة تصدير شركة جرين جاردنز الرسمية'}</span>
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="action-btn btn-download" onclick="window.print()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>${isEn ? 'Save / Download PDF' : 'حفظ وتنزيل كملف PDF'}</span>
      </button>
      <button class="action-btn btn-print" onclick="window.print()">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        <span>${isEn ? 'Print' : 'طباعة'}</span>
      </button>
      <button class="action-btn btn-close" onclick="window.close()">✕ ${isEn ? 'Close' : 'إغلاق'}</button>
    </div>
  </div>

  <!-- Printable Invoice Sheet -->
  <div class="invoice-sheet" id="invoiceSheet">
    <div class="watermark">GREEN GARDENS EXPORT</div>

    <!-- Header -->
    <div class="inv-header">
      <div class="brand-block">
        <img src="/assets/images/logo.png" alt="Green Gardens Logo" class="brand-logo">
        <div class="brand-text">
          <h1>${isEn ? 'Green Gardens Development & Agro-Export Co.' : 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي'}</h1>
          <h2>${isEn ? 'Global Produce & Agro-Export Division' : 'قطاع التصدير الزراعي والتوريد الدولي'}</h2>
          <p>The Courtyard Mall, Zayed, Giza & Abu El Matameer, Beheira, Egypt</p>
          <p style="font-size:0.75rem; color:#b45309; font-weight:600;">Tel / WA: +20 106 886 8780 | Email: info@greengardens-eg.com | Web: www.greengardens-eg.com</p>
        </div>
      </div>

      <div class="doc-meta">
        <div class="doc-title-badge">${isEn ? 'COMMERCIAL INVOICE' : 'فاتورة تصدير تجارية'}</div>
        <div class="doc-meta-item"><strong>${isEn ? 'Invoice No.' : 'رقم الفاتورة'}:</strong> <span style="font-family:monospace; font-weight:bold; color:#b45309;">${inv.invoice_number}</span></div>
        <div class="doc-meta-item"><strong>${isEn ? 'Date' : 'تاريخ الإصدار'}:</strong> ${inv.issue_date || new Date().toISOString().split('T')[0]}</div>
        <div class="doc-meta-item"><strong>${isEn ? 'Due Date' : 'تاريخ الاستحقاق'}:</strong> ${inv.due_date || '-'}</div>
        <div class="doc-meta-item"><strong>${isEn ? 'Status' : 'الحالة'}:</strong> <span style="color:#059669; font-weight:800;">${inv.status === 'paid' ? (isEn ? 'PAID / CONFIRMED' : 'مدفوعة ومؤكدة') : (isEn ? 'ISSUED / PENDING' : 'صادرة للتسوية')}</span></div>
      </div>
    </div>

    <!-- Exporter & Importer Info Cards -->
    <div class="parties-grid">
      <div class="party-card">
        <div class="party-card-title">
          <span>🏢</span>
          <span>${isEn ? 'Shipper / Exporter' : 'المصدر / الشاحن'}</span>
        </div>
        <div class="party-name">${isEn ? 'Green Gardens Development & Agro-Export Co.' : 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي'}</div>
        <div class="party-detail">
          <div><strong>${isEn ? 'Commercial Reg.' : 'سجل تجاري'}:</strong> 184592 (Giza Chamber)</div>
          <div><strong>${isEn ? 'Tax ID' : 'بطاقة ضريبية'}:</strong> 624-918-305 | <strong>${isEn ? 'Export Lic.' : 'رخصة تصدير'}:</strong> 9402</div>
          <div><strong>${isEn ? 'Origin' : 'بلد المنشأ'}:</strong> Egypt (Wadi El-Natrun & Bustan Farms)</div>
        </div>
      </div>

      <div class="party-card consignee">
        <div class="party-card-title">
          <span>🚢</span>
          <span>${isEn ? 'Consignee / Importer (Billed To)' : 'المستورد / العميل الموجه إليه'}</span>
        </div>
        <div class="party-name">${inv.client_name}</div>
        <div class="party-detail">
          <div><strong>${isEn ? 'Company' : 'الشركة'}:</strong> ${inv.client_company || (isEn ? 'International Agro Trading Co.' : 'شركة الاستيراد والتجارة')}</div>
          <div><strong>${isEn ? 'Destination Port' : 'ميناء الوصول والدولة'}:</strong> ${inv.client_country || (isEn ? 'Global Destination' : 'دولي')}</div>
          <div><strong>${isEn ? 'Email' : 'البريد'}:</strong> ${inv.client_email || '-'}</div>
        </div>
      </div>
    </div>

    <!-- Table of Exported Goods -->
    <div class="table-container">
      <table class="inv-table">
        <thead>
          <tr>
            <th>#</th>
            <th>${isEn ? 'Product Description & Grade' : 'بيان الحاصلات والمنتجات المصدرة'}</th>
            <th>${isEn ? 'Packaging & Shipping Specs' : 'مواصفات التعبئة والتبريد'}</th>
            <th>${isEn ? 'Qty / Weight' : 'الكمية / الوزن'}</th>
            <th>${isEn ? 'Unit Price (' + curr + ')' : 'سعر الوحدة (' + curr + ')'}</th>
            <th>${isEn ? 'Total Amount (' + curr + ')' : 'الإجمالي (' + curr + ')'}</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>
                <div class="item-desc">${item.name}</div>
                <div class="item-sub">${isEn ? 'Origin: Egypt (Green Gardens Farms) • Global GAP Certified' : 'المنشأ: مصر (مزارع شركة جرين جاردنز) • معتمدة للمواصفات القياسية'}</div>
              </td>
              <td><span style="font-size:0.82rem; color:#475569;">${item.packaging || (isEn ? 'Standard Export Master Carton' : 'كرتون تصدير قياسي')}</span></td>
              <td><strong>${item.quantity || '1 Consignment'}</strong></td>
              <td>${Number(item.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>${Number(item.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Summary & Incoterms Box -->
    <div class="summary-grid">
      <div class="terms-box">
        <h4>${isEn ? 'Commercial Terms & Export Protocol' : 'الشروط التجارية وبروتوكول الشحن الدولي'}</h4>
        <p><strong>${isEn ? 'Incoterms & Payment' : 'شروط الدفع والشحن'}:</strong> ${inv.payment_terms || '30% Advance, 70% against Shipping Documents'}</p>
        <p style="margin-top: 6px;"><strong>${isEn ? 'Special Notes' : 'ملاحظات الشحنة'}:</strong> ${inv.notes || (isEn ? 'Reefer temperature continuously logged. All phytosanitary laboratory certificates attached.' : 'الحرارة مسجلة وموثقة طوال الرحلة، مرفق مع الشحنة كافة الشهادات المعملية والحجر الزراعي.')}</p>
      </div>

      <div class="calc-box">
        <div class="calc-row">
          <span>${isEn ? 'Subtotal (FOB / Base Goods)' : 'المجموع الفرعي للبضائع'}:</span>
          <span>${(numTotal * 0.95).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}</span>
        </div>
        <div class="calc-row">
          <span>${isEn ? 'Phytosanitary & Export Handling' : 'التخليص والشهادات الرسمية'}:</span>
          <span>${(numTotal * 0.05).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr}</span>
        </div>
        <div class="calc-row total">
          <span>${isEn ? 'Net Total Payable' : 'إجمالي القيمة المستحقة'}:</span>
          <span class="total-amount">${formattedTotal} ${curr}</span>
        </div>
      </div>
    </div>

    <!-- Bank Wire Transfer Details -->
    <div class="wire-box">
      <div>
        <div class="wire-title">${isEn ? 'Official Bank Wire Transfer Instructions (SWIFT / TT)' : 'بيانات التحويل المصرفي المعتمد للشركة (SWIFT / TT)'}</div>
        <div style="font-size:0.78rem; color:#166534;"><strong>${isEn ? 'Beneficiary' : 'اسم المستفيد'}:</strong> Green Gardens Development & Agro-Export Co.</div>
      </div>
      <div class="wire-details">
        <div><strong>Bank:</strong> National Bank of Egypt (NBE)</div>
        <div><strong>SWIFT / BIC:</strong> NBEGEGCX002 • <strong>IBAN:</strong> EG8400030024918230001002</div>
      </div>
    </div>

    <!-- Signatures & Quality Stamp -->
    <div class="sign-section">
      <div class="quality-seal-box">
        <div class="seal-badge">
          ISO 22000<br>GLOBAL GAP<br>BRC
        </div>
        <div class="seal-text">
          ${isEn 
            ? 'Certified agro-export produce meeting European (EU), British (BRC), and GCC Gulf food safety standards with full traceability.' 
            : 'حاصلات زراعية مصرية معتمدة ومطابقة لأعلى اشتراطات الجودة والسلامة الغذائية للاتحاد الأوروبي وهيئات الغذاء الخليجية.'}
        </div>
      </div>

      <div class="signature-box">
        <div class="sig-line">Abdo M. Ayyad</div>
        <div class="sig-title">${isEn ? 'Eng. Abdo Mohamed Ayyad' : 'المهندس / عبده محمد عياد'}</div>
        <div class="sig-sub">${isEn ? 'Managing Director & Export Authority' : 'العضو المنتدب والمفوض بالتصدير'}</div>
      </div>
    </div>

    <!-- Bottom Footer Note -->
    <div class="inv-footer-note">
      ${isEn 
        ? 'Green Gardens Development & Agro-Export Co. • Commercial Registration No. 184592 • Headquarters: Giza & Beheira, Egypt' 
        : 'شركة جرين جاردنز للتطوير والتصدير الزراعي والغذائي • سجل تجاري 184592 • المقر الرئيسي: الجيزة والبحيرة، جمهورية مصر العربية'}
    </div>
  </div>

</body>
</html>
  `);
  win.document.close();
};

// -----------------------------------------------------------------------------
// General Settings (Company Details, Phone, WhatsApp, Socials)
// -----------------------------------------------------------------------------
async function loadSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
    const data = await res.json();
    if (data.success && data.data) {
      const s = data.data;
      if (document.getElementById('setCompanyPhone')) document.getElementById('setCompanyPhone').value = s.company_phone || '';
      if (document.getElementById('setCompanyWhatsapp')) document.getElementById('setCompanyWhatsapp').value = s.company_whatsapp || '';
      if (document.getElementById('setCompanyEmail')) document.getElementById('setCompanyEmail').value = s.company_email || '';
      if (document.getElementById('setCompanyNameAr')) document.getElementById('setCompanyNameAr').value = s.company_name_ar || '';
      if (document.getElementById('setCompanyNameEn')) document.getElementById('setCompanyNameEn').value = s.company_name_en || '';
      if (document.getElementById('setCompanyAddressAr')) document.getElementById('setCompanyAddressAr').value = s.company_address_ar || '';
      if (document.getElementById('setCompanyAddressEn')) document.getElementById('setCompanyAddressEn').value = s.company_address_en || '';
      if (document.getElementById('setAboutSummaryAr')) document.getElementById('setAboutSummaryAr').value = s.about_summary_ar || '';
      if (document.getElementById('setFacebookUrl')) document.getElementById('setFacebookUrl').value = s.facebook_url || '';
      if (document.getElementById('setLinkedinUrl')) document.getElementById('setLinkedinUrl').value = s.linkedin_url || '';
      if (document.getElementById('setInstagramUrl')) document.getElementById('setInstagramUrl').value = s.instagram_url || '';
      if (document.getElementById('setYoutubeUrl')) document.getElementById('setYoutubeUrl').value = s.youtube_url || '';
      if (document.getElementById('setTiktokUrl')) document.getElementById('setTiktokUrl').value = s.tiktok_url || '';
      if (document.getElementById('setTwitterUrl')) document.getElementById('setTwitterUrl').value = s.twitter_url || '';
    }
  } catch (err) {
    console.warn('Failed to load general settings:', err);
  }
}

function setupSettingsForm() {
  const form = document.getElementById('settingsForm');
  if (!form) return;
  const t = () => ADMIN_I18N[currentAdminLang] || ADMIN_I18N.ar;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const settingsData = {
      company_phone: document.getElementById('setCompanyPhone').value.trim(),
      company_whatsapp: document.getElementById('setCompanyWhatsapp').value.trim(),
      company_email: document.getElementById('setCompanyEmail').value.trim(),
      company_name_ar: document.getElementById('setCompanyNameAr').value.trim(),
      company_name_en: document.getElementById('setCompanyNameEn').value.trim(),
      company_address_ar: document.getElementById('setCompanyAddressAr').value.trim(),
      company_address_en: document.getElementById('setCompanyAddressEn').value.trim(),
      about_summary_ar: document.getElementById('setAboutSummaryAr').value.trim(),
      facebook_url: document.getElementById('setFacebookUrl').value.trim(),
      linkedin_url: document.getElementById('setLinkedinUrl').value.trim(),
      instagram_url: document.getElementById('setInstagramUrl').value.trim(),
      youtube_url: document.getElementById('setYoutubeUrl').value.trim(),
      tiktok_url: document.getElementById('setTiktokUrl').value.trim(),
      twitter_url: document.getElementById('setTwitterUrl').value.trim()
    };

    try {
      showToast(t().toastSavingSettings);
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify(settingsData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(t().toastSaveSuccess);
      } else {
        showToast(data.message || (currentAdminLang === 'en' ? 'Error saving settings' : 'حدث خطأ أثناء حفظ الإعدادات'), 'error');
      }
    } catch (err) {
      showToast(currentAdminLang === 'en' ? 'Unable to connect to server' : 'تعذر الاتصال بالسيرفر لحفظ الإعدادات', 'error');
    }
  });
}
