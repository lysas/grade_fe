import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "./authService";
import logo from "../../assets/logo.png";
import lap from "../../assets/lap.png";
import "./Login.css";

const OrganizationLogin = ({ onSwitchForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('session_expired')) {
      toast.info("Your session has expired. Please login again.");
    }
  }, [searchParams]);

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
    if (!value) {
      setPasswordError("Password is required");
    } else {
      setPasswordError("");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email) || !password) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await authService.organizationLogin(email.toLowerCase(), password);
      toast.success("Organization login successful");
      navigate('/organization'); // Navigate to organization dashboard
    } catch (error) {
      console.error("Organization login error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {
    setIsLoading(true);
    
    try {
      await authService.organizationGoogleLogin(response.credential);
      toast.success("Google login successful");
      navigate('/organization'); // Navigate to organization dashboard
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.message || "An error occurred during Google login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginFailure = () => {
    toast.error("Google login failed");
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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
          
          <form className="login-form" onSubmit={handleLogin}>
            <h3 className="form-title">Organization Login</h3>
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
            <button 
              type="submit" 
              className="button1" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
            <div className="social-login">
              <p>or continue with</p>
              <div className="google-login">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginFailure}
                  disabled={isLoading}
                />
              </div>
            </div>
            <p className="switch-form">
              New Organization?{" "}
              <span onClick={() => navigate('/organization-signup')} className="switch-link">
                Register
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

export default OrganizationLogin; 