export const CATEGORIES = [
  { id: 'roads', nameKey: 'roads', icon: 'trail-sign-outline', library: 'Ionicons' },
  { id: 'streetLights', nameKey: 'streetLights', icon: 'bulb-outline', library: 'Ionicons' },
  { id: 'water', nameKey: 'water', icon: 'water-outline', library: 'Ionicons' },
  { id: 'garbage', nameKey: 'garbage', icon: 'trash-outline', library: 'Ionicons' },
  { id: 'drainage', nameKey: 'drainage', icon: 'git-merge-outline', library: 'Ionicons' },
  { id: 'transport', nameKey: 'transport', icon: 'bus-outline', library: 'Ionicons' },
  { id: 'electricity', nameKey: 'electricity', icon: 'flash-outline', library: 'Ionicons' },
  { id: 'other', nameKey: 'other', icon: 'grid-outline', library: 'Ionicons' },
];

export const INITIAL_COMPLAINTS = [
  {
    id: 'TN-2026-004821',
    category: 'streetLights',
    categoryKey: 'streetLights',
    status: 'inProgress',
    titleEn: 'Damaged Post - Ward 4, Anna Nagar',
    titleTa: 'சேதமடைந்த மின்கம்பம் - வார்டு 4, அண்ணா நகர்',
    descEn: 'Damaged metal electric post leaning dangerously towards Anna Park boundary wall. Sparking observed during recent rain.',
    descTa: 'அண்ணா பூங்கா சுவரை நோக்கி ஆபத்தான முறையில் சாய்ந்துள்ள இரும்பு மின் கம்பம். மழை நேரத்தில் தீப்பொறி பறக்கிறது.',
    locationEn: 'Opposite to Gate 2, Anna Park Main Road, Anna Nagar',
    locationTa: 'கேட் 2 எதிரில், அண்ணா பூங்கா பிரதான சாலை, அண்ணா நகர்',
    dateEn: 'Oct 12, 2026',
    dateTa: 'அக் 12, 2026',
    fullDateTimeEn: 'Oct 12, 2026 - 10:30 AM',
    fullDateTimeTa: 'அக் 12, 2026 - முற்பகல் 10:30',
    media: [
      require('../../assets/sample-damaged-pole.jpg'),
      require('../../assets/sample-drainage.jpg'),
    ],
    officialUpdate: {
      en: {
        title: 'Assigned to Ward 12 Engineer',
        desc: 'AE Senthil Kumar has been dispatched for inspection. Expected resolution within 48 hours.',
      },
      ta: {
        title: 'வார்டு 12 பொறியாளருக்கு ஒதுக்கப்பட்டுள்ளது',
        desc: 'உதவி பொறியாளர் செந்தில் குமார் கள ஆய்வுக்கு அனுப்பப்பட்டுள்ளார். 48 மணி நேரத்திற்குள் தீர்வு காணப்படும்.',
      }
    },
    timeline: [
      { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
      { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: 'completed' },
      { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: 'completed' },
      { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: 'active' },
      { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: 'pending' },
    ]
  },
  {
    id: 'TN-2026-004682',
    category: 'garbage',
    categoryKey: 'garbage',
    status: 'inProgress',
    titleEn: 'Garbage Pile Overflow on corner street',
    titleTa: 'தெரு முனையில் குப்பைகள் தேக்கம்',
    descEn: 'Large overflow of waste accumulating near street corner creating foul smell.',
    descTa: 'தெரு முனையில் அதிக அளவில் குப்பைகள் தேங்கி துர்நாற்றம் வீசுகிறது.',
    locationEn: 'Corner Street, Anna Nagar West',
    locationTa: 'முனைத் தெரு, அண்ணா நகர் மேற்கு',
    dateEn: 'Sep 28, 2026',
    dateTa: 'செப் 28, 2026',
    fullDateTimeEn: 'Sep 28, 2026 - 09:15 AM',
    fullDateTimeTa: 'செப் 28, 2026 - முற்பகல் 09:15',
    media: [require('../../assets/sample-drainage.jpg')],
    officialUpdate: {
      en: {
        title: 'Sanitation Unit Assigned',
        desc: 'Truck assigned for immediate clearing.',
      },
      ta: {
        title: 'துப்புரவுப் பிரிவுக்கு ஒதுக்கப்பட்டது',
        desc: 'உடனடி அகற்றலுக்கு வாகனம் ஒதுக்கப்பட்டுள்ளது.',
      }
    },
    timeline: [
      { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
      { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: 'completed' },
      { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: 'active' },
      { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: 'pending' },
      { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: 'pending' },
    ]
  },
  {
    id: 'TN-2026-004512',
    category: 'drainage',
    categoryKey: 'drainage',
    status: 'inProgress',
    titleEn: 'Drainage Block / Blockage - Sector 8',
    titleTa: 'கழிவுநீர் அடைப்பு - செக்டார் 8',
    descEn: 'Underground drainage line blocked and overflowing on road.',
    descTa: 'பாதாள சாக்கடை அடைபட்டு சாலையில் கழிவுநீர் பெருக்கெடுத்து ஓடுகிறது.',
    locationEn: 'Sector 8, Main Avenue',
    locationTa: 'செக்டார் 8, மெயின் அவென்யூ',
    dateEn: 'Sep 15, 2026',
    dateTa: 'செப் 15, 2026',
    fullDateTimeEn: 'Sep 15, 2026 - 11:45 AM',
    fullDateTimeTa: 'செப் 15, 2026 - முற்பகல் 11:45',
    media: [require('../../assets/sample-drainage.jpg')],
    officialUpdate: {
      en: {
        title: 'Jetting Team Dispatched',
        desc: 'Suction and desilting in progress.',
      },
      ta: {
        title: 'கழிவுநீர் தூர்வாரும் குழு அனுப்பப்பட்டுள்ளது',
        desc: 'அடைப்பு நீக்கும் பணி நடைபெற்று வருகிறது.',
      }
    },
    timeline: [
      { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
      { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: 'active' },
      { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: 'pending' },
      { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: 'pending' },
      { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: 'pending' },
    ]
  },
  {
    id: 'TN-2026-003920',
    category: 'roads',
    categoryKey: 'roads',
    status: 'resolved',
    titleEn: 'Road Resurfacing & White Lane Markings - Luz Church Road',
    titleTa: 'புதிய தார் சாலை மற்றும் வெள்ளை கோடுகள் அமைத்தல் - லஸ் சர்ச் சாலை',
    descEn: 'Severely potholed road completely resurfaced with fresh asphalt tarmac and pedestrian zebra crossings.',
    descTa: 'குண்டும் குழியுமாக இருந்த சாலை முழுமையாக சீரமைக்கப்பட்டு புதிய தார் சாலையாக மாற்றப்பட்டது.',
    locationEn: 'Ward 8, Luz Church Road, Chennai',
    locationTa: 'வார்டு 8, லஸ் சர்ச் சாலை, சென்னை',
    dateEn: 'Oct 04, 2026',
    dateTa: 'அக் 04, 2026',
    fullDateTimeEn: 'Oct 04, 2026 - 05:00 PM',
    fullDateTimeTa: 'அக் 04, 2026 - பிற்பகல் 05:00',
    media: [require('../../assets/resolved-road.jpg')],
    officialUpdate: {
      en: {
        title: 'Road Completed & Verified by Highway Engineer',
        desc: 'New tar road laid down with quality inspection passed.',
        adminPhotos: [require('../../assets/resolved-road.jpg')],
      },
      ta: {
        title: 'சாலைப் பணி நிறைவடைந்தது - நெடுஞ்சாலை பொறியாளர் சான்றிதழ்',
        desc: 'தரக் கட்டுப்பாட்டு சோதனை நிறைவுற்று பொதுமக்கள் பயன்பாட்டுக்கு திறக்கப்பட்டது.',
        adminPhotos: [require('../../assets/resolved-road.jpg')],
      }
    },
    timeline: [
      { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
      { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: 'completed' },
      { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: 'completed' },
      { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: 'completed' },
      { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: 'completed' },
    ]
  },
  {
    id: 'TN-2026-004118',
    category: 'streetLights',
    categoryKey: 'streetLights',
    status: 'resolved',
    titleEn: 'New Modern LED Street Light Post - Avenue 4',
    titleTa: 'புதிய நவீன LED தெருவிளக்கு கம்பம் அமைத்தல் - அவென்யூ 4',
    descEn: 'Damaged pole replaced with sturdy galvanized steel pole and 120W energy-efficient LED light.',
    descTa: 'பழுதடைந்த பழைய மின்கம்பம் அகற்றப்பட்டு புதிய உறுதியான LED மின்கம்பம் நிறுவப்பட்டது.',
    locationEn: 'Avenue 4, Anna Nagar West, Chennai',
    locationTa: 'அவென்யூ 4, அண்ணா நகர் மேற்கு, சென்னை',
    dateEn: 'Oct 06, 2026',
    dateTa: 'அக் 06, 2026',
    fullDateTimeEn: 'Oct 06, 2026 - 06:30 PM',
    fullDateTimeTa: 'அக் 06, 2026 - பிற்பகல் 06:30',
    media: [require('../../assets/resolved-light.jpg')],
    officialUpdate: {
      en: {
        title: 'Electrical Inspection Verified',
        desc: 'Connected to automated central lighting control.',
        adminPhotos: [require('../../assets/resolved-light.jpg')],
      },
      ta: {
        title: 'மின் ஆய்வு நிறைவுற்று விளக்குகள் எரியத் தொடங்கின',
        desc: 'தானியங்கி கட்டுப்பாட்டுடன் புதிய LED விளக்குகள் பயன்பாட்டுக்கு வந்தன.',
        adminPhotos: [require('../../assets/resolved-light.jpg')],
      }
    },
    timeline: [
      { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
      { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: 'completed' },
      { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: 'completed' },
      { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: 'completed' },
      { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: 'completed' },
    ]
  },
  {
    id: 'TN-2026-004230',
    category: 'garbage',
    categoryKey: 'garbage',
    status: 'resolved',
    titleEn: 'Waste Dump Cleaned & Beautified with Green Planters',
    titleTa: 'குப்பை மேடு அகற்றப்பட்டு பசுமைப் பூங்காவாக மாற்றம் - ஆழ்வார்பேட்டை',
    descEn: 'Chronic open garbage dumping spot cleared completely and transformed into neat tiled sidewalk with green landscaping.',
    descTa: 'நீண்ட நாட்களாக குப்பைகள் கொட்டப்பட்ட பகுதி முற்றிலும் சுத்தம் செய்யப்பட்டு நடைபாதை பூங்காவாக மாற்றப்பட்டது.',
    locationEn: 'MG Road Junction, Alwarpet, Chennai',
    locationTa: 'எம்.ஜி. ரோடு சந்திப்பு, ஆழ்வார்பேட்டை, சென்னை',
    dateEn: 'Oct 09, 2026',
    dateTa: 'அக் 09, 2026',
    fullDateTimeEn: 'Oct 09, 2026 - 02:00 PM',
    fullDateTimeTa: 'அக் 09, 2026 - பிற்பகல் 02:00',
    media: [require('../../assets/resolved-garbage.jpg')],
    officialUpdate: {
      en: {
        title: 'Sanitation Squad Transformation Complete',
        desc: 'Area beautified with waste bins and plants. Daily monitoring active.',
        adminPhotos: [require('../../assets/resolved-garbage.jpg')],
      },
      ta: {
        title: 'துப்புரவுப் பணியால் முழுமையான மாற்றம்',
        desc: 'குப்பைத் தொட்டிகள் மற்றும் பூச்செடிகள் வைக்கப்பட்டு தூய்மை உறுதி செய்யப்பட்டது.',
        adminPhotos: [require('../../assets/resolved-garbage.jpg')],
      }
    },
    timeline: [
      { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
      { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: 'completed' },
      { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: 'completed' },
      { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: 'completed' },
      { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: 'completed' },
    ]
  },
  {
    id: 'TN-2026-004712',
    category: 'water',
    categoryKey: 'water',
    status: 'resolved',
    titleEn: 'Water Pipe Leakage - Gandhi Road',
    titleTa: 'குடிநீர் குழாய் கசிவு - காந்தி சாலை',
    descEn: 'Main distribution pipe leakage causing water waste.',
    descTa: 'முக்கிய விநியோகக் குழாயில் உடைப்பு ஏற்பட்டு குடிநீர் வீணாகிறது.',
    locationEn: 'Gandhi Road, Near Bus Terminus',
    locationTa: 'காந்தி சாலை, பேருந்து நிலையம் அருகே',
    dateEn: 'Oct 08, 2026',
    dateTa: 'அக் 08, 2026',
    fullDateTimeEn: 'Oct 08, 2026 - 08:30 AM',
    fullDateTimeTa: 'அக் 08, 2026 - முற்பகல் 08:30',
    media: [require('../../assets/sample-drainage.jpg')],
    officialUpdate: {
      en: {
        title: 'Pipe Repaired Successfully',
        desc: 'New valve installed and pressure tested.',
      },
      ta: {
        title: 'குழாய் வெற்றிகரமாக சரிசெய்யப்பட்டது',
        desc: 'புதிய வால்வு பொருத்தப்பட்டு நீர் விநியோகம் சீரமைக்கப்பட்டது.',
      }
    },
    timeline: [
      { id: '1', titleKey: 'step1Title', descKey: 'step1Desc', timeKey: 'step1Time', status: 'completed' },
      { id: '2', titleKey: 'step2Title', descKey: 'step2Desc', timeKey: 'step2Time', status: 'completed' },
      { id: '3', titleKey: 'step3Title', descKey: 'step3Desc', timeKey: 'step3Time', status: 'completed' },
      { id: '4', titleKey: 'step4Title', descKey: 'step4Desc', timeKey: 'step4Time', status: 'completed' },
      { id: '5', titleKey: 'step5Title', descKey: 'step5Desc', timeKey: 'step5Time', status: 'completed' },
    ]
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    complaintId: 'TN-2026-004821',
    titleKey: 'notificationItem1Title',
    descKey: 'notificationItem1Desc',
    timeKey: 'notificationItem1Time',
    unread: true,
    icon: 'notifications',
    iconColor: '#D32F2F',
  },
  {
    id: 'notif-2',
    complaintId: 'TN-2026-004712',
    titleKey: 'notificationItem2Title',
    descKey: 'notificationItem2Desc',
    timeKey: 'notificationItem2Time',
    unread: true,
    icon: 'water',
    iconColor: '#D32F2F',
  },
  {
    id: 'notif-3',
    complaintId: 'TN-2026-004821',
    titleKey: 'notificationItem3Title',
    descKey: 'notificationItem3Desc',
    timeKey: 'notificationItem3Time',
    unread: false,
    icon: 'checkmark-circle',
    iconColor: '#6B7280',
  },
  {
    id: 'notif-4',
    complaintId: 'TN-2026-004712',
    titleKey: 'notificationItem4Title',
    descKey: 'notificationItem4Desc',
    timeKey: 'notificationItem4Time',
    unread: false,
    icon: 'document-text',
    iconColor: '#6B7280',
  },
];
