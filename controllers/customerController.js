/**
 * controllers/customerController.js
 * Handles logic for customer-related pages and actions in a server-rendered app.
 */

const Customer = require('../models/Customer'); // Adjust path if needed

// --- Functions to RENDER Views ---

/**
 * @desc    Display list of all customers with pagination, search, filter, sort
 * @route   GET /customers/
 * @access  Private (requires auth)
 */
// This is the original basic list function, now superseded by the enhanced getCustomerList below.
// 
//exports.getCustomerList = async (req, res, next) => { //Original function name is getAllCustomers
//    try {
//        const customers = await Customer.find().sort({ createdAt: -1 }); // Example: sort by newest first
//        res.render('customer/list', { // Assuming view at views/customer/list.ejs (or .hbs, .pug)
//            title: 'Customers',
//            customers: customers,
//            user: req.session.user, // Pass user session data to the view
//            success_msg: req.flash ? req.flash('success_msg') : null, // Pass flash messages if used
//            error_msg: req.flash ? req.flash('error_msg') : null
//        });
//    } catch (error) {
//        console.error("Error fetching customers:", error);
//        next(error); // Pass error to your central error handler
//    }
//};

// New Enhanced function to get all customers
exports.getCustomerList = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Default 10 items per page
        const skip = (page - 1) * limit;

        let queryConditions = {}; // Object to build our MongoDB query
        let sortOptions = { createdAt: -1 }; // Default sort: newest first

        // Search functionality (by name, case-insensitive)
        if (req.query.search && req.query.search.trim() !== '') {
            queryConditions.name = { $regex: req.query.search.trim(), $options: 'i' };
        }

        // Filter by status
        if (req.query.status && req.query.status.trim() !== '') {
            queryConditions.status = req.query.status.trim();
        }

        // Sorting functionality
        if (req.query.sortBy) {
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1; // asc or desc
            sortOptions = { [req.query.sortBy]: sortOrder };
        }

        // Fetch customers with conditions, sort, pagination
        const customers = await Customer.find(queryConditions)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean(); // .lean() can improve performance for read-only operations

        // Get total number of customers matching the query (for pagination)
        const totalCustomers = await Customer.countDocuments(queryConditions);
        const totalPages = Math.ceil(totalCustomers / limit);

        res.render('customer/list', {
            title: 'Customers',
            customers: customers,
            user: req.session.user,
            success_msg: req.flash ? req.flash('success_msg') : null,
            error_msg: req.flash ? req.flash('error_msg') : null,
            // Pagination variables
            currentPage: page,
            totalPages: totalPages,
            limit: limit,
            totalCustomers: totalCustomers,
            // For maintaining state in view filters/search bars
            searchQuery: req.query.search || '',
            currentStatus: req.query.status || '',
            currentSortBy: req.query.sortBy || 'createdAt',
            currentSortOrder: req.query.sortOrder || 'desc'
        });
    } catch (error) {
        console.error("Error fetching customers:", error);
        next(error); // Pass error to your central error handler
    }
};

// These functions below were problematic as they didn't fetch data.
// They should be removed if not being used, or their logic corrected.
// routes should point to getCustomerById and getEditCustomerForm instead.
//exports.getCustomerDetail = (req, res) => {
//    res.render("customer/detail", {
//        title: "Create", // Incorrect title for details
//        user: req.session.user,
//      });
//};

//exports.getCustomerEdit = (req, res) => {
//    res.render("customer/edit", {
//        title: "Create", // Incorrect title for edit
//        user: req.session.user,
//      });
//};

// Optional: If we have a specific route and view for a customer "home" or dashboard
exports.getCustomerHome = (req, res) => {
    res.render("customer/home", {
        title: "Customer Dashboard", // Corrected title
        user: req.session.user,
    });
};

/**
 * @desc    Display form to create a new customer
 * @route   GET /customers/new
 * @access  Private (requires auth)
 */
exports.getCreateCustomerForm = (req, res) => {
    res.render('customer/create', {
        title: 'Add New Customer',
        user: req.session.user,
        errors: [],
        customerData: {}
    });
};

/**
 * @desc    Display details for a single customer
 * @route   GET /customers/:id
 * @access  Private (requires auth)
 */
