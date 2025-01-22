import db from "../Models/index.js";
import multer from "multer";
import path from "path";
import { Sequelize } from 'sequelize';
const { Op } = Sequelize;

// Configuração do Multer para o upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Diretório onde os arquivos serão armazenados
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Somente arquivos PDF são permitidos.'));
    }
    if (file.size > 1 * 1024 * 1024) { // Limite de 1MB
      return cb(new Error('O arquivo deve ter no máximo 5MB.'));
    }
    cb(null, true);
  }
});

const countUsers = async () => {
  try {
    const users = await db.Users.findAll({
      where: {
        background_check_status: {
          [Sequelize.Op.in]: ['pending', 'approved'] // Inclui 'pending' e 'approved'
        }
      },
      raw: true // Retorna um resultado mais direto
    });

    const counts = {
      nannies: 0,
      clients: 0
    };

    users.forEach(user => {
      if (user.role === 'nanny') {
        counts.nannies += 1;
      } else if (user.role === 'client') {
        counts.clients += 1;
      }
    });

    console.log('Contagem final:', counts); // Log da contagem final

    return counts; // Retorna explicitamente o objeto counts

  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    throw error;
  }
};


// Função para criar um cliente e fazer o upload do arquivo
const createClientWithFile = async (req, res) => {
  try {
    // Upload do arquivo
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      // Verificar se o email ou ID já está em uso
      const existingUser = await db.Users.findOne({ where: { email: req.body.email } });
      const existingPassport = await db.Users.findOne({ where: { id_number: req.body.id_number } });
      if (existingUser) {
        return res.status(400).json({ message: "Email já está em uso." });
      }

      if (existingPassport) {
        return res.status(400).json({ message: "ID já está em uso." });
      }

      // Criar o novo cliente
      const clientData = {
        ...req.body,
        role: "client" // Garantir que o papel seja sempre "client"
      };

      const client = await db.Users.create(clientData);

      // Salvar o arquivo na tabela Files
      const fileData = {
        user_id: client.user_id,
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_type: req.file.mimetype
      };
      await db.Files.create(fileData);

      res.status(201).json({ message: 'Cliente registrado com sucesso!', client });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Função para obter todos os clientes
const getAllClients = async (req, res) => {
  try {
    const clients = await db.Users.findAll({ where: { role: "client" } });
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Função para obter um cliente por ID
const getClientById = async (req, res) => {
  try {
    const client = await db.Users.findOne({ where: { user_id: req.params.id, role: "client" } });
    if (client) {
      res.status(200).json(client);
    } else {
      res.status(404).json({ message: "Cliente não encontrado." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Função para atualizar um cliente
const updateClient = async (req, res) => {
  try {
    const [updated] = await db.Users.update(req.body, {
      where: { user_id: req.params.id, role: "client" }
    });

    if (updated) {
      const updatedClient = await db.Users.findOne({ where: { user_id: req.params.id } });
      res.status(200).json(updatedClient);
    } else {
      res.status(404).json({ message: "Cliente não encontrado." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Função para excluir um cliente
const deleteClient = async (req, res) => {
  try {
    const deleted = await db.Users.destroy({
      where: { user_id: req.params.id, role: "client" }
    });

    if (deleted) {
      res.status(204).json({ message: "Cliente excluído." });
    } else {
      res.status(404).json({ message: "Cliente não encontrado." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createClientWithFile,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  countUsers
};
