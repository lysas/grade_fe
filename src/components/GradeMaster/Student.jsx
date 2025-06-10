import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authService } from "../Authentication/authService";
import QuestionPaperGenerator from "./QuestionPaperGenerator";
import Button from "./common/Button";
import Table from "./common/Table";
import Alert from "./common/Alert";
import ProfileCard from "./common/ProfileCard";
import FilterSection from "./common/FilterSection";

// Scoped CSS using CSS modules
import "./Student.css";

const Student = () => {
  const [answeredPapers, setAnsweredPapers] = useState([]);
  const [availablePapers, setAvailablePapers] = useState([]);
  const [filteredAnsweredPapers, setFilteredAnsweredPapers] = useState([]);
  const [filteredAvailablePapers, setFilteredAvailablePapers] = useState([]);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);
  const [questionPaperType, setQuestionPaperType] = useState("sample"); // Default to sample questions
  const [availableYears, setAvailableYears] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showQuestionGenerator, setShowQuestionGenerator] = useState(false);
  const [organizationTests, setOrganizationTests] = useState([]);
  
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const lastFiveYears = Array.from({ length: 5 }, (_, index) => currentYear - index);
  
  // Add function to format UTC time to local time
  const formatLocalTime = (utcTimeString) => {
    if (!utcTimeString) return '';
    const date = new Date(utcTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const user = authService.getCurrentUser();
  
  const userData = {
    id: user?.id,
    email: user?.email,
    is_premium: user?.is_premium || false,
    organization: user?.organization || null,
    role_org: user?.role_org || null,
  };

  const isPremium = userData.is_premium === true;
  const isStudent = userData.role_org === 'student';
  
  const getUniqueYears = (papers) => {
    if (!papers || papers.length === 0) return ["All Years"];
    
    // For previous year papers, use the year property
    if (questionPaperType === "previous_year") {
      const years = papers.map(paper => paper.year?.toString());
      return ["All Years", ...new Set(years.filter(Boolean))];
    }
    
    // For sample papers, use the upload year
    const years = papers.map(paper => {
      const date = new Date(paper.upload_date);
      return date.getFullYear().toString();
    });
    return ["All Years", ...new Set(years.filter(Boolean))];
  };

  // Allow viewing all question papers regardless of subscription status
  const canViewQuestionPaper = () => {
    return true;
  };

  // Control uploading answers based on premium status
  const canUploadAnswer = (paper) => {
    // If premium, allow uploads for all papers
    if (isPremium) return true;
    
    // For free users, check if this is their first paper or if they've waited 30 days since answering
    if (answeredPapers.length === 0) return true;
    
    // If they already have answered papers, check if 30 days have passed since first paper
    const firstAnsweredDate = new Date(answeredPapers[0].upload_date);
    const today = new Date();
    const differenceInDays = Math.floor(
      (today - firstAnsweredDate) / (1000 * 60 * 60 * 24)
    );
    
    return differenceInDays >= 30;
  };

  // Fetch question papers based on type and year (if applicable)
  const fetchQuestionPapers = async () => {
    // Show question generator if user wants to create a new paper
    if (showQuestionGenerator) {
      return;
    }
    
    setIsLoading(true);
    try {
      let endpoint = "";
      let params = { user_id: userData.id };
      
      // Determine endpoint based on question paper type
      if (questionPaperType === "sample") {
        endpoint = "http://localhost:8000/api/grade/sample/";
      } else if (questionPaperType === "previous_year") {
        endpoint = "http://localhost:8000/api/grade/previous-year/";
        // Add year parameter only if a specific year is selected
        if (selectedYear !== "All Years") {
          params.year = selectedYear;
        }
      } else if (questionPaperType === "generated") {
        endpoint = "http://localhost:8000/api/grade/generated/";
      }
      else{
        endpoint = "http://localhost:8000/api/grade/qp_uploader/";
      }

      const response = await axios.get(endpoint, { params });
      console.log('API Response for answered papers:', response.data.answered_question_papers);

      const sortedAnsweredPapers =
        response.data.answered_question_papers.sort(
          (a, b) => new Date(b.upload_date) - new Date(a.upload_date)
        );

      setAnsweredPapers(sortedAnsweredPapers);
      setAvailablePapers(response.data.available_question_papers);
      setFilteredAnsweredPapers(sortedAnsweredPapers);
      setFilteredAvailablePapers(response.data.available_question_papers);
      
      // If we're fetching previous year papers, we need to get all years regardless of filtering
      if (questionPaperType === "previous_year") {
        try {
          // Make a separate call to get all years without filtering
          const allYearsResponse = await axios.get(
            "http://localhost:8000/api/grade/previous-year/", 
            { params: { user_id: userData.id } }
          );
          
          // Get unique years from both answered and available papers
          const years = [
            ...allYearsResponse.data.answered_question_papers.map(p => p.year?.toString()),
            ...allYearsResponse.data.available_question_papers.map(p => p.year?.toString())
          ].filter(Boolean);
          
          // Add "All Years" at the beginning
          setAvailableYears(["All Years", ...new Set(years)].sort((a, b) => {
            if (a === "All Years") return -1;
            if (b === "All Years") return 1;
            return parseInt(b) - parseInt(a); // Sort years in descending order
          }));
        } catch (yearErr) {
          console.error("Error fetching all years:", yearErr);
          // Fallback to years from filtered data
          setAvailableYears(getUniqueYears([
            ...response.data.answered_question_papers,
            ...response.data.available_question_papers
          ]));
        }
      } else {
        // For sample papers, use the years from the current response
        setAvailableYears(getUniqueYears([
          ...response.data.answered_question_papers,
          ...response.data.available_question_papers
        ]));
      }
    } catch (err) {
      setError("Error fetching question papers.");
      console.error("Error fetching question papers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchQuestionPapers();
  }, [userData.id]);

  // Refetch when question paper type or year changes
  useEffect(() => {
    if (!showQuestionGenerator) {
      if (questionPaperType === "organization") {
        fetchOrganizationTests();
      } else {
        fetchQuestionPapers();
      }
    }
  }, [questionPaperType, questionPaperType === "previous_year" ? selectedYear : null, showQuestionGenerator]);

  // Fetch organization tests
  const fetchOrganizationTests = async () => {
    console.log("fetchOrganizationTests called, isStudent:", isStudent);
    if (!isStudent) return;
    
    try {
      const token = localStorage.getItem('token');
      console.log("Making API call to fetch organization tests...");
      const response = await axios.get(
        `http://localhost:8000/api/organization/tests/assigned_tests/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log("Organization tests response:", response.data);
      setOrganizationTests(response.data.data || []);
    } catch (err) {
      console.error("Error fetching organization tests:", err);
    }
  };

  // Check if test is currently available based on start time and duration
  const isTestAvailable = (test) => {
    const now = new Date();
    const startTime = new Date(test.start_time);
    const endTime = new Date(startTime.getTime() + test.duration_minutes * 60000);
    
    return now >= startTime && now <= endTime;
  };

  // Handle organization test upload
  const handleOrganizationTestUpload = (test) => {
    if (!isTestAvailable(test)) {
      alert("This test is not available at the moment. Please check the start time and duration.");
      return;
    }

    navigate("/grade-master/upload-answer", {
      state: {
        questionPaper: {
          id: test.id,
          title: test.title,
          description: test.description,
          start_time: test.start_time,
          duration_minutes: test.duration_minutes,
          file: test.question_paper?.pdf_file,
          type: "organization"  // Add this to identify it's an organization test
        },
        questionPaperType: "organization",
        userId: userData.id,
        userEmail: userData.email,
        organizationId: userData.organization?.id  // Add organization ID
      },
    });
  };

  const handleUpload = (qp) => {
    if (!canUploadAnswer(qp)) {
      setShowPremiumAlert(true);
      setTimeout(() => setShowPremiumAlert(false), 10000);
      return;
    }

    navigate("/grade-master/upload-answer", {
      state: {
        questionPaper: qp,
        questionPaperType: questionPaperType,
        userId: userData.id,
        userEmail: userData.email,
      },
    });
  };

  const handleViewPaper = (file, questionPaperType = questionPaperType) => {
    if (!file) {
      console.error("No file provided");
      return;
    }

    const basePath = "http://127.0.0.1:8000/media/question_papers/";
    let folder;
    
    switch (questionPaperType) {
      case "sample":
        folder = "sample";
        break;
      case "previous_year":
        folder = "previous_year";
        break;
      case "generated":
        folder = "generated";
        break;
      case "organization":
        folder = "organization";
        break;
      default:
        folder = "qp_uploader";
    }
    
    const fileName = file.split("/").pop();
    const url = `${basePath}${folder}/${fileName}`;
    console.log("Opening question paper URL:", url);
    window.open(url, "_blank");
  };

  const handleViewAnswer = (answerFile) => {
    const basePath = "http://127.0.0.1:8000/media/answer_uploads/";
    const fileName = answerFile.split("/").pop();
    window.open(`${basePath}/${fileName}`, "_blank");
  };

  const handleSeeResult = (qpId, f, paperTitle) => {
    navigate("/grade-master/result", {
      state: { 
        questionPaperId: qpId, 
        feedbackId: f,
        questionPaperType: questionPaperType,
        questionPaperTitle: paperTitle,
      },
    });
  };

  const applyFilters = () => {
    let filteredAnswered = [...answeredPapers];
    let filteredAvailable = [...availablePapers];
    
    // Filter by subject
    if (selectedSubject !== "All Subjects") {
      filteredAnswered = filteredAnswered.filter(qp => 
        qp.subject && qp.subject.trim().toLowerCase() === selectedSubject.trim().toLowerCase()
      );
      
      filteredAvailable = filteredAvailable.filter(qp => 
        qp.subject && qp.subject.trim().toLowerCase() === selectedSubject.trim().toLowerCase()
      );
    }
    
    // Update state with filtered papers
    setFilteredAnsweredPapers(filteredAnswered);
    setFilteredAvailablePapers(filteredAvailable);
  };

  const handleSubjectFilterChange = (e) => {
    setSelectedSubject(e.target.value);
  };
  
  const handleYearFilterChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleQuestionTypeChange = (e) => {
    const newType = e.target.value;
    console.log("Question type changed to:", newType);
    setQuestionPaperType(newType);
    setSelectedYear("All Years");
    setShowQuestionGenerator(false);
    
    if (newType === "organization") {
      console.log("Fetching organization tests...");
      fetchOrganizationTests();
    }
  };

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [selectedSubject, answeredPapers, availablePapers]);

  const handleCancel = () => {
    setShowPremiumAlert(false);
  };

  const handleStartQuestionGenerator = () => {
    setShowQuestionGenerator(true);
  };
  
  const handleCloseQuestionGenerator = () => {
    setShowQuestionGenerator(false);
  };

  const availablePapersColumns = [
    { header: "File(Click on the File)", accessor: "title" },
    { header: "Subject", accessor: "subject" },
    ...(questionPaperType === "previous_year" ? [{ header: "Year", accessor: "year" }] : []),
    { header: "Total Marks", accessor: "total_marks" },
    { header: "Upload Date", accessor: "upload_date" },
    { header: "Action", accessor: "action" }
  ];

  const answeredPapersColumns = [
    { header: "File Name", accessor: "title" },
    { header: "Subject", accessor: "subject" },
    ...(questionPaperType === "previous_year" ? [{ header: "Year", accessor: "year" }] : []),
    { header: "Total Marks", accessor: "total_marks" },
    { header: "Upload Date", accessor: "upload_date" },
    { header: "My Answer", accessor: "answer" },
    { header: "Grading", accessor: "result" }
  ];

  const renderAvailablePaperCell = (column, row) => {
    switch (column.accessor) {
      case "title":
        return (
          <Button 
            variant="viewButton" 
            onClick={() => handleViewPaper(row.file)}
          >
            {row.title}
          </Button>
        );
      case "action":
        return (
          <Button
            variant="success"
            onClick={() => handleUpload(row)}
            disabled={!canUploadAnswer(row)}
          >
            Upload
          </Button>
        );
      default:
        return row[column.accessor];
    }
  };

  const handleViewGradingResult = async (id) => {
    if (!id) {
      console.error('No ID provided');
      alert('Error: No ID found');
      return;
    }

    try {
      console.log('Fetching grading result for ID:', id);
      const response = await axios.get(`http://localhost:8000/api/grade/grading-result/${id}/`);
      console.log('Grading result response:', response.data);
      
      const result = response.data;
      
      if (result.graded) {
        navigate('/grade-master/grading-result', {
          state: {
            resultData: result.result_data,
            gradingId: result.grading_id,
            answerId: id,
            questionPaper: result.question_paper,
            questionPaperType: questionPaperType,
          }
        });
      } else {
        alert('Grading result is not available yet. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching grading result:', error);
      alert('Error fetching grading result. Please try again later.');
    }
  };

  const renderAnsweredPaperCell = (column, row) => {
    switch (column.accessor) {
      case "title":
        return (
          <Button 
            variant="viewButton" 
            onClick={() => handleViewPaper(row.file)}
          >
            {row.title}
          </Button>
        );
      case "answer":
        return (
          <Button
            variant="primary"
            onClick={() => handleViewAnswer(row.answer_file)}
          >
            Download
          </Button>
        );
      case "result":
        return (
          <div className="result-buttons">
            {row.result_status === "See Result" && row.feedback_id && (
              <Button
                variant="purple"
                onClick={() => handleSeeResult(row.id, row.feedback_id, row.title)}
              >
                Manual Grading
              </Button>
            )}
            {row.answer_file && (
              <Button
                variant="success"
                onClick={() => handleViewGradingResult(row.answer_id)}
                style={{ marginLeft: '8px' }}
              >
                AI Grading
              </Button>
            )}
            {!row.result_status && !row.answer_file && (
              <span className="pendingStatus">Pending</span>
            )}
          </div>
        );
      default:
        return row[column.accessor];
    }
  };

  // Handle viewing organization test question paper
  const handleViewOrganizationQuestionPaper = async (testId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:8000/api/organization/tests/${testId}/question_paper/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.status === 'success') {
        window.open(response.data.data.pdf_url, '_blank');
      }
    } catch (err) {
      console.error("Error fetching question paper:", err);
      alert("Error fetching question paper. Please try again.");
    }
  };

  return (
    <div className="studentPage">
      <Alert
        isOpen={showPremiumAlert}
        message="You can upload answers to one question paper per month with the free plan. Upgrade to premium for unlimited uploads and access."
        onClose={handleCancel}
        primaryButtonText="Upgrade"
        secondaryButtonText="Cancel"
        onPrimaryClick={() => {/* Handle upgrade */}}
        onSecondaryClick={handleCancel}
      />
      
      {showQuestionGenerator ? (
        <QuestionPaperGenerator
          userId={userData.id}
          onClose={handleCloseQuestionGenerator}
        />
      ) : (
        <>
          <ProfileCard
            userData={userData}
            isPremium={isPremium}
          />
      
          {error && <p className="error">{error}</p>}
      
          <section className="paperSection">
            <div className="sectionHeader">
              <h3>Question Papers</h3>
              <FilterSection
                questionPaperType={questionPaperType}
                handleQuestionTypeChange={handleQuestionTypeChange}
                selectedSubject={selectedSubject}
                handleSubjectFilterChange={handleSubjectFilterChange}
                selectedYear={selectedYear}
                handleYearFilterChange={handleYearFilterChange}
                availableYears={availableYears}
                hasOrganization={isStudent}
              />
            </div>
    
            {isLoading ? (
              <div className="loadingIndicator">Loading question papers...</div>
            ) : (
              <>
                {questionPaperType === "generated" && (
                  <div className="generateButtonContainer">
                    <Button
                      variant="success"
                      onClick={handleStartQuestionGenerator}
                    >
                      Generate Your Own Question Paper
                    </Button>
                  </div>
                )}
                
                {questionPaperType === "organization" ? (
                  <>
                    <div className="sectionSubheader">
                      <h4>Assigned Organization Tests</h4>
                    </div>
                    
                    <Table
                      columns={[
                        { header: "Test Title", accessor: "title" },
                        { header: "Description", accessor: "description" },
                        { header: "Start Time", accessor: "start_time" },
                        { header: "Duration (minutes)", accessor: "duration_minutes" },
                        { header: "Status", accessor: "status" },
                        { header: "Action", accessor: "action" }
                      ]}
                      data={organizationTests.map(test => ({
                        ...test,
                        title: (
                          <Button 
                            variant="viewButton" 
                            onClick={() => {
                              console.log("Test data:", test);
                              if (test.question_paper?.pdf_file) {
                                handleViewPaper(test.question_paper.pdf_file, "organization");
                              } else {
                                console.error("No question paper found for test:", test);
                              }
                            }}
                            disabled={!isTestAvailable(test)}
                          >
                            {test.title}
                          </Button>
                        ),
                        start_time: formatLocalTime(test.start_time),
                        status: isTestAvailable(test) ? "Available" : "Not Available",
                        action: (
                          <Button
                            variant="success"
                            onClick={() => handleOrganizationTestUpload(test)}
                            disabled={!isTestAvailable(test)}
                          >
                            Take Test
                          </Button>
                        )
                      }))}
                      emptyMessage="No Organization Tests Found"
                    />
                  </>
                ) : (
                  <>
                    <div className="sectionSubheader">
                      <h4>Available Question Papers</h4>
                    </div>
                    
                    <Table
                      columns={availablePapersColumns}
                      data={filteredAvailablePapers}
                      emptyMessage="No Question Papers Found"
                      renderCell={renderAvailablePaperCell}
                    />
                    
                    <div className="sectionSubheader">
                      <h4>Answered Question Papers</h4>
                    </div>
                    
                    <Table
                      columns={answeredPapersColumns}
                      data={filteredAnsweredPapers}
                      emptyMessage="No Answered Papers Found"
                      renderCell={renderAnsweredPaperCell}
                    />
                  </>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Student;