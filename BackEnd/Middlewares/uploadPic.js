import multer from 'multer';  // Use import em vez de require
import path from 'path';

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pasta onde os arquivos serão salvos
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // Nome do arquivo
  },
});

// Filtragem de tipos de arquivos para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Somente imagens (JPEG, PNG, GIF, WebP) são permitidas.'), false);
  }
  cb(null, true); // Permitir o arquivo
};

// Inicializar multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limite de tamanho de arquivo (5 MB para imagens)
});

export default upload;
