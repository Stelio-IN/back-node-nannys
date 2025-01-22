declare module 'mpesa-node-api' {
    export function initiate_c2b(amount: number, phoneNumber: string, reference: string): Promise<any>;
    // Add other methods as needed
} 