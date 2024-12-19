const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/test') {
    res.statusCode = 200;
    res.end(https.get('https://www.york.ac.uk/teaching/cws/wws/webpage1.html'));
  } else {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Main html here\n");
}
  

});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
