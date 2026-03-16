import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
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
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    image: {
      type: String,
      required: [true, 'Please provide an image'],
    },
    images: {
      type: [String],
      required: [true, 'Please provide at least one image'],
      default: [],
    },
    date: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
