const { getWalletBalance, addWalletBalance } = require('../../routes/wallet');
const { WalletModel } = require('../../models/wallet');
const { CardModel } = require('../../models/card');

let req, res, next;

beforeEach(() => {
  req = { params: {}, body: {} };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  next = jest.fn();
  jest.clearAllMocks();
});

describe('Módulo "Carteira"', () => {

  describe('[ID 16] - Verificar saldo da carteira para um usuário existente', () => {
    test('Retorna o saldo para um usuário com carteira associada', async () => {
      req.body = { UserId: '1' };
      WalletModel.findOne = jest.fn().mockResolvedValue({ balance: 100 });

      await getWalletBalance()(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: 100 });
    });
  });

  describe('[ID 17] - Verificar saldo da carteira para um usuário inexistente', () => {
    test('Retorna erro 404 para um usuário sem carteira associada', async () => {
      req.body = { UserId: '1' };
      WalletModel.findOne = jest.fn().mockResolvedValue(null);

      await getWalletBalance()(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ status: 'error' });
    });
  });

  describe('[ID 18] - Adicionar saldo à carteira com cartão válido', () => {
    test('Atualiza o saldo da carteira com o valor fornecido', async () => {
      req.body = { UserId: '1', paymentId: 'validCardId', balance: 50 };

      CardModel.findOne = jest.fn().mockResolvedValue({ id: 'validCardId' });
      WalletModel.increment = jest.fn().mockResolvedValue({ balance: 150 });

      await addWalletBalance()(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'success', data: 50 });
    });
  });

  describe('[ID 19] - Tentar adicionar saldo com cartão inválido', () => {
    test('Retorna erro 402 para um cartão inválido', async () => {
      req.body = { UserId: '1', paymentId: 'invalidCardId', balance: 50 };

      CardModel.findOne = jest.fn().mockResolvedValue(null);

      await addWalletBalance()(req, res, next);
      expect(res.status).toHaveBeenCalledWith(402);
      expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Payment not accepted.' });
    });
  });

  describe('[ID 20] - Falha ao adicionar saldo por erro no banco de dados', () => {
    test('Retorna erro 404 se houver falha ao atualizar o saldo', async () => {
      req.body = { UserId: '1', paymentId: 'validCardId', balance: 50 };
  
      CardModel.findOne = jest.fn().mockResolvedValue({ id: 'validCardId' });
      WalletModel.increment = jest.fn().mockRejectedValue(new Error('Database error'));
  
      await addWalletBalance()(req, res, next);
      
      expect(next).toHaveBeenCalledWith(expect.any(Error)); // Verifica se o next foi chamado com um erro
    });
  });
  
  
  
  

});
