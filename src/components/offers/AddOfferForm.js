import {useNavigate, useParams} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";
import nav from "../../layouts/Nav";
import LeadSearchDropdown from "./LeadSearchDropdown";
import ClientSearchDropdown from "./ClientSearchDropdown";
import {Disc, Floppy, Floppy2, PlusCircle, SafeFill, Save, Save2, Trash} from "react-bootstrap-icons";
import axios from "axios";



const AddOfferForm = () => {

    const {id: offerId} = useParams();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        currency: "PLN",
        clientType: "CURRENT_CLIENT",
        investorType: "CONDO_HOTELS",
        offerStatus: "SENT",
        objectType: "CHAIN_HOTELS",
        totalPrice: "",
        totalPriceInEUR: "",
        euroExchangeRate: null,
        user: null
    });
    const [leadId, setLeadId] = useState(null)
    const [clientId, setClientId] = useState(null)

    const [loading, setLoading] = useState(false)
    const {notify} = useNotification()
    const navigate = useNavigate()
    const [bindingType, setBindingType] = useState("");
    const [users, setUsers] = useState([])
    const [offerItems, setOfferItems] = useState([])


    useEffect(() => {
        if (offerId) {
            setLoading(true)

        }
        api.get(`/offers/${offerId}`)
            .then((response) => {
                const offerData = response.data;
                setFormData(offerData);
                setLeadId(offerData.lead?.id || null);
                setClientId(offerData.client?.id || null);
                setOfferItems(offerData.offerItems || [])
                setBindingType(offerData.lead ? "lead" : offerData.client ? "client" : "");

            })
            .catch(() => notify("Nie udało się pobrać oferty", "error"))
            .finally(() => setLoading(false))
    }, [offerId, notify])

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get(`/users/sellers`);
                setUsers(response.data || []); // Bez content, bez pageable
            } catch (error) {
                notify(`Błąd podczas ładowania listy pracowników: ${error.message}`, "error");
            }
        };
        fetchUsers();
    }, []);

    const handleUserSelect = (e) => {
       const selectedUserId = e.target.value
        const selectedUser = users.find((user) => user.id === Number(selectedUserId))
        setFormData({...formData, user: selectedUser || null})
    };



    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value})
    }

    const handleLeadSelect = (id) => {
        setLeadId(id)
    }

    const handleClientSelect = (id) => {
        setClientId(id)
    }

    const handleBindingType = (e) => {
        setBindingType(e.target.value)
    }

    const addNewItem = () => {
        setOfferItems([...offerItems, {title: "", description: "", amount: "", quantity: "1", tax: "VAT_23"}])
    }

    const handleItemChange = (index,field, value) => {
        const updatedItems = [...offerItems];
        updatedItems[index][field] = value;
        setOfferItems(updatedItems)
    }

    const removeItem = (index) => {
        const updatedItems = [...offerItems]
        updatedItems.splice(index,1);
        setOfferItems(updatedItems)
    }

    const handleDelete = async () => {
        if(window.confirm("Czy na pewno chcesz usunąć ofertę?")){
            try {
                await api.delete(`/offers/${offerId}`)
                notify("Oferta została usunięta!", "success");
                navigate("/offers");
            } catch (error) {
                notify("Nie udało się usunąć oferty", "error");
            }

        }
    }

    useEffect(() => {
        const fetchEuroExchangeRate = async () => {
            if (!offerId && formData.currency === "EUR") {
                // Pobranie kursu euro z NBP dla nowej oferty
                try {
                    const response = await axios.get(
                        "https://api.nbp.pl/api/exchangerates/rates/A/EUR?format=json"
                    );
                    const rate = response.data.rates[0].mid;


                    const roundedRate = parseFloat(rate).toFixed(2)

                    setFormData((prevFormData) => ({
                        ...prevFormData,
                        euroExchangeRate: roundedRate,
                    }));
                } catch (error) {
                    console.error("Nie udało się pobrać kursu euro:", error);
                }
            }
        };

        fetchEuroExchangeRate();
    }, [formData.currency, offerId]);

    const calculateTotals = () => {
        const totalPLN = offerItems.reduce((acc, item) => {
            const amount = parseFloat(item.amount || 0);
            const quantity = parseInt(item.quantity || 1, 10);
            return acc + amount * quantity;
        }, 0);

        const totalEUR = formData.currency === "EUR"
            ? totalPLN // Jeśli wybrano EUR, przyjmujemy kwotę bez przeliczania
            : formData.euroExchangeRate
                ? totalPLN / parseFloat(formData.euroExchangeRate) // PLN -> EUR
                : 0;

        return {
            totalPLN: formData.currency === "PLN" ? totalPLN.toFixed(2) : (totalEUR * parseFloat(formData.euroExchangeRate || 1)).toFixed(2),
            totalEUR: formData.currency === "EUR" ? totalEUR.toFixed(2) : (totalPLN / parseFloat(formData.euroExchangeRate || 1)).toFixed(2),
        };
    };

    const { totalPLN, totalEUR,  } = calculateTotals();


    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const payload = {
                ...formData,
                offerItems,
                totalPrice: 1,
                totalPriceInEUR: 1,
                lead: bindingType === "lead" && leadId ? { id: leadId } : null,
                client: bindingType === "client" && clientId ? { id: clientId } : null,
            }
            if (offerId) {
                await api.patch(`/offers/${offerId}`, payload);

                notify("Oferta została zaktualizowana!", "success");
            } else {
                await api.post("/offers", payload);
                console.log("Payload:", payload);
                notify("Oferta została dodana!", "success");
            }
            navigate("/offers");
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || // Próba odczytania wiadomości z backendu
                error.response?.statusText ||   // Próba odczytania statusu HTTP
                "Nieznany błąd";                // Domyślna wiadomość

            notify(`Nie udało się zapisać oferty: ${errorMessage}`, "error");
        } finally {
            setLoading(false);
        }

    }



    return (
        <>

            <div className="row">
                    <div className="col-12">
                        <div className="page-title-box d-sm-flex align-items-center justify-content-between"><h4
                            className="mb-sm-0">{offerId ? "Edytuj ofertę" : "Dodaj ofertę"}</h4>

                            <div className="page-title-right">

                                        <button type="submit" className="btn btn-success" onClick={handleSubmit}
                                                disabled={loading}>
                                            {loading ? "Zapisywanie..." : offerId ? "Zaktualizuj ofertę" : "Zapisz ofertę "} <Floppy2 className="ms-2"/>
                                        </button>
                                        {offerId && (
                                            <button
                                            type="button" className="btn btn-danger ms-2" onClick={handleDelete}
                                            ><Trash size={14}/> </button>
                                        )}
                            </div>
                        </div>
                    </div>
            </div>
            <div className="row">
                <div className="col-lg-6 d-flex align-items-stretch">
                    <div className="card w-100">
                        <div className="align-items-center d-flex card-header">
                            <h4 className="card-title mb-0 flex-grow-1">Tytuł i opis</h4>
                        </div>
                        <div className="card-body">
                            {/* Name */}
                            <div className="form-group pb-2">
                                <label htmlFor="name" className="form-label">Tytuł *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="name"
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Wprowadź tytuł oferty"
                                />
                            </div>

                            <div className="row">
                                <div className="col-lg-6 form-group py-2">
                                    <label htmlFor="userSelect" className="form-label">Handlowiec *</label>
                                    <select
                                        id="userSelect"
                                        required
                                        className="form-select"
                                        value={formData.user?.id || ""}
                                        onChange={handleUserSelect}
                                    >
                                        <option value="">Wybierz pracownika</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.fullname}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-6 form-group py-2">
                                    <label htmlFor="salesOpportunityLevel" className="form-label">Poziom szansy
                                        sprzedaży</label>
                                    <select
                                        className="form-select"
                                        id="salesOpportunityLevel"
                                        name="salesOpportunityLevel"
                                        value={formData.salesOpportunityLevel || ""}
                                        onChange={handleChange}
                                    >
                                        <option value="">Wybierz poziom</option>
                                        <option value="LOW">Mały poziom szansy sprzedaży</option>
                                        <option value="MODERATE">Umiarkowany poziom szansy sprzedaży</option>
                                        <option value="HIGH">Duży poziom szansy sprzedaży</option>
                                    </select>
                                </div>
                                {/* Currency */}
                                <div className="col-lg-6 form-group py-2">
                                    <label htmlFor="currency" className="form-label">Waluta</label>
                                    <select
                                        className="form-select"
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                    >
                                        <option value="PLN">PLN</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                </div>
                                {formData.currency === "EUR" && (
                                    <div className="col-lg-6 form-group py-2">
                                        <div className="form-group">
                                            <label htmlFor="euroExchangeRate">Kurs Euro</label>
                                            <input
                                                type="number"
                                                id="euroExchangeRate"
                                                name="euroExchangeRate"
                                                value={formData.euroExchangeRate || ""}
                                                onChange={handleChange}
                                                className="form-control"
                                            />


                                        </div>
                                    </div>
                                )}
                                <div className="col-lg-6">
                                    <div className="py-2 form-group">
                                        <label htmlFor="inputGroupSelect01" className="form-label">Powiązanie *</label>
                                        <select
                                            required="true"
                                            className="form-select" id="inputGroupSelect01"
                                            value={bindingType} onChange={handleBindingType}>
                                            <option value="">Wybierz</option>
                                            <option value="lead">Lead</option>
                                            <option value="client">Klient</option>

                                        </select>

                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="py-2">
                                        {bindingType === "lead" && (
                                            <LeadSearchDropdown defaultLead={formData.lead}
                                                                onLeadSelect={handleLeadSelect}/>
                                        )}
                                        {bindingType === "client" && (
                                            <ClientSearchDropdown defaultClient={formData.client}
                                                                  onClientSelect={handleClientSelect}/>
                                        )}
                                    </div>
                                </div>


                            </div>


                            {/* Description */}

                        </div>
                    </div>


                </div>
                <div className="col-lg-6 d-flex align-items-stretch">


                    <div className="card w-100">
                        <div className="align-items-center d-flex card-header"><h4
                            className="card-title mb-0 flex-grow-1">Dane </h4>
                        </div>
                        <div className="card-body card-body">

                            <div className="row">


                                {/* Client Type */}
                                <div className="col-lg-6 form-group py-2">
                                    <label htmlFor="clientType" className="form-label">Typ klienta</label>
                                    <select
                                        className="form-select"
                                        id="clientType"
                                        name="clientType"
                                        value={formData.clientType}
                                        onChange={handleChange}
                                    >
                                        <option value="NEW_CLIENT">Klient nowy</option>
                                        <option value="CURRENT_CLIENT">Klient obecnie obsługiwany</option>
                                        <option value="RETURNING_CLIENT">Klient powracający</option>
                                    </select>
                                </div>

                                {/* Investor Type */}
                                <div className="col-lg-6 form-group py-2">
                                    <label htmlFor="investorType" className="form-label">Typ inwestora</label>
                                    <select
                                        className="form-select"
                                        id="investorType"
                                        name="investorType"
                                        value={formData.investorType}
                                        onChange={handleChange}
                                    >
                                        <option value="LARGE_PRIVATE_INVESTOR">Pryw. inwestor duży</option>
                                        <option value="MULTI_PROPERTY_PRIVATE_INVESTOR">Pryw. inwestor wieloobiektowy
                                        </option>
                                        <option value="CONSTRUCTION_COMPANY_HOTEL">Firma budowlana dla hotelu</option>
                                        <option value="CONDO_HOTELS">Condohotele</option>
                                        <option value="CONSTRUCTION_COMPANY_PRIVATE">Firma budowlana dla prywatnych
                                        </option>
                                        <option value="FOREIGN">Zagranica</option>
                                        <option value="SMALL_PRIVATE_INVESTOR">Pryw. inwestor mały</option>
                                        <option value="PRIVATE_APARTMENTS">Apart. prywatne</option>
                                    </select>
                                </div>

                                {/* Offer Status */}
                                <div className="col-lg-6 form-group py-2">
                                    <label htmlFor="offerStatus" className="form-label">Status oferty</label>
                                    <select
                                        className="form-select"
                                        id="offerStatus"

                                        name="offerStatus"
                                        value={formData.offerStatus}
                                        onChange={handleChange}
                                    >
                                        <option value="DRAFT">Robocza</option>
                                        <option  value="SENT">Wysłana</option>
                                        <option value="ACCEPTED">Zaakceptowana</option>
                                        <option value="REJECTED">Odrzucona</option>
                                        <option value="SIGNED">Podpisana umowa</option>
                                    </select>
                                </div>

                                {/* Object Type */}
                                <div className="col-lg-6 form-group py-2">
                                    <label htmlFor="objectType" className="form-label">Typ obiektu</label>
                                    <select
                                        className="form-select"
                                        id="objectType"
                                        name="objectType"
                                        value={formData.objectType}
                                        onChange={handleChange}
                                    >
                                        <option value="LARGE_HOTELS">Hotele Duże</option>
                                        <option value="CHAIN_HOTELS">Hotele Sieciowe</option>
                                        <option value="CONDO_HOTELS">Condohotele</option>
                                        <option value="APARTMENTS">Apartamenty</option>
                                        <option value="INDEPENDENT_HOTELS">Hotele niezależne</option>
                                        <option value="STORE">Sklep</option>
                                    </select>
                                </div>

                                <div className="form-group py-2">
                                    <label htmlFor="description" className="form-label">Opis</label>
                                    <textarea
                                        className="form-control"
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="Wprowadź opis oferty"
                                    ></textarea>
                                </div>


                            </div>


                        </div>
                    </div>
                </div>
                <div className="col-lg-12">
                    <div className="card">
                        <div className="align-items-center d-flex card-header"><h4
                            className="card-title mb-0 flex-grow-1">Pozycje </h4>
                        </div>
                        <div className="card-body card-body">

                            <table className="table table-bordered">
                                <thead>
                                <tr>
                                    <th>Tytuł</th>
                                    <th>Opis</th>
                                    <th>Ilość</th>
                                    <th>Kwota</th>
                                    <th>Podatek</th>
                                    <th>Akcje</th>
                                </tr>
                                </thead>
                                <tbody>
                                {offerItems.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="text"
                                                required
                                                className="form-control"
                                                placeholder="Tytuł"
                                                value={item.title}
                                                onChange={(e) => handleItemChange(index, "title", e.target.value)}
                                            />

                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Opis"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                            />
                                        </td>


                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Ilość"
                                                min="1"
                                                defaultValue="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                                            />
                                            {item.quantity <= 0 && (
                                                <div className="text-danger">Ilość musi być większa niż 0</div>
                                            )}

                                        </td>

                                        <td className="form-group">
                                            <div className="input-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Kwota"
                                                    value={String(item.amount ?? "").replace('.', ',')}
                                                    onChange={(e) => {
                                                        let inputValue = e.target.value;

                                                        // Zamiana przecinka na kropkę do logiki
                                                        inputValue = inputValue.replace(',', '.');

                                                        // Usunięcie nieprawidłowych znaków (dozwolone tylko cyfry i kropka)
                                                        if (!/^\d*\.?\d{0,2}$/.test(inputValue)) {
                                                            return; // Ignoruj błędne wprowadzenie
                                                        }

                                                        handleItemChange(index, "amount", inputValue);
                                                    }}
                                                />
                                                <span className="input-group-text">
                                                    {formData.currency === "EUR" ? "€" : "zł"}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <select className="form-select" value={index.tax}
                                                    onChange={(e) => handleItemChange(index, "tax", e.target.value)}>
                                                <option value="VAT_23">23%</option>
                                                <option value="VAT_0">0%</option>
                                                <option value="VAT_5">5%</option>

                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={() => removeItem(index)}
                                            >
                                                Usuń
                                            </button>
                                        </td>


                                    </tr>


                                ))}

                                <tr>
                                    <td colSpan="3" className="text-end fw-bold">Razem:</td>
                                    <td>
                                        {formData.currency === "PLN" ? (
                                            <div>PLN: {totalPLN} zł</div>
                                        ) : (
                                            <div>EUR: {totalEUR} €</div>
                                        )}
                                    </td>
                                    <td></td>
                                </tr>

                                </tbody>
                            </table>
                            <div className="d-flex justify-content-center align-items-center">
                                <button type="button" className="btn btn-primary mt-2" onClick={addNewItem}>
                                    Dodaj element oferty <PlusCircle/>
                                </button>
                            </div>


                        </div>
                    </div>

                </div>
            </div>

        </>
    )


}

export default AddOfferForm