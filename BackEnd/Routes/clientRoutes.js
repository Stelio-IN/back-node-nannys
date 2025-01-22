import express from 'express';
import clientController from '../Controllers/ClientController.js';

const router = express.Router();

// Rota para criar um cliente e fazer upload do arquivo
router.post('/registerClient', clientController.createClientWithFile);

// Outras rotas (getAllClients, getClientById, etc.) podem ser adicionadas conforme necessário
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.put('/:id', clientController.updateClient);
router.delete('/:id', clientController.deleteClient);
router.get('/cont/Users', clientController.countUsers);

export default router;
