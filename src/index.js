import bibleData from './bible-data.js';

// Generate complete Bible HTML for no-JS fallback
function generateCompleteBibleHTML() {
  return bibleData.map((book, bookIndex) => {
    const [bookName, chapters] = book;
    return `<div class="book-section">
      <h1 class="book-title">${bookName}</h1>
      ${chapters.map((verses, chapterIndex) => {
      const chapterNum = chapterIndex + 1;
      const versesHTML = verses.map((verse, verseIndex) => {
        const verseNum = verseIndex + 1;
        return `<div class="verse"><span class="verse-number">${verseNum}</span>${verse}</div>`;
      }).join('');

      return `<div class="chapter-section" id="book-${bookIndex}-chapter-${chapterIndex}">
          <div class="chapter-header">
            <h2 class="chapter-title" onclick="showBiblePicker()">${bookName} ${chapterNum}</h2>
          </div>
          <div class="chapter-content">
            ${versesHTML}
          </div>
        </div>`;
    }).join('')}
    </div>`;
  }).join('');
}

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
          'X-XSS-Protection': '1; mode=block',
          'Cache-Control': 'public, max-age=300, must-revalidate', // 5 minute cache
          'ETag': `"styles-${Date.now()}"`
        }
      });
    }

    if (url.pathname === "/manifest.json") {
      return new Response(MANIFEST, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none;",
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=86400', // 24 hour cache for manifest
          'ETag': `"manifest-${Date.now()}"`
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
            <button class="about-button" onclick="showAboutModal()">About</button>
        </div>
    </header>

    <main class="bible-container" id="bibleContainer">
        <div id="currentChapter"></div>
        <noscript>
            <div class="no-js-content">
                ${generateCompleteBibleHTML()}
            </div>
        </noscript>
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
                <h2>About Lite Bible</h2>
                <p><strong>The Holy Bible, Berean Standard Bible, BSB</strong> is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain.</p>
                
                <p><em>“Freely you have received; freely give.”</em> — Matthew 10:8 BSB</p>
                
                <p>In obedience to our Lord, <a href="https://straitstreet.co" target="_blank" rel="noopener noreferrer">Strait Street</a> has also provided Lite Bible freely to all.</p>
                
                <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(139, 69, 19, 0.2); font-size: 0.85em; color: #8b4513; text-align: center;">
                    v1.0.0
                </div>
            </div>
        </div>
    </div>


    <script>

      // Bible data and current chapter tracking
      const bibleBooks = ${JSON.stringify(bibleData)};
      let currentBookIndex = 0;
      let currentChapterIndex = 0;
      let loadedChapters = new Map(); // Map: chapterKey -> DOM element
      let scrollContainer = null;
      let isLoading = false;
      
      // Header scroll behavior
      let lastScrollTop = 0;
      let isHeaderVisible = true;
      let headerTimeout;
      
      // Reading position storage
      const STORAGE_KEY = 'bible-reading-position';
      let savePositionTimeout;
      
      // Save reading position to localStorage
      function saveReadingPosition(bookIndex, chapterIndex, verse = null) {
        const position = {
          bookIndex,
          chapterIndex,
          verse,
          timestamp: Date.now()
        };
        
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
        } catch (e) {
        }
      }
      
      // Load reading position from localStorage
      function loadReadingPosition() {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            const position = JSON.parse(saved);
            return position;
          }
        } catch (e) {
        }
        return null;
      }
      
      // Throttled position save (don't save too frequently)
      function throttledSavePosition(bookIndex, chapterIndex, verse) {
        if (savePositionTimeout) {
          clearTimeout(savePositionTimeout);
        }
        
        savePositionTimeout = setTimeout(() => {
          saveReadingPosition(bookIndex, chapterIndex, verse);
        }, 2000); // Save 2 seconds after user stops scrolling
      }
      
      // Show header
      function showHeader() {
        const header = document.querySelector('.app-header');
        if (header && !isHeaderVisible) {
          header.style.transform = 'translateY(0)';
          isHeaderVisible = true;
        }
      }
      
      // Hide header
      function hideHeader() {
        const header = document.querySelector('.app-header');
        if (header && isHeaderVisible) {
          header.style.transform = 'translateY(-100%)';
          isHeaderVisible = false;
        }
      }
      
      // Handle header visibility based on scroll direction
      function handleHeaderScroll(scrollTop) {
        const scrollDelta = scrollTop - lastScrollTop;
        const scrollThreshold = 25; // Only react to more significant scrolls
        
        // Clear any existing timeout
        if (headerTimeout) {
          clearTimeout(headerTimeout);
        }
        
        if (Math.abs(scrollDelta) > scrollThreshold) {
          if (scrollDelta > 0 && scrollTop > 100) {
            // Scrolling down and past initial area - hide header
            hideHeader();
          } else if (scrollDelta < 0) {
            // Scrolling up - show header
            showHeader();
          }
        }
        
        // Always show header if we're at the top
        if (scrollTop < 50) {
          showHeader();
        }
        
        // Auto-hide after 5 seconds of no scrolling when not at top
        if (scrollTop > 100) {
          headerTimeout = setTimeout(() => {
            hideHeader();
          }, 5000);
        }
        
        lastScrollTop = scrollTop;
      }
      

      // Initialize chapters with simplified loading
      function initializeChapters() {
        scrollContainer = document.getElementById('bibleContainer');
        const container = document.getElementById('currentChapter');
        
        // Clear existing content
        container.innerHTML = '';
        loadedChapters.clear();
        
        // Load saved reading position
        const savedPosition = loadReadingPosition();
        if (savedPosition && savedPosition.bookIndex !== undefined && savedPosition.chapterIndex !== undefined) {
          // Validate saved position is still valid
          if (savedPosition.bookIndex >= 0 && savedPosition.bookIndex < bibleBooks.length &&
              savedPosition.chapterIndex >= 0 && savedPosition.chapterIndex < bibleBooks[savedPosition.bookIndex][1].length) {
            currentBookIndex = savedPosition.bookIndex;
            currentChapterIndex = savedPosition.chapterIndex;
          }
        }
        
        // Load initial chapter set (current + 2 before + 2 after)
        loadChapterRange(currentBookIndex, currentChapterIndex, 2, 2);
        
        // Only scroll to position if we have a saved reading position
        if (savedPosition && savedPosition.bookIndex !== undefined && savedPosition.chapterIndex !== undefined) {
          setTimeout(() => {
            if (savedPosition.verse) {
              scrollToVerse(currentBookIndex, currentChapterIndex, savedPosition.verse, false);
            } else {
              scrollToChapter(currentBookIndex, currentChapterIndex, false);
            }
          }, 100);
        }
        
        setupInfiniteScroll();
      }
      
      // Load a range of chapters in correct order
      function loadChapterRange(startBookIndex, startChapterIndex, beforeCount, afterCount) {
        const chaptersToLoad = [];
        
        // Get chapters before (in reverse order to build array correctly)
        const beforeChapters = [];
        let currentBook = startBookIndex;
        let currentChap = startChapterIndex;
        for (let i = 0; i < beforeCount; i++) {
          const prevChapter = getPreviousChapter(currentBook, currentChap);
          if (prevChapter) {
            beforeChapters.unshift(prevChapter); // Add to beginning
            currentBook = prevChapter.bookIndex;
            currentChap = prevChapter.chapterIndex;
          } else {
            break;
          }
        }
        
        // Add all chapters in chronological order
        chaptersToLoad.push(...beforeChapters);
        chaptersToLoad.push({ bookIndex: startBookIndex, chapterIndex: startChapterIndex });
        
        // Get chapters after
        currentBook = startBookIndex;
        currentChap = startChapterIndex;
        for (let i = 0; i < afterCount; i++) {
          const nextChapter = getNextChapter(currentBook, currentChap);
          if (nextChapter) {
            chaptersToLoad.push(nextChapter);
            currentBook = nextChapter.bookIndex;
            currentChap = nextChapter.chapterIndex;
          } else {
            break;
          }
        }
        
        // Load chapters in chronological order
        chaptersToLoad.forEach(chapter => {
          if (!loadedChapters.has(chapter.bookIndex + '-' + chapter.chapterIndex)) {
            loadChapter(chapter.bookIndex, chapter.chapterIndex);
          }
        });
      }
      
      // Load a single chapter (simplified)
      function loadChapter(bookIndex, chapterIndex) {
        const chapterKey = bookIndex + '-' + chapterIndex;
        
        // Skip if already loaded or invalid
        if (loadedChapters.has(chapterKey) || !isValidChapter(bookIndex, chapterIndex)) {
          return null;
        }
        
        const book = bibleBooks[bookIndex];
        const verses = book[1][chapterIndex];
        const chapterNum = chapterIndex + 1;
        
        const versesHTML = verses.map((verse, verseIndex) => {
          const verseNum = verseIndex + 1;
          return '<div class="verse"><span class="verse-number">' + verseNum + '</span>' + verse + '</div>';
        }).join('');
        
        const chapterElement = document.createElement('div');
        chapterElement.className = 'chapter-section';
        chapterElement.id = 'book-' + bookIndex + '-chapter-' + chapterIndex;
        chapterElement.innerHTML = 
          '<div class="chapter-header">' +
            '<h2 class="chapter-title">' + book[0] + " " + chapterNum + '</h2>' +
          '</div>' +
          '<div class="chapter-content">' +
            versesHTML +
          '</div>';
        
        // Insert in correct position
        insertChapterInOrder(document.getElementById('currentChapter'), chapterElement, bookIndex, chapterIndex);
        
        loadedChapters.set(chapterKey, chapterElement);
        return chapterElement;
      }
      
      // Helper to check if chapter coordinates are valid
      function isValidChapter(bookIndex, chapterIndex) {
        if (bookIndex < 0 || bookIndex >= bibleBooks.length) return false;
        if (chapterIndex < 0 || chapterIndex >= bibleBooks[bookIndex][1].length) return false;
        return true;
      }
      
      // Insert chapter in correct DOM order
      function insertChapterInOrder(container, newElement, bookIndex, chapterIndex) {
        const newPosition = getChapterPosition(bookIndex, chapterIndex);
        const existingElements = container.children;
        
        // If no existing elements, just append
        if (existingElements.length === 0) {
          container.appendChild(newElement);
          return;
        }
        
        // Find the correct position to insert
        for (let i = 0; i < existingElements.length; i++) {
          const existingEl = existingElements[i];
          const match = existingEl.id.match(/book-(\d+)-chapter-(\d+)/);
          if (match) {
            const existingPosition = getChapterPosition(parseInt(match[1]), parseInt(match[2]));
            if (newPosition < existingPosition) {
              // Insert before this element
              container.insertBefore(newElement, existingEl);
              return;
            }
          }
        }
        
        // If we get here, this chapter comes after all existing ones
        container.appendChild(newElement);
      }
      
      // Get linear position of chapter in Bible
      function getChapterPosition(bookIndex, chapterIndex) {
        let position = 0;
        for (let i = 0; i < bookIndex; i++) {
          position += bibleBooks[i][1].length;
        }
        return position + chapterIndex;
      }
      
      // Scroll to specific chapter
      function scrollToChapter(bookIndex, chapterIndex, smooth = false) {
        const chapterEl = document.getElementById('book-' + bookIndex + '-chapter-' + chapterIndex);
        if (chapterEl) {
          chapterEl.scrollIntoView({ 
            behavior: smooth ? 'smooth' : 'instant', 
            block: 'start' 
          });
        }
      }
      
      // Scroll to specific verse
      function scrollToVerse(bookIndex, chapterIndex, verseNumber, smooth = false) {
        const chapterEl = document.getElementById('book-' + bookIndex + '-chapter-' + chapterIndex);
        if (chapterEl) {
          // Look for the specific verse
          const verses = chapterEl.querySelectorAll('.verse');
          let targetVerse = null;
          
          for (const verse of verses) {
            const verseNumEl = verse.querySelector('.verse-number');
            if (verseNumEl && parseInt(verseNumEl.textContent) === verseNumber) {
              targetVerse = verse;
              break;
            }
          }
          
          if (targetVerse) {
            targetVerse.scrollIntoView({ 
              behavior: smooth ? 'smooth' : 'instant', 
              block: 'start' 
            });
            } else {
            // Fall back to chapter start if verse not found
            scrollToChapter(bookIndex, chapterIndex, smooth);
          }
        }
      }
      
      // Setup infinite scroll (simplified)
      function setupInfiniteScroll() {
        if (!scrollContainer) return;
        
        // Throttle scroll events
        let scrollTimeout;
        const throttledScroll = () => {
          if (scrollTimeout) return;
          scrollTimeout = setTimeout(() => {
            handleScroll();
            scrollTimeout = null;
          }, 32); // ~30fps for better performance
        };
        
        scrollContainer.addEventListener('scroll', throttledScroll, { passive: true });
      }
      
      // Handle scroll events (simplified)
      function handleScroll() {
        const scrollTop = scrollContainer.scrollTop;
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        
        // Handle header visibility
        handleHeaderScroll(scrollTop);
        
        // Load more chapters when approaching boundaries
        const buffer = clientHeight * 1.5; // 1.5 viewports
        
        // Load previous chapters when near top
        if (scrollTop < buffer) {
          loadAdjacentChapters('previous');
        }
        
        // Load next chapters when near bottom
        if (scrollTop + clientHeight > scrollHeight - buffer) {
          loadAdjacentChapters('next');
        }
        
        // Update current chapter tracking
        updateCurrentChapterFromScroll();
        
        // Cleanup distant chapters less aggressively
        cleanupDistantChapters();
      }
      
      // Load adjacent chapters with throttling to prevent excessive loading
      let lastLoadDirection = null;
      let loadThrottleTimeout = null;
      
      function loadAdjacentChapters(direction) {
        // Throttle loading to prevent excessive requests
        if (loadThrottleTimeout) return;
        
        loadThrottleTimeout = setTimeout(() => {
          loadThrottleTimeout = null;
        }, 100);
        
        if (direction === 'previous') {
          const firstChapter = getFirstLoadedChapter();
          if (firstChapter) {
            console.log('PREPENDING chapters before:', firstChapter);
            // Load chapters in reverse order to maintain proper DOM sequence
            const chaptersToLoad = [];
            for (let i = 1; i <= 3; i++) {
              const prevChapter = getPreviousChapterFrom(firstChapter.bookIndex, firstChapter.chapterIndex, i);
              if (prevChapter) {
                const chapterKey = prevChapter.bookIndex + '-' + prevChapter.chapterIndex;
                if (!loadedChapters.has(chapterKey)) {
                  chaptersToLoad.unshift(prevChapter); // Add to beginning for correct order
                }
              }
            }
            
            // Load chapters in chronological order (earliest first)
            chaptersToLoad.forEach(chapter => {
              console.log('PREPENDING chapter:', chapter.bookIndex + '-' + chapter.chapterIndex);
              loadChapter(chapter.bookIndex, chapter.chapterIndex);
            });
          }
        } else if (direction === 'next') {
          const lastChapter = getLastLoadedChapter();
          if (lastChapter) {
            // Load 3 chapters after the last loaded one
            for (let i = 1; i <= 3; i++) {
              const nextChapter = getNextChapterFrom(lastChapter.bookIndex, lastChapter.chapterIndex, i);
              if (nextChapter) {
                const chapterKey = nextChapter.bookIndex + '-' + nextChapter.chapterIndex;
                if (!loadedChapters.has(chapterKey)) {
                  loadChapter(nextChapter.bookIndex, nextChapter.chapterIndex);
                }
              }
            }
          }
        }
      }
      
      // Helper functions for navigation
      function getFirstLoadedChapter() {
        if (loadedChapters.size === 0) {
          return null;
        }
        
        let lowestPosition = Infinity;
        let firstChapter = null;
        
        // Find the chapter with the lowest position (earliest in the Bible)
        loadedChapters.forEach((element, key) => {
          const [bookIndex, chapterIndex] = key.split('-').map(Number);
          const position = getChapterPosition(bookIndex, chapterIndex);
          
          if (position < lowestPosition) {
            lowestPosition = position;
            firstChapter = { bookIndex, chapterIndex };
          }
        });
        
        return firstChapter;
      }
      
      function getLastLoadedChapter() {
        if (loadedChapters.size === 0) {
          return null;
        }
        
        let highestPosition = -1;
        let lastChapter = null;
        
        // Find the chapter with the highest position (furthest in the Bible)
        loadedChapters.forEach((element, key) => {
          const [bookIndex, chapterIndex] = key.split('-').map(Number);
          const position = getChapterPosition(bookIndex, chapterIndex);
          
          if (position > highestPosition) {
            highestPosition = position;
            lastChapter = { bookIndex, chapterIndex };
          }
        });
        
        return lastChapter;
      }
      
      function getPreviousChapter(bookIndex, chapterIndex) {
        if (chapterIndex > 0) {
          return { bookIndex, chapterIndex: chapterIndex - 1 };
        } else if (bookIndex > 0) {
          const prevBook = bibleBooks[bookIndex - 1];
          return { bookIndex: bookIndex - 1, chapterIndex: prevBook[1].length - 1 };
        }
        return null;
      }
      
      function getNextChapter(bookIndex, chapterIndex) {
        const currentBook = bibleBooks[bookIndex];
        if (chapterIndex < currentBook[1].length - 1) {
          const result = { bookIndex, chapterIndex: chapterIndex + 1 };
          return result;
        } else if (bookIndex < bibleBooks.length - 1) {
          const result = { bookIndex: bookIndex + 1, chapterIndex: 0 };
          return result;
        }
        return null;
      }
      
      // Helper to get N chapters before a given chapter
      function getPreviousChapterFrom(bookIndex, chapterIndex, steps) {
        let currentBook = bookIndex;
        let currentChap = chapterIndex;
        
        for (let i = 0; i < steps; i++) {
          if (currentChap > 0) {
            currentChap--;
          } else if (currentBook > 0) {
            currentBook--;
            currentChap = bibleBooks[currentBook][1].length - 1;
          } else {
            return null; // Beginning of Bible
          }
        }
        
        return { bookIndex: currentBook, chapterIndex: currentChap };
      }
      
      // Helper to get N chapters after a given chapter
      function getNextChapterFrom(bookIndex, chapterIndex, steps) {
        let currentBook = bookIndex;
        let currentChap = chapterIndex;
        
        for (let i = 0; i < steps; i++) {
          const book = bibleBooks[currentBook];
          if (currentChap < book[1].length - 1) {
            currentChap++;
          } else if (currentBook < bibleBooks.length - 1) {
            currentBook++;
            currentChap = 0;
          } else {
            return null; // End of Bible
          }
        }
        
        return { bookIndex: currentBook, chapterIndex: currentChap };
      }
      
      // Track current verse/chapter and always update header
      function updateCurrentChapterFromScroll() {
        const headerHeight = 70;
        
        // Find the first verse that's visible below the header
        const verses = document.querySelectorAll('.verse');
        let foundVerse = null;
        let foundChapter = null;
        
        for (const verse of verses) {
          const rect = verse.getBoundingClientRect();
          
          // Check if verse is in the reading area (below header, above fold)
          if (rect.top >= headerHeight && rect.top < window.innerHeight * 0.3) {
            const verseNumEl = verse.querySelector('.verse-number');
            if (verseNumEl) {
              foundVerse = parseInt(verseNumEl.textContent);
            }
            
            const chapterEl = verse.closest('.chapter-section');
            if (chapterEl) {
              const match = chapterEl.id.match(/book-(\d+)-chapter-(\d+)/);
              if (match) {
                foundChapter = { bookIndex: parseInt(match[1]), chapterIndex: parseInt(match[2]) };
                break;
              }
            }
          }
        }
        
        // Update if we found a chapter
        if (foundChapter) {
          const hasChanged = foundChapter.bookIndex !== currentBookIndex || foundChapter.chapterIndex !== currentChapterIndex;
          
          // Always update current tracking
          currentBookIndex = foundChapter.bookIndex;
          currentChapterIndex = foundChapter.chapterIndex;
          
          // Save position if changed
          if (hasChanged) {
            throttledSavePosition(currentBookIndex, currentChapterIndex, foundVerse);
          }
        }
      }
      
      // Clean up chapters far from current viewport (less aggressive)
      function cleanupDistantChapters() {
        const maxLoadedChapters = 12; // Keep more chapters loaded
        if (loadedChapters.size <= maxLoadedChapters) return;
        
        // Get current scroll position
        const scrollTop = scrollContainer.scrollTop;
        const containerHeight = scrollContainer.clientHeight;
        const viewportCenter = scrollTop + containerHeight / 2;
        
        // Calculate distances from viewport center
        const chapterDistances = [];
        loadedChapters.forEach((element, key) => {
          const rect = element.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          const chapterCenter = rect.top - containerRect.top + scrollTop + rect.height / 2;
          const distance = Math.abs(chapterCenter - viewportCenter);
          
          // Keep chapters within 3 viewports
          const minDistance = containerHeight * 3;
          if (distance > minDistance) {
            chapterDistances.push({ key, distance, element });
          }
        });
        
        // Only remove the most distant chapters
        if (chapterDistances.length > 2) {
          chapterDistances.sort((a, b) => b.distance - a.distance);
          const chaptersToRemove = Math.min(2, chapterDistances.length);
          const toRemove = chapterDistances.slice(0, chaptersToRemove);
          
          toRemove.forEach(({ key, element }) => {
            element.remove();
            loadedChapters.delete(key);
          });
        }
      }
      
      // Navigate to specific chapter (simplified)
      function goToChapter(bookIndex, chapterIndex) {
        // Clear all existing chapters
        const container = document.getElementById('currentChapter');
        container.innerHTML = '';
        loadedChapters.clear();
        
        // Update current position
        currentBookIndex = bookIndex;
        currentChapterIndex = chapterIndex;
        
        // Load chapter range (2 before, target, 3 after)
        loadChapterRange(bookIndex, chapterIndex, 2, 3);
        
        // Scroll to target chapter
        setTimeout(() => {
          scrollToChapter(bookIndex, chapterIndex, false);
        }, 150);
        
        hideBiblePicker();
        
        // Save new position
        saveReadingPosition(currentBookIndex, currentChapterIndex);
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

      // Single header element now opens the book picker directly

      function populateBookList() {
        const pickerBody = document.querySelector('.picker-body');
        pickerBody.innerHTML = '';
        
        bibleBooks.forEach((book, bookIndex) => {
          const [bookName, chapters] = book;
          const bookButton = document.createElement('button');
          bookButton.className = 'book-button';
          if (bookIndex === currentBookIndex) {
            bookButton.className += ' current-book';
            bookButton.style.background = 'rgba(139, 69, 19, 0.1)';
            bookButton.style.color = '#8b4513';
            bookButton.style.fontWeight = '500';
          }
          bookButton.textContent = bookName;
          
          // If book has only 1 chapter, go directly to it
          if (chapters.length === 1) {
            bookButton.onclick = () => goToChapter(bookIndex, 0); // Go to chapter 1 (index 0)
          } else {
            bookButton.onclick = () => selectBook(bookIndex, bookName, chapters);
          }
          
          pickerBody.appendChild(bookButton);
        });
        
        // No auto-scroll for book picker - let user see full list
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
          if (bookIndex === currentBookIndex && chapterIndex === currentChapterIndex) {
            chapterButton.className += ' current-chapter';
            chapterButton.style.background = 'rgba(139, 69, 19, 0.15)';
            chapterButton.style.color = '#8b4513';
            chapterButton.style.fontWeight = '600';
          }
          chapterButton.textContent = chapterIndex + 1;
          chapterButton.onclick = () => goToChapter(bookIndex, chapterIndex);
          chapterGrid.appendChild(chapterButton);
        });
        
        // No auto-scroll for chapter picker - let user see chapter grid
        
        chapterList.appendChild(chapterGrid);
        pickerBody.innerHTML = '';
        pickerBody.appendChild(chapterList);
      }


      // Initialize
      document.addEventListener('DOMContentLoaded', () => {
        initializeChapters();
        
        // Event listeners
        document.getElementById('pickerBackdrop').addEventListener('click', hideBiblePicker);
        document.getElementById('aboutBackdrop').addEventListener('click', hideAboutModal);
        
        // Show header on tap/click (mobile friendly)
        scrollContainer.addEventListener('click', () => {
          if (!isHeaderVisible) {
            showHeader();
          }
        }, { passive: true });
        
        // Show header on touch (mobile)
        scrollContainer.addEventListener('touchstart', () => {
          if (!isHeaderVisible) {
            showHeader();
          }
        }, { passive: true });
        
        // Save position when user leaves the page
        window.addEventListener('beforeunload', () => {
          // Get the current verse in viewport
          const verses = document.querySelectorAll('.verse');
          let currentVerse = null;
          
          for (const verse of verses) {
            const rect = verse.getBoundingClientRect();
            if (rect.top >= 70 && rect.top < window.innerHeight) {
              const verseNumEl = verse.querySelector('.verse-number');
              if (verseNumEl) {
                currentVerse = parseInt(verseNumEl.textContent);
                break;
              }
            }
          }
          
          // Save immediately (not throttled)
          saveReadingPosition(currentBookIndex, currentChapterIndex, currentVerse);
        });
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
        'X-XSS-Protection': '1; mode=block',
        'Cache-Control': 'public, max-age=60, must-revalidate', // 1 minute cache for HTML
        'ETag': `"html-${Date.now()}"`
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
    z-index: 1000;
    background: rgba(247, 243, 233, 0.95);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    transform: translateY(0);
    transition: transform 0.2s ease-out;
    border-bottom: 1px solid rgba(139, 69, 19, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    max-width: 700px;
    margin: 0 auto;
}

.book-chapter {
    display: inline;
    color: #8b4513;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.book-chapter:hover {
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
    color: #6d3a0f;
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
    transition: opacity 0.2s ease;
    min-height: calc(100vh - 70px);
}

.chapter-section.active {
    opacity: 1;
}

.chapter-header {
    margin-bottom: 40px;
    text-align: center;
    position: relative;
    padding: 30px 0;
}

.chapter-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #8b4513, transparent);
    opacity: 0.3;
}

.chapter-header::after {
    content: '';
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #8b4513, transparent);
    opacity: 0.2;
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
    grid-template-columns: repeat(5, 1fr);
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


/* No-JS fallback styles */
.no-js-content {
    padding: 20px;
    max-width: 700px;
    margin: 0 auto;
}

.book-section {
    margin-bottom: 60px;
}

.book-title {
    font-size: 2.5em;
    color: #8b4513;
    text-align: center;
    margin: 40px 0 60px 0;
    font-weight: 300;
    letter-spacing: 1px;
    opacity: 0.9;
}

/* Dark theme */
@media (prefers-color-scheme: dark) {
    body {
        color: #e4e0d6;
        background: #1a1812;
    }

    .app-header {
        background: rgba(26, 24, 18, 0.95);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        border-bottom-color: rgba(164, 137, 87, 0.15);
    }

    .book-chapter {
        color: #d4b896;
    }

    .about-button {
        color: #d4b896;
    }

    .about-button:hover {
        color: #e8d2a6;
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
    
    .modal-body div[style*="border-top"] {
        border-top-color: rgba(164, 137, 87, 0.3) !important;
        color: #d4b896 !important;
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
        text-shadow: 0 1px 2px rgba(212, 184, 150, 0.1);
    }
    
    .chapter-header::before,
    .chapter-header::after {
        background: linear-gradient(90deg, transparent, #d4b896, transparent);
    }
    
    .book-title {
        color: #d4b896;
    }
}

/* Responsive design */
@media (max-width: 480px) {
    .header-content {
        padding: 10px 16px;
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

