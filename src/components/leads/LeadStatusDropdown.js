import React, {useEffect, useState} from "react";
import api from "../../utils/axiosConfig";
import {useNotification} from "../notyfications/NotyficationContext";
import useLeadStatuses from "./hooks/useLeadStatuses";

const LeadStatusDropdown = ({leadId, currentStatusId, onStatusChange}) => {
    const statuses = useLeadStatuses();
    const [selectedStatus, setSelectedStatus] = useState(null);
    const { notify } = useNotification();

    useEffect(() => {
        if (statuses.length > 0 && currentStatusId !== undefined) {
            const status = statuses.find(s => s.id === currentStatusId);
            if (status) {
                setSelectedStatus(status);
            } else {
                console.warn("Status not found for ID:", currentStatusId);
            }
        }
    }, [statuses, currentStatusId]);

    const handleSelect = async (event) => {
        const statusId = event.target.value;
        const status = statuses.find(s => s.id === parseInt(statusId));

        if (!status) {
            notify("Status not found", "error");
            return;
        }

        const payload = { leadStatusId: status.id };

        try {
            await api.patch(`/leads/${leadId}`, payload);
            setSelectedStatus(status);
            onStatusChange(status);
            notify("Status zaktualizowany", "success");
        } catch (error) {
            notify("Błąd: ", error.message, "error");
        }
    };

    return (
        <div className="form-group">

            <select
                id={`status-select-${leadId}`}
                className="form-select"
                value={selectedStatus ? selectedStatus.id : ""}
                onChange={handleSelect}
            >
                <option value="">Wybierz status</option>
                {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                        {status.statusDescription}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LeadStatusDropdown;
