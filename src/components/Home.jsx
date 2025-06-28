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
  faCoins,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { authService } from './Authentication/authService.jsx';
import StatStudent from './GradeMaster/StatStudent';
import StatEvaluator from './GradeMaster/StatEvaluators';
import StatAdmin from './GradeMaster/StatAdmin';
import Mentor from './GradeMaster/Mentor';
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
  const [isLoading, setIsLoading] = useState(true);
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
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );
        
        const data = await Promise.race([
          PaymentService.getUserCredits(),
          timeoutPromise
        ]);
        
        setCredits({
          total_credit: parseFloat(data.total_credit) || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Credit fetch error:', error);
        setCredits({ total_credit: 0, loading: false });
      }
    };

    const fetchProgrammingQuestions = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('http://localhost:8000/api/questions/', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setProgrammingQuestions(Array.isArray(data) ? data : []);
        } else {
          setProgrammingQuestions([]);
        }
      } catch (error) {
        console.error('Error fetching programming questions:', error);
        setProgrammingQuestions([]);
      }
    };

    const loadData = async () => {
      if (currentUser) {
        await Promise.all([
          fetchCredits(),
          fetchProgrammingQuestions()
        ]);
      } else {
        setCredits({ total_credit: 0, loading: false });
        setProgrammingQuestions([]);
      }
      setIsLoading(false);
    };
    
    loadData();

  }, [currentUser]);

  const handleProgrammingClick = () => {
    navigate('/programming');
  };

  if (isLoading) {
    return (
      <div className="home-root">
        <div className="service-item p-4 text-center">
          <div className="service-icon">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </div>
          <h5>Loading...</h5>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

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
  // Use boolean fields for roles
  const isStudent = !!currentUser.is_student;
  const isEvaluator = !!currentUser.is_evaluator;
  const isQPUploader = !!currentUser.is_qp_uploader;
  const isMentor = !!currentUser.is_mentor;

  const toggleSection = (roleKey) => {
    setExpandedSections(prevState => ({
      ...prevState,
      [roleKey]: !prevState[roleKey]
    }));
  };

  const renderStatisticsSections = () => {
    if (!isStudent && !isEvaluator && !isQPUploader && !isMentor) {
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
        color: '#457ef1',
        show: isStudent
      },
      'evaluator': { 
        component: <StatEvaluator />, 
        title: 'Evaluator Statistics',
        icon: faChalkboardTeacher,
        color: '#fba452',
        show: isEvaluator
      },
      'qp_uploader': { 
        component: <StatAdmin />, 
        title: 'Admin Statistics',
        icon: faUserShield,
        color: '#2d5bb8',
        show: isQPUploader
      },
      'mentor': {
        component: <Mentor />, 
        title: 'Mentor Statistics',
        icon: faUserTie,
        color: '#4caf50',
        show: isMentor
      }
    };

    Object.keys(roleMap).forEach(roleKey => {
      if (roleMap[roleKey].show) {
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
        {isStudent && (
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
        {isEvaluator && (
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
        {isQPUploader && (
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
        {/* Mentor Statistics - Conditional */}
        {isMentor && (
          <div className="col-sm-6 col-lg-3">
            <div className="service-item p-4 text-center" onClick={() => toggleSection('mentor')}>
              <div className="service-icon">
                <FontAwesomeIcon icon={faUserTie} style={{ color: '#4caf50' }} />
              </div>
              <h5>Mentor Statistics</h5>
              <p>Click to {expandedSections['mentor'] ? 'hide' : 'show'} statistics</p>
            </div>
          </div>
        )}
      </div>
      {renderStatisticsSections()}
    </div>
  );
};

export default Home;