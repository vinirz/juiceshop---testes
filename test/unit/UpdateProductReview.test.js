const productReviews = require('../../routes/updateProductReviews');
const db = require('../../data/mongodb');
const security = require('../../lib/insecurity');

let req, res, next;
let response, error, rejection;

beforeEach(() => {
  req = { body: {} };
  res = { status: jest.fn().mockReturnThis() };
  
  response = new Promise(resolve => {
    res.json = jest.fn((data) => resolve(data));
  });

  error = new Promise(resolve => {
    res.send = jest.fn((data) => resolve(data));
  });

  rejection = new Promise(resolve => {
    next = jest.fn((data) => resolve(data));
  });
});

describe('Módulo "Atualização de Reviews"', () => {
  
  describe('[ID: 10] - Atualização de Review Válida', () => {
    test('Deve atualizar uma review com sucesso quando uma review válida é fornecida', async () => {
      req.body = { id: 'existing-review-id', message: 'Nova mensagem da review' };
      
      // Simulando o usuário autenticado
      security.authenticatedUsers = { from: jest.fn().mockReturnValue({ data: { email: 'user@example.com' } }) };
      
      // Mock do comportamento de atualização no banco de dados
      db.reviewsCollection.update = jest.fn().mockResolvedValue({
        modified: 1,
        original: [{ author: 'user@example.com' }]
      });
      
      const component = productReviews();
      await component(req, res, next);
      
      const result = await response;
      expect(result).toEqual({ modified: 1, original: [{ author: 'user@example.com' }] });
    });
  });

  describe('[ID: 11] - Tentativa de Atualizar uma Review Inexistente', () => {
    test('Deve retornar erro ao tentar atualizar uma review inexistente', async () => {
      req.body = { id: 'non-existent-review-id', message: 'Tentativa de atualização' };
      
      // Mock do comportamento de falha na atualização no banco de dados
      db.reviewsCollection.update = jest.fn().mockResolvedValue({
        modified: 0,
        original: []
      });
      
      const component = productReviews();
      await component(req, res, next);
      
      const result = await response;
      expect(result).toEqual({ modified: 0, original: [] });
    });
  });

  describe('[ID: 12] - Injeção NoSQL - Múltiplas Reviews Modificadas', () => {
    test('Deve identificar a tentativa de injeção NoSQL quando várias reviews são modificadas', async () => {
      req.body = { id: 'injection-attempt', message: 'Mensagem para múltiplas reviews' };
      
      // Simula o usuário autenticado
      security.authenticatedUsers = { from: jest.fn().mockReturnValue({ data: { email: 'user@example.com' } }) };
      
      // Mock do comportamento de atualização com múltiplas reviews modificadas
      db.reviewsCollection.update = jest.fn().mockResolvedValue({
        modified: 2,
        original: [{ author: 'user@example.com' }, { author: 'attacker@example.com' }]
      });
      
      const component = productReviews();
      await component(req, res, next);
      
      const result = await response;
      expect(result).toEqual({ modified: 2, original: [{ author: 'user@example.com' }, { author: 'attacker@example.com' }] });
    });
  });
});
