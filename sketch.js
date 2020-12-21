const flock = [];

let canvas;

let alignSlider, cohesionSlider, seperationSlider;
let view_angle_slider, speed_slider, force_slider;
const flock_size = 250;
const perception = 50;

let obstacles = []
let clickLoc = null

function initialize_sliders() {
    let height_loc = 1.35
    alignSlider = createSlider(0, 5, 1, 0.1);
    alignSlider.position(0.1 * width, height_loc * height);
    cohesionSlider = createSlider(0, 5, 1, 0.1);
    cohesionSlider.position(0.4 * width, height_loc * height);
    seperationSlider = createSlider(0, 5, 1.1, 0.1);
    seperationSlider.position(0.7 * width, height_loc * height);

    height_loc = 1.5

    view_angle_slider = createSlider(0, 180, 90, 20);
    view_angle_slider.position(0.1 * width, height_loc * height);
    speed_slider = createSlider(0, 5, 2, 0.5);
    speed_slider.position(0.4 * width, height_loc * height);
    force_slider = createSlider(0, 0.3, 0.1, 0.1);
    force_slider.position(0.7 * width, height_loc * height);
}

function update_slider_vals() {
    Boid.maxForce = force_slider.value();
    Boid.maxSpeed = speed_slider.value();
    Boid.viewAngle = view_angle_slider.value();
}

function setup() {
    canvas = createCanvas(600, 400);
    canvas.mousePressed(getObstacle);
    initialize_sliders();
    obstacles.push(new Obstacle(300, 200, 40));
    for (let i = 0; i < flock_size; i++) {
        flock.push(new Boid());
    }
}

function draw() {
    background(0);
    update_slider_vals();
    obstacles.forEach(o => o.draw());
    let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
    qtree = new Quad(boundary, 4);

    for (let boid of flock) {
        qtree.insert(boid);
    }
    for (let boid of flock) {
        let range = new Rectangle(boid.position.x, boid.position.y, perception, perception);
        let others = qtree.query(range);
        boid.edges();
        boid.flock(others, obstacles);
        boid.update();
        boid.show();
    }
}

// function mousePressed() {

//     // return false to prevent default
//     return false;
// }

function getObstacle() {
    clickLoc = [mouseX, mouseY];
    obstacle_radius = random(20, 40)
    obstacles.push(new Obstacle(clickLoc[0], clickLoc[1],obstacle_radius));
    clickLoc = null;
    return false;
}