/**
 * Main JavaScript file for client-side functionality
 */

document.addEventListener("DOMContentLoaded", function() {
  // Load the saved theme from localStorage or default to light
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // Handle flash message dismissal
  const flashMessages = document.querySelectorAll(".flash-message");
  flashMessages.forEach((message) => {
    // Auto-dismiss flash messages after 5 seconds
    setTimeout(() => {
      message.style.display = "none";
    }, 5000);

    // Allow manual dismissal with close button
    const closeBtn = message.querySelector(".close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        message.style.display = "none";
      });
    }
  });

  // Add form validation feedback
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input");

    inputs.forEach((input) => {
      // Add visual feedback on input validation
      input.addEventListener("input", function() {
        if (this.validity.valid) {
          this.classList.remove("invalid");
          this.classList.add("valid");
        } else {
          this.classList.remove("valid");
          this.classList.add("invalid");
        }
      });
    });
  });

  // Enhanced theme toggle functionality
  const toggleTheme = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    
    // Add a subtle animation during transition
    html.classList.add("theme-transition");
    
    // Apply the new theme
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Remove the transition class after the animation completes
    setTimeout(() => {
      html.classList.remove("theme-transition");
    }, 300);
  };

  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }
});
