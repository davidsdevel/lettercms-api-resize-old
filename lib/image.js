const fetch = require('isomorphic-unfetch')
const sharp = require('sharp')

const transform = async (url, {width, quality, height}) => {
  const r = await fetch(url);
  const b = await r.buffer()

  if (r.status !== 200)
    return {
      status: r.status
    }

  let transform = sharp(b).webp();

  let transformOpts = {}

  if (width)
    transformOpts.width = width;
  if (height)
    transformOpts.height = height;
  if (quality)
    transformOpts.quality = width;

  transform = transform.resize(transformOpts);

  return {
    buff: await transform.toBuffer(),
    type: r.headers.get('content-type')
  }
}

module.exports = exports = {
  transform
}