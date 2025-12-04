import api from "./axiosInstance";




export const createUser = async (data: any) => {
    const response = await api.post("/Auth/register", data);
    return response.data;
}