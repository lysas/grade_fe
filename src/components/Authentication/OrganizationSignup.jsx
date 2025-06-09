import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "./authService";
import logo from "../../assets/logo.png";
import lap from "../../assets/lap.png";
import "./Login.css";

const OrganizationSignup = ({ onSwitchForm }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    registration_date: new Date().toISOString().split('T')[0],
    phone_number: "",
    registration_proof: null,
    description: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    validateField(name, files ? files[0] : value);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value) error = "Organization name is required";
        else if (value.length < 2) error = "Organization name must be at least 2 characters";
        break;
      case "email":
        if (!value) error = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Please enter a valid email address";
        break;
      case "phone_number":
        if (!value) error = "Phone number is required";
        else if (!/^[0-9+\-\s()]{10,20}$/.test(value)) error = "Please enter a valid phone number (10-20 digits)";
        break;
      case "address":
        if (!value) error = "Address is required";
        else if (value.length < 5) error = "Address must be at least 5 characters";
        break;
      case "registration_proof":
        if (!value) error = "Registration proof document is required";
        break;
      case "description":
        if (!value) error = "Description is required";
        else if (value.length < 10) error = "Description must be at least 10 characters";
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key])) {
        newErrors[key] = true;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // First, check if user exists
      const userCheckResponse = await fetch('http://localhost:8000/api/auth/check-user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: formData.email })
      });

      const userCheckData = await userCheckResponse.json();
      
      if (!userCheckResponse.ok) {
        throw new Error(userCheckData.detail || 'Error checking user existence');
      }

      // If user doesn't exist, redirect to signup page
      if (!userCheckData.exists) {
        toast.info("No user account found with this email. Please create a user account first before registering an organization.");
        // Store the organization data in localStorage to pre-fill the form after signup
        localStorage.setItem('pendingOrganization', JSON.stringify({
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone_number: formData.phone_number,
          registration_date: formData.registration_date,
          description: formData.description
        }));
        navigate('/authenticate');
        return;
      }

      // If user exists, proceed with organization registration
      const formDataToSend = new FormData();
      
      // Add all required fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('phone_number', formData.phone_number);
      formDataToSend.append('registration_date', formData.registration_date);
      formDataToSend.append('description', formData.description);
      
      // Add registration_proof if it exists
      if (formData.registration_proof) {
        formDataToSend.append('registration_proof', formData.registration_proof);
      } else {
        throw new Error('Registration proof document is required');
      }

      // Log the form data being sent (without sensitive data)
      console.log('Sending form data:', {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        phone_number: formData.phone_number,
        registration_date: formData.registration_date,
        description: formData.description,
        registration_proof: formData.registration_proof ? 'File attached' : 'No file'
      });

      const response = await fetch('http://localhost:8000/api/organization/register/', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Response status:', response.status);
      
      let responseData;
      try {
        const text = await response.text();
        console.log('Raw response:', text);
        responseData = JSON.parse(text);
        console.log('Parsed response data:', responseData);
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Invalid response from server');
      }

      if (response.ok) {
        console.log('Organization registration successful');
        // Clear any pending organization data if it exists
        localStorage.removeItem('pendingOrganization');
        
        // Show success message
        toast.success("Organization registration successful! Your organization is pending admin verification. You will be notified once approved.");
        
        // Wait for 3 seconds before navigation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Navigate after showing message
        navigate('/login');
        return;
      }

      // Handle error cases
      if (responseData.email) {
        throw new Error('This email is already registered. Please use a different email address.');
      }
      if (responseData.errors) {
        const errorMessages = Object.entries(responseData.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        throw new Error(errorMessages);
      }
      throw new Error(responseData.detail || responseData.message || `HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignupSuccess = async (response) => {
    setIsLoading(true);
    
    try {
      await authService.organizationGoogleLogin(response.credential);
      toast.success("Google signup successful");
      navigate('/organization');
    } catch (error) {
      console.error("Google signup error:", error);
      toast.error(error.message || "An error occurred during Google signup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignupFailure = () => {
    toast.error("Google signup failed");
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="page1">
      <div className="cover">
        <div className="left-signup">
          <div className="left-content">
            <h2 className="left-title">Organization Benefits</h2>
            <p className="left-subtitle">Access powerful features for your institution:</p>
            <ul className="benefits-list">
              <li>Manage multiple users and roles</li>
              <li>Track student progress and performance</li>
              <li>Generate and grade assessments</li>
              <li>Customize question papers</li>
              <li>Export results and analytics</li>
              <li>Integration with your existing systems</li>
            </ul>
            <img src={lap} alt="Laptop" className="image" />
          </div>
        </div>

        <div className="right-signup">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo-image" />
          </div>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <h3 className="form-title">Organization Registration</h3>
            
            <div className="input-container1">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "input-error" : ""}
                placeholder="Enter organization name"
                required
                disabled={isLoading}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="input-container1">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? "input-error" : ""}
                placeholder="Enter organization email"
                required
                disabled={isLoading}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="input-container1">
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? "input-error" : ""}
                placeholder="Enter organization address"
                required
                disabled={isLoading}
              />
              {errors.address && <div className="error-message">{errors.address}</div>}
            </div>

            <div className="input-container1">
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className={errors.phone_number ? "input-error" : ""}
                placeholder="Enter phone number"
                required
                disabled={isLoading}
              />
              {errors.phone_number && <div className="error-message">{errors.phone_number}</div>}
            </div>

            <div className="input-container1">
              <input
                type="file"
                name="registration_proof"
                onChange={handleInputChange}
                className={errors.registration_proof ? "input-error" : ""}
                accept=".pdf,.doc,.docx"
                required
                disabled={isLoading}
                placeholder="Upload any proof document"
                title="Upload any proof document "
              />
              <div className="file-input-label">Upload any proof document</div>
              {errors.registration_proof && <div className="error-message">{errors.registration_proof}</div>}
            </div>

            <div className="input-container1">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? "input-error" : ""}
                placeholder="Enter organization description"
                required
                disabled={isLoading}
              />
              {errors.description && <div className="error-message">{errors.description}</div>}
            </div>

            <button 
              type="submit" 
              className="button1" 
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Register Organization"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSignup; 