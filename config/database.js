import mongoose from 'mongoose';

const connectDB = async () => {

  let databaseString;

  if (process.env.NODE_ENV === 'production') {
    databaseString = process.env.MONGO_URI;
  } else {
    databaseString = process.env.MONGO_LOCAL;
  }

  try {
    const conn = await mongoose.connect(databaseString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true
    })
    console.log(`Database Connected: ${conn.connection.host}`.cyan.underline);
  } catch (err) {
    console.error(`Database Connection Error: ${err.message}`.red.underline.bold);
    process.exit(1);
  }
}

export { connectDB };