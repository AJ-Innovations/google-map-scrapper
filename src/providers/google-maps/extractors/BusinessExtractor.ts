import { Page } from 'playwright';
import { BusinessSelectors } from '../selectors/BusinessSelectors';

export class BusinessExtractor {
  constructor(private page: Page) {}

  async extractRawData(url: string): Promise<Record<string, string | null>> {
    // Extract everything in one page.evaluate to minimize round-trips
    const rawData = await this.page.evaluate((selectors) => {
      const getText = (selector: string) => {
        const el = document.querySelector(selector);
        return el ? (el.textContent || '').trim() : null;
      };
      const getHref = (selector: string) => {
        const el = document.querySelector(selector) as HTMLAnchorElement;
        return el ? (el.href || '').trim() : null;
      };
      
      return {
        name: getText(selectors.name),
        address: getText(selectors.address),
        website: getHref(selectors.website),
        phone: getText(selectors.phone),
        rating: getText(selectors.rating),
        reviews: getText(selectors.reviews),
        category: getText(selectors.category),
        hours: getText(selectors.hours)
      };
    }, BusinessSelectors);

    // Coordinate extraction from URL
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    
    return {
      ...rawData,
      url,
      latitude: match ? match[1] : null,
      longitude: match ? match[2] : null,
    };
  }
}
