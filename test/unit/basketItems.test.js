const basket = require('../../routes/basketItems');
const login = require('../../routes/login');
const { BasketItemModel } = require('../../models/basketitem');
const { QuantityModel } = require('../../models/quantity');

let req, res, next;
let response;

beforeEach(() => {
  req = { params: {}, body: {}, rawBody: '', headers: {} };
  res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

  response = new Promise(resolve => {
    res.json = jest.fn((data) => resolve(data));
  });
  
  receivedStatus = new Promise(resolve => {
    res.status = jest.fn((statusCode) => {
      res.send = jest.fn((message) => {
        resolve({ code: statusCode, message });
      });

      res.json = jest.fn((data) => {
        resolve({ code: statusCode, data });
      });

      res.__ =  jest.fn((message, values) => {
        message = message.replace('{{quantity}}', values.quantity)
        resolve({ code: statusCode, message })
      })

      return res;
    })
  });
  
  error = new Promise(resolve => {
    res.send = jest.fn((data) => resolve(data));
  });

  rejection = new Promise(resolve => {
    next = jest.fn((data) => resolve(data));
  })
});

async function doLogin({email, password}) {
  req.body = {
    email,
    password
  }

  const doLogin = login();
  await doLogin(req, res, next);

  const user = await response;

  response = new Promise(resolve => {
    res.json = jest.fn((data) => resolve(data));
  });

  return user
}

describe('Módulo "Itens da cesta"', () => {
  describe('[ID: 04] - Adição de Produto com Sucesso', () => {
    test('Teste unitário para o método quantityCheckBeforeBasketItemAddition - Produtos em estoque', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      const itemsToAdd = {
        ProductId: 6,
        BasketId: user.authentication.bid,
        quantity: 1
      }

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      req.params = {
        id: user.authentication.bid
      }

      req.body = itemsToAdd

      QuantityModel.findOne = jest.fn().mockResolvedValue({
        limitPerUser: 5,
        quantity: 5
      })

      const mockSave = jest.fn().mockResolvedValue(itemsToAdd);
      jest.spyOn(BasketItemModel, 'build').mockReturnValue({ save: mockSave });

      const checkQuantity = basket.quantityCheckBeforeBasketItemAddition();
      await checkQuantity(req, res, next);

      const result = await rejection;

      expect(result).toBeUndefined();
    })

    test('Teste para a funcionalidade addBasketItem - Fluxo normal', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      const itemsToAdd = {
        ProductId: 6,
        BasketId: user.authentication.bid,
        quantity: 1
      }

      const mockSave = jest.fn().mockResolvedValue(itemsToAdd);
      jest.spyOn(BasketItemModel, 'build').mockReturnValue({ save: mockSave });

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      req.rawBody = JSON.stringify(itemsToAdd)

      const component = basket.addBasketItem();
      await component(req, res, next);

      const result = await response;

      expect(result.status).toBe('success');
      expect(result.data).toEqual(itemsToAdd);
    })
  })
  
  describe('[ID: 05] - Adição de Produto com ID da cesta inválido', () => {
    test('Teste unitário para o método quantityCheckBeforeBasketItemAddition - ID da cesta diferente da autenticação', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      const itemsToAdd = {
        ProductId: 6,
        BasketId: user.authentication.bid + 1,
        quantity: 1
      }

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      req.params = {
        id: user.authentication.bid
      }

      req.body = itemsToAdd

      QuantityModel.findOne = jest.fn().mockResolvedValue({
        limitPerUser: 5,
        quantity: 5
      })

      const mockSave = jest.fn().mockResolvedValue(itemsToAdd);
      jest.spyOn(BasketItemModel, 'build').mockReturnValue({ save: mockSave });

      const checkQuantity = basket.quantityCheckBeforeBasketItemAddition();
      await checkQuantity(req, res, next);

      const result = await rejection;

      expect(result).toBeDefined();
    })

    test('Teste para a funcionalidade addBasketItem - Fluxo de erro', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      const itemsToAdd = {
        ProductId: 6,
        BasketId: user.authentication.bid + 1,
        quantity: 1
      }

      const mockSave = jest.fn().mockResolvedValue(itemsToAdd);
      jest.spyOn(BasketItemModel, 'build').mockReturnValue({ save: mockSave });

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      req.rawBody = JSON.stringify(itemsToAdd)

      const component = basket.addBasketItem();
      await component(req, res, next);

      const resultStatus = await receivedStatus;

      expect(resultStatus.code).toBe(401);
      expect(resultStatus.message).toBe(`{'error' : 'Invalid BasketId'}`)
    })
  })
  
  describe('[ID: 06] - Adição de Produto com Quantidade Indisponível', () => {
    test('Teste unitário para o método quantityCheckBeforeBasketItemAddition - Quantidade indisponível', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      const itemsToAdd = {
        ProductId: 6,
        BasketId: user.authentication.bid + 1,
        quantity: 999
      }

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      req.params = {
        id: user.authentication.bid
      }

      req.body = itemsToAdd

      QuantityModel.findOne = jest.fn().mockResolvedValue({
        limitPerUser: 5,
        quantity: 5
      })

      const mockSave = jest.fn().mockResolvedValue(itemsToAdd);
      jest.spyOn(BasketItemModel, 'build').mockReturnValue({ save: mockSave });

      const checkQuantity = basket.quantityCheckBeforeBasketItemAddition();
      await checkQuantity(req, res, next);

      const result = await receivedStatus;

      expect(result.code).toBe(400);
      expect(result.message).toBe('You can order only up to 5 items of this product.')
    })

    test('Teste para a funcionalidade addBasketItem - Fluxo de erro - Quantidade indisponível', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      const itemsToAdd = {
        ProductId: 6,
        BasketId: user.authentication.bid,
        quantity: 999
      }

      const mockSave = jest.fn().mockResolvedValue(itemsToAdd);
      jest.spyOn(BasketItemModel, 'build').mockReturnValue({ save: mockSave });

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      req.rawBody = JSON.stringify(itemsToAdd)

      const component = basket.addBasketItem();
      await component(req, res, next);

      const result = await response;

      expect(result.status).toBe('failed');
    })
  })
})