import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Form, InputGroup, FormControl, Button } from 'react-bootstrap';

const Header = () => {
    const [search, setSearch] = useState(false);
    const toggleSearch = () => {
        setSearch(!search);
    };

    const toggleMenuBtn = () => {
        document.querySelector(".hamburger-icon").classList.toggle('open');
    };

    return (
        <React.Fragment>
            <header id="page-topbar">
                <div className="layout-width">
                    <div className="navbar-header">
                        <div className="d-flex">
                            <div className="navbar-brand-box horizontal-logo">
                                <Link to="/" className="logo logo-dark">
                                    <span className="logo-sm">
                                        <img className="img-fluid" src="https://wyposazenie-hotelowe.pl/wp-content/uploads/2023/01/cropped-wh-plus-logo-R-1.png" alt="Logo" />
                                    </span>
                                    <span className="logo-lg">
                                        <img className="logo" src="https://wyposazenie-hotelowe.pl/wp-content/uploads/2023/01/cropped-wh-plus-logo-R-1.png" alt="Logo" />
                                    </span>
                                </Link>

                                <Link to="/" className="logo logo-light">
                                    <span className="logo-sm">
                                        {/* Logo small */}
                                    </span>
                                    <span className="logo-lg">
                                        {/* Logo large */}
                                    </span>
                                </Link>
                            </div>

                            <button onClick={toggleMenuBtn} type="button" className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger" id="topnav-hamburger-icon">
                                <span className="hamburger-icon">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
                        </div>

                        <div className="d-flex align-items-center">
                            <Dropdown show={search} onToggle={toggleSearch} className="d-md-none topbar-head-dropdown header-item">
                                <Dropdown.Toggle as="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
                                    {/* Search icon */}
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="dropdown-menu-lg dropdown-menu-end p-0">
                                    <Form className="p-3">
                                        <InputGroup>
                                            <FormControl placeholder="Search ..." />
                                            <Button variant="primary" type="submit">
                                                {/* Magnify icon */}
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </header>
        </React.Fragment>
    );
};

export default Header;
