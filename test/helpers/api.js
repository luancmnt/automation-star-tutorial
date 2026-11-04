const request = require('supertest');
const users = require('../data/users.json');

function client() {
  const baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    throw new Error('BASE_URL is not set. Copy .env.example to .env.');
  }

  return request(baseUrl);
}

function credentialsFor(userKey) {
  const mapping = users[userKey];

  if (!mapping) {
    throw new Error(`Unknown user key: ${userKey}`);
  }

  const email = process.env[mapping.emailEnv];
  const password = process.env[mapping.passwordEnv];

  if (!email || !password) {
    throw new Error(`Missing credentials in .env for user "${userKey}".`);
  }

  return { email, password };
}

async function login(userKey) {
  const { email, password } = credentialsFor(userKey);
  const response = await client()
    .post('/login')
    .send({ email, password })
    .set('Accept', 'application/json');

  if (response.status !== 200 || !response.body.token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(response.body)}`);
  }

  return response.body.token;
}

async function setCart(token, items) {
  return client()
    .post('/cart')
    .set('Authorization', `Bearer ${token}`)
    .send({ items })
    .set('Accept', 'application/json');
}

async function getCart(token) {
  return client()
    .get('/cart')
    .set('Authorization', `Bearer ${token}`)
    .set('Accept', 'application/json');
}

async function checkout(token, paymentMethod) {
  return client()
    .post('/checkout')
    .set('Authorization', `Bearer ${token}`)
    .send({ paymentMethod })
    .set('Accept', 'application/json');
}

async function ensureEmptyCart(token) {
  const current = await getCart(token);
  const items = current.body?.cart?.items || [];

  if (!items.length) {
    return current;
  }

  const clear = await checkout(token, 'cash');

  if (clear.status !== 201) {
    throw new Error(`Could not clear cart: ${JSON.stringify(clear.body)}`);
  }

  return getCart(token);
}

module.exports = {
  client,
  credentialsFor,
  login,
  setCart,
  getCart,
  checkout,
  ensureEmptyCart,
};
