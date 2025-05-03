/**
 * controllers/customerController.js
 * Handles logic for customer-related pages and actions in a server-rendered app.
 */

const Customer = require('../models/Customer'); // Adjust path if needed

// --- Functions to RENDER Views ---

/**
 * @desc    Display list of all customers
 * @route   GET /customers/
 * @access  Private (requires auth)
 */
// exports.getAllCustomers = async (req, res, next) => { //Original
//     try {
//         const customers = await Customer.find().sort({ createdAt: -1 }); // Example: sort by newest first
//         res.render('customer/list', { // Assuming view at views/customer/list.ejs (or .hbs, .pug)
//             title: 'Customers',
//             customers: customers,
//             user: req.session.user, // Pass user session data to the view
//             success_msg: req.flash ? req.flash('success_msg') : null, // Pass flash messages if used
//             error_msg: req.flash ? req.flash('error_msg') : null
//         });
//     } catch (error) {
//         console.error("Error fetching customers:", error);
//         next(error); // Pass error to your central error handler
//     }
// };
exports.getAllCustomers = (req, res) => { //Modified, go to create page
    res.render("customer/create", {
        title: "Create",
        user: req.session.user,
      });
};

/**
 * @desc    Display form to create a new customer
 * @route   GET /customers/new
 * @access  Private (requires auth)
 */
exports.getCreateCustomerForm = (req, res) => {
    res.render('customer/create', { // Assuming views/customer/create.ejs
        title: 'Add New Customer',
        user: req.session.user,
        errors: [], // To display potential validation errors on re-render
        customerData: {} // Empty object for initial form load
    });
};

/**
 * @desc    Display details for a single customer
 * @route   GET /customers/:id
 * @access  Private (requires auth)
 */
exports.getCustomerById = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
             if(req.flash) req.flash('error_msg', 'Customer not found');
             return res.redirect('/customers');
        }
        res.render('customer/detail', { // Assuming views/customer/detail.ejs
            title: `Customer: ${customer.name}`,
            customer: customer,
            user: req.session.user
        });
    } catch (error) {
        console.error(`Error fetching customer ${req.params.id}:`, error);
         if (error.kind === 'ObjectId') {
             if(req.flash) req.flash('error_msg', 'Invalid Customer ID format');
             return res.redirect('/customers');
         }
        next(error);
    }
};

/**
 * @desc    Display form to edit an existing customer
 * @route   GET /customers/:id/edit
 * @access  Private (requires auth)
 */
exports.getEditCustomerForm = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
             if(req.flash) req.flash('error_msg', 'Customer not found');
             return res.redirect('/customers');
        }
        res.render('customer/edit', { // Assuming views/customer/edit.ejs
            title: 'Edit Customer',
            user: req.session.user,
            errors: [],
            customerData: customer // Pre-fill form with existing data
        });
    } catch (error) {
        console.error(`Error fetching customer ${req.params.id} for edit:`, error);
         if (error.kind === 'ObjectId') {
             if(req.flash) req.flash('error_msg', 'Invalid Customer ID format');
             return res.redirect('/customers');
         }
        next(error);
    }
};


// --- Functions to HANDLE Form Submissions (Actions) ---

/**
 * @desc    Process the creation of a new customer
 * @route   POST /customers/
 * @access  Private (requires auth)
 */
exports.createCustomer = async (req, res, next) => {
    // Extract expected fields from req.body
    const { name, email, phone, company, address, status } = req.body;
    const errors = [];

    // Basic Server-Side Validation Example
    if (!name || !email) {
        errors.push({ msg: 'Please provide name and email' });
    }
    // Add more validation rules here (e.g., email format, phone format)

    // If validation errors exist, re-render the create form with errors and submitted data
    if (errors.length > 0) {
        return res.render('customer/create', {
            title: 'Add New Customer',
            user: req.session.user,
            errors: errors,
            customerData: { name, email, phone, company, address, status } // Pass back submitted data
        });
    }

    try {
        // Check if email already exists (optional, but good practice)
        const existingCustomer = await Customer.findOne({ email: email });
        if (existingCustomer) {
             errors.push({ msg: 'Email already exists for another customer' });
             return res.render('customer/create', {
                title: 'Add New Customer',
                user: req.session.user,
                errors: errors,
                customerData: { name, email, phone, company, address, status }
            });
        }

        // Create new customer instance with data from req.body
        const newCustomer = new Customer({
            name, email, phone, company, address, status
            // createdBy: req.session.user.id // Optionally link to the user who created it
        });

        await newCustomer.save();

        // Redirect on success (e.g., to the customer list) with a flash message
        if(req.flash) req.flash('success_msg', 'Customer created successfully!');
        res.redirect('/customers'); // Or redirect to `/customers/${newCustomer._id}`

    } catch (error) {
        console.error("Error saving new customer:", error);
         // Handle potential database errors (like validation errors from the Mongoose model)
         if (error.name === 'ValidationError') {
              const validationErrors = Object.values(error.errors).map(e => ({ msg: e.message }));
              return res.render('customer/create', {
                title: 'Add New Customer',
                user: req.session.user,
                errors: validationErrors,
                customerData: { name, email, phone, company, address, status } // Pass back submitted data
             });
         }
        next(error); // Pass other types of errors to the central error handler
    }
};

