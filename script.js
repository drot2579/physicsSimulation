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
canvas.pxPm = 5;
canvas.color = "#f1f1f108"
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
let fricCoef = {
    air: -0.1,
    surface: -0.4
}
class Rectangle {
    activeForces = {
        gravity: gForce,
        user: new Vector(),
    };
    passiveForces = {
        counter: new Vector(),
        surfaceFriction: new Vector(),
        airFriction: new Vector(),
    }
    totalForce = new Vector();
    acceleration = new Vector();
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
    stopX() { this.velocity.x = 0; }
    stopY() { this.velocity.y = 0; }
    stop() { this.velocity.set([0, 0]) }
    bounceX() { this.velocity.x = bounceFn(this.velocity.x, 0.01, 1 - this.elasticity); }
    bounceY() { this.velocity.y = bounceFn(this.velocity.y, 0.01, 1 - this.elasticity); }
    calculate() {

        //#region ---------- ---------- ----------* destructure *---------- ----------|
        let { position, totalForce, velocity, size,
            passiveForces: { counter, surfaceFriction, airFriction } } = this;

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

        let leftLimit = 0;
        let bottomLimit = 0;
        let rightLimit = canvas.width - size.x;
        let topLimit = canvas.height - size.y;

        let leftGoing = velocity.x < 0;
        let rightGoing = velocity.x > 0;
        let bottomGoing = velocity.y < 0;
        let topGoing = velocity.y > 0;



        //#endregion ---------- ---------- ----------* destructure *---------- ----------|

        let startVelocity = this.velocity.multiplyTo(1)
        let activeTotal = Vector.sum(Object.values(this.activeForces))

        // counter force
        this.passiveForces.counter.set([0, 0])
        if (activeTotal.y < 0 && bottomTouch) { counter.y = -activeTotal.y };
        if (activeTotal.y > 0 && topTouch) { counter.y = -activeTotal.y };
        if (activeTotal.x < 0 && leftTouch) { counter.x = -activeTotal.x };
        if (activeTotal.x > 0 && rightTouch) { counter.x = -activeTotal.x };


        //  friction force
        this.passiveForces.surfaceFriction.set([0, 0])
        this.passiveForces.airFriction.set([0, 0])
        let [surfaceFrictionX, surfaceFrictionY, airFrictionX, airFrictionY] = [0, 0, 0, 0]
        if (velocity.x) {
            if (counter.y) { surfaceFrictionX = Math.abs(counter.y) * Math.sign(velocity.x) * fricCoef.surface; };
            airFrictionX = size.y * velocity.x * fricCoef.air;
        }
        if (velocity.y) {
            if (counter.x) { surfaceFrictionY = Math.abs(counter.x) * Math.sign(velocity.y) * fricCoef.surface; };
            airFrictionY = size.x * velocity.y * fricCoef.air;
        }

        this.passiveForces.surfaceFriction.set([surfaceFrictionX, surfaceFrictionY])
        this.passiveForces.airFriction.set([airFrictionX, airFrictionY])

        let passiveTotal = Vector.sum(Object.values(this.passiveForces))
        let passiveAcceleration = passiveTotal.divideTo(this.mass)
        let activeAcceleration = activeTotal.divideTo(this.mass)

        this.velocity.add(activeAcceleration.divideTo(frameRate))
        let testVelocity = this.velocity.addTo(passiveAcceleration.divideTo(frameRate))

        if (testVelocity.x * this.velocity.x < 0) { testVelocity.x = 0 }
        if (testVelocity.y * this.velocity.y < 0) { testVelocity.y = 0 }

        this.acceleration = testVelocity.subtractTo(startVelocity).divideTo(1 / frameRate)
        this.totalForce = this.acceleration.multiplyTo(this.mass);
        this.velocity = testVelocity;
        this.position.add(this.velocity.divideTo(frameRate))

        //      overflow correction
        // position correction
        if (leftSink) { position.x = leftLimit; }
        if (rightSink) { position.x = rightLimit; }
        if (bottomSink) { position.y = bottomLimit; }
        if (topSink) { position.y = topLimit; }

        // velocity correction
        if (leftTouch && leftGoing) { this.stopX() }
        if (rightTouch && rightGoing) { this.stopX() }
        if (bottomTouch && bottomGoing) { this.stopY() }
        if (topTouch && topGoing) { this.stopY() }
    }
    update() {
        this.calculate()
        this.draw()
    }
    renderInfo() {
        let { position, velocity, acceleration, activeForces: { gravity, user },
            passiveForces: { counter, airFriction, surfaceFriction }, totalForce } = this;
        let tables = {
            table1: { position, velocity, acceleration, },
            table2: { user, gravity, counter, airFriction, surfaceFriction, totalForce },
        }

        for (const tableName in tables) {
            const table = tables[tableName]

            for (const propName in table) {
                const { x, y } = table[propName].fixedTo(1);
                let xEl = document.querySelector(`.${tableName}>.row.${propName}>.x`)
                let yEl = document.querySelector(`.${tableName}>.row.${propName}>.y`)
                xEl.innerText = x;
                xEl.classList.remove("pos", "neg")
                if (x > 0) { xEl.classList.add("pos") }
                if (x < 0) { xEl.classList.add("neg") }
                yEl.innerText = y;
                yEl.classList.remove("pos", "neg")
                if (y > 0) { yEl.classList.add("pos") }
                if (y < 0) { yEl.classList.add("neg") }
            }
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

//#region ---------- ---------- ----------* keys *---------- ----------|
let keyValue = 15;
let ts = 0;
let gNum = 0;
let gValues = [-10,0,-5,5]
document.body.addEventListener("keydown", (e) => {
    // console.log(e.key);
    if (e.key == " ") { r1.stop() }
    if (e.key == "a") { r1.activeForces.user.x = -keyValue }
    if (e.key == "d") { r1.activeForces.user.x = +keyValue }
    if (e.key == "s") { r1.activeForces.user.y = -keyValue }
    if (e.key == "w") { r1.activeForces.user.y = +keyValue }
})
document.body.addEventListener("keyup", (e) => {
    if (e.key == "a") { r1.activeForces.user.x = 0 }
    if (e.key == "d") { r1.activeForces.user.x = 0 }
    if (e.key == "s") { r1.activeForces.user.y = 0 }
    if (e.key == "w") { r1.activeForces.user.y = 0 }
    if (e.key == "t") { console.timeStamp(`time`) }
    if (e.key == "j") { console.time("time") }
    if (e.key == "k") { console.timeLog("time") }
    if (e.key == "l") { console.timeEnd("time") }
    if (e.key == "g") { gForce.y = gValues[++gNum % gValues.length] }
})
//#endregion ---------- ---------- ----------* keys *---------- ----------|