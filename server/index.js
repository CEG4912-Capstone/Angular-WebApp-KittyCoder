const cors = require("cors");
const express = require("express");
const bodyParser = require('body-parser')

const { createCanvas, loadImage } = require('canvas');

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
const OpenAI = require("openai");

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


// open ai config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

app.post("/api/preview",(req, res) => {
  try {
    const {prompt} = req.body;
    // open ai request
    // const response = openai.completions.create({
    //   model: 'text-davinci-002',
    //   prompt: prompt,
    //   max_tokens: 50,
    //   temperature: 0.7,
    //   top_p: 1,
    //   n: 1,
    //   stop: '\n\n',
    //   echo: false,
    //   stream: false,
    //   return_prompt: false,
    //   logit_bias: null,
    // });

    const { lineText, lineWidth } = req.body;

    // Create a canvas
    const canvas = createCanvas(400, 200);
    const context = canvas.getContext('2d');

    // Draw white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw black line with dynamic width based on user input
    context.beginPath();
    context.strokeStyle = '#000000';
    context.lineWidth = lineWidth || 1; // Use user input for line width, default to 1 if not provided
    context.moveTo(50, 100);
    context.lineTo(350, 100);
    context.stroke();

    // Draw using 5px for border radius on all sides
    // stroke it but no fill
    context.roundRect(300, 100, 50, 50, 5);
    context.stroke();

    // Convert canvas to base64 image
    const base64Image = canvas.toDataURL().split(';base64,').pop();

    // Send the generated image to the client
    res.send({base64image: base64Image});

  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Some error occurred!"})
  }
});

//api
require("./Routes/user-Routes")(app);

//run server
const PORT = 9000;
app.listen(PORT, () => {
  console.log('HTTP REST API Server running at http://localhost:'+PORT+'.');
});
