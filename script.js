class TriangleRocket {
  #canvas;
  #context;
  centerX;
  centerY;
  angle;
  keyStates = {};
  #circles = [];
  #asteroids = [];

  constructor(canvas, context) {
    this.#canvas = canvas;
    this.#context = context;
    this.centerX = this.#canvas.width / 2;
    this.centerY = this.#canvas.height / 2;
    this.angle = 0;

    window.addEventListener("keydown", (event) => this.keyStates[event.key] = true);
    window.addEventListener("keyup", (event) => this.keyStates[event.key] = false);
    setInterval(() => this.createAsteroids(), 3000);


    this.updateAndDraw();
  }
  
  drawTriangle() {
    const size = 30;

    this.#context.fillStyle = 'black';
    this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

    // Calculate the positions of each triangle vertex based on the angle
    const topX = this.centerX + size * Math.sin(this.angle);
    const topY = this.centerY - size * Math.cos(this.angle);
    const rightX = this.centerX + size * 0.87 * Math.cos(this.angle) - size * 0.5 * Math.sin(this.angle);
    const rightY = this.centerY + size * 0.5 * Math.cos(this.angle) + size * 0.87 * Math.sin(this.angle);
    const leftX = this.centerX - size * 0.87 * Math.cos(this.angle) - size * 0.5 * Math.sin(this.angle);
    const leftY = this.centerY + size * 0.5 * Math.cos(this.angle) - size * 0.87 * Math.sin(this.angle);

    // Draw the triangle with calculated vertices
    this.#context.beginPath();
    this.#context.moveTo(topX, topY);
    this.#context.lineTo(rightX, rightY);
    this.#context.lineTo(leftX, leftY);
    this.#context.closePath();

    this.#context.strokeStyle = 'gray';
    this.#context.stroke();

    if (this.keyStates["x"]){
      this.#circles.push({
        x:topX,
        y:topY,
        radius:5,
        speed:2,
        angle:this.angle
      });
    }

  }

  updateAsteroids(){
    this.#asteroids.forEach((asteroid,index) => {
      asteroid.corX -= asteroid.speed * Math.sin(asteroid.angle)
      asteroid.corY += asteroid.speed * Math.cos(asteroid.angle)

      if (
        asteroid.corX < 0 ||
        asteroid.corX > this.#canvas.width ||
        asteroid.corY < 0 ||
        asteroid.corY > this.#canvas.height
      ) {
        this.#asteroids.splice(index, 1);
      }
    
    })
  }

  updateCircles() {
    this.#circles.forEach((circle, index) => 
      {
      // Update circle position based on its angle and speed
      circle.x += circle.speed * Math.sin(circle.angle);
      circle.y -= circle.speed * Math.cos(circle.angle);
      if (
        circle.x < 0 ||
        circle.x > this.#canvas.width ||
        circle.y < 0 ||
        circle.y > this.#canvas.height
      ) {
        this.#circles.splice(index, 1);
      }
      })

  }

  drawCircles(){
    let contor = 0
    for (let circle of this.#circles){
         this.#context.beginPath();
         this.#context.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI);
         this.#context.strokeStyle = 'red'
         this.#context.stroke()
         contor++;
    }
  }

  updatePosition() {
    const moveAmount = 2; // Reduce move amount for smoother movement
    const rotateAmount = Math.PI / 180 * 2; // Smaller rotation for smooth turning

    if (this.keyStates["ArrowUp"]) {
      this.centerY -= moveAmount * Math.cos(this.angle);
      this.centerX += moveAmount * Math.sin(this.angle);
      //this.createAsteroids();
    }
    if (this.keyStates["ArrowDown"]) {
      this.centerY += moveAmount * Math.cos(this.angle);
      this.centerX -= moveAmount * Math.sin(this.angle);
    }
    if (this.keyStates["ArrowLeft"]) {
      this.angle -= rotateAmount;
    }
    if (this.keyStates["ArrowRight"]) {
      this.angle += rotateAmount;
    }
  }

  drawAsteroids(){
    for (let asteroids of this.#asteroids){
      this.#context.strokeStyle  = 'grey'
      this.#context.strokeRect(asteroids.corX, asteroids.corY, asteroids.w, asteroids.h)
    }
  }

  createAsteroids(){
    for (let i = 0; i<=4 ;i++){
      
    let x = Math.floor(Math.random() * this.#canvas.width)
    let y = Math.floor(Math.random() * this.#canvas.height)
    let w = Math.floor(Math.random() * 10) + 40
    let h = Math.floor(Math.random() * 10) + 50
    this.#asteroids.push({
       corX: x,
       corY: 0,
       w: w,
       h: h,
       speed: 1,
       angle: this.angle
    });
    }
    
  }

  updateAndDraw() {
   
    this.updatePosition();
    this.updateCircles();
    this.updateAsteroids();
    
    this.drawTriangle();
    this.drawCircles();
    this.drawAsteroids();
    
  
   //This method tells the browser to schedule another call to updateAndDraw at the next available screen repaint.
    requestAnimationFrame(() => this.updateAndDraw());
  }
}



class AsteroidsGame{

#canvas
#context
#triangleRocket

/**
 * @param {HTMLCanvasElement} canvas_sheet
 */

constructor(canvas, context){
     
     this.#canvas = canvas;
     this.#context = context;
}


createCanvas(){
   // this.#triangleRocket.drawTriangle();
   this.#triangleRocket = new TriangleRocket(canvas, context);
    
}


}




