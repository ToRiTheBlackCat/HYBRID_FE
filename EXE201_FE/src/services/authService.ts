import axiosInstance from "../config/axios";
import { Profile, ProfileUpdate } from "../types";

export const fetchUserProfile = async (userId: string, isTeacher: boolean) : Promise<Profile | null> => {
    try{
        const response = await axiosInstance.get('/api/User/profile', {
            params: {
                userId: userId,
                isTeacher: isTeacher,
            },
        });
        return response.data
    }catch (error){
        console.log(error)
        return null
    }
}

export const updateUserProfile = async (profileData: Partial<ProfileUpdate>) => {
    try{
        const response = await axiosInstance.post('/api/User/update-profile', {
            ...profileData,
        });
        return response.data;
    }catch (error){
        console.log(error);
        return null;
    }
}