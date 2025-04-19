import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PaymentService } from './PaymentService';
import './CreditUpgrade.css';

const presetAmounts = [100, 500, 1000, 2000, 5000]; // INR amounts (equivalent to ~$1.2, $6, $12, $24, $60)

const CreditUpgrade = ({ onCreditsUpdated }) => {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [amount, setAmount] = useState(500); // Default 500 INR (~$6)
  const [customAmount, setCustomAmount] = useState('');

  const handlePresetAmount = (value) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    if (value === '' || (value > 0 && value <= 100000)) { // Max 100,000 INR (~$1200)
      setCustomAmount(value);
      if (value) setAmount(parseFloat(value));
    }
  };

  const initiatePayment = async () => {
    if (amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setPaymentLoading(true);
    try {
      // Always send INR to Razorpay
      const orderData = await PaymentService.createRazorpayOrder(amount, 'INR');
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR', // Force INR currency
        name: 'Lysa Solutions - EasyWithAi',
        description: 'Credit Top-up',
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            const verificationData = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount,
              currency: 'INR'
            };
            
            const verification = await PaymentService.verifyPayment(verificationData);
            
            if (verification.status === 'success') {
              toast.success(`Payment successful! $${verification.paid_credit.toFixed(7)} added to your account`);
              if (onCreditsUpdated) onCreditsUpdated();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            toast.error(error.message);
          }
        },
        prefill: {
          email: localStorage.getItem('userEmail') || '',
          name: localStorage.getItem('userName') || ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment window closed');
            setPaymentLoading(false);
          }
        },
        // Enable UPI payment methods
        method: {
          netbanking: true,
          upi: true,
          card: true,
          wallet: true
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const convertToUSD = (inrAmount) => {
    return (inrAmount * 0.012).toFixed(7); // Approximate conversion rate
  };

  return (
    <div className="credit-upgrade-container">
      <div className="currency-note">
        <p>Payments are accepted in INR (₹) but credits will be added in USD ($)</p>
      </div>

      <div className="amount-presets">
        {presetAmounts.map((preset) => (
          <button
            key={preset}
            className={`preset-btn ${amount === preset && !customAmount ? 'active' : ''}`}
            onClick={() => handlePresetAmount(preset)}
            disabled={paymentLoading}
          >
            ₹{preset}
            <span className="usd-equivalent">(~${convertToUSD(preset)})</span>
          </button>
        ))}
      </div>

      <div className="custom-amount">
        <label>Or enter custom amount (INR):</label>
        <div className="input-group">
          <span className="currency-symbol">₹</span>
          <input
            type="number"
            min="100"
            max="100000"
            step="1"
            value={customAmount}
            onChange={handleCustomAmount}
            placeholder="E.g. 1000"
            disabled={paymentLoading}
          />
        </div>
        {customAmount && (
          <div className="conversion-note">
            ≈ ${convertToUSD(customAmount)} USD will be added
          </div>
        )}
      </div>

      <button
        className="pay-now-btn"
        onClick={initiatePayment}
        disabled={paymentLoading || amount <= 0}
      >
        {paymentLoading ? 'Processing...' : `Pay ₹${amount}`}
      </button>

      <div className="payment-security">
        <div className="secure-badge">
          <i className="lock-icon"></i>
          <span>Secure Payment</span>
        </div>
        <div className="payment-methods">
          <span>Accepts: UPI, Cards, NetBanking, Wallets</span>
          <div className="payment-icons">
            <i className="icon-upi" title="UPI"></i>
            <i className="icon-credit-card" title="Credit/Debit Cards"></i>
            <i className="icon-bank" title="Net Banking"></i>
            <i className="icon-wallet" title="Wallets"></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditUpgrade;