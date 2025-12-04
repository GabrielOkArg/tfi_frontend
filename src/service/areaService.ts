
import { createArea, getAreas, updateArea } from "../api/areasApi";

export const areaService={


    getAll: async() => {
        const data = await getAreas();
        return data;
    },
    create: async(data:any) => {
        const response = await createArea(data);
        return response;
    },
    update : async(data:any) => {
        const response = await updateArea(data);
        return response;
    }
}