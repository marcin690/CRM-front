import React from "react";
import {Button, Container} from "react-bootstrap";

const OfferDetailsHeader = ({ offer }) => {
    return (

        <div className="bg-blue card mt-n mx-n4 mb-n5">
            <div className="bg-theme Color-soft ">
                <div className=" card-body  pb-4 mb-5">
                    <h4 className="color-white text-white fw-semibold">
                        {offer.name}
                    </h4>
                    <div className="d-flex flex-wrap gap-3">
                        <div className="text-white">
                            ID:{" "}
                            <span className="fw-medium">
                               {offer.id}
                            </span>
                        </div>
                        <div className="vr"></div>
                        <div className="text-white">
                            <i className="ri-building-line align-bottom me-1"></i>
                            {offer.client && offer.client.clientFullName ? offer.client.clientFullName : "Nieznany klient"}
                        </div>
                        <div className="vr"></div>
                        <div className="text-white">
                            Powiązanie:{" "}
                            <span className="fw-medium">
                                {new Date(offer.creationDate).toLocaleDateString("pl-PL")}
                            </span>
                        </div>
                        <div className="vr"></div>
                        <div className="text-white">
                            Utworzone:{" "}
                            <span className="fw-medium">
                                {new Date(offer.creationDate).toLocaleDateString("pl-PL")}
                            </span>
                        </div>
                        <div className="vr"></div>
                        <span
                            className={`badge rounded-pill ${
                                offer.status === "New" ? "bg-info" : "bg-secondary"
                            }`}
                        >
                            {offer.status || "No Status"}
                        </span>
                        <span
                            className={`badge rounded-pill ${
                                offer.priority === "High" ? "bg-danger" : "bg-warning"
                            }`}
                        >
                            {offer.priority || "No Priority"}
                        </span>
                    </div>
                    <div>
                        <Button>Usuń</Button>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default OfferDetailsHeader;
