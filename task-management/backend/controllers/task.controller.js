import Task from "../models/task.model.js";

// get all tasks with optional filtering & sorting
const getTasks = async (req, res) => {
  try {
    
    const userId = req.user.userId; 
    if (!userId) return res.status(401).json({message:"Unauthorized"});

    const sortOption = req.query.sortBy || 'latest';

    let sortCriteria;

    switch (sortOption) {
      case 'dueDateAsc':
        sortCriteria = { dueDate: 1 };
        break;
      case 'dueDateDesc':
        sortCriteria = { dueDate: -1 };
        break;
      case 'latest':
      default:
        sortCriteria = { createdAt: -1 };
        break;
    }

    // Only return tasks created by the logged-in user
    const tasks = await Task.find({ createdBy: userId }).sort(sortCriteria);

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get a specific task by ID
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId; 

    const task = await Task.findOne({ _id: id, createdBy: userId });

    if (!task) {
      return res.status(404).json({ message: "Task not available" });
    }
    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// create the task
const createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("User ID from token", userId);
    const taskData = { ...req.body, createdBy: userId };
    const task = await Task.create(taskData);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update the task
const updateTask = (async(req,res)=> {
    try{
        const userId = req.user.userId;
        const {id} = req.params;

        const task = await Task.findById(id);

        if(!task){
            return res.status(404).json({message: "Task not available"})
        }
        if (task.createdBy.toString() !== userId) 
            return res.status(403).json({ message: "Not authorized" });

        const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
            new:true,
            runValidators:true
        });

        res.status(200).json(updatedTask)
    } catch(err){
        res.status(500).json({message:err.message})
    }
})

// delete the task
const deleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.createdBy.toString() !== userId) 
      return res.status(403).json({ message: "Not authorized" });

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Function defined above
export {
     getTasks,
     getTask,
     createTask,
     updateTask,
     deleteTask
};
