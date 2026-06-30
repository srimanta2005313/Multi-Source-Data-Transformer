import parsePhoneNumber, { CountryCode } from 'libphonenumber-js';

// --- Canonical Skills Map (50+ entries) ---
export const CANONICAL_SKILLS: Record<string, string> = {
  // Languages
  "js": "JavaScript",
  "javascript": "JavaScript",
  "ts": "TypeScript",
  "typescript": "TypeScript",
  "py": "Python",
  "python": "Python",
  "pytohn": "Python", // fuzzy-match typo example
  "java": "Java",
  "cpp": "C++",
  "cplusplus": "C++",
  "c#": "C#",
  "csharp": "C#",
  "go": "Go",
  "golang": "Go",
  "rust": "Rust",
  "ruby": "Ruby",
  "php": "PHP",
  "swift": "Swift",
  "kotlin": "Kotlin",
  "scala": "Scala",
  "r": "R",
  "solidity": "Solidity",
  
  // Frontend
  "html": "HTML",
  "html5": "HTML",
  "css": "CSS",
  "css3": "CSS",
  "react": "React",
  "reactjs": "React",
  "vue": "Vue",
  "vuejs": "Vue",
  "angular": "Angular",
  "angularjs": "Angular",
  "svelte": "Svelte",
  "nextjs": "Next.js",
  "next": "Next.js",
  "tailwindcss": "Tailwind CSS",
  "tailwind": "Tailwind CSS",
  
  // Backend & DB
  "express": "Express.js",
  "expressjs": "Express.js",
  "django": "Django",
  "flask": "Flask",
  "spring": "Spring Boot",
  "springboot": "Spring Boot",
  "postgres": "PostgreSQL",
  "postgresql": "PostgreSQL",
  "mysql": "MySQL",
  "mongodb": "MongoDB",
  "redis": "Redis",
  "cassandra": "Cassandra",
  "sqlite": "SQLite",
  "graphql": "GraphQL",
  "node": "Node.js",
  "nodejs": "Node.js",
  
  // Cloud & DevOps
  "docker": "Docker",
  "k8s": "Kubernetes",
  "kubernetes": "Kubernetes",
  "aws": "AWS",
  "gcp": "Google Cloud Platform",
  "azure": "Azure",
  "terraform": "Terraform",
  "ansible": "Ansible",
  "jenkins": "Jenkins",
  "github": "GitHub Actions",
  "git": "Git",
  "cicd": "CI/CD",
  
  // AI/ML & Data
  "ml": "Machine Learning",
  "machinelearning": "Machine Learning",
  "dl": "Deep Learning",
  "deeplearning": "Deep Learning",
  "ai": "Artificial Intelligence",
  "nlp": "Natural Language Processing",
  "tensorflow": "TensorFlow",
  "pytorch": "PyTorch",
  "keras": "Keras",
  "scikit": "Scikit-Learn",
  "scikitlearn": "Scikit-Learn",
  "spark": "Apache Spark",
  "hadoop": "Apache Hadoop",
  "kafka": "Apache Kafka",
  "tableau": "Tableau",
  "pandas": "Pandas",
  "numpy": "NumPy",
  
  // Design & Other
  "figma": "Figma",
  "jira": "Jira",
  "agile": "Agile"
};

// --- ISO-3166 Alpha-2 Country Mapping (50+ entries) ---
export const COUNTRY_MAP: Record<string, string> = {
  "united states": "US",
  "united states of america": "US",
  "usa": "US",
  "us": "US",
  "india": "IN",
  "ind": "IN",
  "bharat": "IN",
  "united kingdom": "GB",
  "uk": "GB",
  "gb": "GB",
  "canada": "CA",
  "can": "CA",
  "germany": "DE",
  "deutschland": "DE",
  "de": "DE",
  "france": "FR",
  "fr": "FR",
  "australia": "AU",
  "aus": "AU",
  "singapore": "SG",
  "sgp": "SG",
  "sg": "SG",
  "japan": "JP",
  "jpn": "JP",
  "jp": "JP",
  "china": "CN",
  "chn": "CN",
  "brazil": "BR",
  "bra": "BR",
  "netherlands": "NL",
  "nld": "NL",
  "nl": "NL",
  "sweden": "SE",
  "swe": "SE",
  "se": "SE",
  "switzerland": "CH",
  "che": "CH",
  "ch": "CH",
  "spain": "ES",
  "esp": "ES",
  "es": "ES",
  "italy": "IT",
  "ita": "IT",
  "it": "IT",
  "russia": "RU",
  "russian federation": "RU",
  "ru": "RU",
  "south africa": "ZA",
  "zaf": "ZA",
  "za": "ZA",
  "mexico": "MX",
  "mex": "MX",
  "mx": "MX",
  "ireland": "IE",
  "irl": "IE",
  "ie": "IE",
  "new zealand": "NZ",
  "nzl": "NZ",
  "nz": "NZ",
  "austria": "AT",
  "belgium": "BE",
  "denmark": "DK",
  "finland": "FI",
  "norway": "NO",
  "poland": "PL",
  "portugal": "PT",
  "south korea": "KR",
  "kr": "KR",
  "malaysia": "MY",
  "mys": "MY",
  "my": "MY",
  "indonesia": "ID",
  "idn": "ID",
  "id": "ID",
  "vietnam": "VN",
  "vnm": "VN",
  "vn": "VN",
  "philippines": "PH",
  "phl": "PH",
  "ph": "PH"
};

// --- Standard Levenshtein Distance Helper ---
export function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

