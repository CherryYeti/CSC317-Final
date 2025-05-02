/**
 * Customer model
 * Defines the schema for customers in the CRM application
 */
const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Ensures no two customers have the same email
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      // You could add validation for phone format if needed
    },
    company: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      enum: ["Lead", "Prospect", "Active", "Inactive"], // Example statuses
      default: "Lead", // Default status when a new customer is created
    },
    // Optional: Link to the user who created/owns this customer
    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   // required: true // Make required if every customer MUST be linked to a user
    // },
  },
  {
    // Automatically add 'createdAt' and 'updatedAt' fields
    timestamps: true,
  },
);

// Note: Since you disabled autoIndex globally in app.js, the 'unique: true'
// on email won't automatically create a database index. However, Mongoose
// will still use it for validation before saving, and the check in your
// controller helps prevent duplicates at the application level. For performance
// on large datasets, you might consider manually creating a unique index
// on the email field in your MongoDB database later.

module.exports = mongoose.model("Customer", CustomerSchema);