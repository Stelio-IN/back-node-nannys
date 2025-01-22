import db from "../Models/index.js";
const ServiceRequestChildAges = db.Service_Request_Child_Ages;

const createChildAge = async (req, res) => {
  try {
    const childAge = await ServiceRequestChildAges.create(req.body);
    res.status(201).json(childAge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllChildAges = async (req, res) => {
  try {
    const childAges = await ServiceRequestChildAges.findAll();
    res.status(200).json(childAges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getChildAgeByRequestId = async (req, res) => {
  try {
    const childAge = await ServiceRequestChildAges.findAll({
      where: { request_id: req.params.request_id }
    });
    if (childAge && childAge.length > 0) {
      res.status(200).json(childAge);
    } else {
      res.status(404).json({ message: "Child age group not found for this request" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateChildAge = async (req, res) => {
  try {
    const [updated] = await ServiceRequestChildAges.update(req.body, {
      where: { request_id: req.params.request_id, age_group: req.params.age_group },
    });
    if (updated) {
      const updatedChildAge = await ServiceRequestChildAges.findOne({
        where: { request_id: req.params.request_id, age_group: req.params.age_group }
      });
      res.status(200).json(updatedChildAge);
    } else {
      res.status(404).json({ message: "Child age group not found for this request" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteChildAge = async (req, res) => {
  try {
    const deleted = await ServiceRequestChildAges.destroy({
      where: { request_id: req.params.request_id, age_group: req.params.age_group },
    });
    if (deleted) {
      res.status(204).json({ message: "Child age group deleted" });
    } else {
      res.status(404).json({ message: "Child age group not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createChildAge,
  getAllChildAges,
  getChildAgeByRequestId,
  updateChildAge,
  deleteChildAge,
};
