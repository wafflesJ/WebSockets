const http = require("http");
const https = require("https");

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/test') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');

    // Make the HTTP request to fetch the page
    https.get('https://www.york.ac.uk/teaching/cws/wws/webpage1.html', (response) => {
      let data = '';

      // Collect data from the HTTP request
      response.on('data', (chunk) => {
        data += chunk;
      });

      // Once the data is fully received, process and send it to the client
      response.on('end', () => {
        // Modify all <a href="..."> URLs
        const modifiedData = data.replace(/<a\s+[^>]*href="([^"]*)"/gi, (match, p1) => {
          // Prepend '/view?url=' to the href value
          const newHref = '/view?url=' + p1;
          // Return the modified <a> tag
          return match.replace(p1, newHref);
        });

        res.end(modifiedData); // Send the modified HTML content to the client
      });

    }).on('error', (err) => {
      // Handle error if the request fails
      res.statusCode = 500;
      res.end('Error: ' + err.message);
    });

  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Main html here\n");
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
