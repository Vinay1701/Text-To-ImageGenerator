import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { assets } from '../assets/assets'; // Import assets

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [credit, setCredit] = useState(1000); // Mock credits with a high initial value

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const loadCreditsData = async () => {
        console.log('loadCreditsData skipped - using mock credits');
        setCredit(1000); // Keep mock credits
        setUser({ _id: 'mock-user-id-123', name: 'Mock User', email: 'mock@example.com' }); // Include _id
    };
    

    const generateImage = async (prompt) => {
        try {

            console.log('Calling API with userId:', user?._id);
            const res = await axios.post(`${backendUrl}/api/image/generate-image`, {
                userId: user._id, // Make sure `user` has `_id` set properly
                prompt,
            });
    
            if (res.data.success) {
                setCredit(res.data.creditBalance); // update credit
                return res.data.resultImage;
            } else {
                toast.error(res.data.message);
                return null;
            }
        } catch (error) {
            toast.error("Something went wrong while generating the image");
            console.error(error);
            return null;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
        setCredit(1000);
    };

    useEffect(() => {
        if (token) {
            loadCreditsData();
        }
    }, [token]);

    const value = {
        token, setToken,
        user, setUser,
        showLogin, setShowLogin,
        credit, setCredit,
        loadCreditsData,
        backendUrl,
        generateImage,
        logout
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;