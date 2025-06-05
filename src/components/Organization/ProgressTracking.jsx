import React from 'react';

const ProgressTracking = () => {
  const progressData = {
    overallStats: {
      totalStudents: 5,
      averageScore: 78.5,
      completionRate: 85,
      activeTests: 2
    },
    studentProgress: [
      {
        id: 1,
        name: 'John Smith',
        completedTests: 8,
        averageScore: 85,
        lastTestDate: '2024-04-10',
        status: 'Active',
        recentScores: [92, 88, 85, 90, 75]
      },
      {
        id: 2,
        name: 'Emma Johnson',
        completedTests: 7,
        averageScore: 82,
        lastTestDate: '2024-04-08',
        status: 'Active',
        recentScores: [85, 80, 88, 75, 82]
      },
      {
        id: 3,
        name: 'Michael Brown',
        completedTests: 6,
        averageScore: 75,
        lastTestDate: '2024-04-05',
        status: 'Active',
        recentScores: [70, 78, 72, 80, 75]
      },
      {
        id: 4,
        name: 'Sarah Davis',
        completedTests: 9,
        averageScore: 88,
        lastTestDate: '2024-04-12',
        status: 'Active',
        recentScores: [90, 85, 92, 88, 85]
      },
      {
        id: 5,
        name: 'David Wilson',
        completedTests: 7,
        averageScore: 80,
        lastTestDate: '2024-04-09',
        status: 'Active',
        recentScores: [82, 78, 85, 75, 80]
      }
    ],
    testPerformance: [
      {
        id: 1,
        title: 'Mathematics Final Exam',
        averageScore: 82,
        completionRate: 90,
        totalStudents: 5,
        date: '2024-04-15'
      },
      {
        id: 2,
        title: 'Physics Midterm',
        averageScore: 78,
        completionRate: 85,
        totalStudents: 5,
        date: '2024-04-10'
      },
      {
        id: 3,
        title: 'Chemistry Quiz',
        averageScore: 85,
        completionRate: 95,
        totalStudents: 5,
        date: '2024-04-05'
      }
    ]
  };

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

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Progress Tracking</h2>

      {/* Overall Statistics */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Students</h5>
              <h2 className="mb-0">{progressData.overallStats.totalStudents}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Average Score</h5>
              <h2 className="mb-0">{progressData.overallStats.averageScore}%</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Completion Rate</h5>
              <h2 className="mb-0">{progressData.overallStats.completionRate}%</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <h5 className="card-title">Active Tests</h5>
              <h2 className="mb-0">{progressData.overallStats.activeTests}</h2>
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
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Completed Tests</th>
                      <th>Average Score</th>
                      <th>Last Test Date</th>
                      <th>Status</th>
                      <th>Recent Scores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressData.studentProgress.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.completedTests}</td>
                        <td>{student.averageScore}%</td>
                        <td>{new Date(student.lastTestDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {student.recentScores.map((score, index) => (
                              <span key={index} className="badge bg-light text-dark">
                                {score}%
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Test</th>
                      <th>Average Score</th>
                      <th>Completion Rate</th>
                      <th>Total Students</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressData.testPerformance.map(test => (
                      <tr key={test.id}>
                        <td>{test.title}</td>
                        <td>
                          <div className="progress" style={{ height: '20px' }}>
                            <div
                              className="progress-bar bg-success"
                              role="progressbar"
                              style={{ width: `${test.averageScore}%` }}
                              aria-valuenow={test.averageScore}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {test.averageScore}%
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="progress" style={{ height: '20px' }}>
                            <div
                              className="progress-bar bg-info"
                              role="progressbar"
                              style={{ width: `${test.completionRate}%` }}
                              aria-valuenow={test.completionRate}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            >
                              {test.completionRate}%
                            </div>
                          </div>
                        </td>
                        <td>{test.totalStudents}</td>
                        <td>{new Date(test.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking; 