import db from "../Models/index.js";
const User = db.Users;
const Files = db.Files;
const NannyProfiles = db.Nanny_Profiles;
const user_language = db.User_Language;
const NannyChildWorkPreference = db.NannyChildWorkPreference;
const NannyChildAgeExperience = db.Nanny_Child_Age_Experience;

import bcrypt from "bcrypt";
import multer from "multer";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";
import path from "path"; // Certifique-se de importar o módulo path


const upload = multer({ dest: "uploads/" }); // Define o diretório de destino para o arquivo

const createUser = async (req, res) => {

  console.log("Entrei")

  try {
    // Verifica se o email ou ID já existe
    const { email, id_number, first_name, last_name, country_name, province_name } = req.body;

    if (!email || !id_number) {
      return res.status(400).json({ message: "Email, ID e senha são obrigatórios." });
    }

    const existingUser = await User.findOne({ where: { email } });
    const existingIdNumber = await User.findOne({ where: { id_number } });

    if (existingUser) {
      return res.status(400).json({ message: "O email já está em uso." });
    }

    if (existingIdNumber) {
      return res.status(400).json({ message: "O ID já está em uso." });
    }

    // Preparação dos dados do usuário
    const userData = {
      email,
      password_hash: await bcrypt.hash(id_number, 10), // Hash da senha recebida
      role: 'client', // Padrão ou conforme enviado
      first_name,
      last_name,
      id_number,
      country_name,
      province_name,
    };

    const user = await User.create(userData);

    // Salvar o arquivo, se enviado
    if (req.file) {
      const fileData = {
        user_id: user.user_id,
        file_name: req.file.originalname, // Nome original do arquivo
        file_path: req.file.path, // Caminho do arquivo salvo
        file_type: req.file.mimetype, // Tipo MIME do arquivo
      };

      await Files.create(fileData);
    }

    res.status(201).json({
      message: "Usuário criado com sucesso!",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: {
        model: Files, // Modelo relacionado
        as: "files", // Alias definido na associação
        attributes: ["file_id", "file_name", "file_path", "file_type"], // Atributos que você deseja retornar
        where: {
          file_type: "application/pdf", // Filtra apenas arquivos do tipo PDF
        },
        required: false, // Garante que usuários sem arquivos ainda sejam retornados
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  //console.log("Request params:", req.params);

  try {
    const userId = req.params.user_id;

    if (!userId) {
      console.error("User ID not provided.");
      return res.status(400).json({ error: "Missing user_id parameter" });
    }

   // console.log("Fetching user with ID:", userId);

    // Primeiro, buscar o usuário
    const user = await User.findByPk(userId);

    if (!user) {
      console.warn("No user found for ID:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    // Buscar o perfil de babá (nannyProfile)
    const nannyProfile = await NannyProfiles.findOne({
      where: { user_id: userId }, // Certifique-se de que a chave correta está sendo usada para a associação
      include: [
        {
          model: NannyChildWorkPreference,
          as: "workPreferences", // Preferências de trabalho
          attributes: ["id_nanny", "work_preference"],
        },
      ],
    });

    if (!nannyProfile) {
      console.warn("No nanny profile found for user ID:", userId);
      return res.status(404).json({ error: "Nanny profile not found" });
    }

    // Agora, buscar as experiências de idade associadas ao mesmo user_id diretamente
    const ageExperiences = await NannyChildAgeExperience.findAll({
      where: { nanny_id: userId }, // Ajuste a chave estrangeira se necessário
      attributes: ["nanny_id", "age_group"],
    });

    // Buscar as línguas associadas ao usuário na tabela User_Language
    const languages = await db.User_Language.findAll({
      where: { user_id: userId },
      attributes: ["language"],
    });

    // Preparar a resposta com todos os dados
    const userResponse = {
      ...user.toJSON(),
      nannyProfile: nannyProfile ? nannyProfile.toJSON() : {},
      ageExperiences: ageExperiences.map((exp) => exp.age_group), // Ajuste conforme o que você precisa retornar
      languages: languages.map((lang) => lang.language),
    };

    // console.log(
    //   "User fetched successfully:",
    //   JSON.stringify(userResponse, null, 2)
    // );
    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error fetching user and nanny profile:", error);
    return res.status(500).json({
      error: "An error occurred while fetching the user",
      details: error.message,
    });
  }
};

const getAllNannyWithRequirement = async (req, res) => {
  try {
    const { province, jobType } = req.body; // Alterando de req.query para req.body

    // Validar os parâmetros
    if (!province || !jobType) {
      return res.status(400).json({
        error: "Missing required parameters: province and jobType",
      });
    }

    console.log(
      "Fetching users with province:",
      province,
      "and jobType:",
      jobType
    );

    // Buscar os usuários com seus perfis e arquivos associados
    const users = await User.findAll({
      where: {
        province_name: province,
        background_check_status: "approved",
      },
      include: [
        {
          model: NannyProfiles,
          as: "nannyProfile",
          where: { job_type: jobType },
          include: [
            {
              model: NannyChildWorkPreference,
              as: "workPreferences",
              attributes: ["id_nanny", "work_preference"],
            },
          ],
        },
        {
          model: Files,
          as: "files",
          where: {
            file_type: [
              "image/png",
              "image/jpeg",
              "image/jpg",
              "image/webp",
              "image/gif",
            ],
          },
          attributes: ["file_path", "file_type"], // Inclua apenas os atributos necessários
        },
      ],
    });

    // Verificar se há resultados
    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    // Montar a resposta com os dados dos usuários
    const userResponses = [];

    for (const user of users) {
      // Consulta direta para buscar as linguagens associadas a cada nanny_id
      const languages = await user_language.findAll({
        where: { user_id: user.nannyProfile.user_id }, // Considerando que `nannyProfile.id` é o identificador correto
        attributes: ["language"],
      });

      userResponses.push({
        user_id: user.user_id,
        first_name: user.first_name,
        email: user.email,
        country: user.country_name,
        province: user.province_name,
        dob: user.dob,
        nannyProfile: user.nannyProfile
          ? {
              education_level: user.nannyProfile.education_level,
              dob: user.nannyProfile.date_of_birth,
              job_type: user.nannyProfile.job_type,
              currency: user.nannyProfile.currency,
              daily_salary: user.nannyProfile.daily_salary,
              monthly_salary: user.nannyProfile.mounthly_Salary,
            }
          : null,
        files: user.files.map((file) => ({
          path: file.file_path,
        })),
        languages: languages.map((lang) => lang.language), // Adiciona as linguagens encontradas
      });
    }

    res.status(200).json(userResponses);
  } catch (error) {
    console.error("Error fetching users with files:", error);
    res.status(500).json({
      error: "An error occurred while fetching users",
      details: error.message,
    });
  }
};


const updateUser = async (req, res) => {
  try {
    const [updated] = await User.update(req.body, {
      where: { user_id: req.params.user_id },
    });
    if (updated) {
      const updatedUser = await User.findByPk(req.params.user_id);
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const deleted = await User.destroy({
      where: { user_id: req.params.user_id },
    });
    if (deleted) {
      res.status(204).json({ message: "User deleted" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createNannyUser = async (req, res) => {

  try {
    // Verifica se o email ou ID já existe
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });
    const existingIdNumber = req.body.idNumber
      ? await User.findOne({ where: { id_number: req.body.idNumber } })
      : null;

    if (existingUser) {
      return res.status(400).json({ message: "O email já está em uso." });
    }

    if (existingIdNumber) {
      return res.status(400).json({ message: "O ID já está em uso." });
    }
    const rolee = "nanny";

    const hashedPassword = await bcrypt.hash(req.body.idNumber, 10);
    // Criação do usuário
    const userData = {
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      country_name: req.body.country,
      province_name: req.body.province,
      id_number: req.body.idNumber,
      password_hash: hashedPassword,
      role: rolee,
    };

    const user = await User.create(userData);

    // Salvar o arquivo na tabela Files se existir
    if (req.files && req.files.idCopy && req.files.idCopy[0]) {
      const file = req.files.idCopy[0]; // Obtém o primeiro arquivo do array

      const fileData = {
        user_id: user.user_id,
        file_name: file.originalname, // Nome original do arquivo
        file_path: file.path.trim().replace(/\s+/g, "-"),
        file_type: file.mimetype, // Tipo MIME do arquivo
      };

      await Files.create(fileData);
    } else {
      console.log("Arquivo não encontrado.");
    }
    // Criar o perfil de nanny associado ao usuário
    const nannyProfileData = {
      user_id: user.user_id,
      education_level: req.body.education_level,
      date_of_birth: req.body.date_of_birth,
    };

    await NannyProfiles.create(nannyProfileData);

    res.status(201).json({
      message: "Usuário e perfil de nanny criados com sucesso!",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca o usuário pelo email
    const user = await User.findOne({ where: { email } });
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
        role: user.role,
        country: user.country_name,
        province: user.province_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: 3600 }
    );

    res.status(200).json({
      message: "Login bem-sucedido",
      token,
      user: {
        id: user.user_id,
        email: user.email,
        role: user.role,
        country: user.country_name,
        province: user.province_name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const updatedProfile = async (req, res) => {
  try {
    // Verifica se um arquivo foi enviado
    if (req.file) {
      // Dados do arquivo a serem salvos
      const fileData = {
        user_id: req.params.id_user,  // Usando o id do usuário
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_type: req.file.mimetype,
      };

      // Criação do arquivo na base de dados
      await Files.create(fileData);
    } else {
      console.log("Nenhum arquivo enviado.");
    }

    // Atualizar o perfil com os dados fornecidos, se existirem
    const updatedProfileData = {};

    // Atualiza apenas os campos que não estão vazios
    if (req.body.jobType) {
      updatedProfileData.job_type = req.body.jobType;
    }
    if (req.body.experience) {
      updatedProfileData.experience_years = req.body.experience;
    }
    if (req.body.policeClearance) {
      updatedProfileData.has_criminal_record = req.body.policeClearance;
    }
    if (req.body.additionalInfo) {
      updatedProfileData.additional_info = req.body.additionalInfo;
    }

    // Atualiza o perfil se houver dados
    if (Object.keys(updatedProfileData).length > 0) {
      const updated = await NannyProfiles.update(updatedProfileData, {
        where: { nanny_id: req.params.id_user },
      });

      if (updated[0] === 0) {
        return res.status(404).json({ message: "Perfil não encontrado" });
      }
    }

    // Atualiza as línguas, caso haja
    if (req.body.languages) {
      const languages = JSON.parse(req.body.languages);
      for (const language of languages) {
        await user_language.create({
          user_id: req.params.id_user,
          language: language,
        });
      }
    }

    // Atualiza as preferências de trabalho, caso haja
    if (req.body.work_preference) {
      const workPreferences = JSON.parse(req.body.work_preference);
      for (const workPreference of workPreferences) {
        await NannyChildWorkPreference.create({
          nanny_id: req.params.id_user,
          work_preference: workPreference,
        });
      }
    }

    // Atualiza as preferências de idade, caso haja
    if (req.body.preference_age) {
      const agePreferences = JSON.parse(req.body.preference_age);
      for (const age of agePreferences) {
        await NannyChildAgeExperience.create({
          nanny_id: req.params.id_user,
          age_group: age,
        });
      }
    }

    return res.status(200).json({
      message: "Arquivo e dados do perfil (se presentes) salvos com sucesso!",
    });
  } catch (error) {
    console.error("Erro ao criar o arquivo e salvar dados:", error);
    return res.status(500).json({ error: error.message });
  }
};



const changePassword = async (req, res) => {
  try {
    console.log(req.body);
    // Buscar usuário pelo email
    const existingUser = await User.findOne({
      where: { email: req.body.email },
    });

    if (existingUser) {
      // Verificar se a senha atual fornecida corresponde à senha armazenada
      const isMatch = await bcrypt.compare(
        req.body.currentPassword,
        existingUser.password_hash
      );

      if (isMatch) {
        // Hash da nova senha
        const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);

        // Atualizar o perfil do usuário com a nova senha
        const updatedProfileData = {
          password_hash: hashedNewPassword,
        };

        // Atualizar a senha no banco de dados
        await User.update(updatedProfileData, {
          where: { email: req.body.email },
        });

        // Retornar sucesso
        return res
          .status(200)
          .json({ message: "Password updated successfully" });
      } else {
        // Senha atual não corresponde
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
    } else {
      // Usuário não encontrado
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return res
      .status(500)
      .json({ message: "An error occurred, please try again later", error });
  }
};

const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.params.user_id;

    // Verifica se o arquivo foi enviado
    if (!req.file) {
      console.error("Nenhum arquivo encontrado no request.");
      return res.status(400).json({ message: "Nenhuma foto foi enviada." });
    }

    console.log("Arquivo recebido:", req.file);

    // Garante que o diretório de uploads exista
    const uploadDirectory = "uploads";
    if (!fs.existsSync(uploadDirectory)) {
      fs.mkdirSync(uploadDirectory);
    }

    // Lista de tipos de arquivos aceitos (conforme definido no middleware uploadPic)
    const acceptedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];

    // Verifica se o arquivo é de um tipo aceito
    if (!acceptedTypes.includes(req.file.mimetype)) {
      console.error("Tipo de arquivo não permitido:", req.file.mimetype);
      return res
        .status(400)
        .json({ message: "Tipo de arquivo não permitido." });
    }

    // Verifica se o usuário já possui um arquivo correspondente
    const existingFile = await Files.findOne({
      where: {
        user_id: userId,
        file_type: {
          [db.Sequelize.Op.in]: acceptedTypes, // Verifica se o tipo do arquivo está entre os aceitos
        },
      },
    });

    // Configura o novo arquivo
    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(uploadDirectory, fileName);

    // Move o arquivo recebido para o diretório de uploads
    fs.renameSync(req.file.path, filePath);

    if (existingFile) {
      // Atualiza o registro existente
      const oldFilePath = existingFile.file_path;

      // Remove o arquivo antigo, se existir
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }

      // Atualiza o registro no banco de dados
      await existingFile.update({
        file_name: fileName,
        file_path: filePath,
        file_type: req.file.mimetype,
        upload_date: new Date(),
      });

      res.status(200).json({
        message: "Foto de perfil atualizada com sucesso!",
        profilePicture: filePath,
        file: existingFile,
      });
    } else {
      // Cria um novo registro
      const newFileRecord = await Files.create({
        user_id: userId,
        file_name: fileName,
        file_path: filePath,
        file_type: req.file.mimetype,
        upload_date: new Date(),
      });

      res.status(201).json({
        message: "Foto de perfil cadastrada com sucesso!",
        profilePicture: filePath,
        file: newFileRecord,
      });
    }
  } catch (error) {
    console.error("Erro ao atualizar ou criar foto de perfil:", error);
    res.status(500).json({
      message: "Erro ao atualizar ou criar foto de perfil.",
      error: error.message,
    });
  }
};

export const getUserProfilePicture = async (req, res) => {
  try {
    const userId = req.params.user_id; // ID do usuário enviado na URL

    if (!userId) {
      return res.status(400).json({ message: "ID do usuário não fornecido." });
    }

    // Busca a imagem mais recente associada ao usuário
    const userFile = await Files.findOne({
      where: { user_id: userId },
      order: [["upload_date", "DESC"]], // Ordenar pela data de upload mais recente
    });

    if (!userFile) {
      return res.status(404).json({
        message: "Nenhuma foto de perfil encontrada para este usuário.",
      });
    }

    // Retorna as informações do arquivo
    res.status(200).json({
      message: "Foto de perfil encontrada.",
      file: {
        fileName: userFile.file_name,
        filePath: userFile.file_path,
        fileType: userFile.file_type,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar foto de perfil:", error);
    res.status(500).json({
      message: "Erro ao buscar foto de perfil.",
      error: error.message,
    });
  }
};

const changeStatus = async (req, res) => {
  const { user_id, status } = req.body;

  // Validação do status
  const allowedStatuses = ['approved', 'pending', 'rejected'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Status inválido. Use "approved", "pending" ou "rejected".' });
  }

  try {
    // Busca o usuário no banco de dados
    const user = await User.findOne({ where: { user_id } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    user.background_check_status = status;
    await user.save(); // Salva no banco de dados

    res.status(200).json({ message: 'Status atualizado com sucesso!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar o status.' });
  }
};

const saveLocation = async (req, res) => {
  console.log(req.body)
  try {
    // Busca o usuário no banco de dados
    const user = await User.findOne({ where:{ user_id: req.params.id_user }  });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    user.country_name = req.body.country;
    user.province_name = req.body.province
    await user.save(); // Salva no banco de dados

    res.status(200).json({ message: 'Location atualizado com sucesso!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar o status.' });
  }
};

const savePhone = async (req, res) => {
  console.log(req.body);
  try {
    // Busca o usuário no banco de dados
    const user = await User.findOne({ where: { user_id: req.params.id_user } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    user.contact_phone = req.body.phone;
    await user.save(); // Salva no banco de dados

    res.status(200).json({ message: 'Telefone atualizado com sucesso!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar o telefone.' });
  }
};


export default {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  createNannyUser,
  loginUser,
  updatedProfile,
  changePassword,
  uploadProfilePicture,
  getUserProfilePicture,
  getAllNannyWithRequirement,
  changeStatus,
  saveLocation,
  savePhone
};
