import mongoose from 'mongoose';
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    author: String,
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    isStatic: {
        type: Boolean,
    }
}, {timestamps:true})

export default mongoose.model('Blog', blogSchema);