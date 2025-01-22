import db from "../Models/index.js";
const NannyChildAgeExperience = db.Nanny_Child_Age_Experience;

const createExperience = async (req, res) => {
  console.log(req.body)
  console.log(req.params)
  try {
    const experience = await NannyChildAgeExperience.create({
      nanny_id: req.params.nanny_id,
      age_group: req.body.preference_age,
    
    });
    res.status(201).json(experience);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllExperiences = async (req, res) => {
  try {
    const experiences = await NannyChildAgeExperience.findAll();
    res.status(200).json(experiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getExperienceByNannyId = async (req, res) => {
  try {
    const experiences = await NannyChildAgeExperience.findAll({
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
    const deleted = await NannyChildAgeExperience.destroy({
      where: { nanny_id: req.params.nanny_id, age_group: req.params.age_group },
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
