// /core/calibration/calibrationEngine.js

function pixelDistance(pointA, pointB) {
  if (!pointA || !pointB) {
    throw new Error("Both calibration points are required");
  }

  if (
    typeof pointA.x !== "number" ||
    typeof pointA.y !== "number" ||
    typeof pointB.x !== "number" ||
    typeof pointB.y !== "number"
  ) {
    throw new Error("Calibration points must have numeric x and y values");
  }

  const dx = pointB.x - pointA.x;
  const dy = pointB.y - pointA.y;

  return Math.sqrt(dx * dx + dy * dy);
}

function calibrateScale({
  pointA,
  pointB,
  realDistanceMeters = 5
}) {
  if (realDistanceMeters <= 0) {
    throw new Error("Real distance must be greater than zero");
  }

  const pixels = pixelDistance(pointA, pointB);

  if (pixels === 0) {
    throw new Error("Calibration points cannot be the same");
  }

  return {
    realDistanceMeters,
    pixelDistance: pixels,
    pixelsPerMeter: pixels / realDistanceMeters,
    metersPerPixel: realDistanceMeters / pixels
  };
}

function pixelsToMeters(pixels, calibration) {
  if (
    typeof pixels !== "number" ||
    !calibration ||
    typeof calibration.metersPerPixel !== "number"
  ) {
    throw new Error("Invalid calibration data or pixel value");
  }

  return pixels * calibration.metersPerPixel;
}

function metersToPixels(meters, calibration) {
  if (
    typeof meters !== "number" ||
    !calibration ||
    typeof calibration.pixelsPerMeter !== "number"
  ) {
    throw new Error("Invalid calibration data or meter value");
  }

  return meters * calibration.pixelsPerMeter;
}

function pixelAreaToSquareMeters(pixelArea, calibration) {
  if (
    typeof pixelArea !== "number" ||
    !calibration ||
    typeof calibration.metersPerPixel !== "number"
  ) {
    throw new Error("Invalid calibration data or pixel area");
  }

  const scale = calibration.metersPerPixel;
  return pixelArea * scale * scale;
}

function cubicMeters(areaM2, depthMeters) {
  if (typeof areaM2 !== "number" || typeof depthMeters !== "number") {
    throw new Error("Area and depth must be numeric");
  }

  return areaM2 * depthMeters;
}

export {
  calibrateScale,
  pixelsToMeters,
  metersToPixels,
  pixelAreaToSquareMeters,
  cubicMeters
};
