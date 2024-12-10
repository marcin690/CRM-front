import {useState} from "react";
import {useNotification} from "../notyfications/NotyficationContext";
import AsyncSelect from "react-select/async";
import api from "../../utils/axiosConfig";


const ClientSearchDropdown = ({onClientSelect, defaultClient}) => {

    const [selectedClient, setSelectedClient] = useState(
        defaultClient ?{ value: defaultClient.id, label: `${defaultClient.name || "Brak nazwy"} (${defaultClient.id})` } : null
    );
    const [errorMessage, setErrorMessage] = useState(""); // Stan do zarządzania komunikatem
    const {notify} = useNotification();

    const loadOptions = async (inputValue) => {
        try {
            const response = await api.get(`/leads`, {
                params: {
                    search: inputValue || "", // Jeśli brak inputValue, szukaj domyślnie
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
            setSelectedClient(selectedOption)
            onClientSelect(selectedOption ? selectedOption.value : null)
        }

        return (
            <div className="form-group">
                <label htmlFor="clientSearch" className="form-label">
                    Klient
                </label>
                <AsyncSelect
                    id="clientSearch"
                    cacheOptions
                    loadOptions={loadOptions}
                    defaultOptions
                    value={selectedClient}
                    onChange={handleChange}
                    placeholder="Wybierz i zacznij pisać"
                    isClearable
                />

            </div>
        )


}

export default ClientSearchDropdown