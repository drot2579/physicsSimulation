const PI = Math.PI
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
/* TO-DO: TURN MINI ARROWS TO MATCH DIRECTION    */
const el = {
    vectorTable: document.querySelector(".vectorTable"),
    velocityArrow: document.querySelector(".velocityArrow")
}
const anim = {
    frame: { count: 0, rate: 60 },
}
const env = {
    gForce: { x: 0, y: 10 },
    friction: { coeffs: { air: 1, ground: 6 } },
}

class Cube {
    mass = 1
    forces = { user: { x: 0, y: 0 }, }
    totalForce = { x: 0, y: 0 }
    acclrtn = { x: 0, y: 0 }
    velocity = { x: 0, y: 0 }
    position = { x: 0, y: 0 }
    length = 20
    width = this.length
    height = this.length
    get altitude() { return canvas.height - this.height - this.position.y }

    receiveForce(name, amount = { x: 0, y: 0 }) { this.forces[name] = amount }
    renderVectorInfo() {
        let vectorNames = ["totalForce", "acclrtn", "velocity", "position",]
        let vectorMap = vectorNames.map((name) => {
            return [name, {
                x: document.querySelector(`.${name} .vectorX`),
                y: document.querySelector(`.${name} .vectorY`),
                arrowX: document.querySelector(`.${name} .arrowX`),
                arrowY: document.querySelector(`.${name} .arrowY`),
            }]
        })
        let vectorEl = Object.fromEntries(vectorMap)
        for (const name of vectorNames) {
            let el = vectorEl[name]
            let value = this[name]

            el.x.innerText = value.x.toFixed(1)
            let yInversed = -value.y
            el.y.innerText = yInversed.toFixed(1)
/* FIX-ME:  */
            if (value.x > 0) { el.x.classList.add("positive"), el.x.classList.remove("negative"), el.arrowX.classList.remove("otherDirection") }
            if (value.x < 0) { el.x.classList.remove("positive"), el.x.classList.add("negative"), el.arrowX.classList.add("otherDirection") }
            if (value.x == 0) { el.x.classList.remove("positive"), el.x.classList.remove("negative") }

            if (yInversed > 0) { el.y.classList.add("positive"), el.y.classList.remove("negative"), el.arrowY.classList.remove("otherDirection") }
            if (yInversed < 0) { el.y.classList.remove("positive"), el.y.classList.add("negative"), el.arrowY.classList.remove("otherDirection") }
            if (yInversed == 0) { el.y.classList.remove("positive"), el.y.classList.remove("negative") }

        }
    }

    turnArrow() {
        let { x, y } = this.velocity
        y *= -1
        let hip = Math.hypot(x, y)
        let radian = Math.asin(y / hip)
        let deg = (radian / PI) * 180
        if(x < 0){deg = 180 - deg}
        el.velocityArrow.style.rotate = -deg + "deg"
        el.velocityArrow.style.fontSize = hip + "px"
    


    }

    constructor(color) {
        this.color = color
    }
    get willOverflow() { return this.position.y + this.velocity.y + this.height > canvas.height; }
    land() {
        this.position.y = canvas.height - this.height
        this.velocity.y = 0
    }
    brake() {
        this.velocity.y = this.velocity.x = this.acclrtn.x = this.acclrtn.y = 0
    }
    free() {
        let forces = this.forces
        for (const forceName in forces) {
            const force = forces[forceName]
            force.x = force.y = 0
        }
    }

    preventOverflow() {
        let willOverflow = this.position.y + this.height + (this.velocity.y / anim.frame.rate) > canvas.height;
        if (willOverflow) { this.land() };
    }
    counterForce() {
        if (this.altitude == 0 && this.totalForce.y > 0) {
            this.receiveForce("counter", { x: 0, y: -this.totalForce.y })
        }
    }
    draw() {
        drawCanvas()
        cx.fillStyle = this.color
        cx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    handleFriction() { let ground = this.forces.counter * env.friction.coeffs.ground }

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
        this.acclrtn.x = this.totalForce.x / this.mass
        this.acclrtn.y = this.totalForce.y / this.mass
        /* ----------  -------- ---------- ---------- ----------*/
        this.velocity.x += this.acclrtn.x / anim.frame.rate
        this.velocity.y += this.acclrtn.y / anim.frame.rate
        this.position.x += this.velocity.x / anim.frame.rate
        this.position.y += this.velocity.y / anim.frame.rate
        this.preventOverflow()
        this.counterForce()
    }
    update() {
        this.draw()
        this.updatePhys()
        this.renderVectorInfo()
        this.turnArrow()
    }
}

const cube = new Cube("green")
cube.receiveForce("gravity", env.gForce)


function animate() {
    anim.frame.count++
     window.requestAnimationFrame(animate)
    cube.update()
}

animate()

document.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", 1, 2, 3, 4, "b", "f"].includes(e.key)) { e.preventDefault() }
    console.log(e.key);

    if (e.key == "a") { cube.forces.user.x-- }
    if (e.key == "d") { cube.forces.user.x++ }
    if (e.key == "w") { cube.forces.user.y-- }
    if (e.key == "s") { cube.forces.user.y++ }

    if (e.key == "ArrowLeft") { cube.velocity.x += -10 }
    if (e.key == "ArrowRight") { cube.velocity.x += +10 }
    if (e.key == "ArrowUp") { cube.velocity.y += -10 }
    if (e.key == "ArrowDown") { cube.velocity.y += +10 }

    if (e.key == "b") { cube.brake() }
    if (e.key == "f") { cube.free() }

    if (e.key == "1") { console.time("timer1") }
    if (e.key == "2") { console.timeEnd("timer1") }
    if (e.key == "3") { console.time("timer2") }
    if (e.key == "4") { console.timeEnd("timer2") }
})

// 2PI = 360deg
// PI = 180deg