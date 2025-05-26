import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../Authentication/authService';
import './QuestionList.css';

const QuestionList = () => {
    const [questions, setQuestions] = useState([]);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if user is logged in
                if (!authService.isAuthenticated()) {
                    navigate('/authenticate');
                    return;
                }

                // Fetch questions if authenticated
                await fetchQuestions();
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    const fetchQuestions = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/questions/');
            const data = await response.json();
            setQuestions(data);
        } catch (error) {
            console.error('Error fetching questions:', error);
        }
    };

    const handleGenerateClick = () => {
        navigate('/qngenerate');
    };

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="question-list-container">
            <div className="question-list-header">
                <h2>Programming Questions</h2>
                <button onClick={handleGenerateClick} className="generate-button">
                    ➕ Generate Questions
                </button>
            </div>
            <div className="questions-grid">
                {questions.map((question) => (
                    <div key={question.id} className="question-item">
                        <Link to={`/programming/code-editor/${question.id}`} className="question-link">
                            <h3 className="question-title">{question.title}</h3>
                            <p className="question-difficulty">
                                <strong>Difficulty:</strong> {question.difficulty}
                            </p>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionList;
