const productReviews = require('../../routes/createProductReviews');
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

describe('Módulo "Review de produtos"', () => {
  describe('[ID: 01] - Verificar usuário válido', () => {
    test('Teste unitário para o método `authenticatedUsers.from` - Usuário válido', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      const result = security.authenticatedUsers.from(req)
      expect(result.status).toBe('success');
    });
    
    test('Teste para a funcionalidade createProductReviews - Fluxo normal', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      req.body = {
        id: 1,
        message: 'MESSAGE',
        author: 'admin'
      }

      const component = productReviews();
      await component(req, res, next);

      const result = await response
      
      expect(result.status).toBe('success');
    });
  })
  
  describe('[ID: 02] - Verificar usuário inválido', () => {
    test('Teste unitário para o método `authenticatedUsers.from` - Usuário inválido', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      req.headers = {
        authorization: `Bearer ${user.authentication.token + 'INVALID_TOKEN'}`
      }

      const result = security.authenticatedUsers.from(req)
      expect(result).toBeUndefined()
    });
    
    test('Teste para a funcionalidade createProductReviews - Fluxo de erro - Usuário diferente do autor', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      req.headers = {
        authorization: `Bearer ${user.authentication.token}`
      }

      req.body = {
        id: 1,
        message: 'MESSAGE',
        author: 'randomUser'
      }

      const component = productReviews();
      await component(req, res, next);

      const result = await response

      expect(result).toBeNaN();
    });
  })
  
  describe('[ID: 03] - Verificar usuário cadastrado', () => {
    test('Teste unitário para o método `authenticatedUsers.from` - Usuário não cadastrado', async () => {
      req.headers = {
        authorization: `Bearer ${security.authorize('NOT_REGISTERED')}`
      }

      const result = security.authenticatedUsers.from(req)
      expect(result).toBeUndefined()
    });
    
    test('Teste para a funcionalidade createProductReviews - Fluxo de erro - Usuário nao cadastrado', async () => {
      req.body = {
        id: 1,
        message: 'MESSAGE',
        author: 'notRegisteredUser'
      }

      const component = productReviews();
      await component(req, res, next);

      const result = await response

      expect(result).toBeNaN();
    });
  })
})
