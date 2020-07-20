class Boid {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(1, 2));
        this.acceleration = createVector(0, 0);
        this.color = [random(30, 255), random(30, 255), random(30, 255)];
    }

    //Static Variables
    static maxForce;
    static maxSpeed;
    static viewAngle;
    static r = 3.0;

    edges() {
        if (this.position.x < -Boid.r) this.position.x = width + Boid.r;
        if (this.position.y < -Boid.r) this.position.y = height + Boid.r;
        if (this.position.x > width + Boid.r) this.position.x = -Boid.r;
        if (this.position.y > height + Boid.r) this.position.y = -Boid.r;
    }

    inView(boid) {
        let angle = degrees(abs(Math.atan((boid.position.y - this.position.y) / (boid.position.x - this.position.x)) - this.velocity.heading()));
        return angle > 180 ? (360 - angle) < Boid.viewAngle : angle < Boid.viewAngle;
    }

    align(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius && this.inView(other)) {
                steering.add(other.velocity);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(Boid.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(Boid.maxForce);
        }
        return steering;
    }

    seperation(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius && this.inView(other)) {
                let diff = p5.Vector.sub(this.position, other.position);
                diff.div(Math.pow(d, 2));
                steering.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.setMag(Boid.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(Boid.maxForce);
        }
        return steering;
    }

    cohesion(boids) {
        let perceptionRadius = 50;
        let steering = createVector();
        let total = 0;
        for (let other of boids) {
            let d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
            if (other != this && d < perceptionRadius && this.inView(other)) {
                steering.add(other.position);
                total++;
            }
        }
        if (total > 0) {
            steering.div(total);
            steering.sub(this.position);
            steering.normalize();
            steering.mult(Boid.maxSpeed);
            steering.sub(this.velocity);
            steering.limit(Boid.maxForce);
        }
        return steering;
    }

    flock(boids) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let seperation = this.seperation(boids);

        seperation.mult(seperationSlider.value());
        cohesion.mult(cohesionSlider.value());
        alignment.mult(alignSlider.value());

        this.acceleration.add(seperation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(Boid.maxSpeed);
        this.acceleration.mult(0);
    }

    show() {
        let theta = this.velocity.heading() + radians(90);
        fill(127);
        stroke(this.color);
        push();
        translate(this.position.x, this.position.y);
        rotate(theta);
        beginShape();
        vertex(0, -Boid.r * 2);
        vertex(-Boid.r, Boid.r * 2);
        vertex(Boid.r, Boid.r * 2);
        endShape(CLOSE);
        pop();
    }
}