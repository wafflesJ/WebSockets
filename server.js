const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const app = express();

// Define the target server (replace this with your desired target)
const target = 'https://poki.com'; // Example API, replace with your actual target

// Proxy all requests to the target server
app.use('*', createProxyMiddleware({
  target: target,
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
}));



// Intercept HTML pages and modify links and resources
app.use(async (req, res, next) => {
  if (req.url.endsWith('.html')) {
    // Fetch the page content
    try {
      const pageResponse = await axios.get(target + req.url);
      let pageContent = pageResponse.data;

      // Rewrite links (href, src, etc.) to go through the proxy server
      pageContent = pageContent.replace(/(href|src|action)="(http[^"]+)"/g, (match, attr, url) => {
        // Rewrite the link to go through the proxy
        if (url.startsWith(target)) {
          return `${attr}="/proxy${url.replace(target, '')}"`;
        }
        return match;
      });

      // Send the modified page content as the response
      res.setHeader('Content-Type', 'text/html');
      res.send(pageContent);
    } catch (error) {
      res.status(500).send('Error fetching the page');
    }
  } else {
    next(); // Continue with the normal proxying for other resources
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
