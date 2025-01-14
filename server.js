const http = require('http');
const https = require('https');
const express = require('express');
const { URL } = require('url');
const zlib = require('zlib'); // For handling compressed responses
const iconv = require('iconv-lite'); // For decoding non-UTF-8 content

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
const handleImageRequest = async (imgUrl, res) => {
  const parsedUrl = new URL(imgUrl);

  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    },
    rejectUnauthorized: false,
    followRedirect: true,
  };

  const proxy = parsedUrl.protocol === 'https:' ? https : http;

  proxy.request(imgUrl, options, (proxyRes) => {
    let data = [];
    
    proxyRes.on('data', (chunk) => {
      data.push(chunk);
    });

    proxyRes.on('end', () => {
      // Send the image data to the client
      res.setHeader('Content-Type', proxyRes.headers['content-type']);
      res.setHeader('Cache-Control', 'public, max-age=86400');  // Cache the image for a day
      res.end(Buffer.concat(data));
    });
  }).end();
};

// Middleware for /img path
app.use('/img/', async (req, res) => {
  const imgPath = req.params[0]; // Capture the image path
  const imgUrl = decodeURIComponent(imgPath); // Decode the image URL
  console.log("URL: "+imgUrl);
  // Handle image request
  handleImageRequest(imgUrl, res);
});

//let targetUrl;
// Middleware to handle proxying requests
app.use('/', async (req, res) => {
  try {
    const temp = req.query.url; // Get the target URL passed in the query string

    if (!temp) {
      res.redirect('/main');
      return;
    }
    const targetUrl = req.query.url;
    const parsedUrl = new URL(targetUrl);

    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        Host: parsedUrl.host,
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        Connection: 'keep-alive',
        Referer: targetUrl, // Make it seem like the request originates from the target site
      },
    };


    const proxy = parsedUrl.protocol === 'https:' ? https : http;

    const proxyReq = proxy.request(targetUrl, options, (proxyRes) => {
      const contentType = proxyRes.headers['content-type'] || '';
      const contentEncoding = proxyRes.headers['content-encoding'] || '';
      const isText = contentType.includes('text') || contentType.includes('javascript');
      let body = [];

      proxyRes.on('data', (chunk) => body.push(chunk));
      proxyRes.on('end', () => {
        body = Buffer.concat(body);

        // Decompress if necessary
        if (contentEncoding === 'gzip') {
          body = zlib.gunzipSync(body);
        } else if (contentEncoding === 'deflate') {
          body = zlib.inflateSync(body);
        } else if (contentEncoding === 'br') {
          body = zlib.brotliDecompressSync(body);
        }

        if (isText) {
          // Decode the content using UTF-8 (or fallback to a detected encoding)
          let decodedBody = iconv.decode(body, 'utf-8');

          // Inject a script to modify content
          const injectedScript = `
          <script>
          // Function to update URLs for elements
          function updateUrls() {
            document.querySelectorAll('a').forEach(a => {
              if (a.href && !a.href.startsWith('https://websockets-3ihk.onrender.com/?url=')) {
                a.href = 'https://websockets-3ihk.onrender.com/?url=' + encodeURIComponent(a.href);
              }
            });
            document.querySelectorAll('link').forEach(link => {
              if (link.href && !link.href.startsWith('https://websockets-3ihk.onrender.com/?url=')) {
                link.href = 'https://websockets-3ihk.onrender.com/?url=' + encodeURIComponent(link.href);
              }
            });
            document.querySelectorAll('meta').forEach(meta => {
              if (meta.content && !meta.content.startsWith('https://websockets-3ihk.onrender.com/?url=')) {
                meta.content = 'https://websockets-3ihk.onrender.com/?url=' + encodeURIComponent(meta.content);
              }
            });
        
            document.querySelectorAll('img').forEach(img => {
              if (img.src && !img.src.startsWith('https://websockets-3ihk.onrender.com/?url=')) {
                img.src = 'https://websockets-3ihk.onrender.com/?url=' + encodeURIComponent(img.src);
              }
              if (img.srcset && !img.srcset.startsWith('https://websockets-3ihk.onrender.com/?url=')) {
                img.srcset = 'https://websockets-3ihk.onrender.com/?url=' + encodeURIComponent(img.src);
              }
            });
        
            document.querySelectorAll('iframe').forEach(iframe => {
              if (iframe.src && !iframe.src.startsWith('https://websockets-3ihk.onrender.com/?url=')) {
                iframe.src = 'https://websockets-3ihk.onrender.com/?url=' + encodeURIComponent(iframe.src);
              }
            });
        
            document.querySelectorAll('script[src]').forEach(script => {
              if (script.src && !script.src.startsWith('https://websockets-3ihk.onrender.com/?url=')) {
                script.src = 'https://websockets-3ihk.onrender.com/?url=' + encodeURIComponent(script.src);
              }
            });
          }
        
          // Run once at initial load
          updateUrls();
        
          // Observe DOM changes for dynamically added or modified elements
          const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
              if (mutation.type === 'childList' || mutation.type === 'attributes') {
                updateUrls(); // Re-run the update function
              }
            });
          });
        
          // Observe changes to the entire document body
          observer.observe(document.body, {
            childList: true, // Watch for added/removed nodes
            subtree: true,   // Watch the entire subtree
            attributes: true // Watch for attribute changes
          });
        
          console.log('URLs and resources updated dynamically.');
        </script>
        
          `;
          decodedBody = decodedBody.replace('</body>', `${injectedScript}</body>`);
          res.setHeader('X-Frame-Options', 'ALLOW-FROM *'); // Or specific domain
          res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; style-src 'self' 'unsafe-inline';");

          res.setHeader('Content-Type', contentType);
          res.end(decodedBody);
        } else {
          // Forward binary responses unmodified
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          res.end(body);
        }
      });
    });

    req.pipe(proxyReq, { end: true });
  } catch (err) {
    console.error('Error handling request:', err);
    res.status(500).send('Internal Server Error');
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running at http://localhost:${PORT}`);
});
