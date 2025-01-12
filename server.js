const http = require('http');
const https = require('https');
const express = require('express');
const { URL } = require('url');

const app = express();

// Serve a simple webpage
app.get('/main', (req, res) => {
  res.send(`
    <h1>Welcome to the Proxy Server</h1>
    <p>All your requests will be proxied through this server!</p>
    <form action ="/">
    <label for="query"></label>
    <input type="text" id="query" name="url" placeholder="TYPE HERE!"><hr>
    <input type="submit" value="Search!">
    </form>
    <script>
      // Intercept all fetch requests in the client
      const originalFetch = window.fetch;
      window.fetch = async (input, init) => {
        let url = typeof input === 'string' ? input : input.url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return originalFetch(input, init);
        }\${encodeURIComponent(url)};
        return originalFetch(proxiedUrl, init);
      };

      // Intercept image loading
      document.querySelectorAll('img').forEach(img => {
        const originalSrc = img.src;
        img.src = \${encodeURIComponent(originalSrc)};
      });
      

      async function SENDURL() {
        const inputText = document.getElementById('inputText').value;

      try {
        const response = await fetch('/?url='+inputText, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();
        document.getElementById('responseMessage').textContent = \`Response: \${data.message}\`;
      } catch (error) {
        document.getElementById('responseMessage').textContent = \`Error: \${error.message}\`;
      }
      }
      
    </script>
  `);
});
let targetUrl;
// Middleware to handle proxying requests
app.use('/', async (req, res) => {
  try {
    targetUrl = req.query.url; // Target URL passed as a query parameter

    if (!targetUrl) {
      res.status(400).send('Error: No URL provided. Use ?url= to specify the target URL.');
      return;
    }

    const parsedUrl = new URL(targetUrl);

    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        Host: parsedUrl.host,
      },
      rejectUnauthorized: false,
      followRedirect: true, // Follow redirects
    };
    
    

    const proxy = parsedUrl.protocol === 'https:' ? https : http;

    const proxyReq = proxy.request(parsedUrl, options, (proxyRes) => {
      const contentType = proxyRes.headers['content-type'];
      if (contentType) {
        res.setHeader('Content-Type', contentType); // Forward Content-Type
      }
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    

    proxyReq.on('response', (proxyRes) => {
      const contentType = proxyRes.headers['content-type'];
      if (req.url.endsWith('.css') && contentType !== 'text/css') {
        console.error(`Expected CSS but got ${contentType} for ${targetUrl}`);
      }
    });
    
    

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.pipe(proxyReq, { end: true });
    } else {
      proxyReq.end();
    }
  } catch (err) {
    console.error('Error handling request:', err);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running at http://localhost:${PORT}`);
});
