const { Deta } = require('deta');
const {parse} = require('url');
const qs = require('querystring');
const buffer = require('buffer');

const deta = Deta(process.env.DETA_PROJECT_KEY);
const db = deta.Base('lettercms-resize');

const normalizeUrl = (url, query) => {

  const data = {}
  if (query.w)
    data.w = query.w;
  if (query.h)
    data.h = query.h
  if (query.q)
    data.q = query.q

  return `${url}?${qs.stringify(data)}`;
}

const saveFile = async (key, buff, type) => {
  let opts = key.includes('lettercms') || key.includes('davidsdevel') ?  null : {expireIn: 2592000}
  
  const encoded = buff.toString('base64');

  return db.put({encoded, type}, key, opts);
}

const getFile = async key => {
  const data = await db.get(key);

  if (!data)
    return null;
  
  const buff = buffer.Buffer.from(data.encoded, 'base64');

  return {
    buff,
    type: data.type
  }
}

module.exports = exports = {
  normalizeUrl,
  getFile,
  saveFile
}