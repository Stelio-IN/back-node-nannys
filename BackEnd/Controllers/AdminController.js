import db from "../Models/index.js";
const Admin = db.Admin;

// Importando as bibliotecas necessárias
import bcrypt from "bcrypt";
import axios from 'axios';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const generateRandomPassword = () => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const initializeAdmin = async () => {
  try {
    const adminCount = await Admin.count(); 
    if (adminCount === 0) {
      // Gera uma senha aleatória de 8 caracteres
      const randomPassword = generateRandomPassword();

      // Cria o administrador padrão
      const defaultAdmin = {
        email: "Admin@gmail.com",  // E-mail do administrador
        password_hash: "",         // A senha será armazenada como 'password_hash'
      };

      // Hash da senha para maior segurança
      defaultAdmin.password_hash = await bcrypt.hash(randomPassword, 10); // Hasheia a senha

      // Cria o administrador no banco de dados
      await Admin.create(defaultAdmin);

      // Dados para enviar o e-mail
      const emailData = {
        name: "Admin",               // Nome do administrador (aqui você pode ajustar conforme necessário)
        email: defaultAdmin.email,   // E-mail do administrador
        subject: 'Admin Account Created', // Assunto do e-mail
        message: `Hello Admin,

Your account has been successfully created. Your initial password is: ${randomPassword}

Please change your password as soon as possible for security reasons.

Best regards,
NannyExpress`
      };

      // Enviar a solicitação POST para a rota /send-email
      try {
        await axios.post('http://localhost:3005/send-email', emailData);
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Error sending email: ', emailError);
      }

      console.log("Default admin created:", defaultAdmin.email);
    }
  } catch (error) {
    console.error("Error initializing admin:", error.message);
  }
};

// Adicione este método para ser chamado no início da aplicação
const createAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (admin) {
      res.status(200).json(admin);
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const email = req.params.email;

    // Encontrar o admin pelo email
    const admin = await Admin.findOne({ where: { email: email } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Verificar se a senha atual fornecida corresponde à senha registrada
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Criptografar a nova senha antes de salvar
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha no banco de dados
    const [updated] = await Admin.update(
      { password_hash: hashedNewPassword },
      { where: { email: email } }
    );

    if (updated) {
      // Retornar o admin atualizado (sem a senha)
      const updatedAdmin = await Admin.findOne({ where: { email: email }, attributes: { exclude: ['password_hash'] } });

      // Enviar o e-mail de notificação utilizando a sua rota
      const emailData = {
        name: updatedAdmin.name,         // Nome do administrador
        email: updatedAdmin.email,       // E-mail do administrador
        subject: 'Password updated successfully', // Assunto do e-mail
        message: `Hello ${updatedAdmin.email},

The password for your account with email ${updatedAdmin.email} has been updated successfully.
Your new password is ${newPassword}

If you did not make this change, please contact support immediately.

Best regards,
NannyExpress`
      };

      // Enviar a solicitação POST para a rota /send-email
      try {
        await axios.post('http://localhost:3005/send-email', emailData);
        console.log('Email sent successfully');
      } catch (emailError) {
        console.error('Error sending email: ', emailError);
      }

      return res.status(200).json(updatedAdmin);
    } else {
      return res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: error.message });
  }
};


const deleteAdmin = async (req, res) => {
  try {
    const deleted = await Admin.destroy({
      where: { admin_id: req.params.id },
    });
    if (deleted) {
      res.status(204).json({ message: "Admin deleted" });
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const loginAdmin = async (req, res) => {

  const { email, password } = req.body;
  
    try {
      // Busca o usuário pelo email
      const user = await Admin.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
  
      // Verificar a senha fornecida com o hash armazenado no banco
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Senha incorreta" });
      }
  
      dotenv.config();
      // Gerar um token JWT para o usuário
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: 'admin',
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );
  
      res.status(200).json({
        message: "Login bem-sucedido",
        token,
        user: {
          id: user.user_id,
          role: 'admin',
        },
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }

}

export default {
  initializeAdmin, // Exporta a função de inicialização
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  loginAdmin
};
