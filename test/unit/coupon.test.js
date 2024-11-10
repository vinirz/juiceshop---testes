const applyCoupon = require('../../routes/coupon');
const { BasketModel } = require('../../models/basket');
const security = require('../../lib/insecurity');
const z85 = require('z85');

let req, res, next;
let response;

beforeEach(() => {
  req = { params: {} };
  res = { status: jest.fn().mockReturnThis(), send: jest.fn((data) => console.log('erro', data)) };

  response = new Promise(resolve => {
    res.json = jest.fn((data) => resolve(data));
  });
  
  error = new Promise(resolve => {
    next = jest.fn((data) => resolve(data));
  });
});

describe('[ID: 07] - Módulo "Cupom de desconto"', () => {
  describe('Casos de sucesso', () => {
    test('Teste unitário para o método generateCoupon', async () => {
      const coupon = security.generateCoupon('10')
      const decodedCoupon = z85.decode(coupon).toString()
      expect(decodedCoupon).not.toBeNull();
    });
    
    test('Teste unitário para o método discountFromCoupon', async () => {
      req.params = { 
        id: '1', 
        coupon: security.generateCoupon('10')
      }
  
      const discount = security.discountFromCoupon(req.params.coupon);
      expect(discount).toBe(10);
    });
  
    test('Teste para a funcionalidade discountFromCoupon', async () => {
      const mockBasket = { update: jest.fn().mockResolvedValue() };
      BasketModel.findByPk = jest.fn().mockResolvedValue(mockBasket);
      
      
      req.params = { 
        id: '1', 
        coupon: security.generateCoupon('10')
      }
  
      const discount = security.discountFromCoupon(req.params.coupon);
      expect(discount).toBe(10);
  
      const component = applyCoupon()
      await component(req, res, next);
  
      const result = await response;
      expect(result).toHaveProperty('discount', 10);
    });
  })
  
  describe('Casos de Erro', () => {
    test('Teste unitário para o método generateCoupon - desconto inválido', async () => {
      const coupon = security.generateCoupon('INVALID_DISCOUNT')
      expect(coupon).toBeNull();
    });
    
    test('Teste unitário para o método discountFromCoupon - cupom inválido', async () => {
      req.params = { 
        id: '1', 
        coupon: 'INVALID_COUPON'
      }
  
      const discount = security.discountFromCoupon(req.params.coupon);
      expect(discount).toBeUndefined();
    });
  })
})
