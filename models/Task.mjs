// models/Task.mjs
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date, default: '' },
  timeTaken: { type: Number, default: 0 }, // Tiempo en milisegundos
  category: { type: String, default: '' },
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;
