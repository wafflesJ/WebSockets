const http = require('http');
const httpProxy = require('http-proxy');
const url = require('url');

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// HTML start page
const startPage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proxy Server</title>
</head>
<body>
  <h1>Enter URL to Proxy</h1>
  <form method="GET" action="/">
    <input type="text" name="target" placeholder="https://example.com" style="width: 300px;" required>
    <button type="submit">Start Proxy</button>
  </form>
</body>
</html>
`;

// Create a server to handle requests
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // If no target URL is provided, show the start page
  if (!parsedUrl.query.target) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(startPage);
    return;
  }

  // Extract the target from the query parameter
  const target = parsedUrl.query.target;

  console.log(`Proxying request to: ${target}${parsedUrl.path}`);

  // Forward the request to the target
  proxy.web(req, res, { target }, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
