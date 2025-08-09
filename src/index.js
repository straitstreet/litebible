import bibleData from './bible-data.js';
import bibleInitialData from './bible-initial.js';
import cssContent from './styles.js';
import scriptContent from './script.js';
import manifestContent from './manifest.js';
import htmlContent from './html.js';
import plainHtml from './plain-html.js';
import plainCssContent from './plain-styles.js';


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
            <h2 class="chapter-title" style="cursor: pointer;" onclick="showBiblePicker()">${bookName} ${chapterNum}</h2>
          </div>
          <div class="chapter-content">
            ${versesHTML}
          </div>
        </div>`;
    }).join('')}
    </div>`;
  }).join('');
}

// Generate plain index page with book links
function generatePlainIndexHTML() {
  const bookLinks = bibleData.map((book, bookIndex) => {
    const [bookName] = book;
    const bookSlug = bookName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `<a href="/plain/${bookSlug}" class="book-link">${bookName}</a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lite Bible</title>
    <meta name="description" content="Choose a book from the Berean Standard Bible to read.">
    <link rel="stylesheet" href="/plain-styles.css">
</head>
<body>
    <h1>Lite Bible</h1>
    
    <div class="books-grid">
        ${bookLinks}
    </div>
    
    <footer>
        <p><a href="/">Interactive Version</a></p>
        
        <div class="license-box">
            <h2>License</h2>
            <p><strong>The Holy Bible, Berean Standard Bible, BSB</strong> is produced in cooperation with Bible Hub, Discovery Bible, OpenBible.com, and the Berean Bible Translation Committee. This text of God's Word has been dedicated to the public domain.</p>
            <p><em>"Freely you have received; freely give."</em> — Matthew 10:8 BSB</p>
        </div>
    </footer>
</body>
</html>`;
}

// Generate individual book page - SIMPLIFIED with external CSS
function generatePlainBookHTML(bookSlug) {
  // Find the book by slug
  const book = bibleData.find(([bookName]) => {
    const slug = bookName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return slug === bookSlug;
  });

  if (!book) return null;

  const [bookName, chapters] = book;
  const bookId = bookName.toLowerCase().replace(/\s+/g, '-');

  // Simple navigation between books
  const currentIndex = bibleData.findIndex(([name]) => 
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') === bookSlug
  );
  
  let prevLink = '';
  let nextLink = '';
  
  if (currentIndex > 0) {
    const prevBook = bibleData[currentIndex - 1];
    const prevSlug = prevBook[0].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    prevLink = `<a href="/plain/${prevSlug}">Previous: ${prevBook[0]}</a>`;
  }
  
  if (currentIndex < bibleData.length - 1) {
    const nextBook = bibleData[currentIndex + 1];
    const nextSlug = nextBook[0].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    nextLink = `<a href="/plain/${nextSlug}">Next: ${nextBook[0]}</a>`;
  }

  // Generate clean chapter content
  const chapterContent = chapters.map((verses, chapterIndex) => {
    const chapterNum = chapterIndex + 1;
    const chapterId = `${bookId}-${chapterNum}`;
    
    const versesHTML = verses.map((verse, verseIndex) => {
      const verseNum = verseIndex + 1;
      const verseId = `${chapterId}-${verseNum}`;
      return `<div id="${verseId}"><span class="verse-number">${verseNum}</span> ${verse}</div>`;
    }).join('');

    return `<section id="${chapterId}">
      <h2><a href="#${chapterId}">${bookName} ${chapterNum}</a></h2>
      ${versesHTML}
    </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${bookName} - Lite Bible</title>
    <meta name="description" content="Read ${bookName} from the Berean Standard Bible.">
    <link rel="stylesheet" href="/plain-styles.css">
</head>
<body>
    <header id="top">
        <h1>${bookName}</h1>
        <nav class="nav">
            ${prevLink ? prevLink + ' | ' : ''}<a href="/plain">All Books</a>${nextLink ? ' | ' + nextLink : ''}
        </nav>
    </header>
    
    <main>
        ${chapterContent}
    </main>
    
    <footer>
        <nav class="nav">
            ${prevLink ? prevLink + ' | ' : ''}<a href="/plain">All Books</a>${nextLink ? ' | ' + nextLink : ''}
        </nav>
        <p><a href="#top">[Top]</a> | <a href="/">Interactive Version</a></p>
    </footer>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/styles.css") {
      return new Response(cssContent, {
        headers: {
          'Content-Type': 'text/css',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Cache-Control': 'public, max-age=300, must-revalidate',
          'ETag': `"styles-${Date.now()}"`
        }
      });
    }

    if (url.pathname === "/plain-styles.css") {
      return new Response(plainCssContent, {
        headers: {
          'Content-Type': 'text/css',
          'Cache-Control': 'public, max-age=2592000', // 30 days cache
          'ETag': `"plain-styles-${Date.now()}"`
        }
      });
    }

    if (url.pathname === "/script.js") {
      // Inject initial Bible data for fast loading and remove template wrapper
      const cleanScript = scriptContent.replace(/^export default `/, '').replace(/`;$/, '');
      const scriptWithData = `window.bibleInitialData = ${JSON.stringify(bibleInitialData)};\n\n${cleanScript}`;
      return new Response(scriptWithData, {
        headers: {
          'Content-Type': 'application/javascript',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Cache-Control': 'public, max-age=300, must-revalidate',
          'ETag': `"script-${Date.now()}"`
        }
      });
    }

    // New endpoint for complete Bible data (for background loading)
    if (url.pathname === "/api/bible-data") {
      return new Response(JSON.stringify(bibleData), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400', // 24 hours cache
          'ETag': `"bible-data-${Date.now()}"`,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (url.pathname === "/manifest.json") {
      return new Response(manifestContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none;",
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Cache-Control': 'public, max-age=86400',
          'ETag': `"manifest-${Date.now()}"`
        }
      });
    }

    if (url.pathname === "/robots.txt") {
      const robotsTxt = `# Allow regular search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

# Block AI crawlers and training bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: FacebookBot
Disallow: /

User-agent: facebookexternalhit
Disallow: /

User-agent: Twitterbot
Disallow: /

User-agent: LinkedInBot
Disallow: /

User-agent: WhatsApp
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: ImagesiftBot
Disallow: /

# Block all others by default
User-agent: *
Disallow: /

Sitemap: ${url.origin}/sitemap.xml`;
      
      return new Response(robotsTxt, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'public, max-age=86400',
        }
      });
    }

    if (url.pathname === "/sitemap.xml") {
      const bookSitemapEntries = bibleData.map(([bookName]) => {
        const bookSlug = bookName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        return `  <url>
    <loc>${url.origin}/plain/${bookSlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }).join('\n');

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${url.origin}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${url.origin}/plain</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
${bookSitemapEntries}
</urlset>`;
      
      return new Response(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=86400',
        }
      });
    }

    // Handle /plain routes
    if (url.pathname === "/plain") {
      // Main plain page with book index
      const plainIndexHtml = generatePlainIndexHTML();
      return new Response(plainIndexHtml, {
        headers: {
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=2592000', // 30 days cache
          'ETag': `"plain-index-static"`
        }
      });
    }

    // Handle individual book pages like /plain/genesis, /plain/matthew
    if (url.pathname.startsWith("/plain/")) {
      const bookSlug = url.pathname.slice(7); // Remove "/plain/"
      const bookHtml = generatePlainBookHTML(bookSlug);
      
      if (bookHtml) {
        return new Response(bookHtml, {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=2592000', // 30 days cache
            'ETag': `"plain-book-${bookSlug}"`
          }
        });
      }
      
      // Book not found, return 404
      return new Response('Book not found', { status: 404 });
    }

    // Serve the main HTML file
    const html = htmlContent.replace(
      '{{NO_JS_CONTENT}}',
      generateCompleteBibleHTML()
    );

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