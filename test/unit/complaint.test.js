const ComplaintComponent = require('../../frontend/src/app/complaint/complaint.component'); 
const security = require('../../lib/insecurity');
const login = require('../../routes/login');

let req, res, next;
let response;

beforeEach(() => {
  req = { params: {}, headers: {} };
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

async function doLogin({ email, password }) {
  req.body = {
    email,
    password
  };

  const doLogin = login();
  await doLogin(req, res, next);

  const user = await response;

  response = new Promise(resolve => {
    res.json = jest.fn((data) => resolve(data));
  });

  return user;
}

describe('Módulo de Reclamações', () => {
  describe('[ID: 24] - Verificar envio de reclamação válida', () => {
    test('Teste que valida se um usuário consegue enviar uma reclamação válida', async () => {
      const user = await doLogin({
        "email": "usuario@exemplo.com",
        "password": "senha123"
      });

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      };

      req.body = {
        customer: 'usuario@exemplo.com',
        message: 'Produto chegou com defeito.',
        file: 'null'
      };

      const component = new ComplaintComponent();
      await component.ngOnInit();

      const result = await response;
      
      expect(result.status).toBe('success');
      expect(result.message).toBe('Reclamação enviada com sucesso');
    });
  });

  describe('[ID: 25] - Verificar envio de reclamação sem texto.', () => {
    test('Deve bloquear o envio de uma reclamação se o campo de descrição estiver vazio', async () => {
      const user = await doLogin({
        "email": "usuario@exemplo.com",
        "password": "senha123"
      });

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      };

      req.body = {
        customer: 'usuario@exemplo.com',
        message: '',
        file: 'null'
      };

      const component = new ComplaintComponent();
      await component.ngOnInit();

      const result = await response;
      
      expect(result.status).toBe('error');
      expect(result.message).toBe('A descrição da reclamação não pode estar vazia');
    });
  });

  describe('[ID: 26] - Verificar reclamação sem arquivo selecionado', () => {
    test('Deve permitir que o usuário envie uma reclamação sem anexar um arquivo', async () => {
      const user = await doLogin({
        "email": "usuario@exemplo.com",
        "password": "senha123"
      });

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      };

      req.body = {
        customer: 'usuario@exemplo.com',
        message: 'Problema com o produto',
        file: null 
      };

      const component = new ComplaintComponent();
      await component.ngOnInit();

      const result = await response;

      expect(result.status).toBe('success');
      expect(result.message).toBe('Reclamação enviada com sucesso');
    });
  });
});
