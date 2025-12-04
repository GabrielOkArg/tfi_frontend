import { createUser } from "../api/userApi";



export const userService = {


    create: async(data:any) => {
        const response = await createUser(data);
        return response;
    }
}