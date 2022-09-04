if (!process.env.DETA_RUNTIME && process.env.NODE_ENV !== 'production')
  require('dotenv').config();

const express = require('express');
const {transform} = require('./lib/image');
const {getFile, saveFile, normalizeUrl} = require('./lib/cache');
const cors = require('cors');

const app = express();

const PORT = process.env.PORT || 3003;
const HOST =  process.env.HOST || 'localhost';

const corsOpts = {
  origin: true,
  methods: ['GET', 'OPTIONS']
}

app.get('/api/resize', cors(corsOpts), async (req, res) => {
  try {

    const {query: {url, w, q, h}} = req;

    const key = normalizeUrl(url, {w, q, h});

    const file = await getFile(key);

    if (file) {
      res.writeHead(200, {
       'Content-Type': 'image/webp',
       'Content-Length': file.buff.length,
       'Cache-Control': 'public, s-maxage=3600'
      });
      
      return res.end(file.buff);
    }

    const {buff, type} = await transform(url, {width: parseInt(w), heigth: parseInt(h), quality: parseInt(q)});

    res.writeHead(200, {
     'Content-Type': 'image/webp',
     'Content-Length': buff.length
    });
    
    await saveFile(key, data, type);

    res.end(buff); 
  } catch(err) {
    console.log(err)
    res.status(500).send(err);
  }
})
.all('*', (req, res) => res.sendStatus(404));


if (process.env.DETA_RUNTIME)
  module.exports = app;
else
  app.listen(PORT, HOST, () => console.log(`> app listen on port ${PORT}`));