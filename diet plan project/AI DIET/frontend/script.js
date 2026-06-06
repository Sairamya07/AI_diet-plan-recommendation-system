const API_URL = ""; // Relative path for same-server deployment

// --- DOM Elements ---
const authContainer = document.getElementById("auth-container");
const dashboardContainer = document.getElementById("dashboard-container");
const authTitle = document.getElementById("auth-title");
const authBtn = document.getElementById("auth-btn");
const authToggle = document.getElementById("auth-toggle");
const authUserHTML = document.getElementById("auth-username");
const authPassHTML = document.getElementById("auth-password");

let isLoginMode = true;
// Clear token on reload as requested ("when reload, logout")
localStorage.removeItem("diet_token");
let token = null;

// --- Initialization ---
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("fade-out");
    // Remove from DOM after transition
    setTimeout(() => {
      document.getElementById("loading-screen").style.display = "none";
    }, 800);
  }, 2000); // Show loader for 2 seconds

  init();
});

function init() {
  if (token) {
    showDashboard();
  } else {
    showAuth();
  }
}

// --- Auth Logic ---
function toggleAuthMode() {
  isLoginMode = !isLoginMode;
  authTitle.innerText = isLoginMode ? "Welcome Back" : "Create Account";
  authBtn.innerText = isLoginMode ? "Login" : "Sign Up";
  authToggle.innerText = isLoginMode ? "New here? Sign up" : "Already have an account? Login";
}

function togglePassword() {
  const passwordInput = document.getElementById("auth-password");
  const toggleIcon = document.getElementById("toggle-icon");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    // Change to "Eye Off" (Slash)
    toggleIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
    toggleIcon.style.color = "var(--accent-color)";
  } else {
    passwordInput.type = "password";
    // Change back to "Eye On"
    toggleIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
    toggleIcon.style.color = "rgba(255, 255, 255, 0.6)";
  }
}

async function handleAuth() {
  const username = authUserHTML.value;
  const password = authPassHTML.value;

  if (!username || !password) {
    alert("Please fill in all fields");
    return;
  }

  const endpoint = isLoginMode ? "/auth/login" : "/auth/register";

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      if (isLoginMode) {
        token = data.access_token;
        localStorage.setItem("diet_token", token);
        showDashboard();
      } else {
        alert("Registration successful! Please login.");
        toggleAuthMode();
      }
    } else {
      alert(data.msg || "Error occurred");
    }
  } catch (err) {
    alert("Server error. Is backend running?");
    console.error(err);
  }
}

function logout() {
  document.getElementById("logout-modal").classList.remove("hidden");
}

function confirmLogout() {
  token = null;
  localStorage.removeItem("diet_token");
  document.getElementById("logout-modal").classList.add("hidden");
  showAuth();
}

function closeLogoutModal() {
  document.getElementById("logout-modal").classList.add("hidden");
}

// --- Navigation ---
function showAuth() {
  authContainer.classList.remove("hidden");
  dashboardContainer.classList.add("hidden");

  // Show Navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.style.display = 'flex';
}

function showDashboard() {
  authContainer.classList.add("hidden");
  dashboardContainer.classList.remove("hidden");
  showSection("chat");
  loadProfile(); // Pre-load profile data to ensure Name is available for PDF

  // Hide Navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.style.display = 'none';
}

function showSection(sectionId) {
  document.querySelectorAll(".section").forEach(el => el.classList.add("hidden"));
  document.getElementById(`${sectionId}-section`).classList.remove("hidden");

  // Active Tab Styling
  document.querySelectorAll(".sidebar button").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById(`nav-${sectionId}`);
  if (btn) btn.classList.add("active");

  if (sectionId === 'profile') loadProfile();
  if (sectionId === 'history') loadHistory();
}

// --- Profile ---
async function loadProfile() {
  const res = await fetchWithAuth("/profile");
  if (res) { // Determine emptiness check
    document.getElementById("p-name").value = res.name || "";
    document.getElementById("p-age").value = res.age || "";
    document.getElementById("p-gender").value = res.gender || "female";
    document.getElementById("p-height").value = res.height || "";
    document.getElementById("p-weight").value = res.weight || "";
    document.getElementById("p-activity").value = res.activity_level || "low";
    document.getElementById("p-food").value = res.food_preference || "veg";
    document.getElementById("p-allergies").value = res.allergies || "none";
    document.getElementById("p-medical").value = res.medical_conditions || "none";
    document.getElementById("p-meals").value = res.meals_per_day || "";
    document.getElementById("p-goal").value = res.goal || "loss";
  }
}

async function updateProfile() {
  const body = {
    name: document.getElementById("p-name").value,
    age: document.getElementById("p-age").value,
    gender: document.getElementById("p-gender").value,
    height: document.getElementById("p-height").value,
    weight: document.getElementById("p-weight").value,
    activity_level: document.getElementById("p-activity").value,
    food_preference: document.getElementById("p-food").value,
    allergies: document.getElementById("p-allergies").value,
    medical_conditions: document.getElementById("p-medical").value,
    meals_per_day: document.getElementById("p-meals").value,
    goal: document.getElementById("p-goal").value,
  };

  const res = await fetchWithAuth("/profile", "PUT", body);
  if (res) alert("Profile updated!");
}


