import React, {useState} from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, ModalTitle} from "react-bootstrap";

function MainModal({title, children, show, handleClose, formId, size= "xl"}) {

    return (
        <>


            <Modal show={show} onHide={handleClose} size={size}>
                <ModalHeader closeButton>
                    <ModalTitle>{title}</ModalTitle>
                </ModalHeader>
                <ModalBody>
                    {children}
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={handleClose}>
                        Zamknij
                    </Button>
                    <Button type="submit" form={formId}>
                        Zapisz
                    </Button>
                </ModalFooter>

            </Modal>
        </>
    )
}

export default MainModal