import mpesa from 'mpesa-node-api';
import db from '../Models/index.js';
import moment from 'moment';

const transactionReference = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ref';
    
    const targetLength = Math.max(Number(length) || 10, 4);
    
    for (let i = 3; i < targetLength; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars.charAt(randomIndex);
    }
    
    return result;
};

const isSuccessfulResponse = (response) => {
    // Verifica se a resposta é de sucesso baseado nos códigos do M-Pesa
    if (!response) return false;

    // Lista de códigos de sucesso do M-Pesa
    const successCodes = ['INS-0']; // Adicione outros códigos de sucesso se necessário

    return successCodes.includes(response.output_ResponseCode);
};

const handleMpesaResponse = (response) => {
    console.log("Full M-Pesa response:", JSON.stringify(response, null, 2));

    // Se for timeout
    if (response.output_ResponseCode === 'INS-9') {
        return {
            success: false,
            status: 'timeout',
            message: 'A transação expirou. Por favor, tente novamente.',
            details: response
        };
    }

    // Se for sucesso
    if (isSuccessfulResponse(response)) {
        return {
            success: true,
            status: 'success',
            transactionId: response.output_TransactionID,
            conversationId: response.output_ConversationID,
            details: response
        };
    }

    // Outros erros
    return {
        success: false,
        status: 'error',
        message: response.output_ResponseDesc || 'Erro no processamento do pagamento',
        details: response
    };
};

const updateReservation = async (reservationId, amount) => {
    try {
        const reservation = await db.Reservations.findOne({
            where: { reservation_id: reservationId },
        });

        if (!reservation) {
            throw new Error("Reservation not found");
        }

        const updatedRows = await db.Reservations.update(
            { status: "booked" },
            { where: { reservation_id: reservationId } }
        );

        if (updatedRows[0] === 0) {
            throw new Error("Failed to update reservation status");
        }

        const payment = await db.Payments.create({
            reservation_id: reservation.reservation_id,
            client_id: reservation.client_id,
            amount: amount,
            payment_method: 'M-Pesa',
            payment_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            status: 'Completed',
        });

        return {
            success: true,
            payment: payment,
            message: "Reservation updated successfully"
        };
    } catch (error) {
        console.error("Error updating reservation:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

const pagamentoMpesa = async (amount, phoneNumber, reservationId) => {
    try {
        const reference = transactionReference();
        console.log("Initiating M-Pesa payment with reference:", reference);
        console.log("Amount:", amount);
        console.log("Phone Number:", `258${phoneNumber}`);

        const response = await mpesa.initiate_c2b(amount, `258${phoneNumber}`, 'T12344C', reference);
        
        const processedResponse = handleMpesaResponse(response);
        console.log("Processed M-Pesa response:", processedResponse);

        if (processedResponse.success) {
            const updateResult = await updateReservation(reservationId, amount);
            return {
                ...processedResponse,
                reference: reference,
                reservationUpdate: updateResult
            };
        }

        // Retorna resposta com detalhes específicos do erro
        return {
            success: false,
            reference: reference,
            ...processedResponse
        };

    } catch (error) {
        console.error("Error in M-Pesa payment:", error);
        return {
            success: false,
            status: 'error',
            message: 'Erro interno no processamento do pagamento',
            error: error.message,
            reference: reference
        };
    }
};

export default {
    pagamentoMpesa
};