import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import "./easywithai.css";
import img2 from '../assets/homevecs/2.png';
import img3 from '../assets/homevecs/3.png';
import img4 from '../assets/homevecs/4.png';
import img5 from '../assets/homevecs/5.png';
import img6 from '../assets/homevecs/6.png';
import img7 from '../assets/homevecs/7.png';
import img8 from '../assets/homevecs/8.png';
import img9 from '../assets/homevecs/9.png';

const toolset1 = [
    { 
        title: "Entity Recognizer", 
        img: img3,
        description: "Detects names, dates, places, and more.",
        path: "/entity"
      },
  { 
    title: "Email Writer", 
    img: img2,
    description: "Instantly drafts emails from a brief prompt.",
    path: "/email-writer"
  },

//   { 
//     title: "Text Summarizer", 
//     img: img4,
//     description: "Shortens long texts into quick summaries.",
//     path: "/text-summarizer"
//   },
  { 
    title: "Translator", 
    img: img5,
    description: "Translates text between multiple languages.",
    path: "/translation"
  },
  { 
    title: "Transilarator", 
    img: img6,
    description: "Reverses translated text to its original form.",
    path: "/transliteration"
  },
];

// const toolset2 = [

//   { 
//     title: "Code Generator", 
//     img: img7,
//     description: "Creates code from user instructions.",
//     path: "/code-generator"
//   },
//   { 
//     title: "Question Extractor", 
//     img: img8,
//     description: "Pulls questions from any content.",
//     path: "/question-extractor"
//   },
//   { 
//     title: "Password Generator", 
//     img: img9,
//     description: "Builds strong and random passwords.",
//     path: "/password-generator"
//   },
// ];

const Home = () => {
  const titleRef = useRef(null);
  const navigate = useNavigate();

  const handleTitleHover = () => {
    gsap.to(titleRef.current, {
      scale: 1.1,
      duration: 0.4,
      ease: "power2.out",
      backgroundImage: "linear-gradient(90deg, #2d5bb8 0%, #d88a3d 100%)",
      "-webkit-background-clip": "text",
      backgroundClip: "text"
    });
  };

  const handleTitleLeave = () => {
    gsap.to(titleRef.current, {
      scale: 1,
      duration: 0.4,
      ease: "power2.out",
      backgroundImage: "linear-gradient(90deg, #457ef1 0%, #fba452 100%)",
      "-webkit-background-clip": "text",
      backgroundClip: "text"
    });
  };

  const handleToolboxClick = (path) => {
    navigate(path);
  };

  return (
    <div className="home-root">
      <h1 
        className="home-title" 
        ref={titleRef}
        onMouseEnter={handleTitleHover}
        onMouseLeave={handleTitleLeave}
      >
        EasywithAI
      </h1>
      <p className="home-description">
        Easy with AI is an all-in-one productivity toolkit powered by artificial intelligence.<br />
        It simplifies daily tasks, enhances writing, supports multilingual communication,<br />
        and speeds up development – all from a single platform.
      </p>
      <h2 className="home-subtitle"></h2>
      <div className="home-toolset-row">
        {toolset1.map((tool) => (
          <div 
            className="home-toolbox" 
            key={tool.title}
            onClick={() => handleToolboxClick(tool.path)}
          >
            <div className="home-toolbox-content">
              <span className="home-toolbox-text">{tool.title}</span>
              <p className="home-toolbox-description">{tool.description}</p>
            </div>
            <img src={tool.img} alt={tool.title} className="home-toolbox-img" />
          </div>
        ))}
      </div>
      {/* <h2 className="home-subtitle">Toolset 2</h2>
      <div className="home-toolset-row">
        {toolset2.map((tool) => (
          <div 
            className="home-toolbox" 
            key={tool.title}
            onClick={() => handleToolboxClick(tool.path)}
          >
            <div className="home-toolbox-content">
              <span className="home-toolbox-text">{tool.title}</span>
              <p className="home-toolbox-description">{tool.description}</p>
            </div>
            <img src={tool.img} alt={tool.title} className="home-toolbox-img" />
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default Home; 