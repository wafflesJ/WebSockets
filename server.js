const http = require("http");
const https = require("https"); // Include the https module

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/test') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    // Make the HTTP request
    https.get('https://www.york.ac.uk/teaching/cws/wws/webpage1.html', (response) => {
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
