import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from './Authentication/authService'; // Adjust the import path as necessary
import userProfileImg from '../assets/userProfile.jpeg';

function NavbarHandler() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get references to navbar elements
    const profileIcon = document.getElementById('profile-icon');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (!profileIcon || !profileDropdown) return;
    
    // Check if user is logged in using authService
    const isLoggedIn = authService.isAuthenticated();
    const user = authService.getCurrentUser();
    
    // Handle profile icon click
    const handleProfileClick = (e) => {
      e.preventDefault();
      
      if (isLoggedIn) {
        // Toggle dropdown
        profileDropdown.classList.toggle('show');
        
        // Populate dropdown content
        profileDropdown.innerHTML = `
          <div class="dropdown-user-info">
            <img src="${userProfileImg}" alt="Profile" class="dropdown-profile-photo">
            <div>
              <div class="dropdown-email">${user?.email || 'No email'}</div>
             
            </div>
          </div>
          <div class="dropdown-item" id="profile-link">
            My Profile
          </div>
          
          <div class="dropdown-divider"></div>
          <div class="dropdown-item logout" id="logout-link">
            Logout
          </div>
        `;
        
        // Add event listeners to dropdown items
        document.getElementById('profile-link')?.addEventListener('click', () => {
          navigate('/profile');
          profileDropdown.classList.remove('show');
        });
        
        document.getElementById('settings-link')?.addEventListener('click', () => {
          navigate('/settings');
          profileDropdown.classList.remove('show');
        });
        
        document.getElementById('logout-link')?.addEventListener('click', () => {
          handleLogout();
          profileDropdown.classList.remove('show');
        });
      } else {
        // Redirect to authentication page
        navigate('/authenticate');
      }
    };
    
    // Handle logout
    const handleLogout = () => {
      authService.logout();
      toast.success("Logged out successfully");
      navigate('/');
    };
    
    // Close dropdown when clicking outside
    const handleOutsideClick = (e) => {
      if (profileDropdown.classList.contains('show') && 
          !profileIcon.contains(e.target) && 
          !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('show');
      }
    };
    
    // Add event listeners
    profileIcon.addEventListener('click', handleProfileClick);
    document.addEventListener('click', handleOutsideClick);
    
    // Clean up event listeners on component unmount
    return () => {
      profileIcon.removeEventListener('click', handleProfileClick);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [navigate]);
  
  // This component doesn't render anything
  return null;
}

export default NavbarHandler;

// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { authService } from './Authentication/authService';
// import { PaymentService } from './Upgrade/PaymentService'; // Import PaymentService
// import userProfileImg from '../assets/userProfile.jpeg';

// function NavbarHandler() {
//   const navigate = useNavigate();
//   const [credits, setCredits] = useState(null);
  
//   useEffect(() => {
//     const fetchCredits = async () => {
//       try {
//         if (authService.isAuthenticated()) {
//           const creditData = await PaymentService.getUserCredits();
//           setCredits(creditData);
//         }
//       } catch (error) {
//         console.error("Failed to fetch credits:", error);
//       }
//     };
    
//     fetchCredits();
    
//     // Get references to navbar elements
//     const profileIcon = document.getElementById('profile-icon');
//     const profileDropdown = document.getElementById('profile-dropdown');
    
//     if (!profileIcon || !profileDropdown) return;
    
//     // Check if user is logged in using authService
//     const isLoggedIn = authService.isAuthenticated();
//     const user = authService.getCurrentUser();
    
//     // Handle profile icon click
//     const handleProfileClick = (e) => {
//       e.preventDefault();
      
//       if (isLoggedIn) {
//         // Toggle dropdown
//         profileDropdown.classList.toggle('show');
        
//         // Populate dropdown content
//         profileDropdown.innerHTML = `
//           <div class="dropdown-user-info">
//             <img src="${userProfileImg}" alt="Profile" class="dropdown-profile-photo">
//             <div>
//               <div class="dropdown-email">${user?.email || 'No email'}</div>
//               ${credits ? `
//                 <div class="credit-balance">
//                   <span>Credits: $${credits.total_credit.toFixed(2)}</span>
//                   <small>($${credits.free_credit.toFixed(2)} free + $${credits.paid_credit.toFixed(2)} paid)</small>
//                 </div>
//               ` : ''}
//             </div>
//           </div>
//           <div class="dropdown-item" id="profile-link">
//             <i class="fas fa-user"></i> My Profile
//           </div>
//           <div class="dropdown-item" id="upgrade-link">
//             <i class="fas fa-arrow-up"></i> Upgrade Credits
//           </div>
//           <div class="dropdown-divider"></div>
//           <div class="dropdown-item logout" id="logout-link">
//             <i class="fas fa-sign-out-alt"></i> Logout
//           </div>
//         `;
        
//         // Add event listeners to dropdown items
//         document.getElementById('profile-link')?.addEventListener('click', () => {
//           navigate('/profile');
//           profileDropdown.classList.remove('show');
//         });
        
//         document.getElementById('upgrade-link')?.addEventListener('click', () => {
//           navigate('/upgrade');
//           profileDropdown.classList.remove('show');
//         });
        
//         document.getElementById('logout-link')?.addEventListener('click', () => {
//           handleLogout();
//           profileDropdown.classList.remove('show');
//         });
//       } else {
//         // Redirect to authentication page
//         navigate('/authenticate');
//       }
//     };
    
//     // Handle logout
//     const handleLogout = () => {
//       authService.logout();
//       toast.success("Logged out successfully");
//       navigate('/');
//     };
    
//     // Close dropdown when clicking outside
//     const handleOutsideClick = (e) => {
//       if (profileDropdown.classList.contains('show') && 
//           !profileIcon.contains(e.target) && 
//           !profileDropdown.contains(e.target)) {
//         profileDropdown.classList.remove('show');
//       }
//     };
    
//     // Add event listeners
//     profileIcon.addEventListener('click', handleProfileClick);
//     document.addEventListener('click', handleOutsideClick);
    
//     // Clean up event listeners on component unmount
//     return () => {
//       profileIcon.removeEventListener('click', handleProfileClick);
//       document.removeEventListener('click', handleOutsideClick);
//     };
//   }, [navigate, credits]);
  
//   return null;
// }

// export default NavbarHandler;