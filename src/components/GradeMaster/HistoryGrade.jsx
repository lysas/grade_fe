import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../Authentication/authService";

const RoleBasedRedirect = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = {
            id: user?.id,
            email: user?.email,
            role: localStorage.getItem("activeRole"),
          };

        // Redirect based on role
        switch (userData.role) {
            case "admin":
                navigate("/grade-master/uploadHistory");
                break;

            case "evaluator":
                navigate("/grade-master/myCorrection", { state: { userData } });
                break;

            case "student":
                navigate("/grade-master/studenthistory");
                break;

            case "mentor":
                navigate("/grade-master/history");
                break;

            default:
                console.error("Invalid role or role not found.");
                break;
        }
    }, [navigate]);

    return null; // No UI needed for this component
};

export default RoleBasedRedirect;
