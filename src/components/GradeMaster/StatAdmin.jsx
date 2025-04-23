import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import "./StatStudent.css";
import { authService } from "../Authentication/authService";

const StatAdmin = () => {
  const [uploadData, setUploadData] = useState([]);
  const [error, setError] = useState("");
  const user = authService.getCurrentUser();
  useEffect(() => {
    const fetchUploadData = async () => {
      try {
        const email = user?.email; // Assuming admin email is stored in localStorage
        const response = await axios.get(
          `http://localhost:8000/api/grade/uploadHistory/${email}/`
        );
        setUploadData(response.data); // Assuming response contains an array of uploads
        console.log("Upload Data:", response.data);
      } catch (err) {
        setError("Error fetching upload data.");
        console.error("Error fetching upload data:", err);
      }
    };

    fetchUploadData();
  }, []);

  const calculateDistribution = (data, key) => {
    const counts = {};
    data.forEach((item) => {
      counts[item[key]] = (counts[item[key]] || 0) + 1;
    });
    return counts;
  };

  const subjectDistribution = calculateDistribution(uploadData, "subject");
  const boardDistribution = calculateDistribution(uploadData, "board");

  const chartData = (labels, data) => ({
    labels,
    datasets: [
      {
        data,
        backgroundColor: ["#4A90E2", "#50E3C2", "#9013FE", "#F5A623", "#F8E71C", "#B8E986", "#D0021B"],
        hoverBackgroundColor: ["#1C68D0", "#2EBB97", "#6C10D1", "#D98618", "#D7CB00", "#92D367", "#A80014"],
      },
    ],
  });

  const subjectChartData = chartData(
    Object.keys(subjectDistribution),
    Object.values(subjectDistribution)
  );

  const boardChartData = chartData(
    Object.keys(boardDistribution),
    Object.values(boardDistribution)
  );

  return (
    <div className="stat-student-page">
      <header  className="page-title-admin">
        <h1 className="page">Admin Statistics</h1>
      </header>

      {error && <p className="error">{error}</p>}

      <div className="chart-container">
        <div className="chart-box">
          <h2>Subject-Wise Uploaded Question</h2>
          {Object.keys(subjectDistribution).length > 0 ? (
            <Pie data={subjectChartData} options={{ plugins: { legend: { display: true } } }} />
          ) : (
            <p className="no-data-message">No data available for Subject Distribution.</p>
          )}
        </div>

        <div className="chart-box">
          <h2>Board-Wise Uploaded Question</h2>
          {Object.keys(boardDistribution).length > 0 ? (
            <Pie data={boardChartData} options={{ plugins: { legend: { display: true } } }} />
          ) : (
            <p className="no-data-message">No data available for Board Distribution.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatAdmin;
