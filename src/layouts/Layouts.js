import React from "react";
import Header from "./header";
import {Container} from "react-bootstrap";
import Nav from "./Nav";

const Layouts = ({children}) => {
    return (
        <React.Fragment>
            <div className="main-content ">
                <div className=" page-content">
                    <Container fluid>
                        <Header/>
                        <Nav/>
                    </Container>

                    <Container fluid>
                    {children}
                    </Container>


                </div>
            </div>
        </React.Fragment>
)
}

export default Layouts;
