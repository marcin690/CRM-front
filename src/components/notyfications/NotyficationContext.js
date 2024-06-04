import React, { createContext, useContext } from "react";
import { toast } from "react-hot-toast";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const notify = (message, type) => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'info':
                toast(message, {
                    icon: 'ℹ️',
                    style: {
                        background: '#2196F3',
                        color: '#fff',
                    },
                });
                break;
            default:
                toast(message);
        }
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
