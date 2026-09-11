const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { URL } = require('node:url');

const publicPort = Number(process.env.PUBLIC_PORT || 80);
const backendPort = Number(process.env.BACKEND_PORT || 5000);
const frontendDirectory = path.resolve(__dirname, 'frontend', 'build');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

function proxyToBackend(req, res) {
  const backendRequest = http.request({
    hostname: '127.0.0.1',
    port: backendPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: req.headers.host || `127.0.0.1:${backendPort}`,
      'x-forwarded-host': req.headers.host || `127.0.0.1:${publicPort}`,
      'x-forwarded-proto': 'http',
    },
  }, (backendResponse) => {
    res.writeHead(backendResponse.statusCode, backendResponse.headers);
    backendResponse.pipe(res);
  });

  backendRequest.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({ success: false, message: 'Backend no disponible' }));
  });

  req.pipe(backendRequest);
}

function serveFrontend(req, res) {
  const requestPath = new URL(req.url, 'http://localhost').pathname;
  const relativePath = decodeURIComponent(requestPath === '/' ? '/index.html' : requestPath);
  const requestedFile = path.resolve(frontendDirectory, `.${relativePath}`);
  const isInsideBuild = requestedFile === frontendDirectory || requestedFile.startsWith(`${frontendDirectory}${path.sep}`);
  const filePath = isInsideBuild && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()
    ? requestedFile
    : path.join(frontendDirectory, 'index.html');

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Frontend no compilado. Ejecute publish.ps1.');
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': contentTypes[extension] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/') || req.url === '/api') {
    proxyToBackend(req, res);
    return;
  }

  if (req.url.startsWith('/uploads/')) {
    proxyToBackend(req, res);
    return;
  }

  serveFrontend(req, res);
});

server.listen(publicPort, '0.0.0.0', () => {
  console.log(`YESA publico en http://0.0.0.0:${publicPort}`);
  console.log(`API reenviada a http://127.0.0.1:${backendPort}`);
});