import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const PaymentService = {
  getUserCredits: async () => {
    try {
      const response = await api.get('/api/user/credits/');
      return {
        free_credit: parseFloat(response.data.free_credit) || 0,
        paid_credit: parseFloat(response.data.paid_credit) || 0,
        total_credit: parseFloat(response.data.total_credit) || 0,
      };
    } catch (error) {
      console.error('Failed to load credit balance:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load credit balance');
    }
  },

  createRazorpayOrder: async (amount, currency = 'INR') => {
    try {
      const response = await api.post('/api/payments/create-order/', { 
        amount: parseFloat(amount),
        currency 
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create payment order:', error);
      throw new Error(
        error.response?.data?.error || 
        error.response?.data?.detail || 
        'Failed to create payment order'
      );
    }
  },

  verifyPayment: async (paymentData) => {
    try {
      const response = await api.post('/api/payments/verify/', {
        ...paymentData,
        amount: parseFloat(paymentData.amount)
      });
      return response.data;
    } catch (error) {
      console.error('Payment verification failed:', error);
      throw new Error(
        error.response?.data?.error || 
        'Payment verification failed. Please contact support.'
      );
    }
  }
};