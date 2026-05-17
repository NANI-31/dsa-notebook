import mongoose from 'mongoose';
import '../models/Category';
import '../models/Problem';

async function research() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dsa-tracker');
  
  const Category = mongoose.model('Category');
  const Problem = mongoose.model('Problem');
  
  const categories = await Category.find();
  console.log('Categories:', JSON.stringify(categories, null, 2));
  
  const sampleProblems = await Problem.find().limit(10);
  console.log('Sample Problems:', JSON.stringify(sampleProblems, null, 2));
  
  process.exit(0);
}

research();
