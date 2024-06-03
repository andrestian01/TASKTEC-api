// db.js
import mongoose from 'mongoose';

const uri = "mongodb+srv://devmanager:BlGJ17hxIQwFANoB@tasktec.mctwqhg.mongodb.net/?retryWrites=true&w=majority&appName=tasktec";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});
