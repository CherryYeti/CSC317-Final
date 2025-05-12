Chadd's Contributions
Focused primarily on the development of the core Customer Relationship Management (CRM) functionalities, specifically the Customer CRUD (Create, Read, Update, Delete) feature. This involved extensive backend development, initial frontend view implementation, and significant version control management.

I. Backend Development (Node.js, Express.js, MongoDB with Mongoose):

Customer Controller (controllers/customerController.js):

Architected and implemented the primary logic for all customer-related actions.
Developed an enhanced customer listing function (getCustomerList) featuring:
Server-side pagination to efficiently handle large datasets.
Search functionality (e.g., by customer name, case-insensitive).
Filtering capabilities (e.g., by customer status).
Dynamic sorting options (by various fields and orders).
Implemented functions to render views for creating, viewing details, and editing customers, ensuring necessary data was fetched from the database and passed to the templates.
Built the action handlers for processing form submissions:
Create Customer: Included server-side validation (required fields, email format, email uniqueness check against the database), data sanitization (trimming, lowercase for email), saving new customer records, and providing user feedback via flash messages.
Update Customer: Implemented logic to fetch existing customer data, validate updated information (including email uniqueness checks against other users), and save changes to the database.
Delete Customer: Developed logic for customer deletion, including confirmation steps and user feedback.
Integrated consistent error handling using try...catch blocks, custom error messages, and propagation to a central error handler (next(error)).
Managed user session data for authentication context and display.
Standardized redirect paths for a consistent user experience after actions.
Customer Routes (routes/customer.js):

Defined all URL endpoints for the customer module (e.g., /customer/, /customer/create, /customer/home, /customer/detail/:id, /customer/edit/:id).
Mapped these routes to their corresponding controller functions.
Ensured correct route ordering to prevent conflicts between specific string routes and parameterized routes (e.g., /home before /detail/:id).
Applied authentication middleware (isAuthenticated) to protect all customer routes, ensuring only logged-in users can access them.
Customer Model (models/Customer.js):

Collaborated on and refined the Mongoose schema for customers.
Ensured the inclusion of key fields (name, email, phone, company, address, status, createdBy).
Implemented schema options for unique: true on email to enforce data integrity.
Implemented timestamps: true for automatic createdAt and updatedAt fields.
Aligned the status enum with application requirements.
Application Integration (app.js):

Imported and correctly mounted the customer router module at the designated base path (/customer), enabling the customer feature within the main Express application.
Worked through debugging issues related to singular vs. plural base path conventions to ensure consistency.
II. Frontend Development (EJS Views):

Customer Create View (views/customer/create.ejs):

Developed the HTML form structure for creating new customers.
Ensured input fields had correct name attributes for data submission and type attributes for HTML5 validation.
Implemented EJS to dynamically pre-fill form values if re-rendering after a validation error (customerData).
Implemented EJS to display server-side validation error messages (errors array).
Changed the "status" input to a <select> dropdown for better UX and data integrity based on the model's enum.
Ensured the form action attribute correctly pointed to the backend route for processing.
Customer List View (views/customer/home.ejs - used for listing):

Implemented EJS to iterate through the customers array and display customer information (name, email, etc.).
Created links for "View Details" and "Edit" for each customer, ensuring correct dynamic URL generation (e.g., /customer/detail/:id).
Implemented the frontend for pagination controls using EJS, including:
"Previous" and "Next" buttons/links.
Page number links.
Logic to disable/enable buttons based on currentPage and totalPages.
Ensured pagination links correctly construct query parameters to maintain search, filter, and sort states across pages.
Added an "Add New Customer" link pointing to the create form.
III. Version Control & Debugging:

Utilized Git for version control: add, commit, push.
Actively troubleshooted and resolved numerous Git synchronization issues with the remote repository (GitHub), including:
Merge conflicts (particularly with models/Customer.js).
"Fetch first" and "non-fast-forward" push rejections.
Successfully applied git pull, merge resolution techniques, git merge --abort, git reset --hard HEAD, and git checkout origin/main -- <file> to synchronize local and remote states.
Diagnosed and fixed server-side errors, including Cannot GET issues (due to routing misconfigurations and singular/plural path inconsistencies) and Mongoose CastError (due to incorrect route ordering).