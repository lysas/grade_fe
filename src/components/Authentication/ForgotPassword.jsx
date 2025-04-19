import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "./authService";
import logo from "../../assets/logo.png";
import "./ForgotPassword.css";

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (!isValidEmail(e.target.value)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.forgotPassword(email.toLowerCase());
      setIsEmailSent(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="page1">
      <div className="cover">
        <div className="right-signup">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-image" />
            <h3 className="lysa">Lysa Solutions</h3>
          </div>
          
          {isEmailSent ? (
            <div className="forgot-password-form">
              <h3 className="form-title">Check Your Email</h3>
              <p className="reset-description">
                We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
              </p>
              <button 
                type="button" 
                className="button1" 
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form className="forgot-password-form" onSubmit={handleSubmit}>
              <h3 className="form-title">Reset Your Password</h3>
              <p className="reset-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div className="input-container1">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={emailError ? "input-error" : ""}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
                {emailError && <div className="error-message">{emailError}</div>}
              </div>
              <button 
                type="submit" 
                className="button1"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
              <button 
                type="button" 
                className="button-secondary" 
                onClick={onBackToLogin}
                disabled={isLoading}
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;