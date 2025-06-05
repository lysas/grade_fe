import React, { useState } from 'react';

const TestManagement = () => {
  const [tests, setTests] = useState([
    {
      id: 1,
      title: 'Mathematics Final Exam',
      description: 'Comprehensive test covering algebra, calculus, and statistics',
      duration: 120,
      scheduledDate: '2024-04-15T09:00',
      assignedStudents: ['tony', 'mike', 'Michael Brown'],
      status: 'Scheduled'
    },
    {
      id: 2,
      title: 'Physics Midterm',
      description: 'Covers mechanics, thermodynamics, and wave motion',
      duration: 90,
      scheduledDate: '2024-04-10T14:00',
      assignedStudents: ['Sarah Davis', 'David Wilson', 'John Smith'],
      status: 'Completed'
    },
    {
      id: 3,
      title: 'Chemistry Quiz',
      description: 'Basic concepts of organic chemistry',
      duration: 45,
      scheduledDate: '2024-04-05T11:00',
      assignedStudents: ['Emma Johnson', 'Michael Brown', 'Sarah Davis'],
      status: 'In Progress'
    },
    {
      id: 4,
      title: 'Biology Lab Test',
      description: 'Practical examination on cell biology',
      duration: 60,
      scheduledDate: '2024-04-20T13:00',
      assignedStudents: ['David Wilson', 'John Smith', 'Emma Johnson'],
      status: 'Scheduled'
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTest, setNewTest] = useState({
    title: '',
    description: '',
    duration: '',
    scheduledDate: '',
    assignedStudents: [],
    status: 'Scheduled'
  });

  const handleCreateTest = () => {
    setTests([...tests, { ...newTest, id: Date.now() }]);
    setNewTest({
      title: '',
      description: '',
      duration: '',
      scheduledDate: '',
      assignedStudents: [],
      status: 'Scheduled'
    });
    setShowCreateModal(false);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-primary';
      case 'In Progress':
        return 'bg-warning';
      case 'Completed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h2>Test Management</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="fas fa-plus me-2"></i>Create Test
          </button>
        </div>
      </div>

      {/* Test List */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Duration (min)</th>
                      <th>Scheduled Date</th>
                      <th>Assigned Students</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map(test => (
                      <tr key={test.id}>
                        <td>{test.title}</td>
                        <td>{test.description}</td>
                        <td>{test.duration}</td>
                        <td>{new Date(test.scheduledDate).toLocaleString()}</td>
                        <td>
                          <span className="badge bg-info me-1">
                            {test.assignedStudents.length} Students
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(test.status)}`}>
                            {test.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-info btn-sm me-2">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn btn-danger btn-sm">
                            <i className="fas fa-trash-alt"></i>
                          </button>
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

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Test</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newTest.title}
                    onChange={(e) => setNewTest({ ...newTest, title: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={newTest.description}
                    onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={newTest.duration}
                    onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Scheduled Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={newTest.scheduledDate}
                    onChange={(e) => setNewTest({ ...newTest, scheduledDate: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={newTest.status}
                    onChange={(e) => setNewTest({ ...newTest, status: e.target.value })}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateTest}
                >
                  Create Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManagement; 