import api from "../axiosConfig";

const fetchSellers = async (setUsers) => {
    try {
        const response = await api.get('/users/sellers');
        setUsers(response.data); // Save users in state
    } catch (error) {
        const errorMessage =
            error.response?.data?.message || // Try to read the message from the backend
            error.response?.statusText ||   // Try to read the HTTP status
            "Unknown error";                // Default message
        console.error("Error fetching sellers:", errorMessage);
    }
};

export default fetchSellers;
