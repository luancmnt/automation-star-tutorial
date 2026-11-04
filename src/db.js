const bcrypt = require('bcryptjs');

const CASH_DISCOUNT_RATE = 0.1;

const products = [
  {
    id: 'prod-1',
    name: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with 30h battery life',
    price: 150.0,
  },
  {
    id: 'prod-2',
    name: 'USB-C Hub',
    description: '7-in-1 USB-C hub with HDMI and SD card reader',
    price: 45.0,
  },
  {
    id: 'prod-3',
    name: 'Mechanical Keyboard',
    description: 'Compact 75% mechanical keyboard with hot-swappable switches',
    price: 120.0,
  },
];

const seedUsers = [
  {
    id: 'user-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'alice123',
  },
  {
    id: 'user-2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'bob12345',
  },
  {
    id: 'user-3',
    name: 'Carol Davis',
    email: 'carol@example.com',
    password: 'carol123',
  },
];

const users = seedUsers.map((user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  passwordHash: bcrypt.hashSync(user.password, 10),
}));

const sessions = new Map();
const carts = new Map();
const orders = [];

function findUserByEmail(email) {
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function findUserById(id) {
  return users.find((user) => user.id === id);
}

function findProductById(id) {
  return products.find((product) => product.id === id);
}

function getCart(userId) {
  if (!carts.has(userId)) {
    carts.set(userId, { userId, items: [] });
  }
  return carts.get(userId);
}

function setCart(userId, items) {
  const cart = { userId, items };
  carts.set(userId, cart);
  return cart;
}

function clearCart(userId) {
  carts.set(userId, { userId, items: [] });
}

module.exports = {
  CASH_DISCOUNT_RATE,
  products,
  users,
  sessions,
  orders,
  findUserByEmail,
  findUserById,
  findProductById,
  getCart,
  setCart,
  clearCart,
};
