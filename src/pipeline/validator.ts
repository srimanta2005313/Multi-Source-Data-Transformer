import { CanonicalCandidate, RuntimeConfig } from './types';

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
}

/**
 * Validates a merged CanonicalCandidate against standard data-quality checks 
 * and custom runtime configurations.
 */
export function validateCandidate(
  candidate: CanonicalCandidate,
  config?: RuntimeConfig,
  traceLogs?: string[]
): ValidationResult {
  const warnings: string[] = [];
  let isValid = true;

  traceLogs?.push("Initiating candidate validation step.");

  // --- 1. Validate Emails contain '@' ---
  if (candidate.emails && candidate.emails.length > 0) {
    candidate.emails.forEach(email => {
      if (!email.includes('@')) {
        const msg = `Email '${email}' is invalid: missing '@' character.`;
        warnings.push(msg);
        traceLogs?.push(`[Validation Warning]: ${msg}`);
      }
    });
  } else {
    warnings.push("Candidate has no email addresses available.");
    traceLogs?.push("[Validation Warning]: Candidate has no emails.");
  }

  // --- 2. Validate Phones match E.164 regex ---
  // E.164 pattern: leading + followed by 7 to 15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  if (candidate.phones && candidate.phones.length > 0) {
    candidate.phones.forEach(phone => {
      if (!e164Regex.test(phone)) {
        const msg = `Phone '${phone}' does not strictly match E.164 specification (+[1-9]digits).`;
        warnings.push(msg);
        traceLogs?.push(`[Validation Warning]: ${msg}`);
      }
    });
  }

  // --- 3. Validate Experience Dates match YYYY-MM ---
  const dateRegex = /^\d{4}-\d{2}$/;
  if (candidate.experience && candidate.experience.length > 0) {
    candidate.experience.forEach((exp, idx) => {
      if (exp.start && !dateRegex.test(exp.start)) {
        const msg = `Experience index ${idx} at '${exp.company}' has non-standard start date '${exp.start}' (expected YYYY-MM).`;
        warnings.push(msg);
        traceLogs?.push(`[Validation Warning]: ${msg}`);
      }
      if (exp.end && !dateRegex.test(exp.end)) {
        const msg = `Experience index ${idx} at '${exp.company}' has non-standard end date '${exp.end}' (expected YYYY-MM).`;
        warnings.push(msg);
        traceLogs?.push(`[Validation Warning]: ${msg}`);
      }
    });
  }

  // --- 4. Validate overall_confidence is between 0.0 and 1.0 ---
  if (candidate.overall_confidence < 0.0 || candidate.overall_confidence > 1.0) {
    const msg = `Invalid Overall Confidence: ${candidate.overall_confidence} (must be within [0.0 - 1.0]). Bound adjusted.`;
    warnings.push(msg);
    traceLogs?.push(`[Validation Warning]: ${msg}`);
    candidate.overall_confidence = Math.min(Math.max(candidate.overall_confidence, 0.0), 1.0);
  }

  // --- 5. Validate Required Config Fields ---
  if (config && config.fields) {
    config.fields.forEach(field => {
      if (field.required) {
        // Just checking presence in the standard candidate (for traceability)
        const sourcePath = field.from || field.path;
        if (sourcePath === 'full_name' && !candidate.full_name) {
          warnings.push(`Config required field 'full_name' is missing from merged candidate.`);
        }
        if (sourcePath === 'emails[0]' && candidate.emails.length === 0) {
          warnings.push(`Config required field 'emails[0]' is empty (no emails found).`);
        }
      }
    });
  }

  traceLogs?.push(`Validation complete. Found ${warnings.length} validation notifications.`);

  return {
    isValid,
    warnings
  };
}
