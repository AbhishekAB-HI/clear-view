

import bcrypt from 'bcrypt'


class HashPassword {
  // private means access only with in this function and static means belon to class not instatnce
  private static number: number = 10;
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, HashPassword.number);
  }

  static async comparePassword(password: string,hashPassword:string): Promise<boolean> {
    return bcrypt.compare(password, hashPassword);
  }
}


 export default HashPassword