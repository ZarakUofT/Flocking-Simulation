const flock = [];

let alignSlider, cohesionSlider, seperationSlider;
let view_angle_slider, speed_slider, force_slider;
const flock_size = 100;
const perception = 50;

function initialize_sliders() {
    alignSlider = createSlider(0, 5, 1, 0.1);
    alignSlider.position(0.1 * width, 1.2 * height);
    cohesionSlider = createSlider(0, 5, 1, 0.1);
    cohesionSlider.position(0.4 * width, 1.2 * height);
    seperationSlider = createSlider(0, 5, 1.1, 0.1);
    seperationSlider.position(0.7 * width, 1.2 * height);

    view_angle_slider = createSlider(60, 180, 90, 20);
    view_angle_slider.position(0.1 * width, 1.35 * height);
    speed_slider = createSlider(1, 5, 2, 0.5);
    speed_slider.position(0.4 * width, 1.35 * height);
    force_slider = createSlider(0, 0.5, 0.1, 0.1);
    force_slider.position(0.7 * width, 1.35 * height);
}

function update_slider_vals() {
    Boid.maxForce = force_slider.value();
    Boid.maxSpeed = speed_slider.value();
    Boid.viewAngle = view_angle_slider.value();
}

function setup() {
    createCanvas(600, 400);
    initialize_sliders();
    for (let i = 0; i < flock_size; i++) {
        flock.push(new Boid());
    }
}

function draw() {
    background(0);
    update_slider_vals();

    let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
    qtree = new Quad(boundary, 4);

    for (let boid of flock) {
        qtree.insert(boid);
    }
    for (let boid of flock) {
        let range = new Rectangle(boid.position.x, boid.position.y, perception, perception);
        let others = qtree.query(range);
        boid.edges();
        boid.flock(others);
        boid.update();
        boid.show();
    }
}