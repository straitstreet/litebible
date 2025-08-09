# Bible Reader

A lightweight, minimal Bible reading application deployed as a Cloudflare Worker with ultra-minimal reader-mode styling.

## Features

- Ultra-minimal reader-mode interface with progressive Bible loading
- Loads John 1 + surrounding chapters instantly for fast initial page load
- Background loading of complete Berean Standard Bible after initial render
- Browser caching for offline reading and instant subsequent loads
- Zero client-side JavaScript for plain version
- Clean typography optimized for reading
- Deployed as Cloudflare Worker for global edge distribution

## File Structure

- `src/index.js` - Cloudflare Worker main handler
- `src/bible-content.js` - Complete Bible content module
- `wrangler.jsonc` - Cloudflare Workers deployment configuration
- `BSB.ultra.json` - Complete Bible in ultra-compact format (3.8MB)
- `BSB.ultra.json.gz` - Compressed version (1.2MB)

## Usage

Deploy with `wrangler deploy` to Cloudflare Workers. Access at your worker's URL.

## Development Notes

- Progressive loading strategy: Load John 1 + surrounding chapters first, then complete Bible in background
- Initial load should show John 1 with prev/next chapters for immediate usability
- Browser caching: Store complete Bible data in localStorage/IndexedDB after first load
- Cache invalidation: Version-based cache busting for Bible data updates
- Offline support: Cached Bible data enables offline reading after first visit
- Plain version: Zero client-side JavaScript - all content served from edge
- Interactive version: Progressive enhancement with background loading and caching
- Responsive CSS with dark/light mode support
- Prioritize fast initial page load over complete data availability