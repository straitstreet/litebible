export default `// Bible data and current chapter tracking
let bibleBooks = window.bibleInitialData || []; // Start with initial data
let fullBibleLoaded = false;
let currentBookIndex = 0; // Start with John (index 0 in initial data - only John exists)
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
      
      return;
    }
    
    // Fetch from API
    const response = await fetch('/api/bible-data');
    const fullData = await response.json();
    
    // Cache the data
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(fullData));
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_VERSION);
    } catch (e) {
      // Cache storage failed (quota exceeded)
    }
    
    bibleBooks = fullData;
    fullBibleLoaded = true;
    
    // Update current book index for full Bible (John is index 42)
    // Check if we were viewing John in the limited initial data
    const wasViewingJohnInLimitedData = currentBookIndex === 0;
    if (wasViewingJohnInLimitedData) {
      currentBookIndex = 42; // John in full Bible
    }
    
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

// Initialize chapters with transparency approach (like goToChapter)
function initializeChapters() {
  scrollContainer = document.getElementById('bibleContainer');
  const container = document.getElementById('currentChapter');
  
  // Clear existing content immediately and forcefully
  container.innerHTML = '';
  loadedChapters.clear();
  
  // Start background loading of full Bible immediately
  loadFullBible();
  
  // Always start with John 1 (no saved position)
  if (fullBibleLoaded) {
    currentBookIndex = 42; // John in full Bible
  } else {
    currentBookIndex = 0; // John in initial data (only John exists)
  }
  currentChapterIndex = 0; // Chapter 1
  
  // STEP 1: Make container invisible during loading to prevent jumps
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.15s ease';
  
  // Load John 1 first (target chapter)
  loadChapter(currentBookIndex, currentChapterIndex);
  
  // STEP 2: Load surrounding chapters while invisible
  setTimeout(() => {
    // Load preceding chapters if available
    for (let i = 1; i <= 2; i++) {
      const prevChapter = getPreviousChapterFrom(currentBookIndex, currentChapterIndex, i);
      if (prevChapter) {
        loadChapter(prevChapter.bookIndex, prevChapter.chapterIndex);
      }
    }
    
    // Load next chapters from initial data or full Bible
    for (let i = 1; i <= 2; i++) {
      const nextChapter = getNextChapterFrom(currentBookIndex, currentChapterIndex, i);
      if (nextChapter) {
        loadChapter(nextChapter.bookIndex, nextChapter.chapterIndex);
      }
    }
    
    // STEP 3: Position to John 1 and reveal
    setTimeout(() => {
      // Scroll to John 1 while still invisible
      scrollToChapter(currentBookIndex, currentChapterIndex, false);
      
      // STEP 4: Reveal the content smoothly
      setTimeout(() => {
        container.style.opacity = '1';
        
        // Setup infinite scroll and handle initial content check
        setupInfiniteScroll();
        handleScroll(); // Initial content loading check
      }, 20); // Small delay to ensure scroll is complete
      
    }, 30); // Allow DOM updates to complete
    
  }, 20); // Small delay for initial chapter to load
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

// Handle scroll events with position-based loading
function handleScroll() {
  const scrollTop = scrollContainer.scrollTop;
  const scrollHeight = scrollContainer.scrollHeight;
  const clientHeight = scrollContainer.clientHeight;
  
  // Handle header visibility
  handleHeaderScroll(scrollTop);
  
  // Calculate scroll position as percentage (0.0 to 1.0)
  const maxScroll = scrollHeight - clientHeight;
  const scrollPercentage = maxScroll > 0 ? scrollTop / maxScroll : 0;
  
  // Position-based loading thresholds
  const topLoadThreshold = 0.2;    // Load more content when within 20% of top
  const bottomLoadThreshold = 0.8; // Load more content when within 20% of bottom
  
  // Detect if we need more content based on scroll position
  const needsContentAbove = scrollPercentage < topLoadThreshold;
  const needsContentBelow = scrollPercentage > bottomLoadThreshold;
  
  // Load content based on position, not flags
  if (needsContentAbove) {
    
    loadAdjacentChapters('previous');
  }
  
  if (needsContentBelow) {
    
    loadAdjacentChapters('next');
  }
  
  // For very limited content, load both directions immediately
  const isLimitedContent = scrollHeight < clientHeight * 1.5;
  if (isLimitedContent) {
    
    loadAdjacentChapters('previous');
    loadAdjacentChapters('next');
  }
  
  // Update current chapter tracking
  updateCurrentChapterFromScroll();
  
  // Cleanup distant chapters less aggressively
  cleanupDistantChapters();
  
  // Update last scroll position
  lastScrollPosition = scrollTop;
}

// Load adjacent chapters with smart throttling
let loadingInProgress = new Set(); // Track which directions are currently loading
let lastLoadTime = { previous: 0, next: 0 }; // Track last load time for each direction

async function loadAdjacentChapters(direction) {
  // Prevent concurrent loading in same direction
  if (loadingInProgress.has(direction)) {
    return;
  }
  
  // Throttle loading but allow more frequent calls (reduced from 100ms to 50ms)
  const now = Date.now();
  const minInterval = 50;
  if (now - lastLoadTime[direction] < minInterval) {
    return;
  }
  
  lastLoadTime[direction] = now;
  loadingInProgress.add(direction);
  
  // If we don't have full Bible loaded yet, wait for it and update current position
  if (!fullBibleLoaded) {
    await loadFullBible();
    // Update current position to full Bible coordinates (John becomes index 42)
    if (fullBibleLoaded && currentBookIndex === 0) {
      currentBookIndex = 42; // John in full Bible
    }
  }
  
  if (direction === 'previous') {
    // Use current chapter as reference, not first loaded chapter
    const targetChapterKey = currentBookIndex + '-' + currentChapterIndex;
    
    // Load more chapters when we have limited data
    const isLimitedData = bibleBooks.length === 1 || !fullBibleLoaded;
    const maxChaptersToLoad = isLimitedData ? 5 : 2; // Load more for limited data
    
    const chaptersToLoad = [];
    
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
      
      // Load chapters in chronological order (earliest first)
      chaptersToLoad.forEach(chapter => {
        loadChapter(chapter.bookIndex, chapter.chapterIndex);
      });
    }
  } else if (direction === 'next') {
    // Use current chapter as reference, similar to previous direction
    const targetChapterKey = currentBookIndex + '-' + currentChapterIndex;
    
    // Load more chapters when we have limited data
    const isLimitedData = bibleBooks.length === 1 || !fullBibleLoaded;
    const maxChaptersToLoad = isLimitedData ? 5 : 2; // Load more for limited data
    
    const chaptersToLoad = [];
    
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
      
      chaptersToLoad.forEach(chapter => {
        loadChapter(chapter.bookIndex, chapter.chapterIndex);
      });
    }
  }
  
  // Always clear the loading flag when done
  loadingInProgress.delete(direction);
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

// Clean up chapters far from current viewport (maintains order)
function cleanupDistantChapters() {
  const maxLoadedChapters = 15; // Keep more chapters loaded for better UX
  if (loadedChapters.size <= maxLoadedChapters) return;
  
  // Get current scroll position and find visible chapters
  const scrollTop = scrollContainer.scrollTop;
  const containerHeight = scrollContainer.clientHeight;
  const viewportTop = scrollTop;
  const viewportBottom = scrollTop + containerHeight;
  
  // Find chapters that are far from viewport
  const chaptersToRemove = [];
  loadedChapters.forEach((element, key) => {
    const rect = element.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const elementTop = rect.top - containerRect.top + scrollTop;
    const elementBottom = elementTop + rect.height;
    
    // Calculate distance from viewport
    let distance = 0;
    if (elementBottom < viewportTop) {
      // Above viewport
      distance = viewportTop - elementBottom;
    } else if (elementTop > viewportBottom) {
      // Below viewport
      distance = elementTop - viewportBottom;
    }
    
    // Remove chapters that are more than 5 viewports away
    const removalDistance = containerHeight * 5;
    if (distance > removalDistance) {
      chaptersToRemove.push({ key, element, distance });
    }
  });
  
  // Sort by distance (farthest first) and remove gradually
  if (chaptersToRemove.length > 0) {
    chaptersToRemove.sort((a, b) => b.distance - a.distance);
    const chaptersToRemoveCount = Math.min(3, chaptersToRemove.length);
    
    for (let i = 0; i < chaptersToRemoveCount; i++) {
      const { key, element } = chaptersToRemove[i];
      element.remove();
      loadedChapters.delete(key);
      
    }
  }
}

// Navigate to specific chapter - smooth loading with transparency
function goToChapter(bookIndex, chapterIndex) {
  // Clear all existing chapters
  const container = document.getElementById('currentChapter');
  container.innerHTML = '';
  loadedChapters.clear();
  
  // Update current position
  currentBookIndex = bookIndex;
  currentChapterIndex = chapterIndex;
  
  // Reset scroll position and clear loading state
  lastScrollPosition = 0;
  loadingInProgress.clear();
  lastLoadTime = { previous: 0, next: 0 };
  
  // STEP 1: Make container invisible during loading to prevent jumps
  
  container.style.opacity = '0';
  container.style.transition = 'opacity 0.15s ease';
  
  // Load the target chapter first
  loadChapter(bookIndex, chapterIndex);
  
  // STEP 2: Load surrounding chapters while invisible
  setTimeout(() => {
    
    // Load previous chapters (will be prepended)
    for (let i = 1; i <= 3; i++) {
      const prevChapter = getPreviousChapterFrom(bookIndex, chapterIndex, i);
      if (prevChapter) {
        loadChapter(prevChapter.bookIndex, prevChapter.chapterIndex);
      }
    }
    
    // Load next chapters (will be appended)
    for (let i = 1; i <= 3; i++) {
      const nextChapter = getNextChapterFrom(bookIndex, chapterIndex, i);
      if (nextChapter) {
        loadChapter(nextChapter.bookIndex, nextChapter.chapterIndex);
      }
    }
    
    // STEP 3: Position to target chapter and reveal
    setTimeout(() => {
      // Scroll to target chapter while still invisible
      scrollToChapter(bookIndex, chapterIndex, false);
      
      // STEP 4: Reveal the content smoothly
      setTimeout(() => {
        container.style.opacity = '1';
        
        // Final content loading check
        handleScroll();
      }, 20); // Small delay to ensure scroll is complete
      
    }, 30); // Allow DOM updates to complete
    
  }, 20); // Small delay for initial chapter to load
  
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

// Settings modal functions
let pendingSettings = null; // Store settings to apply after modal closes

function showSettingsModal() {
  document.body.classList.add('settings-modal-open');
  document.getElementById('settingsModal').style.display = 'flex';
  loadCurrentSettings();
  
  // Store current settings as baseline for changes
  pendingSettings = getSettings();
}

function hideSettingsModal() {
  document.body.classList.remove('settings-modal-open');
  document.getElementById('settingsModal').style.display = 'none';
  
  // Settings are already applied live during selection, no need to reapply
  pendingSettings = null;
}

// Settings persistence
const SETTINGS_KEY = 'litebible-settings';

function loadCurrentSettings() {
  const settings = getSettings();
  
  // Update font selection
  const fontRadio = document.querySelector('input[name="font"][value="' + settings.font + '"]');
  if (fontRadio) fontRadio.checked = true;
}

function getSettings() {
  const defaultSettings = { font: 'system-serif' };
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // Storage failed - continue silently
  }
}

async function applyFont(fontChoice) {
  const root = document.documentElement;
  
  // For custom fonts, wait for them to load before applying
  if (fontChoice !== 'system-serif' && fontChoice !== 'system-sans') {
    try {
      await loadCustomFonts(fontChoice);
    } catch (error) {
      console.error('Failed to load font:', fontChoice, error);
      // Fallback to system font if loading fails
      fontChoice = 'system-serif';
    }
  }
  
  switch (fontChoice) {
    case 'system-serif':
      root.style.setProperty('--reading-font', '"Charter", "Iowan Old Style", "Source Serif Pro", "Crimson Text", "Minion Pro", "Lyon Text", "Sabon", "Palatino", "Hoefler Text", "Baskerville", "Georgia", serif');
      break;
    case 'system-sans':
      root.style.setProperty('--reading-font', '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif');
      break;
    case 'serif':
      root.style.setProperty('--reading-font', '"Crimson Text", "Crimson Pro", serif');
      break;
    case 'sans':
      root.style.setProperty('--reading-font', '"Source Sans Pro", "Source Sans 3", sans-serif');
      break;
    case 'slab':
      root.style.setProperty('--reading-font', '"Zilla Slab", "Roboto Slab", slab-serif');
      break;
    default: // fallback to system-serif
      root.style.setProperty('--reading-font', '"Charter", "Iowan Old Style", "Source Serif Pro", "Crimson Text", "Minion Pro", "Lyon Text", "Sabon", "Palatino", "Hoefler Text", "Baskerville", "Georgia", serif');
  }
}

// Theme color definitions
const THEMES = {
  light: {
    '--bg-color': '#f7f3e9',
    '--text-color': '#2c2416',
    '--header-bg': 'rgba(247, 243, 233, 0.98)',
    '--border-color': 'rgba(139, 69, 19, 0.1)',
    '--accent-color': '#8b4513',
    '--verse-number-color': '#a0522d',
    '--modal-bg': 'rgba(247, 243, 233, 0.98)',
    '--modal-text': '#2c2416',
    '--button-hover': 'rgba(139, 69, 19, 0.1)'
  },
  dark: {
    '--bg-color': '#1a1812',
    '--text-color': '#e4e0d6',
    '--header-bg': 'rgba(26, 24, 18, 0.98)',
    '--border-color': 'rgba(164, 137, 87, 0.15)',
    '--accent-color': '#d4b896',
    '--verse-number-color': '#c9a876',
    '--modal-bg': 'rgba(26, 24, 18, 0.98)',
    '--modal-text': '#e4e0d6',
    '--button-hover': 'rgba(212, 184, 150, 0.1)'
  }
};

// System theme detection
function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeColors(colors) {
  const root = document.documentElement;
  Object.entries(colors).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

function applyTheme(themeChoice) {
  const root = document.documentElement;
  
  // Remove existing theme classes (cleanup)
  root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
  
  let actualTheme;
  
  switch (themeChoice) {
    case 'light':
      actualTheme = 'light';
      root.classList.add('theme-light');
      break;
    case 'dark':
      actualTheme = 'dark';
      root.classList.add('theme-dark');
      break;
    default: // auto
      actualTheme = getSystemTheme();
      root.classList.add('theme-auto');
      
      // Listen for system theme changes when in auto mode
      if (!window.litebibleThemeListener) {
        window.litebibleThemeListener = (e) => {
          const currentSettings = getSettings();
          if (currentSettings.theme === 'auto') {
            applyThemeColors(THEMES[e.matches ? 'dark' : 'light']);
          }
        };
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', window.litebibleThemeListener);
      }
      break;
  }
  
  // Apply the colors directly to CSS custom properties
  applyThemeColors(THEMES[actualTheme]);
}

async function handleSettingsChange() {
  const fontChoice = document.querySelector('input[name="font"]:checked')?.value || 'system-serif';
  
  const settings = { font: fontChoice };
  
  // Save settings
  saveSettings(settings);
  
  // Apply font change immediately for live preview
  await applyFont(fontChoice);
}

// Track font loading status
const fontLoadingStatus = {
  'serif': false,
  'sans': false,
  'slab': false
};

function loadCustomFonts(fontChoice) {
  // System fonts don't need loading
  if (fontChoice === 'system-serif' || fontChoice === 'system-sans') {
    return Promise.resolve();
  }
  
  // Return existing promise if font is already being loaded
  if (window['fontPromise_' + fontChoice]) {
    return window['fontPromise_' + fontChoice];
  }
  
  // Check if font is already loaded
  if (fontLoadingStatus[fontChoice]) {
    return Promise.resolve();
  }
  
  const fontPromise = new Promise((resolve, reject) => {
    // Don't load if already loaded
    if (document.querySelector('#font-' + fontChoice)) {
      fontLoadingStatus[fontChoice] = true;
      resolve();
      return;
    }
    
    const link = document.createElement('link');
    link.id = 'font-' + fontChoice;
    link.rel = 'stylesheet';
    link.media = 'print'; // Load without applying
    
    let fontFamily;
    switch (fontChoice) {
      case 'serif':
        link.href = 'https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap';
        fontFamily = 'Crimson Text';
        break;
      case 'sans':
        link.href = 'https://fonts.googleapis.com/css2?family=Source+Sans+Pro:ital,wght@0,400;0,600;1,400&display=swap';
        fontFamily = 'Source Sans Pro';
        break;
      case 'slab':
        link.href = 'https://fonts.googleapis.com/css2?family=Zilla+Slab:ital,wght@0,400;0,600;1,400&display=swap';
        fontFamily = 'Zilla Slab';
        break;
      default:
        resolve();
        return;
    }
    
    link.onload = () => {
      // Switch to 'all' media to apply the CSS
      link.media = 'all';
      
      // Use Font Loading API to ensure font is actually loaded
      if ('fonts' in document) {
        // Wait for the specific font to be loaded
        Promise.all([
          document.fonts.load('400 16px "' + fontFamily + '"'),
          document.fonts.load('600 16px "' + fontFamily + '"')
        ]).then(() => {
          fontLoadingStatus[fontChoice] = true;
          resolve();
        }).catch(() => {
          // Fallback if Font Loading API fails
          setTimeout(() => {
            fontLoadingStatus[fontChoice] = true;
            resolve();
          }, 100);
        });
      } else {
        // Fallback for browsers without Font Loading API
        setTimeout(() => {
          fontLoadingStatus[fontChoice] = true;
          resolve();
        }, 200);
      }
    };
    
    link.onerror = () => {
      console.warn('Font loading failed, falling back to system font:', fontChoice);
      fontLoadingStatus[fontChoice] = false;
      reject(new Error('Failed to load font: ' + fontChoice));
    };
    
    document.head.appendChild(link);
  });
  
  // Cache the promise
  window['fontPromise_' + fontChoice] = fontPromise;
  return fontPromise;
}

// Make modal functions globally available for inline onclick handlers
window.showSettingsModal = showSettingsModal;
window.hideSettingsModal = hideSettingsModal;

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
async function initialize() {
  // Apply theme immediately for no flash
  applyTheme('auto');
  
  // Apply saved settings BEFORE initializing chapters for fast load
  const settings = getSettings();
  
  // Don't await font loading - let it happen in background for system fonts
  if (settings.font === 'system-serif' || settings.font === 'system-sans') {
    applyFont(settings.font); // System fonts apply instantly
  } else {
    // For Google Fonts, apply after loading to avoid FOIT
    applyFont(settings.font);
  }
  
  initializeChapters();
  
  // Event listeners
  document.getElementById('pickerBackdrop').addEventListener('click', hideBiblePicker);
  document.getElementById('settingsBackdrop').addEventListener('click', hideSettingsModal);
  
  // Settings change listeners
  document.addEventListener('change', (event) => {
    if (event.target.name === 'font') {
      handleSettingsChange();
    }
  });
  
  // Escape key to close modals
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const biblePicker = document.getElementById('biblePicker');
      const settingsModal = document.getElementById('settingsModal');
      
      if (biblePicker.style.display === 'flex') {
        hideBiblePicker();
      } else if (settingsModal.style.display === 'flex') {
        hideSettingsModal();
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