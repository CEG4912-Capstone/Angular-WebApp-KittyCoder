import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {NgIf} from "@angular/common";
import { MatCard } from '@angular/material/card';
import { MatCardTitle } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {HttpClient} from "@angular/common/http";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-sketch',
  standalone: true,
  templateUrl: './sketch.component.html',
  imports: [
    NgIf,
    MatCard,
    MatCardTitle,
    MatIcon,
    MatButton
  ],
  styleUrls: ['./sketch.component.css']
})

export class SketchComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentColor = 'black';

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.resizeCanvas();
    this.clearCanvas();
  }

  private resizeCanvas() {
    this.canvasRef.nativeElement.width = this.canvasRef.nativeElement.offsetWidth;
    this.canvasRef.nativeElement.height = 350;
  }

  //mouse down (clicked)
  startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.draw(event);
  }

  // mouse up
  stopDrawing() {
    this.isDrawing = false;
    this.ctx.beginPath();
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
  }

  private clearCanvas() {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
  }

  predict() {
    const imageData = this.canvasRef.nativeElement.toDataURL('image/png');
    const base64Data = imageData.split(',')[1];

    // Send the base64 image data to server
    this.http.post('url', { image: base64Data }).subscribe(
      (response) => {
        console.log('Prediction response:', response);
        // to show prediction
      },
      (error) => {
        console.error('Error sending prediction request:', error);
      }
    );
  }
}