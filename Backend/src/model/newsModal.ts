
import mongoose,{Schema} from 'mongoose'
import { Posts } from '../entities/userEntities';


const postSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userdetail",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    Reportpost:{
      type:Boolean
    }
  },
  {
    timestamps: true,
  }
);


 const newspostSchemadata = mongoose.model<Posts>("post", postSchema);


 export default newspostSchemadata;