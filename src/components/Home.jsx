import React, { useState, useRef, useEffect } from 'react';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDatabase,
  faCode,
  faTrophy,
  faComments,
  faGraduationCap,
  faUsers,
  faQuestionCircle,
  faFileAlt,
  faChalkboardTeacher,
  faUserShield,
  faChevronDown,
  faChevronUp,
  faChartLine,
  faChartBar,
  faChartPie,
  faCoins
} from '@fortawesome/free-solid-svg-icons';
import { authService } from './Authentication/authService.jsx';
import StatStudent from './GradeMaster/StatStudent';
import StatEvaluator from './GradeMaster/StatEvaluators';
import StatAdmin from './GradeMaster/StatAdmin';
import { PaymentService } from './Upgrade/PaymentService';
import gsap from 'gsap';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const currentUser = authService.getCurrentUser();
  const [expandedSections, setExpandedSections] = useState({});
  const titleRef = useRef(null);
  const [credits, setCredits] = useState({
    total_credit: 0,
    loading: true,
  });
  const [programmingQuestions, setProgrammingQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
      });
    }

    const fetchCredits = async () => {
      try {
        const data = await PaymentService.getUserCredits();
        setCredits({
          total_credit: parseFloat(data.total_credit) || 0,
          loading: false,
        });
      } catch (error) {
        toast.error(error.message || 'Failed to load credit balance');
        setCredits(prev => ({ ...prev, loading: false }));
      }
    };

    const fetchProgrammingQuestions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/questions/');
        const data = await response.json();
        setProgrammingQuestions(data);
      } catch (error) {
        console.error('Error fetching programming questions:', error);
      }
    };

    if (currentUser) {
      fetchCredits();
      fetchProgrammingQuestions();
    } else {
      setCredits({ total_credit: 0, loading: false });
      setProgrammingQuestions([]);
    }

  }, [currentUser]);

  const handleProgrammingClick = () => {
    navigate('/programming');
  };

  if (!currentUser) {
    return (
      <div className="home-root">
        <div className="service-item p-4 text-center">
          <div className="service-icon">
            <FontAwesomeIcon icon={faUserShield} />
          </div>
          <h5>Please Log In</h5>
          <p>to view this page</p>
        </div>
      </div>
    );
  }

  const userName = currentUser?.username || currentUser?.email || "User";
  const userRoles = Array.isArray(currentUser.roles) ? currentUser.roles : currentUser.roles?.split(',') || [];

  const toggleSection = (roleKey) => {
    setExpandedSections(prevState => ({
      ...prevState,
      [roleKey]: !prevState[roleKey]
    }));
  };

  const renderStatisticsSections = () => {
    if (!userRoles || userRoles.length === 0) {
      return (
        <div className="row g-4">
          <div className="col-sm-6 col-lg-3">
            <div className="service-item p-4 text-center">
              <div className="service-icon">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </div>
              <h5>Loading Statistics</h5>
              <p>fetching user data</p>
            </div>
          </div>
        </div>
      );
    }

    const sectionsToRender = [];
    const roleButtons = [];

    const roleMap = {
      'student': { 
        component: <StatStudent />, 
        title: 'Student Statistics',
        icon: faGraduationCap,
        color: '#457ef1'
      },
      'evaluator': { 
        component: <StatEvaluator />, 
        title: 'Evaluator Statistics',
        icon: faChalkboardTeacher,
        color: '#fba452'
      },
      'qp_uploader': { 
        component: <StatAdmin />, 
        title: 'Admin Statistics',
        icon: faUserShield,
        color: '#2d5bb8'
      },
    };

    Object.keys(roleMap).forEach(roleKey => {
      if (userRoles.some(role => role.toLowerCase() === roleKey.toLowerCase())) {
        const isExpanded = !!expandedSections[roleKey];
        const { icon, color } = roleMap[roleKey];
        
        roleButtons.push(
          <div key={roleKey} className="col-sm-6 col-lg-3">
            <div 
              className="service-item p-4 text-center animate-card"
              onClick={() => toggleSection(roleKey)}
            >
              <div className="service-icon">
                <FontAwesomeIcon icon={icon} style={{ color }} />
              </div>
              <h5>{roleMap[roleKey].title}</h5>
              <p>Click to {isExpanded ? 'hide' : 'show'} statistics</p>
            </div>
          </div>
        );

        if (isExpanded) {
          sectionsToRender.push(
            <div key={`content-${roleKey}`} className="section-content">
              {roleMap[roleKey].component}
            </div>
          );
        }
      }
    });

    if (roleButtons.length === 0) {
      return (
        <div className="row g-4">
          <div className="col-sm-6 col-lg-3">
            <div className="service-item p-4 text-center">
              <div className="service-icon">
                <FontAwesomeIcon icon={faQuestionCircle} />
              </div>
              <h5>Welcome</h5>
              <p>No statistics available</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="all-stats-container">
        <div className="row g-4">
          {roleButtons}
        </div>
        {sectionsToRender}
      </div>
    );
  };

  return (
    <div className="home-root">
      <div className="section-title">
        <h2>Welcome, {userName}</h2>
        <p>Track your progress and explore your statistics across different roles.</p>
      </div>
  
      <div className="row g-4">
        {/* Credit Balance - Always show */}
        <div className="col-sm-6 col-lg-3">
          <div className="service-item p-4 text-center">
            <div className="service-icon">
              <FontAwesomeIcon icon={faCoins} />
            </div>
            <h5>CREDIT BALANCE</h5>
            {credits.loading ? (
              <p>Loading...</p>
            ) : (
              <p>{credits.total_credit.toFixed(7)}</p>
            )}
          </div>
        </div>
  
        {/* Programming Challenge - Conditional */}
        {programmingQuestions.length > 0 && (
          <div className="col-sm-6 col-lg-3">
            <div className="service-item p-4 text-center" onClick={handleProgrammingClick}>
              <div className="service-icon">
                <FontAwesomeIcon icon={faCode} />
              </div>
              <h5>LATEST CHALLENGE</h5>
              <p>{programmingQuestions[0].title}</p>
              <p>Difficulty: {programmingQuestions[0].difficulty}</p>
            </div>
          </div>
        )}
  
        {/* Student Statistics - Conditional */}
        {userRoles.some(role => role.toLowerCase() === 'student') && (
          <div className="col-sm-6 col-lg-3">
            <div className="service-item p-4 text-center" onClick={() => toggleSection('student')}>
              <div className="service-icon">
                <FontAwesomeIcon icon={faGraduationCap} style={{ color: '#457ef1' }} />
              </div>
              <h5>Student Statistics</h5>
              <p>Click to {expandedSections['student'] ? 'hide' : 'show'} statistics</p>
            </div>
          </div>
        )}
  
        {/* Evaluator Statistics - Conditional */}
        {userRoles.some(role => role.toLowerCase() === 'evaluator') && (
          <div className="col-sm-6 col-lg-3">
            <div className="service-item p-4 text-center" onClick={() => toggleSection('evaluator')}>
              <div className="service-icon">
                <FontAwesomeIcon icon={faChalkboardTeacher} style={{ color: '#fba452' }} />
              </div>
              <h5>Evaluator Statistics</h5>
              <p>Click to {expandedSections['evaluator'] ? 'hide' : 'show'} statistics</p>
            </div>
          </div>
        )}
  
        {/* Admin Statistics - Conditional */}
        {userRoles.some(role => role.toLowerCase() === 'qp_uploader') && (
          <div className="col-sm-6 col-lg-3">
            <div className="service-item p-4 text-center" onClick={() => toggleSection('qp_uploader')}>
              <div className="service-icon">
                <FontAwesomeIcon icon={faUserShield} style={{ color: '#2d5bb8' }} />
              </div>
              <h5>Admin Statistics</h5>
              <p>Click to {expandedSections['qp_uploader'] ? 'hide' : 'show'} statistics</p>
            </div>
          </div>
        )}
      </div>
  
      {/* Statistics sections content */}
      {Object.keys(expandedSections).map(roleKey => {
        if (expandedSections[roleKey]) {
          const roleMap = {
            'student': <StatStudent />,
            'evaluator': <StatEvaluator />,
            'qp_uploader': <StatAdmin />
          };
          return (
            <div key={`content-${roleKey}`} className="section-content mt-4">
              {roleMap[roleKey]}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

export default Home;