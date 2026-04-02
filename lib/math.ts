export type Point = { x: number; y: number };

export const distance = (p1: Point, p2: Point) => Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);

export const normalizeSides = (a: number, b: number, c: number) => {
  if (a === 0 || b === 0 || c === 0) return { aDisplay: 0, bDisplay: 0, cDisplay: 0 };
  
  const minSide = Math.min(a, b, c);
  let a_norm = a / minSide;
  let b_norm = b / minSide;
  let c_norm = c / minSide;

  // Try to find a clean integer ratio multiplier (1 to 10)
  let bestMultiplier = 1;
  let minError = Infinity;

  for (let m = 1; m <= 12; m++) {
    const errA = Math.abs(a_norm * m - Math.round(a_norm * m));
    const errB = Math.abs(b_norm * m - Math.round(b_norm * m));
    const errC = Math.abs(c_norm * m - Math.round(c_norm * m));
    const totalError = errA + errB + errC;

    if (totalError < 0.15 && totalError < minError) {
      minError = totalError;
      bestMultiplier = m;
    }
  }

  let aDisplay = Math.round(a_norm * bestMultiplier);
  let bDisplay = Math.round(b_norm * bestMultiplier);
  let cDisplay = Math.round(c_norm * bestMultiplier);

  // Fallback to 1 decimal place if no clean integer ratio found
  if (minError > 0.15) {
    aDisplay = Math.round(a_norm * 10) / 10;
    bDisplay = Math.round(b_norm * 10) / 10;
    cDisplay = Math.round(c_norm * 10) / 10;
  }

  return { aDisplay, bDisplay, cDisplay };
};

export const calculateTriangle = (A: Point, B: Point, C: Point, pixelsPerUnit: number = 1) => {
  const a = distance(B, C) / pixelsPerUnit;
  const b = distance(A, C) / pixelsPerUnit;
  const c = distance(A, B) / pixelsPerUnit;

  // Handle degenerate triangles to avoid NaN
  if (a === 0 || b === 0 || c === 0) {
    return { a, b, c, angleA: 0, angleB: 0, angleC: 0, aDisplay: 0, bDisplay: 0, cDisplay: 0 };
  }

  let cosA = (b ** 2 + c ** 2 - a ** 2) / (2 * b * c);
  let cosB = (a ** 2 + c ** 2 - b ** 2) / (2 * a * c);
  let cosC = (a ** 2 + b ** 2 - c ** 2) / (2 * a * b);

  // Clamp to [-1, 1] to avoid precision issues with acos
  cosA = Math.max(-1, Math.min(1, cosA));
  cosB = Math.max(-1, Math.min(1, cosB));
  cosC = Math.max(-1, Math.min(1, cosC));

  const angleA = Math.acos(cosA) * (180 / Math.PI);
  const angleB = Math.acos(cosB) * (180 / Math.PI);
  const angleC = Math.acos(cosC) * (180 / Math.PI);

  const { aDisplay, bDisplay, cDisplay } = normalizeSides(a, b, c);

  return { a, b, c, angleA, angleB, angleC, aDisplay, bDisplay, cDisplay };
};

// Helper to get midpoint for labels
export const midpoint = (p1: Point, p2: Point) => ({
  x: (p1.x + p2.x) / 2,
  y: (p1.y + p2.y) / 2,
});

// Helper to get a point offset from a line segment (side) towards the outside of the triangle
export const getSideLabelPosition = (p1: Point, p2: Point, p3: Point, offset: number = 20) => {
  const mid = midpoint(p1, p2);
  const v = { x: p2.x - p1.x, y: p2.y - p1.y };
  const len = Math.sqrt(v.x ** 2 + v.y ** 2);
  
  if (len === 0) return mid;

  // Normal vector
  let nx = -v.y / len;
  let ny = v.x / len;

  // Vector from p1 to p3
  const v3 = { x: p3.x - p1.x, y: p3.y - p1.y };

  // Dot product to check direction
  const dot = nx * v3.x + ny * v3.y;

  // If dot > 0, normal points towards p3 (inward). We want outward, so flip it.
  if (dot > 0) {
    nx = -nx;
    ny = -ny;
  }

  return {
    x: mid.x + nx * offset,
    y: mid.y + ny * offset,
  };
};

