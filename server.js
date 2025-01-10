const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server
const proxy = httpProxy.createProxyServer({
  secure: false, // Set to false to accept self-signed certificates
});

// Target server (HTTPS)
const targetServer = 'https://www.amazon.ca/?&linkCode=ll2&tag=operagx-def-sp-sd-v1-ca-20&linkId=25e6af2499b8f7051f871fcc8d62f959&language=en_CA&ref_=as_li_ss_tl'; // Example HTTPS server

// Create the HTTP server
const server = http.createServer((req, res) => {
  console.log(`Proxying request for: ${req.url}`);

  // Forward the request to the target server
  proxy.web(req, res, { target: targetServer }, (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('An error occurred while proxying the request.');
  });
});

// Start the server on port 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
