const fs = require('fs');
const path = require('path');

const files = {
  'src/core/events/EventBus.ts': `import { EventEmitter } from 'events';

export enum EventTypes {
  JobCreated = 'JobCreated',
  JobStarted = 'JobStarted',
  BusinessFound = 'BusinessFound',
  BusinessExtracted = 'BusinessExtracted',
  BusinessSaved = 'BusinessSaved',
  JobCompleted = 'JobCompleted',
  JobFailed = 'JobFailed',
  BrowserStarted = 'BrowserStarted',
  BrowserClosed = 'BrowserClosed',
  MapsLoaded = 'MapsLoaded',
  SearchStarted = 'SearchStarted',
  SearchCompleted = 'SearchCompleted',
  NavigationFailed = 'NavigationFailed',
  ProviderStatus = 'ProviderStatus',
  ScrollStarted = 'ScrollStarted',
  ScrollProgress = 'ScrollProgress',
  NewBusinessesLoaded = 'NewBusinessesLoaded',
  UrlCollected = 'UrlCollected',
  DuplicateSkipped = 'DuplicateSkipped',
  CollectionCompleted = 'CollectionCompleted',
  
  // Extraction Events
  BusinessOpened = 'BusinessOpened',
  BusinessValidated = 'BusinessValidated',
  BusinessSkipped = 'BusinessSkipped',
  BusinessFailed = 'BusinessFailed'
}

export class EventBus {
  private static instance: EventEmitter;

  public static getInstance(): EventEmitter {
    if (!EventBus.instance) {
      EventBus.instance = new EventEmitter();
    }
    return EventBus.instance;
  }

  public static publish(event: EventTypes, payload: any): void {
    EventBus.getInstance().emit(event, payload);
  }

  public static subscribe(event: EventTypes, listener: (payload: any) => void): void {
    EventBus.getInstance().on(event, listener);
  }
}
`,
  'src/providers/google-maps/selectors/BusinessSelectors.ts': `export const BusinessSelectors = {
  businessCardLink: 'a[href*="/maps/place/"]',
  endOfListMarker: 'span:has-text("You\\'ve reached the end of the list")',
  
  // Extraction Selectors
  name: 'h1.DUwDvf',
  address: 'button[data-item-id="address"]',
  website: 'a[data-item-id="authority"]',
  phone: 'button[data-item-id^="phone:tel:"]',
  rating: 'div.F7kvS span[aria-hidden="true"]',
  reviews: 'span[aria-label*="reviews"]',
  category: 'button.DkEaL',
  hours: 'div[aria-label^="Hours"]' // or table containing hours
};
`,
  'src/providers/google-maps/navigation/BusinessNavigator.ts': `import { Page } from 'playwright';
import { RetryService } from '../../../core/retry/RetryService';
import { NavigationError } from '../../../core/errors/Errors';
import { EventBus, EventTypes } from '../../../core/events/EventBus';
import { BusinessSelectors } from '../selectors/BusinessSelectors';
import { SearchSelectors } from '../selectors/SearchSelectors';
import { ConfigService } from '../../../config/ConfigService';

export class BusinessNavigator {
  constructor(private page: Page) {}

  async open(url: string): Promise<void> {
    await RetryService.withRetry(async () => {
      try {
        const timeout = Number(ConfigService.get('PAGE_TIMEOUT') || 30000);
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout });
        
        // Race between successful load, unavailable listing, or captcha
        const resultOrError = await Promise.race([
          this.page.waitForSelector(BusinessSelectors.name, { state: 'visible', timeout }).then(() => 'READY'),
          this.page.waitForSelector(SearchSelectors.captchaFrame, { state: 'visible', timeout }).then(() => 'CAPTCHA'),
          // Sometime maps shows "Can't find this place"
          this.page.waitForSelector(SearchSelectors.noResultsContent, { state: 'visible', timeout }).then(() => 'REMOVED')
        ]);
        
        if (resultOrError === 'CAPTCHA') {
          throw new Error('Captcha detected during extraction.');
        } else if (resultOrError === 'REMOVED') {
          throw new NavigationError('Listing has been removed or is unavailable.');
        }

        EventBus.publish(EventTypes.BusinessOpened, { url });
      } catch (e: any) {
        throw new NavigationError(\`Failed to open business page: \${e.message}\`);
      }
    });
  }
}
`,
  'src/providers/google-maps/extractors/BusinessExtractor.ts': `import { Page } from 'playwright';
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
    const match = url.match(/@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/);
    
    return {
      ...rawData,
      url,
      latitude: match ? match[1] : null,
      longitude: match ? match[2] : null,
    };
  }
}
`,
  'src/providers/google-maps/parsers/BusinessNormalizer.ts': `export class BusinessNormalizer {
  public static normalizePhone(phone: string | null): string | null {
    if (!phone) return null;
    // Basic cleanup: remove extra spaces, standardizing could be complex based on region
    return phone.replace(/\\s+/g, ' ').trim();
  }

  public static normalizeWebsite(website: string | null): string | null {
    if (!website) return null;
    try {
      const url = new URL(website);
      // Google sometimes wraps links in google.com/url?q=...
      if (url.hostname.includes('google.com') && url.searchParams.has('q')) {
        return new URL(url.searchParams.get('q')!).toString();
      }
      return url.toString();
    } catch {
      return website.trim();
    }
  }

  public static normalizeWhitespace(text: string | null): string | null {
    if (!text) return null;
    return text.replace(/\\s+/g, ' ').trim();
  }
}
`,
  'src/providers/google-maps/parsers/BusinessParser.ts': `import { BusinessModel } from '../../../models/Business';
import { BusinessNormalizer } from './BusinessNormalizer';

export class BusinessParser {
  public static parse(rawData: Record<string, string | null>, keyword: string): Partial<BusinessModel> {
    const parseNumber = (val: string | null) => {
      if (!val) return null;
      const num = parseFloat(val.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? null : num;
    };

    return {
      provider: 'google-maps',
      keyword,
      name: BusinessNormalizer.normalizeWhitespace(rawData.name) || 'Unknown',
      address: BusinessNormalizer.normalizeWhitespace(rawData.address) || undefined,
      phone: BusinessNormalizer.normalizePhone(rawData.phone) || undefined,
      website: BusinessNormalizer.normalizeWebsite(rawData.website) || undefined,
      category: BusinessNormalizer.normalizeWhitespace(rawData.category) || undefined,
      rating: parseNumber(rawData.rating) || undefined,
      reviewCount: parseNumber(rawData.reviews) || undefined,
      latitude: parseNumber(rawData.latitude) || undefined,
      longitude: parseNumber(rawData.longitude) || undefined,
      openingHours: BusinessNormalizer.normalizeWhitespace(rawData.hours) || undefined,
      googleMapsUrl: rawData.url || undefined,
      status: 'ACTIVE'
    };
  }
}
`,
  'src/providers/google-maps/extractors/BusinessExtractionEngine.ts': `import { Page } from 'playwright';
import { BusinessNavigator } from '../navigation/BusinessNavigator';
import { BusinessExtractor } from './BusinessExtractor';
import { BusinessParser } from '../parsers/BusinessParser';
import { BusinessValidator } from '../../../validators/BusinessValidator';
import { EventBus, EventTypes } from '../../../core/events/EventBus';
import { logger } from '../../../core/logger/Logger';
import { BusinessModel } from '../../../models/Business';

export class BusinessExtractionEngine {
  private navigator: BusinessNavigator;
  private extractor: BusinessExtractor;

  constructor(private page: Page, private keyword: string) {
    this.navigator = new BusinessNavigator(this.page);
    this.extractor = new BusinessExtractor(this.page);
  }

  async processUrl(url: string): Promise<BusinessModel | null> {
    const startTime = Date.now();
    try {
      // 1. Navigate directly to URL
      await this.navigator.open(url);
      
      // 2. Extract Raw DOM Data
      const rawData = await this.extractor.extractRawData(url);
      
      // 3. Parse & Normalize
      const parsedData = BusinessParser.parse(rawData, this.keyword);
      
      // 4. Validate
      const validatedData = BusinessValidator.validate(parsedData);
      
      EventBus.publish(EventTypes.BusinessExtracted, { url, timeMs: Date.now() - startTime });
      EventBus.publish(EventTypes.BusinessValidated, { name: validatedData.name });
      
      logger.info({
        name: validatedData.name,
        timeMs: Date.now() - startTime
      }, 'Successfully extracted business');
      
      return validatedData as BusinessModel;

    } catch (error: any) {
      EventBus.publish(EventTypes.BusinessFailed, { url, error: error.message });
      logger.warn({ url, error: error.message }, 'Failed to extract business');
      return null;
    }
  }
}
`,
  'src/providers/google-maps/GoogleMapsProvider.ts': `import { BaseProvider } from '../base/BaseProvider';
import { MapsNavigator } from './navigation/MapsNavigator';
import { InfiniteScroller } from './scroll/InfiniteScroller';
import { ResultCollector } from './scroll/ResultCollector';
import { ResultCache } from './scroll/ResultCache';
import { BusinessExtractionEngine } from './extractors/BusinessExtractionEngine';
import { PageManager } from '../../core/browser/PageManager';
import { BrowserContext, Page } from 'playwright';

export class GoogleMapsProvider extends BaseProvider {
  private navigator: MapsNavigator | null = null;
  private pageManager: PageManager;
  private resultCache: ResultCache;
  private page: Page | null = null;
  private extractionPage: Page | null = null;
  private keyword: string = '';
  
  constructor(context: BrowserContext) {
    super();
    this.pageManager = new PageManager(context);
    this.resultCache = new ResultCache();
  }

  async launch(): Promise<void> {
    this.page = await this.pageManager.createPage();
    this.navigator = new MapsNavigator(this.page);
    await this.navigator.launch();
  }

  async search(keyword: string, location?: string): Promise<void> {
    this.keyword = keyword;
    if (!this.navigator) throw new Error("Navigator not initialized");
    await this.navigator.search(keyword, location || '');
    await this.navigator.waitForResults();
  }

  async collectUrls(): Promise<string[]> {
    if (!this.page) throw new Error("Browser page not initialized");
    const collector = new ResultCollector(this.page, this.resultCache);
    const scroller = new InfiniteScroller(this.page, collector);
    await scroller.scrollUntilComplete();
    return (this.resultCache as any).cache ? Array.from((this.resultCache as any).cache) : [];
  }

  async extract(url: string): Promise<any> {
    // Open a separate tab/page strictly for extraction to not mess up the search results DOM
    if (!this.extractionPage) {
      this.extractionPage = await this.pageManager.createPage();
    }
    const engine = new BusinessExtractionEngine(this.extractionPage, this.keyword);
    return await engine.processUrl(url);
  }
  
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.pageManager.closePage(this.page);
      this.page = null;
    }
    if (this.extractionPage) {
      await this.pageManager.closePage(this.extractionPage);
      this.extractionPage = null;
    }
  }
}
`,
  'src/main.ts': `import { ConfigService } from './config/ConfigService';
import { logger } from './core/logger/Logger';
import { BrowserFactory } from './core/browser/BrowserFactory';
import { BrowserContextManager } from './core/browser/BrowserContextManager';
import { GoogleMapsProvider } from './providers/google-maps/GoogleMapsProvider';
import { ProgressTracker } from './core/progress/ProgressTracker';
import { EventBus, EventTypes } from './core/events/EventBus';

async function bootstrap() {
  logger.info(\`Starting Lead Collection Platform (LeadEngine)\`);
  logger.info(\`Keyword: Resorts, Location: Kerala\`);
  
  const tracker = new ProgressTracker();
  const browserManager = BrowserFactory.createBrowserManager();
  
  try {
    const browser = await browserManager.initialize({ headless: ConfigService.get('HEADLESS') === 'true' });
    const contextManager = new BrowserContextManager(browser);
    const context = await contextManager.createContext();
    
    const mapsProvider = new GoogleMapsProvider(context);
    
    // 1. Launch & Search
    await mapsProvider.launch();
    await mapsProvider.search("Resorts", "Kerala");
    
    // 2. Collect URLs (Milestone 5)
    const collectedUrls = await mapsProvider.collectUrls();
    
    // 3. Extract Business Details (Milestone 6)
    logger.info(\`Starting Extraction for \${collectedUrls.length} collected businesses...\`);
    
    // We only process the first 3 for this test to avoid taking too long
    const limit = Math.min(collectedUrls.length, 3);
    for (let i = 0; i < limit; i++) {
      const businessData = await mapsProvider.extract(collectedUrls[i]);
      if (businessData) {
        console.dir(businessData, { depth: null, colors: true });
      }
    }
    
    await mapsProvider.cleanup();
    
  } catch (error) {
    logger.error({ err: error }, "Failed to execute engine");
    EventBus.publish(EventTypes.JobFailed, { error });
  } finally {
    await browserManager.closeBrowser();
    logger.info("Graceful shutdown complete.");
  }
}

bootstrap();
`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Created: ', filePath);
}
