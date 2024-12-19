const http = require("http");
const https = require("https");
const url = require("url");

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    // Serve the main HTML page
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>URL Viewer</title>
      </head>
      <body>
        <h1>Enter a URL to View</h1>
        <form action="/view" method="GET">
          <input type="text" name="url" placeholder="Enter URL here" required style="width: 300px;">
          <button type="submit">View</button>
        </form>
        <hr>
        <div id="result"></div>
      </body>
      </html>
    `);
  } else if (req.method === 'GET' && req.url.startsWith('/view')) {
    // Parse the query string to get the URL
    const parsedUrl = url.parse(req.url, true);
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
      res.statusCode = 400;
      res.end("Error: No URL provided.");
      return;
    }

    // Fetch and rewrite the content of the target URL
    https.get(targetUrl, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        const baseUrl = new URL(targetUrl);

        // Use regex to rewrite all hrefs
        const rewrittenHtml = data.replace(/<a\s+[^>]*href="([^"]*)"/gi, (match, href) => {
          try {
            // If href is empty or just '/', keep it as a valid link
            if (!href || href === '/') {
              href = baseUrl.href;  // Convert to the base URL
            }
            const resolvedUrl = new URL(href, baseUrl).href; // Resolve the link
            return match.replace(href, `/view?url=${encodeURIComponent(resolvedUrl)}`);
          } catch {
            return match; // Leave invalid or malformed links unchanged
          }
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>URL Viewer</title>
          </head>
          <body>
            <h1>Viewing: ${targetUrl}</h1>
            <a href="/">Back</a>
            <hr>
            ${rewrittenHtml}
          </body>
          </html>
        `);
      });

    }).on('error', (err) => {
      res.statusCode = 500;
      res.end("Error fetching the URL: " + err.message);
    });

  } else {
    res.statusCode = 404;
    res.end("404 Not Found");
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
