# LiteBible - Minimal Cross-Platform Bible Reader

A lightweight, ultra-minimal Bible reading application with reader-mode styling, built for instant loading across all platforms.

## Features

- **Ultra-minimal interface** - Pure text display with no navigation controls
- **Complete Bible text** - Full Berean Standard Bible (BSB) included
- **Instant loading** - Minimal JavaScript (6 lines total)
- **Cross-platform** - Web, desktop, iOS, and Android via Tauri
- **Reader-mode styling** - Clean typography optimized for reading
- **Offline-ready** - Complete Bible data bundled with app

## Quick Start

### Web Browser
```bash
open index.html
```

### Desktop Development
```bash
npm install
npm run tauri:dev
```

### Desktop Production Build
```bash
npm run tauri:build
```

## TODO: Publishing Readiness

### 🔧 Core Application

- [ ] **App Icons & Branding**
  - [ ] Create proper app icon set (16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024)
  - [ ] Generate platform-specific icons (.ico, .icns, .png)
  - [ ] Add app splash screen for mobile platforms
  - [ ] Design app store screenshots and promotional graphics

- [ ] **Performance Optimization**
  - [ ] Implement lazy loading for large Bible text
  - [ ] Add text search functionality with indexing
  - [ ] Optimize JSON loading (consider using compressed BSB.ultra.json.gz)
  - [ ] Add service worker for offline web functionality
  - [ ] Implement virtual scrolling for better performance on mobile

- [ ] **User Experience**
  - [ ] Add basic navigation (book/chapter jumping)
  - [ ] Implement text selection and copying
  - [ ] Add font size controls
  - [ ] Include dark/light theme toggle
  - [ ] Add reading progress tracking
  - [ ] Implement verse highlighting and bookmarks

### 📱 Mobile Platform Setup

#### iOS Configuration
- [ ] **Apple Developer Account**
  - [ ] Set up Apple Developer Program membership ($99/year)
  - [ ] Configure development team in `src-tauri/tauri.conf.json`
  - [ ] Set up App Store Connect app listing
  
- [ ] **iOS Development Environment**
  - [ ] Install Xcode and iOS Simulator
  - [ ] Configure code signing certificates
  - [ ] Set up provisioning profiles
  - [ ] Test on physical iOS devices

- [ ] **App Store Submission**
  - [ ] Create App Store listing with screenshots
  - [ ] Write app description and keywords
  - [ ] Set up app categories and age ratings
  - [ ] Configure in-app purchase if needed (unlikely for Bible app)
  - [ ] Submit for App Store review

#### Android Configuration
- [ ] **Android Development Environment**
  - [ ] Install Android Studio and Android SDK
  - [ ] Set ANDROID_HOME environment variable
  - [ ] Configure Android device/emulator for testing
  - [ ] Set up Android signing key for release builds

- [ ] **Google Play Console**
  - [ ] Create Google Play Developer account ($25 one-time fee)
  - [ ] Set up Google Play Console app listing
  - [ ] Upload APK/AAB for testing
  - [ ] Configure app store listing with screenshots

- [ ] **Play Store Submission**
  - [ ] Create store listing with descriptions
  - [ ] Generate required graphics (feature graphic, screenshots)
  - [ ] Set up content rating and privacy policy
  - [ ] Configure release management and testing tracks

### 🖥️ Desktop Platform Setup

#### macOS
- [ ] **Code Signing & Notarization**
  - [ ] Set up Apple Developer account for macOS distribution
  - [ ] Configure code signing certificate
  - [ ] Implement notarization for Gatekeeper compliance
  - [ ] Test installation on clean macOS systems

- [ ] **Distribution**
  - [ ] Consider Mac App Store submission
  - [ ] Set up direct download with automatic updates
  - [ ] Configure Homebrew formula for easy installation

#### Windows
- [ ] **Code Signing**
  - [ ] Obtain Windows code signing certificate
  - [ ] Configure Tauri Windows signing
  - [ ] Test Windows Defender SmartScreen compatibility

