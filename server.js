const http = require("http");

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

  

});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
