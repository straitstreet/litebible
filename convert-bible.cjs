#!/usr/bin/env node

const fs = require('fs');

// Custom compact format:
// - Book names stored once at start
// - Chapters stored as lengths + verses
// - Verses stored as text only (no numbers)
// - Uses minimal separators

function convertToCompact(jsonData) {
    const books = [];
    const bookData = {};
    
    // Extract book names and data
    jsonData.books.forEach(book => {
        books.push(book.name);
        bookData[book.name] = book.chapters.map(chapter => 
            chapter.verses.map(verse => verse.text.trim())
        );
    });
    
    // Create compact string format:
    // BOOKS|book1|book2|book3~CHAPTERS|book1_ch1_v1^book1_ch1_v2^|book1_ch2_v1^|book2_ch1_v1^
    let compact = 'BOOKS';
    books.forEach(book => compact += '|' + book);
    compact += '~CHAPTERS';
    
    books.forEach(bookName => {
        const chapters = bookData[bookName];
        chapters.forEach(verses => {
            compact += '|';
            verses.forEach(verse => {
                compact += verse.replace(/\|/g, '¦').replace(/~/g, '˜').replace(/\^/g, '‸') + '^';
            });
        });
    });
    
    return compact;
}

// More efficient binary-like format using MessagePack-style approach
function convertToBinary(jsonData) {
    const result = {
        v: 1, // version
        b: [], // books
        d: []  // data
    };
    
    jsonData.books.forEach(book => {
        result.b.push(book.name);
        const chapters = [];
        book.chapters.forEach(chapter => {
            chapters.push(chapter.verses.map(v => v.text.trim()));
        });
        result.d.push(chapters);
    });
    
    return JSON.stringify(result);
}

// Even more compact: use positional arrays and abbreviations
function convertToUltraCompact(jsonData) {
    const data = [];
    
    jsonData.books.forEach(book => {
        const chapters = [];
        book.chapters.forEach(chapter => {
            chapters.push(chapter.verses.map(v => v.text.trim()));
        });
        data.push([book.name, chapters]);
    });
    
    return JSON.stringify(data);
}

console.log('📖 Converting BSB.json to compact formats...');

// Read original JSON
const original = JSON.parse(fs.readFileSync('BSB.json', 'utf8'));
const originalSize = fs.statSync('BSB.json').size;

console.log(`Original JSON: ${(originalSize / 1024 / 1024).toFixed(1)}MB`);

// Convert to different formats
const compact = convertToCompact(original);
fs.writeFileSync('BSB.compact', compact);
const compactSize = fs.statSync('BSB.compact').size;
console.log(`Compact format: ${(compactSize / 1024 / 1024).toFixed(1)}MB (${((1 - compactSize/originalSize) * 100).toFixed(1)}% smaller)`);

const binary = convertToBinary(original);
fs.writeFileSync('BSB.bin.json', binary);
const binarySize = fs.statSync('BSB.bin.json').size;
console.log(`Binary format: ${(binarySize / 1024 / 1024).toFixed(1)}MB (${((1 - binarySize/originalSize) * 100).toFixed(1)}% smaller)`);

const ultra = convertToUltraCompact(original);
fs.writeFileSync('BSB.ultra.json', ultra);
const ultraSize = fs.statSync('BSB.ultra.json').size;
console.log(`Ultra compact: ${(ultraSize / 1024 / 1024).toFixed(1)}MB (${((1 - ultraSize/originalSize) * 100).toFixed(1)}% smaller)`);

console.log('\n🗜️  Testing with gzip compression:');

// Test compression on each format
const zlib = require('zlib');

const compactGz = zlib.gzipSync(compact);
console.log(`Compact + gzip: ${(compactGz.length / 1024 / 1024).toFixed(1)}MB`);

const binaryGz = zlib.gzipSync(binary);
console.log(`Binary + gzip: ${(binaryGz.length / 1024 / 1024).toFixed(1)}MB`);

const ultraGz = zlib.gzipSync(ultra);
console.log(`Ultra + gzip: ${(ultraGz.length / 1024 / 1024).toFixed(1)}MB`);

// Save the best compressed version
fs.writeFileSync('BSB.ultra.json.gz', ultraGz);
console.log(`\n✅ Best format: Ultra compact + gzip = ${(ultraGz.length / 1024 / 1024).toFixed(1)}MB`);
console.log(`💾 Saved as BSB.ultra.json.gz`);