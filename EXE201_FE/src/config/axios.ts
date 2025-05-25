import axios from 'axios';
import {store} from '../store/store';
import { RefreshToken } from '../services/userService';
import { setUserRedux, logout } from '../store/userSlice';
import Cookies from 'js-cookie';

const API_URL = "https://localhost:64326/"

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = store.getState().user.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['Access-Control-Allow-Origin'] = '*';
        config.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        config.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
    );
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;

            try{
                const currentUser = store.getState().user;
                const refreshData = await RefreshToken(currentUser.refreshToken);
                if(refreshData){
                    const updatedUser = {
                        ...currentUser,
                        accesstoken: refreshData.accessToken,
                        refreshToken: refreshData.refreshToken,
                    };

                    store.dispatch(setUserRedux(updatedUser));
                    Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });

                    originalRequest.headers.Authorization = `Bearer ${refreshData.accessToken}`;
                    return axiosInstance(originalRequest);
                }else{
                    throw new Error('Refresh token failed')
                }
            } catch (err){
                console.error('Refresh token failed:', err);
                store.dispatch(logout());
                Cookies.remove('user');
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);
export default axiosInstance;