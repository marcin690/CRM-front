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

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [roomsQuantity, setRoomsQuantity] = useState("");
    const [executionDate, setExecutionDate] = useState(null);
    const [assignedTo, setAssignedTo] = useState(null);
    const [users, setUsers] = useState([])
    const [leadStatus, setLeadStatus] = useState({ id: 1 });
    const [leadSource, setLeadSource] = useState({});
    const [leadSources, setLeadSources] = useState([])

    const [contactInfo, setContactInfo] = useState({
        fullName: "",
        clientBusinessName: "",
        clientAdress: "",
        clientCity: "",
        clientState: "",
        clientZip: "",
        clientCountry: "",
        clientEmail: "",
        clientPhone: 0,
        vatNumber: 0
    });

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
            setContactInfo(leadToEdit.contactInfo || {});
            setLeadSource(leadToEdit.leadSource || { id: 1 })
            setRoomsQuantity(leadToEdit.roomsQuantity)
            setExecutionDate(leadToEdit.executionDate ? new Date(leadToEdit.executionDate) : null )
        }
    }, [leadToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formattedDate = executionDate ? executionDate.toISOString() : null;

            let contactInfoResponse;
            if (leadToEdit && leadToEdit.contactInfo && leadToEdit.contactInfo.id) {
                contactInfoResponse = await api.put(`/contact-info/${leadToEdit.contactInfo.id}`, contactInfo);
            } else {
                contactInfoResponse = await api.post("/contact-info", contactInfo);
            }

            const leadData = {
                name,
                description,
                roomsQuantity,
                contactInfo: contactInfoResponse.data,
                leadSource: leadSource,
                assignedTo: assignedTo,
                executionDate: formattedDate
            };

            if (leadToEdit) {
                await api.patch(`/leads/${leadToEdit.id}`, leadData);
                notify("Lead został zaktualizowany", "success");
            } else {
                await api.put("/leads", leadData);
                notify("Lead został dodany", "success");
            }

            refresLeads();
            handleClose();
        } catch (error) {
            notify(error.message || "Wystąpił błąd", "error");
        }
    };

    const handleContactInfoChange = (field, value) => {
        setContactInfo((prev) => ({ ...prev, [field]: value }));
    };

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
                        <Form.Control
                            as="select"
                            value={leadSource.id ? leadSource.id : ""}
                            onChange={(e) => setLeadSource(leadSources.find(ls => ls.id === parseInt(e.target.value)))}
                        >
                            <option value="">Wybierz źródło</option>
                            {leadSources.map((source) => (
                                <option key={source.id} value={source.id}>
                                    {source.description}
                                </option>
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
                        <Form.Control type="text" placeholder="Imię i nazwisko" value={contactInfo.fullName}
                                      onChange={(e) => handleContactInfoChange("fullName", e.target.value)} required/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Nazwa firmy</Form.Label>
                        <Form.Control type="text" placeholder="Nazwa firmy" value={contactInfo.clientBusinessName}
                                      onChange={(e) => handleContactInfoChange("clientBusinessName", e.target.value)}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Adres</Form.Label>
                        <Form.Control type="text" placeholder="Adres" value={contactInfo.clientAdress}
                                      onChange={(e) => handleContactInfoChange("clientAdress", e.target.value)}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Miasto</Form.Label>
                        <Form.Control type="text" placeholder="Miasto" value={contactInfo.clientCity}
                                      onChange={(e) => handleContactInfoChange("clientCity", e.target.value)}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Województwo</Form.Label>
                        <Form.Control as="select" value={contactInfo.clientState} onChange={(e) => handleContactInfoChange("clientState", e.target.value)}>
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
                        <Form.Control type="text" placeholder="Kod pocztowy" value={contactInfo.clientZip}
                                      onChange={(e) => handleContactInfoChange("clientZip", e.target.value)}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Kraj</Form.Label>
                        <Form.Control type="text" placeholder="Kraj" value={contactInfo.clientCountry || "Polska"}
                                      onChange={(e) => handleContactInfoChange("clientCountry", e.target.value)}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control type="email" placeholder="Email" value={contactInfo.clientEmail}
                                      onChange={(e) => handleContactInfoChange("clientEmail", e.target.value)}
                                      required/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Numer telefonu</Form.Label>
                        <Form.Control type="number" placeholder="Numer telefonu" value={contactInfo.clientPhone}
                                      onChange={(e) => handleContactInfoChange("clientPhone", e.target.value)}/>
                    </FormGroup>
                    <FormGroup className="col-lg-3">
                        <Form.Label>Numer VAT</Form.Label>
                        <Form.Control type="number" placeholder="Numer VAT" value={contactInfo.vatNumber}
                                      onChange={(e) => handleContactInfoChange("vatNumber", e.target.value)}/>
                    </FormGroup>
                </Row>


            </Form>
        </MainModal>
    );
};

export default AddEditLeadModal;
