import axiosInstance from "../config/axios";
import { Profile, ProfileUpdate, Conjunction } from "../types";

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
export const fetchCourseMinigame = async (courseId: string) => {
    try{
        const response = await axiosInstance.get(`/api/MiniGame/course/${courseId}`);
        return response.data;
    }catch (error) {
        console.log(error);
        return null;
    }
}
export const createConjunction = async (conjunctionData: Conjunction) => {
    try{
        // Tạo FormData để gửi dữ liệu multipart
        const formData = new FormData();
        formData.append('MinigameName', conjunctionData.MinigameName);
        if (conjunctionData.ImageFile) {
            formData.append('ImageFile', conjunctionData.ImageFile);
        }
        formData.append('TeacherId', conjunctionData.TeacherId);
        formData.append('GameDataJson', conjunctionData.GameDataJson);
        formData.append('Duration', conjunctionData.Duration.toString());
        formData.append('TemplateId', conjunctionData.TemplateId);
        formData.append('CourseId', conjunctionData.CourseId);
        // Thêm GameData (luôn là mảng rỗng)
        // conjunctionData.GameData.forEach((entry: ConjunctionEntry, index: number) => {
        //     formData.append(`GameData[${index}]`, JSON.stringify(entry));
        // });
        // // Vì GameData là mảng rỗng, chúng ta có thể thêm một trường để thể hiện điều đó
        // if (conjunctionData.GameData.length === 0) {
        //     formData.append('GameData', JSON.stringify([]));
        // }
        console.log('FormData contents:');
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
            // Nếu value là File, hiển thị thêm thông tin
            if (value instanceof File) {
                console.log(`  - Filename: ${value.name}, Size: ${value.size} bytes`);
            }
        }

        // Gửi yêu cầu POST với header multipart/form-data
        const response = await axiosInstance.post('/api/MiniGame/conjunction', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error creating conjunction:', error);
        // Nếu muốn xử lý lỗi chi tiết hơn, bạn có thể ném lỗi
        // throw new Error('Failed to create conjunction');
        return null;
    }
}
export const fetchteacherMinigames = async (teacherId: string) => {
    try{
        const response = await axiosInstance.get(`/api/MiniGame/teacher/${teacherId}`);
        return response.data;
    }catch (error) {
        console.log(error);
        return null;
    }
}
export const fetchPlayMinigames = async (minigameId: string) => {
    try{
        const response = await axiosInstance.get(`api/Minigame/${minigameId}`);
        return response.data;
    }catch (error){
        console.log(error);
        return null;
    }
}