// Importa a função retrieveLoggedInUser  e as dependências necessárias
const retrieveLoggedInUser  = require('../../routes/currentUser');
const security = require('../../lib/insecurity');

let req, res, next;
let response, error;

// Configuração inicial antes de cada teste
beforeEach(() => {
  req = { cookies: {}, query: {} }; // Adicionando query como um objeto vazio
  res = { status: jest.fn().mockReturnThis(), send: jest.fn((data) => console.log('Erro:', data)) };

  // Simulação de authenticatedUsers como um Map
  security.authenticatedUsers = new Map();

  // Promessas para capturar as respostas e os erros
  response = new Promise(resolve => {
    res.json = jest.fn((data) => resolve(data));
  });

  error = new Promise(resolve => {
    next = jest.fn((data) => resolve(data));
  });
});

describe('Testes para o módulo “Usuário Autenticado”', () => {
  
  // Casos de Sucesso
  describe('Casos de Sucesso', () => {
    test('[ID 13] - Teste unitário para recuperar informações do usuário autenticado com token válido', async () => {
      const validToken = 'valid-token';
      const userData = {
        id: 1,
        email: 'test@example.com',
        lastLoginIp: '127.0.0.1',
        profileImage: 'image.png'
      };
      
      // Mock da verificação do token e armazenamento de dados do usuário autenticado
      security.verify = jest.fn().mockReturnValue(true);
      security.authenticatedUsers.set(validToken, { data: userData });
      
      req.cookies.token = validToken;

      // Executa a função de recuperação do usuário
      const component = retrieveLoggedInUser ();
      await component(req, res, next);
      
      // Verifica se a resposta contém as informações do usuário
      const result = await response;
      expect(result).toEqual({
        user: {
          id: userData.id,
          email: userData.email,
          lastLoginIp: userData.lastLoginIp,
          profileImage: userData.profileImage
        }
      });
    });
  });

  // Casos de Erro
  describe('Casos de Erro', () => {
    test('[ID 14] - Teste unitário para bloquear recuperação de informações sem token', async () => {
      // Sim ula a ausência de token e falha na verificação
      security.verify = jest.fn().mockReturnValue(false);
      req.cookies.token = undefined;

      // Executa a função de recuperação do usuário
      const component = retrieveLoggedInUser ();
      await component(req, res, next);

      // Verifica se o usuário está indefinido
      const result = await response;
      expect(result).toEqual({
        user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined }
      });
    });

    test('[ID 15] - Teste unitário para bloquear recuperação de informações com token manipulado', async () => {
      const manipulatedToken = 'manipulated-token';

      // Mock da verificação com token manipulado, lançando um erro
      security.verify = jest.fn().mockImplementation(() => {
        throw new Error('Token inválido');
      });

      req.cookies.token = manipulatedToken;

      // Executa a função de recuperação do usuário
      const component = retrieveLoggedInUser ();
      await component(req, res, next);

      // Verifica se a resposta ao token inválido mantém os dados do usuário indefinidos
      const result = await response;
      expect(result).toEqual({
        user: { id: undefined, email: undefined, lastLoginIp: undefined, profileImage: undefined }
      });
    });
  });
});