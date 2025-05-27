const http = require('http');
const https = require('https');
const express = require('express');
const { URL } = require('url');
const bodyParser = require('body-parser');
const cheerio = require('cheerio'); // npm install cheerio

const app = express();
app.use(bodyParser.json());

// Serve a simple webpage
app.get('/', (req, res) => {
  res.send(`
  <html>
  <body>
        
        <div style="display: flex; height: 100%;">
          <div style="width: 60%;">
            <form onsubmit="Run(event,true)">
              <input type="text" id="input">
            </form>
            <iframe id="frame" width="95%" height="90%"></iframe>
          </div>
          <p style="width: 40%; height: 100%; word-wrap: break-word; overflow-wrap: break-word; white-space: normal;overflow-y: auto;" id="text"></p>
        </div>
        <script>
            const frame = document.getElementById("frame");
            const text = document.getElementById("text");
            function Run(event,stop) {
                let url;
                if(stop) {
                  event.preventDefault();
                  url = document.getElementById("input").value;
                } else
                 url = event;
                fetch('/load', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ target: url })
                })
                  .then(response => response.text())
                  .then(html => {
                    // The script to inject, as a string
                    const interceptionScript = \`
                    <script>
                        document.addEventListener('click', function(event) {
                          const anchor = event.target.closest('a');
                          if (anchor) {
                            event.preventDefault();
                            console.log('Intercepted link click:', anchor.href);
                            window.parent.postMessage({ clickedUrl: anchor.href }, '*');
                          }
                        });
                      <\\/script>
                      
                    \`;
                    text.textContent=html;
                    if (html.includes('</body>')) {
                      html = html.replace('<base href="'+url+'></body>', interceptionScript + '</body>');
                    } else {
                      html += interceptionScript;
                    }
                    
                    frame.srcdoc = html;
                  })
                  .catch(err => console.error('Fetch failed:', err));
                  frame.onload = () => {
                  const doc = frame.contentDocument || frame.contentWindow.document;
              
                  
                };
                window.addEventListener('message', event => {
                  // You can check event.origin if you want to restrict source origins
                  if (event.data.clickedUrl) {
                    console.log('Link clicked inside iframe:', event.data.clickedUrl);
                    Run(event.data.clickedUrl,false);
                  }
                });
            }
        </script>
    </body>
</html>
  `);
});
// Middleware to handle proxying requests
app.post('/load', async (req, res) => {
  const targetUrl = req.body.target;
  if (!targetUrl) return res.status(400).send('Missing "target"');

  let parsedUrl;
  try {
    parsedUrl = new URL(targetUrl);
  } catch (e) {
    return res.status(400).send('Invalid URL');
  }

  const proxy = parsedUrl.protocol === 'https:' ? https : http;

  proxy.get(targetUrl, (proxyRes) => {
    let html = '';
    proxyRes.on('data', chunk => html += chunk);
    proxyRes.on('end', () => {
      // Use cheerio to rewrite relative URLs
      const $ = cheerio.load(html);

      $('link[href], script[src], img[src], a[href]').each((_, el) => {
        const attr = el.tagName === 'a' ? 'href' : 'src' in el.attribs ? 'src' : 'href';
        const val = $(el).attr(attr);
        if (val && !val.startsWith('http') && !val.startsWith('//') && !val.startsWith('data:')) {
          const abs = new URL(val, parsedUrl).href;
          $(el).attr(attr, abs);
        }
      });

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send($.html());
    });
  }).on('error', err => {
    console.error(err);
    res.status(500).send('Error fetching page');
  });
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server is running at http://localhost:${PORT}`);
});
