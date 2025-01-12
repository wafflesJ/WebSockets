const http = require('http');
const https = require('https');
const express = require('express');
const { URL } = require('url');

const app = express();

// Serve a simple webpage
app.get('/main', (req, res) => {
  res.send(`
  <!DOCTYPE html>
<html>
  <style>
.button {
  border: none;
  background-color: #383838;
  color: white;
  padding: 16px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
  border-radius: 6px;
}
.buttonB {
  border: none;
  background-color: #116df7;
  color: white;
  padding: 8px 24px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
  border-radius: 6px;
}
.buttonB:hover {
  background-color: #074eb8;
}
.forms {
  margin-right: 20px;
}

.formsC {
  display: flex;
  justify-content: center;
  position: absolute;   
  bottom: 10px;    
  left: 50%;    
  transform: translateX(-50%); 
}


.button:hover {
  background-color: #545454;
}
input[type=text] {
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #ccc;
  border-radius: 50px;
  font-size: 16px;
  background-color: white;
  background-image: url('https://www.w3schools.com/css/searchicon.png');
  background-position: 10px 10px; 
  background-repeat: no-repeat;
  padding: 12px 20px 12px 40px;
}
</style>
  <h1 style="text-align: center;font-family: Arial, sans-serif; color:#303030; font-size:50px;">BaconLogic Proxy Server</h1>
    <p style="text-align: center;font-family: Arial, sans-serif; font-size:20px;">Enter a URL to begin</p>
    <form style="margin: 0 auto; text-align: center; "action ="/">
    <input type="text" id="query" name="url" placeholder="Website URL"><br><br>
    <input type="submit" value="Open"class="buttonB">
    </form>
    <div class="formsC">
    <form class="forms"action="https://proxy-server-7lmklzbjz-wafflesjs-projects.vercel.app/main/">
    <input type="submit" value="Server 1"class="button" />
    </form>
    <form class="forms"action="https://websockets-3ihk.onrender.com/main/">
    <input type="submit" value="Server 2"class="button" />
    </form>
    </div>
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
</html>
  `);
});
let targetUrl;
// Middleware to handle proxying requests
app.use('/', async (req, res) => {
  try {
    const targetUrl = req.query.url; // Get the target URL passed in the query string

    if (!targetUrl) {
      res.redirect('/main');
      return;
    }

    const parsedUrl = new URL(targetUrl);

    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        Host: parsedUrl.host,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36', // Mimicking a browser
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': targetUrl, // Sending the original referer
        'Origin': targetUrl,  // Same as above
        'X-Requested-With': 'XMLHttpRequest', // Signifies an AJAX request
      },
      rejectUnauthorized: false,
      followRedirect: true,
    };

    // Choose the protocol (http or https) based on the target URL
    const proxy = parsedUrl.protocol === 'https:' ? https : http;

    const proxyReq = proxy.request(targetUrl, options, (proxyRes) => {
      // Forward the response from the target server to the client
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    // Pipe the request body for non-GET/HEAD methods
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
