import db from "../Models/index.js";
const Files = db.Files;

const createFile = async (req, res) => {
  try {
    const file = await Files.create(req.body);
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllFiles = async (req, res) => {
  try {
    const files = await Files.findAll();
    res.status(200).json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFileById = async (req, res) => {
  try {
    const file = await Files.findByPk(req.params.id);
    if (file) {
      res.status(200).json(file);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateFile = async (req, res) => {
  try {
    const [updated] = await Files.update(req.body, {
      where: { file_id: req.params.id },
    });
    if (updated) {
      const updatedFile = await Files.findByPk(req.params.id);
      res.status(200).json(updatedFile);
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const deleted = await Files.destroy({
      where: { file_id: req.params.id },
    });
    if (deleted) {
      res.status(204).json({ message: "File deleted" });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createFile,
  getAllFiles,
  getFileById,
  updateFile,
  deleteFile,
};
