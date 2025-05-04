import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "./authService";
import logo from "../../assets/logo.png";
import lap from "../../assets/lap.png";
import "./Login.css";
import ForgotPassword from "./ForgotPassword";

const Login = ({ onSwitchForm }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState('');

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
      await authService.login(email.toLowerCase(), password, role);
      toast.success("Login successful");
      window.location.href = "/";
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (response) => {

    if (!role) {
      toast.error("Please select a role before logging in with Google.");
      return;
    }
    setIsLoading(true);
    
    try {
      await authService.googleLogin(response.credential, role);
      toast.success("Google login successful");
      window.location.href = "/";
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

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="page1">
      <div className="cover">
        <div className="left-signup">
          <div className="left-content">
            <h2 className="left-title">Why Sign Up?</h2>
            <p className="left-subtitle">Access a 15-day free trial of:</p>
            <ul className="benefits-list">
              <li>Most advanced AI powered Question Generator/Grader</li>
              <li>Multiple content input sources</li>
              <li>Multiple question types</li>
              <li>Export in PDF, Word or Excel format</li>
              <li>Conduct Test and Assess yourself</li>
              <li>Integration with your existing LMS or ERP</li>
            </ul>
            <img src={lap} alt="Laptop" className="image" />
          </div>
        </div>

        <div className="right-signup">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-image" />
            {/* <h3 className="lysa">Lysa Solutions</h3> */}
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            <h3 className="form-title">Welcome, Let's get started!</h3>
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
            <div className="input-container1">
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={passwordError ? "input-error" : ""}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              {passwordError && <div className="error-message">{passwordError}</div>}
            </div>
            <div className="forgot-password-link">
              <span onClick={handleForgotPassword}>
                Forgot Password?
              </span>
            </div>
            <div className="role-selection">
              <h4>Select Active Role:</h4>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isLoading}
                required
              >
                <option value="">-- Select Role --</option>
                <option value="student">Student</option>
                <option value="evaluator">Evaluator</option>
                <option value="qp_uploader">QP Uploader</option>
                <option value="mentor">Mentor</option>
              </select>
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
              New User?{" "}
              <span onClick={onSwitchForm} className="switch-link">
                Signup
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;