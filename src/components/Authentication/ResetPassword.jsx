import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { authService } from "./authService";
import logo from "../../assets/logo.png";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid password reset link");
      navigate("/login");
    }
    // In a real app, you might want to verify the token with the backend
    setIsValidToken(true);
  }, [token, navigate]);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (e.target.value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8 || password !== confirmPassword) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.resetPassword(token, password, confirmPassword);
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken) {
    return null;
  }

  return (
    <div className="page1">
      <div className="cover">
        <div className="right-signup">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-image" />
            <h3 className="lysa">Lysa Solutions</h3>
          </div>
          
          <form className="reset-password-form" onSubmit={handleSubmit}>
            <h3 className="form-title">Reset Your Password</h3>
            <div className="input-container1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={passwordError ? "input-error" : ""}
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
              {passwordError && <div className="error-message">{passwordError}</div>}
            </div>
            <div className="input-container1">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={confirmPasswordError ? "input-error" : ""}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
              {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
            </div>
            <button 
              type="submit" 
              className="button1"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;