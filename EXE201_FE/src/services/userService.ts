import axiosInstance from '../config/axios';
import {User, Account, StudentAccount, TeacherAccount} from '../types/user';
import { ResetPasswordData } from '../types';

export const fetchImage = async () => {

}

export const LoginGoggle = async (credential: string) => {
    try{
        console.log('LoginGoggle credential:', credential);
        const response = await axiosInstance.post('/api/Auth/login-google', credential,
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
        console.log('LoginGoggle response:', response.data);
        return userData;
    }catch (error) {
        console.error('Login error:', error);
        return null;
    }
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
        const response = await axiosInstance.post('/api/Auth/request-reset',email);
        return response
    }catch(error){
        console.log(error);
        throw error
    }
}

export const confirmReset = async (data: ResetPasswordData) => {
    try{
        const response = await axiosInstance.post('/api/Auth/confirm-reset', data);
        return response;
    }catch (error) {
        console.log(error);
        throw error;
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
export const StudentSignUp = async (account: StudentAccount) => {
    try{
        const response = await axiosInstance.post('/api/User/signup-student', account);
        return response.data;
    }catch (error) {
        console.log(error);
        throw error
    }
}
export const TeacherSignUp = async (account: TeacherAccount) => {
    try{
        const response = await axiosInstance.post('/api/User/signup-teacher', account);
        return response.data;
    }catch(error){
        console.log(error);
        throw error
    }
}
export const fetchCourseList = async (courseName: string, levelId: string, currentPage: number) => {
    try{
        const response = await axiosInstance.get('/api/Course', {
            params: {
                courseName: courseName,
                levelId: levelId,
                currentPage: currentPage,
            },
        });
        return response.data;
    }catch (error) {
        console.log(error);
        throw error;
    }
}
export const fetchCourseDetail = async (courseId: string) => {
    try{
        const response = await axiosInstance.get(`/api/Course/${courseId}`);
        return response.data;
    }catch (error) {
        console.log(error);
        throw error;
    }
}
