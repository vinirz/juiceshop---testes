const productReviews = require('../../routes/createProductReviews'); 
const { reviewsCollection } = require('../../data/mongodb');
const security = require('../../lib/insecurity');

let req, res, next;
let response;

beforeEach(() => {
    req = { params: {}, body: {} };
    res = { 
      status: jest.fn().mockReturnThis(), 
      json: jest.fn(), // Mock da função json
      send: jest.fn((data) => console.log('erro', data)) 
    };
    next = jest.fn();
  });
  

describe('Testes para a função ReviewProduct', () => {
  test('[ID: 01] - Verificar que o usuário está logado e avaliando com o mesmo email', async () => {
    req.body = { 
      message: "Ótimo produto, bonito, barato. Recomendo muito.",
      author: 'user@example.com'
    };
    req.params.id = '1';
    
    const userMock = { data: { email: 'user@example.com' } };
    security.authenticatedUsers = { from: jest.fn().mockReturnValue(userMock) };
    reviewsCollection.insert = jest.fn().mockResolvedValue();

    await productReviews()(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ status: 'success' });
  });

  test('[ID: 02] - Verificar que o usuário não é o autor do produto', async () => {
    req.body = { 
      message: "Não gostei do produto ",
      author: 'invalid_user@example.com' 
    };
    req.params.id = '1';

    const userMock = { data: { email: 'user@example.com' } }; // Email do usuário logado é diferente do author
    security.authenticatedUsers = { from: jest.fn().mockReturnValue(userMock) };

    await productReviews()(req, res);
    expect(res.status).toHaveBeenCalledWith(500); 
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }));
  });

  test('[ID: 03] - Verificar que usuário está cadastrado', async () => {
    req.body = { 
      message: "Avaliação tentativa por usuário não autenticado" 
    };
    req.params.id = '1';

    security.authenticatedUsers = { from: jest.fn().mockReturnValue(null) }; // Usuário não autenticado

    await productReviews()(req, res);

    expect(res.status).toHaveBeenCalledWith(500); 
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }));
  });

});
