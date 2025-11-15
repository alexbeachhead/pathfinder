import { PluginAction, InstalledPlugin, PluginMetadata, PluginActionType } from '../types';

/**
 * Plugin Registry - Manages plugin registration, loading, and retrieval
 */
class PluginRegistry {
  private plugins: Map<string, PluginAction> = new Map();
  private installedPlugins: Map<string, InstalledPlugin> = new Map();

  /**
   * Register a plugin action
   */
  register(plugin: PluginAction): void {
    if (this.plugins.has(plugin.metadata.id)) {
      console.warn(`Plugin ${plugin.metadata.id} is already registered. Overwriting...`);
    }
    this.plugins.set(plugin.metadata.id, plugin);
  }

  /**
   * Unregister a plugin action
   */
  unregister(pluginId: string): boolean {
    return this.plugins.delete(pluginId);
  }

  /**
   * Get a specific plugin by ID
   */
  getPlugin(pluginId: string): PluginAction | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): PluginAction[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: PluginMetadata['category']): PluginAction[] {
    return this.getAllPlugins().filter(plugin => plugin.metadata.category === category);
  }

  /**
   * Get plugins by action type
   */
  getPluginsByActionType(actionType: PluginActionType): PluginAction[] {
    return this.getAllPlugins().filter(plugin => plugin.actionType === actionType);
  }

  /**
   * Search plugins by name, description, or tags
   */
  searchPlugins(query: string): PluginAction[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllPlugins().filter(plugin => {
      const metadata = plugin.metadata;
      return (
        metadata.name.toLowerCase().includes(lowerQuery) ||
        metadata.displayName.toLowerCase().includes(lowerQuery) ||
        metadata.description.toLowerCase().includes(lowerQuery) ||
        (metadata.tags && metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
      );
    });
  }

  /**
   * Mark a plugin as installed
   */
  markAsInstalled(installedPlugin: InstalledPlugin): void {
    this.installedPlugins.set(installedPlugin.plugin_id, installedPlugin);
    // Also register the plugin action if not already registered
    if (!this.plugins.has(installedPlugin.plugin_id)) {
      this.register(installedPlugin.plugin_action);
    }
  }

  /**
   * Get all installed plugins
   */
  getInstalledPlugins(): InstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  /**
   * Get enabled installed plugins only
   */
  getEnabledPlugins(): InstalledPlugin[] {
    return this.getInstalledPlugins().filter(plugin => plugin.enabled);
  }

  /**
   * Check if a plugin is installed
   */
  isInstalled(pluginId: string): boolean {
    return this.installedPlugins.has(pluginId);
  }

  /**
   * Toggle plugin enabled state
   */
  togglePlugin(pluginId: string, enabled: boolean): void {
    const installedPlugin = this.installedPlugins.get(pluginId);
    if (installedPlugin) {
      installedPlugin.enabled = enabled;
      installedPlugin.updated_at = new Date().toISOString();
    }
  }

  /**
   * Uninstall a plugin
   */
  uninstall(pluginId: string): boolean {
    return this.installedPlugins.delete(pluginId);
  }

  /**
   * Load plugins from localStorage
   */
  loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('pathfinder-installed-plugins');
      if (stored) {
        const installedPlugins: InstalledPlugin[] = JSON.parse(stored);
        installedPlugins.forEach(plugin => {
          this.markAsInstalled(plugin);
        });
      }
    } catch (error) {
      console.error('Failed to load plugins from localStorage:', error);
    }
  }

  /**
   * Save plugins to localStorage
   */
  saveToLocalStorage(): void {
    try {
      const installedPlugins = this.getInstalledPlugins();
      localStorage.setItem('pathfinder-installed-plugins', JSON.stringify(installedPlugins));
    } catch (error) {
      console.error('Failed to save plugins to localStorage:', error);
    }
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    this.plugins.clear();
    this.installedPlugins.clear();
  }

  /**
   * Get plugin count
   */
  getPluginCount(): { total: number; installed: number; enabled: number } {
    return {
      total: this.plugins.size,
      installed: this.installedPlugins.size,
      enabled: this.getEnabledPlugins().length,
    };
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry();

/**
 * Initialize the plugin registry with default plugins
 */
export function initializePluginRegistry(): void {
  // Load installed plugins from localStorage
  pluginRegistry.loadFromLocalStorage();

  // This will be called during app initialization
  console.log('Plugin registry initialized');
}

/**
 * Export utility functions
 */
export const {
  register: registerPlugin,
  unregister: unregisterPlugin,
  getPlugin,
  getAllPlugins,
  getPluginsByCategory,
  getPluginsByActionType,
  searchPlugins,
  markAsInstalled,
  getInstalledPlugins,
  getEnabledPlugins,
  isInstalled: isPluginInstalled,
  togglePlugin,
  uninstall: uninstallPlugin,
  getPluginCount,
} = pluginRegistry;
