// import React from 'react';
// import { Link } from 'react-router-dom';
// import logo from  '../assets/lysa_logo.png' 

// const Navbar = () => {
//   return (
//     <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
//       <Link to="/" className="navbar-brand d-flex align-items-center px-4 px-lg-5">
//         <p className="m-0 fw-bold" style={{ fontSize: '25px' }}>
//           <img src={logo} alt="" height="100px" />
//         </p>
//       </Link>
//       <button type="button" className="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
//         <span className="navbar-toggler-icon"></span>
//       </button>
//       <div className="collapse navbar-collapse justify-content-center" id="navbarCollapse">
//         <div className="navbar-nav p-4 p-lg-0">
//           <Link to="/" className="nav-item nav-link">Home</Link>
//           <Link to="/courses" className="nav-item nav-link">Courses</Link>
//           <div className="nav-item dropdown">
//             <a href="#" className="nav-link dropdown-toggle" data-bs-toggle="dropdown">Guides</a>
//             <div className="dropdown-menu fade-down m-0">
//               <Link to="/team" className="dropdown-item">AI Glossary</Link>
//               <Link to="/testimonial" className="dropdown-item">GenAI Papers</Link>
//             </div>
//           </div>
//           <Link to="/contact" className="nav-item nav-link">Contact</Link>
//           <Link to="/login" className="nav-item nav-link"><i className="fa fa-user"></i></Link>
//           <a href="#" className="nav-item nav-link">
//             <div id="google_translate_element"></div>
//           </a>
//         </div>
//       </div>
//     </nav>
//   );
// };

// export default Navbar;
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from './authService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(authService.getCurrentUser());
    const navigate = useNavigate();

    useEffect(() => {
        const handleStorageChange = () => {
            setUser(authService.getCurrentUser());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            const profileContainer = document.getElementById('profile-container');
            const dropdown = document.getElementById('profile-dropdown');
            
            if (profileContainer && dropdown && 
                !profileContainer.contains(e.target) && 
                !dropdown.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/authenticate');
            return;
        }
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setIsDropdownOpen(false);
        toast.success('Logged out successfully');
        navigate('/', { replace: true });
    };

    const handleProfileClick = () => {
        setIsDropdownOpen(false);
        navigate('/profile');
    };

    const handleSettingsClick = () => {
        setIsDropdownOpen(false);
        navigate('/settings');
    };

    return (
        <nav className="navbar navbar-expand-lg bg-white navbar-light shadow sticky-top p-0">
            <Link to="/" className="navbar-brand d-flex align-items-center px-4 px-lg-5">
                <p className="m-0 fw-bold" style={{ fontSize: '25px' }}>
                    <img src="/lysa_logo.png" alt="Logo" height="50px" />
                </p>
            </Link>
            <button 
                type="button" 
                className="navbar-toggler me-4" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarCollapse" 
                style={{ border: 'none' }}
            >
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
                <div className="navbar-nav ms-auto p-4 p-lg-0">
                    <Link to="/" className="nav-item nav-link">Home</Link>
                    <div className="nav-item dropdown">
                        <a href="products.html" className="nav-item nav-link">Products</a>
                        <div className="dropdown-menu fade-down m-0">
                            <a href="team.html" className="dropdown-item">Assessment</a>
                            <a href="#" className="dropdown-item">Database Handling</a>
                        </div>
                    </div>
                    <a href="html/courses/courses.html" className="nav-item nav-link">Courses</a>
                    <div className="nav-item dropdown">
                        <a href="html/guides/guides.html" className="nav-item nav-link">Guides</a>
                        <div className="dropdown-menu fade-down m-0">
                            <a href="team.html" className="dropdown-item">AI Glossary</a>
                            <a href="html/guides/papers.html" className="dropdown-item">GenAI Papers</a>
                        </div>
                    </div>
                    <a href="contact.html" className="nav-item nav-link">Contact</a>
                    
                    <div className="nav-item position-relative" id="profile-container">
                        <a 
                            href="#" 
                            className="nav-item nav-link" 
                            id="profile-icon"
                            onClick={toggleDropdown}
                        >
                            <img 
                                src={user?.profile_picture || "/assets/userProfile.jpeg"} 
                                alt="Profile" 
                                className="nav-profile-photo" 
                                onError={(e) => {
                                    e.target.onerror = null; 
                                    e.target.src = "/assets/userProfile.jpeg"
                                }}
                            />
                        </a>
                        {isDropdownOpen && user && (
                            <div className="profile-dropdown show" id="profile-dropdown">
                                <div className="dropdown-user-info">
                                    <img 
                                        src={user?.profile_picture || "/assets/userProfile.jpeg"} 
                                        alt="Profile" 
                                        className="dropdown-profile-photo" 
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src = "/assets/userProfile.jpeg"
                                        }}
                                    />
                                    <div>
                                        <div className="dropdown-email">{user?.email || 'No email'}</div>
                                        <div className="dropdown-username">@{user?.username || 'user'}</div>
                                    </div>
                                </div>
                                <div className="dropdown-item" onClick={handleProfileClick}>
                                    My Profile
                                </div>
                                <div className="dropdown-item" onClick={handleSettingsClick}>
                                    Settings
                                </div>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-item logout" onClick={handleLogout}>
                                    Logout
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <a href="#" className="nav-item nav-link">
                        <div id="google_translate_element"></div>
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;