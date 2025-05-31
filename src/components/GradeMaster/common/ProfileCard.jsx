import React from "react";
import userProfile from "../userProfile.jpeg";
import "./ProfileCard.css";

const ProfileCard = ({ 
  userData, 
  isPremium
}) => {
  return (
    <div className="profileSection">
      <div className="profileCard">
        <div className="profileHeader">
          <div className="profileImageContainer">
            <img src={userProfile} alt="Profile" className="profileImage" />
            {isPremium && <span className="premiumBadge">PREMIUM</span>}
          </div>
          <div className="profileInfo">
            <h2>Student Dashboard</h2>
            <div className="profileDetail">
              <span className="profileLabel">ID:</span>
              <span>{userData.id}</span>
            </div>
            <div className="profileDetail">
              <span className="profileLabel">Email:</span>
              <span>{userData.email}</span>
            </div>
            <div className="profileDetail">
              <span className="profileLabel">Board:</span>
              <span>CBSE</span>
            </div>
            <div className="profileDetail">
              <span className="profileLabel">Account:</span>
              <span className={isPremium ? "premiumText" : "freeText"}>
                {isPremium ? "Premium" : "Free"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard; 