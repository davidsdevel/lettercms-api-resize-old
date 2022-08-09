if (process.env.NODE_ENV !== 'production')
  require('dotenv').config();

const express = require('express');
const path = require('path');
const fetch = require('isomorphic-unfetch')
const sharp = require('sharp')
const {scryptSync, timingSafeEqual} = require('crypto');
const cors = require('cors');

const app = express();

const compare = (secret, key) => {
  const [pass, salt] = key.split('.');

  const buffer = scryptSync(secret, salt, 64);

  return timingSafeEqual(Buffer.from(pass, 'hex'), buffer);
}

const transform = async (url, width = 512, quality = 80) => {
  const r = await fetch(url);

  if (r.status !== 200)
    return Promise.reject({
      status: r.status
    });

  let transform = sharp().webp();

  if (width) {
    transform = transform.resize({width, quality})
  }

  return r.body.pipe(transform);
}


var whitelist = ['https://lettercms-dashboard-davidsdevel.vercel.app', 'https://lettercms-client-davidsdevel.vercel.app'];

const corsOpts = {
  origin: true,
  methods: ['GET', 'OPTIONS']
}

app.get('/api/resize', cors(corsOpts), async (req, res) => {
  try {

    const {query: {url, w, q, t}} = req;

    const token = `${process.env.JWT_AUTH}@${Buffer.from(url).toString('hex')}`;
    const isValidToken = compare(token, t);

    if (!isValidToken)
      return res.sendStatus(401);


    const r = await transform(url, parseInt(w), parseInt(q));

    res.setHeader('cache-control', 'public, max-age=31536000, must-revalidate')

    r.pipe(res);
  } catch(err) {
    if (err.status !== 200)
      res.sendStatus(err.status);
  }
});


app.listen(3003, () => console.log('> app listen on port 3003'))