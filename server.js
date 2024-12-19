const http = require("http");

// Create an HTTP server
const server = http.createServer((req, res) => {
  console.log(req.query.link);
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello, Render!\n");
});

// Use the PORT environment variable or default to 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
