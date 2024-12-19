const http = require("http");

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/example') {
    res.statusCode = 200;
    res.end(res.end(https.get('https://www.google.ca/?safe=active&ssui=on')));
  } else {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Test\n");
}
  //res.end(https.get('https://link.com'));

});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
