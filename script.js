let ones = { add(name) { ones[name] = 1 }, kill(name) { ones[name] = 0 } }
const PI = Math.PI
let loglist = {}
/* ---------- ---------- ---------- -------- ---------- ---------- ---------- */
const canvas = document.querySelector("canvas");
const cx = canvas.getContext("2d");
let canvasWidth = 1200;
let canvasHeight = 600;
let canvasColor = "#f1f1f1"
canvas.width = canvasWidth;
canvas.height = canvasHeight;
let pxPm = 10;
let canvasWidthMeter = canvasWidth / pxPm;
let canvasHeightMeter = canvasHeight / pxPm;
const draw = (color = "green", args = [0, 0, 1, 1]) => {
    cx.fillStyle = color;
    args.forEach((arg, idx) => args[idx] = arg * pxPm)
    cx.fillRect(args[0], canvasHeight - args[1], args[2], -args[3])
}
const refreshCanvas = () => draw(canvasColor, [0, 0, canvasWidth, canvasHeight])
class Vector {
    static sum(vectors) {
        let [x, y] = [0, 0];
        for (const vector of vectors) { x += vector.x; y += vector.y; }
        return new Vector(x, y)
    }
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    get length() { return Math.hypot(this.x, this.y) }
    get angle() { return Math.atan2(this.y, this.x) }
    get rad() { return this.angle / PI }
    get deg() { return this.rad * 180 }

    get values() { return [this.x, this.y] }
    get entries() { return { x: this.x, y: this.y } }

    set(xy) { let [x, y] = Object.values(xy); this.x = x; this.y = y; }
    add(xy) { let [x, y] = Object.values(xy); this.x += x; this.y += y; }
    subtract(xy) { let [x, y] = Object.values(xy); this.x -= x; this.y -= y; }

    addTo(xy) { let [x, y] = Object.values(xy); return new Vector(this.x + x, this.y + y) }
    subtractTo(xy) { let [x, y] = Object.values(xy); return new Vector(this.x - x, this.y - y) }

    multiply(num) { this.x *= num; this.y *= num; }
    multiplyTo(n) { return new Vector(this.x * n, this.y * n) }
    divide(num) { this.x /= num; this.y /= num; }
    divideTo(n) { return new Vector(this.x / n, this.y / n) }
}

let frameRate = 60;
let gForce = new Vector(0, -10)
class Rectangle {
    forces = [gForce];
    totalForceReceived = new Vector();
    acceleration = new Vector();
    energy = {};
    constructor() {
        this.size = new Vector(1, 1);
        this.velocity = new Vector(5, 25);
        this.position = new Vector(0, 10);
        this.density = 1;
        this.elasticity = 0.4;
        this.color = "#111";
        this.volume = this.size.x * this.size.y;
        this.mass = this.volume * this.density;
    }
    draw() {draw(this.color, [...this.position.values, ...this.size.values])}
    bounceX() { this.velocity.x *= -this.elasticity }
    bounceY() { this.velocity.y *= -this.elasticity }
    canvasCollision() {
        if (this.position.y < 0) { this.position.y = 0; this.bounceY() }
        if (this.position.x < 0) { this.position.x = 0; this.bounceX(); }
        if (this.position.y + this.size.y > canvasHeightMeter) {
            this.position.y = canvasHeightMeter - this.size.y; this.bounceY();
        }
        if (this.position.x + this.size.x > canvasWidth / pxPm) {
            this.position.x = canvasWidth / pxPm - this.size.x; this.bounceX();
        }
    }
    mainCalculations() {
        this.totalForceReceived = Vector.sum(this.forces)
        this.acceleration = this.totalForceReceived.divideTo(this.mass)
        this.velocity.add(this.acceleration.divideTo(frameRate))
        this.position.add(this.velocity.divideTo(frameRate))
    }
    update() {
        this.mainCalculations()
        this.draw()
        this.canvasCollision()
    }
}

let r1 = new Rectangle();
let r2 = new Rectangle()
r2.color = "#2020aa";
r2.size.set([3, 5])

function animate() {
    refreshCanvas()
    window.requestAnimationFrame(animate)
    r1.update()
    r2.update()
}
animate()

let keyVelocity = 10;
document.body.addEventListener("keydown", (e) => {
    console.log(e.key);
    if (e.key == "a") { r1.velocity.add([-keyVelocity, 0]) }
    if (e.key == "d") { r1.velocity.add([+keyVelocity, 0]) }
    if (e.key == "s") { r1.velocity.add([0, -keyVelocity]) }
    if (e.key == "w") { r1.velocity.add([0, +keyVelocity]) }
    if (e.key == " ") { r1.velocity.set([0, 0]) }
})


