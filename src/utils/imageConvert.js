// Uses bits and peices from https://github.com/jaxry/panorama-to-cubemap as a reference

function clamp(x, min, max) {
    return Math.min(max, Math.max(x, min));
}

function mod(x, n) {
    return ((x % n) + n) % n;
}

function nearestBaseTwo(n) {
    return 1 << Math.round(Math.log(n) / Math.log(2))
}

const orientations = {
    pz: (out, x, y) => {
      out.x = -1;
      out.y = -x;
      out.z = y;
    },
    nz: (out, x, y) => {
      out.x = 1;
      out.y = x;
      out.z = y;
    },
    px: (out, x, y) => {
      out.x = x;
      out.y = -1;
      out.z = y;
    },
    nx: (out, x, y) => {
      out.x = -x;
      out.y = 1;
      out.z = y;
    },
    py: (out, x, y) => {
      out.x = y;
      out.y = -x;
      out.z = 1;
    },
    ny: (out, x, y) => {
      out.x = -y;
      out.y = -x;
      out.z = -1;
    }
};
  

function copyPixelBilinear(read, write) {
    const { width, height, data } = read;
    const readIndex = (x, y) => 4 * (y * width + x);

    return (xFrom, yFrom, to) => {
        const xl = clamp(Math.floor(xFrom), 0, width - 1);
        const xr = clamp(Math.ceil(xFrom), 0, width - 1);
        const xf = xFrom - xl;

        const yl = clamp(Math.floor(yFrom), 0, height - 1);
        const yr = clamp(Math.ceil(yFrom), 0, height - 1);
        const yf = yFrom - yl;

        const p00 = readIndex(xl, yl);
        const p10 = readIndex(xr, yl);
        const p01 = readIndex(xl, yr);
        const p11 = readIndex(xr, yr);

        for (let channel = 0; channel < 3; channel++) {
            const p0 = data[p00 + channel] * (1 - xf) + data[p10 + channel] * xf;
            const p1 = data[p01 + channel] * (1 - xf) + data[p11 + channel] * xf;
            write.data[to + channel] = Math.ceil(p0 * (1 - yf) + p1 * yf);
        }
    };
}

function renderFace(readData, face) {

    // make sure it's a 2:1 ratio image and is valid
    const faceWidth = nearestBaseTwo(readData.width / 4) | 0;
    const faceHeight = faceWidth;

    const cube = {};
    const orientation = orientations[face];

    const writeData = new ImageData(faceWidth, faceHeight);

    const copyPixel = copyPixelBilinear(readData, writeData);


    for (let x = 0; x < faceWidth; x++) {
        for (let y = 0; y < faceHeight; y++) {
            const to = 4 * (y * faceWidth + x);

            // fill alpha channel
            writeData.data[to + 3] = 255;

            // get position on cube face
            // cube is centered at the origin with a side length of 2
            orientation(cube, (2 * (x + 0.5) / faceWidth - 1), (2 * (y + 0.5) / faceHeight - 1));

            // project cube face onto unit sphere by converting cartesian to spherical coordinates
            const r = Math.sqrt(cube.x * cube.x + cube.y * cube.y + cube.z * cube.z);
            const lon = mod(Math.atan2(cube.y, cube.x), 2 * Math.PI);
            const lat = Math.acos(cube.z / r);

            copyPixel(readData.width * lon / Math.PI / 2 - 0.5, readData.height * lat / Math.PI - 0.5, to);
        }
    }

    return [writeData, faceWidth, faceHeight];
}

export default renderFace;