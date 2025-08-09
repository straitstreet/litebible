export default `/* Plain Bible CSS - Ultra-minimal and performant */
body {
    font-family: Charter, "Iowan Old Style", "Source Serif Pro", Georgia, serif;
    line-height: 1.45;
    color: #2c2c2c;
    background: #fff;
    margin: 20px auto;
    font-size: 17px;
    max-width: 800px;
}

h1 { 
    color: #6d3a0f; 
    font-weight: 400; 
    text-align: center;
    margin: 20px 0;
}

h2 {
    color: #6d3a0f;
    font-weight: 400;
    font-size: 1.2em;
    text-align: center;
    margin: 20px 0 10px 0;
}

a { 
    color: #6d3a0f; 
    text-decoration: underline; 
}

a:hover { 
    text-decoration: none; 
}

/* Book index grid */
.books-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 8px;
    margin: 20px 0;
}

.book-link {
    display: block;
    text-align: center;
    padding: 8px 6px;
    border: 1px solid #6d3a0f;
    border-radius: 4px;
    color: #6d3a0f;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.9em;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.book-link:hover {
    background: rgba(109, 58, 15, 0.08);
    text-decoration: none;
}

/* Individual book pages */
div:has(.verse-number), div[id*="-"] {
    margin-bottom: 2px;
}

.verse-number { 
    font-size: 0.8em; 
    color: #666; 
    margin-right: 6px; 
    vertical-align: super;
    font-weight: 500;
}

.back-to-top {
    font-size: 0.7em;
    opacity: 0.7;
    margin-left: 15px;
}

.nav {
    text-align: center;
    margin: 15px 0;
    padding: 8px 12px;
    background: rgba(109, 58, 15, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(109, 58, 15, 0.2);
    font-size: 0.9em;
}

/* Removed verse navigation - only chapter navigation supported */

/* Footer styling */
footer {
    text-align: center;
    margin-top: 60px;
    padding-top: 20px;
    border-top: 1px solid #6d3a0f;
    opacity: 0.9;
    font-size: 0.9em;
}

footer a {
    color: #6d3a0f;
    text-decoration: underline;
}

.license-box {
    margin-top: 20px;
    padding: 12px 16px;
    background: rgba(109, 58, 15, 0.1);
    border-radius: 4px;
    text-align: left;
    border: 1px solid rgba(109, 58, 15, 0.2);
    font-size: 0.85em;
}

.license-box h2 {
    color: #6d3a0f;
    margin-top: 0;
    margin-bottom: 8px;
    text-align: center;
    font-size: 1.1em;
    font-weight: 400;
}

.license-box p {
    color: #2c2c2c;
}

.license-box p:last-child {
    text-align: center;
    font-style: italic;
    margin-bottom: 0;
    color: #6d3a0f;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    body { 
        color: #e0e0e0; 
        background: #1a1a1a; 
    }
    
    h1, h2, a, .book-link { 
        color: #f0c674; 
    }
    
    .book-link { 
        border-color: #f0c674; 
    }
    
    .book-link:hover { 
        background: rgba(240, 198, 116, 0.15); 
    }
    
    .verse-number { 
        color: #bbb; 
    }
    
    .nav { 
        background: rgba(240, 198, 116, 0.15); 
        border-color: rgba(240, 198, 116, 0.3); 
    }
    
/* No verse nav in dark mode either */
    
    footer { 
        border-top-color: #f0c674; 
    }
    
    footer a { 
        color: #f0c674; 
    }
    
    .license-box { 
        background: rgba(240, 198, 116, 0.15); 
        border-color: rgba(240, 198, 116, 0.3); 
    }
    
    .license-box h2 { 
        color: #f0c674; 
    }
    
    .license-box p { 
        color: #e0e0e0; 
    }
    
    .license-box p:last-child { 
        color: #f0c674; 
    }
}

/* Responsive */
@media (max-width: 600px) {
    body { 
        margin: 8px; 
        font-size: 15px; 
    }
    
    .books-grid { 
        grid-template-columns: 1fr 1fr; 
        gap: 6px; 
        margin: 15px 0;
    }
    
    .book-link { 
        padding: 6px 4px; 
        font-size: 0.85em;
        min-height: 40px;
    }
    
    .nav {
        margin: 10px 0;
        padding: 6px 10px;
        font-size: 0.85em;
    }
    
    .license-box {
        margin-top: 15px;
        padding: 10px 12px;
        font-size: 0.8em;
    }
    
    .license-box h2 {
        font-size: 1em;
        margin-bottom: 6px;
    }
}`;