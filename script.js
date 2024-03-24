const canvas = document.querySelector("canvas")
const cx = canvas.getContext("2d")
canvas.width = 1280
canvas.height = 720
canvas.color = "black"
function drawCanvas() {
  cx.fillStyle = canvas.color
  cx.fillRect(0, 0, canvas.width, canvas.height)
}
drawCanvas()
/* ---------- ----------> CANVAS CREATED <---------- ---------- */

const el = { infoCont: document.querySelector(".infoCont") }

const anim = {
  frame: { count: 0, rate: 60 },
  wait: {duration:1,isActive: false}
}

const env = {
  gForce: {x:0,y:10},
  friction: { coeffs: { air: 1, ground: 6 } },
  timeCoef: 1
}

class Cube {
  forces = {
    user: { x: 0, y: 0 }
  }
  totalForce = { x: 0, y: 0 }
  receiveForce(name, amount = { x: 0, y: 0 }) {
    this.forces[name] = amount
  }
  mass = 1
  accel = { x: 0, y: 0 }
  veloc = { x: 0, y: 0 }
  posit = { x: 0, y: 0 }
  get altit() { return canvas.height - this.height - this.posit.y }
  title = { x: "X", y: "Y" }
  len = 20
  width = this.len
  height = this.len

  displayList = [
    { propName: "totalForce", displayName: "total force", display: "xy", },
    { propName: "accel", displayName: "accelaration", display: "xy", },
    { propName: "veloc", displayName: "velocity", display: "xy", },
    { propName: "posit", displayName: "position", display: "xy", },
    { propName: "altit", displayName: "altitude", display: "s", },
    { propName: "mass", displayName: "mass", display: "s", },
  ];

  genDispEls() {
    let div = document.createElement("div")
    div.append(...(["properties", "x", "y"].map(str => {
      return document.createElement("span").innerText = str
    })))
    el.infoCont.append(div)
    this.displayList.forEach(dispObj => {
      let wrapDiv = document.createElement("div")
      let [nameSpan, xSpan, ySpan] = [1, 2, 3].map(() => document.createElement("span"))
      nameSpan.innerText = dispObj.displayName
      dispObj.els = { nameSpan, xSpan, ySpan }
      wrapDiv.append(nameSpan, xSpan, ySpan)
      el.infoCont.append(wrapDiv)
    })
  }
  uptdDispEls() {
    this.displayList.forEach((dispObj) => {
      let prop = this[dispObj.propName]
      if (dispObj.display == "xy") {
        dispObj.els.xSpan.innerText = prop.x.toFixed(1)
        dispObj.els.ySpan.innerText = prop.y.toFixed(1)
      }
      if (dispObj.display == "s") {
        dispObj.els.ySpan.innerText = prop.toFixed(1)
      }
    })
  }

  constructor(color) {
    this.clr = color
  }
  get willOverflow() {
    return this.posit.y + this.veloc.y + this.height > canvas.height;
  }
  land() {
    this.posit.y = canvas.height - this.height
    this.veloc.y = 0
  }

  preventOverflow() {
    let willOverflow = 
    this.posit.y + this.height + (this.veloc.y / anim.frame.rate) > canvas.height;
    if (willOverflow) { this.land() };
  }
  keepGround() {
    // if (this.altit == 0 && this.totalForce.y > 0) { 
    //   this.veloc.y = 0; this.accel.y = 0; this.totalForce.y = 0; }
  }

  counter() {
    if (this.altit == 0 && this.totalForce.y > 0) {
      this.receiveForce("counter",{x:0,y:this.totalForce})
    } 
    
  }

  draw() {
    drawCanvas()
    cx.fillStyle = this.clr
    cx.fillRect(this.posit.x, this.posit.y, this.width, this.height)
  }

  setNewTotalForce() {
    let newForce = { x: 0, y: 0 }
    for (const force in this.forces) {
      newForce.x += this.forces[force].x
      newForce.y += this.forces[force].y
    }
    this.totalForce.x = newForce.x
    this.totalForce.y = newForce.y
  }
  updatePhys() {
    this.setNewTotalForce()
    this.accel.x = this.totalForce.x / this.mass
    this.accel.y = this.totalForce.y / this.mass
    /* ----------  -------- ---------- ---------- ----------*/
    this.veloc.x += this.accel.x / anim.frame.rate
    this.veloc.y += this.accel.y / anim.frame.rate
    this.posit.x += this.veloc.x / anim.frame.rate
    this.posit.y += this.veloc.y / anim.frame.rate
    this.preventOverflow()
    this.keepGround()
  }

  update() {
    this.draw()
    this.updatePhys()
    cube.uptdDispEls()
  }

}

const cube = new Cube("green")
cube.genDispEls()
cube.receiveForce("gravity",env.gForce)


function animate() {
  anim.frame.count++
  anim.wait.isActive ? setTimeout(() => {
    window.requestAnimationFrame(animate)
  }, anim.wait) : window.requestAnimationFrame(animate)
  
  cube.update()
}

animate()



document.addEventListener("keydown", (e) => {
  e.preventDefault()
  console.log(e.key);
  if (e.key == "a") { cube.forces.user.x-- }
  if (e.key == "d") { cube.forces.user.x++ }
  if (e.key == "w") { cube.forces.user.y-- }
  if (e.key == "s") { cube.forces.user.y++ }

  if (e.key == "ArrowLeft") { cube.veloc.x += -10 }
  if (e.key == "ArrowRigt") { cube.veloc.x += +10 }
  if (e.key == "ArrowUp") { cube.veloc.y += -10 }
  if (e.key == "ArrowDown") { cube.veloc.y += +10 }
})




