import { CanonicalCandidate, RuntimeConfig, RuntimeConfigField } from './types';
import { normalizePhone, normalizeSkill } from './normalizer';

// Resolves path inside a CanonicalCandidate object
export function resolveConfigPath(candidate: CanonicalCandidate, path: string): any {
  if (!path) return undefined;

  // Case 1: Array mapping, e.g., "skills[].name"
  if (path.includes('[].')) {
    const [arrayField, itemField] = path.split('[].');
    const arr = (candidate as any)[arrayField];
    if (Array.isArray(arr)) {
      return arr.map(item => item[itemField]).filter(val => val !== undefined);
    }
    return undefined;
  }

  // Case 2: Array indexing, e.g., "emails[0]" or "phones[0]"
  const indexMatch = path.match(/^([a-zA-Z0-9_]+)\[(\d+)\]$/);
  if (indexMatch) {
    const field = indexMatch[1];
    const index = parseInt(indexMatch[2], 10);
    const arr = (candidate as any)[field];
    if (Array.isArray(arr)) {
      return arr[index];
    }
    return undefined;
  }

  // Case 3: Nested object path, e.g., "location.city"
  if (path.includes('.')) {
    const parts = path.split('.');
    let current: any = candidate;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    return current;
  }

  // Case 4: Flat path
  return (candidate as any)[path];
}

/**
 * Projects a fully merged CanonicalCandidate into a custom shape 
 * based on the RuntimeConfig schema.
 */
export function projectCandidate(
  candidate: CanonicalCandidate,
  config?: RuntimeConfig,
  traceLogs?: string[]
): any {
  if (!config || !config.fields || config.fields.length === 0) {
    traceLogs?.push("No custom runtime configuration active. Returning standard Canonical Profile.");
    return candidate;
  }

  traceLogs?.push("Applying custom runtime projection config schema.");
  const output: Record<string, any> = {};

  for (const field of config.fields) {
    // Resolve the value from the candidate (use 'from' path if defined, else default to 'path')
    const sourcePath = field.from || field.path;
    let value = resolveConfigPath(candidate, sourcePath);

    // Apply per-field custom normalizations
    if (value !== undefined && value !== null) {
      if (field.normalize === 'E164') {
        const countryHint = candidate.location?.country || "US";
        if (Array.isArray(value)) {
          value = value.map(ph => normalizePhone(ph, countryHint).phone);
        } else {
          value = normalizePhone(value, countryHint).phone;
        }
      } else if (field.normalize === 'canonical') {
        if (Array.isArray(value)) {
          value = value.map(normalizeSkill);
        } else {
          value = normalizeSkill(value);
        }
      }
    }

    // Check for missing field behavior
    const isMissing = value === undefined || value === null || (Array.isArray(value) && value.length === 0);

    if (isMissing) {
      if (field.required) {
        if (config.on_missing === 'error') {
          const errMsg = `Pipeline Config Error: Required field '${field.path}' (derived from '${sourcePath}') is missing.`;
          traceLogs?.push(errMsg);
          throw new Error(errMsg);
        } else if (config.on_missing === 'null') {
          output[field.path] = null;
          traceLogs?.push(`Config Projection Warning: Required field '${field.path}' missing. Assigned null.`);
        } else {
          // 'omit' - skip adding the field to output
          traceLogs?.push(`Config Projection Warning: Required field '${field.path}' missing. Omitted from output.`);
        }
      } else {
        if (config.on_missing === 'null') {
          output[field.path] = null;
        } else if (config.on_missing === 'error') {
          const errMsg = `Pipeline Config Error: Optional field '${field.path}' is missing under on_missing="error".`;
          traceLogs?.push(errMsg);
          throw new Error(errMsg);
        }
        // omit: do nothing, skip adding
      }
    } else {
      output[field.path] = value;
    }
  }

  // Append confidence if configured
  if (config.include_confidence) {
    output.overall_confidence = candidate.overall_confidence;
    output.provenance = candidate.provenance;
  }

  return output;
}
