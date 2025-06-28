import axios from 'axios';
import { authService } from '../Authentication/authService';

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
      const response = await authService.handleRequest('/api/user/credits/', 'GET');
      return {
        free_credit: parseFloat(response.free_credit) || 0,
        paid_credit: parseFloat(response.paid_credit) || 0,
        total_credit: parseFloat(response.total_credit) || 0,
      };
    } catch (error) {
      console.error('Failed to load credit balance:', error);
      throw new Error(error.message || 'Failed to load credit balance');
    }
  },

  createRazorpayOrder: async (amount, currency = 'INR') => {
    try {
      const response = await authService.handleRequest('/api/payments/create-order/', 'POST', {
        amount: parseFloat(amount),
        currency
      });
      return response;
    } catch (error) {
      console.error('Failed to create payment order:', error);
      throw new Error(
        error.message || 'Failed to create payment order'
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
  },

  generateInvoice: async (paymentId) => {
    try {
      const response = await api.post('/api/generate-invoice/', {
        razorpay_payment_id: paymentId
      });
      return response.data;
    } catch (error) {
      console.error('Invoice generation failed:', error);
      throw new Error(
        error.response?.data?.error || 
        'Failed to generate invoice. Please contact support.'
      );
    }
  }
};