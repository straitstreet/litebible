export default `// Bible data and current chapter tracking
let bibleBooks = window.bibleInitialData || []; // Start with initial data
let fullBibleLoaded = false;
let currentBookIndex = 1; // Start with John (index 1 in initial data: Luke=0, John=1)
let currentChapterIndex = 0;
let loadedChapters = new Map(); // Map: chapterKey -> DOM element
let scrollContainer = null;
let isLoading = false;

// Header scroll behavior
let lastScrollTop = 0;
let isHeaderVisible = true;
let headerTimeout;

// Background loading and caching
const CACHE_KEY = 'litebible-data';
const CACHE_VERSION_KEY = 'litebible-version';
const CURRENT_VERSION = '1.0';

// Load full Bible data from cache or API
async function loadFullBible() {
  if (fullBibleLoaded) return;
  
  try {
    // Check cache first
    const cachedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);
    
    if (cachedVersion === CURRENT_VERSION && cachedData) {
      // Use cached data
      bibleBooks = JSON.parse(cachedData);
      fullBibleLoaded = true;
      console.log('Loaded full Bible from cache');
      return;
    }
    
    // Fetch from API
    console.log('Loading full Bible in background...');
    const response = await fetch('/api/bible-data');
    const fullData = await response.json();
    
    // Cache the data
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(fullData));
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
    } catch (e) {
      console.log('Cache storage failed (quota exceeded)');
    }
    
    bibleBooks = fullData;
    fullBibleLoaded = true;
    
    // Update current book index for full Bible (John is index 42)
    currentBookIndex = 42;
    
    console.log('Full Bible loaded and cached');
  } catch (error) {
    console.error('Failed to load full Bible:', error);
  }
}

// No reading position storage - always start with John 1

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
  
  // Clear existing content immediately and forcefully
  container.innerHTML = '';
  loadedChapters.clear();
  
  // Force immediate render to prevent flashes
  container.style.display = 'none';
  container.offsetHeight; // Force reflow
  container.style.display = '';
  
  // Start background loading of full Bible immediately
  loadFullBible();
  
  // Always start with John 1 (no saved position)
  if (fullBibleLoaded) {
    currentBookIndex = 42; // John in full Bible
  } else {
    currentBookIndex = 0; // John in initial data (only John now)
  }
  currentChapterIndex = 0; // Chapter 1
  
  // Load ONLY John 1 initially - no surrounding chapters
  loadChapter(currentBookIndex, currentChapterIndex);
  
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
  
  // Add click handler to chapter title
  const chapterTitle = chapterElement.querySelector('.chapter-title');
  chapterTitle.onclick = () => showBiblePicker();
  
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
    const match = existingEl.id.match(/book-(\\d+)-chapter-(\\d+)/);
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

// Scroll to specific chapter, accounting for fixed header
function scrollToChapter(bookIndex, chapterIndex, smooth = false) {
  const chapterEl = document.getElementById('book-' + bookIndex + '-chapter-' + chapterIndex);
  if (chapterEl && scrollContainer) {
    // Get the chapter title (header) position
    const chapterTitle = chapterEl.querySelector('.chapter-title');
    const targetElement = chapterTitle || chapterEl;
    
    // Get element position relative to the scroll container
    const containerRect = scrollContainer.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const scrollOffset = targetRect.top - containerRect.top + scrollContainer.scrollTop;
    
    // Account for fixed header height (70px padding + some buffer)
    const headerOffset = 80;
    const finalScrollTop = Math.max(0, scrollOffset - headerOffset);
    
    if (smooth) {
      scrollContainer.scrollTo({ 
        top: finalScrollTop, 
        behavior: 'smooth' 
      });
    } else {
      scrollContainer.scrollTop = finalScrollTop;
    }
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

// Track scroll direction for proactive loading
let lastScrollPosition = 0;
let hasLoadedPrevious = false;
let hasLoadedNext = false;

// Handle scroll events with proactive loading
function handleScroll() {
  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;
  
  // Detect scroll direction
  const scrollDirection = scrollTop > lastScrollPosition ? 'down' : 'up';
  const scrollDelta = Math.abs(scrollTop - lastScrollPosition);
  
  // Handle header visibility
  handleHeaderScroll(scrollTop);
  
  // Proactive loading on first significant downward scroll (load both directions)
  if (scrollDirection === 'down' && scrollDelta > 30 && (!hasLoadedPrevious || !hasLoadedNext)) {
    console.log('First downward scroll detected - loading surrounding chapters');
    
    if (!hasLoadedPrevious) {
      console.log('Loading previous chapters');
      loadAdjacentChapters('previous');
      hasLoadedPrevious = true;
    }
    
    if (!hasLoadedNext) {
      console.log('Loading next chapters');  
      loadAdjacentChapters('next');
      hasLoadedNext = true;
    }
  }
  
  // Traditional boundary loading as backup
  const buffer = clientHeight * 0.5; // Smaller buffer since we're proactive
  
  // Load previous chapters when near top
  if (scrollTop < buffer && !hasLoadedPrevious) {
    loadAdjacentChapters('previous');
    hasLoadedPrevious = true;
  }
  
  // Load next chapters when near bottom
  if (scrollTop + clientHeight > scrollHeight - buffer && !hasLoadedNext) {
    loadAdjacentChapters('next');
    hasLoadedNext = true;
  }
  
  // Update current chapter tracking
  updateCurrentChapterFromScroll();
  
  // Cleanup distant chapters less aggressively
  cleanupDistantChapters();
  
  // Update last scroll position
  lastScrollPosition = scrollTop;
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
    // Use current chapter as reference, not first loaded chapter
    const targetChapterKey = currentBookIndex + '-' + currentChapterIndex;
    
    // Only load if we don't already have enough chapters before current
    const chaptersToLoad = [];
    const maxChaptersToLoad = 2; // Limit to loading just 2 chapters at a time
    
    for (let i = 1; i <= maxChaptersToLoad; i++) {
      const prevChapter = getPreviousChapterFrom(currentBookIndex, currentChapterIndex, i);
      if (prevChapter) {
        const chapterKey = prevChapter.bookIndex + '-' + prevChapter.chapterIndex;
        if (!loadedChapters.has(chapterKey)) {
          chaptersToLoad.unshift(prevChapter); // Add to beginning for correct order
        }
      } else {
        break; // Stop if we've reached the beginning of the Bible
      }
    }
    
    // Only load if we have chapters to load
    if (chaptersToLoad.length > 0) {
      console.log('PREPENDING chapters before current chapter:', targetChapterKey, chaptersToLoad);
      // Load chapters in chronological order (earliest first)
      chaptersToLoad.forEach(chapter => {
        loadChapter(chapter.bookIndex, chapter.chapterIndex);
      });
    }
  } else if (direction === 'next') {
    // Use current chapter as reference, similar to previous direction
    const targetChapterKey = currentBookIndex + '-' + currentChapterIndex;
    
    // Only load if we don't already have enough chapters after current
    const chaptersToLoad = [];
    const maxChaptersToLoad = 2; // Limit to loading just 2 chapters at a time
    
    for (let i = 1; i <= maxChaptersToLoad; i++) {
      const nextChapter = getNextChapterFrom(currentBookIndex, currentChapterIndex, i);
      if (nextChapter) {
        const chapterKey = nextChapter.bookIndex + '-' + nextChapter.chapterIndex;
        if (!loadedChapters.has(chapterKey)) {
          chaptersToLoad.push(nextChapter);
        }
      } else {
        break; // Stop if we've reached the end of the Bible
      }
    }
    
    // Only load if we have chapters to load
    if (chaptersToLoad.length > 0) {
      console.log('APPENDING chapters after current chapter:', targetChapterKey, chaptersToLoad);
      chaptersToLoad.forEach(chapter => {
        loadChapter(chapter.bookIndex, chapter.chapterIndex);
      });
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
        const match = chapterEl.id.match(/book-(\\d+)-chapter-(\\d+)/);
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
    
    // Position tracking only (no saving)
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

// Navigate to specific chapter - load only the target chapter
function goToChapter(bookIndex, chapterIndex) {
  // Clear all existing chapters
  const container = document.getElementById('currentChapter');
  container.innerHTML = '';
  loadedChapters.clear();
  
  // Force immediate render to prevent flashes
  container.style.display = 'none';
  container.offsetHeight; // Force reflow
  container.style.display = '';
  
  // Update current position
  currentBookIndex = bookIndex;
  currentChapterIndex = chapterIndex;
  
  // Load ONLY the target chapter - no surrounding chapters
  loadChapter(bookIndex, chapterIndex);
  
  // Reset proactive loading flags for new chapter
  hasLoadedPrevious = false;
  hasLoadedNext = false;
  lastScrollPosition = 0;
  
  hideBiblePicker();
}



// Bible picker functions
function showBiblePicker() {
  document.getElementById('biblePicker').style.display = 'flex';
  populateBookList();
}

// Make showBiblePicker globally available for inline onclick handlers
window.showBiblePicker = showBiblePicker;

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

// Make modal functions globally available for inline onclick handlers
window.showAboutModal = showAboutModal;
window.hideAboutModal = hideAboutModal;

// Single header element now opens the book picker directly

function populateBookList() {
  const pickerBody = document.querySelector('.picker-body');
  pickerBody.innerHTML = '';
  
  let currentBookButton = null;
  
  bibleBooks.forEach((book, bookIndex) => {
    const [bookName, chapters] = book;
    const bookButton = document.createElement('button');
    bookButton.className = 'book-button';
    if (bookIndex === currentBookIndex) {
      bookButton.className += ' current-book';
      bookButton.style.background = 'rgba(139, 69, 19, 0.1)';
      bookButton.style.color = '#8b4513';
      bookButton.style.fontWeight = '500';
      currentBookButton = bookButton;
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
  
  // Scroll to current book immediately, no animation
  if (currentBookButton) {
    currentBookButton.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
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
  
  let currentChapterButton = null;
  
  chapters.forEach((chapter, chapterIndex) => {
    const chapterButton = document.createElement('button');
    chapterButton.className = 'chapter-number-button';
    if (bookIndex === currentBookIndex && chapterIndex === currentChapterIndex) {
      chapterButton.className += ' current-chapter';
      chapterButton.style.background = 'rgba(139, 69, 19, 0.15)';
      chapterButton.style.color = '#8b4513';
      chapterButton.style.fontWeight = '600';
      currentChapterButton = chapterButton;
    }
    chapterButton.textContent = chapterIndex + 1;
    chapterButton.onclick = () => goToChapter(bookIndex, chapterIndex);
    chapterGrid.appendChild(chapterButton);
  });
  
  // Scroll to current chapter immediately, no animation
  if (currentChapterButton) {
    currentChapterButton.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
  
  chapterList.appendChild(chapterGrid);
  pickerBody.innerHTML = '';
  pickerBody.appendChild(chapterList);
}



// Initialize - handle both DOM ready and already loaded states
function initialize() {
  initializeChapters();
  
  // Event listeners
  document.getElementById('pickerBackdrop').addEventListener('click', hideBiblePicker);
  document.getElementById('aboutBackdrop').addEventListener('click', hideAboutModal);
  
  // Escape key to close modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const biblePicker = document.getElementById('biblePicker');
      const aboutModal = document.getElementById('aboutModal');
      
      if (biblePicker.style.display === 'flex') {
        hideBiblePicker();
      } else if (aboutModal.style.display === 'flex') {
        hideAboutModal();
      }
    }
  });
  
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
  
  // No position saving on page unload
}

// Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  // DOM is already ready
  initialize();
}`;