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

import { updateImagePaths } from './components/updateImagePaths'; 
// Import HTML files directly
import navbarHtml from './html/Navbar.html?raw';
import Navbar from "./components/Navbar";
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
import GradeMaster from './components/GradeMaster/GradeMaster';

import UploadAnswer from "./components/GradeMaster/uploadAnser";

import Correct from "./components/GradeMaster/Correct";
import Result from "./components/GradeMaster/Result";
import UploadHistory from "./components/GradeMaster/UploadHistory";
import MyCorrection from "./components/GradeMaster/myCorrection";
import HistoryGrade from "./components/GradeMaster/HistoryGrade";
import StudentHistory from "./components/GradeMaster/StudentHistory";
import MentorRequests from "./components/GradeMaster/MentorRequests";
import StatStudent from "./components/GradeMaster/StatStudent";
import Statistics from "./components/GradeMaster/Statistics"
import StatEvaluators from "./components/GradeMaster/StatEvaluators";
import StatAdmin from "./components/GradeMaster/StatAdmin";
import QuestionPaperGen from "./components/GradeMaster/QuestionPaperGen"
import Main from "./components/GradeMaster/Main";
import RoleRedirectPage from "./components/GradeMaster/RoleRedirectPage";
import ProfileSection from "./components/GradeMaster/ProfileSection";
import Notifications from "./components/GradeMaster/Notifications";
import Student from './components/GradeMaster/Student';
import Evaluator from './components/GradeMaster/Evaluator';
import Admin from './components/GradeMaster/Admin';
import Mentor from './components/GradeMaster/Mentor';
import logo from './assets/logo.png';
import userProfile from './assets/userProfile.jpeg';
import Login from "./components/Authentication/Login";
// Then in your component, use:
const App = () => {
  const location = useLocation();
  const isSpecialRoute = location.pathname === "/authenticate" || 
                     location.pathname === "/reset-password" ||
                     location.pathname === "/questiongenerator" || location.pathname === "/grade-master"  || location.pathname.startsWith("/grade-master") || location.pathname === "/login";
  const isquestionGeneratorRoute = location.pathname === "/questiongenerator" ;
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  // console.log("Google Client ID:", clientId);
  useEffect(() => {
    updateImagePaths();
  }, []);

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
            {/* gradeMaster */}
            <Route path="/grade-master/*" element={<GradeMaster />} />
            <Route path="/grade-master/student" element={<Student />} />
            <Route path="/grade-master/mentor" element={<Mentor />} />
            <Route path="/grade-master/qp_uploader" element={<Admin />} />
            <Route path="/grade-master/evaluator" element={<Evaluator />} />
            <Route path="/grade-master/historygrade" element={<HistoryGrade />} />
          {/* <Route path="/grade-master/upgrade" element={<Upgrade />} /> */}
          {/* <Route path="/grade-master/history" element={<History />} /> */}
         
          <Route path="/grade-master/upload-answer" element={<UploadAnswer />} />
          <Route path="/grade-master/correct" element={<Correct />} />
          <Route path="/grade-master/result" element={<Result />} />
          <Route path="/grade-master/uploadHistory" element={<UploadHistory />} />
          <Route path="/grade-master/myCorrection" element={<MyCorrection />} />
          <Route path="/grade-master/studenthistory" element={<StudentHistory />} />
          <Route path="/grade-master/upload-each-question" element={<QuestionPaperGen />} />
          <Route path="/grade-master/statstudent" element={<StatStudent />} />
          <Route path="/grade-master/statistics" element={<Statistics />} />
          <Route path="/grade-master/statevaluator" element={<StatEvaluators />} />
          <Route path="/grade-master/statadmin" element={<StatAdmin />} />
          <Route path="/grade-master/notifications" element={<Notifications />} />
          <Route path="/grade-master/role-completion" element={<RoleRedirectPage />} />
          <Route path="/grade-master/profileSection" element={<ProfileSection />} />
          <Route path="/grade-master/main" element={<Main />} />
          <Route path="/login" element={<Login />} /> 
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
