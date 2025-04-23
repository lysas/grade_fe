
import React, { useState } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { getNames } from "country-list";
import "./ProfileSection.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { authService } from "../Authentication/authService";

const countryOptions = getNames(); // Get list of country names

const ProfileSection = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    country: "",
    state: "",
    city: "",
    address_line1: "",
    address_line2: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const user = authService.getCurrentUser();

  const validateForm = () => {
    let newErrors = {};
    if (!formData.full_name) newErrors.full_name = "Full name is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.address_line1) newErrors.address_line1 = "Address Line 1 is required";
    if (!formData.phone_number) newErrors.phone_number = "Phone number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const userId = user?.id;
  
      try {
        const response = await axios.post(
          "http://127.0.0.1:8000/api/update-profile/",
          {
            user_id: userId, // Ensure the correct user ID is sent
            ...formData,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
  
        if (response.status === 200) {
          alert("Profile updated successfully!");
          // Update LocalStorage to reflect profile completion
          localStorage.setItem("is_profile_completed", "true");
          // Retrieve the previous page URL (or fallback to home page)
          const previousPage = localStorage.getItem("previousPage") || "/";
          localStorage.removeItem("previousPage"); // Clear stored value

          // Redirect user back to the previous page
          navigate(previousPage);
        }
      } catch (error) {
        console.error("Failed to update profile:", error.response?.data || error);
      }
    }
  };
  

  return (
    <div className="profile-section-container">
      <h2>Profile Information</h2>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
        {errors.full_name && <span className="profile-error">{errors.full_name}</span>}

        <label>Country</label>
        <select 
  name="country" 
  value={formData.country} 
  onChange={handleChange} 
  className="proSelect"
  style={{display: 'block', backgroundColor: 'white', height: '40px'}}
>
  <option value="">Select Country</option>
  {countryOptions.map((c) => (
    <option key={c} value={c}>{c}</option>
  ))}
</select>
        {errors.country && <span className="profile-error">{errors.country}</span>}

        <label>State</label>
        <input type="text" name="state" value={formData.state} onChange={handleChange} />
        {errors.state && <span className="profile-error">{errors.state}</span>}

        <label>City</label>
        <input type="text" name="city" value={formData.city} onChange={handleChange} />
        {errors.city && <span className="profile-error">{errors.city}</span>}

        <label>Address Line 1</label>
        <input type="text" name="address_line1" value={formData.address_line1} onChange={handleChange} />
        {errors.address_line1 && <span className="profile-error">{errors.address_line1}</span>}

        <label>Address Line 2 (Optional)</label>
        <input type="text" name="address_line2" value={formData.address_line2} onChange={handleChange} />

        <label>Phone Number</label>
        <PhoneInput
          international
          defaultCountry="IN"
          value={formData.phone_number}
          onChange={(value) => setFormData({ ...formData, phone_number: value })}
          className="profile-phone-input"
        />
        {errors.phone_number && <span className="profile-error">{errors.phone_number}</span>}

        <button type="submit" className="profile-submit-button">Save Profile</button>
      </form>
    </div>
  );
};

export default ProfileSection;

