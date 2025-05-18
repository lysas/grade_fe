import React from "react";
import { useNavigate } from "react-router-dom";
import userProfile from "../userProfile.jpeg";
import Button from "./Button";
import "./ProfileCard.css";

const ProfileCard = ({ 
  userData, 
  isPremium, 
  prof, 
  selectedRole, 
  allRoles, 
  isEditing, 
  setIsEditing, 
  handleRoleChange,
  isAddingRole,
  setIsAddingRole,
  selectedNewRole,
  handleNewRoleChange,
  handleSubmitNewRole,
  isSubmitting,
  availableRoles,
  handleRedirect 
}) => {
  const navigate = useNavigate();

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

        <div className="profileActions">
          <div className="roleManager">
            <div className="roleControl">
              <span className="roleLabel">Current Role:</span>
              {isEditing ? (
                <select
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="roleSelect"
                >
                  {allRoles.map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <span className="roleValue">{selectedRole}</span>
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Change Role
                  </Button>
                </>
              )}
            </div>

            <div className="addRoleSection">
              {isAddingRole ? (
                <div className="addRoleControls">
                  <select 
                    onChange={(e) => handleNewRoleChange(e.target.value)} 
                    className="newRoleSelect"
                  >
                    <option value="">Select Role</option>
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>

                  {selectedNewRole && (
                    <Button
                      variant="primary"
                      onClick={handleSubmitNewRole}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Adding..." : "Submit"}
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  variant="success"
                  onClick={() => setIsAddingRole(true)}
                >
                  Add Role
                </Button>
              )}
            </div>
          </div>
          {/* <Button 
            variant="success"
            onClick={() => navigate("/grade-master/statstudent")}
            icon="fas fa-chart-line"
          >
            Statistics
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate("/grade-master/notifications")}
            icon="fas fa-bell"
          >
            Notifications
          </Button> */}

          {!prof && (
            <Button
              variant="purple"
              onClick={handleRedirect}
            >
              Complete Your Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCard; 