// --- Chat ---
async function sendChat() {
  const input = document.getElementById("chat-input");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage(msg, "user-msg");
  input.value = "";

  try {
    const res = await fetchWithAuth("/chat", "POST", { message: msg });
    if (res && res.reply) {
      // Pass original query for PDF generation
      appendMessage(res.reply, "bot-msg", { originalQuery: msg });
    } else {
      console.error("Chat Error: No reply in response", res);
      appendMessage("Error: No reply received from server.", "bot-msg");
    }
  } catch (err) {
    console.error("Chat Request Failed:", err);
    appendMessage("Error: Failed to connect to server.", "bot-msg");
  }
}

function appendMessage(text, className, extraData = null) {
  const div = document.createElement("div");
  div.className = className;

  // Text Content
  const textSpan = document.createElement("span");
  textSpan.innerText = text;
  div.appendChild(textSpan);

  // ACTION BUTTONS
  const actionBtn = document.createElement("button");
  actionBtn.className = "pdf-btn"; // Reusing existing style
  actionBtn.style.marginLeft = "10px";
  actionBtn.style.padding = "4px 8px";
  actionBtn.style.fontSize = "10px";

  if (className === "bot-msg") {
    // COPY BUTTON

    actionBtn.innerText = "Copy";
    actionBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      actionBtn.innerText = "Copied!";
      setTimeout(() => actionBtn.innerText = "Copy", 2000);
    };
    div.appendChild(actionBtn);

    // DOWNLOAD PDF BUTTON
    if (extraData && extraData.originalQuery) {
      const dlBtn = document.createElement("button");
      dlBtn.className = "pdf-btn";
      dlBtn.style.marginLeft = "10px";
      dlBtn.style.padding = "4px 8px";
      dlBtn.style.fontSize = "10px";
      dlBtn.innerText = "Download PDF";

      // Encode for safety
      const qEnc = encodeURIComponent(extraData.originalQuery);
      const rEnc = encodeURIComponent(text);
      const tEnc = encodeURIComponent(new Date().toISOString());

      dlBtn.onclick = () => downloadPDF(qEnc, rEnc, tEnc);
      div.appendChild(dlBtn);
    }

  } else if (className === "user-msg") {
    // EDIT BUTTON
    actionBtn.innerText = "Edit";
    actionBtn.onclick = () => {
      const input = document.getElementById("chat-input");
      input.value = text;
      input.focus();
    };
    div.appendChild(actionBtn);
  }

  document.getElementById("chat-box").appendChild(div);
  document.getElementById("chat-box").scrollTop = document.getElementById("chat-box").scrollHeight;
}

