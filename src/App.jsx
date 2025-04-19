// import { Routes, Route, Link } from "react-router-dom";
// import { useContext } from "react";
// import { AppContext } from "./components/AppContext";

// // Component imports
// import EntityRecognizer from "./components/EntityRecognizer";
// import EmailWriterPage from "./components/EmailWriterPage";
// import TranslationPage from "./components/TranslationPage";
// import TransliterationPage from "./components/TransliterationPage";
// import Prompt from "./components/Prompt";
// import Footer from "./components/Footer";
// import "./App.css"; // Add a separate CSS file for global styles
// import Navbar from "./components/Navbar"; 

// // In index.js or App.js
// import 'bootstrap/dist/css/bootstrap.min.css';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// const App = () => {
//   return (
//     <div className="app-container" style={{
//       display: "flex",
//       flexDirection: "column",
//       minHeight: "100vh",
//       // backgroundColor: "#1e1e1e"
//     }}>
//       <Navbar /> {/* Render the Navbar component here */}
//       <div className="main-content" style={{ 
//         display: "flex",
//         flex: 1,
//         maxWidth: "1200px",
//         margin: "0 auto",
//         width: "100%",
//         backgroundColor: "#fff",
//         boxShadow: "0 0 20px rgba(0, 0, 0, 0.15)"
//       }}>
//         {/* Left Sidebar */}
//         <div className="sidebar" style={{ 
//           width: "200px",
//           borderRight: "1px solid #eaeaea",
//           padding: "20px 0",
//           backgroundColor: "#fff"
//         }}>
//           <h2 style={{ 
//             color: "#190A89", 
//             margin: "0 0 30px 20px",
//             fontSize: "1.5rem",
//             fontWeight: "600"
//           }}>EasyWithAI</h2>
          
//           <nav>
//             <ul style={{ 
//               listStyleType: "none", 
//               padding: 0,
//               margin: 0
//             }}>
//               {[
//                 { path: "/question-generator", label: "Entity Recognizer", icon: "👨‍💼" },
//                 { path: "/email-writer", label: "Email Writer", icon: "✉️" },
//                 { path: "/translation", label: "Translation", icon: "🌐" },
//                 { path: "/transliteration", label: "Transliteration", icon: "📝" }
//               ].map(({ path, label, icon }) => (
//                 <li key={path}>
//                   <Link to={path} style={{ 
//                     textDecoration: "none", 
//                     color: "#333",
//                     display: "flex",
//                     alignItems: "center",
//                     padding: "12px 20px",
//                     transition: "background-color 0.2s",
//                     borderLeft: "3px solid transparent"
//                   }}
//                   className="nav-link-left"
//                   >
//                     <span style={{ 
//                       marginRight: "12px", 
//                       fontSize: "18px"
//                     }}>{icon}</span>
//                     <span style={{
//                       fontWeight: "500"
//                     }}>{label}</span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </nav>
//         </div>

//         {/* Main Content */}
//         <div className="content-area" style={{ 
//           flex: 1,
//           padding: "20px",
//           overflowY: "auto",
//           backgroundColor: "white",
//           minHeight: "calc(100vh - 60px)",
//           border: "1px solid #ccc",
//         }}>
//           <Routes>
//             <Route path="/" element={<EntityRecognizer />} />
//             <Route path="/question-generator" element={<EntityRecognizer />} />
//             <Route path="/email-writer" element={<EmailWriterPage />} />
//             <Route path="/translation" element={<TranslationPage />} />
//             <Route path="/transliteration" element={<TransliterationPage />} />
//           </Routes>
//         </div>

//         {/* Right Sidebar */}
//         <div className="settings-panel" style={{ 
//           width: "250px",
//           padding: "20px",
//           borderLeft: "1px solid #eaeaea",
//           backgroundColor: "#fff",
//           overflowY: "auto"
//         }}>
//           <Prompt />
//         </div>
//       </div>
      
//       <Footer style={{
//         backgroundColor: "#fff", 
//         padding: "15px 0",
//         borderTop: "1px solid #eaeaea",
//         textAlign: "center"
//       }} />
//     </div>
//   );
// };

// export default App;

import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppContext } from "./components/AppContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Component imports
import EntityRecognizer from "./components/EntityRecognizer";
import EmailWriterPage from "./components/EmailWriterPage";
import TranslationPage from "./components/TranslationPage";
import TransliterationPage from "./components/TransliterationPage";
import Prompt from "./components/Prompt";
import "./App.css";


