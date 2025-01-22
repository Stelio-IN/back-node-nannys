import db from "../Models/index.js";
const Payments = db.Payments;
const Reservations = db.Reservations;
const Users = db.Users;

import { Op,  fn, literal } from 'sequelize';
import moment from 'moment'; 
import axios from 'axios';


// Obter todos os pagamentos
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payments.findAll();
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obter um pagamento por ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payments.findByPk(req.params.id);
    if (payment) {
      res.status(200).json(payment);
    } else {
      res.status(404).json({ message: "Payment not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Atualizar um pagamento
const updatePayment = async (req, res) => {
  try {
    const [updated] = await Payments.update(req.body, {
      where: { payment_id: req.params.id },
    });
    if (updated) {
      const updatedPayment = await Payments.findByPk(req.params.id);
      res.status(200).json(updatedPayment);
    } else {
      res.status(404).json({ message: "Payment not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Deletar um pagamento
const deletePayment = async (req, res) => {
  try {
    const deleted = await Payments.destroy({
      where: { payment_id: req.params.id },
    });
    if (deleted) {
      res.status(204).send(); // No Content
    } else {
      res.status(404).json({ message: "Payment not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getAllPaymentsWithDetails = async (req, res) => {
  try {
    const payments = await Payments.findAll({
      include: [
        {
          model: Reservations,
          as: 'reservation',
        },
      ],
    });

    // Obter detalhes adicionais do cliente e da babá
    const detailedPayments = await Promise.all(
      payments.map(async (payment) => {
        const reservation = payment.reservation;

        // Buscar cliente
        const client = await Users.findOne({
          where: { user_id: reservation.client_id },
          attributes: ['first_name', 'last_name'],
        });

        // Buscar babá
        const nanny = await Users.findOne({
          where: { user_id: reservation.nanny_id },
          attributes: ['first_name', 'last_name'],
        });

        return {
          ...payment.toJSON(),
          client: client ? client.toJSON() : null,
          nanny: nanny ? nanny.toJSON() : null,
        };
      })
    );

    res.status(200).json(detailedPayments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const CONVERT_API_URL = 'http://localhost:3005/convert';

const getTotalCompletedPayments = async (req, res) => {
  try {
    // Obter o primeiro e o último dia do mês atual
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Obter todos os pagamentos completados no mês atual
    const payments = await Payments.findAll({
      attributes: ['amount', 'payment_method'],
      where: {
        status: 'completed',
        payment_date: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      raw: true,
    });

    let totalAmountMZN = 0;

    // Processar cada pagamento
    for (const payment of payments) {
      let amount = payment.amount;

      if (payment.payment_method === 'Paypal') {
        
        try {
          const response = await axios.post(CONVERT_API_URL, {
            from: 'USD',
            to: 'MZN',
            amount,
          });

          if (response.data.success) {
            amount = response.data.convertedAmount;
          } else {
            console.warn('Falha na conversão de moeda:', response.data.message);
            continue;
          }
        } catch (error) {
          console.error('Erro ao chamar a API de conversão:', error);
          continue;
        }
      }

      totalAmountMZN += amount * 0.1;
    }

    res.json({ totalAmount: parseFloat(totalAmountMZN.toFixed(2)) });
  } catch (error) {
    console.error('Erro ao calcular pagamentos concluídos:', error);
    res.status(500).json({ error: 'Erro ao calcular pagamentos concluídos' });
  }
};


export default {
   getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
  getAllPaymentsWithDetails,
  getTotalCompletedPayments
};
