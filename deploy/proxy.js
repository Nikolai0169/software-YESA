const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const publicDir = path.resolve(__dirname, '..', 'frontend', 'build');
const backendHost = process.env.BACKEND_HOST || '127.0.0.1';
const backendPort = Number(process.env.BACKEND_PORT || 5000);
const listenPort = Number(process.env.PUBLIC_PORT || 80);

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function proxyToBackend(request, response) {
  const proxyRequest = http.request({
    hostname: backendHost,
    port: backendPort,
    path: request.url,
    method: request.method,
    headers: { ...request.headers, host: `${backendHost}:${backendPort}` },
  }, (proxyResponse) => {
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    proxyResponse.pipe(response);
  });

  proxyRequest.on('error', (error) => {
    if (!response.headersSent) response.writeHead(502, { 'Content-Type': 'text/plain' });
    response.end(`Backend unavailable: ${error.message}`);
  });

  request.pipe(proxyRequest);
}

function serveFrontend(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const requestedFile = path.resolve(publicDir, `.${requestPath}`);
  const filePath = requestedFile.startsWith(publicDir) ? requestedFile : path.join(publicDir, 'index.html');
  const fallbackPath = path.join(publicDir, 'index.html');

  fs.stat(filePath, (error, stats) => {
    const target = !error && stats.isFile() ? filePath : fallbackPath;
    fs.readFile(target, (readError, data) => {
      if (readError) {
        response.writeHead(503, { 'Content-Type': 'text/plain' });
        response.end('Frontend build not found. Run the publication script first.');
        return;
      }
      const type = contentTypes[path.extname(target).toLowerCase()] || 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': type });
      response.end(data);
    });
  });
}

http.createServer((request, response) => {
  if (request.url.startsWith('/api/') || request.url === '/api') {
    proxyToBackend(request, response);
    return;
  }
  if (request.url.startsWith('/uploads/')) {
    proxyToBackend(request, response);
    return;
  }
  serveFrontend(request, response);
}).listen(listenPort, '0.0.0.0', () => {
  console.log(`YESA public gateway listening on port ${listenPort}`);
  console.log(`Frontend: ${publicDir}`);
  console.log(`Backend: http://${backendHost}:${backendPort}`);
});