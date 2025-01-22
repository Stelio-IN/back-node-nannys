import multer from 'multer';  // Use import em vez de require
import path from 'path';

// Configuração do armazenamento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pasta onde os arquivos serão salvos
  },
  filename: function (req, file, cb) {
    // Remover espaços e gerar o nome do arquivo
    const cleanName = file.originalname.trim().replace(/\s+/g, '-'); // Substitui espaços por hífen
    cb(null, `${Date.now()}-${cleanName}`); // Nome do arquivo com timestamp
  },
});

// Filtragem de tipos de arquivos (opcional)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf']; // Apenas PDF neste exemplo
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não permitido'), false);
  }
  cb(null, true); // Permitir o arquivo
};

// Inicializar multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de tamanho de arquivo (10 MB)
});

export default upload;
