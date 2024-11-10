const applyCoupon = require('../../routes/coupon');
const { BasketModel } = require('../../models/basket');
const security = require('../../lib/insecurity');

let req, res, next;
let response;

beforeEach(() => {
  req = { params: {} };
  res = { status: jest.fn().mockReturnThis(), send: jest.fn((data) => console.log('erro', data)) };
  next = jest.fn();
});

describe('Testes para a função applyCoupon', () => {
  test('[ID: 07] - Teste unitário para o método discountFromCoupon', async () => {
    const mockBasket = { update: jest.fn().mockResolvedValue() };
    BasketModel.findByPk = jest.fn().mockResolvedValue(mockBasket);

    req.params = { 
      id: '1', 
      coupon: security.generateCoupon('10')
    }

    const discount = security.discountFromCoupon(req.params.coupon);
    expect(discount).toBe(10);
  });
});
