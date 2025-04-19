

// import React, { useState } from "react";
// import "./Signup.css";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import logo from "../../assets/logo.png";
// import { jwtDecode } from "jwt-decode";
// import { GoogleLogin } from "@react-oauth/google";
// import { GoogleOAuthProvider } from "@react-oauth/google";
// import lap from "../../assets/lap.png";

// const Signup = ({ onSwitchForm }) => {
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [fullNameError, setFullNameError] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [agreeTerms, setAgreeTerms] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleFullNameChange = (e) => {
//     setFullName(e.target.value);
//     if (e.target.value.trim() === "") {
//       setFullNameError("Full name is required");
//     } else {
//       setFullNameError("");
//     }
//   };

//   const handleEmailChange = (e) => {
//     setEmail(e.target.value);
//     if (!isValidEmail(e.target.value)) {
//       setEmailError("Invalid email address");
//     } else {
//       setEmailError("");
//     }
//   };

//   const handlePasswordChange = (e) => {
//     setPassword(e.target.value);
//     if (!isValidPassword(e.target.value)) {
//       setPasswordError("Password must be at least 6 characters");
//     } else {
//       setPasswordError("");
//     }
//   };
  
//   const handleSignup = async (e) => {
//     e.preventDefault();
//     if (!agreeTerms) {
//       toast.error("You must agree to the terms before signing up.");
//       return;
//     }
//     if (!isValidEmail(email) || !isValidPassword(password) || !fullName) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       const response = await fetch("http://127.0.0.1:8000/api/signup/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           username: fullName,
//           email,
//           password
//         }),
//       });
      
//       const jsonData = await response.json();
      
//       if (response.ok && jsonData.status === true) {
//         toast.success(jsonData.message || "Signup successful! Please login.");
        
//         // Clear signup form
//         setFullName("");
//         setEmail("");
//         setPassword("");
//         setAgreeTerms(false);
        
//         // Switch to login form after successful signup
//         onSwitchForm();
//       } else {
//         toast.error(jsonData.message || "Signup failed");
//       }
//     } catch (error) {
//       console.error("Error:", error.message);
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleSignupSuccess = async (response) => {
//     setIsLoading(true);
    
//     try {
//       console.log("Google signup response:", response);
//       const decoded = jwtDecode(response.credential);
//       console.log("Decoded Google token:", decoded);
//       const { sub: google_id, email, name: username } = decoded;
      
//       if (!google_id || !email) {
//         toast.error("Invalid Google response. Please try again.");
//         return;
//       }
      
//       const payload = {
//         google_id,
//         id_token: response.credential,
//         email,
//         username
//       };
      
//       const apiResponse = await fetch("http://127.0.0.1:8000/api/signup/", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });
      
//       const jsonData = await apiResponse.json();
      
//       if (apiResponse.ok && jsonData.status) {
//         toast.success("Google signup successful!");
        
//         // Store user data in localStorage
//         localStorage.setItem("token", jsonData.token);
//         localStorage.setItem("userEmail", jsonData.email);
//         localStorage.setItem("userId", jsonData.id);
//         localStorage.setItem("isLoggedIn", "true");
        
//         // Redirect to home page after Google signup
//         navigate("/");
//       } else {
//         toast.error(jsonData.message || "Google signup failed");
//       }
//     } catch (error) {
//       console.error("Google signup error:", error);
//       toast.error("An error occurred during Google signup");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   const isValidPassword = (password) => password.length >= 6;

//   return (
//     <div className="page">
//       <div className="cover">
        // <div className="left-signup">
        //   <div className="left-content">
        //     <h2 className="left-title">Why Sign Up?</h2>
        //     <p className="left-subtitle">Access a 15-day free trial of:</p>
        //     <ul className="benefits-list">
        //       <li>Most advanced AI powered Question Generator/Grader</li>
        //       <li>Multiple content input sources</li>
        //       <li>Multiple question types</li>
        //       <li>Export in PDF, Word or Excel format</li>
        //       <li>Conduct Test and Assess yourself</li>
        //       <li>Integration with your existing LMS or ERP</li>
        //     </ul>
        //     <img src={lap} alt="Laptop" className="image" />
        //   </div>
        // </div>

//         <div className="right-signup">
//           <div className="logo-container">
//             <img src={logo} alt="Logo" className="logo-image" />
//             <h3 className="lysa">Lysa Solutions</h3>
//           </div>
//           <h5 className="lysa2">Most advanced AI powered Question Generator/Grader</h5>
//           <form className="signup-form" onSubmit={handleSignup}>
//             <h3 className="form-title">Create an Account</h3>
//             <div className="input-container1">
//               <input
//                 type="text"
//                 id="fullName"
//                 value={fullName}
//                 onChange={handleFullNameChange}
//                 className={fullNameError ? "input-error" : ""}
//                 placeholder="Enter your full name"
//                 required
//                 disabled={isLoading}
//               />
//               {fullNameError && <div className="error-message">{fullNameError}</div>}
//             </div>
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
//             <div className="checkbox-container">
//               <input
//                 type="checkbox"
//                 id="terms"
//                 checked={agreeTerms}
//                 onChange={(e) => setAgreeTerms(e.target.checked)}
//                 disabled={isLoading}
//               />
//               <label htmlFor="terms" className="terms-label">
//                 I agree to the Terms and Conditions
//               </label>
//             </div>
//             <button 
//               type="submit" 
//               className="button1"
//               disabled={isLoading}
//             >
//               {isLoading ? "Signing Up..." : "Sign Up"}
//             </button>
//             <div className="social-login">
//               <p>or continue with</p>
//               <GoogleOAuthProvider clientId="987929579839-osrfs18jb5binb75mltbkttndm062e3u.apps.googleusercontent.com">
//                 <GoogleLogin
//                   onSuccess={handleGoogleSignupSuccess}
//                   onError={() => toast.error("Google signup failed")}
//                   disabled={isLoading}
//                 />
//               </GoogleOAuthProvider>
//             </div>
//             <p className="switch-form">
//               Already have an account?{" "}
//               <span onClick={onSwitchForm} className="switch-link">
//                 Login
//               </span>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { GoogleLogin } from "@react-oauth/google";
// import { authService } from "./authService";
// import logo from "../../assets/logo.png";
// import lap from "../../assets/lap.png";
// import "./Signup.css";

// const Signup = ({ onSwitchForm }) => {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [usernameError, setUsernameError] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");
//   const [confirmPasswordError, setConfirmPasswordError] = useState("");
//   const [agreeTerms, setAgreeTerms] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleUsernameChange = (e) => {
//     setUsername(e.target.value);
//     if (e.target.value.trim() === "") {
//       setUsernameError("Username is required");
//     } else {
//       setUsernameError("");
//     }
//   };

//   const handleEmailChange = (e) => {
//     setEmail(e.target.value);
//     if (!isValidEmail(e.target.value)) {
//       setEmailError("Invalid email address");
//     } else {
//       setEmailError("");
//     }
//   };

//   const handlePasswordChange = (e) => {
//     setPassword(e.target.value);
//     if (e.target.value.length < 8) {
//       setPasswordError("Password must be at least 8 characters");
//     } else {
//       setPasswordError("");
//     }
//   };

//   const handleConfirmPasswordChange = (e) => {
//     setConfirmPassword(e.target.value);
//     if (e.target.value !== password) {
//       setConfirmPasswordError("Passwords do not match");
//     } else {
//       setConfirmPasswordError("");
//     }
//   };
  
//   const handleSignup = async (e) => {
//     e.preventDefault();
//     if (!agreeTerms) {
//       toast.error("You must agree to the terms before signing up.");
//       return;
//     }
//     if (!isValidEmail(email) || !username || password.length < 8 || password !== confirmPassword) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       const response = await authService.register(
//         email.toLowerCase(),
//         username,
//         password,
//         confirmPassword
//       );
      
//       toast.success("Signup successful!");
//       navigate("/");
//     } catch (error) {
//       console.error("Signup error:", error);
//       toast.error(error.message || "Something went wrong. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleSignupSuccess = async (response) => {
//     setIsLoading(true);
    
//     try {
//       await authService.googleLogin(response.credential);
//       toast.success("Google signup successful!");
//       navigate("/");
//     } catch (error) {
//       console.error("Google signup error:", error);
//       toast.error(error.message || "An error occurred during Google signup");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleSignupFailure = () => {
//     toast.error("Google signup failed");
//   };

//   const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

//   return (
//     <div className="page">
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
//           <h5 className="lysa2">Most advanced AI powered Question Generator/Grader</h5>
//           <form className="signup-form" onSubmit={handleSignup}>
//             <h3 className="form-title">Create an Account</h3>
//             <div className="input-container1">
//               <input
//                 type="text"
//                 id="username"
//                 value={username}
//                 onChange={handleUsernameChange}
//                 className={usernameError ? "input-error" : ""}
//                 placeholder="Enter your username"
//                 required
//                 disabled={isLoading}
//               />
//               {usernameError && <div className="error-message">{usernameError}</div>}
//             </div>
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
//             <div className="input-container1">
//               <input
//                 type="password"
//                 id="confirmPassword"
//                 value={confirmPassword}
//                 onChange={handleConfirmPasswordChange}
//                 className={confirmPasswordError ? "input-error" : ""}
//                 placeholder="Confirm your password"
//                 required
//                 disabled={isLoading}
//               />
//               {confirmPasswordError && <div className="error-message">{confirmPasswordError}</div>}
//             </div>
//             <div className="checkbox-container">
//               <input
//                 type="checkbox"
//                 id="terms"
//                 checked={agreeTerms}
//                 onChange={(e) => setAgreeTerms(e.target.checked)}
//                 disabled={isLoading}
//               />
//               <label htmlFor="terms" className="terms-label">
//                 I agree to the Terms and Conditions
//               </label>
//             </div>
//             <button 
//               type="submit" 
//               className="button1"
//               disabled={isLoading}
//             >
//               {isLoading ? "Signing Up..." : "Sign Up"}
//             </button>
//             <div className="social-login">
//               <p>or continue with</p>
//               <GoogleLogin
//                 onSuccess={handleGoogleSignupSuccess}
//                 onError={handleGoogleSignupFailure}
//                 disabled={isLoading}
//               />
//             </div>
//             <p className="switch-form">
//               Already have an account?{" "}
//               <span onClick={onSwitchForm} className="switch-link">
//                 Login
//               </span>
//             </p>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Signup;

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
        confirmPassword
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
    setIsLoading(true);
    
    try {
      await authService.googleLogin(response.credential);
      toast.success("Google signup successful!");
      navigate("/");
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
    <div className="page">
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