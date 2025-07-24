import express from 'express';
import Blog from '../models/blog.js'; 
import verifyToken from '../verifyToken.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();

// id
router.get("/:id", async (req, res) => {
  const id= req.params.id;

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(400).json({error : "Invalid blog ID format"})
  }
  try {
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    //view static blogs without auth
    if (blog.isStatic) {
      return res.json(blog);
    }

    //token for user blogs
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    let userId;

    try {
      const verified = jwt.verify(token, process.env.TOKEN_SECRET);
      userId = verified._id;
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    //allow owner of blog to view
    if (blog.userID?.toString() !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(blog);
  } catch (err) {
    console.error("Error fetching blog:", err.message);
    res.status(500).json({ error: "Error fetching blog" });
  }
});

// all 
router.get("/", async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        userId = verified._id;
        console.log("Verified userId from token: ",userId);
      } catch (err) {
        console.log("Invalid token: ",err.message);
        // userId = null; // invalid token
      }
    }

    // Build filter array: always include static blogs
    const filter = [{ isStatic: true }];

    // If valid logged-in user, add filter for their own blogs
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.push({ userID: new mongoose.Types.ObjectId(userId) });
    }

    console.log("MongoDB filter used: ",filter);

    // Find blogs matching any of the filter conditions
    const blogs = await Blog.find({ $or: filter }).lean();

    console.log("Blogs returned from db: ",blogs);

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error.message);
    res.status(500).json({ error: "Error fetching blogs" });
  }
});

// create new blog.. only logged in user
router.post("/", verifyToken, async (req, res) => {
  try {

    console.log("Received in req.body:", req.body);
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("Creating blog for use: ",req.user);

    const blog = await Blog.create({
      title,
      content,
      author,
      isStatic: false,
      userID: new mongoose.Types.ObjectId(req.user._id),
    });

    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog:", error.message);
    res.status(500).json({ error: "Error creating blog" });
  }
});

// update blog
// router.put("/:id", verifyToken, async (req, res) => {
//     try{
//     const blog = await Blog.findById(req.params.id);
//     if (!blog) return res.status(404).json({ error: "Blog not found" });

//     if (blog.isStatic)
//       return res.status(403).json({ error: "Cannot update static blog" });
//     }

//     if (!req.user|| !req.user._id){
//       return res.status(401).json({error: "User not authenticated"});
//     }

//     if (!blog.userID || blog.userID.toString() !== req.user._id.toString()){
//       return res.status(403).json({ error: "Not allowed to update" });
//     }

//     const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updated);
//     }catch(error){
//       console.error("Error updating blog:",error);
//       res.status(500).json({error: "Error updating blog"})
//     }
// });

// update
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.isStatic) {
      return res.status(403).json({ error: "Cannot update static blog" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Ensure userID is ObjectId and convert to string for comparison
    if (!blog.userID || blog.userID.toString()   !== req.user._id.toString()) 
    return res.status(403).json({ error: "Not allowed to update" });
    

    const updated = await Blog.findByIdAndUpdate(req.params.id,
    req.body, 
    { new: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ error: "Error updating blog" });
  }
});

// delete blog
router.delete("/:id", verifyToken, async (req, res) => {
    try{
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (blog.isStatic) return res.status(403).json({ error: "Cannot delete static blog" });
    if (!blog.userID || blog.userID.toString()!== req.user._id)
      return res.status(403).json({ error: "Not allowed to delete" });

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });              
    } catch(error){
        res.status(500).json({error:"Blog not deleted"})
    }
});

export default router;