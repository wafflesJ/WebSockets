const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({});

// Start the HTTP server
const server = http.createServer((req, res) => {
  const target = req.headers['x-target-url']; // Expect target URL in custom header

  if (!target) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Missing "X-Target-URL" header.');
    return;
  }

  proxy.web(req, res, { target }, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('An error occurred while proxying the request.');
  });
});

// Listen on a port
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
