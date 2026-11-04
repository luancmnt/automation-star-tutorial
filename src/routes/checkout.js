const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/checkout', authenticate, (req, res) => {
  const paymentMethod = String(req.body?.paymentMethod || '').toLowerCase();

  if (!['cash', 'credit_card'].includes(paymentMethod)) {
    return res.status(400).json({
      error: 'paymentMethod is required and must be cash or credit_card.',
    });
  }

  const cart = db.getCart(req.user.id);
  if (!cart.items.length) {
    return res.status(400).json({
      error: 'Cart is empty. Add products to the cart before checkout.',
    });
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const discountRate = paymentMethod === 'cash' ? db.CASH_DISCOUNT_RATE : 0;
  const discountAmount = Number((subtotal * discountRate).toFixed(2));
  const total = Number((subtotal - discountAmount).toFixed(2));

  const order = {
    id: uuidv4(),
    userId: req.user.id,
    items: cart.items,
    paymentMethod,
    subtotal: Number(subtotal.toFixed(2)),
    discountRate,
    discountAmount,
    total,
    createdAt: new Date().toISOString(),
  };

  db.orders.push(order);
  db.clearCart(req.user.id);

  return res.status(201).json({
    message: 'Checkout completed.',
    order,
  });
});

module.exports = router;
