import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "./authService";
import logo from "../../assets/logo.png";
import "./OTPVerification.css";

const OTPVerification = ({ email, onResend, onBack }) => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendDisabled && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 6);
    setOtp(value);
    if (value.length < 6) {
      setOtpError("OTP must be 6 digits");
    } else {
      setOtpError("");
    }
  };

  // const handleVerify = async (e) => {
  //   e.preventDefault();
  //   if (otp.length !== 6) {
  //     setOtpError("OTP must be 6 digits");
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     await authService.verifyOtp(email, otp);
  //     toast.success("Email verified successfully!");
  //     navigate("/");
  //   } catch (error) {
  //     console.error("OTP verification error:", error);
  //     toast.error(error.message || "OTP verification failed");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // In OTPVerification.jsx
const handleVerify = async (e) => {
  e.preventDefault();
  if (otp.length !== 6) {
    setOtpError("OTP must be 6 digits");
    return;
  }

  setIsLoading(true);
  try {
    await authService.verifyOtp(email, otp);
    toast.success("Email verified successfully! Please login.");
    navigate('/login'); // Redirect to login page
  } catch (error) {
    console.error("OTP verification error:", error);
    toast.error(error.message || "OTP verification failed");
  } finally {
    setIsLoading(false);
  }
};

  const handleResend = async () => {
    setIsLoading(true);
    try {
      await authService.resendOtp(email);
      toast.success("New OTP sent to your email");
      setResendDisabled(true);
      setCountdown(60);
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page1">
      <div className="cover">
        <div className="right-signup">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-image" />
            <h3 className="lysa">Lysa Solutions</h3>
          </div>
          
          <form className="otp-form" onSubmit={handleVerify}>
            <h3 className="form-title">Verify Your Email</h3>
            <p className="otp-description">
              We've sent a 6-digit verification code to {email}
            </p>
            
            <div className="input-container1">
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                className={otpError ? "input-error" : ""}
                placeholder="Enter 6-digit OTP"
                required
                disabled={isLoading}
              />
              {otpError && <div className="error-message">{otpError}</div>}
            </div>
            
            <button 
              type="submit" 
              className="button1" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
            
            <div className="resend-container">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                className="resend-button"
                onClick={handleResend}
                disabled={resendDisabled || isLoading}
              >
                {resendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
              </button>
            </div>
            
            <button 
              type="button" 
              className="button-secondary" 
              onClick={onBack}
              disabled={isLoading}
            >
              Back to Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;