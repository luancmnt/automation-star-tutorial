const { expect } = require('chai');
const cases = require('../data/checkout-discount.json');
const { login, setCart, getCart, checkout, ensureEmptyCart } = require('../helpers/api');

describe('Checkout — discount business rule', () => {
  cases.forEach((testCase) => {
    it(`${testCase.id} — ${testCase.title}`, async () => {
      const token = await login(testCase.user);

      if (testCase.setup === 'setCart') {
        const cartResponse = await setCart(token, testCase.items);
        expect(cartResponse.status).to.equal(200);

        const preview = await getCart(token);
        expect(preview.status).to.equal(200);
        expect(preview.body.cart.items).to.have.lengthOf(testCase.items.length);
      }

      if (testCase.setup === 'emptyCart') {
        const empty = await ensureEmptyCart(token);
        expect(empty.status).to.equal(200);
        expect(empty.body.cart.items).to.deep.equal([]);
      }

      const response = await checkout(token, testCase.paymentMethod);

      expect(response.status).to.equal(testCase.expectedStatus);

      if (testCase.expectedStatus === 201) {
        expect(response.body.message).to.equal(testCase.expected.message);
        expect(response.body.order).to.include({
          paymentMethod: testCase.expected.paymentMethod,
          subtotal: testCase.expected.subtotal,
          discountRate: testCase.expected.discountRate,
          discountAmount: testCase.expected.discountAmount,
          total: testCase.expected.total,
        });
        return;
      }

      expect(response.body).to.not.have.property('order');
      expect(response.body.error).to.equal(testCase.expected.error);
    });
  });
});
