const compare = (secret, key) => {
  const [pass, salt] = key.split('.');

  const buffer = scryptSync(secret, salt, 64);

  return timingSafeEqual(Buffer.from(pass, 'hex'), buffer);
}

