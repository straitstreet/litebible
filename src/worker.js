import indexHtml from '../index.html';
import bsbData from '../BSB.ultra.json';

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		
		// Handle root path and index.html requests
		if (url.pathname === '/' || url.pathname === '/index.html') {
			return new Response(indexHtml, {
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
					'Cache-Control': 'public, max-age=300',
				},
			});
		}
		
		// Handle BSB.ultra.json request
		if (url.pathname === '/BSB.ultra.json') {
			return new Response(JSON.stringify(bsbData), {
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=3600',
				},
			});
		}
		
		// Return 404 for all other requests
		return new Response('Not Found', { status: 404 });
	},
};