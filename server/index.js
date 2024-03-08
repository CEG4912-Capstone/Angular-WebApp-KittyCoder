const cors = require("cors");
const express = require("express");
const bodyParser = require('body-parser')

//express module
const app = express();

//make it accessible by other origins/domains
app.use(cors({origin: true}));

//body-parser middleware
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

//database connection
const db = require("./db/conn");

db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

//default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the TO-DO-LIST BACK-END application." });
});

//api
require("./Routes/user-Routes")(app);

//run server
const PORT = 9000;
app.listen(PORT, () => {
  console.log('HTTP REST API Server running at http://localhost:'+PORT+'.');
});