/**
 * @desc    Process updating an existing customer
 * @route   PUT /customers/:id  (or POST /customers/:id/update if using standard forms)
 * @access  Private (requires auth)
 */
exports.updateCustomer = async (req, res, next) => {
    const customerId = req.params.id;
    // Extract expected fields from req.body
    const { name, email, phone, company, address, status } = req.body;
    const errors = [];

    // Basic Server-Side Validation Example
    if (!name || !email) {
        errors.push({ msg: 'Please provide name and email' });
    }
    // Add more validation rules...

    // Prepare the data object with submitted values for re-rendering if errors occur
    const submittedData = { _id: customerId, name, email, phone, company, address, status };

    if (errors.length > 0) {
         return res.render('customer/edit', {
             title: 'Edit Customer',
             user: req.session.user,
             errors: errors,
             customerData: submittedData // Pass back submitted data
         });
    }

    try {
         // Check if the updated email is already taken by *another* customer
        const existingCustomer = await Customer.findOne({ email: email, _id: { $ne: customerId } });
        if (existingCustomer) {
            errors.push({ msg: 'Email already exists for another customer' });
            return res.render('customer/edit', {
                title: 'Edit Customer',
                user: req.session.user,
                errors: errors,
                customerData: submittedData
            });
        }

        // Find the customer and update it with the data in req.body
        const updatedCustomer = await Customer.findByIdAndUpdate(customerId, {
            name, email, phone, company, address, status
        }, { new: true, runValidators: true }); // new:true returns updated doc, runValidators ensures model validation

        if (!updatedCustomer) {
             if(req.flash) req.flash('error_msg', 'Customer not found for update');
             return res.redirect('/customers');
        }

        // Redirect on success (e.g., back to the customer detail page) with a flash message
        if(req.flash) req.flash('success_msg', 'Customer updated successfully!');
        res.redirect(`/customers/${customerId}`);

    } catch (error) {
        console.error(`Error updating customer ${customerId}:`, error);
         if (error.name === 'ValidationError' || error.kind === 'ObjectId') {
            const validationErrors = error.name === 'ValidationError'
                ? Object.values(error.errors).map(e => ({ msg: e.message }))
                : [{ msg: 'Invalid Customer ID format' }];

             return res.render('customer/edit', {
                title: 'Edit Customer',
                user: req.session.user,
                errors: validationErrors,
                customerData: submittedData // Pass back submitted data
            });
         }
        next(error); // Pass other errors to the central handler
    }
};

/**
 * @desc    Process deleting a customer
 * @route   DELETE /customers/:id (or POST /customers/:id/delete if using standard forms)
 * @access  Private (requires auth)
 */
exports.deleteCustomer = async (req, res, next) => {
    try {
        const customerId = req.params.id;
        const deletedCustomer = await Customer.findByIdAndDelete(customerId);

        if (!deletedCustomer) {
             if(req.flash) req.flash('error_msg', 'Customer not found for deletion');
             return res.redirect('/customers');
        }

        // Redirect on success (e.g., back to the customer list) with a flash message
        if(req.flash) req.flash('success_msg', 'Customer deleted successfully!');
        res.redirect('/customers');

    } catch (error) {
        console.error(`Error deleting customer ${req.params.id}:`, error);
         if (error.kind === 'ObjectId') {
             if(req.flash) req.flash('error_msg', 'Invalid Customer ID format');
             return res.redirect('/customers');
         }
        next(error); // Pass other errors to the central handler
    }
};