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
  console.log('Home component rendered. Current User:', currentUser?.id, currentUser);
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
        <div className="home-toolbox">
          <div className="home-toolbox-content">
            <span className="home-toolbox-text">Please Log In</span>
            <p className="home-toolbox-description">to view this page</p>
          </div>
        </div>
      </div>
    );
  }

  const userName = currentUser?.username || currentUser?.email || "User";
  const loginStreak = 3;
  const tierProgress = 0;
  const tierGoal = "Contributor";

  let userRoles = [];
  if (currentUser?.roles) {
    userRoles = Array.isArray(currentUser.roles) ? currentUser.roles : currentUser.roles.split(',');
  } else {
    const rolesString = localStorage.getItem('roles');
    userRoles = rolesString ? rolesString.split(',') : [];
  }

  const publicActivity = Array(21).fill(false);
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const toggleSection = (roleKey) => {
    setExpandedSections(prevState => ({
      ...prevState,
      [roleKey]: !prevState[roleKey]
    }));
  };

  const renderStatisticsSections = () => {
    if (!userRoles || userRoles.length === 0) {
      return (
        <div className="home-toolset-row">
          <div className="home-toolbox">
            <div className="home-toolbox-content">
              <span className="home-toolbox-text">Loading Statistics</span>
              <p className="home-toolbox-description">fetching user data</p>
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
          <div 
            key={roleKey} 
            className="home-toolbox" 
            onClick={() => toggleSection(roleKey)}
            style={{ '--hover-color': color }}
          >
            <div className="home-toolbox-content">
              <span className="home-toolbox-text">{roleMap[roleKey].title}</span>
              <p className="home-toolbox-description">
                Click to {isExpanded ? 'hide' : 'show'} statistics
              </p>
            </div>
            <FontAwesomeIcon 
              icon={icon} 
              className="home-toolbox-img"
              style={{ color: color }}
            />
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
        <div className="home-toolset-row">
          <div className="home-toolbox">
            <div className="home-toolbox-content">
              <span className="home-toolbox-text">Welcome</span>
              <p className="home-toolbox-description">No statistics available</p>
            </div>
            <FontAwesomeIcon icon={faQuestionCircle} className="home-toolbox-img" />
          </div>
        </div>
      );
    }

    return (
      <div className="all-stats-container">
        <div className="home-toolset-row">
          {roleButtons}
        </div>
        {sectionsToRender}
      </div>
    );
  };

  return (
    <div className="home-root">
      <h1 className="home-title" ref={titleRef}>
        Welcome, {userName}
      </h1>
      <p className="home-description">
        Track your progress and explore your statistics across different roles.
      </p>

      <div className="home-toolset-row">
        <div className="home-toolbox">
          <div className="home-toolbox-content">
            <span className="home-toolbox-text">CREDIT BALANCE</span>
            {credits.loading ? (
              <p className="home-toolbox-description">Loading...</p>
            ) : (
              <p className="home-toolbox-description">{credits.total_credit.toFixed(7)}</p>
            )}
          </div>
          <FontAwesomeIcon icon={faCoins} className="home-toolbox-img" />
        </div>

        {programmingQuestions.length > 0 && (
          <div className="home-toolbox">
            <div className="home-toolbox-content">
              <span className="home-toolbox-text">LATEST CHALLENGE</span>
              <p className="home-toolbox-description">{programmingQuestions[0].title}</p>
              <p className="home-toolbox-description">Difficulty: {programmingQuestions[0].difficulty}</p>
            </div>
             <FontAwesomeIcon icon={faCode} className="home-toolbox-img" />
          </div>
        )}
      </div>

      {renderStatisticsSections()}
    </div>
  );
};

export default Home;