- [ ] **Distribution**
  - [ ] Consider Microsoft Store submission
  - [ ] Set up Windows installer (MSI/NSIS)
  - [ ] Configure automatic updates mechanism

#### Linux
- [ ] **Package Distribution**
  - [ ] Create AppImage for universal Linux distribution
  - [ ] Set up .deb packages for Debian/Ubuntu
  - [ ] Create .rpm packages for RedHat/Fedora
  - [ ] Consider Snap and Flatpak packages
  - [ ] Submit to various Linux software repositories

### 🌐 Web Platform

- [ ] **Web Deployment & Hosting**
  - [ ] Choose hosting platform (Vercel, Netlify, CloudFlare Pages, or custom)
  - [ ] Set up custom domain (e.g., litebible.app, readbible.online)
  - [ ] Configure CDN for fast global distribution
  - [ ] Set up HTTPS with SSL certificate
  - [ ] Configure security headers (CSP, HSTS, X-Frame-Options)
  - [ ] Implement gzip/brotli compression for assets
  - [ ] Set up proper caching headers for static assets

- [ ] **Progressive Web App (PWA)**
  - [ ] Create web app manifest.json with proper icons
  - [ ] Implement service worker for offline functionality
  - [ ] Add "Add to Home Screen" prompt
  - [ ] Configure PWA splash screens for mobile
  - [ ] Test PWA installation on various browsers
  - [ ] Implement background sync for user data

- [ ] **Performance Optimization**
  - [ ] Implement lazy loading for Bible text sections
  - [ ] Use compressed Bible data (BSB.ultra.json.gz) with streaming
  - [ ] Optimize First Contentful Paint (FCP) and Largest Contentful Paint (LCP)
  - [ ] Implement virtual scrolling for long content
  - [ ] Add preloading for critical resources
  - [ ] Optimize images and compress assets
  - [ ] Implement critical CSS inlining

- [ ] **Web-Specific Features**
  - [ ] Add keyboard shortcuts for navigation
  - [ ] Implement URL routing for direct chapter/verse linking
  - [ ] Add copy-to-clipboard functionality
  - [ ] Support browser back/forward navigation
  - [ ] Implement print-friendly styles
  - [ ] Add full-text search with highlighting
  - [ ] Support deep linking to specific verses

- [ ] **Browser Compatibility**
  - [ ] Test on Chrome, Firefox, Safari, Edge
  - [ ] Ensure mobile browser compatibility (iOS Safari, Chrome Mobile)
  - [ ] Add polyfills for older browsers if needed
  - [ ] Test on various screen sizes and orientations
  - [ ] Verify touch gestures work properly

- [ ] **SEO & Discovery**
  - [ ] Optimize meta tags (title, description, keywords)
  - [ ] Add Open Graph tags for social sharing
  - [ ] Implement Twitter Card markup
  - [ ] Create structured data (JSON-LD) for Bible content
  - [ ] Submit to search engines (Google, Bing)
  - [ ] Create sitemap.xml for better indexing
  - [ ] Set up Google Search Console
  - [ ] Configure canonical URLs

- [ ] **Analytics & Monitoring**
  - [ ] Set up privacy-compliant analytics (e.g., Plausible, Google Analytics 4)
  - [ ] Implement error tracking (Sentry, LogRocket)
  - [ ] Monitor Core Web Vitals and performance metrics
  - [ ] Set up uptime monitoring
  - [ ] Track user engagement and reading patterns
  - [ ] Monitor loading performance across regions

