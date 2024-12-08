/**
 * 
 * @param {HTMLDivElement}
 */

class DivElementHandle{
  #points;
  #lives;
  #score

  constructor(){
    this.divElement = document.getElementById('pointsDisplay')
    this.divElement2 = document.getElementById('lifeDisplay')
    this.scoreDiv = document.getElementById('scoreDisplay')
    this.#lives = 5;
    this.#points = 0;
    this.#score = 0.0;
  }

  getScore(){
    return this.#score;
  }

  parsingDiv(){
    let text = this.divElement.textContent
    this.#points = parseInt(text.split(":")[1])
    this.#lives = parseInt(this.divElement2.textContent.split(":")[1])
    this.#score = parseFloat(this.scoreDiv.textContent.split(":")[1])
  }

  incrementPoints(numberToBeAdded){
    this.#points += numberToBeAdded
    this.checkForLifeAdding()
  }

  checkForLifeAdding(){
      if(this.#points >= 50)
      {
         this.#lives += 1
         this.#points = 0
      }
        
  }

  addScore(){
    this.#score += (this.#points / 3)
   this.#score= Math.round(this.#score)
  }

  display(){
    this.divElement.textContent = "Points:"+ this.#points 
    this.divElement2.textContent = "Reamining lives: "+ this.#lives
    this.scoreDiv.textContent = "Your score: "+this.#score
  }

  loseLife(){
      this.#lives -= 1;
      this.#score -= 15
  }

  checkForGameEnd(canvas, context)
  {
    if(this.#lives === 0){
        this.#points = 0
        return true;
    }
    return false;
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
  #gameEnd;

  constructor(canvas, context) {
    this.#canvas = canvas;
    this.#context = context;
    this.centerX = this.#canvas.width / 2;
    this.centerY = this.#canvas.height / 2;
    this.angle = 0;
    this.#gameEnd = false;
    this.divElementPoints  = new DivElementHandle()
    this.divElementPoints.display()

    window.addEventListener("keydown", (event) => this.keyStates[event.key] = true);
    window.addEventListener("keyup", (event) => this.keyStates[event.key] = false);
    setInterval(() => this.createAsteroids(), 1000);


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
        speed:15,
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
        this.#gameEnd = this.divElementPoints.checkForGameEnd(this.#canvas, this.#context)
        if (this.#gameEnd === false){
          this.divElementPoints.loseLife()
        
          this.divElementPoints.display()
        }
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
                 this.divElementPoints.addScore()
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
    if (this.keyStates["ArrowLeft"]){
      this.centerX -= moveAmount* Math.cos(this.angle);
    }
    if(this.keyStates["ArrowRight"]){
      this.centerX += moveAmount* Math.cos(this.angle);
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
    let radius = Math.floor(Math.random() * 20) + 15
    
    this.#asteroids.push({
       corX: x,
       corY: 0,
       r: radius,
       speed: Math.floor(Math.random() * 3) + 1,
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

  checkEdgeCollision(asteroid){
    let rocket = this.#triangleRocket[0]
    let edges = [
      {x1:rocket.topX, y1:rocket.topY, x2:rocket.leftX, y2:rocket.leftY},
      {x1:rocket.rightX, y1:rocket.rightY, x2:rocket.leftX, y2:rocket.leftY},
      {x1:rocket.leftX, y1:rocket.leftY, x2:rocket.topX, y2:rocket.topY}
    ]

    for (let edge of edges){
      let distanceX = edge.x2 - edge.x1
      let distanceY = edge.y2 - edge.y1
      let distanceCircleX = asteroid.corX - edge.x1
      let distanceCircleY = asteroid.corY - edge.y1

      let t = (distanceCircleX * distanceX + distanceCircleY * distanceY) / (Math.pow(distanceX,2) + Math.pow(distanceY, 2));

      const modifiedT = Math.max(0, Math.min(1, t));


      const closestX = edge.x1 + modifiedT * distanceX;
      const closestY = edge.y1 + modifiedT * distanceY;

      let distance = Math.sqrt(Math.pow((asteroid.corX-closestX),2) + Math.pow((asteroid.corY-closestY), 2));

      if (distance <= asteroid.r){
        return true;
      }
      
    }

    return false

  }


  collsionDetectionAsteroidsRocket(asteroid){
        let vertexCollision = this.checkVertexCollision(asteroid);
        let edgeCollision = this.checkEdgeCollision(asteroid);
        
        if (vertexCollision || edgeCollision)
          return true;
        else
          return false
  }

  saveScore(score){
    console.log(localStorage)
    let values = []
    let keys = []
    for(let i = 0; i<localStorage.length; i++){
        let key = localStorage.key(i)
        let value = Number(localStorage.getItem(key))
        keys.push(key)
        values.push(value)
    }
  
    let min = Math.min(...values.map(Number));
    if (score > min || localStorage.length < 5){
      let bestScoreHint = document.getElementById('bestScore')
      bestScoreHint.hidden = false
      let nameDisplay = document.getElementById('name')
      nameDisplay.hidden = false
      let nameInput = document.getElementById('nameDiv')
      nameInput.hidden = false
      
      let saveBtn = document.getElementById('saveBtn')
      saveBtn.hidden = false
    
      saveBtn.addEventListener('click', ()=>{
         let index = values.findIndex(value => value === min)
         let keyMin = keys[index]
         let name = nameInput.value;

         if(localStorage.length < 5){
          localStorage.setItem(name, score)
          console.log(`Saved: ${name} - ${score}`);
          console.log(localStorage.length)
        }
        else{
          
          localStorage.removeItem(keyMin)
          localStorage.setItem(name, score)
          console.log(`Replaced: ${keyMin} with ${name} - ${score}`);
          console.log(localStorage.length)
        }
      
        bestScoreHint.hidden = true
        nameDisplay.hidden = true
        nameInput.hidden = true
        saveBtn.hidden = true
      })
      
    }

}

  updateAndDraw() {
      if (this.#gameEnd === false){
      this.updateTrianglePosition();
      this.updateCircles(); 
      this.updateAsteroids();

      this.drawTriangle();
      this.drawCircles();
      this.drawAsteroids();
      requestAnimationFrame(() => this.updateAndDraw());
    }
    else{
      this.#context.clearRect(0, 0, this.#canvas.width, this.#canvas.height); 
      //console.log("Game over amigo")
      let divGameOver = document.getElementById('gameOver')
      divGameOver.hidden = false;
      let restartBtn = document.getElementById('restartGame')
      restartBtn.hidden = false
      let score = this.divElementPoints.getScore()
      this.saveScore(score)
      restartBtn.addEventListener('click', ()=>{
        const canvas = document.getElementById('canvas-page');
        const context = canvas.getContext('2d');
        let newgame = new AsteroidsGame(canvas, context)
        newgame.createCanvas()
        divGameOver.hidden = true
        restartBtn.hidden = true
      })
   
    }
   
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
   this.#triangleRocket = new TriangleRocket(this.#canvas, this.#context);
    
}

}
