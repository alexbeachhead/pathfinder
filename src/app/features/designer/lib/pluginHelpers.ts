/**
 * Plugin helper utilities
 */

import { InstalledPlugin, PluginMarketplaceEntry, PluginAction } from '@/lib/types';

/**
 * Check if a plugin is installed
 */
export function isPluginInstalled(
  pluginId: string,
  installedPlugins: InstalledPlugin[]
): boolean {
  return installedPlugins.some((p) => p.plugin_id === pluginId);
}

/**
 * Filter plugins by search query and category
 */
export function filterPlugins<T extends { plugin_action?: PluginAction; pluginAction?: PluginAction }>(
  plugins: T[],
  searchQuery: string,
  categoryFilter: string
): T[] {
  return plugins.filter((item) => {
    const plugin = ('plugin_action' in item ? item.plugin_action : item.pluginAction) as PluginAction;

    const matchesSearch =
      !searchQuery ||
      plugin.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.metadata.displayName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || plugin.metadata.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });
}

/**
 * Filter plugins for action selector (supports tags)
 */
export function filterPluginsWithTags(
  plugins: PluginAction[],
  searchQuery: string
): PluginAction[] {
  if (!searchQuery) return plugins;

  const query = searchQuery.toLowerCase();
  return plugins.filter(
    (plugin) =>
      plugin.metadata.name.toLowerCase().includes(query) ||
      plugin.metadata.displayName.toLowerCase().includes(query) ||
      plugin.metadata.description.toLowerCase().includes(query) ||
      plugin.metadata.tags?.some((tag) => tag.toLowerCase().includes(query))
  );
}

/**
 * Group plugins by category
 */
export function groupPluginsByCategory(
  plugins: PluginAction[]
): Record<string, PluginAction[]> {
  const categories: Record<string, PluginAction[]> = {};
  plugins.forEach((plugin) => {
    const category = plugin.metadata.category;
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(plugin);
  });
  return categories;
}

/**
 * Validate plugin parameter form
 */
export function validatePluginForm(
  plugin: PluginAction,
  parameterValues: Record<string, unknown>
): boolean {
  return plugin.parameters.every((param) => {
    if (!param.required) return true;
    const value = parameterValues[param.name];
    return value !== undefined && value !== null && value !== '';
  });
}
