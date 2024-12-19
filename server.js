const http = require("http");
const https = require("https");
const url = require("url"); // Import the 'url' module for parsing URLs
const querystring = require("querystring"); // For URL decoding

const server = http.createServer((req, res) => {
  // Parse the request URL
  const parsedUrl = url.parse(req.url, true);
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && pathParts[0] === 'test' && pathParts[1]) {
    // Decode the path variable to get the target URL
    const targetUrl = decodeURIComponent(pathParts[1]);
    
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    // Make the HTTPS request to the decoded URL
    https.get(targetUrl, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        res.end(data); // Send the HTML content to the client
      });
    }).on('error', (err) => {
      res.statusCode = 500;
      res.end('Error: ' + err.message);
    });

  } else {
    // Handle other routes
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Main html here\n");
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
