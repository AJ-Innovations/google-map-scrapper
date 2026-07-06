export class ResultValidator {
  public static isValid(url: string | null | undefined): boolean {
    if (!url) return false;
    
    try {
      const parsed = new URL(url);
      if (!parsed.hostname.includes('google.com')) return false;
      if (!parsed.pathname.includes('/maps/place/')) return false;
      return true;
    } catch {
      return false;
    }
  }

  public static normalize(url: string): string {
    const parsed = new URL(url);
    // Remove query parameters like tracking IDs
    parsed.search = '';
    return parsed.toString();
  }
}
