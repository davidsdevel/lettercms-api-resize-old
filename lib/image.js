const fetch = require('isomorphic-unfetch')
const sharp = require('sharp')

const transform = async (url, {width, quality, height}) => {
  const r = await fetch(url);

  if (r.status !== 200)
    return {
      status: r.status
    }

  let transform = sharp().webp();

  let transformOpts = {}

  if (width)
    transformOpts.width = width;
  if (height)
    transformOpts.height = height;
  if (quality)
    transformOpts.quality = width;

  transform = transform.resize(transformOpts);

  return {
    transformStream: r.body.pipe(transform),
    type: r.headers.get('content-type')
  }
}

module.exports = exports = {
  transform
}