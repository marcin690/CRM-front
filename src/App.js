
import React from "react";
import {BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Layouts from "./layouts/Layouts";



import Login from "./components/auth/Login";
import Dashboard from "./components/Dashboard";


//import Scss
import './assets/scss/themes.scss';
// import './assets/scss/main.css';

import './App.css';
import UsersList from "./components/Users/UsersList";

import {Toaster} from "react-hot-toast";
import {NotificationProvider} from "./components/notyfications/NotyficationContext";
import LeadList from "./components/leads/LeadList";



// PrivateRoute.js
const PrivateRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    return isAuthenticated ? (
        <Layouts>
            {children}
        </Layouts>
    ) : (
        <Navigate to="/login" />
    );
}


const App = () => {
  return (
      <>
          <NotificationProvider>
              <Toaster />
              <Router>
                  <Routes>
                      <Route path="/login" element={<Login />} />

                      <Route path="*" element={<Navigate to="/dashboard"/>} />
                      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                      <Route path="/users" element={<PrivateRoute><UsersList /></PrivateRoute>} />
                      <Route path="/leads" element={<PrivateRoute><LeadList /></PrivateRoute>} />


                  </Routes>
              </Router>
          </NotificationProvider>

      </>

  );
}

export default App;
