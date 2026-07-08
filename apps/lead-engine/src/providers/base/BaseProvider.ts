export abstract class BaseProvider {
  abstract launch(): Promise<void>;
  abstract search(keyword: string, location?: string): Promise<void>;
  abstract collectUrls(): Promise<string[]>;
  abstract extract(url: string): Promise<any>;
  abstract cleanup(): Promise<void>;
}
