import express from 'express';
import NannyChildWorkExperienceController from '../Controllers/NannyChildWorkPreferenceController.js';

const router = express.Router();

// Rota para criar uma nova experiência de idade
router.post('/:id_user', NannyChildWorkExperienceController.createExperience);

// Rota para obter todas as experiências de idade
router.get('/', NannyChildWorkExperienceController.getAllExperiences);

// Rota para buscar experiências de idade de uma babá específica por ID
router.get('/:nanny_id', NannyChildWorkExperienceController.getExperienceByNannyId);

// Rota para deletar uma experiência de idade de uma babá específica
router.delete('/:nanny_id/:work_preference', NannyChildWorkExperienceController.deleteExperience);

export default router;
