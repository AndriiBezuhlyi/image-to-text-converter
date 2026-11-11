import { createServer } from 'node:http';

const apiKey = process.env.OCR_API_KEY;

if (!apiKey) throw new Error('OCR_API_KEY is required');

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
  } else if (request.method === 'POST' && request.url === '/api/ocr') {
    const contentType = request.headers['content-type'];
    if (contentType === 'image/png' || contentType === 'image/jpeg') {
      let receivedBytes = 0;
      const maxFileSize = 2000000;
      const chunks = [];

      for await (const chunk of request) {
        receivedBytes += chunk.length;
        if (receivedBytes <= maxFileSize) {
          chunks.push(chunk);
        }
      }
      if (receivedBytes === 0) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Image is required' }));
      } else if (receivedBytes > maxFileSize) {
        response.writeHead(413, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'File exceeds the 2 MB limit' }));
      } else {
        const imageBuffer = Buffer.concat(chunks);
        const imageBlob = new Blob([imageBuffer], { type: contentType });
        const form = new FormData();
        const fileName = contentType === 'image/png' ? 'upload.png' : 'upload.jpg';
        form.append('files', imageBlob, fileName);
        form.append('mode', 'text');
        form.append('language', 'eng');

        try {
          const ocrResponse = await fetch('https://image2textonline.com/v1/ocr', {
            method: 'POST',
            headers: { 'X-API-Key': apiKey },
            body: form,
            signal: AbortSignal.timeout(60000),
          });
          if (!ocrResponse.ok) {
            throw new Error(`OCR provider returned ${ocrResponse.status}`);
          }
          const data = await ocrResponse.json();
          const text = data.files?.[0]?.text;
          if (typeof text !== 'string') {
            throw new Error('Invalid OCR response');
          } else {
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ text }));
          }
        } catch (error) {
          response.writeHead(502, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Text recognition failed. Please try again.' }));
        }
      }
    } else {
      response.writeHead(415, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Unsupported image format' }));
    }
  } else {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'not found' }));
  }
});

server.listen(3000, '127.0.0.1');
