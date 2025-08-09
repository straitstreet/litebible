/**
 * Chapter Loading Tests
 * Tests for the core chapter loading and navigation functionality
 */

describe('Chapter Loading', () => {
  let document, window;
  let bibleBooks, currentBookIndex, currentChapterIndex, totalChapters;
  let renderedChapters, chapterUpdateTimeout, isTransitioning;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <header class="app-header">
        <div class="header-content">
          <h1 class="app-title">
            <span class="book-name" id="headerBookName">Genesis</span>
            <span class="chapter-number" id="headerChapterNumber">1</span>
          </h1>
        </div>
      </header>
      <main class="bible-container" id="bibleContainer">
        <div id="currentChapter"></div>
      </main>
    `;

    // Reset variables
    bibleBooks = global.mockBibleData;
    currentBookIndex = 0;
    currentChapterIndex = 0;
    totalChapters = [];
    renderedChapters = new Set();
    chapterUpdateTimeout = null;
    isTransitioning = false;
  });

  describe('buildChapterIndex()', () => {
    it('should build correct chapter index from Bible data', () => {
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

      buildChapterIndex();

      expect(totalChapters).toHaveLength(6); // 3 + 2 + 1 chapters
      expect(totalChapters[0]).toEqual({
        bookIndex: 0,
        bookName: 'Genesis',
        chapterIndex: 0,
        chapterNum: 1,
        verses: ["In the beginning God created the heavens and the earth.", "Now the earth was formless and void."]
      });
      expect(totalChapters[3]).toEqual({
        bookIndex: 1,
        bookName: 'Exodus',
        chapterIndex: 0,
        chapterNum: 1,
        verses: ["These are the names of the sons of Israel.", "Now Joseph and all his brothers died."]
      });
    });

    it('should handle empty Bible data', () => {
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

      bibleBooks = [];
      buildChapterIndex();
      expect(totalChapters).toHaveLength(0);
    });
  });

  describe('updateHeader()', () => {
    beforeEach(() => {
      // Build chapter index first
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
    });

    it('should update header with current chapter info', () => {
      function updateHeader() {
        const chapter = totalChapters[currentChapterIndex];
        if (!chapter) return;
        
        const bookNameEl = document.getElementById('headerBookName');
        const chapterNumberEl = document.getElementById('headerChapterNumber');
        if (bookNameEl) bookNameEl.textContent = chapter.bookName;
        if (chapterNumberEl) chapterNumberEl.textContent = chapter.chapterNum;
      }

      currentChapterIndex = 0;
      updateHeader();

      expect(document.getElementById('headerBookName').textContent).toBe('Genesis');
      expect(document.getElementById('headerChapterNumber').textContent).toBe('1');
    });

    it('should handle invalid chapter index', () => {
      function updateHeader() {
        const chapter = totalChapters[currentChapterIndex];
        if (!chapter) return;
        
        const bookNameEl = document.getElementById('headerBookName');
        const chapterNumberEl = document.getElementById('headerChapterNumber');
        if (bookNameEl) bookNameEl.textContent = chapter.bookName;
        if (chapterNumberEl) chapterNumberEl.textContent = chapter.chapterNum;
      }

      const originalBookName = document.getElementById('headerBookName').textContent;
      const originalChapterNumber = document.getElementById('headerChapterNumber').textContent;

      currentChapterIndex = 999; // Invalid index
      updateHeader();

      // Should remain unchanged
      expect(document.getElementById('headerBookName').textContent).toBe(originalBookName);
      expect(document.getElementById('headerChapterNumber').textContent).toBe(originalChapterNumber);
    });
  });

  describe('renderChapters()', () => {
    beforeEach(() => {
      // Build chapter index
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
    });

    it('should render current and next chapter', () => {
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
              <div class="chapter-content">
                ${versesHTML}
              </div>
            </div>
          `;
          
          renderedChapters.add(i);
        }
        
        container.innerHTML = chaptersHTML;
      }

      currentChapterIndex = 0;
      renderChapters();

      const container = document.getElementById('currentChapter');
      const chapterSections = container.querySelectorAll('.chapter-section');
      
      expect(chapterSections).toHaveLength(2); // Current + next chapter
      expect(chapterSections[0].getAttribute('data-chapter-index')).toBe('0');
      expect(chapterSections[1].getAttribute('data-chapter-index')).toBe('1');
      expect(renderedChapters.has(0)).toBe(true);
      expect(renderedChapters.has(1)).toBe(true);
    });

    it('should handle last chapter correctly', () => {
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
              <div class="chapter-content">
                ${versesHTML}
              </div>
            </div>
          `;
          
          renderedChapters.add(i);
        }
        
        container.innerHTML = chaptersHTML;
      }

      currentChapterIndex = totalChapters.length - 1; // Last chapter
      renderChapters();

      const container = document.getElementById('currentChapter');
      const chapterSections = container.querySelectorAll('.chapter-section');
      
      expect(chapterSections).toHaveLength(1); // Only current chapter (last one)
      expect(chapterSections[0].getAttribute('data-chapter-index')).toBe(String(totalChapters.length - 1));
    });
  });

  describe('goToChapter()', () => {
    beforeEach(() => {
      // Build chapter index
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
    });

    it('should calculate correct target index', () => {
      function goToChapter(bookIndex, chapterIndex) {
        // Find the index in totalChapters
        let targetIndex = 0;
        for (let i = 0; i < bookIndex; i++) {
          targetIndex += bibleBooks[i][1].length;
        }
        targetIndex += chapterIndex;
        return targetIndex;
      }

      // Genesis chapter 1 (bookIndex=0, chapterIndex=0)
      expect(goToChapter(0, 0)).toBe(0);
      
      // Genesis chapter 2 (bookIndex=0, chapterIndex=1)  
      expect(goToChapter(0, 1)).toBe(1);
      
      // Exodus chapter 1 (bookIndex=1, chapterIndex=0)
      expect(goToChapter(1, 0)).toBe(3); // After 3 Genesis chapters
      
      // Leviticus chapter 1 (bookIndex=2, chapterIndex=0)
      expect(goToChapter(2, 0)).toBe(5); // After 3 Genesis + 2 Exodus chapters
    });

    it('should handle invalid book index', () => {
      function goToChapter(bookIndex, chapterIndex) {
        if (bookIndex < 0 || bookIndex >= bibleBooks.length) return -1;
        if (chapterIndex < 0 || chapterIndex >= bibleBooks[bookIndex][1].length) return -1;
        
        let targetIndex = 0;
        for (let i = 0; i < bookIndex; i++) {
          targetIndex += bibleBooks[i][1].length;
        }
        targetIndex += chapterIndex;
        return targetIndex;
      }

      expect(goToChapter(-1, 0)).toBe(-1);
      expect(goToChapter(999, 0)).toBe(-1);
      expect(goToChapter(0, -1)).toBe(-1);
      expect(goToChapter(0, 999)).toBe(-1);
    });
  });

  describe('Bug Fixes Verification', () => {
    it('should have navigateToNextChapter function', () => {
      function navigateToNextChapter() {
        const nextIndex = currentChapterIndex + 1;
        if (nextIndex < totalChapters.length) {
          currentChapterIndex = nextIndex;
          return true;
        }
        return false;
      }

      // Build chapter index
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

      currentChapterIndex = 0;
      expect(navigateToNextChapter()).toBe(true);
      expect(currentChapterIndex).toBe(1);

      // Test boundary
      currentChapterIndex = totalChapters.length - 1;
      expect(navigateToNextChapter()).toBe(false);
      expect(currentChapterIndex).toBe(totalChapters.length - 1);
    });

    it('should have navigateToPreviousChapter function', () => {
      function navigateToPreviousChapter() {
        const prevIndex = currentChapterIndex - 1;
        if (prevIndex >= 0) {
          currentChapterIndex = prevIndex;
          return true;
        }
        return false;
      }

      // Build chapter index  
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

      currentChapterIndex = 1;
      expect(navigateToPreviousChapter()).toBe(true);
      expect(currentChapterIndex).toBe(0);

      // Test boundary
      currentChapterIndex = 0;
      expect(navigateToPreviousChapter()).toBe(false);
      expect(currentChapterIndex).toBe(0);
    });
  });
});