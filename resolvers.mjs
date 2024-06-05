// resolvers.mjs
import { PubSub } from 'graphql-subscriptions';
import Task from './models/Task.mjs';

const pubsub = new PubSub();


// Datos iniciales de ejemplo con un nuevo campo 'category'
let tasks = [
  { id: '1', title: 'Hacer la compra', description: 'Comprar leche y pan', deadline: '2024-05-10', completed: false, category: 'Personal' },
  { id: '2', title: 'Preparar presentación', description: 'Preparar diapositivas para la reunión', deadline: '2024-05-15', completed: false, category: 'Trabajo' }
];

export const resolvers = {
  Query: {
    tasks: async () => {
      return await Task.find();
    },
    filterTasksByTitle: async (_, { title }) => {
      return await Task.find({ title: new RegExp(title, 'i') }); // Búsqueda insensible a mayúsculas y minúsculas
    },
  },
  Mutation: {
    addTask: async (_, { title, description, deadline, category,imageUrl }) => {
      const createdAt = new Date();
      const newTask = new Task({ title, description, deadline, createdAt, category,imageUrl: imageUrl || ''});
      await newTask.save();
      pubsub.publish('TASK_ADDED', { taskAdded: newTask });
      return newTask;
    },
    updateTaskStatus: async (_, { id, completed }) => {
      const task = await Task.findById(id);
      if (!task) throw new Error("Task not found");
      task.completed = completed;
      if (completed) {
        task.timeTaken = Date.now() - task.createdAt.getTime();
        task.completedAt = new Date();
      }
      await task.save();
      return task;
    },
    deleteTask: async (_, { id }) => {
      const task = await Task.findByIdAndDelete(id);
      if (!task) throw new Error("Task not found");
      pubsub.publish('TASK_DELETED', { taskDeleted: task });
      return task;
    },
  },
  Subscription: {
    taskAdded: {
      subscribe: () => pubsub.asyncIterator(['TASK_ADDED'])
    },
    taskDeleted: {
      subscribe: () => pubsub.asyncIterator(['TASK_DELETED'])
    },
  },
};
