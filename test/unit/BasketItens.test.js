let req, res, next;
let response, error, rejection;

beforeEach(() => {
  req = { body: {}, params: {} };
  res = { status: jest.fn().mockReturnThis() };
  
  response = new Promise(resolve => {
    res.json = jest.fn(data => resolve(data));
  });

  error = new Promise(resolve => {
    res.send = jest.fn(data => resolve(data));
  });

  rejection = new Promise(resolve => {
    next = jest.fn(data => resolve(data));
  });
});

describe('Módulo "Itens da Cesta"', () => {

  describe('[ID: 04] - Adição de Produto com Sucesso', () => {
    test('Teste para adicionar produto com dados válidos', async () => {
      req.body = { basketId: '1', productId: '101', quantity: 2 };
      
      const addToBasket = (basketId, productId, quantity) => {
        if (basketId && productId && quantity > 0) {
          return { status: 'success', item: { productId, quantity }};
        }
        throw new Error('Invalid input');
      };

      const result = addToBasket(req.body.basketId, req.body.productId, req.body.quantity);
      expect(result.status).toBe('success');
      expect(result.item).toHaveProperty('productId', req.body.productId);
      expect(result.item).toHaveProperty('quantity', req.body.quantity);
    });
  });

  describe('[ID: 05] - Adição de Produto com ID da cesta inválido', () => {
    test('Teste para adicionar produto com ID de cesta inválido', async () => {
      req.body = { basketId: '999', productId: '101', quantity: 2 };
      
      const addToBasket = (basketId, productId, quantity) => {
        if (basketId !== '1') {
          throw new Error('Invalid BasketId');
        }
        return { status: 'success', item: { productId, quantity }};
      };

      try {
        addToBasket(req.body.basketId, req.body.productId, req.body.quantity);
      } catch (error) {
        expect(error.message).toBe('Invalid BasketId');
      }
    });
  });

  describe('[ID: 06] - Adição de Produto com Quantidade Indisponível', () => {
    test('Teste para adicionar produto com quantidade indisponível', async () => {
      req.body = { basketId: '1', productId: '101', quantity: 100 };
      
      const addToBasket = (basketId, productId, quantity) => {
        const availableStock = 5;
        if (quantity > availableStock) {
          throw new Error('We are out of stock! Sorry for the inconvenience.');
        }
        return { status: 'success', item: { productId, quantity }};
      };

      try {
        addToBasket(req.body.basketId, req.body.productId, req.body.quantity);
      } catch (error) {
        expect(error.message).toBe('We are out of stock! Sorry for the inconvenience.');
      }
    });
  });

});

     
