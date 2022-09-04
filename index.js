if (!process.env.DETA_RUNTIME && process.env.NODE_ENV !== 'production')
  require('dotenv').config();

const express = require('express');
const {transform} = require('./lib/image');
const {getFile, saveFile, normalizeUrl} = require('./lib/cache');
const cors = require('cors');
const {createWriteStream} = require('fs');
const {join} = require('path');


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

    const hasFile = await getFile(key);

    if (hasFile) {
      return res.sendFile('/temp/test.webp');
    }
    
    const str = createWriteStream('/temp/test.webp');
    const {pipe, type} = await transform(url, {width: parseInt(w), heigth: parseInt(h), quality: parseInt(q)});

    pipe.pipe(str);

    let d = []
    pipe.on('data', async chunk => {
      d.push(chunk);
    });
    str.on('end', async () => {
      await saveFile(key, Buffer.concat(d), type);

      res.sendFile('/temp/test.webp');
    });
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