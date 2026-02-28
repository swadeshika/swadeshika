import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTrackingUrl(carrier: string, trackingNumber: string): string {
  if (!carrier || !trackingNumber) return '#';

  const c = carrier.toLowerCase().replace(/\s+/g, '');

  if (c.includes('bluedart')) {
    return `https://bluedart.com/trackdartresultthirdparty?trackFor=0&trackNo=${trackingNumber}`;
  }
  if (c.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${trackingNumber}`;
  }
  if (c.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  }
  if (c.includes('indiapost')) {
    return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
    // India Post doesn't easily support query params for direct result, usually just the page.
  }
  if (c.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp`;
  }

  return '#';
}

import { transliterate } from 'transliteration';

// Custom dictionary for better Hinglish transliteration
const HIN_ENG_DICTIONARY: Record<string, string> = {
  // Common Grammar/Stopwords
  'के': 'ke', 'का': 'ka', 'की': 'ki', 'को': 'ko', 'में': 'mein', 'से': 'se', 'पर': 'par',
  'और': 'aur', 'है': 'hai', 'हैं': 'hain', 'ही': 'hi', 'भी': 'bhi', 'तो': 'toh',
  'ना': 'na', 'न': 'na', 'नहीं': 'nahi', 'नही': 'nahi',
  'तथा': 'tatha', 'एवं': 'evam', 'या': 'ya',
  'मैं': 'main', 'हम': 'hum', 'तुम': 'tum', 'आप': 'aap',
  'था': 'tha', 'थी': 'thi', 'थे': 'the', 'गा': 'ga', 'गी': 'gi', 'गे': 'ge',
  'हो': 'ho', 'हुए': 'hue', 'हुआ': 'hua',
  'वाला': 'wala', 'वाले': 'wale', 'वाली': 'wali',
  'लिए': 'liye', 'लिये': 'liye',
  'द्वारा': 'dwara',

  // Questions
  'क्या': 'kya', 'क्यों': 'kyun', 'कैसे': 'kaise', 'कब': 'kab', 'कहाँ': 'kahan', 'कौन': 'kaun',
  'किस': 'kis', 'किसका': 'kiska', 'किसको': 'kisko',

  // Quantifiers
  'कुछ': 'kuch', 'सब': 'sab', 'सभी': 'sabhi', 'हर': 'har', 'प्रत्येक': 'pratyek',
  'कम': 'kam', 'ज्यादा': 'zyada', 'अधिक': 'adhik', 'बहुत': 'bahut',

  // People/Relationships
  'घर': 'ghar', 'परिवार': 'parivar', 'दोस्त': 'dost', 'मित्र': 'mitra',
  'बच्चे': 'bachche', 'बच्चों': 'bachchon', 'महिला': 'mahila', 'पुरुष': 'purush',
  'लोग': 'log', 'लोगों': 'logon',

  // Health & Body
  'सहत': 'sehat', 'स्वास्थ्य': 'swasthya', 'शरीर': 'sharir', 'पेट': 'pet', 'बाल': 'baal',
  'त्वचा': 'tvacha', 'चेहरा': 'chehra', 'आँखें': 'aankhein', 'दांत': 'daant',
  'इलाज': 'ilaaj', 'उपचार': 'upchar', 'फायदे': 'fayde', 'लाभ': 'laabh', 'नुकसान': 'nuksan',
  'रोग': 'rog', 'बीमारी': 'bimari', 'दर्द': 'dard', 'वजन': 'wazan', 'मोटापा': 'motapa',
  'योग': 'yoga', 'व्यायाम': 'vyayam', 'हर्बल': 'herbal', 'आयुर्वेद': 'ayurveda', 'आयुर्वेदिक': 'ayurvedic',

  // Food & Kitchen
  'खाना': 'khana', 'भोजन': 'bhojan', 'आहार': 'aahar', 'पोषण': 'poshan',
  'पानी': 'pani', 'जल': 'jal', 'दूध': 'doodh', 'दही': 'dahi', 'घी': 'ghee', 'मक्खन': 'makkhan',
  'मसाले': 'masale', 'मसाला': 'masala', 'नमक': 'namak', 'चीनी': 'chini', 'शक्कर': 'shakkar', 'गुड़': 'jaggery',
  'चाय': 'chai', 'कॉफी': 'coffee', 'फल': 'phal', 'सब्जी': 'sabzi', 'दाल': 'dal', 'चावल': 'chawal', 'रोटी': 'roti',
  'रसोई': 'rasoi', 'पकवान': 'pakwan', 'रेसिपी': 'recipe',

  // Nature/Environment
  'प्रकृति': 'prakriti', 'पर्यावरण': 'paryavaran', 'जमीन': 'zameen', 'मिट्टी': 'mitti',
  'पेड़': 'ped', 'पौधे': 'paudhe', 'फूल': 'phool', 'खेती': 'kheti', 'किसान': 'kisan',
  'गाय': 'cow', 'गौ': 'gau',

  // General/Abstract
  'बात': 'baat', 'बाते': 'baatein', 'बातों': 'baaton',
  'काम': 'kaam', 'कार्य': 'karya', 'समय': 'samay', 'वक्त': 'waqt',
  'आज': 'aaj', 'कल': 'kal', 'रोज': 'roz', 'दिन': 'din', 'रात': 'raat',
  'साल': 'saal', 'महीना': 'mahina', 'हफ्ता': 'hafta',
  'जीवन': 'jeevan', 'जिंदगी': 'zindagi', 'लाइफ': 'life',
  'दुनिया': 'duniya', 'विश्व': 'vishva', 'जगह': 'jagah',
  'तरीका': 'tarika', 'तरीके': 'tarike', 'उपाय': 'upay', 'नुस्खे': 'nuskhe',
  'महत्व': 'mahatva', 'जरूरी': 'zaroori', 'ज़रूरी': 'zaroori', 'आवश्यक': 'avashyak',
  'बेहतर': 'behtar', 'अच्छा': 'accha', 'सही': 'sahi', 'गलत': 'galat',
  'सत्य': 'satya', 'झूठ': 'jhooth',
  'कारण': 'karan', 'वजह': 'vajah',
  'सूची': 'suchi', 'लिस्ट': 'list',

  // Tech/Modern
  'टेक्नोलॉजी': 'technology', 'टेक': 'tech', 'मोबाइल': 'mobile', 'एप': 'app',
  'वीडियो': 'video', 'फोटो': 'photo', 'इमेज': 'image',
  'ऑनलाइन': 'online', 'डिजिटल': 'digital', 'बिजनेस': 'business', 'व्यापार': 'vyapar',

  // E-commerce Specific
  'खरीदें': 'kharidein', 'बेचें': 'bechein', 'ऑफर': 'offer', 'सेल': 'cell',
  'सस्ता': 'sasta', 'महंगा': 'mehenga', 'दाम': 'daam', 'कीमत': 'keemat', 'रेट': 'rate',
  'प्रोडक्ट': 'product', 'सामान': 'saman', 'वस्तु': 'vastu',
  'केमिकल': 'chemical', 'फ्री': 'free', 'नैचुरल': 'natural', 'शुद्ध': 'shuddh', 'असली': 'asli',
  'देसी': 'desi', 'विदेशी': 'videshi'
};

