
const canvas=document.querySelector('#canvas');
const c= canvas.getContext('2d');

canvas.width=innerWidth;
canvas.height=innerHeight;

const scoreEL = document.querySelector('#scoreEL')
const stageEL = document.querySelector('#stageEL')
const timeLeft = document.querySelector('#timeLeft')

const startGameBtn = document.querySelector('#startGameBtn')
const nextStageBtn = document.querySelector('#nextStageBtn')
const regameBtn = document.querySelector('#regameBtn')
const returnToMainBtn = document.querySelectorAll('#returnToMainBtn')

const modalStartGame = document.querySelector('#modalStartGame')
const modalNextStage = document.querySelector('#modalNextStage')
const modalRegame = document.querySelector('#modalRegame')
const modalAllClear = document.querySelector('#modalAllClear')

const bigScoreEL = document.querySelectorAll('#bigScoreEL')

// classes
class Player{
  constructor(x,y,radius,color,speed){
    this.x=x
    this.y=y
    this.radius=radius
    this.color=color
    this.speed=speed
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    c.fillStyle=this.color
    c.fill()
  }
}

class Projectile{
  constructor(x,y,radius,color,velocity){
    this.x=x
    this.y=y
    this.radius=radius
    this.color=color
    this.velocity=velocity
  }
  draw(){
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    c.fillStyle=this.color
    c.fill()
  }

  update(){
    this.draw()
    this.x=this.x+this.velocity.x
    this.y=this.y+this.velocity.y
  }
}

class Enemy{
  constructor(x,y,radius,color,velocity){
    this.x=x
    this.y=y
    this.radius=radius
    this.color=color
    this.velocity=velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    c.fillStyle=this.color
    c.fill()
  }

  update(){
    this.draw()
    this.x=this.x+this.velocity.x
    this.y=this.y+this.velocity.y
  }
}

const friction = 0.99
class Particle{
  constructor(x,y,radius,color,velocity){
    this.x=x
    this.y=y
    this.radius=radius
    this.color=color
    this.velocity=velocity
    this.alpha=1
  }

  draw() {
    c.save()
    c.globalAlpha=this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    c.fillStyle=this.color
    c.fill()
    c.restore()
  }

  update(){
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x=this.x+this.velocity.x
    this.y=this.y+this.velocity.y
    this.alpha-=0.01
  }
}

class Obstacle{
  constructor(x,y,width,height,color){
    this.x=x
    this.y=y
    this.width=width
    this.height=height
    this.color=color
  }

  draw(){
    c.beginPath()
    c.fillStyle=this.color
    c.fillRect(this.x,this.y,this.width,this.height)
  }

}

// variables
let player=null
let projectiles=[]
let enemies=[]
let particles=[]
let obstacles=[]

let pressedKey=[]
let score=0
let stage=1
let time

const stageData={
  1:{
    endureSec : 20,
    enemySpeed : 1.5,
    enemySpawnRate : 40,
    obstacle : 0
  },
  2:{
    endureSec : 30,
    enemySpeed : 2,
    enemySpawnRate : 35,
    obstacle : 3
  },
  3:{
    endureSec : 40,
    enemySpeed : 2.3,
    enemySpawnRate : 30,
    obstacle : 4
  },
  4:{
    endureSec : 40,
    enemySpeed : 2.5,
    enemySpawnRate : 28,
    obstacle : 5
  },
}

// functions
function initObject(){
  player=new Player(canvas.width/2,canvas.height/2,10,'white',3)
  projectiles=[]
  enemies=[]
  particles=[]
  obstacles=[]
}

function initScore(){
  score = 0
  stage = 1
  scoreEL.innerHTML=score
  bigScoreEL.forEach((el)=>{
    el.innerHTML=score
  })
}

