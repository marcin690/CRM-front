import React, {useEffect, useState} from "react";
import {Button, Form, FormCheck, FormGroup} from "react-bootstrap";
import MainModal from "../MainModal";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";



function AddEditUserModal({refreshUsers, userToEdit}) {

    const formId = "userForm"
    const { notify } = useNotification();
    const [show, setShow] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("USER")
    const [fullname, setFullname] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("");
    const [isSalesRepresentative, setIsSalesRepresentative] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const handleShow = () =>  {
        resetForm();
        setShow(true)
    }

    const handleClose = () => {
        setShow(false);
        resetForm();
    };

    const resetForm = () => {
        setUsername("");
        setPassword("");
        setFullname("");
        setPhone("");
        setEmail("");

    };

    useEffect(() => {
        if (userToEdit) {
            setUsername(userToEdit.username);
            setFullname(userToEdit.fullname);
            setPhone(userToEdit.phone);
            setEmail(userToEdit.email);

            setIsSalesRepresentative(userToEdit.isSalesRepresentative || false);


            if(Array.isArray(userToEdit.roles &&userToEdit.roles.length > 1)){
                setRole(userToEdit.roles[0].name || "USER");
                setIsAdmin(userToEdit.roles.some(role => role.name === "ADMIN"));
            } else {
                setRole("USER");
                setIsAdmin(false);
            }
            setShow(true); // Open the modal if userToEdit is not null
        }
    }, [userToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userData = {
            username: username,
            password: password,
            fullname: fullname,
            phone: phone,
            email: email,
            roles: isAdmin ? [{name: "ADMIN"}] : [{name: role}],
            isSalesRepresentative: isSalesRepresentative

        };

        try {
            if(userToEdit) {
                await api.patch(`/users/edit/${userToEdit.id}`, userData)
                notify('Użytkownik został zaktualizowany', 'success');
            } else {
                await api.post("/auth/register", userData)
                notify('Użytkownik został dodany', 'success');
            }
            refreshUsers();
            handleClose();
        } catch (error) {
            notify(error.message, 'error');
        }
    }
    return (
        <>
            <Button className="btn btn-soft-primary" onClick={handleShow}><i
                className="ri-add-line align-bottom me-1"></i> {userToEdit ? "Edutuj użytkownika" : "Dodaj użytkownika "}</Button>

            <MainModal title={userToEdit ? "Edytuj użytkownika" : "Dodaj użytkownika "} show={show} handleClose={handleClose}  formId={formId}>
                <Form onSubmit={handleSubmit} id={formId}>
                    <Form.Group className="mb-3" controlId="formUsername">

                        <Form.Label>Nazwa użytkownika </Form.Label>
                        <Form.Control type="text" placeholder="Nazwa użytkownika" value={username} onChange={(e) => setUsername(e.target.value)} disabled={!!userToEdit} required>
                        </Form.Control>

                    </Form.Group>



                    <Form.Group>
                        <Form.Label>Hasło</Form.Label>
                        <Form.Control type="password" placeholder="Wpisz hasło" value={password} onChange={(e) => setPassword(e.target.value)}></Form.Control>
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Imię</Form.Label>
                        <Form.Control type="text" placeholder="Imię" value={fullname} onChange={(e) => setFullname(e.target.value)}></Form.Control>
                    </Form.Group>

                    <FormGroup>
                        <Form.Label>E-mail</Form.Label>
                        <Form.Control type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}></Form.Control>
                    </FormGroup>

                    <FormGroup>
                        <Form.Label>Numer telefonu</Form.Label>
                        <Form.Control type="number" placeholder="Numer telefonu" value={phone} onChange={(e) => setPhone(e.target.value)}></Form.Control>
                    </FormGroup>

                    <Form.Group className="mb-3" controlId="formUsername">

                        <Form.Label>Opcje </Form.Label>
                        <Form.Check type="checkbox" checked={isSalesRepresentative} label="Handlowiec"
                        onChange={() => setIsSalesRepresentative(!isSalesRepresentative)}
                        ></Form.Check>
                        <Form.Check type="checkbox" checked={isAdmin} label="Administrator"
                        onChange={() => setIsAdmin(!isAdmin)}
                        ></Form.Check>

                    </Form.Group>


                </Form>

            </MainModal>
        </>

    )

}

export default AddEditUserModal