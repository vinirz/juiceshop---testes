const retrieveLoggedInUser = require('../../routes/currentUser');
const login = require('../../routes/login');
const security = require('../../lib/insecurity');
const jwt = require('jsonwebtoken');

let req, res, next;
let response;

beforeEach(() => {
  req = { body: {}, cookies: { token: '' }, query: { callback: undefined } };
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

describe('Módulo "Usuário Autenticado"', () => {
  describe('[ID: 13] - Recuperação de informações do usuário autenticado', () => {
    test('Teste unitário para o método verify - Usuário autenticado', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      const result = security.verify(user.authentication.token)
      expect(result).toBe(true)
    })
    
    test('Teste unitário para o método `authenticatedUsers.get` - Usuário autenticado', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      const result = security.authenticatedUsers.get(user.authentication.token)
      expect(result.status).toBe('success')
    })

    test('Teste para a funcionalidade currentUser - Fluxo normal', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      req.cookies.token = user.authentication.token;

      const component = retrieveLoggedInUser()
      await component(req, res, next);

      const result = await response;

      const requiredFields = ['id', 'email', 'lastLoginIp', 'profileImage']
      requiredFields.forEach(field => {
        expect(result.user).toHaveProperty(field)
      })
    })
  })
  
  describe('[ID: 14] - Recuperação de informações do usuário autenticado sem token válido', () => {
    test('Teste unitário para o método verify - Usuário não autenticado', async () => {
      const result = security.verify(security.authorize() + 'INVALID_TOKEN')
      expect(result).toBe(false)
    })
    
    test('Teste unitário para o método `authenticatedUsers.get` - Usuário não autenticado', async () => {
      const result = security.authenticatedUsers.get(security.authorize() + 'INVALID_TOKEN')
      expect(result).toBeUndefined()
    })

    test('Teste para a funcionalidade currentUser - Fluxo de erro', async () => {
      req.cookies.token = security.authorize() + 'INVALID_TOKEN';

      const component = retrieveLoggedInUser();
      await component(req, res, next);

      const result = await response;
      const requiredFields = ['id', 'email', 'lastLoginIp', 'profileImage']
      requiredFields.forEach(field => {
        expect(result.user).toHaveProperty(field, undefined)
      })
    })
  })
  
  describe('[ID: 15] - Recuperação de informações do usuário autenticado com token manipulado', () => {
    test('Teste unitário para o método verify - Token manipulado', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })

      let userInformations = jwt.decode(user.authentication.token)
      userInformations.username = 'MODIFIED_USERNAME'

      const manipulatedToken = jwt.sign(userInformations, 'secret', { algorithm: 'HS256' })

      const result = security.verify(manipulatedToken)
      expect(result).toBe(false)
    })
    
    test('Teste unitário para o método `authenticatedUsers.get` - Token manipulado', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })
      
      let userInformations = jwt.decode(user.authentication.token)
      userInformations.username = 'MODIFIED_USERNAME'

      const manipulatedToken = jwt.sign(userInformations, 'secret', { algorithm: 'HS256' })
      
      const result = security.authenticatedUsers.get(manipulatedToken)
      expect(result).toBeUndefined()
    })

    test('Teste para a funcionalidade currentUser - Fluxo de erro', async () => {
      const user = await doLogin({
        "email": "admin@juice-sh.op",
        "password": "admin123"
      })
      
      let userInformations = jwt.decode(user.authentication.token)
      userInformations.username = 'MODIFIED_USERNAME'

      const manipulatedToken = jwt.sign(userInformations, 'secret', { algorithm: 'HS256' })

      req.cookies.token = manipulatedToken

      const component = retrieveLoggedInUser();
      await component(req, res, next);

      const result = await response;

      const requiredFields = ['id', 'email', 'lastLoginIp', 'profileImage']
      requiredFields.forEach(field => {
        expect(result.user).toHaveProperty(field, undefined)
      })
    })
  })
})
