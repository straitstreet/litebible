# Bible Reader

A lightweight, minimal Bible reading application with ultra-minimal reader-mode styling.

## Cross-Platform Development

**IMPORTANT**: We use Tauri for all cross-platform development targeting:
- Web browsers
- iOS mobile
- iOS iPad
- Android mobile
- Android tablet

## Features

- Ultra-minimal reader-mode interface with complete Bible text
- No navigation controls - pure text display
- Loads complete Berean Standard Bible instantly
- Minimal JavaScript (6 lines total)
- Clean typography optimized for reading

## File Structure

- `index.html` - Ultra-minimal single-file web application
- `BSB.ultra.json` - Complete Bible in ultra-compact format (3.8MB)
- `BSB.ultra.json.gz` - Compressed version (1.2MB)

## Usage

Open `index.html` in any modern web browser to read the complete Bible text.

## Development Notes

- NEVER show partial text - always load complete Bible
- Minimize JavaScript to absolute essentials
- Use Tauri for cross-platform mobile/tablet deployment