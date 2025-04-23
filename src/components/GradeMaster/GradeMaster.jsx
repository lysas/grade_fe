// import React, { useEffect } from 'react';
// import { Routes, Route, useNavigate } from 'react-router-dom';
// // import GradeMasterLogin from './GradeMasterLogin';
// // import GradeMasterSignup from './GradeMasterSignup';
// import Student from './Student';
// import Mentor from './Mentor';
// import Admin from './Admin';
// import Evaluator from './Evaluator';
// import './GradeMaster.css';  // Importing the CSS file

// const GradeMaster = () => {
//   const path = '';
//   const url = '';
//   const navigate = useNavigate();

//   // Check if the user is logged in by looking at local storage
//   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

//   // Optionally, clear local storage on logout (if you implement a logout feature)
//   const handleLogout = () => {
//     navigate(`/authenticate`);
//   };

//   // Get user data from localStorage
//   const userData = {
//     id: localStorage.getItem('userId'),
//     email: localStorage.getItem('userEmail'),
//     role: localStorage.getItem('activeRole'),
//     is_allowed: localStorage.getItem("is_allowed"),
//     // is_allowed:false,
//   };

//   // Redirect based on the role after the component mounts
//   useEffect(() => {
//     if (isLoggedIn && userData.role) {
//       switch (userData.role) {
//         case 'student':
//           navigate(`${url}/student`);
//           break;
//         case 'mentor':
//           navigate(`${url}/mentor`);
//           break;
//         case "admin":
//           if (userData.is_allowed === 'false') {
//             navigate("/role-completion");
//           } else {
//             navigate(`${url}/admin`);
//           }
//           break;
//         case "evaluator":
//           if (userData.is_allowed === 'false') {
//             navigate("/role-completion");
//           } else {
//             navigate(`${url}/evaluator`);
//           }
//           break;
//         default:
//           console.log('Unexpected role received.');
//       }
//     }
//   }, [isLoggedIn, userData.role, navigate, url, userData.is_allowed]);

//   return (
//     <div className="grade-master-container">
//       <h1 className="grade-master-title">Welcome to GradeMaster</h1>

//       <Routes>
//         {/* <Route path={`${path}/login`} element={<GradeMasterLogin />} />
//         <Route path={`${path}/signup`} element={<GradeMasterSignup />} /> */}
//         <Route path={`${path}/student`} element={<Student />} />
//         <Route path={`${path}/mentor`} element={<Mentor />} />
//         <Route path={`${path}/admin`} element={<Admin />} />
//         <Route path={`${path}/evaluator`} element={<Evaluator />} />
//         <Route path={path} element={
//           <div className="roles-section">
//             <h2>Roles in GradeMaster</h2>
           
//             <div className="roles">
//               <div className="role">
//                 <h3>Student</h3>
//                 <ul>
//                   <li>Take tests</li>
//                   <li>Give feedback on question papers</li>
//                   <li>Get results and feedback</li>
//                 </ul>
//               </div>
//               <div className="role">
//                 <h3>Evaluator</h3>
//                 <ul>
//                   <li>Download answer sheets</li>
//                   <li>Update marks</li>
//                   <li>Provide feedback</li>
//                 </ul>
//               </div>
//               <div className="role">
//                 <h3>Admin</h3>
//                 <ul>
//                   <li>Upload question papers</li>
//                 </ul>
//               </div>
//               <div className="role">
//                 <h3>Mentor</h3>
//                 <ul>
//                   <li>View student details</li>
//                   <li>Monitor student performance</li>
//                 </ul>
//               </div>
//               <button onClick={handleLogout} className="auth-button logout-button">
//                 Get Started
//               </button>
//             </div>
//           </div>
//         } />
//       </Routes>
//     </div>
//   );
// };

// export default GradeMaster;

import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Student from './Student';
import Mentor from './Mentor';
import Admin from './Admin';
import Evaluator from './Evaluator';
import './GradeMaster.css';
import { authService } from "../Authentication/authService";

const GradeMaster = () => {
  const navigate = useNavigate();

  // Check if the user is logged in by looking at local storage
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Handle logout or getting started
  const handleGetStarted = () => {
    navigate('/authenticate');
  };
  const user = authService.getCurrentUser();

  // Get user data from localStorage
  const userData = {
    id: user?.id,
    email: user?.email,
    role: localStorage.getItem('activeRole'),
    is_allowed: user?.is_allowed,
  };

  // Redirect based on the role after the component mounts
  useEffect(() => {
    if (isLoggedIn && userData.role) {
      switch (userData.role) {
        case 'student':
          navigate('/grade-master/student');
          break;
        case 'mentor':
          navigate('/grade-master/mentor');
          break;
        case "qp_uploader":
          if (userData.is_allowed === false || 
            userData.is_allowed === 'false' || 
            userData.is_allowed === 'False' ||
            String(userData.is_allowed).toLowerCase() === 'false') {
            navigate("/grade-master/role-completion");
          } else {
            navigate('/grade-master/qp_uploader');
          }
          break;
        case "evaluator":
          console.log(userData.is_allowed);
          if (userData.is_allowed === false || 
            userData.is_allowed === 'false' || 
            userData.is_allowed === 'False' ||
            String(userData.is_allowed).toLowerCase() === 'false') {
            navigate("/grade-master/role-completion");
          } else {
            navigate('/grade-master/evaluator');
          }
          break;
        default:
          console.log(userData.role);
          console.log('Unexpected role received.');
      }
    }
  }, [isLoggedIn, userData.role, navigate, userData.is_allowed]);

  return (
    <div className="grade-master-container">
      <h1 className="grade-master-title">Welcome to GradeMaster</h1>

      <Routes>
        <Route path="/grade-master/student" element={<Student />} />
        <Route path="/grade-master/mentor" element={<Mentor />} />
        <Route path="/grade-master/qp_uploader" element={<Admin />} />
        <Route path="/grade-master/evaluator" element={<Evaluator />} />
        <Route path="/" element={
          <div className="roles-section">
            <h2>Roles in GradeMaster</h2>
           
            <div className="roles">
              <div className="role">
                <h3>Student</h3>
                <ul>
                  <li>Take tests</li>
                  <li>Give feedback on question papers</li>
                  <li>Get results and feedback</li>
                </ul>
              </div>
              <div className="role">
                <h3>Evaluator</h3>
                <ul>
                  <li>Download answer sheets</li>
                  <li>Update marks</li>
                  <li>Provide feedback</li>
                </ul>
              </div>
              <div className="role">
                <h3>Admin</h3>
                <ul>
                  <li>Upload question papers</li>
                </ul>
              </div>
              <div className="role">
                <h3>Mentor</h3>
                <ul>
                  <li>View student details</li>
                  <li>Monitor student performance</li>
                </ul>
              </div>
              <button onClick={handleGetStarted} className="auth-button logout-button">
                Get Started
              </button>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default GradeMaster;
