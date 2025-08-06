# Bible Reader

A lightweight, minimal Bible reading application deployed as a Cloudflare Worker with ultra-minimal reader-mode styling.

## Features

- Ultra-minimal reader-mode interface with complete Bible text
- No navigation controls - pure text display
- Loads complete Berean Standard Bible instantly
- Zero client-side JavaScript
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

- NEVER show partial text - always load complete Bible
- Zero client-side JavaScript - all content served from edge
- Responsive CSS with dark/light mode support