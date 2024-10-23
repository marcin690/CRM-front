import api from "../axiosConfig";

const deleteItems = async (endpoint, ids) => {
    try {
        const response = await api.delete(endpoint, {
            data: ids
        });
        return response.data;
    } catch {
        throw new Error('Błąd poczas usuwania rekordu')
    }
}

export default deleteItems;