import React from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";

const Logout = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
       localStorage.removeItem('token')
        navigate('/login')

    };

    const getCookie = name => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    return (
        <button onClick={handleLogout}>Wyloguj się</button>
    );
}

export default Logout;
