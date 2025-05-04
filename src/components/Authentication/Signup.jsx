import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "./authService";
import logo from "../../assets/logo.png";
import lap from "../../assets/lap.png";
import "./Signup.css";
import OTPVerification from "./OTPVerification";

const Signup = ({ onSwitchForm }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();
  const [roles, setRoles] = useState({
    student: false,
    evaluator: false,
    qp_uploader: false,
    mentor: false
  });

  const handleRoleChange = (role) => {
    setRoles(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (value.trim() === "") {
      setUsernameError("Username is required");
    } else {
      setUsernameError("");
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
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
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
  // In Signup.jsx
const handleSignup = async (e) => {
  e.preventDefault();
  if (!agreeTerms) {
    toast.error("You must agree to the terms before signing up.");
    return;
  }
  if (!isValidEmail(email) || !username || password.length < 8 || password !== confirmPassword) {
    return;
  }
  
  setIsLoading(true);
  
  try {
    await authService.register(
      email.toLowerCase(),
      username,
      password,
      confirmPassword,
      roles
    );
    
    setRegisteredEmail(email.toLowerCase());
    setShowOtpVerification(true);
    toast.success("OTP sent to your email. Please verify to complete registration.");
  } catch (error) {
    console.error("Signup error:", error);
    toast.error(error.message || "Something went wrong. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

const handleGoogleSignupSuccess = async (response) => {

  const selectedRoles = Object.keys(roles).filter((role) => roles[role]);
  if (selectedRoles.length === 0) {
    toast.error("Please select at least one role before signing up with Google.");
    return;
  }
  setIsLoading(true);
  
  try {
    await authService.googleLogin(response.credential, selectedRoles);
    toast.success("Google signup successful! Please login with your credentials.");
  
    onSwitchForm(); // This will show the login form
  } catch (error) {
    console.error("Google signup error:", error);
    toast.error(error.message || "An error occurred during Google signup");
  } finally {
    setIsLoading(false);
  }
};
  // const handleSignup = async (e) => {
  //   e.preventDefault();
  //   if (!agreeTerms) {
  //     toast.error("You must agree to the terms before signing up.");
  //     return;
  //   }
  //   if (!isValidEmail(email) || !username || password.length < 8 || password !== confirmPassword) {
  //     return;
  //   }
    
  //   setIsLoading(true);
    
  //   try {
  //     await authService.register(
  //       email.toLowerCase(),
  //       username,
  //       password,
  //       confirmPassword,
  //       roles
  //     );
      
  //     setRegisteredEmail(email.toLowerCase());
  //     setShowOtpVerification(true);
  //     toast.success("OTP sent to your email. Please verify to complete registration.");
  //   } catch (error) {
  //     console.error("Signup error:", error);
  //     toast.error(error.message || "Something went wrong. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleGoogleSignupSuccess = async (response) => {
  //   setIsLoading(true);
    
  //   try {
  //     await authService.googleLogin(response.credential);
  //     toast.success("Google signup successful!");
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Google signup error:", error);
  //     toast.error(error.message || "An error occurred during Google signup");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleGoogleSignupFailure = () => {
    toast.error("Google signup failed");
  };

  const handleBackFromOtp = () => {
    setShowOtpVerification(false);
    setRegisteredEmail("");
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (showOtpVerification) {
    return (
      <OTPVerification 
        email={registeredEmail} 
        onResend={() => authService.resendOtp(registeredEmail)}
        onBack={handleBackFromOtp}
      />
    );
  }

  return (
    <div className="page2">
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
          <h5 className="lysa2">Most advanced AI powered Question Generator/Grader</h5>
          <form className="signup-form" onSubmit={handleSignup}>
            <h3 className="form-title">Create an Account</h3>
            <div className="input-container1">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className={usernameError ? "input-error" : ""}
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
              {usernameError && <div className="error-message">{usernameError}</div>}
            </div>
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
            <div className="input-container1">
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className={confirmPasswordError ? "input-error" : ""}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
              {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
            </div>
            
  <div className="role-selection">
    <h4>Select Your Role(s):</h4>
    <div className="role-options">
      <label>
        <input
          type="checkbox"
          checked={roles.student}
          onChange={() => handleRoleChange('student')}
          disabled={isLoading}
        />
        Student
      </label>
      <label>
        <input
          type="checkbox"
          checked={roles.evaluator}
          onChange={() => handleRoleChange('evaluator')}
          disabled={isLoading}
        />
        Evaluator
      </label>
      <label>
        <input
          type="checkbox"
          checked={roles.qp_uploader}
          onChange={() => handleRoleChange('qp_uploader')}
          disabled={isLoading}
        />
        QP Uploader
      </label>
      <label>
        <input
          type="checkbox"
          checked={roles.mentor}
          onChange={() => handleRoleChange('mentor')}
          disabled={isLoading}
        />
        Mentor
      </label>
    </div>
    {Object.values(roles).every(role => !role) && (
      <div className="error-message">Please select at least one role</div>
    )}
  </div>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="terms" className="terms-label">
                I agree to the Terms and Conditions
              </label>
            </div>
            <button 
              type="submit" 
              className="button1"
              disabled={isLoading}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </button>
            <div className="social-login">
              <p>or continue with</p>
              <GoogleLogin
                onSuccess={handleGoogleSignupSuccess}
                onError={handleGoogleSignupFailure}
                disabled={isLoading}
              />
            </div>
            <p className="switch-form">
              Already have an account?{" "}
              <span onClick={onSwitchForm} className="switch-link">
                Login
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;