// Import HTML files directly
import navbarHtml from './html/Navbar.html?raw';
import footerHtml from './html/Footer.html?raw';

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Authentication from "./components/Authentication";
import Profile from './components/Profile';
import { GoogleOAuthProvider } from '@react-oauth/google';
import NavbarHandler from './components/NavbarHandler';
import ResetPassword from "./components/Authentication/ResetPassword";
import ForgotPassword from "./components/Authentication/ForgotPassword";
import QuestionWhiz from "./components/QuestionWhiz";
const App = () => {
  const location = useLocation();
  const isSpecialRoute = location.pathname === "/authenticate" || 
                     location.pathname === "/reset-password" ||
                     location.pathname === "/questiongenerator";
  const isquestionGeneratorRoute = location.pathname === "/questiongenerator";
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  // console.log("Google Client ID:", clientId);

  return (
    <GoogleOAuthProvider clientId={clientId}>
    <div className="app-container" style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#f1f1f1",
    }}>
      {/* Conditionally render Navbar */}
      { <div dangerouslySetInnerHTML={{ __html: navbarHtml }} />}
      <NavbarHandler />
        <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="main-content" style={{ 
        display: "flex",
        flex: 1,
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
        backgroundColor: "#fff",
        boxShadow: isquestionGeneratorRoute? "0px" :"0 0 20px rgba(0, 0, 0, 0.15)"
      }}>
        {/* Left Sidebar - only show if not on auth route */}
        {!isSpecialRoute && (
          <div className="sidebar" style={{ 
            width: "200px",
            borderRight: "1px solid #eaeaea",
            padding: "20px 0",
            backgroundColor: "#fff"
          }}>
            <h2 style={{ 
              color: "#190A89", 
              margin: "0 0 30px 20px",
              fontSize: "1.5rem",
              fontWeight: "600"
            }}>EasyWithAI</h2>
            
            <nav>
              <ul style={{ 
                listStyleType: "none", 
                padding: 0,
                margin: 0
              }}>
                {[
                  { path: "/entity", label: "Entity Recognizer", icon: "👨‍💼" },
                  { path: "/email-writer", label: "Email Writer", icon: "✉️" },
                  { path: "/translation", label: "Translation", icon: "🌐" },
                  { path: "/transliteration", label: "Transliteration", icon: "📝" }
                ].map(({ path, label, icon }) => (
                  <li key={path}>
                    <Link to={path} style={{ 
                      textDecoration: "none", 
                      color: "#333",
                      display: "flex",
                      alignItems: "center",
                      padding: "12px 20px",
                      transition: "background-color 0.2s",
                      borderLeft: "3px solid transparent"
                    }}
                    className="nav-link-left"
                    >
                      <span style={{ 
                        marginRight: "12px", 
                        fontSize: "18px"
                      }}>{icon}</span>
                      <span style={{
                        fontWeight: "500"
                      }}>{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Main Content - adjust width based on route */}
        <div className="content-area" style={{ 
          flex: 1,
          padding: "20px",
          overflowY: "auto",
          backgroundColor: isquestionGeneratorRoute? "#f1f1f1":"white",
          minHeight: "calc(100vh - 60px)",
          border: isquestionGeneratorRoute? "0px" : "1px solid #ccc",
          width: isSpecialRoute ? "100%" : "auto",
        }}>
          <Routes>
            <Route path="/" element={<EntityRecognizer />} />
            <Route path="/entity" element={<EntityRecognizer />} />
            <Route path="/email-writer" element={<EmailWriterPage />} />
            <Route path="/translation" element={<TranslationPage />} />
            <Route path="/transliteration" element={<TransliterationPage />} />
            <Route path="/authenticate" element={<Authentication />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/questiongenerator" element={<QuestionWhiz/>}></Route>
          </Routes>
        </div>

        {/* Right Sidebar - only show if not on auth route */}
        {!isSpecialRoute && (
          <div className="settings-panel" style={{ 
            width: "250px",
            padding: "20px",
            borderLeft: "1px solid #eaeaea",
            backgroundColor: "#fff",
            overflowY: "auto"
          }}>
            <Prompt />
          </div>
        )}
      </div>
      
      {/* Conditionally render Footer */}
      { <div dangerouslySetInnerHTML={{ __html: footerHtml }} />}
    </div>
    </GoogleOAuthProvider>
  );
};

export default App;
