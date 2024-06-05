// resolvers.mjs
import bcrypt from 'bcryptjs';
import { PubSub } from 'graphql-subscriptions';
import jwt from 'jsonwebtoken';
import Task from './models/Task.mjs';
import User from './models/User.mjs';

const pubsub = new PubSub();
const JWT_SECRET = 'tasktec'; // Cambia esto a una clave secreta segura

export const resolvers = {
  Query: {
    tasks: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      return await Task.find({ userId: user.id });
    },

    // getTask: async (_, { id }, { user }) => { // Implementación de la función getTask
    //   if (!user) throw new Error("Not authenticated");
    //   return await Task.findOne({ _id: id, userId: user.id });
    // }

    filterTasksByTitle: async (_, { title }) => {
      return await Task.find({ title: new RegExp(title, 'i') }); // Búsqueda insensible a mayúsculas y minúsculas
    },
  },
  Mutation: {
    register: async (_, { username, password }) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });
      await user.save();
      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
      return { token, user };
    },
    login: async (_, { username, password }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error("Incorrect password");

      const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET);
      return { token, user };
    },
    addTask: async (_, { title, description, deadline, category }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const newTask = new Task({ title, description, deadline, userId: user.id, category });
      await newTask.save();
      pubsub.publish('TASK_ADDED', { taskAdded: newTask });
      return newTask;
    },
    // updateTask: async (_, { id, title, description, deadline, completed, timeTaken, category }, { user }) => {
    //   if (!user) {
    //     throw new Error('Unauthorized');
    //   }

    //   const updatedTask = await Task.findByIdAndUpdate(id, { title, description, deadline, completed, timeTaken, category }, { new: true });
    //   pubsub.publish('taskUpdated', { taskUpdated: updatedTask });

    //   await task.save();
    //   return updatedTask;
    // },
    updateTaskStatus: async (_, { id, completed }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const task = await Task.findOne({ _id: id, userId: user.id });
      if (!task) throw new Error("Task not found");
      task.completed = completed;
      if (completed) {
        task.timeTaken = Date.now() - task.createdAt.getTime();
        task.completedAt = new Date();
      }
      await task.save();
      return task;
    },
    deleteTask: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const task = await Task.findOneAndDelete({ _id: id, userId: user.id });
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





