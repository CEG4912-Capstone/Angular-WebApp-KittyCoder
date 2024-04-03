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
    const prompt = req.body;

    console.log(prompt)

    let direction;
    let type;
    let steps;

    // coordinates
    let x = 200;
    let y = 100;

    // Create a canvas
    let canvasWidth = 500;
    let canvasHeight = 500;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext('2d');

    // Draw white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw black line with dynamic width based on user input
    context.beginPath();
    //context.strokeStyle = '#000000';
    context.lineWidth = 1; // Use user input for line width, default to 1 if not provided


    // arrow head for direction
    // context.beginPath();
    // context.strokeStyle = "red";
    // context.moveTo(x, y);
    // context.lineTo(185, 120);
    // context.stroke();
    // context.moveTo(x, y);
    // context.lineTo(215, 120);
    // context.stroke();

    //black lines
    context.strokeStyle = '#000000';

    // start
    context.moveTo(x, y);

    for(let i= 0; i < prompt.length; i++){
      direction = prompt[i].direction;
      type = prompt[i].movementType;
      steps = prompt[i].steps * 10;


      //move
      if(type === "Move"){
        //direction
        if(direction === "Forward"){
          x = x + steps;

        } else if (direction === "Backward"){

          x = x - steps;
        }

        // Check if x or y exceeds canvas dimensions
        if(x > canvasWidth) {
          canvasWidth = x + 50; // Add some padding
          canvas.width = canvasWidth;
          context.canvas.width = canvasWidth;
        }
        if(y > canvasHeight) {
          canvasHeight = y + 50; // Add some padding
          canvas.height = canvasHeight;
          context.canvas.height = canvasHeight;
        }

        context.lineTo(x, y);
        context.stroke();
        context.moveTo(x, y);
      }

      //turn
      if(type === "Turn"){

        let radius = steps;
        context.beginPath();

        //direction
        if(direction === "Right"){
          context.arc(x, y, radius,0, (Math.PI) / 2, false);
          y = y + steps;
          x = x - steps;


        } else if(direction === "Left"){
          context.arc(x, y, radius,0, (Math.PI * 3) / 2, true);
          //context.arcTo(200, 130, 50, 20, 40);
          y = y - steps;
          x = x - steps;
        }

        //context.lineTo(x, y);
        context.stroke();
        context.moveTo(x, y);
      }

      // rectangle
      // stroke it but no fill
      //context.roundRect(300, 100, 50, 50, 5);
      //context.stroke();


    }

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
