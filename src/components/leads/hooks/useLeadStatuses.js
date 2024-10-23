// useLeadStatuses.js
import { useState, useEffect } from 'react';
import api from "../../../utils/axiosConfig";
import {useNotification} from "../../notyfications/NotyficationContext";

const useLeadStatuses = () => {
    const [statuses, setStatuses] = useState([]);
    const { notify } = useNotification();

    useEffect(() => {
        fetchStatuses();
    }, []);

    const fetchStatuses = async () => {
        try {
            const response = await api.get('/lead-status'); // Ensure the endpoint is correct
            setStatuses(response.data || []);
        } catch (error) {
            console.log(error);
            notify('Nie można pobrać listy statusów', 'error');
            setStatuses([]);
        }
    };

    return statuses;
};

export default useLeadStatuses;
