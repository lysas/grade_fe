import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './GenerateQuestions.css';

const GenerateQuestions = () => {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('generatedQuestions');
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage only when user closes or refreshes the tab
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('generatedQuestions');
    });

    return () => {
      window.removeEventListener('beforeunload', () => {
        localStorage.removeItem('generatedQuestions');
      });
    };
  }, []); // Empty dependency array means this runs once on mount

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      const res = await axios.post('http://localhost:8000/api/generate_questions/', {
        topic,
        difficulty,
      });
      setQuestions(res.data.generated_questions);
      localStorage.setItem('generatedQuestions', JSON.stringify(res.data.generated_questions));
    } catch (err) {
      console.error('Failed to generate questions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectQuestion = (question) => {
    navigate(`/programming/code-editor/${question.id}`, { state: { question } });
  };

  return (
    <div className="generate-questions-main-container">
      <div className="generate-header">
        <h2>Generate Coding Questions</h2>
        <form className="generate-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            disabled={isGenerating}
          />
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={isGenerating}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <button type="submit" disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </form>
      </div>

      <div className="generate-container">
        <div className="question-list">
          {questions.map((q) => (
            <div
              key={q.id}
              className="question-card"
              onClick={() => handleSelectQuestion(q)}
            >
              <h4>{q.title}</h4>
              <p>{q.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerateQuestions;
