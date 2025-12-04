
import {createReclamo, getAllReclamos, getReclamosByUserId, updateReclamo} from "../api/reclamosApi";


export const reclamosService = {

    getAll : async () => {
         const response = await getAllReclamos();
         return response;
    },
    update: async(data:any) => {
        const response = await updateReclamo(data);
        return response;
    },
    getByUserId: async(userId:number) => {
        const response = await getReclamosByUserId(userId);
        return response;
    },
    create:  async(data:any) => {
        const response = await createReclamo(data);
        return response;
    }
}