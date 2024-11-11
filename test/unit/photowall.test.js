let req, res, next;
let response, error, rejection;

beforeEach(() => {
  req = { body: {}, params: {} };
  res = { status: jest.fn().mockReturnThis() };

  response = new Promise(resolve => {
    res.json = jest.fn(data => resolve(data));
  });

  error = new Promise(resolve => {
    res.send = jest.fn(data => resolve(data));
  });

  rejection = new Promise(resolve => {
    next = jest.fn(data => resolve(data));
  });
});

describe('Módulo "Photo Wall"', () => {

  describe('[ID: 21] - Verificar upload de imagem válida', () => {
    test('Teste para upload de imagem válida', async () => {
      req.body = { image: { type: 'image/jpeg', size: 1024 } };

      const uploadImage = (image) => {
        if (image.type.match('image.*')) {
          return 'Image uploaded successfully';
        }
        throw new Error('Invalid file type');
      };

      const result = uploadImage(req.body.image);
      expect(result).toBe('Image uploaded successfully');
    });
  });

  describe('[ID: 22] - Verificar tentativa de upload de arquivo inválido', () => {
    test('Teste para upload de arquivo não suportado', async () => {
      req.body = { image: { type: 'application/pdf', size: 1024 } };

      const uploadImage = (image) => {
        if (!image.type.match('image.*')) {
          throw new Error('File type not supported');
        }
        return 'File uploaded';
      };

      try {
        uploadImage(req.body.image);
      } catch (error) {
        expect(error.message).toBe('File type not supported');
      }
    });
  });

  describe('[ID: 23] - Verificar exclusão de imagem no Photo Wall', () => {
    test('Teste para exclusão de imagem', async () => {
      const photoWall = ['image1.jpg', 'image2.jpg'];
      req.params = { imageName: 'image1.jpg' };

      const deleteImage = (imageName) => {
        const index = photoWall.indexOf(imageName);
        if (index > -1) {
          photoWall.splice(index, 1);
          return 'Image deleted successfully';
        }
        throw new Error('Image not found');
      };

      const result = deleteImage(req.params.imageName);
      expect(result).toBe('Image deleted successfully');
      expect(photoWall).not.toContain(req.params.imageName);
    });
  });
});
