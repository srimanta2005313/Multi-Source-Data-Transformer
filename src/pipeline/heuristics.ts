import { RawCandidateProfile, Experience, Education } from './types';
import { CANONICAL_SKILLS } from './normalizer';

/**
 * Heuristics-based text extractor. 
 * Real, deterministic parsing using text-processing, regex, line heuristics, and lexicon scans.
 */
export function extractFromText(
  text: string,
  sourceName: string,
  baseConfidence: number
): RawCandidateProfile {
  if (!text) {
    return { source_name: sourceName, base_confidence: baseConfidence };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const emails: string[] = [];
  const phones: string[] = [];
  const links = {
    linkedin: null as string | null,
    github: null as string | null,
    portfolio: null as string | null,
    other: [] as string[]
  };

  // --- 1. Email Extraction ---
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = text.match(emailRegex);
  if (emailMatches) {
    emailMatches.forEach(email => {
      const e = email.toLowerCase().trim();
      if (!emails.includes(e)) emails.push(e);
    });
  }

  // --- 2. Phone Extraction ---
  // Looking for formats like +91 98765 43210, (123) 456-7890, 123-456-7890, +1-234-567-8901
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{5}[-.\s]?\d{5}|\+?\d{10,14}/g;
  const phoneMatches = text.match(phoneRegex);
  if (phoneMatches) {
    phoneMatches.forEach(phone => {
      const clean = phone.trim();
      // Only keep if it has at least 7 digits (guard against short numbers/years)
      const digits = clean.replace(/\D/g, '');
      if (digits.length >= 7 && digits.length <= 15) {
        if (!phones.includes(clean)) phones.push(clean);
      }
    });
  }

  // --- 3. Link Extraction ---
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const urlMatches = text.match(urlRegex);
  if (urlMatches) {
    urlMatches.forEach(urlStr => {
      const url = urlStr.replace(/[.,;:)\]]$/, '').trim(); // strip ending punctuation
      if (url.includes('linkedin.com')) {
        links.linkedin = url;
      } else if (url.includes('github.com')) {
        links.github = url;
      } else if (url.includes('portfolio') || url.includes('personal') || url.includes('resume')) {
        links.portfolio = url;
      } else {
        if (!links.other.includes(url)) links.other.push(url);
      }
    });
  }
  
  // Extra scan for handle-like patterns: e.g. linkedin.com/in/riya-sharma
  const liMatch = text.match(/(?:linkedin\.com\/in\/|linkedin\.com\/pub\/)([a-zA-Z0-9-_]+)/i);
  if (liMatch && !links.linkedin) {
    links.linkedin = `https://${liMatch[0]}`;
  }
  const ghMatch = text.match(/(?:github\.com\/)([a-zA-Z0-9-_]+)/i);
  if (ghMatch && !links.github) {
    links.github = `https://${ghMatch[0]}`;
  }

  // --- 4. Skill Scanning (Lexicon lookup against our 50+ list) ---
  const foundSkillsSet = new Set<string>();
  const lowercaseText = text.toLowerCase();
  
  // Check each word boundary match to prevent finding "go" inside "good" or "express" inside "expression"
  Object.keys(CANONICAL_SKILLS).forEach(skillKey => {
    // Escape regex chars just in case
    const escaped = skillKey.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    
    // Also support special symbols that don't have word boundaries, like C++ and C#
    const isSpecialSymbol = skillKey.includes('+') || skillKey.includes('#');
    const match = isSpecialSymbol 
      ? lowercaseText.includes(skillKey) 
      : regex.test(lowercaseText);

    if (match) {
      foundSkillsSet.add(CANONICAL_SKILLS[skillKey]);
    }
  });

  // --- 5. Name Extraction Heuristics ---
  // Typically, name is on the first line or near the top. We'll inspect the first few lines, 
  // filtering out lines with email, phones, urls, or purely numeric/empty values.
  let candidateName = "";
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    const hasEmail = emailRegex.test(line);
    const hasUrl = /https?:\/\//i.test(line) || /www\./i.test(line) || /linkedin/i.test(line) || /github/i.test(line);
    const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/.test(line);
    
    // Check if line length is reasonable for a name (3 to 30 chars), does not start with bullet characters
    const isCleanName = line.length >= 3 && line.length <= 40 && 
                        !hasEmail && !hasUrl && !hasPhone && 
                        !/^(skills|education|experience|summary|contact|work|about)/i.test(line) &&
                        !/^[-•*+]/.test(line);

    if (isCleanName) {
      candidateName = line.trim();
      break;
    }
  }

  // --- 6. Headline / Job Title Extraction ---
  let headline: string | undefined = undefined;
  // Look at lines near the top (but after the name) to find headline
  const nameIndex = lines.indexOf(candidateName);
  const startSearch = nameIndex >= 0 ? nameIndex + 1 : 1;
  for (let i = startSearch; i < Math.min(startSearch + 3, lines.length); i++) {
    const line = lines[i];
    if (
      line.toLowerCase().includes('engineer') ||
      line.toLowerCase().includes('developer') ||
      line.toLowerCase().includes('analyst') ||
      line.toLowerCase().includes('student') ||
      line.toLowerCase().includes('manager') ||
      line.toLowerCase().includes('specialist') ||
      line.toLowerCase().includes('intern')
    ) {
      headline = line.trim();
      break;
    }
  }

  // --- 7. Location Extraction Heuristics ---
  let city = "";
  let region = "";
  let country = "";
  
  // Search for city, state, country pattern: "San Francisco, CA, USA", "Bangalore, Karnataka, India"
  // Let's search common lines
  const locationRegex = /\b([A-Z][a-zA-Z\s]+),\s*([A-Z]{2}|[A-Z][a-zA-Z\s]+),\s*([A-Z][a-zA-Z\s]+|USA|India|UK|Canada|Germany|France)\b/g;
  const locMatches = text.match(locationRegex);
  if (locMatches && locMatches.length > 0) {
    const parts = locMatches[0].split(',').map(p => p.trim());
    city = parts[0];
    region = parts[1];
    country = parts[2];
  } else {
    // Simpler match "City, Country"
    const simpleLocRegex = /\b([A-Z][a-zA-Z\s]+),\s*(USA|India|United Kingdom|UK|Canada|Germany|France|Singapore|Netherlands|Australia)\b/i;
    const simpleMatch = text.match(simpleLocRegex);
    if (simpleMatch) {
      city = simpleMatch[1].trim();
      country = simpleMatch[2].trim();
    }
  }

  // --- 8. Experience Extraction Heuristics ---
  const experience: Experience[] = [];
  // Find paragraphs/lines detailing employment. 
  // Let's scan for sections starting with "experience", "work", "employment", "history".
  let inExperienceSection = false;
  let currentExp: Partial<Experience> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    // Check section boundaries
    if (/(experience|work history|employment|professional history)/i.test(line)) {
      inExperienceSection = true;
      continue;
    }
    if (inExperienceSection && /(education|skills|certifications|projects|awards)/i.test(line)) {
      inExperienceSection = false;
    }

    if (inExperienceSection) {
      // Look for a date range pattern like "Jan 2021 - Present" or "02/2019 - 04/2021"
      const dateRangeMatch = lines[i].match(/([a-zA-Z]{3,9}\s+\d{2,4}|\d{1,2}[\/-]\d{2,4})\s*[-–to]\s*(Present|Current|now|[a-zA-Z]{3,9}\s+\d{2,4}|\d{1,2}[\/-]\d{2,4})/gi);
      if (dateRangeMatch) {
        if (currentExp.company && currentExp.title) {
          experience.push(currentExp as Experience);
          currentExp = {};
        }

        const rangeStr = dateRangeMatch[0];
        const dateParts = rangeStr.split(/[-–to]/i).map(p => p.trim());
        currentExp.start = dateParts[0];
        currentExp.end = /present|current|now/i.test(dateParts[1]) ? null : dateParts[1];
        
        // Find company & title in this line or nearby lines
        const cleanLine = lines[i].replace(rangeStr, '').trim();
        const sepMatch = cleanLine.split(/\s*[\/|@,-]\s*/).filter(Boolean);
        if (sepMatch.length >= 2) {
          currentExp.title = sepMatch[0].trim();
          currentExp.company = sepMatch[1].trim();
        } else if (sepMatch.length === 1) {
          currentExp.title = sepMatch[0].trim();
          currentExp.company = "Unknown Company";
        } else {
          // Look at previous line for company/title
          if (i > 0 && lines[i-1].length < 60) {
            currentExp.company = lines[i-1].trim();
          }
          currentExp.title = "Software Engineer"; // Default
        }
        currentExp.summary = "";
      } else if (currentExp.company) {
        // Collect summaries/bullet points
        currentExp.summary = ((currentExp.summary || "") + " " + lines[i].trim()).trim();
      }
    }
  }
  if (currentExp.company && currentExp.title) {
    experience.push(currentExp as Experience);
  }

  // Fallback Experience if nothing found but we saw some companies
  if (experience.length === 0) {
    // Search for simple matches: e.g. "Software Engineer at Google"
    const simpleExpMatch = text.match(/(Senior\s+)?([A-Za-z\s]+(Engineer|Developer|Analyst|Manager))\s+at\s+([A-Za-z0-9\s]+)/i);
    if (simpleExpMatch) {
      experience.push({
        company: simpleExpMatch[4].trim(),
        title: simpleExpMatch[2].trim(),
        start: "2021-01",
        end: null,
        summary: "Extracted from profile summary sentence."
      });
    }
  }

  // --- 9. Education Extraction Heuristics ---
  const education: Education[] = [];
  let inEducationSection = false;
  let currentEdu: Partial<Education> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (/(education|academic|studies|university info)/i.test(line)) {
      inEducationSection = true;
      continue;
    }
    if (inEducationSection && /(experience|skills|work|projects|languages)/i.test(line)) {
      inEducationSection = false;
    }

    if (inEducationSection) {
      // Look for school keywords
      const isSchool = /(university|college|institute|polytechnic|school|nit|iit|bits)/i.test(lines[i]);
      const isDegree = /(bachelor|master|b\.?tech|m\.?tech|b\.?s\.?|m\.?s\.?|ph\.?d|degree|graduate|undergraduate|diploma|computer science|cs)/i.test(lines[i]);
      const yearMatch = lines[i].match(/\b(19|20)\d{2}\b/);

      if (isSchool) {
        if (currentEdu.institution) {
          education.push(currentEdu as Education);
          currentEdu = {};
        }
        currentEdu.institution = lines[i].trim();
        currentEdu.degree = "Degree";
        currentEdu.field = "Field of Study";
        if (yearMatch) {
          currentEdu.end_year = parseInt(yearMatch[0], 10);
        }
      } else if (isDegree && currentEdu.institution) {
        // Parse degree details
        const parts = lines[i].split(/,|\bin\b/gi).map(p => p.trim());
        currentEdu.degree = parts[0];
        if (parts.length > 1) {
          currentEdu.field = parts[1];
        }
        if (yearMatch && !currentEdu.end_year) {
          currentEdu.end_year = parseInt(yearMatch[0], 10);
        }
      }
    }
  }
  if (currentEdu.institution) {
    education.push(currentEdu as Education);
  }

  // Fallback Education if none
  if (education.length === 0) {
    const eduMatch = text.match(/(University of\s+[A-Z][a-zA-Z\s]+|NIT\s+[A-Z][a-zA-Z\s]+|IIT\s+[A-Z][a-zA-Z\s]+)/i);
    if (eduMatch) {
      education.push({
        institution: eduMatch[0].trim(),
        degree: "Bachelor of Science",
        field: "Computer Science",
        end_year: 2021
      });
    }
  }

  // --- Calculate Years of Experience from Date Ranges ---
  let totalMonths = 0;
  experience.forEach(exp => {
    if (exp.start) {
      const startParts = exp.start.split(/[-\/]/);
      const startYear = parseInt(startParts[0], 10) || 2020;
      const startMonth = parseInt(startParts[1], 10) || 1;
      
      let endYear = new Date().getFullYear();
      let endMonth = new Date().getMonth() + 1;
      if (exp.end) {
        const endParts = exp.end.split(/[-\/]/);
        endYear = parseInt(endParts[0], 10) || endYear;
        endMonth = parseInt(endParts[1], 10) || endMonth;
      }
      
      const diffMonths = (endYear - startYear) * 12 + (endMonth - startMonth);
      if (diffMonths > 0) totalMonths += diffMonths;
    }
  });
  const years_experience = totalMonths > 0 ? Math.round((totalMonths / 12) * 10) / 10 : undefined;

  // --- 10. Projects Extraction Heuristics ---
  const projects: { name: string; description: string }[] = [];
  let inProjectsSection = false;
  let currentProj: Partial<{ name: string; description: string }> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    if (/(projects|personal projects|key projects|academic projects)/i.test(line)) {
      inProjectsSection = true;
      continue;
    }
    if (inProjectsSection && /(education|skills|work|experience|experience|languages|certifications)/i.test(line)) {
      inProjectsSection = false;
    }

    if (inProjectsSection) {
      const isProjectHeader = line.length > 2 && line.length < 50 && (
        /^[-•*+]\s*/.test(lines[i]) || 
        /^[A-Za-z0-9\s\-_]+[-–:|]/.test(lines[i])
      );

      if (isProjectHeader) {
        if (currentProj.name) {
          projects.push(currentProj as { name: string; description: string });
          currentProj = {};
        }
        currentProj.name = lines[i].replace(/^[-•*+\s]*/, '').split(/[-–:|]/)[0].trim();
        currentProj.description = lines[i].replace(/^[-•*+\s]*/, '').replace(/^[A-Za-z0-9\s\-_]+[-–:|]\s*/, '').trim();
      } else if (currentProj.name) {
        currentProj.description = ((currentProj.description || "") + " " + lines[i].trim()).trim();
      }
    }
  }
  if (currentProj.name) {
    projects.push(currentProj as { name: string; description: string });
  }

  return {
    full_name: candidateName || undefined,
    emails: emails.length > 0 ? emails : undefined,
    phones: phones.length > 0 ? phones : undefined,
    location: (city || region || country) ? { city, region, country } : undefined,
    links: (links.linkedin || links.github || links.portfolio || links.other.length > 0) ? links : undefined,
    headline: headline || undefined,
    years_experience,
    skills: Array.from(foundSkillsSet),
    experience: experience.length > 0 ? experience : undefined,
    education: education.length > 0 ? education : undefined,
    projects: projects.length > 0 ? projects : undefined,
    raw_text: text,
    source_name: sourceName,
    base_confidence: baseConfidence
  };
}
