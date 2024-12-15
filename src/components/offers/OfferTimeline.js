import React from "react";

const OfferTimeline = ({ offer }) => {
    // Funkcja obliczająca różnicę w dniach
    const calculateDaysDifference = (startDate, endDate) => {
        if (!startDate || !endDate) return "Nieznany";
        return Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24));
    };

    return (
        <div className="simplebar-content" style={{ padding: "16px" }}>
            <div className="acitivity-timeline acitivity-main">
                {/* Utworzenie oferty */}
                {offer.creationDate && (
                    <div className="acitivity-item d-flex">
                        <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                            <div className="avatar-title bg-primary-subtle text-primary rounded-circle">
                                <i className="ri-calendar-line"></i>
                            </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Utworzenie oferty</h6>
                            <p className="text-muted mb-1">
                                {new Date(offer.creationDate).toLocaleDateString("pl-PL")}
                            </p>

                        </div>
                    </div>
                )}

                {/* Akceptacja lub odrzucenie */}
                {offer.rejectionOrApprovalDate && (
                    <div
                        className={`acitivity-item py-3 d-flex ${
                            offer.offerStatus === "ACCEPTED"
                                ? "text-success"
                                : "text-danger"
                        }`}
                    >
                        <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                            <div
                                className={`avatar-title rounded-circle ${
                                    offer.offerStatus === "ACCEPTED"
                                        ? "bg-success-subtle text-success"
                                        : "bg-danger-subtle text-danger"
                                }`}
                            >
                                <i
                                    className={`${
                                        offer.offerStatus === "ACCEPTED"
                                            ? "ri-check-line"
                                            : "ri-close-line"
                                    }`}
                                ></i>
                            </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">
                                Oferta została{" "}
                                {offer.offerStatus === "ACCEPTED"
                                    ? "zaakceptowana"
                                    : "odrzucona"}
                            </h6>
                            <p className="text-muted mb-1">
                                Data:{" "}
                                {new Date(
                                    offer.rejectionOrApprovalDate
                                ).toLocaleDateString("pl-PL")}
                            </p>
                            {offer.offerStatus === "ACCEPTED" ? (
                                <p>Powód: {offer.approvalReason || "Brak uzasadnienia"}</p>
                            ) : (
                                <p>
                                    Powód: {offer.rejectionReason || "Brak powodu"} -{" "}
                                    {offer.rejectionReasonComment || "Brak komentarza"}
                                </p>
                            )}
                            {/* Czas ofertowania */}
                            <p className="text-muted mb-1">
                                Czas od utworzenia oferty:{" "}
                                {calculateDaysDifference(
                                    offer.creationDate,
                                    offer.rejectionOrApprovalDate
                                )}{" "}
                                dni
                            </p>
                        </div>
                    </div>
                )}

                {/* Podpisanie umowy */}
                {offer.signedContractDate && (
                    <div className="acitivity-item py-3 d-flex">
                        <div className="flex-shrink-0 avatar-xs acitivity-avatar">
                            <div className="avatar-title bg-warning-subtle text-warning rounded-circle">
                                <i className="ri-hand-coin-line"></i>
                            </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                            <h6 className="mb-1">Podpisanie umowy</h6>
                            <p className="text-muted mb-1">
                                Data:{" "}
                                {new Date(offer.signedContractDate).toLocaleDateString(
                                    "pl-PL"
                                )}
                            </p>
                            <p className="text-muted mb-1">
                                Czas od utworzenia oferty:{" "}
                                {calculateDaysDifference(
                                    offer.creationDate,
                                    offer.signedContractDate
                                )}{" "}
                                dni
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfferTimeline;
