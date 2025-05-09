/**
 * routes/customer.js
 * Handles routes related to customer data in the CRM (Server-Rendered Approach).
 * All routes defined here require authentication via the isAuthenticated middleware.
 */
const express = require("express");
const router = express.Router();

// Middleware for authentication
const { isAuthenticated } = require("../middlewares/auth"); // Adjust path if needed

// Controller functions for customer logic (server-rendered version)
const customerController = require("../controllers/customerController"); // Adjust path if needed

// --- Middleware ---
// Apply authentication middleware to ALL routes in this file
router.use(isAuthenticated);

// --- Customer Routes (Corrected & Standard CRUD Pattern) ---

// 1. Display list of all customers (MAIN CUSTOMER PAGE)
// GET /customers/
router.get("/home", customerController.getCustomerList); // Ensure getCustomerHome is defined and renders a meaningful page

// 2. Show the form to create a new customer
// GET /customers/new
router.get("/create", customerController.getCreateCustomerForm);

// 3. Optional: Customer "home" or "dashboard" page
// This specific route needs to come BEFORE any general /:id routes
// GET /customers/home

// 4. Process the submission of the create form
// POST /customers/
router.post("/create", customerController.createCustomer); // Submitting to the base route is standard

// 5. Display details for a specific customer
// GET /customers/:id
router.get("/:id", customerController.getCustomerById);

// 6. Show the form to edit an existing customer
// GET /customers/:id/edit
router.get("/:id/edit", customerController.getEditCustomerForm);

// 7. Process the submission of the edit form
// PUT /customers/:id
router.put("/:id", customerController.updateCustomer);

// 8. Process the deletion of a customer
// DELETE /customers/:id
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;