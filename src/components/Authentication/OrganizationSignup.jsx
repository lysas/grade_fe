import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "./authService";
import logo from "../../assets/logo.png";
import lap from "../../assets/lap.png";
import "./Login.css";

const OrganizationSignup = ({ onSwitchForm }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    if (!value.trim()) {
      setNameError("Organization name is required");
    } else {
      setNameError("");
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (!isValidEmail(value)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError("");
    }
    // Check password confirmation
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.organizationRegister(name, email, password, confirmPassword);
      toast.success("Registration successful! Please verify your email.");
      navigate('/organization-verify-otp', { state: { email } });
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignupSuccess = async (response) => {
    setIsLoading(true);
    
    try {
      await authService.organizationGoogleLogin(response.credential);
      toast.success("Google signup successful");
      navigate('/organization');
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error(error.message || "An error occurred during Google signup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignupFailure = () => {
    toast.error("Google signup failed");
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    if (!name.trim() || !isValidEmail(email) || !password || !confirmPassword) {
      return false;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    }
    
    return true;
  };

  return (
    <div className="page1">
      <div className="cover">
        <div className="left-signup">
          <div className="left-content">
            <h2 className="left-title">Organization Benefits</h2>
            <p className="left-subtitle">Access powerful features for your institution:</p>
            <ul className="benefits-list">
              <li>Manage multiple users and roles</li>
              <li>Track student progress and performance</li>
              <li>Generate and grade assessments</li>
              <li>Customize question papers</li>
              <li>Export results and analytics</li>
              <li>Integration with your existing systems</li>
            </ul>
            <img src={lap} alt="Laptop" className="image" />
          </div>
        </div>

        <div className="right-signup">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-image" />
          </div>
          
          <form className="login-form" onSubmit={handleSignup}>
            <h3 className="form-title">Organization Registration</h3>
            <div className="input-container1">
              <input
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
                className={nameError ? "input-error" : ""}
                placeholder="Enter organization name"
                required
                disabled={isLoading}
              />
              {nameError && <div className="error-message">{nameError}</div>}
            </div>
            <div className="input-container1">
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={emailError ? "input-error" : ""}
                placeholder="Enter organization email"
                required
                disabled={isLoading}
              />
              {emailError && <div className="error-message">{emailError}</div>}
            </div>
            <div className="input-container1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={passwordError ? "input-error" : ""}
                placeholder="Enter password"
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
                placeholder="Confirm password"
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
              {isLoading ? "Registering..." : "Register"}
            </button>
            <div className="social-login">
              <p>or continue with</p>
              <div className="google-login">
                <GoogleLogin
                  onSuccess={handleGoogleSignupSuccess}
                  onError={handleGoogleSignupFailure}
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="switch-form">
              Already have an account?{" "}
              <span onClick={onSwitchForm} className="switch-link">
                Login
              </span>
            </p>
            <p className="switch-form">
              <span onClick={() => navigate('/login')} className="switch-link">
                Back to User Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignup; 