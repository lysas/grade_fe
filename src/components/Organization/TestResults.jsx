import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Table from '../GradeMaster/common/Table';
import './Organization.css';

const TestResults = () => {
  const [tests, setTests] = useState([]);
  const [ongoingTests, setOngoingTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [studentResults, setStudentResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Fetch tests when component mounts
  useEffect(() => {
    console.log("[TestResults] Component mounted, fetching tests...");
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      console.log("[TestResults] Making API call to fetch tests...");
      const response = await axios.get(
        'http://localhost:8000/api/organization/tests/',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log("[TestResults] Tests fetched successfully:", response.data);
      const testsData = response.data.data || response.data;
      
      const now = new Date();
      
      // Categorize and sort tests
      const sortedTests = [...testsData].sort((a, b) => {
        const startTimeA = new Date(a.start_time);
        const endTimeA = new Date(startTimeA.getTime() + (a.duration_minutes * 60000));
        const startTimeB = new Date(b.start_time);
        const endTimeB = new Date(startTimeB.getTime() + (b.duration_minutes * 60000));
        
        // Prioritize ongoing tests, then completed (most recent first)
        const statusA = getTestStatus(a);
        const statusB = getTestStatus(b);

        if (statusA === "Ongoing" && statusB !== "Ongoing") return -1;
        if (statusA !== "Ongoing" && statusB === "Ongoing") return 1;

        if (statusA === "Completed" && statusB === "Completed") {
          return endTimeB - endTimeA; // Most recent completed first
        }

        // If both are ongoing or upcoming, sort by start time
        return startTimeA - startTimeB; 
      });
      
      console.log("[TestResults] Setting sorted tests data:", sortedTests);
      setTests(sortedTests);

      // Distribute tests into categories
      const currentOngoingTests = [];
      const currentCompletedTests = [];

      sortedTests.forEach(test => {
        const status = getTestStatus(test);
        if (status === "Ongoing") {
          currentOngoingTests.push(test);
        } else if (status === "Completed") {
          currentCompletedTests.push(test);
        }
      });

      setOngoingTests(currentOngoingTests);
      setCompletedTests(currentCompletedTests);

      // Select the first ongoing test by default, or the first completed
      if (currentOngoingTests.length > 0) {
        handleTestSelect(currentOngoingTests[0]);
      } else if (currentCompletedTests.length > 0) {
        handleTestSelect(currentCompletedTests[0]);
      } else {
        setSelectedTest(null);
        setStudentResults([]);
      }

    } catch (err) {
      console.error("[TestResults] Error fetching tests:", err);
      setError("Failed to fetch tests. Please try again.");
    }
  };

  // Helper function to get test status
  const getTestStatus = (test) => {
    const now = new Date();
    const startTime = new Date(test.start_time);
    const endTime = new Date(startTime.getTime() + (test.duration_minutes * 60000));
    
    if (endTime < now) {
      return "Completed";
    } else if (startTime <= now && endTime >= now) {
      return "Ongoing";
    } else {
      // Upcoming tests are not shown, but we still return the status for internal logic if needed
      return "Upcoming"; 
    }
  };

  const fetchStudentResults = async (testId) => {
    try {
      console.log(`[TestResults] Fetching results for test ID: ${testId}`);
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `http://localhost:8000/api/organization/tests/${testId}/results/`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log("[TestResults] Student results fetched:", response.data);
      const resultsData = response.data.data || response.data;
      setStudentResults(resultsData);
    } catch (err) {
      console.error("[TestResults] Error fetching student results:", err);
      setError("Failed to fetch student results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestSelect = (test) => {
    console.log("[TestResults] Test selected:", test);
    setSelectedTest(test);
    fetchStudentResults(test.id);
  };

  const handleViewAnswer = (answerFile) => {
    console.log("[TestResults] Viewing answer file:", answerFile);
    if (!answerFile) {
      console.error("[TestResults] No answer file URL provided");
      return;
    }
    const fileUrl = answerFile.startsWith('http') ? answerFile : `http://localhost:8000${answerFile}`;
    console.log("[TestResults] Opening file URL:", fileUrl);
    window.open(fileUrl, '_blank');
  };

  const handleViewGradingResult = async (answerId) => {
    console.log("[TestResults] Viewing grading result for answer ID:", answerId);
    if (!answerId) {
      console.error("[TestResults] No answer ID provided");
      return;
    }

    try {
      console.log("[TestResults] Fetching grading result for ID:", answerId);
      const response = await axios.get(`http://localhost:8000/api/grade/grading-result/${answerId}/`);
      console.log("[TestResults] Grading result response:", response.data);
      
      const result = response.data;
      
      if (result.graded) {
        navigate('/grade-master/grading-result', {
          state: {
            resultData: result.result_data,
            gradingId: result.grading_id,
            answerId: answerId,
            questionPaper: result.question_paper,
            questionPaperType: 'organization'
          }
        });
      } else {
        alert('Grading result is not available yet. Please try again later.');
      }
    } catch (error) {
      console.error("[TestResults] Error fetching grading result:", error);
      alert('Error fetching grading result. Please try again later.');
    }
  };

  // Define columns for the student results table
  const studentResultsColumns = [
    {
      header: 'Student Name',
      accessor: 'student_name',
    },
    {
      header: 'Email',
      accessor: 'student_email',
    },
    {
      header: 'Submission Time',
      accessor: 'submission_time',
      renderCell: (column, row) => new Date(row.submission_time).toLocaleString(),
    },
    {
      header: 'Score',
      accessor: 'score',
      renderCell: (column, row) => (
        row.score !== null ? (
          <span className="score">
            {row.score} / {row.max_score}
          </span>
        ) : (
          <span className="text-muted">Not graded</span>
        )
      ),
    },
    {
      header: 'Status',
      accessor: 'grading_complete',
      renderCell: (column, row) => (
        row.grading_complete ? (
          <span className="badge bg-success">Graded</span>
        ) : (
          <span className="badge bg-warning">Pending</span>
        )
      ),
    },
    {
      header: 'Actions',
      renderCell: (column, row) => (
        <div className="action-buttons">
          {row.answer_file && (
            <button
              className="btn btn-sm btn-info me-2"
              onClick={() => handleViewAnswer(row.answer_file)}
              title="View Answer Sheet"
            >
              <i className="fas fa-file-alt"></i> Answer
            </button>
          )}
          {row.grading_complete && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleViewGradingResult(row.answer_id)}
              title="View AI Grading Results"
            >
              <i className="fas fa-chart-bar"></i> Results
            </button>
          )}
        </div>
      ),
    },
  ];

  const renderTestsForTab = (testsToRender) => {
    // Filter tests based on search term
    const filteredTests = testsToRender.filter(test =>
      test.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredTests.length === 0) {
      return <p className="text-center mt-3">No matching tests in this category.</p>;
    }
    return (
      <div className="test-list-scrollable">
        <ul className="list-group test-list mt-3">
          {filteredTests.map(test => (
            <li 
              key={test.id} 
              className={`list-group-item list-group-item-action ${selectedTest?.id === test.id ? 'active' : ''}`}
              onClick={() => handleTestSelect(test)}
            >
              {test.title} 
              <span className="test-date ms-2">({new Date(test.start_time).toLocaleDateString()} - {test.duration_minutes} mins)</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="test-results-page">
      <div className="test-results-header">
        <h2>Test Results</h2>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="search-bar mb-3">
        <input 
          type="text"
          className="form-control"
          placeholder="Search tests by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="tabs-container mb-4">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'ongoing' ? 'active' : ''}`}
              onClick={() => setActiveTab('ongoing')}
            >
              Ongoing ({ongoingTests.length})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              Completed ({completedTests.length})
            </button>
          </li>
        </ul>

        <div className="tab-content">
          {activeTab === 'ongoing' && renderTestsForTab(ongoingTests)}
          {activeTab === 'completed' && renderTestsForTab(completedTests)}
        </div>
      </div>

      {selectedTest && (
        <div className="results-section">
          <div className="results-header">
            <h3>{selectedTest.title}</h3>
            <div className="results-summary">
              <span className="badge bg-primary">
                Total Submissions: {studentResults.length}
              </span>
              <span className="badge bg-success">
                Graded: {studentResults.filter(r => r.grading_complete).length}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading results...</p>
            </div>
          ) : studentResults.length === 0 ? (
            <div className="no-results">
              <p>No submissions found for this test</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table 
                columns={studentResultsColumns} 
                data={studentResults} 
                emptyMessage="No submissions found for this test" 
                className="customTable"
              />
            </div>
          )}
        </div>
      )}

      {!selectedTest && !loading && !error && (ongoingTests.length > 0 || completedTests.length > 0) && (
        <div className="no-test-selected text-center mt-5">
          <p className="text-muted">Please select a test from the categories above to view results.</p>
        </div>
      )}

      {!loading && !error && ongoingTests.length === 0 && completedTests.length === 0 && (
        <div className="no-tests-available text-center mt-5">
          <p className="text-muted">No tests available for your organization.</p>
        </div>
      )}

    </div>
  );
};

export default TestResults; 