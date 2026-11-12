
// Import the PixiJS tools used to create the animation.
import { Application, Graphics } from
    "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.mjs";

// Find the area where the animation should appear.
const container = document.getElementById("pixi-container");
const statusMessage = document.getElementById("pixi-status");

// Store all animated particles in this array.
const particles = [];

// Different colours used in the visual effects.
const colours = [
    0xc4a2ff,
    0xff8fcf,
    0xffbd75,
    0x8bdcff,
    0xb7f7d4
];

// Create the PixiJS application.
const app = new Application();

async function startExperience() {
    try {
        // Set up the animation and make it fit the container.
        await app.init({
            background: "#101019",
            resizeTo: container,
            antialias: true
        });

        // Add the PixiJS canvas to the website.
        container.appendChild(app.canvas);

        // Make the animation respond to mouse and touch input.
        app.stage.eventMode = "static";
        app.stage.hitArea = app.screen;

        // Create a new visual effect when the visitor clicks.
        app.stage.on("pointerdown", (event) => {
            const position = event.global;

            createBurst(position.x, position.y);
        });

        // Update the particles continuously.
        app.ticker.add((ticker) => {
            updateParticles(ticker.deltaTime);
        });

        // Remove the loading message when everything is ready.
        statusMessage.style.display = "none";

        // Create an initial visual effect.
        createBurst(
            app.screen.width / 2,
            app.screen.height / 2
        );

    } catch (error) {
        // Show an error message if the animation cannot load.
        console.error("PixiJS could not start:", error);

        statusMessage.textContent =
            "The interactive animation could not load. Please try again.";
    }
}

// Create a group of particles at the clicked position.
function createBurst(x, y) {

    // Create several particles for each click.
    for (let i = 0; i < 14; i++) {

        const colour =
            colours[Math.floor(Math.random() * colours.length)];

        const radius = 3 + Math.random() * 9;

        // Create a circle using PixiJS Graphics.
        const graphic = new Graphics()
            .circle(0, 0, radius)
            .fill({ color: colour });

        graphic.x = x;
        graphic.y = y;

        app.stage.addChild(graphic);

        // Give every particle its own direction and speed.
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;

        particles.push({
            graphic: graphic,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 70 + Math.random() * 35,
            maxLife: 105
        });
    }

    // Add a larger circle around the burst.
    createRing(x, y, colours[
        Math.floor(Math.random() * colours.length)
    ]);

    // Limit the number of particles to keep the animation smooth.
    while (particles.length > 160) {
        const oldest = particles.shift();

        app.stage.removeChild(oldest.graphic);
        oldest.graphic.destroy();
    }
}

// Create an expanding ring around the click.
function createRing(x, y, colour) {

    const ring = new Graphics()
        .circle(0, 0, 12)
        .stroke({
            color: colour,
            width: 2,
            alpha: 0.8
        });

    ring.x = x;
    ring.y = y;

    app.stage.addChild(ring);

    particles.push({
        graphic: ring,
        vx: 0,
        vy: 0,
        life: 55,
        maxLife: 55,
        isRing: true
    });
}

// Move the particles and gradually make them disappear.
function updateParticles(delta) {

    for (let i = particles.length - 1; i >= 0; i--) {

        const particle = particles[i];
        const graphic = particle.graphic;

        // Reduce the remaining lifetime.
        particle.life -= delta;

        if (particle.isRing) {

            // Make the ring expand.
            const progress =
                1 - particle.life / particle.maxLife;

            const scale = 1 + progress * 5;
            graphic.scale.set(scale);

        } else {

            // Move the particle in its own direction.
            graphic.x += particle.vx * delta;
            graphic.y += particle.vy * delta;

            // Slowly reduce the speed.
            particle.vx *= Math.pow(0.98, delta);
            particle.vy *= Math.pow(0.98, delta);

            // Add a small floating movement.
            graphic.rotation += 0.015 * delta;
        }

        // Fade out the particle as its lifetime ends.
        graphic.alpha = Math.max(
            0,
            particle.life / particle.maxLife
        );

        // Remove particles that have disappeared.
        if (particle.life <= 0) {

            app.stage.removeChild(graphic);
            graphic.destroy();

            particles.splice(i, 1);
        }
    }
}

// Start the interactive experience.
startExperience();