/**
 * Generates a URL-friendly slug that supports Unicode characters (e.g., Hindi).
 * Now supports Enhanced Hinglish transliteration for better UX.
 * Replaces spaces with hyphens.
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  // Ensure text is a string
  const stringText = String(text);

  // 0. Pre-process text to handle dictionary words
  const cleanText = stringText.replace(/-/g, ' ');
  const words = cleanText.split(/\s+/);

  const processedWords = words.map(word => {
    // Clean punctuation for lookup
    const cleanWord = word.replace(/[^\p{L}\p{M}]/gu, '');

    // Dictionary Lookup (Exact match)
    if (HIN_ENG_DICTIONARY[cleanWord]) {
      return HIN_ENG_DICTIONARY[cleanWord];
    }

    // Fallback to Transliteration
    let t = transliterate(word);

    // Fix: "hr" -> "har", "ghr" -> "ghar"
    if (t === 'hr') return 'har';
    if (t === 'ghr') return 'ghar';
    if (t === 'pr') return 'par';
    if (t === 'sr') return 'sar';
    if (t === 'mr') return 'mar';
    if (t === 'kr') return 'kar';

    // Fix: "msaale" -> "masale"
    if (t.startsWith('ms')) return t.replace('ms', 'mas');

    return t;
  });

  const latinText = processedWords.join(' ');

  return latinText
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Keep alphanumerics, spaces, hyphens
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-');     // Remove duplicate hyphens
}

/**
 * Formats a Date object or ISO string to MySQL compatible DATETIME string (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateForMySQL(date: Date | string): string {
  if (!date) return '';
  const d = new Date(date);

  // Ensure valid date
  if (isNaN(d.getTime())) return '';

  return d.toISOString().slice(0, 19).replace('T', ' ');
}
