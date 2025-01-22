import { Router } from "express";
import serviceRequestChildAgesController from "../Controllers/ServiceRequestChildAgesController.js";

const router = Router();

router.post("/", serviceRequestChildAgesController.createChildAge); // Cria um novo grupo etário para o pedido
router.get("/", serviceRequestChildAgesController.getAllChildAges); // Lista todos os grupos etários de pedidos
router.get("/:request_id", serviceRequestChildAgesController.getChildAgeByRequestId); // Busca os grupos etários para um pedido específico
router.put("/:request_id/:age_group", serviceRequestChildAgesController.updateChildAge); // Atualiza um grupo etário específico para um pedido
router.delete("/:request_id/:age_group", serviceRequestChildAgesController.deleteChildAge); // Remove um grupo etário específico de um pedido

export default router;
