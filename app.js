// app.js
const express = require("express");
const cors = require("cors");
const translateRoutes = require("./routes/translateRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/translate", translateRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
