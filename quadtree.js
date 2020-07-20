class Circle {
    constructor(x, y, r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    contains(point) {
        return (dist(this.x, this.y, point.x, point.y) < this.r);
    }

    intersects(rec) {
        circleD_x = abs(this.x - rec.x);
        circleD_y = abs(this.y - rec.y);

        if (circleD_x > (rec.w + this.r)) return false;
        if (circleD_y > (rec.h + this.r)) return false;

        if (circleD_x <= rec.w) return true;
        if (circleD_y <= rec.h) return true;

        corner_dist_sq = ((circleD_x - rec.w) ** 2) + ((circleD_y - rec.h) ** 2);
        return (corner_dist_sq <= this.r ** 2);
    }
}

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    contains(loc) {
        return (loc.x >= this.x - this.w &&
            loc.x <= this.x + this.w &&
            loc.y >= this.y - this.h &&
            loc.y <= this.y + this.h);
    }

    intersects(range) {
        return !(range.x - range.w > this.x + this.w ||
            range.x + range.w < this.x - this.w ||
            range.y - range.h > this.y + this.h ||
            range.y + range.h < this.y - this.h)
    }
}

class Quad {
    constructor(boundary, n) {
        this.boundary = boundary;
        this.capacity = n;
        this.boids = [];
        this.divided = false;
    }

    subDivide() {
        let w = this.boundary.w / 2;
        let h = this.boundary.h / 2;
        let ne = new Rectangle(this.boundary.x + w, this.boundary.y - h, w, h);
        let nw = new Rectangle(this.boundary.x - w, this.boundary.y - h, w, h);
        let se = new Rectangle(this.boundary.x + w, this.boundary.y + h, w, h);
        let sw = new Rectangle(this.boundary.x - w, this.boundary.y + h, w, h);

        this.northeast = new Quad(ne, this.capacity);
        this.northwest = new Quad(nw, this.capacity);
        this.southeast = new Quad(se, this.capacity);
        this.southwest = new Quad(sw, this.capacity);
        this.divided = true;

        for (let boid of this.boids) {
            this.insert(boid);
        }
        this.boids.length = 0;
    }

    insert(boid) {
        if (!this.boundary.contains(boid.position)) {
            return false;
        }
        if (this.boids.length < this.capacity && !this.divided) {
            this.boids.push(boid);
            return true;
        } else {
            if (!this.divided) {
                this.subDivide();
            }
            if (this.northeast.insert(boid)) {
                return true;
            } else if (this.northwest.insert(boid)) {
                return true;
            } else if (this.southeast.insert(boid)) {
                return true;
            } else if (this.southwest.insert(boid)) {
                return true;
            }
        }
    }

    query(range, found) {
        if (!found) {
            found = [];
        }
        if (!this.boundary.intersects(range)) {
            return found; //empty array
        }
        if (this.divided) {
            found = this.northeast.query(range, found);
            found = this.southwest.query(range, found);
            found = this.northwest.query(range, found);
            found = this.southeast.query(range, found);
        } else {
            for (let b of this.boids) {
                if (range.contains(b.position)) {
                    found.push(b);
                }
            }
        }
        return found;
    }

    // show() {
    //     stroke(255);
    //     strokeWeight(1)
    //     noFill();
    //     rectMode(CENTER);
    //     rect(this.boundary.x, this.boundary.y, this.boundary.w * 2, this.boundary.h * 2);
    //     if (this.divided) {
    //         this.northeast.show();
    //         this.northwest.show();
    //         this.southeast.show();
    //         this.southwest.show();
    //     }
    //     for (let b of this.boids) {
    //         strokeWeight(4);
    //         point(b.position.x, b.position.y);
    //     }
    // }
}