#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    
    // Special handling for ultra-compact Bible data
    if (req.url === '/BSB.ultra.json') {
        const compressedPath = './BSB.ultra.json.gz';
        if (fs.existsSync(compressedPath)) {
            const acceptEncoding = req.headers['accept-encoding'] || '';
            
            if (acceptEncoding.includes('gzip')) {
                // Serve ultra-compressed version directly
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Content-Encoding': 'gzip',
                    'Cache-Control': 'public, max-age=31536000, immutable'
                });
                fs.createReadStream(compressedPath).pipe(res);
                return;
            }
        }
        
        // Fallback to uncompressed ultra format
        const ultraPath = './BSB.ultra.json';
        if (fs.existsSync(ultraPath)) {
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=31536000, immutable'
            });
            fs.createReadStream(ultraPath).pipe(res);
            return;
        }
    }
    
    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            const acceptEncoding = req.headers['accept-encoding'] || '';
            
            // Compress text files on the fly
            if (acceptEncoding.includes('gzip') && 
                (contentType.includes('text') || contentType.includes('json') || contentType.includes('javascript'))) {
                
                const cacheControl = filePath.includes('index.html') ? 
                    'public, max-age=86400' : 'public, max-age=31536000, immutable';
                
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Content-Encoding': 'gzip',
                    'Cache-Control': cacheControl
                });
                
                zlib.gzip(content, (err, compressed) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Compression error');
                    } else {
                        res.end(compressed);
                    }
                });
            } else {
                const cacheControl = filePath.includes('index.html') ? 
                    'public, max-age=86400' : 'public, max-age=31536000, immutable';
                
                res.writeHead(200, {
                    'Content-Type': contentType,
                    'Cache-Control': cacheControl
                });
                res.end(content);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 litebible server running at http://localhost:${PORT}`);
    console.log(`📖 Ultra-compact BSB: 7.8MB → 1.2MB (85% compression)`);
    console.log(`📱 Total app size: ~1.3MB (HTML + ultra-compressed Bible)`);
    console.log(`💡 Note: Use the server for full functionality. Direct file access has CORS limitations.`);
});