import db from "../Models/index.js";
const UserLanguage = db.User_Language;

const createUserLanguage = async (req, res) => {
  console.log(req.params)
  console.log(req.body)
  try {
    const userLanguage = await UserLanguage.create(
      {
        user_id: req.params.user_id,
        language: req.body.languages,
      }
    );
    res.status(201).json(userLanguage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUserLanguages = async (req, res) => {
  try {
    const userLanguages = await UserLanguage.findAll();
    res.status(200).json(userLanguages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserLanguageById = async (req, res) => {
  try {
    const userLanguage = await UserLanguage.findOne({
      where: {
        user_id: req.params.user_id,
        language: req.params.language,
      },
    });
    if (userLanguage) {
      res.status(200).json(userLanguage);
    } else {
      res.status(404).json({ message: "UserLanguage not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUserLanguage = async (req, res) => {
  try {
    const [updated] = await UserLanguage.update(req.body, {
      where: {
        user_id: req.params.user_id,
        language: req.params.language,
      },
    });
    if (updated) {
      const updatedUserLanguage = await UserLanguage.findOne({
        where: {
          user_id: req.params.user_id,
          language: req.params.language,
        },
      });
      res.status(200).json(updatedUserLanguage);
    } else {
      res.status(404).json({ message: "UserLanguage not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUserLanguage = async (req, res) => {
  try {
    const deleted = await UserLanguage.destroy({
      where: {
        user_id: req.params.user_id,
        language: req.params.language,
      },
    });
    if (deleted) {
      res.status(204).json({ message: "UserLanguage deleted" });
    } else {
      res.status(404).json({ message: "UserLanguage not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createUserLanguage,
  getAllUserLanguages,
  getUserLanguageById,
  updateUserLanguage,
  deleteUserLanguage,
};
