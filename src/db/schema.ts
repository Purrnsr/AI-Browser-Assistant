import Dexie, { type Table } from 'dexie';
import { DEFAULT_CONFIG, type AppConfig } from '../types/config';

export class AssistantDatabase extends Dexie {
  settings!: Table<AppConfig & { id: string }>;

  constructor() {
    super('PageAssistDB');
    this.version(1).stores({
      settings: 'id',
    });
  }
}

export const db = new AssistantDatabase();

// Utility functions to get and save settings
export async function getConfig(): Promise<AppConfig> {
  const saved = await db.settings.get('user_config');
  return saved || DEFAULT_CONFIG;
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await db.settings.put({ ...config, id: 'user_config' });
}