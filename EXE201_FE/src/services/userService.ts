import axiosInstance from '../config/axios';
import { User, Account, StudentAccount, TeacherAccount, SupscriptionExtention, UpgradeTierData } from '../types';
import { ResetPasswordData } from '../types';

export const getLocalISOTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset(); // in minutes
    const localTime = new Date(now.getTime() - offset * 60 * 1000);
    return localTime.toISOString().slice(0, -1); // remove the 'Z'
};
//payment
export const checkSupscription = async (body: { userId: string, isTeacher: boolean }) => {
    try {
        const response = await axiosInstance.post(`/api/Auth/check-supscription`, body);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
export const createHistory = async (body: { amount: number, methodId: string }) => {
    try {
        const response = await axiosInstance.post(`/api/Transaction/create-history`, body);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
export const acceptHistory = async (transactionHistoryId: string) => {
    try {
        const response = await axiosInstance.post(`/api/Transaction/accept-history`, null, {
            params: {
                transactionHistoryId: transactionHistoryId
            }
        })
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
export const cancelHistory = async (transactionHistoryId: string) => {
    try {
        const response = await axiosInstance.post(`/api/Transaction/cancel-history`, null, {
            params: {
                transactionHistoryId: transactionHistoryId
            }
        })
        return response.data;
    } catch (error) {
        console.log(error);
    }
}
export const createPaymentRequest = async (body: { transactionId: string, amount: number, buyerName: string }) => {
    try {
        const response = await axiosInstance.post(`/api/Payment/payment-requests`, body);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const checkPayment = async (id: number) => {
    try {
        const response = await axiosInstance.get(`/api/Payment/check-payment/${id}`);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const createStudentSupscription = async (data: SupscriptionExtention) => {
    try {
        const response = await axiosInstance.post(`/api/SupscriptionExtention/create-student`, data);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const createTeacherSupscription = async (data: SupscriptionExtention) => {
    try {
        const response = await axiosInstance.post(`/api/SupscriptionExtention/create-teacher`, data);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}
export const upgradeTier = async (data: UpgradeTierData) => {
    try {
        const response = await axiosInstance.post(`/api/Tier/upgrade`, data);
        return response.data;
    } catch (error) {
        console.log(error);
        return null;
    }
}


export const LoginGoggle = async (body: { token: string, roleId: string }) => {
    try {
        console.log('LoginGoggle credential:', body);
        const response = await axiosInstance.post('/api/Auth/login-google', body,
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
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

export const Login = async (email: string, password: string): Promise<User | null> => {
    try {
        const response = await axiosInstance.post<User>('/api/Auth/login',
            { email, password },
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
    } catch (error) {
        console.error('Login error:', error);
        return null;
    }
}

export const RefreshToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
        const response = await axiosInstance.post<{ accessToken: string; refreshToken: string }>(
            `/api/Auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        if (accessToken && newRefreshToken) {
            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Refresh token error', error);
        return null;
    }
}

export const resetPass = async (email: string) => {
    try {
        const response = await axiosInstance.post('/api/Auth/request-reset', email);
        return response
    } catch (error) {
        console.log(error);
        throw error
    }
}

export const confirmReset = async (data: ResetPasswordData) => {
    try {
        const response = await axiosInstance.post('/api/Auth/confirm-reset', data);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const SignUp = async (account: Account) => {
    try {
        console.log('SignUp account:', account);
        const response = await axiosInstance.post('/api/User/signup', account);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const StudentSignUp = async (account: StudentAccount) => {
    try {
        const response = await axiosInstance.post('/api/User/signup-student', account);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error
    }
}
export const TeacherSignUp = async (account: TeacherAccount) => {
    console.log('TeacherSignUp account:', account);
    try {
        const response = await axiosInstance.post('/api/User/signup-teacher', account);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error
    }
}
export const fetchCourseList = async (courseName: string, levelId: string, currentPage: number) => {
    try {
        const response = await axiosInstance.get('/api/Course', {
            params: {
                courseName: courseName,
                levelId: levelId,
                currentPage: currentPage,
            },
        });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const fetchCourseDetail = async (courseId: string) => {
    try {
        const response = await axiosInstance.get(`/api/Course/${courseId}`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const fetchStudentTier = async () => {
    try {
        const response = await axiosInstance.get(`/api/Tier/tier-student`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const fetchTeacherTier = async () => {
    try {
        const response = await axiosInstance.get(`/api/Tier/tier-teacher`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const getStudentTierById = async (tierId: string) => {
    try {
        const response = await axiosInstance.get(`/api/Tier/tier-student-${tierId}`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const getTeacherTierById = async (tierId: string) => {
    try {
        const response = await axiosInstance.get(`/api/Tier/tier-teacher-${tierId}`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export const getTopMinigame = async (count: number) => {
    try {
        const response = await axiosInstance.get(`/api/MiniGame/Top`, {
            params: { count: count }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        throw error
    }
}