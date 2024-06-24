import React, {useEffect, useState} from "react";
import api from "../../utils/axiosConfig";
import {useNotification} from "../notyfications/NotyficationContext";
import {Dropdown, DropdownToggle} from "react-bootstrap";

const LeadStatusDropdown = ({leadId, currentStatus, onStatusChange}) => {
    const [statuses, setStatuses] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(currentStatus || {})
    const { notify } = useNotification();


    useEffect(() => {
        fetchStatuses();
    }, []);

    useEffect(() => {
        setSelectedStatus(currentStatus || {})
    }, [currentStatus])

    const fetchStatuses = async () => {
        try {
            const response = await api.get('/lead-status')
            setStatuses(response.data);
        } catch (error) {
            console.log(error)
            notify(error.message, 'error')
        }
    }

    const handleSelect = async (ststusId) => {
        const status = statuses.find(s => s.id === ststusId)
        setSelectedStatus(status);

        try {
            await api.patch(`/leads/${leadId}`, {leadStatus: status});
            onStatusChange(status);
            notify('Status został zaktualizowany', 'succes' )
        } catch (error) {
            console.log(error);
            notify(error.message, 'error')
        }


    };

    return (
        <Dropdown onSelect={handleSelect}>
            <Dropdown.Toggle variant="light" id="dropdown-basic">
                <span>
                     {selectedStatus?.statusDescription}
                </span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
                {statuses.map(status => (
                    <Dropdown.Item
                    key={status.id}
                    eventKey={status.id}
                    >
                        {status.statusDescription}
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )


}

export default LeadStatusDropdown