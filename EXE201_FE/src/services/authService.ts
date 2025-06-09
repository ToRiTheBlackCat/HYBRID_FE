import axiosInstance from "../config/axios";
import { Profile, ProfileUpdate, Conjunction, Anagram, MinigameData, UpdateConjunctionData, FetchTeacherMinigamesParams, UpdateAnagramData } from "../types";

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
        formData.append('Duration', conjunctionData.Duration.toString());
        formData.append('TemplateId', conjunctionData.TemplateId);
        formData.append('CourseId', conjunctionData.CourseId);
        conjunctionData.GameData.forEach((entry, index) => {
            formData.append(`GameData[${index}].Term`, entry.Term);
            formData.append(`GameData[${index}].Definition`, entry.Definition);
        });
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
export const fetchTeacherMinigames = async ({
  teacherId,
  minigameName,
  templateId,
  pageNum,
  pageSize,
}: FetchTeacherMinigamesParams) => {
  try {
    // Tạo params mới chỉ chứa các trường không rỗng
    const params: Record<string, unknown> = {
      PageNum: pageNum,
      PageSize: pageSize,
    };

    if (minigameName) {
      params.MinigameName = minigameName;
    }

    if (templateId) {
      params.TemplateId = templateId;
    }

    const response = await axiosInstance.get(`/api/MiniGame/teacher/${teacherId}`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch minigames:", error);
    return null;
  }
};
export const fetchPlayMinigames = async (minigameId: string) => {
    try{
        const response = await axiosInstance.get(`api/Minigame/${minigameId}`);
        return response.data;
    }catch (error){
        console.log(error);
        return null;
    }
}
export const createAnagram = async (anagramData: Anagram) => {
    try {
        const formData = new FormData();
        formData.append('MinigameName', anagramData.MinigameName);
        formData.append('TeacherId', anagramData.TeacherId);
        formData.append('GameDataJson',anagramData.GameDataJson);
        formData.append('Duration', anagramData.Duration.toString());
        formData.append('TemplateId', anagramData.TemplateId);
        formData.append('CourseId', anagramData.CourseId);

        if (anagramData.ImageFile) {
            formData.append('ImageFile', anagramData.ImageFile);
        }

        const response = await axiosInstance.post('/api/MiniGame/anagram', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error creating anagram:', error);
        return null;
    }
}
export const createQuiz = async (quizData: MinigameData) => {
    try {
        const formData = new FormData();
        formData.append('MinigameName', quizData.MinigameName);
        formData.append('TeacherId', quizData.TeacherId);
        formData.append('GameDataJson', quizData.GameDataJson);
        formData.append('Duration', quizData.Duration.toString());
        formData.append('TemplateId', quizData.TemplateId);
        formData.append('CourseId', quizData.CourseId);

        if (quizData.ImageFile) {
            formData.append('ImageFile', quizData.ImageFile);
        }

        const response = await axiosInstance.post('/api/MiniGame/quiz', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error creating quiz:', error);
        return null;
    }
}
// Hàm hỗ trợ: tải ảnh từ URL và chuyển thành File
async function fetchImageAsFile(imageUrl: string, fileName: string): Promise<File> {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], fileName, { type: blob.type });
    return file;
}
// Hàm hỗ trợ: tải ảnh từ URL và chuyển thành File với tên tùy chỉnh
export const fetchImageUrlAsFile = async (url: string, filename: string): Promise<File> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type });
};
export const editConjunction = async (updateData: UpdateConjunctionData) => {
    try {
        const formData = new FormData();
        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);

        // Nếu có ảnh mới thì dùng ảnh mới, nếu không thì lấy ảnh cũ từ ImageUrl
        let imageFile: File | null = null;

        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            imageFile = await fetchImageAsFile(updateData.ImageUrl, 'thumbnail.jpg');
        }

        if (imageFile) {
            formData.append('ImageFile', imageFile);
        } else {
            throw new Error('No image file provided or found in ImageUrl');
        }

        formData.append('Duration', updateData.Duration.toString());
        formData.append('TemplateId', updateData.TemplateId);

        updateData.GameData.forEach((entry, index) => {
            formData.append(`GameData[${index}].Term`, entry.Term);
            formData.append(`GameData[${index}].Definition`, entry.Definition);
        });

        const response = await axiosInstance.put(`/api/MiniGame/conjunction/`, formData, {
            params: { fakeTeacherId: updateData.TeacherId },
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error editing conjunction:', error);
        return null;
    }
};

export const editAnagram = async (updateData: UpdateAnagramData) => {
    try {
        const formData = new FormData();
        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);
        if (updateData.ImageFile) {
            formData.append('ImageFile', updateData.ImageFile);
        }
        formData.append('Duration', updateData.Duration.toString());
        formData.append('TemplateId', updateData.TemplateId);

        const response = await axiosInstance.put(`/api/MiniGame/anagram/`, formData, {
            params: {fakeTeacherId: updateData.TeacherId}, // Thêm tham số nếu cần
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error editing anagram:', error);
        return null;
    }
}
