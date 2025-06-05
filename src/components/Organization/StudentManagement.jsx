import React, { useState } from 'react';

const StudentManagement = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      name: 'tony',
      email: 'tony@example.com',
      grade: 'A',
      status: 'Active'
    },
    {
      id: 2,
      name: 'mike',
      email: 'mike@example.com',
      grade: 'B+',
      status: 'Active'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      grade: 'A-',
      status: 'Active'
    },
    {
      id: 4,
      name: 'Sarah Davis',
      email: 'sarah.davis@example.com',
      grade: 'B',
      status: 'Active'
    },
    {
      id: 5,
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      grade: 'A+',
      status: 'Active'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    // grade: '',
    status: 'Active'
  });

  const handleAddStudent = () => {
    setStudents([...students, { ...newStudent, id: Date.now() }]);
    setNewStudent({
      name: '',
      email: '',
      // grade: '',
      status: 'Active'
    });
    setShowAddModal(false);
  };

  const handleRemoveStudent = (id) => {
    setStudents(students.filter(student => student.id !== id));
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
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h2>Student Management</h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <i className="fas fa-plus me-2"></i>Add Student
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      {/* <th>Grade</th> */}
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        {/* <td>
                          <span className="badge bg-info">
                            {student.grade}
                          </span>
                        </td> */}
                        <td>
                          <span className={`badge ${getStatusBadgeClass(student.status)}`}>
                            {student.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-info btn-sm me-2">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveStudent(student.id)}
                          >
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

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Student</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Grade</label>
                  <select
                    className="form-select"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  >
                    <option value="">Select Grade</option>
                    <option value="A+">A+</option>
                    <option value="A">A</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C+">C+</option>
                    <option value="C">C</option>
                    <option value="C-">C-</option>
                    <option value="D+">D+</option>
                    <option value="D">D</option>
                    <option value="F">F</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={newStudent.status}
                    onChange={(e) => setNewStudent({ ...newStudent, status: e.target.value })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddStudent}
                >
                  Add Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement; 