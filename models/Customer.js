/**
 * Customer model
 * Defines the schema for customers in our CRM application
 */
const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensure email is unique
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: ['lead', 'prospect', 'customer', 'former', 'inactive', 'ceo'],
      default: 'lead'
        },
    /* Dealt with by using timestamps: true,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    */
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    // Add virtual properties when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    // Add timestamps for automatic createdAt and updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);