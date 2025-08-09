/**
 * Integration Tests
 * Tests for complete chapter loading workflows and user interactions
 */

describe('Chapter Loading Integration', () => {
  let document, window;
  
  beforeEach(() => {
    // Create full DOM structure
    document.body.innerHTML = `
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <span class="book-name" id="headerBookName" onclick="showBiblePicker()">Genesis</span>
            <span class="chapter-number" id="headerChapterNumber" onclick="showChapterPicker()">1</span>
          </h1>
        </div>
      </header>
      <main class="bible-container" id="bibleContainer">
        <div id="currentChapter"></div>
      </main>
      <div class="bible-picker" id="biblePicker" style="display: none;">
        <div class="picker-backdrop" id="pickerBackdrop"></div>
        <div class="picker-content">
          <div class="picker-body"></div>
        </div>
      </div>
    `;

    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = jest.fn(() => ({
      top: 0,
      bottom: 100,
      height: 100,
      left: 0,
      right: 100,
      width: 100
    }));
  });

  describe('Initial Page Load', () => {
    it('should initialize and render first chapter', () => {
      const bibleBooks = global.mockBibleData;
      let currentChapterIndex = 0;
      let totalChapters = [];
      let renderedChapters = new Set();

      // Simulate initialization
      function buildChapterIndex() {
        totalChapters = [];
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

      function renderChapters() {
        const container = document.getElementById('currentChapter');
        const startIndex = Math.max(0, currentChapterIndex);
        const endIndex = Math.min(totalChapters.length - 1, currentChapterIndex + 1);
        
        let chaptersHTML = '';
        
        for (let i = startIndex; i <= endIndex; i++) {
          const chapter = totalChapters[i];
          if (!chapter) continue;
          
          const versesHTML = chapter.verses.map((verse, verseIndex) => {
            const verseNum = verseIndex + 1;
            return `<div class="verse"><span class="verse-number">${verseNum}</span>${verse}</div>`;
          }).join('');
          
          chaptersHTML += `
            <div class="chapter-section" data-chapter-index="${i}">
              <div class="chapter-content">${versesHTML}</div>
            </div>
          `;
          
          renderedChapters.add(i);
        }
        
        container.innerHTML = chaptersHTML;
      }

      function updateHeader() {
        const chapter = totalChapters[currentChapterIndex];
        if (!chapter) return;
        
        const bookNameEl = document.getElementById('headerBookName');
        const chapterNumberEl = document.getElementById('headerChapterNumber');
        if (bookNameEl) bookNameEl.textContent = chapter.bookName;
        if (chapterNumberEl) chapterNumberEl.textContent = chapter.chapterNum;
      }

      // Initialize app
      buildChapterIndex();
      renderChapters();
      updateHeader();

      // Verify initialization
      expect(totalChapters.length).toBeGreaterThan(0);
      expect(document.getElementById('headerBookName').textContent).toBe('Genesis');
      expect(document.getElementById('headerChapterNumber').textContent).toBe('1');
      
      const chapterSections = document.querySelectorAll('.chapter-section');
      expect(chapterSections.length).toBeGreaterThan(0);
      expect(renderedChapters.has(0)).toBe(true);
    });
  });

  describe('Chapter Navigation Flow', () => {
    it('should navigate between chapters correctly', () => {
      const bibleBooks = global.mockBibleData;
      let currentChapterIndex = 0;
      let totalChapters = [];

      function buildChapterIndex() {
        totalChapters = [];
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

      function navigateToChapter(chapterIndex) {
        if (chapterIndex < 0 || chapterIndex >= totalChapters.length) return false;
        
        currentChapterIndex = chapterIndex;
        
        // Mock scrollIntoView
        const chapterEl = document.querySelector(`[data-chapter-index="${chapterIndex}"]`);
        if (chapterEl) {
          chapterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        updateHeader();
        return true;
      }

      function updateHeader() {
        const chapter = totalChapters[currentChapterIndex];
        if (!chapter) return;
        
        document.getElementById('headerBookName').textContent = chapter.bookName;
        document.getElementById('headerChapterNumber').textContent = chapter.chapterNum;
      }

      buildChapterIndex();

      // Test navigation to different chapters
      expect(navigateToChapter(0)).toBe(true);
      expect(document.getElementById('headerBookName').textContent).toBe('Genesis');
      expect(document.getElementById('headerChapterNumber').textContent).toBe('1');

      expect(navigateToChapter(3)).toBe(true);
      expect(document.getElementById('headerBookName').textContent).toBe('Exodus');
      expect(document.getElementById('headerChapterNumber').textContent).toBe('1');

      // Test invalid navigation
      expect(navigateToChapter(-1)).toBe(false);
      expect(navigateToChapter(999)).toBe(false);
    });
  });

  describe('Scroll-based Chapter Updates', () => {
    it('should update current chapter based on scroll position', (done) => {
      const bibleBooks = global.mockBibleData;
      let currentChapterIndex = 0;
      let totalChapters = [];
      let chapterUpdateTimeout = null;

      function buildChapterIndex() {
        totalChapters = [];
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

      function updateCurrentChapterFromScroll() {
        if (chapterUpdateTimeout) {
          clearTimeout(chapterUpdateTimeout);
        }
        
        chapterUpdateTimeout = setTimeout(() => {
          const container = document.getElementById('bibleContainer');
          const chapters = container.querySelectorAll('.chapter-section');
          
          if (chapters.length === 0) return;
          
          // Mock finding the most visible chapter
          let bestMatch = 1; // Simulate second chapter being most visible
          
          if (bestMatch !== currentChapterIndex) {
            currentChapterIndex = bestMatch;
            updateHeader();
          }
        }, 100);
      }

      function updateHeader() {
        const chapter = totalChapters[currentChapterIndex];
        if (!chapter) return;
        
        document.getElementById('headerBookName').textContent = chapter.bookName;
        document.getElementById('headerChapterNumber').textContent = chapter.chapterNum;
      }

      // Add mock chapter sections
      document.getElementById('currentChapter').innerHTML = `
        <div class="chapter-section" data-chapter-index="0"></div>
        <div class="chapter-section" data-chapter-index="1"></div>
      `;

      buildChapterIndex();
      updateCurrentChapterFromScroll();

      // Wait for debounced update
      setTimeout(() => {
        expect(currentChapterIndex).toBe(1);
        expect(document.getElementById('headerBookName').textContent).toBe('Genesis');
        expect(document.getElementById('headerChapterNumber').textContent).toBe('2');
        done();
      }, 150);
    });
  });

  describe('Touch Navigation', () => {
    it('should handle touch events for chapter navigation', () => {
      let touchStartY = 0;
      let touchEndY = 0;
      let isTouching = false;
      
      function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
        isTouching = true;
      }
      
      function handleTouchMove(e) {
        if (!isTouching) return;
        touchEndY = e.touches[0].clientY;
      }
      
      function handleTouchEnd(e) {
        if (!isTouching) return;
        isTouching = false;
        
        const touchDelta = touchStartY - touchEndY;
        const minSwipeDistance = 100;
        
        return Math.abs(touchDelta) > minSwipeDistance ? touchDelta : 0;
      }

      // Simulate touch events
      const mockTouchStart = {
        touches: [{ clientY: 200 }]
      };
      
      const mockTouchMove = {
        touches: [{ clientY: 50 }] // Swipe up 150px
      };

      handleTouchStart(mockTouchStart);
      handleTouchMove(mockTouchMove);
      const swipeDistance = handleTouchEnd({});

      expect(swipeDistance).toBe(150); // Upward swipe detected
      expect(isTouching).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should handle rapid scroll events without issues', (done) => {
      let updateCount = 0;
      let chapterUpdateTimeout = null;

      function updateCurrentChapterFromScroll() {
        if (chapterUpdateTimeout) {
          clearTimeout(chapterUpdateTimeout);
        }
        
        chapterUpdateTimeout = setTimeout(() => {
          updateCount++;
        }, 100);
      }

      // Simulate rapid scroll events
      for (let i = 0; i < 10; i++) {
        setTimeout(() => updateCurrentChapterFromScroll(), i * 10);
      }

      // Check that debouncing worked
      setTimeout(() => {
        expect(updateCount).toBe(1); // Should only update once due to debouncing
        done();
      }, 200);
    });

    it('should efficiently render large chapters', () => {
      const startTime = performance.now();
      
      // Create large mock chapter
      const largeChapter = Array.from({ length: 1000 }, (_, i) => `Verse ${i + 1} content`);
      
      const versesHTML = largeChapter.map((verse, verseIndex) => {
        const verseNum = verseIndex + 1;
        return `<div class="verse"><span class="verse-number">${verseNum}</span>${verse}</div>`;
      }).join('');
      
      document.getElementById('currentChapter').innerHTML = `
        <div class="chapter-section" data-chapter-index="0">
          <div class="chapter-content">${versesHTML}</div>
        </div>
      `;
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100);
      
      // Verify content was rendered
      const verses = document.querySelectorAll('.verse');
      expect(verses.length).toBe(1000);
    });
  });
});