import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    permissions: ['activeTab', 'tabs', 'scripting'],
    host_permissions: ['<all_urls>', 'http://localhost:11434/*'],
  },
});