import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

/**
 * Apply the pagination plugin to the mongoose instance.
 * The mongoose-paginate-v2 plugin is used to add pagination capabilities
 * to mongoose models.
 */
mongoose.plugin(mongoosePaginate);

export default mongoose;