let logs = {}
const bounceFn = (num, absolute, ratio) => {
    let [value, sign] = [Math.abs(num), Math.sign(num)];
    let newValue = value - Math.max(absolute, value * ratio);
    return newValue < 0 ? 0 : newValue * -sign;
}
/* ---------- ---------- ---------- -------- ---------- ---------- ---------- */
const canvasElement = document.querySelector("canvas");
const cx = canvasElement.getContext("2d");
canvasElement.width = 1200;
canvasElement.height = 600;

const canvas = {};
canvas.pxPm = 50;
canvas.color = "#f1f1f1"
canvas.width = canvasElement.width / canvas.pxPm;
canvas.height = canvasElement.height / canvas.pxPm;
canvas.draw = (color = "green", args = [0, 0, 1, 1]) => {
    cx.fillStyle = color;
    let { pxPm, height } = canvas;
    args = args.map(arg => arg * pxPm)
    cx.fillRect(args[0], height * pxPm - args[1], args[2], -args[3])
}
canvas.refresh = () => canvas.draw(canvas.color, [0, 0, canvas.width, canvas.height])

class Vector {
    static sum(vectors) {
        let [x, y] = [0, 0];
        for (const vector of vectors) { x += vector.x; y += vector.y; }
        return new Vector(x, y)
    }
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    get length() { return Math.hypot(this.x, this.y) }
    get angle() { return Math.atan2(this.y, this.x) }
    get rad() { return this.angle / Math.PI }
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

    fixedTo(n) { return new Vector((this.x).toFixed(n), (this.y).toFixed(n)) }
}

let frameRate = 60;
let gForce = new Vector(0, -10)
class Rectangle {
    forces = {
        gravity: gForce,
        user: new Vector(),
        counter: new Vector(),
    };
    totalForce = new Vector();
    acceleration = new Vector();
    energy = {};
    constructor() {
        this.size = new Vector(1, 1);
        this.velocity = new Vector(5, 25);
        this.position = new Vector(0, 10);
        this.density = 1;
        this.elasticity = 0.4;
        this.color = "#111";
        this.area = this.size.x * this.size.y;
        this.mass = this.area * this.density;
    }
    draw() { canvas.draw(this.color, [...this.position.values, ...this.size.values]) }
    bounceX() { this.velocity.x = bounceFn(this.velocity.x, 0.01, 1 - this.elasticity); }
    bounceY() { this.velocity.y = bounceFn(this.velocity.y, 0.01, 1 - this.elasticity); }


    canvasCollision() {
        let { position, totalForce, velocity, size } = this;

        let leftBorder = position.x
        let bottomBorder = position.y
        let rightBorder = position.x + size.x
        let topBorder = position.y + size.y

        let leftTouch = leftBorder <= 0;
        let bottomTouch = bottomBorder <= 0;
        let rightTouch = rightBorder >= canvas.width;
        let topTouch = topBorder >= canvas.height;

        let leftSink = leftBorder < 0;
        let bottomSink = bottomBorder < 0;
        let rightSink = rightBorder > canvas.width;
        let topSink = topBorder > canvas.height;

        let rightLimit = canvas.width - size.x;
        let topLimit = canvas.height - size.y;

        let leftGoing = velocity.x < 0;
        let rightGoing = velocity.x > 0;
        let bottomGoing = velocity.y < 0;
        let topGoing = velocity.y > 0;

        //      overflow
        // position correction
        if (leftSink) { position.x = 0; }
        if (rightSink) { position.x = rightLimit; }
        if (bottomSink) { position.y = 0; }
        if (topSink) { position.y = topLimit; }

        // velocity correction
        if (leftTouch && leftGoing) { velocity.x = 0 }
        if (rightTouch && rightGoing) { velocity.x = 0 }
        if (bottomTouch && bottomGoing) { velocity.y = 0 }
        if (topTouch && topGoing) { velocity.y = 0 }

    }
    mainCalculations() {
        let { position, totalForce, velocity, size } = this;

        this.forces.counter.set([0, 0])
        let activeForce = Vector.sum([this.forces.gravity, this.forces.user])
        if (activeForce.y < 0 && position.y <= 0) { this.forces.counter.y = -activeForce.y };
        if (activeForce.y > 0 && position.y + size.y >= canvas.height) { this.forces.counter.y = -activeForce.y };
        if (activeForce.x < 0 && position.x <= 0) { this.forces.counter.x = -activeForce.x };
        if (activeForce.x > 0 && position.x + size.x >= canvas.width) { this.forces.counter.x = -activeForce.x };
        // this.forces.counter.y =  (activeForce.y < 0 && position.y <= 0) ? -activeForce.y : 0;

        this.totalForce = Vector.sum(Object.values(this.forces))
        this.acceleration = this.totalForce.divideTo(this.mass)
        this.velocity.add(this.acceleration.divideTo(frameRate))
        this.position.add(this.velocity.divideTo(frameRate))
    }
    update() {
        this.mainCalculations()
        this.canvasCollision()
        this.draw()
    }
    renderInfo() {
        let { position, velocity, acceleration, forces: { gravity, user }, totalForce } = this;
        let items = { position, velocity, acceleration, gravity, user, totalForce }

        for (const name in items) {
            const vector = items[name].fixedTo(3);
            document.querySelector(`.r1>.row.${name}>.x`).innerText = vector.x
            document.querySelector(`.r1>.row.${name}>.y`).innerText = vector.y
        }
    }
}

let r1 = new Rectangle();

let framesCount = 0;
let frameLimit = 0;
function animate() {
    canvas.refresh()
    r1.update()
    r1.renderInfo()
    if (frameLimit && framesCount > frameLimit) { return }
    window.requestAnimationFrame(animate)
}
animate()

let keyValue = 15;
document.body.addEventListener("keydown", (e) => {
    if (e.key == " ") { r1.velocity.set([0, 0]) }
    if (e.key == "a") { r1.forces.user.x = -keyValue }
    if (e.key == "d") { r1.forces.user.x = +keyValue }
    if (e.key == "s") { r1.forces.user.y = -keyValue }
    if (e.key == "w") { r1.forces.user.y = +keyValue }
})
document.body.addEventListener("keyup", (e) => {
    if (e.key == "a") { r1.forces.user.x = 0 }
    if (e.key == "d") { r1.forces.user.x = 0 }
    if (e.key == "s") { r1.forces.user.y = 0 }
    if (e.key == "w") { r1.forces.user.y = 0 }
})

