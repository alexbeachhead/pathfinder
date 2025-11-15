import { NextResponse } from 'next/server';
import { getDefaultPlugins } from '@/lib/plugins/defaultPlugins';
import { PluginMarketplaceEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/plugins/marketplace
 * Fetch available plugins from the marketplace
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // In a real implementation, this would fetch from an external marketplace API
    // For now, we'll use default plugins as the marketplace
    let plugins = getDefaultPlugins();

    // Filter by category
    if (category && category !== 'all') {
      plugins = plugins.filter((p) => p.metadata.category === category);
    }

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      plugins = plugins.filter(
        (p) =>
          p.metadata.name.toLowerCase().includes(query) ||
          p.metadata.displayName.toLowerCase().includes(query) ||
          p.metadata.description.toLowerCase().includes(query) ||
          p.metadata.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Convert to marketplace entries
    const marketplaceEntries: PluginMarketplaceEntry[] = plugins.map((plugin) => ({
      pluginAction: plugin,
      downloads: Math.floor(Math.random() * 10000) + 1000, // Simulated
      rating: 4 + Math.random(), // Simulated
      reviews: Math.floor(Math.random() * 500) + 10, // Simulated
      verified: true,
      repository: `https://github.com/pathfinder/plugins/${plugin.metadata.name}`,
      license: 'MIT',
    }));

    return NextResponse.json({
      success: true,
      data: marketplaceEntries,
      total: marketplaceEntries.length,
    });
  } catch (error) {
    console.error('Error fetching marketplace plugins:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch marketplace plugins',
      },
      { status: 500 }
    );
  }
}
