
import api from "./axiosInstance";



export const getAllReclamos = async () => {
    const response = await api.get("/reclamos/reclamos");
    return response.data;
}


export const updateReclamo = async(data : any) => {
    const response = await api.put("/Reclamos/update",data,{
       headers: {
      "Content-Type": "multipart/form-data",
    },
});
    return response.data;
}

export const getReclamosByUserId = async(userId: number) => {
    const response = await api.post(`/Reclamos/getByUserId`, {"UsuarioId": userId });
    return response.data;
}

export const createReclamo = async (data: FormData) => {
  const response = await api.post("/Reclamos", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};