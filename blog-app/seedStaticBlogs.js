import mongoose from "mongoose";
import dotenv from "dotenv";
import Blog from "./models/blog.js";

dotenv.config();

const staticBlogs = [
  {
    title: "The Rise of Everyday AI: It’s Closer Than You Think",
    content: "Artificial Intelligence (AI) has long been seen as a futuristic concept—robots taking over the world or complex systems out of reach for the average person. But today, AI is already embedded in our everyday lives in ways we often overlook.Think about the voice assistant on your phone, the recommended videos on YouTube, or even how your camera knows where to focus. AI is behind the scenes, learning your behavior and preferences to make your digital life more intuitive.Healthcare professionals use AI to detect diseases early, farmers use it to monitor crops, and businesses use it to improve customer service. The integration of AI is not about replacing human jobs—it’s about enhancing our abilities, freeing us from repetitive tasks, and giving us time to focus on creativity and problem-solving.The next step? As AI becomes more accessible, understanding its basics becomes essential. Whether you're a student, entrepreneur, or content creator, now is the best time to learn how AI can work for you—not against you.",
    author: "Tech Visionary",
    isStatic: true,
  },
  {
    title: "Your Small Steps Matter More Than You Know",
    content: "Have you ever felt like your progress isn’t good enough just because it’s slow? In a world that celebrates overnight success, we often forget the power of consistent, quiet effort.But the truth is, success doesn’t usually come from giant leaps—it comes from small, deliberate steps taken every single day. The tiny habits you build, the early mornings you choose discipline over comfort, and the times you keep going even when no one is watching—these are what truly shape your future.Whether you’re working on a degree, building a portfolio, starting a business, or simply trying to become better than you were yesterday, remember: no effort is ever wasted.Every drop of water contributes to the ocean. Your slow progress is still progress. So don’t compare your journey to someone else’s highlight reel. Keep going, keep learning, and trust that your time will come.",
    author: "Daily Grind Diaries",
    isStatic: true,
  },
  {
    title: "Fitness Isn’t a Destination—It’s a Lifestyle",
    content: "Most people begin their fitness journey with a goal—lose 10 pounds, build muscle, or run a 5K. And while these are great motivators, real transformation happens when fitness becomes a lifestyle, not a checkbox.True fitness isn’t just about how you look. It’s about how you feel when you wake up in the morning, how much energy you carry throughout the day, and how well you sleep at night. It’s about becoming stronger, both physically and mentally.The best part? You don’t need a fancy gym membership or hours of free time. Start with what you have. A 20-minute walk, some stretches, or a few bodyweight exercises at home are more than enough to get started. The goal is not perfection—it’s consistency.Fitness also teaches discipline. It reminds you that change takes time and effort, and that nothing worthwhile comes easy. When you make movement a part of your daily life, you’ll start noticing benefits in every area—from your mood to your productivity.Make fitness something you enjoy, not something you endure. It’s not about a finish line—it’s a lifelong partnership with your health.",
    author: " FitFuel",
    isStatic: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    //Remove old static blogs
    await Blog.deleteMany({ isStatic: true });
    console.log("Old static blogs deleted");

    //Insert fresh static blogs
    await Blog.insertMany(staticBlogs);
    console.log("New static blogs inserted successfully");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (err) {
    console.error("Error inserting static blogs:", err);
  }
}

seed();
