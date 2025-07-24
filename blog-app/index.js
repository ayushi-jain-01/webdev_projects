import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import methodOverride from 'method-override';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// import routes
import authRoute from './routes/auth.js';
import blogRoute from './routes/blog.js';

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));

// routes middlewares
app.use('/api/auth',authRoute);
app.use('/api/blogs',blogRoute);


mongoose.connect (process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() =>{
    console.log("Connected to database");
    app.listen(PORT, () =>{
        console.log(`Server is running on port ${PORT}`);
    });  
})
.catch((err) =>{
    console.error("Failed to connect MongoDB: ",err);
});

app.get("/", (req, res) => {
  res.send("Hello from Render!");
});