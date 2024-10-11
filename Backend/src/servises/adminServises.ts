import { adminId, Admintockens, passwords } from "../entities/adminEntities";
import { IUser, Posts } from "../entities/userEntities";
import { adminPayload } from "../interface/userInterface/userPayload";
import adminRepository from "../Repository/adminRepository";
import HashPassword from "../utils/Hashpassword";
import { generateAdminAccessToken } from "../utils/jwt";

 class AdminServices {
   constructor(private adminRepository: adminRepository) {}

   async verifyUser(
     userdata: Partial<adminId>
   ): Promise<Admintockens | undefined> {
     if (!userdata.email) {
       throw new Error("Email is required");
     }
     if (!userdata.password) {
       throw new Error("password is required");
     }
     const verifyuser = await this.adminRepository.findAdminbyemail(
       userdata.email
     );
     if (verifyuser.password) {
       const isPasswordValid = await HashPassword.comparePassword(
         userdata.password,
         verifyuser.password
       );

       if (isPasswordValid) {
         const userPayload: adminPayload = {
           id: verifyuser._id as unknown,
         };
         let admintocken = generateAdminAccessToken(userPayload);
         return { admintocken: admintocken };
       }
       console.log(isPasswordValid, "p0000000000000");
       if (!isPasswordValid) {
         throw new Error("Wrong password");
       }
     }
   }

   async deleteReportPost(id: string): Promise<any> {
     try {
       const deletePost = await this.adminRepository.deleteReportedPost(id);
       if (deletePost) {
         return deletePost;
       }
     } catch (error) {
       console.log(error);
     }
   }

   async deletePost(id: string): Promise<any> {
     try {
       const deletePost = await this.adminRepository.deletePost(id);
       if (deletePost) {
         return deletePost;
       }
     } catch (error) {
       console.log(error);
     }
   }


   async getAllReportUsers():Promise<IUser[] | undefined>{
      try { 
      const foundedusers = await this.adminRepository.findAllReportUsers()

      if(!foundedusers){
       throw new Error("no user get")
      }

       return foundedusers;
      } catch (error) {
        console.log(error);
        
      }
   }

   async getAllReportedpost(
     page: number,
     limit: number
   ): Promise<{ posts: Posts[]; total: number }> {
     const getAllposts = await this.adminRepository.findReportpostPost(
       page,
       limit
     );

     if (getAllposts) {
       return getAllposts;
     }

     throw new Error("No posts found");
   }

   async getAllpost(
     page: number,
     limit: number
   ): Promise<{ posts: Posts[]; total: number }> {
     const getAllposts = await this.adminRepository.findPost(page, limit);

     if (getAllposts) {
       return getAllposts;
     }

     throw new Error("No posts found");
   }

   async getUserdetails(): Promise<IUser[] | undefined> {
     try {
       const verifyuser = await this.adminRepository.findUsers();
       if (verifyuser) {
         return verifyuser;
       }
     } catch (error) {
       console.log(error);
     }
   }

   async updateBlocking(
     userid: string,
     isActive: boolean
   ): Promise<boolean | undefined> {
     try {
       const updateuser = await this.adminRepository.ModifyUsersblock(
         userid,
         isActive
       );
       return updateuser;
     } catch (error) {
       console.log(error);
     }
   }
 }


  export default AdminServices