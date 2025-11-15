'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { InstalledPlugin, PluginMarketplaceEntry, PluginAction } from '@/lib/types';
import {
  getInstalledPlugins,
  togglePlugin,
  uninstallPlugin,
  markAsInstalled,
  getPluginCount,
} from '@/lib/plugins/pluginRegistry';
import { getDefaultPlugins } from '@/lib/plugins/defaultPlugins';
import {
  Package,
  Toggle,
  Trash2,
  Download,
  Star,
  Shield,
  Search,
  Filter,
  X,
} from 'lucide-react';

interface PluginManagerProps {
  onClose: () => void;
}

export function PluginManager({ onClose }: PluginManagerProps) {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace'>('installed');
  const [installedPlugins, setInstalledPlugins] = useState<InstalledPlugin[]>([]);
  const [marketplacePlugins, setMarketplacePlugins] = useState<PluginMarketplaceEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadInstalledPlugins();
    loadMarketplacePlugins();
  }, []);

  const loadInstalledPlugins = () => {
    const plugins = getInstalledPlugins();
    setInstalledPlugins(plugins);
  };

  const loadMarketplacePlugins = () => {
    // Simulate marketplace - in production, this would fetch from API
    const defaultPlugins = getDefaultPlugins();
    const marketplace: PluginMarketplaceEntry[] = defaultPlugins.map((plugin) => ({
      pluginAction: plugin,
      downloads: Math.floor(Math.random() * 10000),
      rating: 4 + Math.random(),
      reviews: Math.floor(Math.random() * 500),
      verified: true,
      repository: `https://github.com/pathfinder/plugins/${plugin.metadata.name}`,
      license: 'MIT',
    }));
    setMarketplacePlugins(marketplace);
  };

  const handleToggle = (pluginId: string, enabled: boolean) => {
    togglePlugin(pluginId, enabled);
    loadInstalledPlugins();
  };

  const handleUninstall = (pluginId: string) => {
    if (confirm('Are you sure you want to uninstall this plugin?')) {
      uninstallPlugin(pluginId);
      loadInstalledPlugins();
    }
  };

  const handleInstall = (pluginAction: PluginAction) => {
    const installedPlugin: InstalledPlugin = {
      id: crypto.randomUUID(),
      plugin_id: pluginAction.metadata.id,
      plugin_action: pluginAction,
      enabled: true,
      install_source: 'marketplace',
      installed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    markAsInstalled(installedPlugin);
    loadInstalledPlugins();
  };

  const isPluginInstalled = (pluginId: string): boolean => {
    return installedPlugins.some((p) => p.plugin_id === pluginId);
  };

  const filteredInstalledPlugins = installedPlugins.filter((plugin) => {
    const matchesSearch =
      !searchQuery ||
      plugin.plugin_action.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.plugin_action.metadata.displayName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || plugin.plugin_action.metadata.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const filteredMarketplacePlugins = marketplacePlugins.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.pluginAction.metadata.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.pluginAction.metadata.displayName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || entry.pluginAction.metadata.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const pluginCount = getPluginCount();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" data-testid="plugin-manager-modal">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <ThemedCard variant="default">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                  Plugin Manager
                </h2>
                <p className="text-sm mt-1" style={{ color: currentTheme.colors.text.tertiary }}>
                  {pluginCount.installed} installed • {pluginCount.enabled} enabled
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded hover:bg-opacity-80 transition-colors"
                style={{ backgroundColor: currentTheme.colors.surface }}
                data-testid="plugin-manager-close-btn"
              >
                <X className="w-5 h-5" style={{ color: currentTheme.colors.text.secondary }} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('installed')}
                className="px-4 py-2 rounded font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === 'installed' ? currentTheme.colors.primary : currentTheme.colors.surface,
                  color: currentTheme.colors.text.primary,
                }}
                data-testid="plugin-tab-installed"
              >
                Installed
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className="px-4 py-2 rounded font-medium transition-colors"
                style={{
                  backgroundColor: activeTab === 'marketplace' ? currentTheme.colors.primary : currentTheme.colors.surface,
                  color: currentTheme.colors.text.primary,
                }}
                data-testid="plugin-tab-marketplace"
              >
                Marketplace
              </button>
            </div>

            {/* Search & Filters */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: currentTheme.colors.text.tertiary }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plugins..."
                  className="w-full pl-10 pr-4 py-2 rounded border"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                  }}
                  data-testid="plugin-manager-search"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 rounded border"
                style={{
                  backgroundColor: currentTheme.colors.surface,
                  borderColor: currentTheme.colors.border,
                  color: currentTheme.colors.text.primary,
                }}
                data-testid="plugin-manager-category-filter"
              >
                <option value="all">All Categories</option>
                <option value="interaction">Interaction</option>
                <option value="api">API</option>
                <option value="data">Data</option>
                <option value="assertion">Assertion</option>
                <option value="utility">Utility</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'installed' ? (
                <div className="space-y-3">
                  {filteredInstalledPlugins.length === 0 ? (
                    <div className="text-center py-12" style={{ color: currentTheme.colors.text.tertiary }}>
                      <Package className="w-12 h-12 mx-auto mb-2" />
                      <p>No plugins installed</p>
                    </div>
                  ) : (
                    filteredInstalledPlugins.map((plugin) => (
                      <div
                        key={plugin.id}
                        className="p-4 rounded border"
                        style={{
                          backgroundColor: currentTheme.colors.surface,
                          borderColor: currentTheme.colors.border,
                        }}
                        data-testid={`installed-plugin-${plugin.plugin_id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                              {plugin.plugin_action.metadata.displayName}
                            </h4>
                            <p className="text-sm mt-1" style={{ color: currentTheme.colors.text.tertiary }}>
                              {plugin.plugin_action.metadata.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                              <span>v{plugin.plugin_action.metadata.version}</span>
                              <span className="capitalize">{plugin.plugin_action.metadata.category}</span>
                              <span>By {plugin.plugin_action.metadata.author}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleToggle(plugin.plugin_id, !plugin.enabled)}
                              className="p-2 rounded hover:bg-opacity-80 transition-colors"
                              style={{
                                backgroundColor: plugin.enabled ? currentTheme.colors.success : currentTheme.colors.surface,
                              }}
                              title={plugin.enabled ? 'Disable' : 'Enable'}
                              data-testid={`plugin-toggle-${plugin.plugin_id}`}
                            >
                              <Toggle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUninstall(plugin.plugin_id)}
                              className="p-2 rounded hover:bg-opacity-80 transition-colors"
                              style={{ backgroundColor: currentTheme.colors.error }}
                              title="Uninstall"
                              data-testid={`plugin-uninstall-${plugin.plugin_id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMarketplacePlugins.length === 0 ? (
                    <div className="text-center py-12" style={{ color: currentTheme.colors.text.tertiary }}>
                      <Package className="w-12 h-12 mx-auto mb-2" />
                      <p>No plugins found</p>
                    </div>
                  ) : (
                    filteredMarketplacePlugins.map((entry) => {
                      const installed = isPluginInstalled(entry.pluginAction.metadata.id);
                      return (
                        <div
                          key={entry.pluginAction.metadata.id}
                          className="p-4 rounded border"
                          style={{
                            backgroundColor: currentTheme.colors.surface,
                            borderColor: currentTheme.colors.border,
                          }}
                          data-testid={`marketplace-plugin-${entry.pluginAction.metadata.id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                                  {entry.pluginAction.metadata.displayName}
                                </h4>
                                {entry.verified && (
                                  <Shield className="w-4 h-4" style={{ color: currentTheme.colors.success }} title="Verified" />
                                )}
                              </div>
                              <p className="text-sm mt-1" style={{ color: currentTheme.colors.text.tertiary }}>
                                {entry.pluginAction.metadata.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current" style={{ color: currentTheme.colors.warning }} />
                                  {entry.rating?.toFixed(1)} ({entry.reviews})
                                </span>
                                <span>{entry.downloads?.toLocaleString()} downloads</span>
                                <span className="capitalize">{entry.pluginAction.metadata.category}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => !installed && handleInstall(entry.pluginAction)}
                              disabled={installed}
                              className="px-4 py-2 rounded font-medium flex items-center gap-2 disabled:opacity-50"
                              style={{
                                backgroundColor: installed ? currentTheme.colors.surface : currentTheme.colors.primary,
                                color: currentTheme.colors.text.primary,
                              }}
                              data-testid={`plugin-install-${entry.pluginAction.metadata.id}`}
                            >
                              <Download className="w-4 h-4" />
                              {installed ? 'Installed' : 'Install'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}
