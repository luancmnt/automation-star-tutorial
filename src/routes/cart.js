const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function serializeCart(cart) {
  const items = cart.items || [];
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
  };
}

router.get('/cart', authenticate, (req, res) => {
  const cart = db.getCart(req.user.id);

  return res.status(200).json({
    cart: serializeCart(cart),
  });
});

router.post('/cart', authenticate, (req, res) => {
  const { items } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'items must be a non-empty array of { productId, quantity }.',
    });
  }

  const normalizedItems = [];

  for (const item of items) {
    const productId = item?.productId;
    const quantity = Number(item?.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        error: 'Each item needs a valid productId and an integer quantity of at least 1.',
      });
    }

    const product = db.findProductById(productId);
    if (!product) {
      return res.status(404).json({ error: `Product not found: ${productId}` });
    }

    const existing = normalizedItems.find((entry) => entry.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      normalizedItems.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity,
      });
    }
  }

  const cart = db.setCart(req.user.id, normalizedItems);

  return res.status(200).json({
    message: 'Cart updated.',
    cart: serializeCart(cart),
  });
});

module.exports = router;
