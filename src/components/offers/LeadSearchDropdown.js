import { useState } from "react";
import api from "../../utils/axiosConfig";
import { useNotification } from "../notyfications/NotyficationContext";
import AsyncSelect from "react-select/async";

const LeadSearchDropdown = ({ onLeadSelect, defaultLead }) => {
    const [selectedLead, setSelectedLead] = useState(
        defaultLead ? { value: defaultLead.id, label: `${defaultLead.name || "Brak nazwy"} (${defaultLead.id})` } : null
    );
    const [errorMessage, setErrorMessage] = useState(""); // Stan do zarządzania komunikatem
    const { notify } = useNotification();

    const loadOptions = async (inputValue) => {
        if (inputValue.length < 3) {
            setErrorMessage("Wprowadź przynajmniej 3 znaki");
            return [];
        }

        try {
            const response = await api.get(`/leads`, {
                params: {
                    search: inputValue,
                    size: 10,
                },
            });

            const leads = response.data._embedded?.leadDTOList || [];
            if (leads.length === 0) {
                setErrorMessage("Nie znaleziono wyników dla podanego wyszukiwania");
                return [];
            }

            setErrorMessage(""); // Usunięcie komunikatu o błędzie, jeśli są wyniki
            return leads.map((lead) => ({
                value: lead.id,
                label: `${lead.id} - ${lead.name || "Brak nazwy"} - ${
                    lead.clientBusinessName || "Brak nazwy firmy"
                } - ${lead.clientFullName || "Brak pełnej nazwy"}`,
            }));
        } catch (error) {
            notify(`Błąd podczas pobierania leadów: ${error.message}`, "error");
            return [];
        }
    };

    const handleChange = (selectedOption) => {
        setSelectedLead(selectedOption);
        onLeadSelect(selectedOption ? selectedOption.value : null);
    };

    return (
        <div className="form-group">
            <label htmlFor="leadSearch" className="form-label">
              Lead
            </label>
            <AsyncSelect
                id="leadSearch"
                cacheOptions
                loadOptions={loadOptions}
                defaultOptions
                value={selectedLead}
                onChange={handleChange}
                placeholder="Wybierz i zacznij pisać"
                isClearable
            />

        </div>
    );
};

export default LeadSearchDropdown;
