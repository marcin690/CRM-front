import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { setToken } from '../../utils/auth'; // Importuj funkcję setToken

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8080/auth/login', { username, password });
            console.log(response);
            const token = response.data.jwt;
            setToken(token);
            console.log('Logged in, token:', token);
            setLoading(false);
            navigate('/dashboard');
        } catch (err) {
            setLoading(false);
            setError("Nieprawidłowe dane");
        }
    };

    return (
        <React.Fragment>
            <div className="auth-page-content">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5}>
                            <Card className="mt-4">
                                <CardBody className="p-4">
                                    <img className="logo" src="https://wyposazenie-hotelowe.pl/wp-content/uploads/2023/01/cropped-wh-plus-logo-R-1.png" alt="Logo" />
                                    {error && <Alert variant="danger">{error}</Alert>}
                                    <div className="p-2 mt-4">
                                        <Form onSubmit={handleLogin}>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="username" className="form-label">Nazwa użytkownika</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    id="username"
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <Form.Label htmlFor="password" className="form-label">Hasło</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    id="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    className="form-control"
                                                />
                                            </div>
                                            {error && <p style={{ color: 'red' }}>{error}</p>}
                                            <div className="mt-4">
                                                <Button variant="success" className="w-100" type="submit" disabled={loading}>
                                                    {loading ? <Spinner size="sm" className='me-2' /> : 'Zaloguj się'}
                                                </Button>
                                            </div>
                                        </Form>
                                    </div>
                                </CardBody>
                            </Card>
                            <div className="mt-4 text-center">
                                <p className="mb-0">Nie masz konta? <Link to="/register" className="fw-semibold text-primary text-decoration-underline">Zarejestruj się</Link></p>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Login;
