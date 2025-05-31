import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const toolset1 = [
  { 
    title: "Entity Recognizer", 
    description: "Detects names, dates, places, and more.",
    path: "/entity",
    color: "#457ef1",
    icon: "👤"
  },
  { 
    title: "Email Writer", 
    description: "Instantly drafts emails from a brief prompt.",
    path: "/email-writer",
    color: "#fba452",
    icon: "✉️"
  },
  { 
    title: "Translator", 
    description: "Translates text between multiple languages.",
    path: "/translation",
    color: "#2d5bb8",
    icon: "🌐"
  },
  { 
    title: "Transliterator", 
    description: "Reverses translated text to its original form.",
    path: "/transliteration",
    color: "#d88a3d",
    icon: "🔄"
  },
];

const EasyWithAI = () => {
  const titleRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simple fade-in animation for title
    if (titleRef.current) {
      titleRef.current.style.opacity = '0';
      titleRef.current.style.transform = 'translateY(-20px)';
      
      setTimeout(() => {
        titleRef.current.style.transition = 'all 1s ease-out';
        titleRef.current.style.opacity = '1';
        titleRef.current.style.transform = 'translateY(0)';
      }, 100);
    }
  }, []);

  const handleToolboxClick = (path) => {
    navigate(path);
  };

  return (
    <div className="home-root">
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;900&display=swap');

        .home-root {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .section-title {
          text-align: center;
          margin-bottom: 3rem;
          color: #00b0f0;
        }

        .gradient-title {
          font-family: 'Nunito', sans-serif;
          color: '#00b0f0' !important;
          font-weight: 900;
          font-size: 3.5rem;
          letter-spacing: 2px;
          margin-bottom: 18px;
          cursor: pointer;
          outline: none;
          user-select: none;
          display: inline-block;
          transition: all 0.4s ease;
        }

        .gradient-title:hover {
          transform: scale(1.05);
        }

        .section-description {
          font-family: 'Nunito', sans-serif;
          font-weight: 400;
          font-size: 1.2rem;
          color: #4a4a4a;
          max-width: 900px;
          text-align: center;
          line-height: 1.8;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
        }

        .section-description::after {
          content: '';
          position: absolute;
          bottom: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
        }

        .tools-section {
          margin-bottom: 3rem;
        }

        .tools-section-title {
          font-family: 'Nunito', sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: #0C0B6D;
          margin: 0 0 2rem 0;
          letter-spacing: 1px;
          text-shadow: 0 2px 8px #e0e0e0;
          text-align: center;
        }

        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -0.75rem;
          margin-left: -0.75rem;
          align-items: stretch;
          justify-content: center;
        }

        .g-4 > * {
          padding-right: 1.5rem;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .col-sm-6 {
          flex: 0 0 auto;
          width: 50%;
          min-width: 280px;
        }

        .col-lg-3 {
          flex: 0 0 auto;
          width: 25%;
          min-width: 280px;
        }

        .service-item {
          transition: all 0.5s ease;
          background: #ffffff;
          overflow: hidden;
          cursor: pointer;
          height: 100%;
          box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.2);
          min-height: 180px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 1.5rem;
          text-align: center;
          position: relative;
        }

        .service-item:hover {
          margin-top: -10px;
          background: rgb(43, 169, 137); /* Use solid green on hover, matching Home.css */
          transform: translateY(-5px);
        }

        .service-item * {
          transition: all 0.3s ease-in-out;
        }

        .service-item:hover * {
          color: #f8f8f8 !important;
        }

        .service-icon {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
          font-size: 40px;
          transition: all 0.3s ease;
        }

        .service-item h5 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .service-item p {
          color: #666;
          line-height: 1.5;
          font-size: 0.9rem;
          margin: 0;
        }

        .tool-card::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .tool-card:hover::before {
          opacity: 0.3;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .animate-card {
          opacity: 0;
          transform: translateY(40px);
        }

        .animate-card.show {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-card:nth-child(1) { animation-delay: 0.1s; }
        .animate-card:nth-child(2) { animation-delay: 0.3s; }
        .animate-card:nth-child(3) { animation-delay: 0.5s; }
        .animate-card:nth-child(4) { animation-delay: 0.7s; }

        @media (max-width: 991.98px) {
          .col-lg-3 {
            width: 50%;
            max-width: 50%;
            flex: 0 0 50%;
          }
          
          .gradient-title {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 575.98px) {
          .col-sm-6 {
            width: 100%;
            max-width: 100%;
            flex: 0 0 100%;
          }
          
          .gradient-title {
            font-size: 2rem;
          }
          
          .section-description {
            font-size: 1rem;
            padding: 0 16px;
          }
          
          .tools-section-title {
            font-size: 1.2rem;
          }
        }
      `}</style>

      <div className="section-title">
        <h1 
          ref={titleRef}
          className="gradient-title"
        >
          EasyWithAI
        </h1>
        <p className="section-description">
          Easy with AI is an all-in-one productivity toolkit powered by artificial intelligence.
          It simplifies daily tasks, enhances writing, supports multilingual communication,
          and speeds up development – all from a single platform.
        </p>
      </div>

      <div className="tools-section">
        <h3 className="tools-section-title">
          Communication & Language Tools
        </h3>
        <div className="row g-4">
          {toolset1.map((tool, index) => (
            <div key={tool.title} className={`col-sm-6 col-lg-3 animate-card ${index < 4 ? 'show' : ''}`}>
              <div 
                className="service-item tool-card"
                onClick={() => handleToolboxClick(tool.path)}
              >
                <div className="service-icon" style={{ color: tool.color }}>
                  {tool.icon}
                </div>
                <h5>{tool.title.toUpperCase()}</h5>
                <p>{tool.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EasyWithAI;