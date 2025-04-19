
// import React, { useState } from "react";
// import "./Login.css";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import logo from "../../assets/logo.png";
// import lap from "../../assets/lap.png";
// import { jwtDecode } from "jwt-decode";
// import { GoogleLogin } from "@react-oauth/google";

// const Login = ({ onSwitchForm }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [showForgotPassword, setShowForgotPassword] = useState(false);
//   const [forgotEmail, setForgotEmail] = useState("");
//   const [forgotEmailError, setForgotEmailError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleEmailChange = (e) => {
//     const value = e.target.value;
//     setEmail(value);
//     if (!isValidEmail(value)) {
//       setEmailError("Invalid email address");
//     } else {
//       setEmailError("");
//     }
//   };

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setPassword(value);
//     if (!isValidPassword(value)) {
//       setPasswordError("Password must be at least 6 characters");
//     } else {
//       setPasswordError("");
//     }
//   };

//   const handleForgotEmailChange = (e) => {
//     const value = e.target.value;
//     setForgotEmail(value);
//     if (!isValidEmail(value)) {
//       setForgotEmailError("Invalid email address");
//     } else {
//       setForgotEmailError("");
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (!isValidEmail(email) || !isValidPassword(password)) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email, password }),
//       });
      
//       const jsonData = await response.json();
      
//       if (response.ok && jsonData.status === true) {
//         // Store user data in localStorage
//         localStorage.setItem("token", jsonData.token);
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userId", jsonData.id);
//         localStorage.setItem("userEmail", jsonData.email);
        
//         // Show success message
//         toast.success(jsonData.message || "Login successful");
        
