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