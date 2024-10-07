const cors = require("cors");
const express = require("express");
const https = require('https');
const bodyParser = require('body-parser')
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

// point to self-signed certificate & key for ssl configuration
// const options = {
//   key: fs.readFileSync('C:\\Users\\moumi\\localhost.key'),
//   cert: fs.readFileSync('C:\\Users\\moumi\\localhost.crt')
// };

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
const {of} = require("rxjs");
const {createServer} = require("https");

db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

//default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the KittyCoder BACK-END application." });
});


// open ai config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is the default and can be omitted
});

// Initialize turtle and canvas
let turtle = {
  x: 250,
  y: 100,
  angle: 0, // looking right
  penDown: true,
};

app.get("/api/reset-preview",(req, res) => {
  try{
    // Create a canvas
    let canvasWidth = 467;
    let canvasHeight = 400;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext('2d');

    // Reset canvas and turtle settings
    // Adjust turtle's position based on offsets
    turtle.x = 250;
    turtle.y = 100;
    turtle.angle = 0;

      context.fillStyle = '#ffffff'; // White background
      context.fillRect(0, 0, canvas.width, canvas.height);

    

      context.strokeStyle = '#000000'; // Black for line color
      context.lineWidth = 1; // Default line width

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
    context.strokeStyle = 'green'; // Color for visibility
    context.stroke();

    // Reset the stroke color for other drawings
    context.strokeStyle = '#000000';

    // Convert canvas to base64 image
    const base64Image = canvas.toDataURL().split(';base64,').pop();

    // Send the generated image to the client
    res.send({base64image: base64Image});

  } catch (error) {
    console.log(error)
    res.status(500).json({message: "Some error occurred!"})
  }
});

function calculateCanvasSize(commands) {
  let simTurtle = { ...turtle };
  let minX = simTurtle.x, minY = simTurtle.y, maxX = simTurtle.x, maxY = simTurtle.y;

  commands.forEach(command => {
    if (command.movementType === "Turn") {
      simTurtle.angle += (command.direction === "Right" ? command.steps : -command.steps);
      simTurtle.angle = (simTurtle.angle + 360) % 360; // Normalize angle
    } else if (command.movementType === "Move") {
      const moveDistance = command.steps * 10; // Assuming each step is 10 units
      let moveX = Math.cos(simTurtle.angle * Math.PI / 180) * moveDistance;
      let moveY = Math.sin(simTurtle.angle * Math.PI / 180) * moveDistance;

      // Adjust movement for "Backward" direction by reversing the direction
      if (command.direction === "Backward") {
        moveX *= -1;
        moveY *= -1;
      }

      // Apply the calculated movement
      simTurtle.x += moveX;
      simTurtle.y += moveY;

      // Update bounds based on the new position
      minX = Math.min(minX, simTurtle.x);
      maxX = Math.max(maxX, simTurtle.x);
      minY = Math.min(minY, simTurtle.y);
      maxY = Math.max(maxY, simTurtle.y);
    }
  });

  // Calculate the drawing's span
  const spanX = maxX - minX;
  const spanY = maxY - minY;

  // Determine canvas size based on span and additional padding
  const width = Math.max(spanX + 500, 400); // Ensure minimum width plus padding
  const height = Math.max(spanY + 500, 400); // Ensure minimum height plus padding

  // Correctly calculate offsets to center the drawing
  // These should be based on the minimum extents and the additional padding
  const offsetX = ((width - spanX) / 2) - minX;
  const offsetY = ((height - spanY) / 2) - minY;

  console.log(`Calculated canvas size: width = ${width}, height = ${height}, offsetX = ${offsetX}, offsetY = ${offsetY}`);

  return { width, height, offsetX, offsetY };
}






app.post("/api/preview",(req, res) => {

  try {
    const commands = req.body;
    console.log(commands);
    let  width = 400;
    let height = 400;

    // Calculate required canvas size
    const size = calculateCanvasSize(commands);
    if (commands.length !== 0) {
      width = size.width;  // Update the existing width variable
      height = size.height; // Update the existing height variable
    }

// Reset canvas to the new size
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);

  // Adjust turtle's position based on offsets
  // turtle.x = 250;
  // turtle.y = 100;
  turtle.angle = 0;

    // Apply the offsets by translating the context
    context.translate(size.offsetX, size.offsetY);

    // Turtle movement logic
    function moveTurtle(distance, direction, color) {

      // set color
      context.strokeStyle = color;

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
    function rotateTurtle(degrees, direction, color) {

      // set color
      context.strokeStyle = color;


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
      context.strokeStyle = 'green'; // Color for visibility
      context.stroke();

      // Reset the stroke color for other drawings
      context.strokeStyle = '#000000';
    }

    // Process each command
    commands.forEach(command => {
      const { direction, movementType, steps , color} = command;

      switch (movementType) {
        case "Move":
          moveTurtle(steps * 10, direction, color);
          break;
        case "Turn":
          rotateTurtle(steps, direction, color); // Assuming 90 degree turns for simplicity
          break;
        // case 'Reset':
        //   resetCanvas(); // Reset canvas on 'Reset' command
        //   break;
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

// use local ip address for same network access
const hostname = 'localhost';

//run server
// https.createServer(options, app).listen(443, 'localhost', () => {
//   console.log(`HTTPS server running at https://${hostname}:443`);
// });


const PORT = 9000;
app.listen(PORT, () => {
  console.log('HTTP REST API Server running at http://localhost:'+PORT+'.');
});
