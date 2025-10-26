const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname))); // serve HTML, CSS, JS

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Frontend running at http://localhost:${PORT}`);
});