//         // Navigate to home page
//         navigate("/");
//       } else {
//         toast.error(jsonData.message || "Login failed");
//       }
//     } catch (error) {
//       console.error("Error:", error.message);
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleForgotPassword = async (e) => {
//     e.preventDefault();
//     if (!isValidEmail(forgotEmail)) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/forgot-password/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: forgotEmail }),
//       });
      
//       const jsonData = await response.json();
      
//       if (response.ok && jsonData.status === true) {
//         toast.success("Password reset link has been sent to your email");
//         setShowForgotPassword(false);
//         setForgotEmail("");
//       } else {
//         toast.error(jsonData.message || "Failed to send password reset link");
//       }
//     } catch (error) {
//       console.error("Error:", error.message);
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLoginSuccess = async (response) => {
//     setIsLoading(true);
    
//     try {
//       console.log("Google login response:", response);
//       const decoded = jwtDecode(response.credential);
//       console.log("Decoded Google token:", decoded);
//       const { sub: google_id, email } = decoded;
      
//       if (!google_id || !email) {
//         toast.error("Invalid Google response. Please try again.");
//         return;
//       }
      
//       const payload = {
//         google_id,
//         id_token: response.credential,
//         email
//       };
      
//       const apiResponse = await fetch("http://127.0.0.1:8000/api/login/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });
      
//       const jsonData = await apiResponse.json();
      
//       if (apiResponse.ok && jsonData.status) {
//         // Store user data in localStorage
//         localStorage.setItem("token", jsonData.token);
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userId", jsonData.id);
//         localStorage.setItem("userEmail", jsonData.email);
        
//         toast.success("Google login successful");
//         navigate("/");
//       } else {
//         toast.error(jsonData.message || "Google login failed");
//       }
//     } catch (error) {
//       console.error("Google login error:", error);
//       toast.error("An error occurred during Google login");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   const isValidPassword = (password) => password.length >= 6;

//   return (
//     <div className="page1">
//       <div className="cover">
//         <div className="left-signup">
//           <div className="left-content">
//             <h2 className="left-title">Why Sign Up?</h2>
//             <p className="left-subtitle">Access a 15-day free trial of:</p>
//             <ul className="benefits-list">
//               <li>Most advanced AI powered Question Generator/Grader</li>
//               <li>Multiple content input sources</li>
//               <li>Multiple question types</li>
//               <li>Export in PDF, Word or Excel format</li>
//               <li>Conduct Test and Assess yourself</li>
//               <li>Integration with your existing LMS or ERP</li>
//             </ul>
//             <img src={lap} alt="Laptop" className="image" />
//           </div>
//         </div>

//         <div className="right-signup">
//           <div className="logo-container">
//             <img src={logo} alt="Logo" className="logo-image" />
//             <h3 className="lysa">Lysa Solutions</h3>
//           </div>
          
//           {!showForgotPassword ? (
//             <form className="login-form" onSubmit={handleLogin}>
//               <h3 className="form-title">Welcome, Let's get started!</h3>
//               <div className="input-container1">
//                 <input
//                   type="email"
//                   id="email"
//                   value={email}
//                   onChange={handleEmailChange}
//                   className={emailError ? "input-error" : ""}
//                   placeholder="Enter your email"
//                   required
//                   disabled={isLoading}
//                 />
//                 {emailError && <div className="error-message">{emailError}</div>}
//               </div>
//               <div className="input-container1">
//                 <input
//                   type="password"
//                   id="password"
//                   value={password}
//                   onChange={handlePasswordChange}
//                   className={passwordError ? "input-error" : ""}
//                   placeholder="Enter your password"
//                   required
//                   disabled={isLoading}
//                 />
//                 {passwordError && <div className="error-message">{passwordError}</div>}
//               </div>
//               <div className="forgot-password-link">
//                 <span onClick={() => setShowForgotPassword(true)}>
//                   Forgot Password?
//                 </span>
//               </div>
//               <button 
//                 type="submit" 
//                 className="button1" 
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Logging in..." : "Login"}
//               </button>
//               <div className="social-login">
//                 <p>or continue with</p>
//                 <div className="google-login">
//                   <GoogleLogin
//                     onSuccess={handleGoogleLoginSuccess}
//                     onError={() => toast.error("Google login failed")}
//                     disabled={isLoading}
//                   />
//                 </div>
//               </div>
//               <p className="switch-form">
//                 New User?{" "}
//                 <span onClick={onSwitchForm} className="switch-link">
//                   Signup
//                 </span>
//               </p>
//             </form>
//           ) : (
//             <form className="login-form" onSubmit={handleForgotPassword}>
//               <h3 className="form-title">Reset Your Password</h3>
//               <p className="reset-description">
//                 Enter your email address and we'll send you a link to reset your password.
//               </p>
//               <div className="input-container1">
//                 <input
//                   type="email"
//                   id="forgotEmail"
//                   value={forgotEmail}
//                   onChange={handleForgotEmailChange}
//                   className={forgotEmailError ? "input-error" : ""}
//                   placeholder="Enter your email"
//                   required
//                   disabled={isLoading}
//                 />
//                 {forgotEmailError && <div className="error-message">{forgotEmailError}</div>}
//               </div>
//               <button 
//                 type="submit" 
//                 className="button1"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Sending..." : "Send Reset Link"}
//               </button>
//               <button 
//                 type="button" 
//                 className="button-secondary" 
//                 onClick={() => setShowForgotPassword(false)}
//                 disabled={isLoading}
//               >
//                 Back to Login
//               </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


// import React, { useState, useEffect } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { GoogleLogin } from "@react-oauth/google";
// import { authService } from "./authService";
// import logo from "../../assets/logo.png";
// import lap from "../../assets/lap.png";
// import "./Login.css";

// const Login = ({ onSwitchForm }) => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   useEffect(() => {
//     if (searchParams.get('session_expired')) {
//       toast.info("Your session has expired. Please login again.");
//     }
//   }, [searchParams]);

//   const handleEmailChange = (e) => {
//     const value = e.target.value;
//     setEmail(value);
//     if (!isValidEmail(value)) {
//       setEmailError("Invalid email address");
//     } else {
//       setEmailError("");
//     }
//   };

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setPassword(value);
//     if (!value) {
//       setPasswordError("Password is required");
//     } else {
//       setPasswordError("");
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (!isValidEmail(email) || !password) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       await authService.login(email.toLowerCase(), password);
//       toast.success("Login successful");
//       window.location.href = "/";
//     } catch (error) {
//       console.error("Login error:", error);
//       toast.error(error.message || "Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLoginSuccess = async (response) => {
//     setIsLoading(true);
    
//     try {
//       await authService.googleLogin(response.credential);
//       toast.success("Google login successful");
//       window.location.href = "/";
//     } catch (error) {
//       console.error("Google login error:", error);
//       toast.error(error.message || "An error occurred during Google login");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLoginFailure = () => {
//     toast.error("Google login failed");
//   };

//   const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//   return (
//     <div className="page1">
//       <div className="cover">
//         <div className="left-signup">
//           <div className="left-content">
//             <h2 className="left-title">Why Sign Up?</h2>
//             <p className="left-subtitle">Access a 15-day free trial of:</p>
//             <ul className="benefits-list">
//               <li>Most advanced AI powered Question Generator/Grader</li>
//               <li>Multiple content input sources</li>
//               <li>Multiple question types</li>
//               <li>Export in PDF, Word or Excel format</li>
//               <li>Conduct Test and Assess yourself</li>
//               <li>Integration with your existing LMS or ERP</li>
//             </ul>
//             <img src={lap} alt="Laptop" className="image" />
//           </div>
//         </div>

//         <div className="right-signup">
//           <div className="logo-container">
//             <img src={logo} alt="Logo" className="logo-image" />
//             <h3 className="lysa">Lysa Solutions</h3>
//           </div>
          
//           <form className="login-form" onSubmit={handleLogin}>
//             <h3 className="form-title">Welcome, Let's get started!</h3>
//             <div className="input-container1">
//               <input
//                 type="email"
//                 id="email"
//                 value={email}
//                 onChange={handleEmailChange}
//                 className={emailError ? "input-error" : ""}
//                 placeholder="Enter your email"
//                 required
//                 disabled={isLoading}
//               />
//               {emailError && <div className="error-message">{emailError}</div>}
//             </div>
//             <div className="input-container1">
//               <input
//                 type="password"
//                 id="password"
//                 value={password}
//                 onChange={handlePasswordChange}
//                 className={passwordError ? "input-error" : ""}
//                 placeholder="Enter your password"
//                 required
//                 disabled={isLoading}
//               />
//               {passwordError && <div className="error-message">{passwordError}</div>}
//             </div>
//             <button 
//               type="submit" 
//               className="button1" 
//               disabled={isLoading}
//             >
//               {isLoading ? "Logging in..." : "Login"}
//             </button>
//             <div className="social-login">
//               <p>or continue with</p>
//               <div className="google-login">
//                 <GoogleLogin
//                   onSuccess={handleGoogleLoginSuccess}
//                   onError={handleGoogleLoginFailure}
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>
//             <p className="switch-form">
//               New User?{" "}
//               <span onClick={onSwitchForm} className="switch-link">
//                 Signup
//               </span>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

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
      await authService.login(email.toLowerCase(), password);
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
    setIsLoading(true);
    
    try {
      await authService.googleLogin(response.credential);
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