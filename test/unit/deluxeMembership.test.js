const { UserModel } = require('../../models/user');
const { WalletModel } = require('../../models/wallet');
const { CardModel } = require('../../models/card');
const { upgradeToDeluxe, deluxeMembershipStatus } = require('../../routes/deluxe');
const security = require('../../lib/insecurity');
const challengeUtils = require('../../lib/challengeUtils');
const utils = require('../../lib/utils');

let req, res, next;
let response;

beforeEach(() => {
  req = { body: {}, params: {} };
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

describe('Módulo "Assinatura Deluxe"', () => {

  describe('[ID: 28] - Ativação de Assinatura Premium', () => {

    test('Teste para erro de saldo insuficiente na carteira', async () => {
      const mockUser = { id: '1', role: security.roles.customer, email: 'user@example.com' };
      const mockWallet = { balance: 20 };  // Saldo insuficiente
      
      // Mock para UserModel e WalletModel
      UserModel.findOne = jest.fn().mockResolvedValue(mockUser);
      WalletModel.findOne = jest.fn().mockResolvedValue(mockWallet);
      
      req.body = { UserId: '1', paymentMode: 'wallet' };

      // Chama a função de upgrade
      const component = upgradeToDeluxe();
      await component(req, res, next);

      const result = await response;
      expect(res.status).toHaveBeenCalledWith(400);
      expect(result).toHaveProperty('status', 'error');
      expect(result.error).toBe('Insuffienct funds in Wallet');
    });

  describe('[ID: 29] - Verificar benefícios de Deluxe Membership', () => {

    test('Teste para erro ao verificar benefícios de Deluxe Membership para um usuário não qualificado', async () => {
      const mockUser = { id: '1', role: security.roles.guest };  // Usuário não qualificado

      // Mock para UserModel
      UserModel.findOne = jest.fn().mockResolvedValue(mockUser);

      req.body = { UserId: '1' };

      // Chama a função para verificar status da membership
      const component = deluxeMembershipStatus();
      await component(req, res, next);

      const result = await response;
      expect(res.status).toHaveBeenCalledWith(400);
      expect(result).toHaveProperty('status', 'error');
      expect(result.error).toBe('You are not eligible for deluxe membership!');
    });
  });

  describe('[ID: 30] - Verificar se o saldo na carteira é suficiente para a assinatura', () => {

    test('Teste para verificar erro de saldo insuficiente para a assinatura Deluxe', async () => {
      const mockWallet = { balance: 20 };

      // Mock para WalletModel
      WalletModel.findOne = jest.fn().mockResolvedValue(mockWallet);

      req.body = { UserId: '1', paymentMode: 'wallet' };

      // Chama a função de upgrade
      const component = upgradeToDeluxe();
      await component(req, res, next);

      const result = await response;
      expect(res.status).toHaveBeenCalledWith(400);
      expect(result).toHaveProperty('status', 'error');
      expect(result.error).toBe('Insuffienct funds in Wallet');
    });
  });
});
});
