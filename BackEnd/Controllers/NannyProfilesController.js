import { Op } from 'sequelize';
import db from "../Models/index.js";

const NannyProfiles = db.Nanny_Profiles;
const Files = db.Files;
const User = db.Users;

// Criar perfil de nanny
const createProfile = async (req, res) => {
  try {
    const profile = await NannyProfiles.create(req.body);
    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obter todos os perfis de nanny
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await NannyProfiles.findAll();
    res.status(200).json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Obter perfil de nanny por ID
const getProfileById = async (req, res) => {
  try {
    const profile = await NannyProfiles.findByPk(req.params.nanny_id);
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ message: "Nanny profile not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar perfil de nanny
const updateProfile = async (req, res) => {
  try {
    const [updated] = await NannyProfiles.update(req.body, {
      where: { nanny_id: req.params.nanny_id },
    });
    if (updated) {
      const updatedProfile = await NannyProfiles.findByPk(req.params.nanny_id);
      res.status(200).json(updatedProfile);
    } else {
      res.status(404).json({ message: "Nanny profile not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveBusiness = async (req, res) => {
  console.log(req.body);
  try {
    // Busca o perfil do usuário no banco de dados
    const user = await NannyProfiles.findOne({ where: { user_id: req.params.id_user } });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Atualiza somente os campos que foram enviados na requisição
    if (req.body.currency !== undefined) {
      user.currency = req.body.currency;
    }
    if (req.body.monthlySalary !== undefined) {
      user.mounthly_Salary = req.body.monthlySalary; // Mantendo typo para consistência com o modelo
    }
    if (req.body.dailySalary !== undefined) {
      user.daily_salary = req.body.dailySalary; // Corrigido caso necessário
    }

    await user.save(); // Salva as alterações no banco de dados

    res.status(200).json({ message: 'Perfil atualizado com sucesso!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar o perfil.' });
  }
};





// Deletar perfil de nanny
const deleteProfile = async (req, res) => {
  try {
    const deleted = await NannyProfiles.destroy({
      where: { nanny_id: req.params.nanny_id },
    });
    if (deleted) {
      res.status(204).json({ message: "Nanny profile deleted" });
    } else {
      res.status(404).json({ message: "Nanny profile not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  saveBusiness
};