// --- Name Normalization: Trim and Title Case ---
export function normalizeName(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// --- Email Normalization: Lowercase, trim ---
export function normalizeEmail(email: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

// --- Country Normalization to ISO-3166 alpha-2 ---
export function normalizeCountry(countryText: string): string {
  if (!countryText) return "";
  const clean = countryText.trim().toLowerCase();
  if (COUNTRY_MAP[clean]) {
    return COUNTRY_MAP[clean];
  }
  // Try finding as substring or returning original capitalized if not found (defaulting to empty/unknown if strictly matching)
  for (const [key, value] of Object.entries(COUNTRY_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return value;
    }
  }
  return countryText.toUpperCase().slice(0, 2); // Fallback to 2-char upper
}

// --- Phone Normalization: Convert to E.164 using libphonenumber-js ---
export function normalizePhone(
  phoneText: string,
  countryHint?: string
): { phone: string; note?: string } {
  if (!phoneText) return { phone: "" };
  
  let cleanPhone = phoneText.trim().replace(/[^\d+()-\s]/g, '');
  
  // Resolve country code from Hint
  let resolvedCountry: CountryCode = "US"; // default fallback
  let note: string | undefined = undefined;
  
  if (countryHint) {
    const iso = normalizeCountry(countryHint);
    if (iso && iso.length === 2) {
      resolvedCountry = iso as CountryCode;
    }
  } else {
    note = "No country code provided or inferred; fell back to +1 (US) standard.";
  }
  
  try {
    // If it starts with +, try parsing directly
    if (cleanPhone.startsWith('+')) {
      const parsed = parsePhoneNumber(cleanPhone);
      if (parsed && parsed.isValid()) {
        return { phone: parsed.number };
      }
    }
    
    // Parse with resolved country fallback
    const parsed = parsePhoneNumber(cleanPhone, resolvedCountry);
    if (parsed && parsed.isValid()) {
      return { phone: parsed.number, note };
    }
  } catch (err) {
    // Ignore and fallback
  }
  
  // Manual digits-only fallback if parsing fails
  const digits = cleanPhone.replace(/\D/g, '');
  if (digits.length >= 10) {
    if (cleanPhone.startsWith('+')) {
      return { phone: `+${digits}`, note: "Parsed via soft-fallback formatting." };
    }
    const code = resolvedCountry === "IN" ? "91" : "1";
    return {
      phone: `+${digits.startsWith(code) ? '' : code}${digits}`,
      note: `Parsed via digit extraction fallback with country hint code +${code}`
    };
  }
  
  return { phone: phoneText.trim(), note: "Failed standard E.164 validation" };
}

// --- Date Normalization to YYYY-MM ---
export function normalizeDate(dateText: string): string | null {
  if (!dateText) return null;
  const clean = dateText.trim().toLowerCase();
  
  if (clean === 'present' || clean === 'current' || clean === 'now' || clean === 'till date') {
    return null;
  }
  
  // Month maps for textual date extraction
  const months: Record<string, string> = {
    jan: '01', january: '01',
    feb: '02', february: '02',
    mar: '03', march: '03',
    apr: '04', april: '04',
    may: '05',
    jun: '06', june: '06',
    jul: '07', july: '07',
    aug: '08', august: '08',
    sep: '09', september: '09', sept: '09',
    oct: '10', october: '10',
    nov: '11', november: '11',
    dec: '12', december: '12'
  };
  
  // Case 1: Already YYYY-MM
  if (/^\d{4}-\d{2}$/.test(clean)) {
    return clean;
  }
  
  // Case 2: MM/YYYY or MM-YYYY
  const slashMatch = clean.match(/^(\d{1,2})[\/-](\d{4})$/);
  if (slashMatch) {
    const m = slashMatch[1].padStart(2, '0');
    const y = slashMatch[2];
    return `${y}-${m}`;
  }
  
  // Case 3: YYYY
  if (/^\d{4}$/.test(clean)) {
    return `${clean}-01`;
  }
  
  // Case 4: "Month YYYY" or "Month, YYYY" (e.g. "January 2021", "Jan 21", "Jan, 2021")
  const textMatch = clean.match(/([a-z]{3,})\s*,?\s*(\d{2,4})/);
  if (textMatch) {
    const monthStr = textMatch[1].slice(0, 3);
    const m = months[monthStr] || '01';
    let yearStr = textMatch[2];
    if (yearStr.length === 2) {
      // Guess century
      yearStr = parseInt(yearStr, 10) > 50 ? `19${yearStr}` : `20${yearStr}`;
    }
    return `${yearStr}-${m}`;
  }
  
  // Case 5: Raw digits check like "202106"
  if (/^\d{6}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}`;
  }
  
  return null;
}

// --- Skill Normalization with Levenshtein fuzzy match ---
export function normalizeSkill(skillText: string): string {
  if (!skillText) return "";
  const clean = skillText.trim().toLowerCase();
  
  // Direct match in canonical map
  if (CANONICAL_SKILLS[clean]) {
    return CANONICAL_SKILLS[clean];
  }
  
  // Fuzzy match against all keys
  let bestMatch: string | null = null;
  let minDistance = Infinity;
  
  for (const key of Object.keys(CANONICAL_SKILLS)) {
    // Use Levenshtein distance
    const dist = getLevenshteinDistance(clean, key);
    
    // Threshold calculation:
    // Max edit distance is 2 for short skills, or up to 30% of the key length
    const threshold = Math.max(2, Math.floor(key.length * 0.3));
    if (dist <= threshold && dist < minDistance) {
      minDistance = dist;
      bestMatch = CANONICAL_SKILLS[key];
    }
  }
  
  if (bestMatch) {
    return bestMatch;
  }
  
  // Default fallback: Title case the raw input
  return skillText
    .trim()
    .split(/[\s-]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
