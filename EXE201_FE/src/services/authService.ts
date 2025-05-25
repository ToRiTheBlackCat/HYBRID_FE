import axiosInstance from "../config/axios";
import { Profile } from "../types";

export const fecthUserProfile = async (userId: string, isTeacher: boolean) : Promise<Profile | null> => {
    try{
        const response = await axiosInstance.get('/api/User/profile', {
            params: {
                userId: userId,
                isTeacher: isTeacher,
            },
        });
        console.log(response);
        return response.data
    }catch (error){
        console.log(error)
        return null
    }
}