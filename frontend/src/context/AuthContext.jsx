import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import * as api from "../api.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [token, setToken] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const storedToken =
            localStorage.getItem("access_token");

        const storedUser =
            localStorage.getItem("user");

        if (storedToken) {

            setToken(storedToken);

        }

        if (storedUser) {

            setUser(
                JSON.parse(storedUser)
            );

        }

        setLoading(false);

    }, []);

    async function login(email, password) {

        const response =
            await api.login(email, password);

        localStorage.setItem(
            "access_token",
            response.access_token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(response.user)
        );

        setToken(response.access_token);

        setUser(response.user);
    }

    async function logout() {

        try {

            await api.logout();

        }

        catch {

        }

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "user"
        );

        setToken(null);

        setUser(null);
    }

    return (

        <AuthContext.Provider

            value={{

                user,

                token,

                loading,

                login,

                logout,

                isAuthenticated: !!token,

            }}

        >

            {children}

        </AuthContext.Provider>

    );

}

export function useAuth() {

    return useContext(AuthContext);

}