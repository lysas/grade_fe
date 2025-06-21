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
    
    // Debug logging
    console.log("File input change:", { name, value, files });
    
    if (name === "resume" && files && files[0]) {
      console.log("Selected file:", {
        name: files[0].name,
        size: files[0].size,
        type: files[0].type,
        lastModified: files[0].lastModified
      });
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(files[0].type)) {
        alert("Please upload a PDF, DOC, or DOCX file.");
        e.target.value = ""; // Clear the input
        return;
      }
      
      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (files[0].size > maxSize) {
        alert("File size must be less than 5MB.");
        e.target.value = ""; // Clear the input
        return;
      }
    }
    
    setFormData((prev) => ({ 
      ...prev, 
      [name]: files ? files[0] : value 
    }));
  };

  const handleProfileCompletion = () => {
    setIsProfileCompleted(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Detailed validation
    if (!formData.resume) {
      alert("Please upload a resume.");
      return;
    }

    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject.");
      return;
    }

    if (selectedBoards.length === 0) {
      alert("Please select at least one board.");
      return;
    }

    if (selectedLanguages.length === 0) {
      alert("Please select at least one language.");
      return;
    }

    // Debug logging
    console.log("Form submission data:", {
      resume: formData.resume,
      resumeInfo: {
        name: formData.resume?.name,
        size: formData.resume?.size,
        type: formData.resume?.type
      },
      email: userData.email,
      role: userData.role,
      subjects: selectedSubjects,
      boards: selectedBoards,
      languages: selectedLanguages
    });

    // Create FormData object
    const formDataObj = new FormData();
    
    // Append file first
    formDataObj.append("resume", formData.resume);
    
    // Append other data
    formDataObj.append("email", userData.email);
    formDataObj.append("role", userData.role);
    formDataObj.append("subjects", JSON.stringify(selectedSubjects));
    formDataObj.append("boards", JSON.stringify(selectedBoards));
    formDataObj.append("languages", JSON.stringify(selectedLanguages));

    // Debug: Log FormData contents
    console.log("FormData entries:");
    for (let [key, value] of formDataObj.entries()) {
      console.log(key, value);
    }

    try {
      // Make sure to set the correct headers
      const response = await axios.post("http://localhost:8000/api/grade/mainrequest/", formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout
      });
      
      console.log("Response:", response.data);
      alert("Profile details submitted successfully!");
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      
      if (error.response) {
        // Server responded with error status
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
        alert(`Error: ${error.response.data.message || error.response.data || 'Server error'}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        alert("No response from server. Please check your connection.");
      } else {
        // Something else happened
        console.error("Error:", error.message);
        alert("Error submitting form. Please try again.");
      }
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
          <label htmlFor="resume">Upload Resume (PDF, DOC, DOCX only):</label>
          <input 
            type="file" 
            id="resume" 
            name="resume" 
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleChange} 
            required 
          />
          {formData.resume && (
            <div style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>
              Selected: {formData.resume.name} ({Math.round(formData.resume.size / 1024)} KB)
            </div>
          )}
        </div>
        
        <div className="role-redirect-form-group">
          <label>Subjects:</label>
          <MultiSelectDropdown 
            className="role-redirect-multi-select-dropdown" 
            label="Subjects" 
            options={["All Subjects", "Maths", "Computer Science", "Biology", "Chemistry", "Physics", "English"]} 
            selectedValues={selectedSubjects} 
            onChange={setSelectedSubjects} 
          />
        </div>
        
        <div className="role-redirect-form-group">
          <label>Boards:</label>
          <MultiSelectDropdown 
            className="role-redirect-multi-select-dropdown" 
            label="Boards" 
            options={["CBSE", "ICSE", "State Board"]} 
            selectedValues={selectedBoards} 
            onChange={setSelectedBoards} 
          />
        </div>
        
        <div className="role-redirect-form-group">
          <label>Languages:</label>
          <MultiSelectDropdown 
            className="role-redirect-multi-select-dropdown" 
            label="Languages" 
            options={["English", "Hindi", "Tamil", "Malayalam", "Telugu"]} 
            selectedValues={selectedLanguages} 
            onChange={setSelectedLanguages} 
          />
        </div>
        
        <button type="submit" className="role-redirect-submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default RoleRedirectPage;