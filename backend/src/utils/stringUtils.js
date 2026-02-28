const { transliterate } = require('transliteration');

// Custom dictionary for better Hinglish transliteration
const HIN_ENG_DICTIONARY = {
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
 * Generate a URL-friendly slug from a string (Enhanced Hinglish Supported)
 * @param {string} text - The text to slugify
 * @returns {string} - The slugified string
 */
exports.slugify = (text) => {
    if (!text) return '';
    
    // Ensure text is a string
    const stringText = String(text);

    // 0. Pre-process text to handle dictionary words
    // Replace hyphens with spaces so we can match individual words in dictionary
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
        // "मेरा भारत" -> "mera bharat"
        let t = transliterate(word);
        
        // Fix: "hr" -> "har", "ghr" -> "ghar" (common missing vowels for short words)
        if (t === 'hr') return 'har';
        if (t === 'ghr') return 'ghar';
        if (t === 'pr') return 'par';
        if (t === 'sr') return 'sar';
        if (t === 'mr') return 'mar';
        if (t === 'kr') return 'kar';
        
        // Fix: "msaale" -> "masale" (missing 'a' after m)
        if (t.startsWith('ms')) return t.replace('ms', 'mas');

        return t;
    });

    const latinText = processedWords.join(' ');

    return latinText
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '');         // Trim - from end of text
};
