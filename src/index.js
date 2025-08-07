import bibleData from './bible-data.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/styles.css") {
      return new Response(CSS, {
        headers: {
          'Content-Type': 'text/css',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block'
        }
      });
    }

    if (url.pathname === "/manifest.json") {
      return new Response(MANIFEST, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    if (url.pathname === "/sw.js") {
      return new Response(SERVICE_WORKER, {
        headers: {
          'Content-Type': 'application/javascript',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bible</title>
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
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="app-header">
        <div class="header-content">
            <h1 class="app-title">
                <span class="book-chapter">
                    <span class="book-name" id="headerBookName" onclick="showBiblePicker()">Genesis</span> <span class="chapter-number" id="headerChapterNumber" onclick="showChapterPicker()">1</span>
                </span>
            </h1>
            <button class="about-button" onclick="showAboutModal()">About</button>
        </div>
        <div class="scroll-blur-mask"></div>
    </header>

    <main class="bible-container" id="bibleContainer">
        <div id="currentChapter"></div>
    </main>

    <div class="bible-picker" id="biblePicker">
        <div class="picker-backdrop" id="pickerBackdrop"></div>
        <div class="picker-content">
            <div class="picker-body"></div>
        </div>
    </div>

    <div class="about-modal" id="aboutModal">
        <div class="modal-backdrop" id="aboutBackdrop"></div>
        <div class="modal-content">
            <div class="modal-body">
                <h2>About This Bible</h2>
                <p><strong>The Holy Bible, Berean Standard Bible, BSB</strong> is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain.</p>
                
                <p>This application is built by <a href="https://straitstreet.co" target="_blank" rel="noopener noreferrer">Strait Street</a> with a philosophy of responsibly using resources and creating a polished, distraction-free reading experience. We believe technology should serve the text, not overwhelm it.</p>
                
                <p><em>"Freely you have received, freely give."</em> — Matthew 10:8 BSB</p>
                
                <p>In this spirit, we offer this tool freely, believing that access to God's Word should be unencumbered by barriers, distractions, or commercial interests.</p>
            </div>
        </div>
    </div>


    <script>
      // Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
      }

      // Bible data
      const bibleBooks = ${JSON.stringify(bibleData)};

      // Render complete Bible document
      function renderCompleteBible() {
        const container = document.getElementById('currentChapter');
        let completeHTML = '';
        
        bibleBooks.forEach((book, bookIndex) => {
          const [bookName, chapters] = book;
          
          chapters.forEach((chapter, chapterIndex) => {
            const chapterNum = chapterIndex + 1;
            const versesHTML = chapter.map((verse, verseIndex) => {
              const verseNum = verseIndex + 1;
              return \`<div class="verse"><span class="verse-number">\${verseNum}</span>\${verse}</div>\`;
            }).join('');
            
            completeHTML += \`
              <div class="chapter-section" id="book-\${bookIndex}-chapter-\${chapterIndex}">
                <div class="chapter-header">
                  <h2 class="chapter-title">\${bookName} \${chapterNum}</h2>
                </div>
                <div class="chapter-content">
                  \${versesHTML}
                </div>
              </div>
            \`;
          });
        });
        
        container.innerHTML = completeHTML;
      }

      // Simple scroll to chapter function
      function goToChapter(bookIndex, chapterIndex) {
        const chapterEl = document.getElementById(\`book-\${bookIndex}-chapter-\${chapterIndex}\`);
        if (chapterEl) {
          chapterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Update header
          const book = bibleBooks[bookIndex];
          if (book) {
            document.getElementById('headerBookName').textContent = book[0];
            document.getElementById('headerChapterNumber').textContent = chapterIndex + 1;
          }
          
          hideBiblePicker();
        }
      }

      // Bible picker functions
      function showBiblePicker() {
        document.getElementById('biblePicker').style.display = 'flex';
        populateBookList();
      }

      function hideBiblePicker() {
        document.getElementById('biblePicker').style.display = 'none';
      }

      // About modal functions
      function showAboutModal() {
        document.getElementById('aboutModal').style.display = 'flex';
      }

      function hideAboutModal() {
        document.getElementById('aboutModal').style.display = 'none';
      }

      // Show chapter picker for current book (simplified)
      function showChapterPicker() {
        showBiblePicker();
      }

      function populateBookList() {
        const pickerBody = document.querySelector('.picker-body');
        pickerBody.innerHTML = '';
        
        bibleBooks.forEach((book, bookIndex) => {
          const [bookName, chapters] = book;
          const bookButton = document.createElement('button');
          bookButton.className = 'book-button';
          bookButton.textContent = bookName;
          bookButton.onclick = () => selectBook(bookIndex, bookName, chapters);
          pickerBody.appendChild(bookButton);
        });
      }

      function selectBook(bookIndex, bookName, chapters) {
        const pickerBody = document.querySelector('.picker-body');
        const chapterList = document.createElement('div');
        chapterList.className = 'chapter-list active';
        
        const bookTitle = document.createElement('div');
        bookTitle.className = 'chapter-book-header';
        bookTitle.textContent = bookName;
        bookTitle.onclick = () => populateBookList();
        bookTitle.style.cursor = 'pointer';
        chapterList.appendChild(bookTitle);
        
        const chapterGrid = document.createElement('div');
        chapterGrid.className = 'chapter-grid';
        
        chapters.forEach((chapter, chapterIndex) => {
          const chapterButton = document.createElement('button');
          chapterButton.className = 'chapter-number-button';
          chapterButton.textContent = chapterIndex + 1;
          chapterButton.onclick = () => goToChapter(bookIndex, chapterIndex);
          chapterGrid.appendChild(chapterButton);
        });
        
        chapterList.appendChild(chapterGrid);
        pickerBody.innerHTML = '';
        pickerBody.appendChild(chapterList);
      }

      // Simple keyboard navigation
      function handleKeyDown(e) {
        if (e.key === 'Escape') {
          hideBiblePicker();
          hideAboutModal();
        } else if (e.key === 'Backspace') {
          const chapterList = document.querySelector('.chapter-list.active');
          if (chapterList) {
            populateBookList();
          }
        }
      }

      // Initialize
      document.addEventListener('DOMContentLoaded', () => {
        renderCompleteBible();
        
        // Event listeners
        document.addEventListener('keydown', handleKeyDown);
        document.getElementById('pickerBackdrop').addEventListener('click', hideBiblePicker);
        document.getElementById('aboutBackdrop').addEventListener('click', hideAboutModal);
      });
    </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block'
      }
    });
  }
};


const CSS = `/* Base styling */
* {
    box-sizing: border-box;
}

body {
    font-family: "Charter", "Iowan Old Style", "Source Serif Pro", "Crimson Text", "Minion Pro", "Lyon Text", "Sabon", "Palatino", "Hoefler Text", "Baskerville", "Georgia", serif;
    line-height: 1.8;
    color: #2c2416;
    background: #f7f3e9;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    transition: all 0.2s ease;
}

/* Header */
.app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: rgba(247, 243, 233, 0.95);
    backdrop-filter: blur(10px);
    transform: translateY(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 20px;
    max-width: 700px;
    margin: 0 auto;
}

.app-title {
    margin: 0;
    font-size: 1.4em;
    font-weight: normal;
    color: #8b4513;
    user-select: none;
}

.book-chapter {
    display: inline;
}

.book-name {
    color: #8b4513;
}

.chapter-number {
    color: #a0522d;
    font-weight: 600;
}

.clickable-indicator {
    font-size: 0.8em;
    color: #a0522d;
    margin-left: 4px;
    opacity: 0.7;
}

.book-name,
.chapter-number {
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.book-name:hover,
.chapter-number:hover {
    opacity: 0.8;
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
    transition: all 0.2s ease;
}

.about-button:hover {
    background: rgba(139, 69, 19, 0.1);
    color: #6d3a0f;
}


.scroll-blur-mask {
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(to bottom, transparent, rgba(247, 243, 233, 0.95));
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(8px);
}

/* Main content */
.bible-container {
    height: 100vh;
    overflow-y: auto;
    padding-top: 70px;
    scroll-behavior: smooth;
}

.chapter-section {
    padding: 20px;
    max-width: 700px;
    margin: 0 auto;
}

.chapter-header {
    margin-bottom: 20px;
    text-align: center;
}

.chapter-title {
    margin: 0;
    font-size: 1.8em;
    font-weight: normal;
    color: #8b4513;
    opacity: 0.9;
}

.chapter-content {
    text-align: left;
    line-height: 1.8;
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


/* Modal base styles */
.bible-picker,
.settings-modal,
.about-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    align-items: center;
    justify-content: center;
    background: rgba(44, 36, 22, 0.7);
    backdrop-filter: blur(6px);
}

.picker-backdrop,
.settings-backdrop,
.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.picker-content,
.modal-content {
    background: rgba(247, 243, 233, 0.98);
    backdrop-filter: blur(15px);
    max-width: 400px;
    width: 85vw;
    max-height: 70vh;
    box-shadow: 0 12px 40px rgba(44, 36, 22, 0.3);
    position: relative;
    z-index: 1001;
    font-family: inherit;
    border-radius: 8px;
    border: 1px solid rgba(139, 69, 19, 0.15);
    overflow: hidden;
}

/* Bible picker specific styles */
.picker-body {
    max-height: 70vh;
    overflow-y: auto;
}

/* About modal specific styles */
.modal-body {
    padding: 24px;
    max-height: 70vh;
    overflow-y: auto;
}

.modal-body h2 {
    margin: 0 0 16px 0;
    color: #6d3a0f;
    font-size: 1.3em;
    font-weight: normal;
    text-align: center;
}

.modal-body p {
    margin: 0 0 12px 0;
    line-height: 1.6;
    color: #2c2416;
    text-align: left;
}

.modal-body p:last-child {
    margin-bottom: 0;
}

.modal-body a {
    color: #8b4513;
    text-decoration: underline;
    transition: color 0.2s ease;
}

.modal-body a:hover {
    color: #6d3a0f;
}

.modal-body em {
    font-style: italic;
    color: #8b4513;
}

.book-button,
.chapter-button {
    display: block;
    width: 100%;
    padding: 14px 20px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    font-family: inherit;
    font-size: 1.05em;
    color: #2c2416;
    transition: all 0.2s ease;
}

.book-button:hover,
.chapter-button:hover {
    background: rgba(139, 69, 19, 0.08);
    color: #8b4513;
}


.chapter-list {
    display: none;
}

.chapter-list.active {
    display: block;
}

.chapter-book-header {
    font-size: 1.4em;
    color: #6d3a0f;
    margin-bottom: 24px;
    font-weight: normal;
    text-align: center;
    padding: 20px 20px 0 20px;
    font-family: inherit;
    transition: color 0.2s ease;
}

.chapter-book-header:hover {
    color: #a0522d;
}

.chapter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 12px;
    padding: 0 20px 20px 20px;
    max-height: 50vh;
    overflow-y: auto;
}

.chapter-number-button {
    aspect-ratio: 1;
    min-height: 50px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    font-family: inherit;
    font-size: 1.1em;
    color: #2c2416;
    transition: all 0.2s ease;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.chapter-number-button:hover {
    background: rgba(139, 69, 19, 0.1);
    color: #8b4513;
}


/* Dark theme */
@media (prefers-color-scheme: dark) {
    body {
        color: #e4e0d6;
        background: #1a1812;
    }

    .app-header {
        background: rgba(26, 24, 18, 0.95);
    }

    .app-title {
        color: #d4b896;
    }

    .book-name {
        color: #d4b896;
    }

    .chapter-number {
        color: #c9a876;
    }

    .clickable-indicator {
        color: #c9a876;
    }

    .about-button {
        color: #d4b896;
    }

    .about-button:hover {
        background: rgba(164, 137, 87, 0.15);
        color: #e8d2a6;
    }


    .scroll-blur-mask {
        background: linear-gradient(to bottom, transparent, rgba(26, 24, 18, 0.95));
    }

    .verse-number {
        color: #c9a876;
    }

    .bible-picker,
    .about-modal {
        background: rgba(0, 0, 0, 0.7);
    }

    .picker-content,
    .modal-content {
        background: rgba(26, 24, 18, 0.98);
        border-color: rgba(164, 137, 87, 0.2);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
    }

    .modal-body h2 {
        color: #d4b896;
    }

    .modal-body p {
        color: #e4e0d6;
    }

    .modal-body a {
        color: #d4b896;
    }

    .modal-body a:hover {
        color: #e8d2a6;
    }

    .modal-body em {
        color: #d4b896;
    }

    .book-button,
    .chapter-button {
        color: #e4e0d6;
    }

    .book-button:hover,
    .chapter-button:hover {
        background: rgba(164, 137, 87, 0.15);
        color: #d4b896;
    }

    .chapter-book-header {
        color: #d4b896;
    }

    .chapter-book-header:hover {
        color: #e8d2a6;
    }

    .chapter-number-button {
        color: #e4e0d6;
    }

    .chapter-number-button:hover {
        background: rgba(164, 137, 87, 0.15);
        color: #d4b896;
    }

    .chapter-title {
        color: #d4b896;
    }
}

/* Responsive design */
@media (max-width: 480px) {
    .header-content {
        padding: 10px 16px;
    }

    .app-title {
        font-size: 1.2em;
    }

    .chapter-section {
        padding: 16px;
    }

    .picker-content,
    .settings-content {
        width: 92vw;
        max-height: 80vh;
    }

    .settings-body {
        padding: 16px;
    }
}`;

const MANIFEST = `{
  "name": "Bible Reader",
  "short_name": "Bible",
  "description": "Ultra-minimal Bible reading application",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f7f3e9",
  "theme_color": "#f7f3e9",
  "orientation": "portrait",
  "categories": ["books", "education", "lifestyle"],
  "icons": [
    {
      "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' fill='%23000'/%3E%3Ctext x='96' y='125' text-anchor='middle' fill='white' font-size='120' font-family='serif'%3E📜%3C/text%3E%3C/svg%3E",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%23000'/%3E%3Ctext x='256' y='330' text-anchor='middle' fill='white' font-size='320' font-family='serif'%3E📜%3C/text%3E%3C/svg%3E",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}`;

const SERVICE_WORKER = `const CACHE_NAME = 'bible-reader-v2';
const urlsToCache = [
  '/',
  '/styles.css',
  '/manifest.json'
];

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Check if cached response exists and is still fresh
        if (response) {
          const cachedDate = new Date(response.headers.get('date'));
          const now = new Date();
          const age = now.getTime() - cachedDate.getTime();
          
          // If cache is older than CACHE_DURATION, fetch fresh version
          if (age > CACHE_DURATION) {
            return fetch(event.request).then(fetchResponse => {
              // Update cache with fresh response
              if (fetchResponse.ok) {
                const responseClone = fetchResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, responseClone);
                });
              }
              return fetchResponse;
            }).catch(() => response); // Fallback to cached version if fetch fails
          }
          
          return response;
        }
        
        // No cached response, fetch from network
        return fetch(event.request).then(fetchResponse => {
          // Only cache successful responses for specific URLs
          if (fetchResponse.ok && urlsToCache.some(url => event.request.url.includes(url))) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
  );
});`;