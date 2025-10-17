document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Auth elements
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const loginModal = document.getElementById("loginModal");
  const loginForm = document.getElementById("loginForm");
  const closeBtn = document.querySelector(".close");
  const teacherInfo = document.getElementById("teacherInfo");
  const teacherName = document.getElementById("teacherName");
  const loginMessage = document.getElementById("loginMessage");

  let authCredentials = null;

  // Show/hide login modal
  loginBtn.onclick = () => {
    loginModal.classList.add("show");
  };

  closeBtn.onclick = () => {
    loginModal.classList.remove("show");
    loginMessage.classList.add("hidden");
  };

  window.onclick = (event) => {
    if (event.target === loginModal) {
      loginModal.classList.remove("show");
      loginMessage.classList.add("hidden");
    }
  };

  // Handle login
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    
    // Create base64 encoded credentials
    const credentials = btoa(`${username}:${password}`);
    
    try {
      const simplifiedUsername = username.toLowerCase().replace(/^(mr\.|mrs\.)/, '');
      
      // Try both with and without prefix
      const attempts = [
        username,
        `mr.${simplifiedUsername}`,
        `mrs.${simplifiedUsername}`
      ];

      let loginSuccessful = false;
      
      for (const attemptUsername of attempts) {
        const attemptCredentials = btoa(`${attemptUsername}:${password}`);
        const response = await fetch("/activities/test/signup?email=test@test.com", {
          method: "POST",
          headers: {
            "Authorization": `Basic ${attemptCredentials}`
          }
        });

        if (response.ok) {
          authCredentials = attemptCredentials;
          teacherName.textContent = attemptUsername;
          loginBtn.classList.add("hidden");
          teacherInfo.classList.remove("hidden");
          loginModal.classList.remove("show");
          loginForm.reset();
          loginSuccessful = true;
          break;
        }
      }
      
      if (!loginSuccessful) {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      loginMessage.textContent = "Invalid username or password";
      loginMessage.classList.remove("hidden");
      loginMessage.className = "error";
    }
  };

  // Handle logout
  logoutBtn.onclick = () => {
    authCredentials = null;
    teacherInfo.classList.add("hidden");
    loginBtn.classList.remove("hidden");
  };

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft =
          details.max_participants - details.participants.length;

        // Create participants HTML with delete icons instead of bullet points
        const participantsHTML =
          details.participants.length > 0
            ? `<div class="participants-section">
              <h5>Participants:</h5>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li><span class="participant-email">${email}</span><button class="delete-btn" data-activity="${name}" data-email="${email}">❌</button></li>`
                  )
                  .join("")}
              </ul>
            </div>`
            : `<p><em>No participants yet</em></p>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container">
            ${participantsHTML}
          </div>
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleUnregister);
      });
    } catch (error) {
      activitiesList.innerHTML =
        "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle unregister functionality
  async function handleUnregister(event) {
    if (!authCredentials) {
      messageDiv.textContent = "Please login as a teacher to unregister students";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      return;
    }

    const button = event.target;
    const activity = button.getAttribute("data-activity");
    const email = button.getAttribute("data-email");

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Basic ${authCredentials}`
          }
        });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!authCredentials) {
      messageDiv.textContent = "Please login as a teacher to register students";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      return;
    }

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(
          activity
        )}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authCredentials}`
          }
        });

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities list to show updated participants
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
