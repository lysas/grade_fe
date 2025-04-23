import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const RoleBasedRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Retrieve user data from localStorage
        const userData = {
            id: localStorage.getItem("userId"),
            email: localStorage.getItem("userEmail"),
            role: localStorage.getItem("role"),
        };

        // Redirect based on role
        switch (userData.role) {
            case "admin":
                navigate("/grade-master/statadmin");
                break;

            case "evaluator":
                navigate("/grade-master/statevaluator", { state: { userData } });
                break;

            case "student":
                navigate("/grade-master/statstudent");
                break;

            case "mentor":
                navigate("/grade-master/statmentor");
                break;

            default:
                console.error("Invalid role or role not found.");
                break;
        }
    }, [navigate]);

    return null; // No UI needed for this component
};

export default RoleBasedRedirect;
