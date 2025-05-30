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
        const evaluatedResponse = await axios.get(
          `http://localhost:8000/api/grade/myCorrections/${userEmail}/`
        );
        const pendingResponse = await axios.get(
          'http://localhost:8000/api/grade/evaluator_question/'
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

  return (
    <div className="stat-evaluator-page">
      <h1 className="page-title">Evaluator Statistics</h1>
      {error && <p className="error">{error}</p>}
      <div className="chart-container">
        <div className="chart-box">
          <h2>Evaluated vs Pending Papers</h2>
          {evaluatedPapers.length + pendingPapers.length > 0 ? (
            <Pie data={paperStatusChartData} />
          ) : (
            <p className="no-data-message">No data available.</p>
          )}
        </div>
        <div className="chart-box">
          <h2>Subject-Wise Evaluated Papers</h2>
          {Object.entries(evaluatedSubjectData).length > 0 ? (
            <Pie data={evaluatedSubjectChartData} options={{ plugins: { legend: { display: true } } }} />
          ) : (
            <p className="no-data-message">No data available.</p>
          )}
        </div>
        <div className="chart-box">
          <h2>Subject-Wise Pending Papers</h2>
          {Object.entries(pendingSubjectData).length > 0 ? (
            <Pie data={pendingSubjectChartData} options={{ plugins: { legend: { display: true } } }} />
          ) : (
            <p className="no-data-message">No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatEvaluator;