// --- History ---
async function loadHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = "Loading...";

  const data = await fetchWithAuth("/history");
  list.innerHTML = "";

  if (data && data.length > 0) {
    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "history-item";

      // Encode strings to avoid quote issues in onclick
      const msgEncoded = encodeURIComponent(item.message);
      const replyEncoded = encodeURIComponent(item.reply);
      const timeEncoded = encodeURIComponent(item.timestamp);

      // Calculate formatted date for display
      const displayDate = new Date(item.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                    <span class="history-time" style="color: #888; font-size: 0.8em;">${displayDate}</span>
                    <button class="pdf-btn" onclick="downloadPDF('${msgEncoded}', '${replyEncoded}', '${timeEncoded}')">Download PDF</button>
                </div>
                <div class="history-q">You: ${item.message}</div>
                <div class="history-a">AI: ${item.reply}</div>
            `;
      list.appendChild(div);
    });
  } else {
    list.innerHTML = "<p style='text-align:center; color:#888;'>No history found.</p>";
  }
}

async function deleteHistory() {
  if (!confirm("Are you sure you want to delete all history?")) return;

  // Show Loading with Logo
  const loader = document.getElementById("loading-screen");
  loader.innerHTML = `
    <div class="loader" style="display:flex; flex-direction:column; align-items:center;">
      <img src="logo_3d.png" class="loading-logo-3d" alt="Loading...">
      <span style="margin-top:15px; font-size:1.2em; color:white;">Deleting History...</span>
    </div>
    </div>
  `;
  loader.style.display = "flex"; // Fix: visible again
  // Small delay to allow browser to register display:flex before transition? 
  // Actually, removing fade-out immediately is fine for instant show.
  requestAnimationFrame(() => {
    loader.classList.remove("fade-out");
  });

  await fetchWithAuth("/history", "DELETE");

  // Refresh and Hide
  await loadHistory();
  setTimeout(() => {
    loader.classList.add("fade-out");
  }, 800); // Small delay for visual feedback
}

// --- PDF Download Logic ---
// --- PDF Download Logic ---
function downloadPDF(msgEnc, replyEnc, timeEnc) {
  const msg = decodeURIComponent(msgEnc);
  const reply = decodeURIComponent(replyEnc);
  const time = decodeURIComponent(timeEnc);

  // Get User Name (fallback if empty)
  const userName = document.getElementById("p-name").value || "Valued User";

  // Show Feedback
  const btn = document.activeElement;
  const originalText = btn ? btn.innerText : "Download PDF";
  if (btn) btn.innerText = "Processing...";

  // 1. Create Overlay (Dark Background, Scrollable)
  const overlay = document.createElement("div");
  overlay.id = "pdf-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
  overlay.style.zIndex = "99999";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "flex-start"; // Allow scrolling from top
  overlay.style.overflowY = "auto"; // Enable scroll
  overlay.style.padding = "20px 0"; // vertical spacing

  // 2. Message to User
  const statusMsg = document.createElement("div");
  statusMsg.innerText = "Preparing Report... Please Wait";
  statusMsg.style.color = "white";
  statusMsg.style.margin = "10px 0 20px 0";
  statusMsg.style.fontFamily = "sans-serif";
  statusMsg.style.fontSize = "16px";
  statusMsg.style.position = "absolute";
  statusMsg.style.top = "10px";
  statusMsg.style.left = "20px";
  overlay.appendChild(statusMsg);

  // 3. The Paper Container
  const container = document.createElement("div");
  container.id = "pdf-content-box";
  container.className = "pdf-container"; // Ensure CSS class is applied
  container.style.width = "210mm";
  container.style.minHeight = "297mm";
  container.style.backgroundColor = "white";
  container.style.color = "black";
  // container.style.marginTop = "40px"; // REMOVED: This causes PDF mismatch. 
  // Spacing is handled by statusMsg margin and overlay padding.

  // Helper to format text with good structure
  const formatText = (text) => {
    let html = text
      // Bold: **text** -> <strong>text</strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Headers: # Header or ## Header -> <h3>Header</h3>
      .replace(/^#{1,3}\s+(.+)$/gm, '<h3 style="color:#27ae60; margin-top:15px; margin-bottom:5px;">$1</h3>')
      // Lists: - item or * item -> <li>item</li>
      .replace(/^\s*[-*•]\s+(.+)$/gm, '<li>$1</li>');

    // Wrap <li> elements in <ul>
    // This regex looks for consecutive <li> lines (including newlines between them) and wraps them
    html = html.replace(/(<li>.*<\/li>(\s|\n)*)+/g, (match) => {
      return `<ul style="text-align: left; margin-left: 20px; padding-left: 20px; list-style-type: disc;">${match}</ul>`;
    });

    // Newlines to <br> (but not inside ul/h3 tags to avoid double spacing)
    html = html.replace(/\n/g, '<br>');

    // Clean up excessive <br> around lists/headers
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<\/h3><br>/g, '</h3>');

    return html;
  };

  // Populate Template
  container.innerHTML = `
        <div class="pdf-header">
            <div class="pdf-logo">🥗 Diet AI</div>
            <div class="pdf-title-block">
                <h1>Medical Diet Recommendation</h1>
                <p>Official Health Report • Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
        </div>
        
        <div class="pdf-meta">
            <span><strong>Client Name:</strong> ${userName}</span>
            <span><strong>Reference ID:</strong> C-${Date.now().toString().slice(-6)}</span>
            <span><strong>Date:</strong> ${new Date(time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
        </div>

        <div class="pdf-section">
            <h2>Dietary Profile</h2>
            <div class="pdf-box" style="text-align: left;">
                ${msg}
            </div>
        </div>

        <div class="pdf-section">
            <h2>Recommended Diet Plan</h2>
            <div class="pdf-box highlight-box" style="text-align: left;">
                ${formatText(reply)}
            </div>
        </div>

        <div class="pdf-footer">
            <p>This document is generated by an AI Dietician System. Please consult a doctor before starting any strict diet.</p>
            <p><strong>Diet Plan Recommendation System © 2026</strong></p>
        </div>
    `;

  overlay.appendChild(container); // Append first
  document.body.appendChild(overlay);

  // 4. Generate PDF
  setTimeout(() => {
    const opt = {
      margin: [5, 5, 5, 5],
      filename: `Diet_Plan_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      // Set windowWidth to ensure consistent rendering
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 1200, scrollY: 0 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      // mode: 'css' allows better flow, removed 'avoid-all' to prevent huge gaps
      pagebreak: { mode: ['css', 'legacy'] }
    };

    html2pdf().set(opt).from(container).save().then(() => {
      document.body.removeChild(overlay);
      if (btn) btn.innerText = "Downloaded!";
      setTimeout(() => { if (btn) btn.innerText = originalText; }, 2000);
    }).catch(err => {
      console.error(err);
      alert("Error generating PDF: " + err.message);
      if (overlay.parentNode) document.body.removeChild(overlay);
      if (btn) btn.innerText = "Error";
    });
  }, 1000);
}


// --- Utility: Authenticated Fetch ---
async function fetchWithAuth(endpoint, method = "GET", body = null) {
  try {
    const opts = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(`${API_URL}${endpoint}`, opts);
    if (res.status === 401 || res.status === 422) {
      logout();
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Listeners
document.getElementById("chat-input").addEventListener("keydown", e => {
  if (e.key === "Enter") sendChat();
});

// Start
init();