- [ ] **Accessibility (WCAG 2.1 AA)**
  - [ ] Ensure proper heading hierarchy
  - [ ] Add ARIA labels and descriptions
  - [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
  - [ ] Implement keyboard navigation
  - [ ] Ensure sufficient color contrast ratios
  - [ ] Add skip links for navigation
  - [ ] Support browser zoom up to 200%
  - [ ] Test with assistive technologies

- [ ] **Security & Privacy**
  - [ ] Implement Content Security Policy (CSP)
  - [ ] Configure CORS headers properly
  - [ ] Add Subresource Integrity (SRI) for external resources
  - [ ] Remove unnecessary HTTP headers that leak info
  - [ ] Implement privacy-first analytics
  - [ ] Add privacy policy and cookie notice if needed
  - [ ] Ensure no tracking without consent

- [ ] **User Experience Enhancements**
  - [ ] Add reading progress indicator
  - [ ] Implement bookmarking and favorites
  - [ ] Add reading history and recently viewed
  - [ ] Create customizable reading settings (font, size, spacing)
  - [ ] Add dark/light theme toggle with system preference detection
  - [ ] Implement reading time estimates
  - [ ] Add verse sharing functionality

- [ ] **Distribution & Marketing**
  - [ ] Submit to web directories and showcases
  - [ ] Create landing page with feature highlights
  - [ ] Set up email newsletter signup
  - [ ] Create social media presence
  - [ ] Reach out to Christian communities and blogs
  - [ ] Consider partnerships with Bible study apps
  - [ ] Submit to product hunt and similar platforms

### 🔒 Legal & Compliance

- [ ] **Bible Text Licensing**
  - [ ] Verify Berean Standard Bible licensing terms
  - [ ] Include proper attribution and copyright notices
  - [ ] Ensure compliance with distribution requirements

- [ ] **Privacy & Legal**
  - [ ] Create privacy policy (especially for mobile app stores)
  - [ ] Set up terms of service
  - [ ] Ensure GDPR compliance if applicable
  - [ ] Configure app store privacy declarations

### 🚀 DevOps & Automation

- [ ] **Continuous Integration**
  - [ ] Set up GitHub Actions for automated builds
  - [ ] Configure automatic testing across platforms
  - [ ] Implement automated code signing
  - [ ] Set up automated app store uploads

- [ ] **Release Management**
  - [ ] Implement semantic versioning
  - [ ] Set up automated changelog generation
  - [ ] Configure release notes for each platform
  - [ ] Implement automatic update mechanisms

- [ ] **Monitoring & Analytics**
  - [ ] Set up crash reporting for mobile apps
  - [ ] Implement usage analytics (privacy-compliant)
  - [ ] Configure performance monitoring
  - [ ] Set up user feedback collection

### 📊 Testing & Quality Assurance

- [ ] **Cross-Platform Testing**
  - [ ] Test on various iOS devices and versions
  - [ ] Test on various Android devices and versions
  - [ ] Test on different desktop operating systems
  - [ ] Verify accessibility compliance (WCAG guidelines)

- [ ] **Performance Testing**
  - [ ] Load testing with complete Bible text
  - [ ] Memory usage optimization
  - [ ] Battery usage optimization for mobile
  - [ ] Network performance optimization

### 📈 Launch Strategy

- [ ] **Pre-Launch**
  - [ ] Create landing page with email signup
  - [ ] Set up social media accounts
  - [ ] Prepare press kit and media assets
  - [ ] Reach out to Christian tech communities

- [ ] **Launch**
  - [ ] Coordinate simultaneous release across platforms
  - [ ] Prepare launch announcement blog post
  - [ ] Submit to relevant directories and showcases
  - [ ] Engage with user feedback and iterate quickly

## Platform-Specific Build Commands

```bash
# Desktop
npm run tauri:dev          # Development
npm run tauri:build        # Production

# Android (requires ANDROID_HOME)
npm run tauri:android      # Development
npm run tauri:android:build # Production

# iOS (requires Apple Developer setup)
npm run tauri:ios          # Development  
npm run tauri:ios:build    # Production
```

## File Structure

```
litebible/
├── index.html              # Web application
├── BSB.ultra.json         # Complete Bible data (3.8MB)
├── BSB.ultra.json.gz      # Compressed Bible data (1.2MB)
├── dist/                  # Web distribution files
├── src-tauri/             # Tauri configuration
│   ├── Cargo.toml         # Rust dependencies
│   ├── tauri.conf.json    # Platform configuration
│   ├── src/main.rs        # Rust entry point
│   └── icons/             # Application icons
├── package.json           # Build scripts
└── README.md             # This file
```

## License

[Specify license here - ensure compatibility with BSB licensing]

## Contributing

[Add contribution guidelines if open source]