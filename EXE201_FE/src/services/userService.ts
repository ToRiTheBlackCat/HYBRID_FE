import axiosInstance from '../config/axios';
import {User, Account} from '../types/user';

export const fetchImage = async () => {

}

export const Login = async (email: string, password: string) : Promise<User | null> => {
    try{
        const response = await axiosInstance.post<User>('/api/Auth/login', 
            {email, password},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
            );
            const userData: User = {
                userId: response.data.userId,
                roleId: response.data.roleId,
                roleName: response.data.roleName,
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
            }
            return userData;
        }catch (error) {
            console.error('Login error:', error);
            return null;
        }
}

export const RefreshToken = async (refreshToken: string): Promise<{accessToken: string; refreshToken: string} | null> => {
    try{
        const response = await axiosInstance.post<{accessToken: string; refreshToken: string}>('/api/Auth/refresh',{
            refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        if (accessToken && newRefreshToken) {
        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
        } else {
        return null;
        }
    } catch(error){
        console.error('Refresh token error', error);
        return null;
    }
}

export const resetPass = async (email: string) => {
    try{
        const response = await axiosInstance.post('/api/Auth/reset-pass',email);
        return response
    }catch(error){
        console.log(error);
        throw error
    }
}
export const SignUp = async (account: Account) => {
    try{
        const response = await axiosInstance.post('/api/User/signup', account);
        return response.data;
    }catch (error) {
        console.log(error);
        throw error;
  }
}
