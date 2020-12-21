class Obstacle {
    constructor(x, y, r) {
        this.position = createVector(x, y);
        this.r = r;
        this.color = [random(30, 255), random(30, 255), random(30, 255)];
    }
    draw() {
        fill(this.color);
        circle(this.position.x, this.position.y, this.r);
    }

    intersects(boid) {
        let v = boid.velocity.copy().normalize().mult(Boid.feeler);
        // let v = p5.Vector.add(boid.position, boid.velocity.copy().normalize().mult(Boid.feeler))

        let a = p5.Vector.sub(this.position, boid.position);
        let p = v.copy().mult(v.dot(a) / v.magSq());
        let b = p5.Vector.sub(a, p);

        if (v.mag() > p.mag() && b.mag() < this.r * 1.2) {
            return true;
        } else
            return false;
    }
}

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
    static maxAvoidForce = 10.0;
    static maxSpeed;
    static viewAngle;
    static r = 2.0;
    static feeler = 60.0;

    findDistance(obj1, obj2) {
        return dist(obj1.position.x, obj1.position.y, obj2.position.x, obj2.position.y);
    }
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

    closestObstacle(obstacles) {
        let cObs = null;

        for (let obstacle of obstacles) {
            if (obstacle.intersects(this) && (cObs == null || this.findDistance(this, obstacle) < this.findDistance(this, cObs))) {
                cObs = obstacle;
            }
        }
        return cObs;
    }
    avoidObstacles(obstacles) {
        let cObs = this.closestObstacle(obstacles);
        let avoidance = createVector(0);
        if (cObs != null) {
            let dVec = p5.Vector.sub(cObs.position, this.position);
            let dist = dVec.mag();
            let heading = this.velocity.copy();
            let angleBet = dVec.angleBetween(heading)
            if (angleBet > 0)
                heading.rotate(HALF_PI - angleBet);
            else
                heading.rotate(-HALF_PI - angleBet);
            avoidance = heading.div(dist / Boid.maxAvoidForce)
            // avoidance.limit(Boid.maxAvoidForce);
        }
        return avoidance;
    }

    flock(boids, obstacles) {
        let alignment = this.align(boids);
        let cohesion = this.cohesion(boids);
        let seperation = this.seperation(boids);
        let obstacleAvoidance = this.avoidObstacles(obstacles);

        alignment.mult(alignSlider.value());
        cohesion.mult(cohesionSlider.value());
        seperation.mult(seperationSlider.value());

        this.acceleration.add(seperation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(obstacleAvoidance);
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