import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppContext } from "./components/AppContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Component imports
import EntityRecognizer from "./components/EntityRecognizer";
import EmailWriterPage from "./components/EmailWriterPage";
import TranslationPage from "./components/TranslationPage";
import TransliterationPage from "./components/TransliterationPage";
import EasyWithAI from "./components/easywithai";
import Home from "./components/Home";
import Prompt from "./components/Prompt";
import "./App.css";
import MainSidebar from './components/common/MainSidebar';
import footerHtml from './html/Footer.html?raw';

// Organization components
import OrganizationDashboard from './components/Organization/OrganizationDashboard';
import StudentManagement from './components/Organization/StudentManagement';
import TestManagement from './components/Organization/TestManagement';
import ProgressTracking from './components/Organization/ProgressTracking';
import OrganizationProfile from "./components/Organization/OrganizationProfile";
import AcceptInvitation from './components/Auth/AcceptInvitation';
import TestResults from "./components/Organization/TestResults";

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
import GradingResult from "./components/GradeMaster/GradingResult";

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
import Login from "./components/Authentication/Login";
import CodeEditor from "./components/Programming/CodeEditor";
import GenerateQuestions from "./components/Programming/GenerateQuestions";
import QuestionList from "./components/Programming/QuestionList";
import FullGradingDetails from './components/GradeMaster/FullGradingDetails';
import { NotificationProvider } from './contexts/NotificationContext';
import GlobalNotification from './components/GlobalNotification/GlobalNotification';
import './components/Organization/Organization.css';
import OrganizationSignup from "./components/Authentication/OrganizationSignup";

const App = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isSpecialRoute = location.pathname === "/authenticate" || 
                     location.pathname === "/reset-password" ||
                     location.pathname === "/login";
  const isquestionGeneratorRoute = location.pathname === "/questiongenerator";
  const isGradeMasterRoute = location.pathname.startsWith("/grade-master");
  const isOrganization  = location.pathname.startsWith("/organization");
  const isProgrammingRoute = location.pathname.startsWith("/programming") || 
                            location.pathname === "/qngenerate";
  const isHomePage = location.pathname === "/" || location.pathname === "/easywithai";
  const isProfilePage = location.pathname === "/profile";
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const menuItems = [
    { path: "/easywithai", label: "EasyWithAI", icon: "🤖" },
    { path: "/email-writer", label: "Email Writer", icon: "✉️" },
    { path: "/translation", label: "Translation", icon: "🌐" },
    { path: "/transliteration", label: "Transliteration", icon: "📝" }
  ];

  // Check if we should show the sidebar
  const shouldShowSidebar = !isSpecialRoute && !isquestionGeneratorRoute && 
                          !isGradeMasterRoute && !isProfilePage && !isProgrammingRoute &&
                          location.pathname !== "/easywithai"&& location.pathname !== "/"
                          &&!isOrganization && location.pathname !== "/accept-invitation";

  // Add event listener for sidebar state changes
  useEffect(() => {
    const handleSidebarState = (e) => {
      setIsSidebarCollapsed(e.detail);
    };
    window.addEventListener('sidebarStateChange', handleSidebarState);
    return () => window.removeEventListener('sidebarStateChange', handleSidebarState);
  }, []);

  return (
    <NotificationProvider>
      <GoogleOAuthProvider clientId={clientId}>
        <div className="app-container">
          <GlobalNotification />
          <ToastContainer position="top-right" autoClose={3000} />
        
          <div className="main-content">
            {/* Main Sidebar - show on all pages except special routes and programming routes */}
            {!isSpecialRoute && !isProgrammingRoute && !isOrganization && <MainSidebar />}
            
            {/* Content Wrapper */}
            <div className={`content-wrapper ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{ 
              marginLeft: (isSpecialRoute || isProgrammingRoute || isOrganization) ? "0" : (isSidebarCollapsed ? "60px" : "250px"),
              transition: "margin-left 0.3s ease"
            }}>
              {/* Main Content */}
              <div className="content-area">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/entity" element={<EntityRecognizer />} />
                  <Route path="/easywithai" element={<EasyWithAI />} />
                  <Route path="/email-writer" element={<EmailWriterPage />} />
                  <Route path="/translation" element={<TranslationPage />} />
                  <Route path="/transliteration" element={<TransliterationPage />} />
                  <Route path="/text-summarizer" element={<EntityRecognizer />} />
                  <Route path="/code-generator" element={<EntityRecognizer />} />
                  <Route path="/question-extractor" element={<EntityRecognizer />} />
                  <Route path="/password-generator" element={<EntityRecognizer />} />
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
                  <Route path="/grade-master/grading-result" element={<GradingResult />} />
                  <Route path="/grade-master/full-grading-details" element={<FullGradingDetails />} />
                  <Route path="/login" element={<Login />} />
                  {/* Programming routes */}
                  <Route path="/qngenerate" element={<GenerateQuestions />} />
                  <Route path="/programming" element={<QuestionList />} />
                  <Route path="/programming/code-editor/:id" element={<CodeEditor />} />
                  {/* Organization routes */}
                  <Route path="/organization" element={<OrganizationDashboard />}>
                    <Route index element={<StudentManagement />} />
                    <Route path="students" element={<StudentManagement />} />
                    <Route path="tests" element={<TestManagement />} />
                    <Route path="test-results" element={<TestResults />} />
                    <Route path="progress" element={<ProgressTracking />} />
                    <Route path="profile" element={<OrganizationProfile />} />
                  </Route>
                  {/* Organization authentication routes */}
                  <Route path="/organization-register" element={<OrganizationSignup />} />
                  {/* Student invitation route */}
                  <Route path="/accept-invitation/:token" element={<AcceptInvitation />} />
                </Routes>
              </div>

              {/* Right Sidebar - only show if not on special routes and not on profile page */}
              {shouldShowSidebar && (
                <div className="settings-panel">
                  <Prompt />
                </div>
              )}
            </div>
          </div>
        
          {/* Only show footer on home page */}
          {isHomePage && (
            <div className={`footer-container ${isSidebarCollapsed ? 'collapsed' : ''}`} style={{ 
              marginLeft: (isSpecialRoute || isProgrammingRoute || isOrganization) ? "0" : (isSidebarCollapsed ? "60px" : "250px"),
              transition: "margin-left 0.3s ease"
            }}>
              <div dangerouslySetInnerHTML={{ __html: footerHtml }} />
            </div>
          )}
        </div>
      </GoogleOAuthProvider>
    </NotificationProvider>
  );
};

export default App;
