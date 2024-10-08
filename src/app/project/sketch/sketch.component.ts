import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

// Import Teachable Machine modules
import * as tmImage from '@teachablemachine/image';

@Component({
  selector: 'app-sketch',
  standalone: true,
  templateUrl: './sketch.component.html',
  imports: [
    CommonModule,
    MatCard,
    MatCardTitle,
    MatIcon,
    MatButton,
  ],
  styleUrls: ['./sketch.component.css'],
})
export class SketchComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentColor = 'black';

  // Teachable Machine model variables
  private URL = 'https://teachablemachine.withgoogle.com/models/HHcyGf53Q/';
  private model: any;
  private maxPredictions: number = 0;

  predictions: Array<{ className: string; probability: number }> = [];

  constructor() {}

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.resizeCanvas();
    this.clearCanvas();
    this.initModel();
  }

  private resizeCanvas() {
    this.canvasRef.nativeElement.width =
      this.canvasRef.nativeElement.offsetWidth;
    this.canvasRef.nativeElement.height = 350;
  }

  // Mouse down (clicked)
  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.draw(event);
  }

  // Mouse up
  stopDrawing() {
    this.isDrawing = false;
    this.ctx.beginPath();
    // Trigger prediction when drawing stops
    this.predict();
    this.maxPredictions = 0;
  }

  draw(event: MouseEvent) {
    if (!this.isDrawing) return;

    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.currentColor;

    this.ctx.lineTo(event.offsetX, event.offsetY);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(event.offsetX, event.offsetY);
  }

  setColor(color: string) {
    this.currentColor = color;
  }

  reset() {
    this.clearCanvas();
    this.predictions = []; // Clear predictions when resetting
  }

  private clearCanvas() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      350
    );
  }

  async initModel() {
    const modelURL = this.URL + 'model.json';
    const metadataURL = this.URL + 'metadata.json';

    this.model = await tmImage.load(modelURL, metadataURL);
    this.maxPredictions = this.model.getTotalClasses();
  }

  predict() {
    const imageData = this.canvasRef.nativeElement.toDataURL('image/png');

    const img = new Image();
    img.src = imageData;

    img.onload = async () => {
      // Now that the image is loaded, you can pass it to the model
      await this.runPrediction(img);
    };
  }

  async runPrediction(image: HTMLImageElement) {
    if (!this.model) {
      console.error('Model not loaded yet.');
      return;
    }

    // Run the Teachable Machine model prediction
    const prediction = await this.model.predict(image);

    // Sort predictions by probability in descending order
    prediction.sort((a: any, b: any) => b.probability - a.probability);

    // Take the top 3 predictions
    this.predictions = prediction.slice(0, 3);

    // Log the predictions (optional)
    for (let i = 0; i < this.predictions.length; i++) {
      const classPrediction =
        this.predictions[i].className +
        ': ' +
        this.predictions[i].probability.toFixed(2);
      console.log(classPrediction);
    }
  }
}
