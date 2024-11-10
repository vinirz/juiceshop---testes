const applyCoupon = require('../../routes/coupon');
const { BasketModel } = require('../../models/basket');
const security = require('../../lib/insecurity');
const z85 = require('z85');

let req, res, next;
let response;

beforeEach(() => {
  req = { params: {} };
  res = { status: jest.fn().mockReturnThis() };

  response = new Promise(resolve => {
    res.json = jest.fn((data) => resolve(data));
  });
  
  error = new Promise(resolve => {
    res.send = jest.fn((data) => resolve(data));
  });

  rejection = new Promise(resolve => {
    next = jest.fn((data) => resolve(data));
  })
});

describe('Módulo "Cupom de desconto"', () => {
  describe('[ID: 07] - Aplicação de Cupom Válido na Cesta', () => {
    test('Teste unitário para o método generateCoupon - Desconto válido', async () => {
      const coupon = security.generateCoupon('10')
      const decodedCoupon = z85.decode(coupon).toString()
      expect(decodedCoupon).not.toBeNull();
    });
    
    test('Teste unitário para o método discountFromCoupon - Cupom valido', async () => {
      req.params = { 
        id: '1', 
        coupon: security.generateCoupon('10')
      }
  
      const discount = security.discountFromCoupon(req.params.coupon);
      expect(discount).toBe(10);
    });
  
    test('Teste para a funcionalidade discountFromCoupon - Fluxo normal', async () => {
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
  
  describe('[ID: 08] - Tentativa de Aplicação de Cupom Inválido', () => {
    test('Teste unitário para o método generateCoupon - Desconto inválido', async () => {
      const coupon = security.generateCoupon('INVALID_DISCOUNT')
      expect(coupon).toBeNull();
    });
    
    test('Teste unitário para o método discountFromCoupon - Cupom inválido', async () => {
      req.params = { 
        id: '1', 
        coupon: 'INVALID_COUPON'
      }
  
      const discount = security.discountFromCoupon(req.params.coupon);
      expect(discount).toBeUndefined();
    });

    test('Teste para a funcionalidade discountFromCoupon - Fluxo de erro', async () => {
      const mockBasket = { update: jest.fn().mockResolvedValue() };
      BasketModel.findByPk = jest.fn().mockResolvedValue(mockBasket);
      
      req.params = { 
        id: '1', 
        coupon: 'INVALID_COUPON'
      }
  
      const component = applyCoupon()
      await component(req, res, next);
  
      const result = await error;
      expect(result).toBe('Invalid coupon.')
    });
  })

  describe('[ID: 09] - Tentativa de Aplicação de Cupom em Cesta Inexistente', () => {
    test('Teste unitário para o método findByPk - Cesta inexistente', async () => {
      BasketModel.findByPk = jest.fn().mockResolvedValue(null);
      
      req.params = { 
        id: '1', 
        coupon: security.generateCoupon('10')
      }
  
      const component = applyCoupon()
      await component(req, res, next);
  
      const result = await rejection;
      expect(result.message).toBe('Basket with id=1 does not exist.')
    });
  })
})
