import React, { useState } from 'react';
import { Navbar, Nav, Dropdown, Image, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Link} from "react-router-dom";

const AppMenu = () => {
    return (
        <div className="app-menu navbar-menu">
            <div className="navbar-brand-box">
                <Navbar expand="lg">
                    <Navbar.Brand href="/velzon/react/minimal">
                        <div className="logo logo-dark">
                            <Image src="data:image/png;base64,... (tu wstaw kod Base64 obrazu)" alt="" height="22" />
                        </div>
                        <div className="logo logo-light">
                            <Image src="data:image/png;base64,... (tu wstaw kod Base64 obrazu)" alt="" height="22" />
                        </div>
                    </Navbar.Brand>
                </Navbar>
                <Button type="button" className="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover" id="vertical-hover">
                    <i className="ri-record-circle-line"></i>
                </Button>
            </div>
            <div id="scrollbar">
                <div className="container-fluid">
                    <div id=""></div>
                    <ul className="navbar-nav" id="navbar-nav">
                        <li className="nav-item">
                            <Link to="/leads" className="nav-link menu-link active"> <span
                                data-key="t-apps">Leady</span></Link>


                        </li>
                        <li className="menu-title"><span data-key="t-menu">Menu</span></li>
                        <li className="nav-item">
                            <Link to="/users" className="nav-link menu-link active"> <span
                                data-key="t-apps">Ustawienia</span></Link>


                        </li>
                        <li className="nav-item">
                            <a className="nav-link menu-link active" data-bs-toggle="collapse"
                               href="/velzon/react/minimal" aria-expanded="true">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                     className="feather feather-home icon-dual">
                                    <g>
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </g>
                                </svg>
                                <span data-key="t-apps">Dashboards</span>
                            </a>
                            <div id="sidebarApps" className="menu-dropdown collapse show">
                                <ul className="nav nav-sm flex-column test">
                                    <li className="nav-item"><a className="nav-link"
                                                                href="/velzon/react/minimal/dashboard-analytics">Analytics</a>
                                    </li>
                                    <li className="nav-item"><a className="nav-link active"
                                                                href="/velzon/react/minimal/dashboard-crm">CRM</a></li>
                                    <li className="nav-item"><a className="nav-link"
                                                                href="/velzon/react/minimal/dashboard">Ecommerce</a>
                                    </li>
                                    <li className="nav-item"><a className="nav-link"
                                                                href="/velzon/react/minimal/dashboard-crypto">Crypto</a>
                                    </li>
                                    <li className="nav-item"><a className="nav-link"
                                                                href="/velzon/react/minimal/dashboard-projects">Projects</a>
                                    </li>
                                    <li className="nav-item"><a className="nav-link"
                                                                href="/velzon/react/minimal/dashboard-nft">NFT</a></li>
                                    <li className="nav-item"><a className="nav-link"
                                                                href="/velzon/react/minimal/dashboard-jobs">Job</a></li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="sidebar-background"></div>
        </div>
    );
};

export default AppMenu;
