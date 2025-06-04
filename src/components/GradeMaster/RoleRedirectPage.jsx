import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ProfileSection from "./ProfileSection";
import "./RoleRedirectPage.css";
import { authService } from "../Authentication/authService";
import { useNavigate } from "react-router-dom";

const MultiSelectDropdown = ({ label, options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelection = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((item) => item !== value)
      : [...selectedValues, value];
    onChange(newSelectedValues);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%", minHeight: "40px" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: "1px solid #ccc",
          borderRadius: "4px",
          padding: "6px",
          cursor: "pointer",
          backgroundColor: "white",
          textAlign: "left",
          color: "#333",
          minHeight: "36px",
          display: "flex",
          alignItems: "center"
        }}
      >
        {selectedValues.length > 0 ? selectedValues.join(", ") : `Select ${label}`}
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            border: "1px solid #ccc",
            borderRadius: "4px",
            backgroundColor: "white",
            zIndex: 10,
            maxHeight: "200px",
            overflowY: "auto",
            marginTop: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          {options.map((option) => (
            <div 
              key={option} 
              style={{ 
                display: "flex", 
                alignItems: "center", 
                padding: "8px 12px", 
                borderBottom: "1px solid #eee",
                color: "#333",
                backgroundColor: "white"
              }}
            >
              <input 
                type="checkbox" 
                id={option} 
                checked={selectedValues.includes(option)} 
                onChange={() => handleSelection(option)} 
                style={{ 
                  marginRight: "10px",
                  accentColor: "#0a66df"
                }} 
              />
              <label 
                htmlFor={option}
                style={{
                  color: "#333",
                  cursor: "pointer",
                  userSelect: "none"
                }}
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const RoleRedirectPage = () => {
  const [formData, setFormData] = useState({ resume: null });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileCompleted, setIsProfileCompleted] = useState(localStorage.getItem("is_profile_completed") === "true");
  const navigate = useNavigate();
  
  // Get current user data
  const user = authService.getCurrentUser();
  const userData = {
    id: user?.id,
    email: user?.email,
    role: localStorage.getItem("activeRole"),
    is_allowed: user?.is_allowed,
  };

  useEffect(() => {
    // First, check if the user is already allowed for their role
    const checkUserPermission = async () => {
      try {
        // Make an API call to get the latest user data including is_allowed status
        const response = await axios.get("http://localhost:8000/api/grade/checkpermission/", {
          params: { email: userData.email, role: userData.role },
        });
        
        // If user is allowed, update local storage and redirect to the appropriate page
        if (response.data.is_allowed) {
          // Update local user data
          const updatedUser = { ...user, is_allowed: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Redirect based on role
          if (userData.role === "evaluator") {
            navigate("/grade-master/evaluator");
            return;
          } else if (userData.role === "qp_uploader") {
            navigate("/grade-master/qp_uploader");
            return;
          }
        }
        
        // Continue with checking form submission if user is not allowed
        checkFormSubmission();
      } catch (error) {
        console.error("Error checking user permission:", error.response?.data || error.message);
        // Continue with checking form submission if there was an error
        checkFormSubmission();
      }
    };

    const checkFormSubmission = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/grade/checksubmission/", {
          params: { email: userData.email, role: userData.role },
        });
        setFormSubmitted(response.data.submitted);
      } catch (error) {
        console.error("Error checking submission status:", error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserPermission();
  }, [userData.email, userData.role, navigate, user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleProfileCompletion = () => {
    setIsProfileCompleted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume) {
      alert("Please upload a resume.");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("resume", formData.resume);
    formDataObj.append("email", userData.email);
    formDataObj.append("role", userData.role);

    formDataObj.append("subjects", JSON.stringify(selectedSubjects || []));
    formDataObj.append("boards", JSON.stringify(selectedBoards || []));
    formDataObj.append("languages", JSON.stringify(selectedLanguages || []));

    try {
      await axios.post("http://localhost:8000/api/grade/mainrequest/", formDataObj);
      alert("Profile details submitted successfully!");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
      alert("Error submitting form. Please try again.");
    }
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  if (!isProfileCompleted) {
    return <ProfileSection onComplete={handleProfileCompletion} />;
  }

  if (formSubmitted) {
    return (
      <div className="admin-approval-container">
        <h2>Submission Received</h2>
        <p>Your details have been submitted. Please wait for the Main Admin to review and accept your request.</p>
      </div>
    );
  }

  return (
    <div className="role-redirect-form-container">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="role-redirect-form">
        <div className="role-redirect-form-group">
          <label htmlFor="resume">Upload Resume:</label>
          <input type="file" id="resume" name="resume" onChange={handleChange} required />
        </div>
        <MultiSelectDropdown 
          className="role-redirect-multi-select-dropdown" 
          label="Subjects" 
          options={["All Subjects", "Maths", "Computer Science", "Biology", "Chemistry", "Physics", "English"]} 
          selectedValues={selectedSubjects} 
          onChange={setSelectedSubjects} 
        />
        <MultiSelectDropdown 
          className="role-redirect-multi-select-dropdown" 
          label="Boards" 
          options={["CBSE", "ICSE", "State Board"]} 
          selectedValues={selectedBoards} 
          onChange={setSelectedBoards} 
        />
        <MultiSelectDropdown 
          className="role-redirect-multi-select-dropdown" 
          label="Languages" 
          options={["English", "Hindi", "Tamil", "Malayalam", "Telugu"]} 
          selectedValues={selectedLanguages} 
          onChange={setSelectedLanguages} 
        />
        <button type="submit" className="role-redirect-submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default RoleRedirectPage;