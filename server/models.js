import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'owner', 'admin'], default: 'user' },
  phone: String
}, { timestamps: true });

const propertySchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: String,
  listingType: { type: String, enum: ['rent', 'sale'], required: true },
  propertyType: { type: String, enum: ['apartment', 'villa', 'house', 'plot', 'commercial'], default: 'apartment' },
  price: { type: Number, required: true, min: 0 },
  bedrooms: { type: Number, default: 0, min: 0 },
  bathrooms: { type: Number, default: 0, min: 0 },
  areaSqft: Number,
  furnished: { type: String, enum: ['furnished', 'semi', 'unfurnished'], default: 'unfurnished' },
  city: { type: String, required: true, trim: true, index: true },
  locality: String,
  images: [String],
  lat: { type: Number, min: -90, max: 90 },
  lng: { type: Number, min: -180, max: 180 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  views: { type: Number, default: 0 }
}, { timestamps: true });

export const User = models.User || model('User', userSchema);
export const Property = models.Property || model('Property', propertySchema);

const inquirySchema = new Schema({
  property: { type: Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true, maxlength: 1000 }
}, { timestamps: true });

export const Inquiry = models.Inquiry || model('Inquiry', inquirySchema);
