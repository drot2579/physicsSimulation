let loglist = {}
let ones =  {
    add(name) {
        ones[name] = 1
    },
    kill(name){
        ones[name] = 0
    }
}
const PI = Math.PI
const canvas = document.querySelector("canvas")
const cx = canvas.getContext("2d")
canvas.color = "black"
canvas.width = 1200
canvas.height = 800
cx.fillRect(0, 0, canvas.width, canvas.height)

canvas.refresh = () => {
    cx.fillStyle = canvas.color;
    cx.fillRect(0, 0, canvas.width, canvas.height);
}
console.time("a")
ones.add("a")
class Vector {
    static sum(vectors, name = "") {
        let [x,y] = [0,0];
        for (const vector of vectors) {
            x += vector.x
            y += vector.y
        }
        return new Vector(x, y, name)
    }
    constructor(x = 0, y = 0, name = "") {
        if (name) { this.name = name; }
        this.x = x;
        this.y = y;


    }
    get array() { return [this.x, this.y] }
    get arrayNegY() { return [this.x, -this.y] }
    get length() { return Math.hypot(this.x, this.y) }


    get angle() { return Math.atan2(this.y, this.x) }
    get rad() { return this.angle / PI }
    get deg() { return this.rad * 180 }

    addInto(vector) {
        this.x += vector.x
        this.y += vector.y
    }
    subtractInto(vector) {
        this.x -= vector.x
        this.y -= vector.y
    }
    multiplyInto(num) {
        this.x *= num
        this.y *= num
    }
    add(vector) { return new Vector(this.x + vector.x, this.y + vector.y) }
    subtract(vector) { return new Vector(this.x - vector.x, this.y - vector.y) }
    multiply(n) { return new Vector(this.x * n, this.y * n) }
}

const gForce = new Vector(0,-10)
const canvasVector = new Vector(canvas.width, canvas.height)
class Rectangle {
    mass = 1;
    position = new Vector();
    size = new Vector(20, 20);
    velocity = new Vector();
    acceleration = new Vector();
    forces = [gForce];
    totalForceReceived = new Vector();
    color = "#fafafa";
    constructor() {

    }
    draw() {
        cx.fillStyle = this.color;
        cx.fillRect(this.position.x, canvas.height - this.position.y , this.size.x, -this.size.y);
    }
    update() {
        this.totalForceReceived = Vector.sum(this.forces)
        this.acceleration = this.totalForceReceived.multiply(1/this.mass)
        this.velocity.addInto(this.acceleration.multiply(anim.frame.rate**-1))
        this.position.addInto(this.velocity.multiply(anim.frame.rate**-1))

        if(this.position.y <= 0 && ones.a){console.timeEnd("a"); ones.kill("a")}

        if(this.position.y < 0){
            this.position.y = 1;
            this.velocity.addInto(this.velocity.multiply(-0.5))
        }
    }
}

let r1 = new Rectangle()
r1.position.addInto({x:300,y:125})

const anim = { frame: { count: 0, rate: 60 }, }

function animate() {
    canvas.refresh()
    anim.frame.count++
    window.requestAnimationFrame(animate)
    r1.update()
    r1.draw()
}

animate()
