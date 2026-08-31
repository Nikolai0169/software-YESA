/**
 * Verifica que el controlador rechaza emails inválidos sin lanzar errores internos.
 */

jest.mock('../models/Usuario', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn(),
  scope: jest.fn(() => ({
    findOne: jest.fn()
  }))
}));

jest.mock('../config/jwt', () => ({
  generateToken: jest.fn(() => 'mock-token')
}));

const { register } = require('../controllers/auth.controller');
const Usuario = require('../models/Usuario');

describe('auth validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe rechazar un email inválido en el registro', async () => {
    const req = {
      body: {
        nombre: 'Ana',
        apellido: 'García',
        email: 'correo-invalido',
        password: '123456'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Formato de email inválido'
    });
    expect(Usuario.create).not.toHaveBeenCalled();
  });
});