let animationId
function animate(){
  animationId = requestAnimationFrame(animate)
  c.fillStyle='rgba(0,0,0,0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  
  // player movement
  if(pressedKey.length >= 1 && player!==null){
    if(pressedKey.length >= 2){
      if(
        (pressedKey[0]=='a' && pressedKey[1]=='w') ||
        (pressedKey[0]=='w' && pressedKey[1]=='a')
      ){
        player.x -= Math.cos(Math.PI/4) * player.speed
        player.y -= Math.sin(Math.PI/4) * player.speed
      }
      else if(
        (pressedKey[0]=='w' && pressedKey[1]=='d') ||
        (pressedKey[0]=='d' && pressedKey[1]=='w')
      ){
        player.x += Math.cos(Math.PI/4) * player.speed
        player.y -= Math.sin(Math.PI/4) * player.speed
      }
      else if(
        (pressedKey[0]=='d' && pressedKey[1]=='s') ||
        (pressedKey[0]=='s' && pressedKey[1]=='d')
      ){
        player.x += Math.cos(Math.PI/4) * player.speed
        player.y += Math.sin(Math.PI/4) * player.speed
      }
      else if(
        (pressedKey[0]=='s' && pressedKey[1]=='a') ||
        (pressedKey[0]=='a' && pressedKey[1]=='s')
      ){
        player.x -= Math.cos(Math.PI/4) * player.speed
        player.y += Math.sin(Math.PI/4) * player.speed
      }
    } else{
      if(pressedKey[0]=='a'){
        player.x -= player.speed
      }
      else if(pressedKey[0]=='w'){
        player.y -= player.speed
      }
      else if(pressedKey[0]=='s'){
        player.y += player.speed
      }
      else if(pressedKey[0]=='d'){
        player.x +=player.speed
      }
    }
    
    // limit within the canvas
    if(player.x - player.radius < 0){
      player.x=player.radius
    }
    if(player.x + player.radius > canvas.width){
      player.x=canvas.width-player.radius
    }
    if(player.y - player.radius < 0){
      player.y=player.radius
    }
    if(player.y + player.radius > canvas.height){
      player.y=canvas.height-player.radius
    }
  }

  // time left
  if(player!==null && animationId % 12 == 0){
    time-=0.1
    timeLeft.innerHTML=Math.abs(time).toFixed(1)
    console.log(animationId)
  }

  // obstacles
  obstacles.forEach((obstacle)=>{
    obstacle.draw()

    // cannot go across obstacles
    if(player!==null && obstacle.x - player.radius < player.x && player.x < obstacle.x + obstacle.width + player.radius && obstacle.y - player.radius < player.y && player.y < obstacle.y + obstacle.height + player.radius){
      if(player.x + player.radius <= obstacle.x + player.speed){
        player.x=obstacle.x-player.radius
      }
      if(player.x - player.radius >= obstacle.x + obstacle.width - player.speed){
        player.x=obstacle.x+obstacle.width+player.radius
      }
      if(player.y + player.radius <= obstacle.y + player.speed){
        player.y=obstacle.y-player.radius
      }
      if(player.y - player.radius >= obstacle.y + obstacle.height - player.speed){
        player.y=obstacle.y+obstacle.height+player.radius
      }
    }
  })

  if(player!==null){
    player.draw()
  }

  // update particle
  particles.forEach((particle, idx)=>{
    if(particle.alpha < 0){
      particles.splice(idx, 1)
    } else{
      particle.update()
    }
  })

  // remove projectile
  projectiles.forEach((projectile, idx)=>{
    projectile.update()

    if(
      projectile.x + projectile.radius > canvas.width || 
      projectile.x - projectile.radius < 0 ||
      projectile.y + projectile.radius > canvas.height ||
      projectile.y - projectile.radius < 0
      ){
      setTimeout(() => {
        projectiles.splice(idx,1)
      }, 0);
    }

    obstacles.forEach((obstacle)=>{
      if(obstacle.x - projectile.radius < projectile.x && projectile.x < obstacle.x + obstacle.width + projectile.radius && obstacle.y - projectile.radius < projectile.y && projectile.y < obstacle.y + obstacle.height + projectile.radius){
        projectiles.splice(idx, 1)
      }
    })
  })

  // spawn enemies
  if(animationId % stageData[stage].enemySpawnRate === 0){
    setTimeout(()=>{
      const radius=Math.random() * (30-4) + 10
      let x
      let y
    
      if (Math.random() < 0.5){
        x=Math.random() < 0.5 ? 0-radius : canvas.width+radius
        y=Math.random() * canvas.height
      }
      else{
        x=Math.random() * canvas.width
        y=Math.random() < 0.5 ? 0-radius : canvas.height+radius
      }
      
      const color=`hsl(${Math.random() * 360}, 50%, 50%)`

      let angle
      if(x <= 0){
        angle=Math.atan2(Math.random() - 0.5, Math.random())
      } else if(x >= canvas.width){
        angle=Math.atan2(Math.random() - 0.5, -Math.random())
      } else if(y <= 0){
        angle=Math.atan2(Math.random(), Math.random() - 0.5)
      } else{
        angle=Math.atan2(-Math.random(), Math.random() - 0.5)
      }

      const r=Math.random() * (0.8) + (stageData[stage].enemySpeed - 0.4)
      const velocity={
        x:Math.cos(angle) * r,
        y:Math.sin(angle) * r
      }
      
      enemies.push(new Enemy(x,y,radius,color, velocity))
    }, 0)
  }
  
  enemies.forEach((enemy, idx)=>{
    enemy.update()

    if(player==null){
      return
    }
    // end game
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
    if(dist - enemy.radius - player.radius < 0){
      for(let i=0;i<player.radius*4;i++){
        particles.push(new Particle(player.x, player.y, Math.random() * 2, player.color, {
          x: (Math.random() - 0.5) * Math.random() * 6,
          y: (Math.random() - 0.5) * Math.random() * 6
        }))
      }

      player=null

      bigScoreEL.forEach((el)=>{
        el.innerHTML=score
      })

      setTimeout(() => {
        modalRegame.style.display='flex'
      }, 3000);
    }

    // hit enemy
    projectiles.forEach((projectile, pidx)=>{
      const dist=Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      if (dist - enemy.radius - projectile.radius < 0){
        for(let i=0;i<enemy.radius*2;i++){
          particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
            x: (Math.random() - 0.5) * Math.random() * 6,
            y: (Math.random() - 0.5) * Math.random() * 6
          }))
        }
        
        if(enemy.radius - 10 > 7){
          score += 100
          scoreEL.innerHTML=score

          gsap.to(enemy, {
            radius: enemy.radius-10
          })
          setTimeout(() => {
            projectiles.splice(pidx,1)
          }, 0);
        } else{
          score += 250
          scoreEL.innerHTML=score

          setTimeout(() => {
            enemies.splice(idx,1)
            projectiles.splice(pidx,1)
          }, 0);
        }
      }
    })

  })

  enemies.forEach((enemy, idx)=>{
    if(
      enemy.x - enemy.radius > canvas.width+5 || 
      enemy.x + enemy.radius < -5 ||
      enemy.y - enemy.radius > canvas.height+5 ||
      enemy.y + enemy.radius < -5
      ){
        setTimeout(() => {
          enemies.splice(idx,1)
        }, 0);
      }
  })

  // clear stage
  if(player!==null && time<=0.05){
    player=null
    bigScoreEL.forEach((el)=>{
      el.innerHTML=score
    })
    
    if(stage+1 in stageData){
      modalNextStage.style.display='flex'
    } else{
      modalAllClear.style.display='flex'
    }
  }
}

