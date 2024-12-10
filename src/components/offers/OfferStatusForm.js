import {useEffect, useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import api from "../../utils/axiosConfig";

const OfferStatusChange = ({offerId, currentStatus}) => {
    const [status, setStatus] = useState(currentStatus)
    const [loading, setLoading] = useState(false)

    const {notify} = useNotification();

    const offerStatuses = [
        { value: "SENT", label: "Wysłana", color: "text-primary" },
        { value: "ACCEPTED", label: "Zaakceptowana", color: "text-success" },
        { value: "REJECTED", label: "Odrzucona", color: "text-danger" },
        { value: "SIGNED", label: "Podpisana umowa", color: "text-warning" },
    ];
    const handleStatusChange = async (e) => {
        const newStatus = e.target.value
        setStatus(newStatus);
        setLoading(true);

        try {
            await api.put(`/offers/${offerId}/status`, JSON.stringify(newStatus));
            notify("Status został zaktualizowany!", "success");
        } catch {
            notify("Nie udało się zaktualizować statusu", "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <tr>
            <td className="py-3 fw-medium">Status</td>
            <td className="py-3">

                <select
                    className="form-select form-select-sm"
                    value={status}
                    onChange={handleStatusChange}
                    disabled={loading}
                >
                    <option value="" disabled>
                        Wybierz status
                    </option>
                    {offerStatuses.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
            </td>
        </tr>
    )


}

export default OfferStatusChange