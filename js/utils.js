/////////////////////////////////
// --------- Debug ----------- //
/////////////////////////////////

function printArray(string, array) {
    console.log(string);
    array.forEach(row => {
        console.log(row);
    })
}

/////////////////////////////////
// ----------- Math ---------- //
/////////////////////////////////

function distBetween(x1, y1, x2, y2) {
    var distX = x1 - x2;
    var distY = y1 - y2;
    return Math.sqrt(distX * distX + distY * distY);
}

/////////////////////////////////
// ------- Noise Funcs ------- //
/////////////////////////////////

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function noise(x, y) {
    const random = Math.floor(Math.random() * 99999);
    const n = Math.sin(x * 12.9898 + y * 78.233 + random) * 43758.5453;
    return n - Math.floor(n);
}

function smoothNoise(x, y) {
    // Interpolate between four corners
    const intX = Math.floor(x);
    const intY = Math.floor(y);
    const fracX = x - intX;
    const fracY = y - intY;

    const v1 = noise(intX, intY);
    const v2 = noise(intX + 1, intY);
    const v3 = noise(intX, intY + 1);
    const v4 = noise(intX + 1, intY + 1);

    const i1 = lerp(v1, v2, fracX);
    const i2 = lerp(v3, v4, fracX);
    return lerp(i1, i2, fracY);
}

//////////////////////////////////
// ------- Timing Funcs ------- //
//////////////////////////////////

const Animator = {
    easeInOut: time => {
        return time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1;
    },
    easeOutBack: time => {
        return Math.pow(time - 1, 2) * ((1.70158 + 1) * (time - 1) + 1.70158) + 1;
    },
    elastic: time => {
        return Math.pow(2, -5 * time) * Math.sin(((time - 0.3 / 4) * (Math.PI * 2)) / 0.3) + 1;
    },
    fanOut: time => {
        return 2 / (1 + Math.pow(1000, -time)) - 1;
    },
    rollercoaster: time => {
        return (-1.15 * Math.sin(time * 7.7)) / (time * 7.7) + 1.15;
    },
    linear: time => {
        return time;
    },
    jump: time => {
        return -((2 * time - 1) * (2 * time - 1)) + 1;
    },
    softJump: time => {
        return 1 - (Math.cos(time * 2 * Math.PI) / 2 + 0.5);
    }
};

//////
// ---- Animation
/////

// Since the animations we're using take up all the frames,
// we want to skip the frames that we know are not needed.
const updateClipsFor = (name, startFrame, endFrame) => {

    // Find the original clip
    const index = this.el.animations.findIndex((clip) => clip.name === name);
    if (index === -1) {
        console.warn('Clip not found by name:', name);
        return;
    }
    const originalClip = this.animations[index];

    // Assume 24 frames per second, adjust according to your animation data
    const fps = 24;
    const newClip = THREE.AnimationUtils.subclip(
        originalClip,
        originalClip.name,
        startFrame,
        endFrame,
        fps
    );

    // Replace the original clip with the new subclip in the animations array
    this.animations[index] = newClip;
}
