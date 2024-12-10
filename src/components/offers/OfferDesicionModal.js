import { useState } from "react";
import api from "../../utils/axiosConfig";
import { useNotification } from "../notyfications/NotyficationContext";
import MainModal from "../MainModal";
import { Form } from "react-bootstrap";

function OfferDecisionModal({ show, handleClose, offerId, onSuccess }) {
    const [decisionType, setDecisionType] = useState("ACCEPT");
    const [approvalReason, setApprovalReason] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectionReasonComment, setRejectionReasonComment] = useState("");
    const { notify } = useNotification();

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {};
        const currentDate = new Date().toISOString();

        if (decisionType === "ACCEPT") {
            payload.offerStatus = "ACCEPTED";
            payload.approvalReason = approvalReason;
            payload.rejectionReason = null;
            payload.rejectionReasonComment = null;
            payload.rejectionOrApprovalDate = currentDate;
        } else {
            payload.offerStatus = "REJECTED";
            payload.rejectionReason = rejectionReason;
            payload.rejectionReasonComment = rejectionReasonComment;
            payload.approvalReason = null;
            payload.rejectionOrApprovalDate = currentDate;
        }

        api.patch(`/offers/${offerId}`, payload)
            .then((response) => {
                if (onSuccess) onSuccess();
                handleClose();
            })
            .catch((err) => {
                notify(`Nie udało się zaktualizować oferty: ${err}`, "error");
            });
    };

    const rejectionReasons = [
        { value: "PRICE_TOO_HIGH", label: "Za wysoka cena" },
        { value: "LONG_BIDDING_PROCESS", label: "Zbyt długie ofertowanie" },
        { value: "POOR_REPUTATION", label: "Zła opinia na rynku" },
        { value: "RIGGED_TENDER", label: "Ustawiony przetarg" },
        { value: "LACK_OF_QUALIFICATIONS", label: "Brak kwalifikacji" },
        { value: "UNREALISTIC_DEADLINE", label: "Nierealny termin" },
        { value: "OTHER", label: "Inne" },
        { value: "POOR_QUALITY_SAMPLE_ROOM", label: "Źle wykonany pokój wzorcowy" },
        { value: "LOW_QUALITY_PREVIOUS_PROJECT", label: "Słaba jakość u tego samego klienta na poprzedniej realizacji" },
    ];

    return (
        <MainModal
            title="Decyzja odnośnie oferty"
            show={show}
            handleClose={handleClose}
            formId="offer-decision-form"
            size="lg"
        >
            <Form id="offer-decision-form" onSubmit={handleSubmit}>
                <Form.Group>
                    <Form.Label>Wybierz akcję</Form.Label>
                    <div>
                        <Form.Check
                            type="radio"
                            label="Zaakceptuj"
                            name="decision"
                            value="ACCEPT"
                            checked={decisionType === "ACCEPT"}
                            onChange={(e) => setDecisionType(e.target.value)}
                        />
                        <Form.Check
                            type="radio"
                            label="Odrzuć"
                            name="decision"
                            value="REJECT"
                            checked={decisionType === "REJECT"}
                            onChange={(e) => setDecisionType(e.target.value)}
                        />
                    </div>
                </Form.Group>

                {decisionType === "ACCEPT" && (
                    <Form.Group className="mt-3">
                        <Form.Label>Komentarz (opcjonalnie)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={approvalReason}
                            onChange={(e) => setApprovalReason(e.target.value)}
                            placeholder="Wpisz opcjonalny komentarz do akceptacji"
                        />
                    </Form.Group>
                )}

                {decisionType === "REJECT" && (
                    <>
                        <Form.Group className="mt-3">
                            <Form.Label>Powód odrzucenia</Form.Label>
                            <Form.Select
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            >
                                <option value="">Wybierz powód</option>
                                {rejectionReasons.map((reason) => (
                                    <option key={reason.value} value={reason.value}>
                                        {reason.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Dodatkowy komentarz (opcjonalnie)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={rejectionReasonComment}
                                onChange={(e) => setRejectionReasonComment(e.target.value)}
                                placeholder="Podaj dodatkowy komentarz do odrzucenia"
                            />
                        </Form.Group>
                    </>
                )}
            </Form>
        </MainModal>
    );
}

export default OfferDecisionModal;
