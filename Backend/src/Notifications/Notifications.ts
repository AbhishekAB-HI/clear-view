import cron from "node-cron";
import UserSchemadata from "../Model/Usermodel"; 
import sendEmail from "../Utils/SendEmail"; 

const checkUpcomingBirthdays = async () => {
    
  const today = new Date();
  const tomorrow = new Date();
    
  tomorrow.setDate(today.getDate() + 1);
  const users = await UserSchemadata.find({
    birthdate: {
      $gte: today.setHours(0, 0, 0, 0),
      $lt: tomorrow.setHours(0, 0, 0, 0),
    },
  });
  users.forEach((user) => {
    sendEmail(user.email, `Reminder: Tomorrow is your birthday, ${user.name}!`);
  });
};

cron.schedule("0 8 * * *", checkUpcomingBirthdays);



export default checkUpcomingBirthdays;
