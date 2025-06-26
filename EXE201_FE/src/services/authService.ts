
import axiosInstance from "../config/axios";
import { Profile, ProfileUpdate, Conjunction, Anagram, QuizData, UpdateConjunctionData,
     FetchTeacherMinigamesParams, UpdateAnagramData, UpdateQuizData, RandomCardData,
    UpdateRandomCardData, SpellingData, UpdateSpellingData, Accomplishment, FlashCardData,
    UpdateFlashCard, rateMinigameData, CompletionData, UpdateCompletionData,
    PairingData, UpdatePairingData, RestorationData,  UpdateRestorationData,
    TrueFalse, UpdateTrueFalseData, FindWordData, UpdateFindWordData } from "../types";

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
export const fetchCourseMinigame = async (
  courseId: string,
  filters?: {
    MinigameName?: string;
    TemplateId?: string;
    PageNum?: number;
    PageSize?: number;
  }
) => {
  try {
    const response = await axiosInstance.get(`/api/MiniGame/course/${courseId}`, {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

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
export const fetchMinigameScore = async (minigameId: string) => {
    try{
        const response = await axiosInstance.get(`/api/Rating/score-${minigameId}`)
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const fetchMinigameRating = async (minigameId: string) =>{
    try{
        const response = await axiosInstance.get(`/api/Rating/${minigameId}`)
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const fetchStudentAccomplishment = async (minigameId: string, getSelf: boolean) => {
    try{
        const response = await axiosInstance.get(`/api/Accomplishment/minigame/${minigameId}`,{
            params:{
                getSelf: getSelf,
            }
        });
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const fetchAccomplishment = async () =>{
    try{
        const response = await axiosInstance.get(`/api/Accomplishment/student`);
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const submitAccomplishment = async (accomplishmentData: Accomplishment) => {
    const apiPayload = {
        minigameId: accomplishmentData.MinigameId,
        percent: accomplishmentData.Percent,
        durationInSeconds: accomplishmentData.DurationInSecond,
        takenDate: accomplishmentData.TakenDate,
    };
    try{
        const response = await axiosInstance.post(`/api/Accomplishment`, apiPayload,{
            headers: {
                "Content-Type": "application/json",
            },
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const rateMinigame = async (rateMinigameData: rateMinigameData) => {
    try{
        const response = await axiosInstance.post(`/api/Rating`, rateMinigameData);
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}


// Hàm hỗ trợ: tải ảnh từ URL và chuyển thành File (với proxy)
async function fetchImageAsFile(imageUrl: string, fileName: string) {
      try {
          console.log('Fetching image from URL:',imageUrl);
          const response = await fetch(imageUrl);
          if (!response.ok) {
            console.error(`Failed to fetch image: ${response.statusText}`);
          }
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type });
          
          console.log('Response: ', response);
          console.log('File: ', file);
          return file;
      } catch (error) {
          console.error('❌ Error fetching image:', error);
          throw error;
      }
    }

export const deleteMinigame = async (minigameId: string) => {
    try{
        const response = await axiosInstance.delete(`/api/MiniGame/`,{
            params: {
                minigameId: minigameId,
            }
        });
        return response.data;
    }catch (error) {
        console.error('Error deleting minigame:', error);
        return null;
    }
}


//template
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
export const createAnagram = async (anagramData: Anagram) => {
    try {
        const formData = new FormData();
        formData.append('MinigameName', anagramData.MinigameName);
        formData.append('TeacherId', anagramData.TeacherId);
        formData.append('Duration', anagramData.Duration.toString());
        formData.append('TemplateId', anagramData.TemplateId);
        formData.append('CourseId', anagramData.CourseId);
        anagramData.GameData.forEach((word, index) => {
            formData.append(`GameData[${index}].Word`, Array.isArray(word.words) ? word.words.join(',') : word.words);
        });

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
export const createQuiz = async (quizData: QuizData) => {
    try {
        const formData = new FormData();
        formData.append('MinigameName', quizData.MinigameName);
        formData.append('TeacherId', quizData.TeacherId);
        formData.append('Duration', quizData.Duration.toString());
        formData.append('TemplateId', quizData.TemplateId);
        formData.append('CourseId', quizData.CourseId);
        quizData.GameData.forEach((question, index) => {
            formData.append(`GameData[${index}].Header`, question.Header);
            question.Options.forEach((answer, answerIndex) => {
                formData.append(`GameData[${index}].Options[${answerIndex}]`, answer);
            });
            formData.append(`GameData[${index}].AnswerIndexes`, question.AnswerIndexes.join(','));
        });

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
export const editConjunction = async (updateData: UpdateConjunctionData) => {
    try {
        const formData = new FormData();
        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);

        let imageFile: File | null = null;

        if (updateData.ImageFile) {
            // console.log('🖼️ Using new uploaded image file');
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            console.log('🔄 Converting existing image URL to file');
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('❌ CORS error, trying alternative method:', corsError);
                
                // Fallback: Skip image nếu không thể fetch được
                console.warn('⚠️ Skipping image due to CORS restrictions');
                // Hoặc có thể thử CORS proxy:
                // imageFile = await fetchImageAsFileWithCorsProxy(updateData.ImageUrl, 'existing-thumbnail.jpg');
            }
        }

        if (imageFile) {
            formData.append('ImageFile', imageFile);
            // console.log(`📎 Image file attached: ${imageFile.name}, size: ${imageFile.size} bytes`);
        } else {
            console.warn('⚠️ No image file provided - API might handle this case');
            // Một số API có thể chấp nhận không có image file và giữ nguyên ảnh cũ
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

        console.log('✅ Edit conjunction successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Error editing conjunction:', error);
        throw error;
    }
};

export const editAnagram = async (updateData: UpdateAnagramData) => {
    try {
        const formData = new FormData();
        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        }else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            }catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
            console.log(`Image file attached: ${imageFile.name}, size: ${imageFile.size} bytes`);
        }
        formData.append('Duration', updateData.Duration.toString());
        formData.append('TemplateId', updateData.TemplateId);
        updateData.GameData.forEach((word, index) => {
            formData.append(`GameData[${index}].Word`, Array.isArray(word.words) ? word.words.join(',') : word.words);
        });
        console.log("Request", updateData)

        const response = await axiosInstance.put(`/api/MiniGame/anagram/`, formData, {
            params: {fakeTeacherId: updateData.TeacherId}, // Thêm tham số nếu cần
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        console.log("Response", response)

        return response.data;
    } catch (error) {
        console.error('Error editing anagram:', error);
        return null;
    }
}
export const editQuiz = async (updateData: UpdateQuizData) => {
    try {
        const formData = new FormData();
        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
            console.log(`Image file attached: ${imageFile.name}, size: ${imageFile.size} bytes`);
        }

        formData.append('Duration', updateData.Duration.toString());
        formData.append('TemplateId', updateData.TemplateId);
        formData.append('TeacherId', updateData.TeacherId);
        updateData.GameData.forEach((question, index) => {
            formData.append(`GameData[${index}].Header`, question.Header);
            question.Options.forEach((answer, answerIndex) => {
                formData.append(`GameData[${index}].Options[${answerIndex}]`, answer);
            });
            formData.append(`GameData[${index}].AnswerIndexes`, question.AnswerIndexes.join(','));
        });

        const response = await axiosInstance.put(`/api/MiniGame/quiz/`, formData, {
            params: {fakeTeacherId: updateData.TeacherId}, // Thêm tham số nếu cần
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error editing quiz:', error);
        return null;
    }
}
export const createRandomCard = async (randomCardData: RandomCardData) => {
    try {
        const formData = new FormData();

        formData.append("MinigameName", randomCardData.MinigameName);
        formData.append("TeacherId", randomCardData.TeacherId);
        formData.append("Duration", randomCardData.Duration.toString());
        formData.append("TemplateId", randomCardData.TemplateId);
        formData.append("CourseId", randomCardData.CourseId);

        randomCardData.GameData.forEach((data, index) => {
            formData.append(`GameData[${index}].Text`, data.Text);
            if (data.Image) {
                formData.append(`GameData[${index}].Image`, data.Image); // Binary image
            }
        });
        if(randomCardData.ImageFile){
            formData.append("ImageFile", randomCardData.ImageFile)
        }

        const response = await axiosInstance.post(`/api/Minigame/random-card`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error creating random card:", error);
        throw error;
    }
};
export const editRandomCard = async (updateData: UpdateRandomCardData) => {
    try{
        const formData = new FormData();
        formData.append("MinigameId", updateData.MinigameId);
        formData.append("MinigameName", updateData.MinigameName);
        formData.append("Duration", updateData.Duration.toString());
        formData.append("TemplateId", updateData.TemplateId);
        formData.append("TeacherId", updateData.TeacherId);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
            console.log(`Image file attached: ${imageFile.name}, size: ${imageFile.size} bytes`);
        }

        updateData.GameData.forEach(async (data, index) => {
            formData.append(`GameData[${index}].Text`, data.Text);

            let picFile : File | null = null
            if (data.Image) {
                picFile = data.Image
            } else if(data.ImageUrl){
                try{
                    picFile = await fetchImageAsFile(data.ImageUrl, "existing-picture.jpg");
                }catch (error){
                    console.error('CORS error while fetching image:', error)
                }
            }
            if(picFile){
                formData.append(`GameData[${index}].Image`, picFile)
            }
        });

        const response = await axiosInstance.put(`/api/MiniGame/random-card`,formData, {
            params: {fakeTeacherId: updateData.TeacherId},
            headers: {
                'Content-Type': 'multipart/form-data',
            }, 
        })
        return response.data;
    }catch(error){
        console.error("Error updating random card:", error);
        throw error;
    }
}
export const createSpelling = async (spellingData: SpellingData) => {
    try{
        const formData = new FormData();

        formData.append("MinigameName", spellingData.MinigameName);
        formData.append("TeacherId", spellingData.TeacherId);
        formData.append("Duration", spellingData.Duration);
        formData.append("TemplateId", spellingData.TemplateId);
        formData.append("CourseId", spellingData.CourseId);

        spellingData.GameData.forEach((data, index) =>{
            formData.append(`GameData[${index}].Word`, data.Word);
            if(data.Image){
                formData.append(`GameData[${index}].Image`, data.Image);
            }
        });
        if(spellingData.ImageFile){
            formData.append("ImageFile", spellingData.ImageFile);
        }

        const response = await axiosInstance.post(`/api/MiniGame/spelling`, formData, {
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}
export const updateSpelling = async (updateData: UpdateSpellingData) =>{
    try{
        const formData = new FormData();

        formData.append("MinigameId", updateData.MinigameId);
        formData.append("MinigameName", updateData.MinigameName);
        formData.append("Duration", updateData.Duration.toString());
        formData.append("TemplateId", updateData.TemplateId);
        formData.append("TeacherId", updateData.TeacherId);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
            console.log(`Image file attached: ${imageFile.name}, size: ${imageFile.size} bytes`);
        }

        updateData.GameData.forEach(async (data, index) => {
            formData.append(`GameData[${index}].Word`, data.Word);

            let picFile : File | null = null
            if (data.Image) {
                picFile = data.Image
                console.log("picFile", picFile)
            } else if(data.ImageUrl){
                try{
                    picFile = await fetchImageAsFile(data.ImageUrl, "existing-picture.jpg");
                    console.log("picFile with url", picFile);
                }catch (error){
                    console.error('CORS error while fetching image:', error)
                }
            }
            if(picFile){
                formData.append(`GameData[${index}].Image`, picFile)
            }
        });

        const response = await axiosInstance.put(`/api/MiniGame/spelling`, formData,{
                params: {fakeTeacherId: updateData.TeacherId},
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )
        return response.data;
    }catch(error){
        console.log(error);
        throw error;
    }
}
export const createFlashCard = async (flashCardData: FlashCardData) =>{
    try{
        const formData = new FormData();

        formData.append("MinigameName", flashCardData.MinigameName);
        formData.append("TeacherId", flashCardData.TeacherId);
        formData.append("Duration", flashCardData.Duration.toString());
        formData.append("TemplateId", flashCardData.TemplateId);
        formData.append("CourseId", flashCardData.CourseId);

        if(flashCardData.ImageFile){
            formData.append("ImageFile", flashCardData.ImageFile);
        }
        flashCardData.GameData.map((data, index) =>{
            formData.append(`GameData[${index}].Front`, data.Front);
            formData.append(`GameData[${index}].Back`, data.Back);
        })
        console.log("FormData content:");
            for (const pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }
        const response = await axiosInstance.post(`/api/MiniGame/flash-card`, formData,{
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data;
    }catch(error){
        console.log(error);
    }
}
export const updateFlashCard = async (updateData: UpdateFlashCard) =>{
    try{
        const formData = new FormData();
        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
            console.log(`Image file attached: ${imageFile.name}, size: ${imageFile.size} bytes`);
        }

        formData.append('Duration', updateData.Duration.toString());
        formData.append('TemplateId', updateData.TemplateId);
        formData.append('TeacherId', updateData.TeacherId);
        updateData.GameData.forEach((data, index) => {
            formData.append(`GameData[${index}].Front`, data.Front);
            formData.append(`GameData[${index}].Back`, data.Back)
        });

        const response = await axiosInstance.put(`/api/MiniGame/flash-card/`, formData, {
            params: {fakeTeacherId: updateData.TeacherId}, // Thêm tham số nếu cần
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    }catch(error){
        console.log(error);
    }
}
export const createCompletion = async (completionData: CompletionData) => {
    try{
        const formData = new FormData();

        formData.append("MinigameName", completionData.MinigameName);
        formData.append("TeacherId", completionData.TeacherId);
        formData.append("Duration", completionData.Duration.toString());
        formData.append("TemplateId", completionData.TemplateId);
        formData.append("CourseId", completionData.CourseId);

        if(completionData.ImageFile){
            formData.append("ImageFile", completionData.ImageFile);
        }
        completionData.GameData.forEach((data, sentIdx) => {
            formData.append(`GameData[${sentIdx}].Sentence`, data.Sentence);

            data.Options.forEach((opt, optIdx) => {
                formData.append(`GameData[${sentIdx}].Options[${optIdx}]`, opt);
            });

            data.AnswerIndexes.forEach((ans, ansIdx) => {
                formData.append(`GameData[${sentIdx}].AnswerIndexes[${ansIdx}]`, ans.toString());
            });
        });
        const response = await axiosInstance.post(`/api/MiniGame/completion`, formData,{
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
    }
}
export const UpdateCompletion = async (updateData: UpdateCompletionData) => {
    try{
        const formData = new FormData();
        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
            console.log(`Image file attached: ${imageFile.name}, size: ${imageFile.size} bytes`);
        }

        formData.append('Duration', updateData.Duration.toString());
        formData.append('TemplateId', updateData.TemplateId);
        formData.append('TeacherId', updateData.TeacherId);
        updateData.GameData.forEach((data, sentIdx) => {
            formData.append(`GameData[${sentIdx}].Sentence`, data.Sentence);

            data.Options.forEach((opt, optIdx) => {
                formData.append(`GameData[${sentIdx}].Options[${optIdx}]`, opt);
            });

            data.AnswerIndexes.forEach((ans, ansIdx) => {
                formData.append(`GameData[${sentIdx}].AnswerIndexes[${ansIdx}]`, ans.toString());
            });
        });
        const response = await axiosInstance.put(`/api/MiniGame/completion`, formData,{
            params:{
                fakeTeacherId: updateData.TeacherId
            },
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const createPairing = async (pairingData: PairingData) =>{
    try{
        const formData = new FormData();

        formData.append("MinigameName", pairingData.MinigameName);
        formData.append("TeacherId", pairingData.TeacherId);
        formData.append("Duration", pairingData.Duration.toString());
        formData.append("TemplateId", pairingData.TemplateId);
        formData.append("CourseId", pairingData.CourseId);

        if(pairingData.ImageFile){
            formData.append("ImageFile", pairingData.ImageFile);
        }
        pairingData.GameData.forEach((data, index) =>{
            data.words.forEach((word, wordIndex)=>{
                formData.append(`GameData[${index}].Words[${wordIndex}]`, word)
            })
        })

        const response = await axiosInstance.post(`/api/MiniGame/pairing`,formData,{
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null
    }
}
export const UpdatePairing = async (updateData: UpdatePairingData) => {
    try{
        console.log("DataUrl", updateData.ImageUrl);
        const formData = new FormData();

        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);
        formData.append('Duration', updateData.Duration.toString());
        formData.append('TemplateId', updateData.TemplateId);
        formData.append('TeacherId', updateData.TeacherId);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
        }
        updateData.GameData.forEach((data, index) =>{
            data.words.forEach((word, wordIndex)=>{
                formData.append(`GameData[${index}].Words[${wordIndex}]`, word)
            })
        })
        const response = await axiosInstance.put(`/api/MiniGame/pairing`, formData,{
            params:{fakeTeacherId: updateData.TeacherId},
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const createRestoration = async (restorationData: RestorationData) =>{
    try{
        const formData = new FormData();

        formData.append("MinigameName", restorationData.MinigameName);
        formData.append("TeacherId", restorationData.TeacherId);
        formData.append("Duration", restorationData.Duration.toString());
        formData.append("TemplateId", restorationData.TemplateId);
        formData.append("CourseId", restorationData.CourseId);

        if(restorationData.ImageFile){
            formData.append("ImageFile", restorationData.ImageFile);
        }
        restorationData.GameData.forEach((data, index) =>{
            data.words.forEach((word, wordIndex)=>{
                formData.append(`GameData[${index}].Words[${wordIndex}]`, word)
            })
        })

        const response = await axiosInstance.post(`/api/MiniGame/restoration`,formData,{
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null
    }
}
export const UpdateRestoration = async (updateData: UpdateRestorationData) => {
    try{
        const formData = new FormData();

        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);
        formData.append('Duration', updateData.Duration.toString());
        formData.append('TeacherId', updateData.TeacherId);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
        }
        updateData.GameData.forEach((data, index) =>{
            data.words.forEach((word, wordIndex)=>{
                formData.append(`GameData[${index}].Words[${wordIndex}]`, word)
            })
        })
        const response = await axiosInstance.put(`/api/MiniGame/pairing`, formData,{
            params:{fakeTeacherId: updateData.TeacherId},
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const createTrueFalse = async (trueFalseData: TrueFalse) =>{
    try{
        const formData = new FormData();

        formData.append("MinigameName", trueFalseData.MinigameName);
        formData.append("TeacherId", trueFalseData.TeacherId);
        formData.append("Duration", trueFalseData.Duration.toString());
        formData.append("CourseId", trueFalseData.CourseId);

        if(trueFalseData.ImageFile){
            formData.append("ImageFile", trueFalseData.ImageFile);
        }

        trueFalseData.GameData.forEach((data, index)=>{
            data.Statement.forEach((tfData, tfIndex)=>{
                formData.append(`GameData[${index}].Statement[${tfIndex}]`,tfData)
            })
            formData.append(`GameData[${index}].Answer`, data.Answer ? "true" : "false");
        })

        const response = await axiosInstance.post(`/api/MiniGame/true-false`, formData,{
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const UpdateTrueFalse = async (updateData: UpdateTrueFalseData) =>{
    try{
        const formData = new FormData();

        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);
        formData.append('Duration', updateData.Duration.toString());
        formData.append('TeacherId', updateData.TeacherId);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
        }
         updateData.GameData.forEach((data, index)=>{
            data.Statement.forEach((tfData, tfIndex)=>{
                formData.append(`GameData[${index}].Statement[${tfIndex}]`,tfData)
            })
            formData.append(`GameData[${index}].Answer`, data.Answer ? "true" : "false");
        })

        const response = await axiosInstance.put(`/api/MiniGame/true-false`, formData,{
            params:{fakeTeacherId: updateData.TeacherId},
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const createFindWord = async (findWordData: FindWordData) =>{
    try{
        const formData = new FormData();

        formData.append("MinigameName", findWordData.MinigameName);
        formData.append("TeacherId", findWordData.TeacherId);
        formData.append("Duration", findWordData.Duration.toString());
        formData.append("CourseId", findWordData.CourseId);

        if(findWordData.ImageFile){
            formData.append("ImageFile", findWordData.ImageFile);
        }

        findWordData.GameData.forEach((data, index)=>{
            formData.append(`GameData[${index}].Hint`, data.Hint);
            formData.append(`GameData[${index}].DimensionSize`, data.DimensionSize.toString());
            data.Words.forEach((wordData, wordIndex)=>{
                formData.append(`GameData[${index}].Words[${wordIndex}]`, wordData)
            })
        })

        const response = await axiosInstance.post(`/api/MiniGame/word-find`, formData,{
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}
export const updateFindWord = async (updateData: UpdateFindWordData) =>{
    try{
        const formData = new FormData();

        formData.append('MinigameId', updateData.MinigameId);
        formData.append('MinigameName', updateData.MinigameName);
        formData.append('Duration', updateData.Duration.toString());
        formData.append('TeacherId', updateData.TeacherId);

        let imageFile: File | null = null;
        if (updateData.ImageFile) {
            imageFile = updateData.ImageFile;
        } else if (updateData.ImageUrl) {
            try {
                imageFile = await fetchImageAsFile(updateData.ImageUrl, 'existing-thumbnail.jpg');
            } catch (corsError) {
                console.error('CORS error while fetching image:', corsError);
                console.warn('Skipping image due to CORS restrictions');
            }
        }
        if (imageFile) {
            formData.append('ImageFile', imageFile);
        }
        updateData.GameData.forEach((data, index)=>{
            formData.append(`GameData[${index}].Hint`, data.Hint);
            formData.append(`GameData[${index}].DimensionSize`, data.DimensionSize.toString());
            data.Words.forEach((wordData, wordIndex)=>{
                formData.append(`GameData[${index}].Words[${wordIndex}]`, wordData)
            })
        })

        const response = await axiosInstance.put(`/api/MiniGame/word-find`, formData,{
            params:{fakeTeacherId: updateData.TeacherId},
            headers:{
                'Content-Type': 'multipart/form-data',
            }
        })
        return response.data;
    }catch(error){
        console.log(error);
        return null;
    }
}