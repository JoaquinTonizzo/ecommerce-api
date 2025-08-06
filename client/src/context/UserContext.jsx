// context/UserContext.jsx
import { createContext, useEffect, useState } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser(payload);
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}
