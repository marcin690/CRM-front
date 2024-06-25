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
            const resonse = await api.get("/lead-status")
            setStatuses(resonse.data)
        } catch (error) {
            console.log (error)
            notify(error.message, 'error')
        }
    }

    const handleSelect = async (statusId) => {
        const status = statuses.find(s => s.id === parseInt(statusId))
        if(!status) {
            notify("Status not fund", "error")
            return;
        }

        setSelectedStatus(status);

        try {
            await api.patch(`/leads/${leadId}`, {leadsStatus : {id: status.id}})
            onStatusChange(status);
            notify("Status zaktualizowany", "success")
        } catch (error) {
            console.log(error);
            notify("Błąd: ", error.message, "error")
        }
    }




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