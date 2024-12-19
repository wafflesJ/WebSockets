const http = require("http");
const https = require("https"); // Include the https module
const url = require("url");

const server = http.createServer((req, res) => {
  
  const parsedUrl = url.parse(req.url, true);
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
  
  if (req.method === 'GET' && pathParts[0] === 'test' && pathParts[1]) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    // Make the HTTP request
    https.get(pathParts[1], (response) => {
      let data = '';

      // Collect data from the HTTP request
      response.on('data', (chunk) => {
        data += chunk;
      });

      // Once the data is fully received, send it to the client
      response.on('end', () => {
        res.end(data); // Send the HTML content to the client
      });

    }).on('error', (err) => {
      // Handle error if the request fails
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
