import { Queue } from './Queue';
import { MemoryQueue } from './MemoryQueue';

export class QueueFactory {
  public static createQueue<T>(type: 'memory' | 'redis' = 'memory'): Queue<T> {
    if (type === 'memory') {
      return new MemoryQueue<T>();
    }
    throw new Error(`Queue type ${type} not implemented.`);
  }
}
