/**
 * 
 * @param {HTMLDivElement}
 */

class DivElementHandle{
  #points;
  #lives;

  constructor(){
    this.divElement = document.getElementById('pointsDisplay')
    this.divElement2 = document.getElementById('lifeDisplay')
  }

  parsingDiv(){
    let text = this.divElement.textContent
    this.#points = parseInt(text.split(":")[1])
    this.#lives = parseInt(this.divElement2.textContent.split(":")[1])
  }

  incrementPoints(numberToBeAdded){
    this.#points += numberToBeAdded
    this.checkForLifeAdding()
  }

  checkForLifeAdding(){
      if(this.#points >= 50)
         this.#lives += 1
  }

  display(){
    this.divElement.textContent = "Points:"+ this.#points 
    this.divElement2.textContent = "Reamining lives: "+ this.#lives
  }
}

class TriangleRocket {
  #canvas;
  #context;
  centerX;
  centerY;
  angle;
  keyStates = {};
  #circles = [];
  #asteroids = [];
  divElementPoints;
  #triangleRocket = [];

  constructor(canvas, context) {
    this.#canvas = canvas;
    this.#context = context;
    this.centerX = this.#canvas.width / 2;
    this.centerY = this.#canvas.height / 2;
    this.angle = 0;
    this.divElementPoints  = new DivElementHandle()

    window.addEventListener("keydown", (event) => this.keyStates[event.key] = true);
    window.addEventListener("keyup", (event) => this.keyStates[event.key] = false);
    setInterval(() => this.createAsteroids(), 2500);


    this.updateAndDraw();
  }
  
  saveRocketData(topX, topY, rightX, rightY, leftX, leftY){
    if (this.#triangleRocket.length > 0){
      let _ = this.#triangleRocket.pop()
    }
    this.#triangleRocket.push({
      topX: topX,
      topY: topY,
      rightX: rightX,
      rightY: rightY,
      leftX: leftX,
      leftY: leftY
    })
    
  }

  drawTriangle() {
    const size = 30;

    this.#context.fillStyle = 'black';
    this.#context.fillRect(0, 0, this.#canvas.width, this.#canvas.height);

    const topX = this.centerX + size * Math.sin(this.angle);
    const topY = this.centerY - size * Math.cos(this.angle);
    const rightX = this.centerX + size * 0.87 * Math.cos(this.angle) - size * 0.5 * Math.sin(this.angle);
    const rightY = this.centerY + size * 0.5 * Math.cos(this.angle) + size * 0.87 * Math.sin(this.angle);
    const leftX = this.centerX - size * 0.87 * Math.cos(this.angle) - size * 0.5 * Math.sin(this.angle);
    const leftY = this.centerY + size * 0.5 * Math.cos(this.angle) - size * 0.87 * Math.sin(this.angle);

    
    this.saveRocketData(topX, topY, rightX, rightY, leftX, leftY)
    this.#context.beginPath();
    this.#context.moveTo(topX, topY);
    this.#context.lineTo(rightX, rightY);
    this.#context.lineTo(leftX, leftY);
    this.#context.closePath();
    this.#context.strokeStyle = 'red'
   
    this.#context.stroke()
    if (this.keyStates["x"] && this.#circles.length < 3){
      this.#circles.push({
        x:topX,
        y:topY,
        radius:5,
        speed:10,
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

      if (this.collsionDetectionAsteroidsRocket(asteroid)){
        this.#asteroids.splice(index, 1);
      }
    
    })
  }

  updateCircles() {
    this.#circles.forEach((circle, index) => 
      {
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
           
         this.#asteroids.forEach((asteroid, aSindex) => {
             
            if(this.collisionDetection(circle, asteroid))
            {
               asteroid.rocketsToBeDestroyed -= 1;

               if(asteroid.rocketsToBeDestroyed === 0){
                 this.#asteroids.splice(aSindex, 1);
                 this.divElementPoints.parsingDiv()
                 this.divElementPoints.incrementPoints(5)
                 this.divElementPoints.display()
                 
               }

               this.#circles.splice(index,1);
               return;
            }

            

          });
         });
  }

  drawCircles(){
    for (let circle of this.#circles){
         this.#context.beginPath();
         this.#context.arc(circle.x, circle.y, circle.radius, 0, 2*Math.PI);
         this.#context.strokeStyle = 'red'
         this.#context.stroke()
    }
  }

  updateTrianglePosition() {
    const moveAmount = 2;
    const rotateAmount = Math.PI / 180 * 2; 

    if (this.keyStates["ArrowUp"]) {
      this.centerY -= moveAmount * Math.cos(this.angle);
      this.centerX += moveAmount * Math.sin(this.angle);
  
      //this.createAsteroids();
    }
    if (this.keyStates["ArrowDown"]) {
      this.centerY += moveAmount * Math.cos(this.angle);
      this.centerX -= moveAmount * Math.sin(this.angle);
    }
    if (this.keyStates["z"]) {
      this.angle -= rotateAmount;
    }
    if (this.keyStates["c"]) {
      this.angle += rotateAmount;
    }
  }

  drawAsteroids(){
    //this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
    for (let asteroid of this.#asteroids){
      this.#context.beginPath()
      this.#context.arc(asteroid.corX, asteroid.corY,asteroid.r, 0, 2*Math.PI)
      this.#context.strokeStyle='green'
      this.#context.strokeText(asteroid.rocketsToBeDestroyed, asteroid.corX, asteroid.corY + asteroid.r/2)
      this.#context.stroke()
      this.#context.closePath()
    }
  }

  createAsteroids(){
    
    for (let i = 0; i<=2 ;i++){
      
    let x = Math.floor(Math.random() * this.#canvas.width) 
    let y = Math.floor(Math.random() * this.#canvas.height) 
    let radius = Math.floor(Math.random() * 20) + 10
    
    this.#asteroids.push({
       corX: x,
       corY: 0,
       r: radius,
       speed: 1,
       angle: this.angle,
       rocketsToBeDestroyed : Math.floor(Math.random() * 4) + 1
    });
    }
    
  }


  collisionDetection(circle, asteroid){
    const asteroidDistanceX = circle.x - asteroid.corX
    const asteroidDistanceY  = circle.y - asteroid.corY

    const distanceSquared = asteroidDistanceX * asteroidDistanceX + asteroidDistanceY * asteroidDistanceY;

    
    const radiiSum = circle.radius + asteroid.r;
    return distanceSquared < radiiSum * radiiSum;
  }

  checkVertexCollision(asteroid){
    let distance1 = Math.sqrt(Math.pow((asteroid.corX-this.#triangleRocket.topX),2) + Math.pow((asteroid.corY-this.#triangleRocket.topY), 2))
    let distance2 = Math.sqrt(Math.pow((asteroid.corX-this.#triangleRocket.rightX),2) + Math.pow((asteroid.corY-this.#triangleRocket.rightY), 2))
    let distance3 = Math.sqrt(Math.pow((asteroid.corX-this.#triangleRocket.leftX),2) + Math.pow((asteroid.corY-this.#triangleRocket.leftY), 2))
    if (distance1 <= asteroid.r || distance2 <= asteroid.r || distance3 <= asteroid.r)
      return true;
    else
       return false;
  }

  collsionDetectionAsteroidsRocket(asteroid){
        let vertexCollision = this.checkVertexCollision(asteroid)
        return vertexCollision
  }


  updateAndDraw() {
   
    this.updateTrianglePosition();
    this.updateCircles();
    this.updateAsteroids();
    
    this.drawTriangle();
    this.drawCircles();
    this.drawAsteroids();
    
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




