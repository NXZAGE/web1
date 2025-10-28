class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

function validate(x, y, r) {
  const MIN_X = -2, MAX_X = 2;
  let MIN_Y = -5, MAX_Y = 5;
  let MIN_R = 1, MAX_R = 4
  if (x < MIN_X || x > MAX_X) {
    throw new ValidationError(`X must be in range [${MIN_X}; ${MAX_X}], ${x} out of range`);
  }
  if (y < MIN_Y || y > MAX_Y) {
    throw new ValidationError(`Y must be in range [${MIN_Y}; ${MAX_Y}], ${y} out of range`);
  }
  if (r < MIN_R || r > MAX_R) {
    console.log('R invalid');
    throw new ValidationError(`R must be in range [${MIN_R}; ${MAX_R}], ${r} out of range`);
  }
  return;
}