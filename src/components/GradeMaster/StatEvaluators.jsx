import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './StatEvaluators.css';
import { authService } from "../Authentication/authService";
const StatEvaluator = () => {
  const [evaluatedPapers, setEvaluatedPapers] = useState([]);
  const [pendingPapers, setPendingPapers] = useState([]);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        const userEmail = user?.email;
        const userId = user?.id;
        console.log('User ID:', userId);
        console.log('User Email:', userEmail);

        const evaluatedResponse = await axios.get(
          `http://localhost:8000/api/grade/myCorrections/${userEmail}/`
        );
        const pendingResponse = await axios.get(
          'http://localhost:8000/api/grade/evaluator_question/',{
            params: { user_id:userId },
          }
        );

        setEvaluatedPapers(evaluatedResponse.data);
        setPendingPapers(pendingResponse.data);
        console.log('Evaluated Data:', evaluatedResponse.data);
        console.log('Pending Data:', pendingResponse.data);
      } catch (err) {
        setError('Error fetching evaluation data.');
        console.error(err);
      }
    };

    fetchEvaluationData();
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

  const evaluatedSubjectData = calculateSubjectDistribution(evaluatedPapers);
  const pendingSubjectData = calculateSubjectDistribution(pendingPapers);

  const chartData = (labels, data) => ({
    labels,
    datasets: [
      {
        data,
        backgroundColor: ['#4A90E2', '#50E3C2', '#9013FE', '#F5A623', '#F8E71C', '#B8E986', '#D0021B'],
        hoverBackgroundColor: ['#1C68D0', '#2EBB97', '#6C10D1', '#D98618', '#D7CB00', '#92D367', '#A80014'],
      },
    ],
  });

  const paperStatusChartData = chartData(
    ['Evaluated Papers', 'Pending Papers'],
    [evaluatedPapers.length, pendingPapers.length]
  );

  const evaluatedSubjectChartData = chartData(
    Object.keys(evaluatedSubjectData),
    Object.values(evaluatedSubjectData)
  );

  const pendingSubjectChartData = chartData(
    Object.keys(pendingSubjectData),
    Object.values(pendingSubjectData)
  );

   // Check if there's any data to display in any of the charts
   const hasPaperStatusData = evaluatedPapers.length + pendingPapers.length > 0;
   const hasEvaluatedSubjectData = Object.entries(evaluatedSubjectData).length > 0;
   const hasPendingSubjectData = Object.entries(pendingSubjectData).length > 0;

  // If no data for any chart, return null
  if (!hasPaperStatusData && !hasEvaluatedSubjectData && !hasPendingSubjectData) {
    return null;
  }

  return (
    <div className="stat-evaluator-page">
      <h1 className="page-title">Evaluator Statistics</h1>
      {error && <p className="error">{error}</p>}
      <div className="chart-container">
        {hasPaperStatusData && (
          <div className="chart-box">
            <h2>Evaluated vs Pending Papers</h2>
            <Pie data={paperStatusChartData} />
          </div>
        )}
        {hasEvaluatedSubjectData && (
          <div className="chart-box">
            <h2>Subject-Wise Evaluated Papers</h2>
            <Pie data={evaluatedSubjectChartData} options={{ plugins: { legend: { display: true } } }} />
          </div>
        )}
        {hasPendingSubjectData && (
          <div className="chart-box">
            <h2>Subject-Wise Pending Papers</h2>
            <Pie data={pendingSubjectChartData} options={{ plugins: { legend: { display: true } } }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatEvaluator;
