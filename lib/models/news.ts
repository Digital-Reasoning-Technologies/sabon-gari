import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    date: {
      type: String,
      required: [true, 'Please provide a date'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide full content'],
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one image'],
      default: [],
    },
    location: String,
    time: String,
  },
  { timestamps: true }
);

// Prevent recompilation in development
export default mongoose.models.News || mongoose.model('News', newsSchema);
