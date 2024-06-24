export const getToken = () => {
    return localStorage.getItem('token');
};

export const setToken = (token) => {
    localStorage.setItem('token', token);
    console.log('Token saved to localStorage:', token); // Logowanie po zapisaniu tokenu
};

export const removeToken = () => {
    localStorage.removeItem('token');
};
