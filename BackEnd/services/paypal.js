
// import axios from 'axios';

// async function generateAccessToken() {
//     const response = await axios({
//         url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
//         method: 'post',
//         data: 'grant_type=client_credentials',
//         auth: {
//             username: process.env.PAYPAL_CLIENT_ID,
//             password: process.env.PAYPAL_SECRET
//         }
//     });

//     return response.data.access_token;
// }

// const createOrder = async () => {
//     const accessToken = await generateAccessToken();

//     const response = await axios({
//         url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
//         method: 'post',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`
//         },
//         data: JSON.stringify({
//             intent: 'CAPTURE',
//             purchase_units: [
//                 {
//                     items: [
//                         {
//                             name: 'Node.js Complete Course',
//                             description: 'Node.js Complete Course with Express and MongoDB',
//                             quantity: 1,
//                             unit_amount: {
//                                 currency_code: 'USD',
//                                 value: '100.00'
//                             }
//                         }
//                     ],
//                     amount: {
//                         currency_code: 'USD',
//                         value: '100.00',
//                         breakdown: {
//                             item_total: {
//                                 currency_code: 'USD',
//                                 value: '100.00'
//                             }
//                         }
//                     }
//                 }
//             ],
//             application_context: {
//                 return_url: `${process.env.BASE_URL}/complete-order`,
//                 cancel_url: `${process.env.BASE_URL}/cancel-order`,
//                 shipping_preference: 'NO_SHIPPING',
//                 user_action: 'PAY_NOW',
//                 brand_name: 'manfra.io'
//             }
//         })
//     });

//     return response.data.links.find(link => link.rel === 'approve').href;
// };

// const capturePayment = async (orderId) => {
//     const accessToken = await generateAccessToken();

//     const response = await axios({
//         url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
//         method: 'post',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${accessToken}`
//         }
//     });

//     return response.data;
// };

// export default {
//     createOrder,
//     capturePayment
// };
import axios from 'axios';

async function generateAccessToken() {
    const response = await axios({
        url: `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
        method: 'post',
        data: 'grant_type=client_credentials',
        auth: {
            username: process.env.PAYPAL_CLIENT_ID,
            password: process.env.PAYPAL_SECRET
        }
    });

    return response.data.access_token;
}

const createOrder = async (amount, reservationId) => {
    const accessToken = await generateAccessToken();

    const response = await axios({
        url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        data: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    items: [
                        {
                            name: 'Service Reservation',
                            description: `Reservation ID: ${reservationId}`,
                            quantity: 1,
                            unit_amount: {
                                currency_code: 'USD',
                                value: amount
                            }
                        }
                    ],
                    amount: {
                        currency_code: 'USD',
                        value: amount,
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: amount
                            }
                        }
                    },
                    custom_id: reservationId // Store reservationId for later reference
                }
            ],
            application_context: {
                return_url: `${process.env.BASE_URL}/complete-order`,
                cancel_url: `${process.env.BASE_URL}/cancel-order`,
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: 'manfra.io'
            }
        })
    });

    return response.data.links.find(link => link.rel === 'approve').href;
};

const capturePayment = async (orderId) => {
    const accessToken = await generateAccessToken();

    const response = await axios({
        url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });

    return response.data;
};

export default {
    createOrder,
    capturePayment
};