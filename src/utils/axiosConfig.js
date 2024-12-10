import axios from 'axios';
import { getToken } from './auth';

const api = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json'
    }
});

export const fetchCommentCount = async (entityType, entityId) => {
    try {
        const response = await api.get(`/comments/${entityType}/${entityId}/count`);
        return response.data || 0
    } catch (error) {
        console.error(`Nie udało się pobrać liczby komentarzy dla ${entityType} o ID ${entityId}:`, error);
        return 0;
    }
}

api.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;
