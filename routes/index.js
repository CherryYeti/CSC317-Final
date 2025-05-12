/**
 * Index routes
 * Handles public routes that don't require authentication
 */
const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Home page route
router.get("/", async (req, res, next) => {
  try {
    // Initialize dashboard data
    let dashboardData = null;

    // Only fetch customer data if user is authenticated
    if (req.session.user) {
      // Get total customers count
      const totalCustomers = await Customer.countDocuments();

      // Get customers by status
      const customersByStatus = await Customer.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      // Get 5 most recent customers
      const recentCustomers = await Customer.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      // Count of customers added in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentlyAddedCount = await Customer.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
      });

      dashboardData = {
        totalCustomers,
        customersByStatus,
        recentCustomers,
        recentlyAddedCount,
      };
    }

    res.render("index", {
      title: "Home",
      message: "Welcome to ClientSphere",
      dashboardData,
    });
  } catch (error) {
    next(error);
  }
});

// About page route
router.get("/about", (req, res) => {
  res.render("about", {
    title: "About",
    message: "Learn about this application",
  });
});

module.exports = router;
