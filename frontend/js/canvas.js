const WIDTH = 440;
const HEIGHT = 440;
const SCALE_BASIS = 180;
const CANVAS_CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };
const AXIS_COLOR = "white";
const AXIS_FONT_COLOR = "white";
const AREA_COLOR = "rgba(224, 145, 250, 1)";
const AREA_OPACITY = 0.9;
const POINT_RADIUS = 4;
let stage, layer, point;

function initKonva() {
  stage = new Konva.Stage({
    container: "canvas_container",
    width: WIDTH,
    height: HEIGHT,
  });
  layer = new Konva.Layer();
  stage.add(layer);
}

function toCanvasCoords(x, y, r) {
  const scale = SCALE_BASIS / r;

  return {
    x: CANVAS_CENTER.x + x * scale,
    y: CANVAS_CENTER.y - y * scale,
  };
}

function drawAxes(r) {
  const scale = SCALE_BASIS / r;

  layer.add(
    new Konva.Line({
      points: [0, CANVAS_CENTER.y, WIDTH, CANVAS_CENTER.y],
      stroke: AXIS_COLOR,
      strokeWidth: 1,
    })
  );
  layer.add(
    new Konva.Line({
      points: [CANVAS_CENTER.x, 0, CANVAS_CENTER.x, HEIGHT],
      stroke: AXIS_COLOR,
      strokeWidth: 1,
    })
  );

  const labels = [r, r / 2, -r / 2, -r];
  labels.forEach((val) => {
    const pix = val * scale;

    layer.add(
      new Konva.Text({
        x: CANVAS_CENTER.x + pix - 10,
        y: CANVAS_CENTER.y + 5,
        text: val.toFixed(1),
        fontSize: 10,
        fill: AXIS_FONT_COLOR,
      })
    );
    layer.add(
      new Konva.Line({
        points: [
          CANVAS_CENTER.x + pix,
          CANVAS_CENTER.y - 3,
          CANVAS_CENTER.x + pix,
          CANVAS_CENTER.y + 3,
        ],
        stroke: AXIS_COLOR,
        strokeWidth: 1,
      })
    );

    if (val !== 0) {
      layer.add(
        new Konva.Text({
          x: CANVAS_CENTER.x + 5,
          y: CANVAS_CENTER.y - pix - 5,
          text: val.toFixed(1),
          fontSize: 10,
          fill: AXIS_FONT_COLOR,
        })
      );
      layer.add(
        new Konva.Line({
          points: [
            CANVAS_CENTER.x - 3,
            CANVAS_CENTER.y - pix,
            CANVAS_CENTER.x + 3,
            CANVAS_CENTER.y - pix,
          ],
          stroke: AXIS_COLOR,
          strokeWidth: 1,
        })
      );
    }
  });
}

function drawArea(r) {
  const scale = SCALE_BASIS / r;
  const rect = new Konva.Rect({
    x: CANVAS_CENTER.x,
    y: CANVAS_CENTER.y - r * scale,
    width: (r / 2) * scale,
    height: r * scale,
    fill: AREA_COLOR,
    opacity: AREA_OPACITY,
  });
  layer.add(rect);

  const quarterCircle = new Konva.Wedge({
    x: CANVAS_CENTER.x,
    y: CANVAS_CENTER.y,
    radius: (r / 2) * scale,
    angle: 90,
    rotation: 90,
    fill: AREA_COLOR,
    opacity: AREA_OPACITY,
  });
  layer.add(quarterCircle);

  const pA = toCanvasCoords(0, r, r);
  const pB = toCanvasCoords(0, 0, r);
  const pC = toCanvasCoords(-r / 2, 0, r);

  const triangle = new Konva.Shape({
    sceneFunc: function (context, shape) {
      context.beginPath();
      context.moveTo(pA.x, pA.y);
      context.lineTo(pB.x, pB.y);
      context.lineTo(pC.x, pC.y);
      context.closePath();
      context.fillStrokeShape(shape);
    },
    fill: AREA_COLOR,
    opacity: AREA_OPACITY,
    strokeWidth: 0,
  });
  layer.add(triangle);
}

function drawPoint(x, y, r) {
  const coords = toCanvasCoords(x, y, r);

  point = new Konva.Circle({
    radius: POINT_RADIUS,
    fill: "white",
    stroke: "black",
    strokeWidth: 1,
  });
  layer.add(point);

  point.position(coords);
}

function drawVisualization(x, y, r) {
  layer.destroyChildren();
  drawArea(r);
  drawAxes(r);

  drawPoint(x, y, r);

  layer.draw();
}

console.log("hi from canvas.js");
initKonva();
console.log("Konva ininted successfully");
// drawVisualization(getModelParams().x, getModelParams().y, getModelParams().r);
