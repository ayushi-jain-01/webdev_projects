import Note from "../models/note.model.js";

// CREATE a new note
const createNote = async (req, res) => {
  console.log("Received note:", req.body);

  try {
    console.log("Incoming note body:",req.body);
    const { title, content } = req.body;
    const userId = req.user.userId;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and Content are required" });
    }

    const newNote = new Note({ title, content,userId });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating note" });
  }
};

// GET all notes
const getUserNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.find({userId}).sort({ _id: -1 });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes" });
  }
};

// UPDATE a note
const updateNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { title, content } = req.body;

    const note = await Note.findByIdAndUpdate(
      { _id: id, userId },
      {title, content },
      { new: true }
    );

    if (!note) return res.status(404).json({ message: "Note not found" });
    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error updating note" });
  }
};

// DELETE a note
const deleteNote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const note = await Note.findByIdAndDelete({ _id: id, userId });
    if (!note) return res.status(404).json({ message: "Note not found" });

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note" });
  }
};

// EXPORT all controller functions
export {
  createNote,
  getUserNotes,
  updateNote,
  deleteNote
};
