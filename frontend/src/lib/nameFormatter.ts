export const formatFullName = (
  person?: {
    first_name?: string | null;
    last_name?: string | null;
    middle_name?: string | null;
    suffix?: string | null;
  } | null,
) => {
  if (!person) return null;

  // Helper to check if a string value is valid (non-null, non-undefined, non-empty)
  const isValid = (val?: string | null): val is string => Boolean(val && val.trim().length > 0);

  const { last_name, first_name, middle_name, suffix } = person;

  // Must at least have a valid last_name or first_name
  if (!isValid(last_name) && !isValid(first_name)) return null;

  const validLastName = isValid(last_name) ? last_name.trim() : "";
  const validFirstName = isValid(first_name) ? first_name.trim() : "";

  // Format base name (handles edge cases where only first or only last name exists)
  const baseName =
    validLastName && validFirstName
      ? `${validLastName}, ${validFirstName}`
      : validLastName || validFirstName;

  // Collect valid optional middle_name and suffix
  const extraParts = [middle_name, suffix].filter(isValid).map((str) => str.trim());

  const extraFormatted = extraParts.length > 0 ? ` ${extraParts.join(" ")}` : "";

  return `${baseName}${extraFormatted}`;
};
