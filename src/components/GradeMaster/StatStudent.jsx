import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './StatStudent.css';
import { authService } from "../Authentication/authService";
const StatStudent = () => {
  const [availablePapers, setAvailablePapers] = useState([]);
  const [answeredPapers, setAnsweredPapers] = useState([]);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();
  useEffect(() => {
    const fetchQuestionPapers = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/grade/question-papers/', {
          params: { user_id:user?.id },
        });

        setAvailablePapers(response.data.all.available_question_papers || []);
        setAnsweredPapers(response.data.all.answered_question_papers || []);
        console.log('Fetched Question Papers:', response.data);
      } catch (err) {
        setError('Error fetching question papers.');
        console.error('Error fetching question papers:', err);
      }
    };

    fetchQuestionPapers();
  }, []);

  const calculateSubjectDistribution = (papers) => {
    const subjectCounts = {};
    if (!Array.isArray(papers)) {
        console.error("calculateSubjectDistribution received non-array:", papers);
        return {};
    }
    papers.forEach((paper) => {
      subjectCounts[paper.subject] = (subjectCounts[paper.subject] || 0) + 1;
    });
    return subjectCounts;
  };

  const availableSubjectData = calculateSubjectDistribution(availablePapers);
  const answeredSubjectData = calculateSubjectDistribution(answeredPapers);

  const chartData = (labels, data) => ({
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          '#4A90E2', '#50E3C2', '#9013FE', '#F5A623', '#F8E71C', '#B8E986', '#D0021B',
        ],
        hoverBackgroundColor: [
          '#1C68D0', '#2EBB97', '#6C10D1', '#D98618', '#D7CB00', '#92D367', '#A80014',
        ],
      },
    ],
  });

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          padding: 20,
          boxWidth: 15,
          font: {
            size: 12
          }
        }
      }
    }
  };

  const availableQPData = chartData(
    ['Available QP', 'Answered QP'],
    [availablePapers.length, answeredPapers.length]
  );

  const availableSubjectChartData = chartData(
    Object.keys(availableSubjectData),
    Object.values(availableSubjectData)
  );

  const answeredSubjectChartData = chartData(
    Object.keys(answeredSubjectData),
    Object.values(answeredSubjectData)
  );

  const hasQPData = availablePapers.length + answeredPapers.length > 0;
  const hasAvailableSubjectData = Object.entries(availableSubjectData).length > 0;
  const hasAnsweredSubjectData = Object.entries(answeredSubjectData).length > 0;

  if (!hasQPData && !hasAvailableSubjectData && !hasAnsweredSubjectData) {
    return null;
  }

  return (
    <div className="stat-student-page">
      <h1 className='page'>Student Performance Statistics</h1>

      {error && <p className="error">{error}</p>}

      <div className="chart-container">
        {hasQPData && (
        <div className="chart-box">
          <h2>Available vs Answered Question Papers</h2>
            <Pie data={availableQPData} options={chartOptions} />
          </div>
          )}
         
        {hasAvailableSubjectData && (
        <div className="chart-box">
          <h2>Subject-Wise Available Question Papers</h2>
            <Pie data={availableSubjectChartData} options={chartOptions} />
          </div>
          )}

        {hasAnsweredSubjectData && (
        <div className="chart-box">
          <h2>Subject-Wise Answered Question Papers</h2>
            <Pie data={answeredSubjectChartData} options={chartOptions} />
          </div>
          )}
      </div>
    </div>
  );
};

export default StatStudent;
