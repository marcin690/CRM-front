import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";
import OfferDetailsHeader from "./OfferDetailsHeader";
import {Container, Table} from "react-bootstrap";
import {Calendar, Calendar2Check, Chat, Pencil, SignIntersection, Trash} from "react-bootstrap-icons";
import {formatPrice} from "../../utils/FormatPrice";
import OfferStatusForm from "./OfferStatusForm";
import OfferDesicionModal from "./OfferDesicionModal";
import OfferDecisionModal from "./OfferDesicionModal";
import CommentModal from "../modals/CommentModal";
import {fetchCommentCount} from "../../utils/axiosConfig";

const OfferDetails = () => {

    const {id} = useParams();
    const [offer,setOffer] = useState(null)
    const [error, setError] = useState("")
    const {notify} = useNotification();
    const [showDecisionModal, setShowDecisionModal] = useState(false)
    const navigate = useNavigate();


    // Comments
    const [currentClientGlobalId, setCurrentClientGlobalId] = useState(null)
    const [showCommentModal, setShowCommentModal] = useState(null);
    const [currentEntityType, setCurrentEntityType] = useState();
    const [currentEntityId, setCurrentEntityId] = useState(null)
    const [commentCount, setCommentCount] = useState(0);
    const handleCloseComments = () => {
        setShowCommentModal(false)
        setCurrentClientGlobalId(null)

    }

    const handleOpenDesicionModal = () => {
        setShowDecisionModal(true)
    }

    const handleCloseDecisionModal = () => {
        setShowDecisionModal(false)
    }



    useEffect(() => {
        api.get(`/offers/${id}`)
            .then(response=> {
              const offerData = response.data
                setOffer(offerData)
                fetchCommentCount("OFFER", offerData.id).then(count => setCommentCount(count))

            })
            .catch(error => {
                const errorMessage =
                    error.response?.data?.message || // Próba odczytania wiadomości z backendu
                    error.response?.statusText ||   // Próba odczytania statusu HTTP
                    "Nieznany błąd";                // Domyślna wiadomość

                notify(`Bład: ${errorMessage}`, "error");
            })
    }, [id])



    useEffect(() => {
        if (offer?.clientGlobalId) {
            fetchCommentCount("client", offer.clientGlobalId).then(setCommentCount);
        }
    }, [offer?.clientGlobalId]);

    const formatCurrency = (amount, currency) => {
        const euroExchangeRate = offer?.euroExchangeRate || 1;

        if (currency === "PLN") {
            return `${formatPrice(amount, "PLN")}`;
        }

        if (currency === "EUR") {
            const convertedAmount = (amount / euroExchangeRate).toFixed(2);
            return `${formatPrice(convertedAmount, "EUR")}`;
        }

        return `${formatPrice(amount, currency)}`;
    };

    const ClientType = {
        NEW_CLIENT: { description: "Klient nowy" },
        CURRENT_CLIENT: { description: "Klient obecnie obsługiwany" },
        RETURNING_CLIENT: { description: "Klient powracający" },
    };

    const InvestorType = {
        LARGE_PRIVATE_INVESTOR: { description: "Pryw. inwestor duży" },
        MULTI_PROPERTY_PRIVATE_INVESTOR: { description: "Pryw. inwestor wieloobiektowy" },
        CONSTRUCTION_COMPANY_HOTEL: { description: "Firma budowlana dla hotelu" },
        CONDO_HOTELS: { description: "Condohotele" },
        CONSTRUCTION_COMPANY_PRIVATE: { description: "Firma budowlana dla prywatnych" },
        FOREIGN: { description: "Zagranica" },
        SMALL_PRIVATE_INVESTOR: { description: "Pryw. inwestor mały" },
        PRIVATE_APARTMENTS: { description: "Apart. prywatne" },
    };

    const ObjectType = {
        LARGE_HOTELS: { description: "Hotele Duże" },
        CHAIN_HOTELS: { description: "Hotele Sieciowe" },
        CONDO_HOTELS: { description: "Condohotele" },
        APARTMENTS: { description: "Apartamenty" },
        INDEPENDENT_HOTELS: { description: "Hotele niezależne" },
        STORE: { description: "Sklep" },
    };

    if (error) return <p>{error}</p>
    if (!offer) return <p>Ładowanie oferty...</p>;

    const handleDeleteOffer = async () => {
        try {
            await api.delete(`/offers/${id}`); // Wysyłamy DELETE na serwer
            notify("Oferta została pomyślnie usunięta.", "success"); // Powiadomienie o sukcesie
            navigate("/offers"); // Przekierowanie na listę ofert po usunięciu
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || // Próba odczytania wiadomości z backendu
                error.response?.statusText ||   // Próba odczytania statusu HTTP
                "Nieznany błąd";                // Domyślna wiadomość

            notify(`Bład: ${errorMessage}`, "error");
        }
    };

    const handleShowComments = (clientGlobalId, entityType, entityId) => {
        setCurrentClientGlobalId(clientGlobalId);
        setCurrentEntityType(entityType);
        setCurrentEntityId(entityId);
        setShowCommentModal(true);
    };

    return (
        <>

            <div className="row">
                <div className="col-12">
                    <div className="page-title-box d-sm-flex align-items-center justify-content-between"><h4
                        className="mb-sm-0">Szczegóły oferty</h4>

                        <div className="page-title-right ">


                            <button type="submit" disabled={offer.offerStatus !== "SENT"}
                                    className="btn btn-primary " onClick={handleOpenDesicionModal}
                            >
                                Zaakceptuj lub odrzuć
                            </button>

                            <button type="submit" className="btn btn-secondary ms-2"
                                    onClick={() => navigate(`/offers/edit/${id}`)}
                            >
                                <Pencil size={14}/>
                            </button>

                            <button
                                type="button" className="btn btn-danger ms-2" onClick={handleDeleteOffer}
                            ><Trash size={14}/>
                            </button>

                            <button
                                className="btn btn-info ms-2 position-relative"
                                onClick={() => handleShowComments(offer.clientGlobalId, "OFFER", offer.id)}
                            >
                                <Chat/> {commentCount > 0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{commentCount}</span>}
                            </button>

                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xxl-8">
                    <div className="card">

                        <div className="card-header d-flex justify-content-between">
                            <h5 className="card-title mb-0">{offer.name}
                            </h5>

                            <div className="d-flex flex-row align-items-end">
                                <small className="d-flex align-items-center"><Calendar2Check
                                    className="me-1"/> {new Date(offer.creationDate).toLocaleDateString()} </small>
                                <span> | </span>
                                <small>ID: {offer.id}</small>

                            </div>

                        </div>
                        <div className="card-body">
                            {offer.rejectionOrApprovalDate && (
                                <div className={`alert ${offer.offerStatus == "ACCEPTED" ? 'alert-success' : 'alert-danger'}`} role="alert">
                                    Oferta została {offer.offerStatus == "ACCEPTED" ? 'zaakceptowana' : 'odrzucona'} w
                                    dniu: {new Date(offer.rejectionOrApprovalDate).toLocaleDateString()}
                                    <br/>
                                 {offer.offerStatus === "ACCEPTED"
                                    ? offer.approvalReason
                                    : `Powód: ${offer.rejectionReason || "Brak powodu"} - ${offer.rejectionReasonComment || "Brak komentarza"}`}

                                </div>
                            )}

                            <div>{offer.description}</div>

                        </div>
                        <div className="card-header"><h5 className="card-title mb-0">Elementy wyceny</h5></div>
                        <Table className="table-responsive table-striped table-nowrap align-middle mb-0">
                            <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Nazwa</th>
                                <th scope="col">Opis</th>
                                <th scope="col">Ilośc</th>
                                <th scope="col">Cena</th>
                                <th scope="col">Łącznie</th>

                            </tr>
                            </thead>
                            <tbody>
                            {offer.offerItems.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.title}</td>
                                    <td>{item.description}</td>
                                    <td>{item.quantity}</td>
                                    <td>{formatPrice(item.amount, offer.currency)}</td>
                                    <td>{formatPrice(item.quantity * item.amount, offer.currency)}</td>

                                </tr>

                            ))}

                            <tr>
                                <td colSpan="5" className="fw-bold text-end">Łączna kwota</td>
                                <td className="fw-bold">
                                    {formatPrice(
                                        offer.offerItems.reduce((sum, item) => sum + item.quantity * item.amount, 0),
                                        offer.currency
                                    )}
                                </td>

                            </tr>
                            </tbody>
                        </Table>
                    </div>

                </div>
                <div className="col-xxl-4">

                    <div className="card">

                        <div className="card-header"><h5 className="card-title mb-0">Historia</h5></div>
                        <div className="card-body">

                            <div className="table-responsive table-card">
                                <table className="table-borderless align-middle mb-0 table ">
                                    <OfferStatusForm offerId={offer.id} currentStatus={offer.offerStatus}/>
                                    <tr className="mt-3">
                                        <td className="py-3 fw-medium">Łączna kwota netto</td>
                                        <td>

                                            {formatCurrency(offer.totalPrice, "PLN")}

                                        </td>

                                    </tr>
                                    {offer.totalPriceInEUR && (
                                        <tr className="mt-3">
                                            <td className="py-3 fw-medium">Łączna kwota netto €</td>
                                            <td className=" ">
                                                {formatCurrency(offer.totalPrice, "EUR")}
                                                <small>(Kurs: {offer.euroExchangeRate}€)</small>
                                            </td>
                                        </tr>
                                    )}

                                    <tr>
                                        <td className="py-3 fw-medium">Typ klienta</td>
                                        <td>{offer.clientType && ClientType[offer.clientType]?.description}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 fw-medium">Typ inwestora</td>
                                        <td>{offer.investorType && InvestorType[offer.investorType]?.description}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 fw-medium">Typ obiektu</td>
                                        <td>{offer.objectType && ObjectType[offer.objectType]?.description}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <OfferDecisionModal show={showDecisionModal} handleClose={handleCloseDecisionModal} offerId={offer.id}    />
            <CommentModal
                show={showCommentModal}
                handleClose={handleCloseComments}
                clientGlobalId={currentClientGlobalId}
                entityType="OFFER"
                handleCommentCount={setCommentCount}
                entityId={currentEntityId}
            />


        </>



    )

}

export default OfferDetails;