function setObstacle(){
  for(let i=0;i<stageData[stage].obstacle;i++){
    const width = Math.random() * (300 - 10) + 40
    const height = Math.random() * (300 - 10) + 40
    const x = Math.random() * canvas.width - 50
    const y = Math.random() * canvas.height - 30
    const color = 'hsl(0,0%,50%)'
    obstacles.push(new Obstacle(x,y,width,height,color))
  }
}

// event listener
window.addEventListener('keydown', (e)=>{
  if(
    e.key=='a' || e.key=='A' ||
    e.key=='w' || e.key=='W' ||
    e.key=='s' || e.key=='S' ||
    e.key=='d' || e.key=='D'
    ){
      if(!pressedKey.includes(e.key.toLowerCase())){
        pressedKey.unshift(e.key.toLowerCase())
      }
    }
})

window.addEventListener('keyup', (e)=>{
  const idx=pressedKey.indexOf(e.key.toLowerCase())
  if(idx!==-1){
    pressedKey.splice(idx, 1)
  }
})

window.addEventListener('mousedown', (e)=>{
  if(e.button===0 && player!==null){
    const angle=Math.atan2(
      e.clientY-player.y,
      e.clientX-player.x
    )
    const velocity={
      x:Math.cos(angle) * 5,
      y:Math.sin(angle) * 5
    }

    projectiles.push(new Projectile(player.x, player.y, 5, 'red', velocity))
  }
})

startGameBtn.addEventListener('click', ()=>{
  cancelAnimationFrame(animationId)
  stage=1
  stageEL.innerHTML=stage
  time=stageData[stage].endureSec
  scoreEL.parentElement.classList.toggle('hidden')
  stageEL.parentElement.classList.toggle('hidden')
  timeLeft.parentElement.classList.toggle('hidden')
  initObject()
  initScore()
  setObstacle()
  animate()
  
  modalStartGame.style.display='none'
})

nextStageBtn.addEventListener('click', ()=>{
  cancelAnimationFrame(animationId)
  stage+=1
  stageEL.innerHTML=stage
  time=stageData[stage].endureSec
  initObject()
  setObstacle()
  animate()
  modalNextStage.style.display='none'
  
})

regameBtn.addEventListener('click', ()=>{
  cancelAnimationFrame(animationId)
  stage=1
  stageEL.innerHTML=stage
  time=stageData[stage].endureSec
  initObject()
  initScore()
  setObstacle()
  animate()
  modalRegame.style.display='none'
})

returnToMainBtn.forEach(el=>{
  el.addEventListener('click', ()=>{
    cancelAnimationFrame(animationId)
    modalAllClear.style.display='none'
    modalRegame.style.display='none'
    modalNextStage.style.display='none'
    main()
  })
})

function main(){
  initObject()
  initScore()
  player=null
  scoreEL.parentElement.classList.add('hidden')
  stageEL.parentElement.classList.add('hidden')
  timeLeft.parentElement.classList.add('hidden')
  animate()
  modalStartGame.style.display='flex'
}

main()
