import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import './CodeEditor.css';
import { authService } from '../Authentication/authService';

const CodeEditor = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(location.state?.question || null);
  const [code, setCode] = useState('print("Hello, World!")');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [gradeResult, setGradeResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is logged in
        if (!authService.isAuthenticated()) {
          navigate('/authenticate');
          return;
        }

        // Fetch question if not provided in state
        if (!question) {
          await axios
            .get(`http://localhost:8000/api/questions/${id}/`)
            .then((res) => setQuestion(res.data))
            .catch((err) => console.error('Error fetching question:', err));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [id, question, navigate]);

  const handleRunCode = async () => {
    if (isRunning) return;
    
    try {
      setIsRunning(true);
      const res = await axios.post('http://localhost:8000/api/run_code/', {
        language,
        code,
      });
      setOutput(res.data.stdout);
      setError(res.data.stderr);
      setGradeResult(null);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('An error occurred while executing the code.');
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleGradeCode = async () => {
    if (!question || isGrading) return;

    try {
      setIsGrading(true);
      const response = await fetch('http://localhost:8000/api/grade_code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          question: question.title + "\n\n" + question.description,
          sample_input: question.sample_input,
          sample_output: question.sample_output,
          user_output: output,
        }),
      });

      const result = await response.json();
      setGradeResult(result);
    } catch (err) {
      console.error("Grading failed", err);
      setGradeResult({ summary: "Grading failed. Please try again.", final_score: 0 });
    } finally {
      setIsGrading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (!question) {
    return <div className="error">Question not found</div>;
  }

  return (
    <div className="code-editor-page">
      <div className="left-panel">
        <h2>{question.title}</h2>
        <p><strong>Description:</strong> {question.description}</p>
        <p><strong>Difficulty:</strong> {question.difficulty}</p>
        <p><strong>Companies Asked:</strong> {question.companies?.map(c => c.name).join(', ') || 'N/A'}</p>

        <h4>Sample Input/Output</h4>
        <p><strong>Sample Input:</strong></p>
        <pre className="code-editor-pre">{question.sample_input}</pre>
        <p><strong>Sample Output:</strong></p>
        <pre className="code-editor-pre">{question.sample_output}</pre>

        <h4>Test Cases:</h4>
        {question.test_cases?.length > 0 ? (
          <ul>
            {question.test_cases.map((tc, idx) => (
              <li key={idx}>
                <strong>Input:</strong>
                <pre className="code-editor-pre">{tc.input}</pre>
                <strong>Expected Output:</strong>
                <pre className="code-editor-pre">{tc.expected_output}</pre>
              </li>
            ))}
          </ul>
        ) : (
          <p>No test cases available.</p>
        )}
      </div>

      <div className="right-panel">
        <div className="top-controls">
          <select
            className="dropdown"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isRunning || isGrading}
          >
            <option value="python">Python</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <button 
            className="run-button" 
            onClick={handleRunCode}
            disabled={isRunning || isGrading}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button 
            className="run-button" 
            onClick={handleGradeCode}
            disabled={isRunning || isGrading || !output}
          >
            {isGrading ? 'Grading...' : 'Grade'}
          </button>
        </div>

        <Editor
          height="400px"
          language={language}
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
          }}
        />

        <div className="code-editor-output-section">
          <h3>Output:</h3>
          <pre className="code-editor-pre">{output}</pre>

          {error && (
            <>
              <h3>Errors:</h3>
              <pre className="code-editor-error">{error}</pre>
            </>
          )}
        </div>

        {gradeResult && (
          <div className="code-editor-grading-result">
            <h3>Grading Result:</h3>
            <p><strong>Final Score:</strong> {gradeResult.final_score}</p>
            <p><strong>Summary:</strong> {gradeResult.summary}</p>

            {gradeResult.code_compiles && (
              <>
                <h4>Rubric Breakdown:</h4>
                <ul>
                  <li><strong>Code Compiles & Runs (2):</strong> {gradeResult.code_compiles.score} - {gradeResult.code_compiles.feedback}</li>
                  <li><strong>Correctness of Logic (3):</strong> {gradeResult.logic_correctness.score} - {gradeResult.logic_correctness.feedback}</li>
                  <li><strong>Output Accuracy (1):</strong> {gradeResult.output_accuracy.score} - {gradeResult.output_accuracy.feedback}</li>
                  <li><strong>Code Readability (1):</strong> {gradeResult.readability.score} - {gradeResult.readability.feedback}</li>
                  <li><strong>Use of Language Features (1):</strong> {gradeResult.language_features.score} - {gradeResult.language_features.feedback}</li>
                  <li><strong>Comments and Documentation (1):</strong> {gradeResult.documentation.score} - {gradeResult.documentation.feedback}</li>
                  <li><strong>Error Handling / Edge Cases (1):</strong> {gradeResult.error_handling.score} - {gradeResult.error_handling.feedback}</li>
                </ul>

                {gradeResult.strengths && (
                  <>
                    <h4>Strengths:</h4>
                    <p>{gradeResult.strengths}</p>
                  </>
                )}

                {gradeResult.weaknesses && (
                  <>
                    <h4>Weaknesses:</h4>
                    <p>{gradeResult.weaknesses}</p>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
