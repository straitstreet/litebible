export default `/* Base styling with performance optimizations */
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
    color: #2c2416;
    background: #f7f3e9;
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
    background: rgba(247, 243, 233, 0.98);
    transform: translateY(0);
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
    min-height: calc(100vh - 70px);
    contain: layout;
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
    cursor: pointer;
}

.chapter-title:hover {
    opacity: 1;
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
    background: rgba(44, 36, 22, 0.8);
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
    background: #f7f3e9;
    max-width: 400px;
    width: 85vw;
    max-height: 70vh;
    box-shadow: 0 8px 24px rgba(44, 36, 22, 0.4);
    position: relative;
    z-index: 1001;
    font-family: inherit;
    border-radius: 8px;
    border: 1px solid rgba(139, 69, 19, 0.2);
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
        background: #1a1812;
        border-color: rgba(164, 137, 87, 0.3);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
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
    
    .chapter-title:hover {
        opacity: 1;
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