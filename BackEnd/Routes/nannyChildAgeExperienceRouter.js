import { Router } from "express";
import nannyChildAgeExperienceController from "../Controllers/NannyChildAgeExperienceController.js";

const router = Router();

router.post("/:nanny_id", nannyChildAgeExperienceController.createExperience); // Cria uma nova experiência para a babá
router.get("/", nannyChildAgeExperienceController.getAllExperiences); // Lista todas as experiências
router.get("/:nanny_id", nannyChildAgeExperienceController.getExperienceByNannyId); // Lista experiências de uma babá específica
router.delete("/:nanny_id/:age_group", nannyChildAgeExperienceController.deleteExperience); // Remove uma experiência específica para uma babá

export default router;
