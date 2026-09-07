import { IPlatformDbContext } from './repositoryInterfaces';
import { PlatformMockRepository } from './mockRepository';

export function createPlatformDbContext(): IPlatformDbContext {
  return new PlatformMockRepository();
}

export const db: IPlatformDbContext = createPlatformDbContext();

export * from './repositoryInterfaces';
export * from '../types/models';
