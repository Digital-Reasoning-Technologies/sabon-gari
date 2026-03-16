import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
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
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      maxlength: [800, 'Description cannot exceed 800 characters'],
    },
    image: {
      type: String,
      required: [true, 'Please provide a cover image'],
    },
    images: {
      type: [String],
      default: [],
    },
    location: String,
    status: String,
    date: String,
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
