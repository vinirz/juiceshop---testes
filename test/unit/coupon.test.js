const applyCoupon = require('../../routes/coupon');
const { BasketModel } = require('../../models/basket');
const security = require('../../lib/insecurity');
const z85 = require('z85');

function generateValidCoupon(discount){
  const now = new Date();
  
  const month = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = now.getFullYear().toString().slice(-2);

  return encodeURIComponent(`${month}${year}-${discount}`);
};

let req, res, next;

beforeEach(() => {
  req = { params: { id: '1', coupon: generateValidCoupon(10) } };
  res = { json: jest.fn().mockReturnThis(), status: jest.fn().mockReturnThis(), send: jest.fn() };
  next = jest.fn();
});

describe('Testes para a função applyCoupon', () => {
  it('[ID: 07] - Teste unitário para o método discountFromCoupon', async () => {
    console.log(req.params);

    const mockBasket = { update: jest.fn().mockResolvedValue() };

    BasketModel.findByPk = jest.fn();
    BasketModel.findByPk.mockResolvedValue(mockBasket);

    const middleware = applyCoupon();
    await middleware(req, res, next);
  });
});
