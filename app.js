/**
 * Main application entry point
 * This file sets up our Express server, middleware, and routes
 */

// Load environment variables from .env file
require("dotenv").config();

// Core dependencies
const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const csrf = require("csurf");

// Import routes
const indexRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const customerRoutes = require("./routes/customer"); //1. Import customer routes

// Import custom middleware
const { setLocals } = require("./middlewares/locals");
const { handleErrors } = require("./middlewares/error-handler");

// Initialize Express app
const app = express();

// Trust proxy - add this line when deploying behind a reverse proxy (like Render)
app.set("trust proxy", 1);

// Connect to MongoDB with better error handling and configuration
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      autoIndex: process.env.NODE_ENV !== "production", // Only create indexes in development
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => {
      console.error("MongoDB connection error:", err);
      console.log(
        "Please check your MongoDB connection string and ensure the database is running."
      );
    });
} else {
  console.warn(
    "MONGODB_URI not found in environment variables. Database features will not work."
  );
}

// Configure Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Set up EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Helper function for error responses
app.locals.helpers = {
  isActiveRoute: (path, route) => path === route,
  currentYear: () => new Date().getFullYear(),
  formatDate: (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
};

// Session configuration
let sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // Change sameSite to 'none' in production
  },
};

// Configure session with MongoDB store
if (process.env.MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 14 * 24 * 60 * 60, // 14 days session expiry
    autoRemove: "native",
    touchAfter: 24 * 3600, // update session only once per day
    crypto: {
      secret: process.env.SESSION_SECRET || "fallback_secret",
    },
  });
  console.log("MongoDB session store configured");
} else {
  console.warn("Using memory session store (not recommended for production)");
}

app.use(session(sessionConfig));

// Enable CSRF protection
const csrfProtection = csrf({ cookie: false }); // Use session instead of cookies

// Apply CSRF protection and provide token to templates
app.use((req, res, next) => {
  // Skip CSRF for specific routes if needed (like API endpoints)
  if (req.path.startsWith("/api/")) {
    return next();
  }

  csrfProtection(req, res, (err) => {
    if (err) {
      console.error("CSRF error:", err);
      if (err.code === "EBADCSRFTOKEN") {
        // Handle invalid CSRF token
        return res.status(403).render("error", {
          title: "Security Error",
          message: "Form submission rejected. Please try again.",
          error: { status: 403 },
          path: req.path,
          isAuthenticated: req.session && req.session.user ? true : false,
        });
      }

      // For other CSRF errors, provide a dummy token and continue
      res.locals.csrfToken = "csrf-error-occurred";
      return next();
    }

    // Set CSRF token in locals for templates to use
    res.locals.csrfToken = req.csrfToken();
    next();
  });
});

// Our custom locals middleware
app.use(setLocals);

// Routes (Mounting sections for different routes))
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/customers", customerRoutes); //2. Mount customer routes

// Error handling middleware
app.use(handleErrors);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