// Helper to get a point offset from a vertex towards the inside of the triangle for angle labels
export const getAngleLabelPosition = (vertex: Point, p1: Point, p2: Point, offset: number = 30) => {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
  
  const len1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const len2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
  
  if (len1 === 0 || len2 === 0) return { x: vertex.x, y: vertex.y };

  const norm1 = { x: v1.x / len1, y: v1.y / len1 };
  const norm2 = { x: v2.x / len2, y: v2.y / len2 };
  
  const bisector = { x: norm1.x + norm2.x, y: norm1.y + norm2.y };
  const bisectorLen = Math.sqrt(bisector.x ** 2 + bisector.y ** 2);
  
  if (bisectorLen === 0) return { x: vertex.x, y: vertex.y };

  return {
    x: vertex.x + (bisector.x / bisectorLen) * offset,
    y: vertex.y + (bisector.y / bisectorLen) * offset,
  };
};

// Helper to get SVG path for angle arc
// Helper to get SVG path for angle arc
export const getAngleArcPath = (vertex: Point, p1: Point, p2: Point, radius: number = 25) => {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
  
  const len1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
  const len2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
  
  if (len1 === 0 || len2 === 0) return '';

  const startX = vertex.x + (v1.x / len1) * radius;
  const startY = vertex.y + (v1.y / len1) * radius;
  
  const endX = vertex.x + (v2.x / len2) * radius;
  const endY = vertex.y + (v2.y / len2) * radius;

  const det = v1.x * v2.y - v1.y * v2.x;
  const sweepFlag = det > 0 ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweepFlag} ${endX} ${endY}`;
};

// Helper to solve a triangle given 3 parts (at least one side)
// Returns the 3 sides and 3 angles, or null if invalid
export const solveTriangle = (
  known: { a?: number; b?: number; c?: number; A?: number; B?: number; C?: number }
): { a: number; b: number; c: number; A: number; B: number; C: number } | null => {
  let { a, b, c, A, B, C } = known;
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Convert known angles to radians
  if (A !== undefined) A *= rad;
  if (B !== undefined) B *= rad;
  if (C !== undefined) C *= rad;

  // If 2 angles are known, find the 3rd
  if (A !== undefined && B !== undefined && C === undefined) C = Math.PI - A - B;
  else if (A !== undefined && C !== undefined && B === undefined) B = Math.PI - A - C;
  else if (B !== undefined && C !== undefined && A === undefined) A = Math.PI - B - C;

  // Check if angles are valid
  if (A !== undefined && B !== undefined && C !== undefined) {
    if (A <= 0 || B <= 0 || C <= 0 || Math.abs(A + B + C - Math.PI) > 1e-5) return null;
  }

  // SSS
  if (a !== undefined && b !== undefined && c !== undefined) {
    if (a + b <= c || a + c <= b || b + c <= a) return null;
    A = Math.acos((b * b + c * c - a * a) / (2 * b * c));
    B = Math.acos((a * a + c * c - b * b) / (2 * a * c));
    C = Math.PI - A - B;
  }
  // SAS
  else if (a !== undefined && b !== undefined && C !== undefined) {
    c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
    A = Math.acos((b * b + c * c - a * a) / (2 * b * c));
    B = Math.PI - A - C;
  }
  else if (a !== undefined && c !== undefined && B !== undefined) {
    b = Math.sqrt(a * a + c * c - 2 * a * c * Math.cos(B));
    A = Math.acos((b * b + c * c - a * a) / (2 * b * c));
    C = Math.PI - A - B;
  }
  else if (b !== undefined && c !== undefined && A !== undefined) {
    a = Math.sqrt(b * b + c * c - 2 * b * c * Math.cos(A));
    B = Math.acos((a * a + c * c - b * b) / (2 * a * c));
    C = Math.PI - A - B;
  }
  // ASA or AAS (we already found all 3 angles above if 2 were given)
  else if (A !== undefined && B !== undefined && C !== undefined) {
    if (a !== undefined) {
      b = a * Math.sin(B) / Math.sin(A);
      c = a * Math.sin(C) / Math.sin(A);
    } else if (b !== undefined) {
      a = b * Math.sin(A) / Math.sin(B);
      c = b * Math.sin(C) / Math.sin(B);
    } else if (c !== undefined) {
      a = c * Math.sin(A) / Math.sin(C);
      b = c * Math.sin(B) / Math.sin(C);
    } else {
      return null; // No sides given
    }
  }
  // SSA (Ambiguous case - we'll just take the first valid solution or return null)
  else if (a !== undefined && b !== undefined && A !== undefined) {
    const sinB = (b * Math.sin(A)) / a;
    if (sinB > 1) return null;
    B = Math.asin(sinB);
    C = Math.PI - A - B;
    c = (a * Math.sin(C)) / Math.sin(A);
  }
  else if (a !== undefined && c !== undefined && A !== undefined) {
    const sinC = (c * Math.sin(A)) / a;
    if (sinC > 1) return null;
    C = Math.asin(sinC);
    B = Math.PI - A - C;
    b = (a * Math.sin(B)) / Math.sin(A);
  }
  else if (b !== undefined && a !== undefined && B !== undefined) {
    const sinA = (a * Math.sin(B)) / b;
    if (sinA > 1) return null;
    A = Math.asin(sinA);
    C = Math.PI - A - B;
    c = (b * Math.sin(C)) / Math.sin(B);
  }
  else if (b !== undefined && c !== undefined && B !== undefined) {
    const sinC = (c * Math.sin(B)) / b;
    if (sinC > 1) return null;
    C = Math.asin(sinC);
    A = Math.PI - B - C;
    a = (b * Math.sin(A)) / Math.sin(B);
  }
  else if (c !== undefined && a !== undefined && C !== undefined) {
    const sinA = (a * Math.sin(C)) / c;
    if (sinA > 1) return null;
    A = Math.asin(sinA);
    B = Math.PI - A - C;
    b = (c * Math.sin(B)) / Math.sin(C);
  }
  else if (c !== undefined && b !== undefined && C !== undefined) {
    const sinB = (b * Math.sin(C)) / c;
    if (sinB > 1) return null;
    B = Math.asin(sinB);
    A = Math.PI - B - C;
    a = (c * Math.sin(A)) / Math.sin(C);
  } else {
    return null; // Not enough info
  }

  return {
    a: a!, b: b!, c: c!,
    A: A! * deg, B: B! * deg, C: C! * deg
  };
};

export const generatePointsFromSides = (a: number, b: number, c: number, width: number = 500, height: number = 400) => {
  // Place A at origin (0,0)
  // Place B at (c, 0)
  // Place C at (b * cos(A), b * sin(A))
  const clamp = (val: number) => Math.max(-1, Math.min(1, val));
  const cosA = clamp((b * b + c * c - a * a) / (2 * b * c));
  const sinA = Math.sqrt(1 - cosA * cosA);
  
  const ptA = { x: 0, y: 0 };
  const ptB = { x: c, y: 0 };
  const ptC = { x: b * cosA, y: b * sinA };

  // Bounding box
  const minX = Math.min(ptA.x, ptB.x, ptC.x);
  const maxX = Math.max(ptA.x, ptB.x, ptC.x);
  const minY = Math.min(ptA.y, ptB.y, ptC.y);
  const maxY = Math.max(ptA.y, ptB.y, ptC.y);

  const triWidth = maxX - minX;
  const triHeight = maxY - minY;

  // Scale to fit within 80% of the container
  const scale = Math.min((width * 0.8) / (triWidth || 1), (height * 0.8) / (triHeight || 1));

  // Center offset
  const offsetX = (width - triWidth * scale) / 2 - minX * scale;
  const offsetY = (height - triHeight * scale) / 2 - minY * scale;

  return {
    points: {
      A: { x: ptA.x * scale + offsetX, y: ptA.y * scale + offsetY },
      B: { x: ptB.x * scale + offsetX, y: ptB.y * scale + offsetY },
      C: { x: ptC.x * scale + offsetX, y: ptC.y * scale + offsetY },
    },
    pixelsPerUnit: scale
  };
};
