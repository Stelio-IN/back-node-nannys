import db from "../Models/index.js";

const NannyChildWorkPreference = db.NannyChildWorkPreference;

const createExperience = async (req, res) => {

  console.log(req.params)
  console.log(req.body)

  try {
    const experience = await NannyChildWorkPreference.create({
      nanny_id : req.params.id_user,
      work_preference: req.body.work_preference,
      id_nanny: req.params.id_user,

  });
    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllExperiences = async (req, res) => {
  try {
    const experiences = await NannyChildWorkPreference.findAll();
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExperienceByNannyId = async (req, res) => {
  try {
    const experiences = await NannyChildWorkPreference.findAll({
      where: { nanny_id: req.params.nanny_id },
    });
    if (experiences.length > 0) {
      res.status(200).json(experiences);
    } else {
      res.status(404).json({ message: "No experiences found for this nanny" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const deleted = await NannyChildWorkPreference.destroy({
      where: { nanny_id: req.params.nanny_id, work_preference: req.params.work_preference },
    });
    if (deleted) {
      res.status(204).json({ message: "Experience deleted" });
    } else {
      res.status(404).json({ message: "Experience not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createExperience,
  getAllExperiences,
  getExperienceByNannyId,
  deleteExperience,
};
