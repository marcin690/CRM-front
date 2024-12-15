import React, {useEffect, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle, Row, Tab, Table, Tabs} from "react-bootstrap";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';
import {
    EmojiExpressionlessFill,
    EmojiFrownFill,
    EmojiNeutral,
    EmojiNeutralFill, EmojiSmile,
    EmojiSmileFill,
    Textarea,
    X
} from "react-bootstrap-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { pl } from "date-fns/locale";
import { Form } from "react-bootstrap";

function CommentModal({show, handleClose, clientGlobalId, entityId, entityType}) {
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState("")
    const [activeTab, setActiveTab] = useState("add")
    const [filter, setFilter] = useState("")
    const [commentSentiment, setCommentSentiment] = useState("NEUTRAL");
    const [eventDate, setEventDate] = useState(new Date());
    const { notify } = useNotification();
    const [filters, setFilters] = useState(["LEAD", "OFFER", "PROJECT", "CLIENT"])

    useEffect(() => {

        if (clientGlobalId && show) {
            fetchComments(clientGlobalId);
        }
    }, [clientGlobalId, show]);

    const fetchComments = async (id) => {
        setLoading(true);
        try {
            const response = await api.get(`/comments/client/${id}`)
            setComments(response.data.content || [])
        } catch (error) {
            notify("Bład. Nie można pobrać komentarzy: ", "error");
        } finally {
            setLoading(false);
        }
    }

    const handleAddComment = async () => {
        if(!newComment.trim()) return;
        try {

            const data = {
                clientGlobalId,
                content: newComment,
                commentSentiment,
                eventDate: eventDate.toISOString(),
                entityType
            }

            if (entityType === "LEAD"){
                data.leadId = entityId;
            } else if (entityType === "OFFER") {
                data.offerId = entityId;
            } else if (entityType === "PROJECT") {
                data.projectId = entityId;
            }



            await api.post("/comments", data)
            notify("Komentarz został dodany", "success");
            fetchComments(clientGlobalId)
            setNewComment("")
        } catch (error) {
            notify("Bład. Nie można dodać komentarza: ", "error");
        }
    }

    const toggleFilter = (filterType) => {
        setFilters((prevFilters) =>
            prevFilters.includes(filterType)
                ? prevFilters.filter((filter) => filter !== filterType) // Usuń, jeśli istnieje
                : [...prevFilters, filterType] // Dodaj, jeśli nie istnieje
        );
    };

    const filteredComments = comments.filter((comment) =>
        filters.length > 0 ? filters.includes(comment.entityType) : true
    );

    const handleDeleteComment = async (commentId) => {
        const confirmDelete = window.confirm("Czy na pewno chcesz usunąć ten komentarz?")
        if (!confirmDelete) return;

        try {
            await api.delete(`/comments/${commentId}`)
            setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
            notify("Komentarz został usunięty", "success");
        } catch (error) {
            notify("Błąd podczas usuwania komentarza", "error");
        }



    }

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <ModalHeader closeButton>
                <ModalTitle>Historia klienta {clientGlobalId}</ModalTitle>
            </ModalHeader>

            <ModalBody>
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
                    <Tab eventKey="add" title="Dodaj komentarz">
                        <div>
                            <label htmlFor="newComment" className="form-label">Treść komentarz</label>
                            <ReactQuill
                                theme="snow"
                                value={newComment}
                                onChange={setNewComment}

                            />
                            <Row>
                                <div className="col mb-3">
                                    <Form.Label>Ocena komentarza</Form.Label>
                                   <div className="d-flex align-items-center gap-3">
                                       <Button
                                       variant={commentSentiment === 'POSITIVE' ? 'success' : 'outline-secondary'}
                                       onClick={() => setCommentSentiment('POSITIVE')}
                                       >
                                            <EmojiSmileFill size={24}></EmojiSmileFill>
                                       </Button>

                                       <Button
                                           variant={commentSentiment === 'NEUTRAL' ? 'outline-warning' : 'outline-secondary'}
                                           onClick={() => setCommentSentiment('NEUTRAL')}
                                       >
                                           <EmojiSmile size={24} />
                                       </Button>

                                       <Button
                                           variant={commentSentiment === 'NEGATIVE' ? 'danger' : 'outline-secondary'}
                                           onClick={() => setCommentSentiment('NEGATIVE')}
                                       >
                                           <EmojiFrownFill size={24} />
                                       </Button>
                                   </div>
                                </div>

                                <div className="col mb-3 d-flex flex-column">
                                    <Form.Label>Data zdarzenia</Form.Label>
                                    <DatePicker
                                        selected={eventDate}
                                        onChange={(date) => setEventDate(date)}
                                        dateFormat="yyyy-MM-dd"
                                        className="form-control"
                                        locale={pl}
                                    />
                                </div>
                            </Row>

                            <Button variant="primary" onClick={handleAddComment} className="mt-2">Dodaj</Button>


                        </div>
                    </Tab>
                    <Tab eventKey="history" title="Historia">
                        <div className="pb-3">
                            <label className="form-label">Filtruj według źródła</label>
                            <div className="d-flex flex-wrap">
                                {["LEAD", "OFFER", "PROJECT", "CLIENT"].map((type) => (
                                    <Form.Check
                                        key={type}
                                        type="checkbox"
                                        id={`filter-${type}`}
                                        label={type}
                                        checked={filters.includes(type)}
                                        onChange={() => toggleFilter(type)}
                                        className="me-3"
                                    />
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <p>Ładowanie... </p>
                        ) : (
                            <Table striped border className="mt-4">
                                <thead>
                                <th>Typ</th>
                                <th></th>
                                <th>Treść</th>
                                <th>Data</th>
                                <th>Autor</th>
                                <th>Akcje</th>

                                </thead>
                                <tbody>
                                {filteredComments.map((comment) => {
                                    return (
                                        <tr key={comment.id}>
                                            <td>{comment.entityType || "Brak"} </td>
                                            <td> {comment.commentSentiment === 'POSITIVE' &&
                                                <EmojiSmileFill color="green"/>}
                                                {comment.commentSentiment === 'NEUTRAL' && <EmojiSmile color="orange"/>}
                                                {comment.commentSentiment === 'NEGATIVE' &&
                                                    <EmojiFrownFill color="red"/>}</td>
                                            <td dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(comment.content)}}></td>
                                            <td>{new Date(comment.eventDate).toLocaleDateString()}</td>
                                            <td>{comment.createdBy}</td>
                                            <td>

                                                <X
                                                    className="close-icon"
                                                    style={{cursor: "pointer"}} // Dodaj klikalność
                                                    onClick={() => handleDeleteComment(comment.id)} // Akcja przy kliknięciu
                                                    size={20} // Rozmiar (opcjonalnie)
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </Table>
                        )}
                    </Tab>

                </Tabs>
            </ModalBody>


        </Modal>
    )

}

export default CommentModal;