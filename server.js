const http = require('http');
const https = require('https');
const url = require('url');
const request = require('request');  // For forwarding requests easily

// The proxy server logic
const server = http.createServer((req, res) => {
  // Parse the requested URL
  const parsedUrl = url.parse(req.url, true);
  
  // Extract the target URL from the "target" query parameter
  const targetUrl = parsedUrl.query.target;

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Please provide a target URL using the "target" query parameter.');
    return;
  }

  // Handle protocol based on the target URL
  const client = targetUrl.startsWith('https') ? https : http;

  // Options to pass along the headers and the request method
  const options = {
    method: req.method,
    headers: req.headers
  };

  // For HTML content and JavaScript requests, we need to handle URL rewriting
  const proxyRequest = client.request(targetUrl, options, (proxyResponse) => {
    // Rewrite HTML content if the response is text/html
    let body = '';
    
    // Collect the response data for transformation
    proxyResponse.on('data', chunk => {
      body += chunk;
    });

    proxyResponse.on('end', () => {
      if (proxyResponse.headers['content-type'] && proxyResponse.headers['content-type'].includes('text/html')) {
        // Rewrite the links in the HTML content
        body = body.replace(/href="(http[s]?:\/\/[^"]+)"/g, (match, p1) => {
          return `href="/?target=${encodeURIComponent(p1)}"`;
        });
        body = body.replace(/src="(http[s]?:\/\/[^"]+)"/g, (match, p1) => {
          return `src="/?target=${encodeURIComponent(p1)}"`;
        });
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        res.end(body);
      } else {
        // For other content, just forward it
        res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
        proxyResponse.pipe(res);
      }
    });
  });

  // Pipe the incoming request to the target
  req.pipe(proxyRequest);

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
