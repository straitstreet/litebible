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
    <div class="bible-container" id="bibleContainer">
        <div id="currentChapter"></div>
    </div>

    <div class="bible-picker" id="biblePicker">
        <div class="picker-backdrop" id="pickerBackdrop"></div>
        <div class="picker-content">
            <div class="picker-body"></div>
        </div>
    </div>

    <script>
      // Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
      }

      // Bible data and navigation state
      const bibleBooks = ${JSON.stringify(bibleData)};
      let currentBookIndex = 0;
      let currentChapterIndex = 0;
      let totalChapters = [];
      let isDragging = false;
      let startY = 0;
      
      // Build chapter index
      function buildChapterIndex() {
        bibleBooks.forEach((book, bookIndex) => {
          const [bookName, chapters] = book;
          chapters.forEach((chapter, chapterIndex) => {
            totalChapters.push({
              bookIndex,
              bookName,
              chapterIndex,
              chapterNum: chapterIndex + 1,
              verses: chapter
            });
          });
        });
      }

      // Render current chapter
      function renderCurrentChapter() {
        const container = document.getElementById('currentChapter');
        const chapter = totalChapters[currentChapterIndex];
        
        if (!chapter) return;
        
        const versesHTML = chapter.verses.map((verse, verseIndex) => {
          const verseNum = verseIndex + 1;
          return \`<div class="verse"><span class="verse-number">\${verseNum}</span>\${verse}</div>\`;
        }).join('');
        
        container.innerHTML = \`
          <div class="chapter-section">
            <div class="chapter-header">
              <div class="book-chapter-title" onclick="showBiblePicker()">\${chapter.bookName} \${chapter.chapterNum}</div>
            </div>
            <div class="chapter-content">
              \${versesHTML}
            </div>
          </div>
        \`;
      }


      // Touch/Swipe handling
      function handleTouchStart(e) {
        startY = e.touches[0].clientY;
        isDragging = true;
      }

      function handleTouchEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        
        const endY = e.changedTouches[0].clientY;
        const deltaY = startY - endY;
        const threshold = 50;
        
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0) {
            // Swipe up - next chapter
            navigateToNextChapter();
          } else {
            // Swipe down - previous chapter
            navigateToPreviousChapter();
          }
        }
      }

      // Navigation functions
      function navigateToNextChapter() {
        if (currentChapterIndex < totalChapters.length - 1) {
          currentChapterIndex++;
          renderCurrentChapter();
        }
      }
      
      function navigateToPreviousChapter() {
        if (currentChapterIndex > 0) {
          currentChapterIndex--;
          renderCurrentChapter();
        }
      }
      
      // Keyboard navigation
      function handleKeyDown(e) {
        if (e.key === 'ArrowDown' || e.key === ' ') {
          e.preventDefault();
          navigateToNextChapter();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          navigateToPreviousChapter();
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
        
        const bookTitle = document.createElement('button');
        bookTitle.className = 'chapter-book-title';
        bookTitle.textContent = \`‹ \${bookName}\`;
        bookTitle.onclick = () => populateBookList();
        chapterList.appendChild(bookTitle);
        
        chapters.forEach((chapter, chapterIndex) => {
          const chapterButton = document.createElement('button');
          chapterButton.className = 'chapter-button';
          chapterButton.textContent = \`Chapter \${chapterIndex + 1}\`;
          chapterButton.onclick = () => goToChapter(bookIndex, chapterIndex);
          chapterList.appendChild(chapterButton);
        });
        pickerBody.innerHTML = '';
        pickerBody.appendChild(chapterList);
      }

      function goToChapter(bookIndex, chapterIndex) {
        // Find the index in totalChapters
        let targetIndex = 0;
        for (let i = 0; i < bookIndex; i++) {
          targetIndex += bibleBooks[i][1].length;
        }
        targetIndex += chapterIndex;
        
        currentChapterIndex = targetIndex;
        renderCurrentChapter();
        hideBiblePicker();
      }

      // Initialize
      document.addEventListener('DOMContentLoaded', () => {
        buildChapterIndex();
        renderCurrentChapter();
        
        // Event listeners
        const container = document.getElementById('bibleContainer');
        container.addEventListener('touchstart', handleTouchStart);
        container.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('keydown', handleKeyDown);
        
        // Bible picker event listeners
        document.getElementById('pickerBackdrop').addEventListener('click', hideBiblePicker);
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


const CSS = `/* Sepia theme - Default */
body {
    font-family: "Charter", "Iowan Old Style", "Source Serif Pro", "Crimson Text", "Minion Pro", "Lyon Text", "Sabon", "Palatino", "Hoefler Text", "Baskerville", "Georgia", serif;
    line-height: 1.8;
    color: #2c2416;
    background: #f7f3e9;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    transition: all 0.3s ease;
}

.bible-container {
    height: 100vh;
    overflow-y: auto;
}

.chapter-section {
    min-height: 100vh;
    padding: 20px;
    max-width: 700px;
    margin: 0 auto;
    box-sizing: border-box;
}

.book-chapter-title {
    font-size: 1.6em;
    font-weight: normal;
    color: #8b4513;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    user-select: none;
    position: relative;
}

.chapter-header {
    text-align: left;
    margin-bottom: 20px;
    position: sticky;
    top: 0;
    background: #f7f3e9;
    padding: 10px 0;
    backdrop-filter: blur(10px);
}


.verse {
    margin-bottom: 6px;
    user-select: text;
}

.verse-number {
    font-size: 0.75em;
    color: #a0522d;
    margin-right: 6px;
    vertical-align: super;
    transition: color 0.3s ease;
}

.chapter-content {
    text-align: normal;
    line-height: 1.8;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
    body {
        color: #e8e8e8;
        background: #1a1a1a;
    }

    .chapter-header {
        background: #1a1a1a;
    }

    .chapter-section {
        background: #1a1a1a;
    }


    .book-chapter-title {
        color: #d4a574;
    }

    .verse-number {
        color: #b8956f;
    }

    .bible-picker {
        background: rgba(0, 0, 0, 0.8);
    }

    .picker-content {
        background: rgba(26, 26, 26, 0.98) !important;
        border-color: rgba(212, 165, 116, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    }

    .chapter-book-title {
        color: #e8e8e8;
    }

    .chapter-book-title:hover {
        color: #e8c896;
        background: rgba(212, 165, 116, 0.05);
    }

    .book-button {
        color: #f5f5f5;
        border-bottom-color: rgba(212, 165, 116, 0.2);
    }

    .book-button:hover {
        background: rgba(212, 165, 116, 0.15);
        color: #e8c896;
    }

    .chapter-button {
        color: #f5f5f5;
        border-bottom-color: rgba(212, 165, 116, 0.2);
    }

    .chapter-button:hover {
        background: rgba(212, 165, 116, 0.15);
        color: #e8c896;
    }
    
    .back-button {
        color: #b8956f;
    }

    .back-button:hover {
        background: rgba(212, 165, 116, 0.05);
    }
}

/* Bible Picker Styles */
.bible-picker {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    align-items: center;
    justify-content: center;
    background: rgba(44, 36, 22, 0.8);
    backdrop-filter: blur(6px);
}

.picker-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.picker-content {
    background: rgba(247, 243, 233, 0.98);
    backdrop-filter: blur(15px);
    max-width: 320px;
    width: 80vw;
    max-height: 60vh;
    box-shadow: 0 8px 32px rgba(44, 36, 22, 0.4);
    position: relative;
    z-index: 1001;
    font-family: "Charter", "Iowan Old Style", "Source Serif Pro", "Crimson Text", serif;
    border-radius: 6px;
    border: 1px solid rgba(139, 69, 19, 0.2);
}


.picker-body {
    max-height: 60vh;
    overflow-y: scroll;
}

.book-button {
    display: block;
    width: 100%;
    padding: 12px 0;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    font-family: inherit;
    font-size: 1.05em;
    font-style: italic;
    transition: all 0.2s ease;
    border-bottom: 1px solid rgba(139, 69, 19, 0.08);
}

.book-button:hover {
    background: rgba(139, 69, 19, 0.05);
    color: #8b4513;
}

.book-button:last-child {
    border-bottom: none;
}

.back-button {
    color: #a0522d;
    font-size: 0.95em;
    margin-bottom: 12px;
    padding: 8px 0;
    border-bottom: none !important;
    text-align: center;
}

.back-button:hover {
    text-decoration: underline;
    background: rgba(139, 69, 19, 0.03);
}

.chapter-list {
    display: none;
}

.chapter-list.active {
    display: block;
}

.chapter-book-title {
    font-size: 1.3em;
    font-family: "Charter", "Iowan Old Style", "Source Serif Pro", "Crimson Text", serif;
    color: #6d3a0f;
    margin-bottom: 12px;
    font-weight: normal;
    font-style: normal;
    text-align: center;
    border: none;
    padding: 12px 0;
    background: none;
    cursor: pointer;
    transition: color 0.2s ease;
    width: 100%;
}

.chapter-book-title:hover {
    color: #a0522d;
}

.chapter-list {
    display: none;
}

.chapter-list.active {
    display: block;
}

.chapter-button {
    display: block;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    font-family: inherit;
    font-size: 1.05em;
    font-style: italic;
    color: #1a1409;
    transition: all 0.2s ease;
    padding: 10px 0;
    border-bottom: 1px solid rgba(139, 69, 19, 0.08);
}

.chapter-button:hover {
    background: rgba(139, 69, 19, 0.05);
    color: #8b4513;
}

.chapter-button:last-child {
    border-bottom: none;
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

const SERVICE_WORKER = `const CACHE_NAME = 'bible-reader-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});`;