const http = require('http');
const https = require('https');
const url = require('url');

// Create the proxy server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Extract the target URL from the query parameter
  const targetUrl = parsedUrl.query.target;

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Please provide a target URL using the "target" query parameter.');
    return;
  }

  // Decode the URL before using it
  const decodedTargetUrl = decodeURIComponent(targetUrl);

  // Choose the protocol (http or https) based on the target URL
  const client = decodedTargetUrl.startsWith('https') ? https : http;

  // Setup the request options
  const options = {
    method: req.method,
    headers: req.headers
  };

  // Forward the request to the target server
  const proxyRequest = client.request(decodedTargetUrl, options, (proxyResponse) => {
    let body = '';

    // Collect data from the proxy response
    proxyResponse.on('data', chunk => {
      body += chunk;
    });

    proxyResponse.on('end', () => {
      // If the response is HTML, rewrite URLs
      if (proxyResponse.headers['content-type'] && proxyResponse.headers['content-type'].includes('text/html')) {
        body = body.replace(/href="(http[s]?:\/\/[^"]+)"/g, (match, p1) => {
          return `href="/?target=${encodeURIComponent(p1)}"`;
        });
        body = body.replace(/src="(http[s]?:\/\/[^"]+)"/g, (match, p1) => {
          return `src="/?target=${encodeURIComponent(p1)}"`;
        });

        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        res.end(body);
      } else {
        // Forward non-HTML content directly
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        proxyResponse.pipe(res);
      }
    });
  });

  // Pipe the incoming request data to the target server
  req.pipe(proxyRequest);

  // Handle errors
  proxyRequest.on('error', (err) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Error: ${err.message}`);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
