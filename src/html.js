export default `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lite Bible</title>
    <meta name="description" content="Read the complete Berean Standard Bible online. Ultra-minimal, fast-loading Bible reader with infinite scroll and dark mode. All 66 books freely available.">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" sizes="180x180" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'%3E%3Crect width='180' height='180' fill='%23000'/%3E%3Ctext x='90' y='115' text-anchor='middle' fill='white' font-size='110' font-family='serif'%3E📜%3C/text%3E%3C/svg%3E">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23000'/%3E%3Ctext x='16' y='24' text-anchor='middle' fill='white' font-size='20' font-family='serif'%3E📜%3C/text%3E%3C/svg%3E">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="theme-color" content="#f7f3e9">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <style>
        /* Critical CSS inlined for performance */
        :root {
            --bg-color: #f7f3e9;
            --text-color: #2c2416;
            --header-bg: rgba(247, 243, 233, 0.98);
            --border-color: rgba(139, 69, 19, 0.1);
            --accent-color: #8b4513;
            --verse-number-color: #a0522d;
        }

        /* Base styling with performance optimizations */
        * {
            box-sizing: border-box;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Disable all animations and transitions for maximum performance */
        *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important; 
            transition-duration: 0s !important;
            transition-delay: 0s !important;
        }

        body {
            font-family: "Charter", "Iowan Old Style", "Source Serif Pro", "Crimson Text", "Minion Pro", "Lyon Text", "Sabon", "Palatino", "Hoefler Text", "Baskerville", "Georgia", serif;
            line-height: 1.8;
            color: var(--text-color, #2c2416);
            background: var(--bg-color, #f7f3e9);
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            text-rendering: optimizeSpeed;
            contain: layout style;
        }

        /* Header */
        .app-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: var(--header-bg);
            transform: translateY(0);
            border-bottom: 1px solid var(--border-color);
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            max-width: 700px;
            margin: 0 auto;
        }

        .about-button {
            background: none;
            border: none;
            color: #8b4513;
            font-family: inherit;
            font-size: 0.9em;
            cursor: pointer;
            padding: 4px 8px;
            border-radius: 4px;
        }

        /* Main content */
        .bible-container {
            height: 100vh;
            overflow-y: auto;
            padding-top: 70px;
            position: relative;
            z-index: 1;
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
        }

        .chapter-section {
            padding: 20px;
            max-width: 700px;
            margin: 0 auto;
            min-height: calc(100vh - 70px);
            contain: layout;
        }

        .chapter-title {
            margin: 0;
            font-size: 2.2em;
            font-weight: 300;
            color: #8b4513;
            opacity: 0.85;
            letter-spacing: 0.5px;
            text-shadow: 0 1px 2px rgba(139, 69, 19, 0.1);
            font-family: "Charter", "Iowan Old Style", "Source Serif Pro", serif;
            cursor: pointer;
            text-align: center;
        }

        .verse {
            margin-bottom: 8px;
            user-select: text;
            position: relative;
        }

        .verse-number {
            font-size: 0.75em;
            color: #a0522d;
            margin-right: 8px;
            vertical-align: super;
            font-weight: 500;
            opacity: 0.8;
        }

        @media (prefers-color-scheme: dark) {
            body {
                color: #e4e0d6;
                background: #1a1812;
            }
            .app-header {
                background: rgba(26, 24, 18, 0.98);
                border-bottom-color: rgba(164, 137, 87, 0.15);
            }
            .about-button {
                color: #d4b896;
            }
            .verse-number {
                color: #c9a876;
            }
            .chapter-title {
                color: #d4b896;
                text-shadow: 0 1px 2px rgba(212, 184, 150, 0.1);
            }
        }
    </style>
    <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="styles.css"></noscript>
</head>
<body>
    <header class="app-header">
        <div class="header-content">
            <button class="about-button" onclick="showSettingsModal()">Settings</button>
        </div>
    </header>

    <main class="bible-container" id="bibleContainer">
        <div id="currentChapter"></div>
        <noscript>
            <div style="padding: 40px 20px; text-align: center; max-width: 600px; margin: 0 auto; font-family: inherit;">
                <h2 style="color: #8b4513; margin-bottom: 20px;">JavaScript Required</h2>
                <p style="margin-bottom: 20px; line-height: 1.6;">This Bible reader requires JavaScript for the best experience with infinite scroll and chapter navigation.</p>
                <p style="margin-bottom: 30px; line-height: 1.6;">For a simple, static version that works without JavaScript:</p>
                <a href="/plain" style="display: inline-block; padding: 12px 24px; background: #8b4513; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">View Lite Bible</a>
            </div>
        </noscript>
    </main>

    <div class="bible-picker" id="biblePicker">
        <div class="picker-backdrop" id="pickerBackdrop"></div>
        <div class="picker-content">
            <div class="picker-body"></div>
        </div>
    </div>

    <div class="settings-modal" id="settingsModal">
        <div class="modal-backdrop" id="settingsBackdrop"></div>
        <div class="modal-content">
            <div class="modal-body">
                <h2>Settings</h2>
                
                <div class="setting-group">
                    <h3>Font Family</h3>
                    <div class="font-options">
                        <label class="font-option" data-font="system-serif">
                            <input type="radio" name="font" value="system-serif" checked>
                            <div class="option-content">
                                <span class="option-name">System Serif</span>
                                <span class="option-preview system-serif-font">Aa</span>
                            </div>
                        </label>
                        <label class="font-option" data-font="system-sans">
                            <input type="radio" name="font" value="system-sans">
                            <div class="option-content">
                                <span class="option-name">System Sans</span>
                                <span class="option-preview system-sans-font">Aa</span>
                            </div>
                        </label>
                        <label class="font-option" data-font="serif">
                            <input type="radio" name="font" value="serif">
                            <div class="option-content">
                                <span class="option-name">Crimson Text</span>
                                <span class="option-preview serif-font">Aa</span>
                            </div>
                        </label>
                        <label class="font-option" data-font="sans">
                            <input type="radio" name="font" value="sans">
                            <div class="option-content">
                                <span class="option-name">Source Sans Pro</span>
                                <span class="option-preview sans-font">Aa</span>
                            </div>
                        </label>
                        <label class="font-option" data-font="slab">
                            <input type="radio" name="font" value="slab">
                            <div class="option-content">
                                <span class="option-name">Zilla Slab</span>
                                <span class="option-preview slab-font">Aa</span>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="about-section">
                    <h3>About Lite Bible</h3>
                    <p><strong>The Holy Bible, Berean Standard Bible, BSB</strong> is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain.</p>
                    
                    <p><em>"Freely you have received; freely give."</em> — Matthew 10:8 BSB</p>
                    
                    <p>In obedience to our Lord, <a href="https://straitstreet.co" target="_blank" rel="noopener noreferrer">Strait Street</a> has also made Lite Bible free for all.</p>
                    
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(139, 69, 19, 0.2); font-size: 0.85em; color: #8b4513; text-align: center;">
                        v1.0.0
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Minimal inline script to start loading content immediately
        window.bibleData = null; // Will be populated by the external script
        
        // Load the main script asynchronously
        const script = document.createElement('script');
        script.src = 'script.js';
        script.async = true;
        document.head.appendChild(script);
    </script>
</body>
</html>`;