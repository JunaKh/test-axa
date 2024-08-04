const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const { getUserProfiles, getUsers } = require('./services/dataService');

const app = express();

// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

// Serve static files from 'dist' directory
app.use(express.static(path.join(__dirname, "../dist")));

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Serve index.html for any other route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// Validate user data
async function validateUserData(userid) {
  try {
    const users = await getUsers();
    const userProfiles = await getUserProfiles();

    const user = users.find((user) => user.username === userid);
    if (!user) {
      return { isValid: false, error: "User not found" };
    }

    const profile = userProfiles.find((profile) => profile.userUid === user.uid);
    if (!profile) {
      return { isValid: false, error: "User profile not found" };
    }

    const age = calculateAge(new Date(profile.birthdate));
    if (age >= 10) {
      return { isValid: false, error: "User is too old for this event" };
    }

    console.log('Profile found:', profile);
    return { isValid: true, user: { ...user, address: profile.address }, profile };
  } catch (error) {
    console.error("Error validating user data:", error);
    return { isValid: false, error: "Error validating user data" };
  }
}

// Helper function to calculate age
function calculateAge(birthdate) {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDiff = today.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
}

// Handle form submission
app.post("/api/submit", async (req, res) => {
  const { userid, wish } = req.body;

  if (!userid || !wish) {
    return res.status(400).json({ error: "Both user ID and wish are required." });
  }

  if (wish.length > 100) {
    return res.status(400).json({ error: "Wish exceeds 100 character limit." });
  }

  const validation = await validateUserData(userid);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }

  res.json({
    message: `Wish submitted successfully for ${validation.user.address}!`,
    address: validation.user.address,
  });
});

// Function to start the server
function startServer(port) {
  const listener = app.listen(port, () => {
    console.log(`Your app is listening on port ${listener.address().port}`);
  });
  return listener;
}

// If the file is executed directly, start the server with the specified or default port
if (require.main === module) {
  const port = process.env.PORT || 3000;
  startServer(port);
}

module.exports = { app, startServer };
