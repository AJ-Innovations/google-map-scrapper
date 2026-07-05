import { EventEmitter } from 'events';

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
  BusinessFailed = 'BusinessFailed',
  
  // Recovery Events
  CheckpointSaved = 'CheckpointSaved',
  RecoveryStarted = 'RecoveryStarted',
  RecoveryCompleted = 'RecoveryCompleted'
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