exports.getCustomerById = async (req, res, next) => {
    try {
        const customer = await Customer.findById(req.params.id).lean();
        if (!customer) {
            if (req.flash) req.flash('error_msg', 'Customer not found');
            // Redirect to the main customer list or a specific customer home page
            return res.redirect(req.query.redirectToHome ? '/customers/home' : '/customers');
        }
        res.render('customer/detail', {
            title: `Customer: ${customer.name}`,
            customer: customer,
            user: req.session.user
        });
    } catch (error) {
        console.error(`Error fetching customer ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
            if (req.flash) req.flash('error_msg', 'Invalid Customer ID format');
            return res.redirect(req.query.redirectToHome ? '/customers/home' : '/customers');
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
        const customer = await Customer.findById(req.params.id).lean();
        if (!customer) {
            if (req.flash) req.flash('error_msg', 'Customer not found');
            return res.redirect(req.query.redirectToHome ? '/customers/home' : '/customers');
        }
        res.render('customer/edit', {
            title: 'Edit Customer',
            user: req.session.user,
            errors: [],
            customerData: customer
        });
    } catch (error) {
        console.error(`Error fetching customer ${req.params.id} for edit:`, error);
        if (error.kind === 'ObjectId') {
            if (req.flash) req.flash('error_msg', 'Invalid Customer ID format');
            return res.redirect(req.query.redirectToHome ? '/customers/home' : '/customers');
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
    const { name, email, phone, company, address, status } = req.body;
    const errors = [];

    if (!name || !email) {
        errors.push({ msg: 'Please provide name and email' }); // Corrected error message
    }
    // Add more specific validation here if needed

    if (errors.length > 0) {
        return res.render('customer/create', {
            title: 'Add New Customer',
            user: req.session.user,
            errors: errors,
            customerData: { name, email, phone, company, address, status }
        });
    }

    try {
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

        const newCustomer = new Customer({
            name, email, phone, company, address, status
            // createdBy: req.session.user.id // Optionally link to the user who created it
        });

        await newCustomer.save(); // Corrected .save() call

        if (req.flash) { // Using connect-flash for success message
            req.flash('success_msg', 'Customer created successfully!');
        }
        res.redirect('/customers'); // Redirect to the main customer list

    } catch (error) {
        console.error("Error saving new customer:", error);
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(e => ({ msg: e.message }));
            return res.render('customer/create', {
                title: 'Add New Customer',
                user: req.session.user,
                errors: validationErrors,
                customerData: { name, email, phone, company, address, status }
            });
        }
        next(error);
    }
};

/**
 * @desc    Process updating an existing customer
 * @route   PUT /customers/:id
 * @access  Private (requires auth)
 */
exports.updateCustomer = async (req, res, next) => {
    const customerId = req.params.id;
    const { name, email, phone, company, address, status } = req.body;
    const errors = [];

    if (!name || !email) {
        errors.push({ msg: 'Please provide name and email' });
    }
    // Add more specific validation here if needed

    const submittedData = { _id: customerId, name, email, phone, company, address, status };

    if (errors.length > 0) {
        return res.render('customer/edit', {
            title: 'Edit Customer',
            user: req.session.user,
            errors: errors,
            customerData: submittedData
        });
    }

    try {
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

        const updatedCustomer = await Customer.findByIdAndUpdate(customerId, {
            name, email, phone, company, address, status
        }, { new: true, runValidators: true });

        if (!updatedCustomer) {
            if (req.flash) req.flash('error_msg', 'Customer not found for update');
            return res.redirect('/customers'); // Standardized redirect
        }

        if (req.flash) req.flash('success_msg', 'Customer updated successfully!');
        res.redirect(`/customers/${customerId}`); // Standardized redirect

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
                customerData: submittedData
            });
        }
        next(error);
    }
};

/**
 * @desc    Process deleting a customer
 * @route   DELETE /customers/:id
 * @access  Private (requires auth)
 */
exports.deleteCustomer = async (req, res, next) => {
    try {
        const customerId = req.params.id;
        const deletedCustomer = await Customer.findByIdAndDelete(customerId);

        if (!deletedCustomer) {
            if (req.flash) req.flash('error_msg', 'Customer not found for deletion');
            return res.redirect('/customers'); // Standardized redirect
        }

        if (req.flash) req.flash('success_msg', 'Customer deleted successfully!');
        res.redirect('/customers'); // Standardized redirect

    } catch (error) {
        console.error(`Error deleting customer ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
            if (req.flash) req.flash('error_msg', 'Invalid Customer ID format');
            return res.redirect('/customers'); // Standardized redirect
        }
        next(error);
    }
};