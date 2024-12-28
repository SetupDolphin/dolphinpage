const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Simpan data sementara di memory
const pointsData = new Map();

// Get total points
app.get('/api/points/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const userData = pointsData.get(walletAddress) || { totalPoints: 0, history: [] };
  res.json({ totalPoints: userData.totalPoints });
});

// Get point history
app.get('/api/points/history/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const userData = pointsData.get(walletAddress) || { totalPoints: 0, history: [] };
  res.json({ history: userData.history });
});

// Add points (untuk testing)
app.post('/api/points/add', (req, res) => {
  const { walletAddress, points, activity } = req.body;
  
  if (!pointsData.has(walletAddress)) {
    pointsData.set(walletAddress, { totalPoints: 0, history: [] });
  }

  const userData = pointsData.get(walletAddress);
  userData.totalPoints += points;
  userData.history.push({
    id: Date.now(),
    points,
    activity,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 