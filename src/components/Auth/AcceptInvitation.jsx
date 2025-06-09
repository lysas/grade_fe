import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const AcceptInvitation = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        const response = await axios.post(
          `/api/organization/students/accept_invitation/${token}/`
        );
        
        if (response.data.status === 'success') {
          setSuccess(true);
          toast.success('Invitation accepted successfully!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to accept invitation');
        toast.error(error.response?.data?.message || 'Failed to accept invitation');
      } finally {
        setLoading(false);
      }
    };

    acceptInvitation();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card">
              <div className="card-body">
                <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-primary mb-3" />
                <h3>Processing your invitation...</h3>
                <p className="text-muted">Please wait while we verify your invitation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card">
              <div className="card-body">
                <FontAwesomeIcon icon={faTimesCircle} size="3x" className="text-danger mb-3" />
                <h3>Error</h3>
                <p className="text-danger">{error}</p>
                <button 
                  className="btn btn-primary mt-3"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card">
              <div className="card-body">
                <FontAwesomeIcon icon={faCheckCircle} size="3x" className="text-success mb-3" />
                <h3>Invitation Accepted!</h3>
                <p className="text-success">Your invitation has been successfully accepted.</p>
                <p className="text-muted">Redirecting to login page...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AcceptInvitation; 