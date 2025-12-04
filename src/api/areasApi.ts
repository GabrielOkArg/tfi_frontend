import api from "./axiosInstance";




export const getAreas = async () => {
    const response = await api.get("/Area/getall");
    return response.data;
}

export const createArea = async(data : any) => {
    const response = await api.post("/Area/create",data);
    return response.data;
}

export const updateArea = async(data : any) => {
    const response = await api.put("/Area/update",data);
    return response.data;
}

