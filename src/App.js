
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
import OffersList from "./components/offers/OffersList";
import Offers from "./pages/offers/Offers";
import OfferDetails from "./components/offers/OfferDetails";
import OffersDetailsPage from "./pages/offers/OffersDetailsPage";
import AddEditOffersPage from "./pages/offers/AddEditOffersPage";



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
                      <Route path="/offers" element={<PrivateRoute><Offers></Offers></PrivateRoute>} />
                      <Route path="/offers/:id" element={<PrivateRoute><OffersDetailsPage></OffersDetailsPage></PrivateRoute>} />
                      <Route path="/offers/add" element={<PrivateRoute><AddEditOffersPage></AddEditOffersPage></PrivateRoute>} />
                      <Route path="/offers/edit/:id" element={<PrivateRoute><AddEditOffersPage></AddEditOffersPage></PrivateRoute>} />



                  </Routes>
              </Router>
          </NotificationProvider>

      </>

  );
}

export default App;
