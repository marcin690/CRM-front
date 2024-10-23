import React, { useEffect, useState } from "react";
import { useNotification } from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";
import {Form, FormCheck, FormGroup, Row} from "react-bootstrap";
import MainModal from "../MainModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {pl} from "date-fns/locale";

const AddEditLeadModal = ({ refresLeads, leadToEdit, show, handleClose }) => {
    const formId = "leadForm";
    const { notify } = useNotification();

    const [leadSources, setLeadSources] = useState([])

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [roomsQuantity, setRoomsQuantity] = useState("");
    const [executionDate, setExecutionDate] = useState(null);

    const [users, setUsers] = useState([])
    const [leadSourceId, setLeadSourceId] = useState(null);
    const [leadStatusId, setLeadStatusId] = useState(null);
    const [assignedTo, setAssignedTo] = useState(null);

    const [clientFullName, setClientFullName] = useState("");
    const [clientBusinessName, setClientBusinessName] = useState("");
    const [clientAdress, setClientAdress] = useState("");
    const [clientCity, setClientCity] = useState("");
    const [clientState, setClientState] = useState("");
    const [clientZip, setClientZip] = useState("");
    const [clientCountry, setClientCountry] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [vatNumber, setVatNumber] = useState("");

    const wojewodztwa = [
        'Dolnośląskie',
        'Kujawsko-Pomorskie',
        'Lubelskie',
        'Lubuskie',
        'Łódzkie',
        'Małopolskie',
        'Mazowieckie',
        'Opolskie',
        'Podkarpackie',
        'Podlaskie',
        'Pomorskie',
        'Śląskie',
        'Świętokrzyskie',
        'Warmińsko-Mazurskie',
        'Wielkopolskie',
        'Zachodniopomorskie'
    ];


    useEffect( () => {

        const fetchLeadSources = async () => {
            try {
                const response = await api.get("/lead-source");
                setLeadSources(response.data);
            } catch (error) {
                notify("Nie można pobrać listy źródeł leadów", "error");
            }
        };

        const fetchSellers = async () => {
            try {
                const response = await api.get("/users/sellers")
                setUsers(response.data)
                if(leadToEdit && leadToEdit.assignedTo) {
                    setAssignedTo(response.data.find(user => user.id === leadToEdit.assignedTo.id))
                }
            } catch (error) {
                notify("Nie można pobrać listy użytkoników", "error")
            }

        }

        fetchLeadSources();
        fetchSellers();



        if (leadToEdit) {
            setName(leadToEdit.name);
            setDescription(leadToEdit.description);
            setLeadSourceId(leadToEdit.leadSourceId || null);
            setLeadStatusId(leadToEdit.leadStatusId || null);
            setAssignedTo(leadToEdit.assignTo || null);
            setRoomsQuantity(leadToEdit.roomsQuantity)
            setExecutionDate(leadToEdit.executionDate ? new Date(leadToEdit.executionDate) : null );
            setClientFullName(leadToEdit.clientFullName || "");
            setClientBusinessName(leadToEdit.clientBusinessName || "");
            setClientAdress(leadToEdit.clientAdress || "");
            setClientCity(leadToEdit.clientCity || "");
            setClientState(leadToEdit.clientState || "");
            setClientZip(leadToEdit.clientZip || "");
            setClientCountry(leadToEdit.clientCountry || "");
            setClientEmail(leadToEdit.clientEmail || "");
            setClientPhone(leadToEdit.clientPhone || "");
            setVatNumber(leadToEdit.vatNumber || "");
        }
    }, [leadToEdit]);



    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formattedDate = executionDate ? executionDate.toISOString() : null;


            const leadData = {
                name,
                description,
                roomsQuantity,
                executionDate: formattedDate,
                leadSourceId,
                leadStatusId,
                assignTo: assignedTo ? { id: assignedTo.id } : null,
                clientFullName,
                clientBusinessName,
                clientAdress,
                clientCity,
                clientState,
                clientZip,
                clientCountry,
                clientEmail,
                clientPhone,
                vatNumber,

            };

            console.log("Wysłane dane:", leadData)

            if (leadToEdit) {
                await api.patch(`/leads/${leadToEdit.id}`, leadData);
                notify("Lead został zaktualizowany", "success");
            } else {
                await api.post("/leads", leadData);
                notify("Lead został dodany", "success");
            }

            refresLeads();
            handleClose();
        } catch (error) {
            notify(error.message || "Wystąpił błąd", "error");
        }
    };

    const handleContactInfoChange = (e) => {
        const {name, value} = e.target;
        switch (name) {
            case "clientFullName":
                setClientFullName(value);
                break;
            case "clientBusinessName":
                setClientBusinessName(value);
                break;
            case "clientAdress":
                setClientAdress(value);
                break;
            case "clientCity":
                setClientCity(value);
                break;
            case "clientState":
                setClientState(value);
                break;
            case "clientZip":
                setClientZip(value);
                break;
            case "clientCountry":
                setClientCountry(value);
                break;
            case "clientEmail":
                setClientEmail(value);
                break;
            case "clientPhone":
                setClientPhone(value);
                break;
            case "vatNumber":
                setVatNumber(value);
                break;
            default:
                break;
        }
    }

    return (
        <MainModal title={leadToEdit ? `Edytuj lead ${leadToEdit.name}` : "Dodaj nowy"} show={show} handleClose={handleClose} formId={formId}>
            <Form onSubmit={handleSubmit} id={formId}>
                <Row>
                    <FormGroup className="col-lg-8">
                        <Form.Label>Nazwa leada</Form.Label>
                        <Form.Control type="text" placeholder="Nazwa leada" value={name} onChange={(e) => setName(e.target.value)} required />
                    </FormGroup>
                    <FormGroup className="col-lg-4">
                        <Form.Label>Handlowiec</Form.Label>
                        <Form.Control as="select" value={assignedTo ? assignedTo.id : null}
                                      onChange={(e) => setAssignedTo(users.find(user => user.id === parseInt(e.target.value)))}>
                            <option>Wybierz użytkownika</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.fullname || user.username}
                                </option>
                            ))}
                        </Form.Control>
                    </FormGroup>

                </Row>

                <FormGroup>
                    <Form.Label>Opis</Form.Label>
                    <Form.Control as="textarea" rows={2} placeholder="Opis" value={description} onChange={(e) => setDescription(e.target.value)} />
                </FormGroup>
                <Row>
                    <FormGroup className="col-lg-4">
                        <Form.Label>Źródło</Form.Label>
                        <Form.Control as="select" value={leadStatusId || ""}
                                      onChange={(e) => setLeadStatusId(parseInt(e.target.value))}>
                            <option value="">Wybierz źródło</option>
                            {leadSources.map((source) => (
                                <option key={source.id} value={source.id}>{source.description}</option>
                            ))}
                        </Form.Control>

                    </FormGroup>
                    <FormGroup className="col-lg-4">
                        <Form.Label>Ilość pokoi</Form.Label>
                        <Form.Control type="text" value={roomsQuantity} onChange={(e) => setRoomsQuantity(e.target.value)}></Form.Control>
                    </FormGroup>
                    <FormGroup className='col-lg-4'>
                        <Form.Label>Planowana data montażu</Form.Label>
                        <DatePicker
                            selected={executionDate}
                            locale={pl}
                            showYearDropdown
                            showMonthDropdown
                            scrollableYearDropdown
                            className="form-control w-100"
                            onChange={(date) => setExecutionDate(date)}
                            dateFormat="yyyy-MM-dd"
                        />
                    </FormGroup>
                </Row>
                <Row className="mt-4">
                    <h5 >Informacje kontaktowe</h5>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Imię i nazwisko</Form.Label>
                        <Form.Control type="text" placeholder="Imię i nazwisko" name="clientFullName" value={clientFullName} onChange={handleContactInfoChange} required/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Nazwa firmy</Form.Label>
                        <Form.Control type="text" placeholder="Nazwa firmy" name="clientBusinessName" value={clientBusinessName} onChange={handleContactInfoChange}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Adres</Form.Label>
                        <Form.Control type="text" placeholder="Adres" name="clientAdress" value={clientAdress} onChange={handleContactInfoChange} />
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Miasto</Form.Label>
                        <Form.Control type="text" placeholder="Miasto" name="clientCity" value={clientCity} onChange={handleContactInfoChange}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Województwo</Form.Label>
                        <Form.Control as="select" name="clientState" value={clientState} onChange={handleContactInfoChange}>
                            <option>Wybierz województwo</option>
                            {wojewodztwa.map((wojewodztwo, index) => (
                                <option key={index} value={wojewodztwo}>
                                    {wojewodztwo}
                                </option>
                            ))}
                        </Form.Control>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Kod pocztowy</Form.Label>
                        <Form.Control type="text" placeholder="Kod pocztowy" name="clientZip" value={clientZip} onChange={handleContactInfoChange}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Kraj</Form.Label>
                        <Form.Control type="text" placeholder="Kraj" name='clientCountry' value={clientCountry || "Polska"} onChange={handleContactInfoChange}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder="Email" name="clientEmail" value={clientEmail} onChange={handleContactInfoChange}
                                      required/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Numer telefonu</Form.Label>
                        <Form.Control type="number" placeholder="Numer telefonu" name="clientPhone" value={clientPhone} onChange={handleContactInfoChange}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Numer VAT</Form.Label>
                        <Form.Control type="number" placeholder="Numer VAT" name="vatNumber" value={vatNumber} onChange={handleContactInfoChange}/>
                    </FormGroup>
                </Row>


            </Form>
        </MainModal>
    );
};

export default AddEditLeadModal;
