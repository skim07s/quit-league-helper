import leoProfanity from "leo-profanity";

// Load the full English dictionary
leoProfanity.loadDictionary("en");

/**
 * Returns true if the string contains profanity or inappropriate content.
 */
export function containsProfanity(text: string): boolean {
  return leoProfanity.check(text);
}

/**
 * Checks a Riot ID ("gameName#tagLine") for profanity.
 * Checks the full string and each component individually since
 * the # separator can break word-boundary detection.
 */
function riotIdContainsProfanity(riotId: string): boolean {
  if (leoProfanity.check(riotId)) return true;
  const hashIndex = riotId.indexOf("#");
  if (hashIndex !== -1) {
    const gameName = riotId.slice(0, hashIndex);
    const tagLine = riotId.slice(hashIndex + 1);
    if (leoProfanity.check(gameName) || leoProfanity.check(tagLine)) return true;
  }
  return false;
}

/**
 * Checks an array of Riot IDs and returns any that contain profanity.
 */
export function findProfanity(values: string[]): string[] {
  return values.filter((v) => riotIdContainsProfanity(v));
}
