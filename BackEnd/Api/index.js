const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const multer = require('multer');
const bcrypt = require('bcrypt');

// Criação do servidor Express
const app = express();
const port = 5000;

// Middleware para analisar os dados do corpo da requisição
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração de conexão com o banco de dados MySQL
const db = mysql.createConnection({
  host: 'localhost', // ou o host do seu banco de dados
  user: 'root',      // seu usuário
  password: '', // sua senha
  database: 'nannyexpress' // seu banco de dados
});

// Conectar ao banco de dados
db.connect(err => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados');
});

// Configuração do armazenamento com multer (para fazer upload de arquivos, como cópia de ID)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Pasta onde os arquivos serão salvos
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nome único para o arquivo
  }
});

const upload = multer({ storage: storage });

// Rota para registrar o usuário e o perfil da babá
app.post('/register-nanny', upload.single('idCopy'), async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    contactPhone,
    provinceId,
    idNumber,
    educationLevel,
    jobType,
    experienceYears,
    hasCriminalRecord,
    specialNeedsExperience,
    languagesSpoken,
    additionalLanguages,
    additionalInfo
  } = req.body;

  // Validar campos obrigatórios
  if (!email || !password || !firstName || !lastName || !contactPhone || !provinceId) {
    return res.status(400).send('Campos obrigatórios não preenchidos');
  }

  // Criptografar a senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // Caminho do arquivo de cópia de ID
  const idCopy = req.file ? req.file.path : '';

  // Inserir dados na tabela Users
  const query = `
    INSERT INTO Users 
    (email, password_hash, role, first_name, last_name, contact_phone, province_id, id_number, id_copy_file_path, created_at)
    VALUES (?, ?, 'nanny', ?, ?, ?, ?, ?, ?, NOW())`;

  const values = [
    email,
    hashedPassword,
    firstName,
    lastName,
    contactPhone,
    provinceId,
    idNumber,
    idCopy
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados na tabela Users:', err);
      return res.status(500).send('Erro ao registrar o usuário');
    }

    // Obter o ID do usuário recém-criado
    const userId = result.insertId;

    // Inserir dados do perfil da babá na tabela Nanny_Profiles
    const nannyProfileQuery = `
      INSERT INTO Nanny_Profiles 
      (user_id, education_level, job_type, experience_years, has_criminal_record, special_needs_experience, languages_spoken, additional_languages, additional_info)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const nannyProfileValues = [
      userId,
      educationLevel,
      jobType,
      experienceYears,
      hasCriminalRecord,
      specialNeedsExperience,
      JSON.stringify(languagesSpoken), // Linguagens faladas em formato JSON
      additionalLanguages,
      additionalInfo
    ];

    db.query(nannyProfileQuery, nannyProfileValues, (err) => {
      if (err) {
        console.error('Erro ao inserir dados na tabela Nanny_Profiles:', err);
        return res.status(500).send('Erro ao registrar o perfil da babá');
      }

      res.status(200).send('Registro de babá realizado com sucesso');
    });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
