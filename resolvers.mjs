// resolvers.mjs
import { PubSub } from 'graphql-subscriptions';
import Task from './models/Task.mjs';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    tasks: async () => {
      return await Task.find();
    },
  },
  Mutation: {
    addTask: async (_, { title, description, deadline }) => {
      const createdAt = new Date();
      const newTask = new Task({ title, description, deadline, createdAt });
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
