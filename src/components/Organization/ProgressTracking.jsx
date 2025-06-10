import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { authService } from '../Authentication/authService';
import { toast } from 'react-toastify';
import Table from '../GradeMaster/common/Table';
import './ProgressTracking.css';

const ProgressTracking = () => {
  const [progressData, setProgressData] = useState({
    overallStats: {},
    studentProgress: [],
    testPerformance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const studentProgressColumns = [
    {
      header: <div className="text-center">Student</div>,
      accessor: 'name'
    },
    {
      header: <div className="text-center">Completed Tests</div>,
      accessor: 'completedTests'
    },
    {
      header: <div className="text-center">Average Score</div>,
      accessor: 'averageScore'
    },
    {
      header: <div className="text-center">Last Test Date</div>,
      accessor: 'lastTestDate',
      renderCell: (column, row) => row.lastTestDate ? new Date(row.lastTestDate).toLocaleDateString() : 'N/A'
    },
    {
      header: <div className="text-center">Recent Scores</div>,
      accessor: 'recentScores',
      renderCell: (column, row) => (
        <div className="d-flex gap-1 justify-content-center">
          {row.recentScores.map((score, index) => (
            <span key={index} className="badge bg-light text-dark">
              {score}
            </span>
          ))}
        </div>
      )
    }
  ];

  const testPerformanceColumns = [
    {
      header: <div className="text-center">Test</div>,
      accessor: 'title'
    },
    {
      header: <div className="text-center">Average Score</div>,
      accessor: 'averageScore',
      renderCell: (column, row) => (
        <div className="progress" style={{ height: '20px' }}>
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: `${row.averageScore}%` }}
            aria-valuenow={row.averageScore}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {row.averageScore}
          </div>
        </div>
      )
    },
    {
      header: <div className="text-center">Completion Rate</div>,
      accessor: 'completionRate',
      renderCell: (column, row) => (
        <div className="progress" style={{ height: '20px' }}>
          <div
            className="progress-bar bg-info"
            role="progressbar"
            style={{ width: `${row.completionRate}%` }}
            aria-valuenow={row.completionRate}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {row.completionRate}
          </div>
        </div>
      )
    },
    {
      header: <div className="text-center">Total Students</div>,
      accessor: 'totalStudents'
    },
    {
      header: <div className="text-center">Date</div>,
      accessor: 'date',
      renderCell: (column, row) => row.date ? new Date(row.date).toLocaleDateString() : 'N/A'
    }
  ];

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        // Try to refresh token if needed
        const tokenValid = await authService.refreshTokenIfNeeded();
        if (!tokenValid) {
          throw new Error('Token refresh failed');
        }

        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Token:', token);
        
        const response = await axios.get(
          'http://localhost:8000/api/organization/progress_summary/',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        console.log('Response:', response);
        setProgressData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching progress data:", err);
        console.error("Error response:", err.response);
        
        if (err.response?.status === 401) {
          // Token is invalid or expired
          console.log('Token invalid or expired, redirecting to login');
          localStorage.removeItem('token'); // Clear invalid token
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
          return;
        }
        
        setError("Failed to load progress data. Please try again.");
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [navigate]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-success';
      case 'Inactive':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return <div className="text-center mt-5"><p>Loading progress data...</p></div>;
  }

  if (error) {
    return <div className="alert alert-danger text-center mt-5">{error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-4">
            <i className="fas fa-chart-line me-2 text-primary"></i>
            Progress Tracking
          </h2>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="stats-icon bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="fas fa-users text-primary fa-lg"></i>
                </div>
                <div>
                  <h6 className="card-subtitle text-muted mb-1">Total Students</h6>
                  <h2 className="card-title mb-0 fw-bold">{progressData.overallStats.totalStudents}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="stats-icon bg-success bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="fas fa-star text-success fa-lg"></i>
                </div>
                <div>
                  <h6 className="card-subtitle text-muted mb-1">Average Score</h6>
                  <h2 className="card-title mb-0 fw-bold">{progressData.overallStats.averageScore}%</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="stats-icon bg-info bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="fas fa-tasks text-info fa-lg"></i>
                </div>
                <div>
                  <h6 className="card-subtitle text-muted mb-1">Completion Rate</h6>
                  <h2 className="card-title mb-0 fw-bold">{progressData.overallStats.completionRate}%</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card h-100 border-0 shadow-sm hover-card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <div className="stats-icon bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                  <i className="fas fa-clock text-warning fa-lg"></i>
                </div>
                <div>
                  <h6 className="card-subtitle text-muted mb-1">Active Tests</h6>
                  <h2 className="card-title mb-0 fw-bold">{progressData.overallStats.activeTests}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Student Progress */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Student Progress</h5>
            </div>
            <div className="card-body">
              <Table
                columns={studentProgressColumns}
                data={progressData.studentProgress}
                emptyMessage="No student progress data available"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Performance */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Test Performance</h5>
            </div>
            <div className="card-body">
              <Table
                columns={testPerformanceColumns}
                data={progressData.testPerformance}
                emptyMessage="No test performance data available"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking; 