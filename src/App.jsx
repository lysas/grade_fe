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
import Sidebar from './components/common/Sidebar';

const App = () => {
  const location = useLocation();
  const isSpecialRoute = location.pathname === "/authenticate" || 
                     location.pathname === "/reset-password" ||
                     location.pathname === "/questiongenerator" || 
                     location.pathname === "/grade-master" || 
                     location.pathname.startsWith("/grade-master") || 
                     location.pathname === "/login";
  const isquestionGeneratorRoute = location.pathname === "/questiongenerator";
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const menuItems = [
    { path: "/entity", label: "Entity Recognizer", icon: "👨‍💼" },
    { path: "/email-writer", label: "Email Writer", icon: "✉️" },
    { path: "/translation", label: "Translation", icon: "🌐" },
    { path: "/transliteration", label: "Transliteration", icon: "📝" }
  ];

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="app-container" style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#f1f1f1",
      }}>
        <Navbar />
        <ToastContainer position="top-right" autoClose={3000} />
      
        <div className="main-content" style={{ 
          display: "flex",
          flex: 1,
          maxWidth: "1200px",
          margin: "0 auto",
          width: "100%",
          backgroundColor: "#fff",
          boxShadow: isquestionGeneratorRoute ? "0px" : "0 0 20px rgba(150, 107, 107, 0.15)"
        }}>
          {/* Left Sidebar - only show if not on auth route */}
          {!isSpecialRoute && <Sidebar menuItems={menuItems} />}
          
          {/* Main Content */}
          <div className="content-area" style={{ 
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            backgroundColor: "white",
            minHeight: "calc(100vh - 60px)",
            border: "1px solid #ccc",
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
      
        <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
