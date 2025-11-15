/**
 * Plugin System - Main Export File
 *
 * This file exports all plugin-related functionality and initializes the plugin system.
 */

// Export registry functions
export {
  pluginRegistry,
  initializePluginRegistry,
  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  getPluginsByCategory,
  getPluginsByActionType,
  searchPlugins,
  markAsInstalled,
  getInstalledPlugins,
  getEnabledPlugins,
  isPluginInstalled,
  togglePlugin,
  uninstallPlugin,
  getPluginCount,
} from './pluginRegistry';

// Export default plugins
export {
  getDefaultPlugins,
  apiCallPlugin,
  customSelectorPlugin,
  fileUploadPlugin,
  dragDropPlugin,
  localStoragePlugin,
  cookiePlugin,
} from './defaultPlugins';

// Export code generator
export {
  generatePluginCode,
  registerCodeGenerator,
  type CodeGeneratorContext,
} from './pluginCodeGenerator';

// Export types
export type {
  PluginAction,
  PluginMetadata,
  PluginParameter,
  PluginActionType,
  InstalledPlugin,
  PluginRegistry,
  PluginMarketplaceEntry,
  PluginStepData,
  PluginExecutionContext,
  PluginExample,
} from '../types';

import { pluginRegistry } from './pluginRegistry';
import { getDefaultPlugins } from './defaultPlugins';
import { InstalledPlugin } from '../types';

/**
 * Initialize the plugin system
 * This should be called once during app initialization
 */
export function initializePluginSystem(): void {
  console.log('[Plugin System] Initializing...');

  // Load installed plugins from localStorage
  pluginRegistry.loadFromLocalStorage();

  // Register default built-in plugins
  const defaultPlugins = getDefaultPlugins();
  defaultPlugins.forEach((plugin) => {
    pluginRegistry.register(plugin);

    // Check if already marked as installed
    if (!pluginRegistry.isInstalled(plugin.metadata.id)) {
      const installedPlugin: InstalledPlugin = {
        id: crypto.randomUUID(),
        plugin_id: plugin.metadata.id,
        plugin_action: plugin,
        enabled: true,
        install_source: 'local',
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      pluginRegistry.markAsInstalled(installedPlugin);
    }
  });

  // Save to localStorage
  pluginRegistry.saveToLocalStorage();

  const count = pluginRegistry.getPluginCount();
  console.log(`[Plugin System] Initialized with ${count.total} plugins (${count.enabled} enabled)`);
}

/**
 * Auto-initialize when module is imported (client-side only)
 */
if (typeof window !== 'undefined') {
  // Only run on client-side
  if (!globalThis.__PLUGIN_SYSTEM_INITIALIZED__) {
    initializePluginSystem();
    globalThis.__PLUGIN_SYSTEM_INITIALIZED__ = true;
  }
}

// Extend global types
declare global {
  var __PLUGIN_SYSTEM_INITIALIZED__: boolean;
}
