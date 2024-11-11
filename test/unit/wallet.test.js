const { getWalletBalance, addWalletBalance } = require('../../routes/wallet');
const { WalletModel } = require('../../models/wallet');
const { CardModel } = require('../../models/card');

let req, res, next;
let response, error, rejection;

beforeEach(() => {
  req = { params: {}, body: {} };
  res = { status: jest.fn().mockReturnThis() };

  // Criando as promessas corretamente
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

jest.setTimeout(10000);  // Aumentando o tempo limite para 10 segundos

describe('Módulo "Carteira"', () => {

  describe('[ID 16] - Verificar saldo da carteira para um usuário existente', () => {
    test('Retorna o saldo para um usuário com carteira associada', async () => {
      req.params = { userId: '1' };
      WalletModel.findByUserId = jest.fn().mockResolvedValue({ balance: 100 });

      await getWalletBalance(req, res, next);
      const result = await response;  // Espera pela resposta assíncrona
      expect(res.status).toHaveBeenCalledWith(200);
      expect(result).toHaveProperty('balance', 100);
    });
  });

  describe('[ID 17] - Verificar saldo da carteira para um usuário inexistente', () => {
    test('Retorna erro 404 para um usuário sem carteira associada', async () => {
      req.params = { userId: '1' };
      WalletModel.findByUserId = jest.fn().mockResolvedValue(null);

      await getWalletBalance(req, res, next);
      const result = await response;  // Espera pela resposta assíncrona
      expect(res.status).toHaveBeenCalledWith(404);
      expect(result).toEqual({ status: 'error', message: 'Wallet not found.' });
    });
  });

  describe('[ID 18] - Adicionar saldo à carteira com cartão válido', () => {
    test('Atualiza o saldo da carteira com o valor fornecido', async () => {
      req.params = { userId: '1', paymentId: 'validCardId' };
      req.body = { amount: 50 };

      CardModel.findById = jest.fn().mockResolvedValue({ id: 'validCardId' });
      WalletModel.updateBalance = jest.fn().mockResolvedValue({ balance: 150 });

      await addWalletBalance(req, res, next);
      const result = await response;  // Espera pela resposta assíncrona
      expect(res.status).toHaveBeenCalledWith(200);
      expect(result).toHaveProperty('balance', 150);
    });
  });

  describe('[ID 19] - Tentar adicionar saldo com cartão inválido', () => {
    test('Retorna erro 402 para um cartão inválido', async () => {
      req.params = { userId: '1', paymentId: 'invalidCardId' };
      req.body = { amount: 50 };

      CardModel.findById = jest.fn().mockResolvedValue(null);

      await addWalletBalance(req, res, next);
      const result = await response;  // Espera pela resposta assíncrona
      expect(res.status).toHaveBeenCalledWith(402);
      expect(result).toEqual({ message: 'Payment not accepted.' });
    });
  });

  describe('[ID 20] - Falha ao adicionar saldo por erro no banco de dados', () => {
    test('Retorna erro 404 se houver falha ao atualizar o saldo', async () => {
      req.params = { userId: '1', paymentId: 'validCardId' };
      req.body = { amount: 50 };

      CardModel.findById = jest.fn().mockResolvedValue({ id: 'validCardId' });
      WalletModel.updateBalance = jest.fn().mockRejectedValue(new Error('Database error'));

      await addWalletBalance(req, res, next);
      const result = await error;  // Espera pela resposta de erro
      expect(res.status).toHaveBeenCalledWith(404);
      expect(result).toEqual({ message: 'error' });
    });
  });

});
