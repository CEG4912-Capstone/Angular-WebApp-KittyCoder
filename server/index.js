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
    const commands = req.body;
    console.log(commands);

    // Create a canvas
    let canvasWidth = 500;
    let canvasHeight = 500;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext('2d');

    // Reset canvas and turtle settings
    function resetCanvas() {
      context.fillStyle = '#ffffff'; // White background
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.strokeStyle = '#000000'; // Black for line color
      context.lineWidth = 1; // Default line width
    }

    // Initialize turtle and canvas
    let turtle = {
      x: 200,
      y: 100,
      angle: 0, // looking right
      penDown: true,
    };
    resetCanvas();

    // Turtle movement logic
    function moveTurtle(distance, direction) {
      // Check if we need to rotate for backward movement
      if (direction === 'Backward') {
        // Rotate 180 degrees to face backward, move, then optionally rotate back
        rotateTurtle(180, 'Backward');
      }

      const dx = Math.cos(turtle.angle) * distance;
      const dy = Math.sin(turtle.angle) * distance;

      if (turtle.penDown) {
        context.beginPath();
        context.moveTo(turtle.x, turtle.y);
        context.lineTo(turtle.x + dx, turtle.y + dy);
        context.stroke();
      }

      // Update turtle position
      turtle.x += dx;
      turtle.y += dy;
    }

    // Turtle rotation logic
    function rotateTurtle(degrees, direction) {
      // Convert degrees to radians for rotation
      const radians = degrees * (Math.PI / 180);

      // Adjust the turtle's angle based on direction
      if (direction === 'Right') {
        turtle.angle += radians;
      } else if (direction === 'Left') {
        turtle.angle -= radians;
      } else if (direction === 'Backward') {
        // For backward, effectively rotate 180 degrees
        turtle.angle += Math.PI;
      }

      // Move forward a bit to view arrow head better
      moveTurtle(20,'Forward');

      // Normalize the angle to ensure it's within 0 - 2PI range
      //turtle.angle = (turtle.angle + 2 * Math.PI) % (2 * Math.PI);
    }

    // Draw turtle at current position
    function drawTurtle() {
      const headLength = 20; // Length of the lines representing the turtle's "head"
      context.beginPath();
      // Adding π (180 degrees) to flip the arrowhead left
      const adjustedAngle = turtle.angle + Math.PI;

      // Points for the arrowhead, creating two sides of a triangle
      const endX1 = turtle.x + Math.cos(adjustedAngle - Math.PI / 6) * headLength;
      const endY1 = turtle.y + Math.sin(adjustedAngle - Math.PI / 6) * headLength;

      const endX2 = turtle.x + Math.cos(adjustedAngle + Math.PI / 6) * headLength;
      const endY2 = turtle.y + Math.sin(adjustedAngle + Math.PI / 6) * headLength;

      // Draw lines from the turtle's position to create the arrowhead
      context.moveTo(turtle.x, turtle.y);
      context.lineTo(endX1, endY1);

      context.moveTo(turtle.x, turtle.y);
      context.lineTo(endX2, endY2);

      // Style for the arrowhead
      context.strokeStyle = 'red'; // Color for visibility
      context.stroke();

      // Reset the stroke color for other drawings
      context.strokeStyle = '#000000';
    }

    // Process each command
    commands.forEach(command => {
      const { direction, movementType, steps } = command;

      switch (movementType) {
        case "Move":
          moveTurtle(steps * 10, direction);
          break;
        case "Turn":
          rotateTurtle(90, direction); // Assuming 90 degree turns for simplicity
          break;
        case 'Reset':
          resetCanvas(); // Reset canvas on 'Reset' command
          break;
      }
    });

    // After processing commands, draw the turtle
    drawTurtle();

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
