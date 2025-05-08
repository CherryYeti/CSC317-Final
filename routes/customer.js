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

// --- Customer Routes (Server-Rendered CRUD Pattern) ---

// 1. Display list of all customers
// GET /customers/ 
//router.get("/", customerController.getAllCustomers); ORGINAL
router.get("/detail", customerController.getCustomerDetail); //Modified
router.get("/edit", customerController.getCustomerEdit); //Modified
router.get("/home", customerController.getCustomerHome); //Modified
router.get("/list", customerController.getCustomerList); //Modified
// 2. Show the form to create a new customer
// GET /customers/new
router.get("/create", customerController.getCreateCustomerForm);

// 3. Process the submission of the create form
// POST /customers/
router.post("/create", customerController.createCustomer);

// 4. Display details for a specific customer
// GET /customers/:id
router.get("/:id", customerController.getCustomerById);

// 5. Show the form to edit an existing customer
// GET /customers/:id/edit
router.get("/:id/edit", customerController.getEditCustomerForm);

// 6. Process the submission of the edit form
// PUT /customers/:id
// Note: Standard HTML forms only support GET/POST. If you are *not* using client-side
// JavaScript or the `method-override` middleware to enable PUT/DELETE from forms,
// you might change this route to POST (e.g., POST /customers/:id/update) and update
// your <form method="POST" action="/customers/<%= customerData._id %>/update"> in edit.ejs
router.put("/:id", customerController.updateCustomer);

// 7. Process the deletion of a customer
// DELETE /customers/:id
// Note: Similar to PUT, standard HTML forms don't support DELETE. You might use
// POST (e.g., POST /customers/:id/delete) and a simple form with a submit button,
// or use JavaScript to send a DELETE request, or use method-override.
router.delete("/:id", customerController.deleteCustomer);


module.exports = router; // Export the router for use in your main app file