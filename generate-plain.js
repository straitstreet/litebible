import bibleData from './src/bible-data.js';

// Generate plain static Bible HTML with minimal CSS and anchor links
function generatePlainBibleHTML() {
  const bibleContent = bibleData.map((book, bookIndex) => {
    const [bookName, chapters] = book;
    const bookId = bookName.toLowerCase().replace(/\s+/g, '-');

    return `<section id="${bookId}">
      ${chapters.map((verses, chapterIndex) => {
      const chapterNum = chapterIndex + 1;
      const chapterId = `${bookId}-${chapterNum}`;

      const versesHTML = verses.map((verse, verseIndex) => {
        const verseNum = verseIndex + 1;
        const verseId = `${chapterId}-${verseNum}`;
        return `<div id="${verseId}"><span class="verse-number">${verseNum}</span> ${verse}</div>`;
      }).join('');

      return `<div id="${chapterId}">
            <h2>
              <a href="#${chapterId}">${bookName} ${chapterNum}</a>
              <a href="#top" class="back-to-top">[Top]</a>
            </h2>
            ${versesHTML}
          </div>`;
    }).join('')}
    </section>`;
  }).join('');

  const bookNav = bibleData.map((book, bookIndex) => {
    const [bookName, chapters] = book;
    const bookId = bookName.toLowerCase().replace(/\s+/g, '-');
    const firstChapterId = `${bookId}-1`;
    return `<a href="#${firstChapterId}">${bookName}</a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lite Bible - Berean Standard Bible (BSB)</title>
    <meta name="description" content="Complete Berean Standard Bible in simple HTML format with anchor links for easy navigation and sharing.">
    <style>
        body {
            font-family: Charter, "Iowan Old Style", "Source Serif Pro", Georgia, serif;
            line-height: 1.7;
            color: #333;
            background: #fff;
            margin: 20px;
            font-size: 17px;
            max-width: 800px;
            margin: 20px auto;
        }
        
        h1 { 
            color: #8b4513; 
            font-weight: 300; 
            text-align: center;
            margin: 20px 0;
        }
        
        h2 { 
            color: #8b4513; 
            font-weight: 300; 
            text-align: center;
            margin: 30px 0 15px 0;
        }
        
        a { 
            color: #8b4513; 
            text-decoration: none; 
        }
        
        a:hover { 
            text-decoration: underline; 
        }
        
        .verse-number { 
            font-size: 0.8em; 
            color: #999; 
            margin-right: 6px; 
            vertical-align: super; 
        }
        
        .back-to-top {
            font-size: 0.7em;
            opacity: 0.7;
            margin-left: 15px;
        }
        
        .nav {
            text-align: center;
            margin: 30px 0;
        }
        
        .nav a {
            margin: 2px 4px;
            padding: 2px 6px;
            border: 1px solid #8b4513;
            border-radius: 3px;
            font-size: 0.85em;
            display: inline-block;
        }
        
        @media (prefers-color-scheme: dark) {
            body { color: #ddd; background: #1a1a1a; }
            h1, h2, a { color: #d4b896; }
            .verse-number { color: #888; }
            .nav a { border-color: #d4b896; }
        }
        
        @media (max-width: 600px) {
            body { margin: 10px; font-size: 15px; }
        }
    </style>
</head>
<body>
    <div id="top">
        <h1>Lite Bible</h1>
        
        <div class="nav">
            ${bookNav}
        </div>
        
        ${bibleContent}
        
        <footer style="text-align: center; margin-top: 60px; padding-top: 20px; border-top: 1px solid #8b4513; opacity: 0.8; font-size: 0.9em;">
            <p><a href="#top">[Top]</a> | <a href="/">Interactive Version</a></p>
            
            <div style="margin-top: 30px; padding: 20px; background: rgba(139, 69, 19, 0.05); border-radius: 8px; text-align: left;">
                <h3 style="color: #8b4513; margin-top: 0; text-align: center;">License</h3>
                <p><strong>The Holy Bible, Berean Standard Bible, BSB</strong> is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain.</p>
                <p style="text-align: center; font-style: italic; margin-bottom: 0;"><em>"Freely you have received; freely give."</em> — Matthew 10:8 BSB</p>
            </div>
        </footer>
    </div>
</body>
</html>`;
}

// Generate and save the file
const html = generatePlainBibleHTML();
import fs from 'fs';
fs.writeFileSync('plain.html', html);
console.log(`Generated plain.html (${Math.round(html.length / 1024)}KB)`);