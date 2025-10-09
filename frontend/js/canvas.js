const WIDTH = 420;
const HEIGHT = 420;
const SCALE_BASIS = 200;
const CANVAS_CENTER = { x: WIDTH / 2, y: HEIGHT / 2 };
let stage, layer, point;

// Инициализация Konva Stage и Layer
function initKonva() {
    stage = new Konva.Stage({
        container: 'canvas_container',
        width: WIDTH,
        height: HEIGHT,
    });
    layer = new Konva.Layer();
    stage.add(layer);
}

// Конвертация пользовательских координат (x, y) в пиксели Canvas
function toCanvasCoords(x, y, r) {
    // 200 пикселей = r единиц
    const scale = SCALE_BASIS / r; 
    
    return {
        // x_canvas = Центр_X + x_user * scale
        x: CANVAS_CENTER.x + x * scale,
        // y_canvas = Центр_Y - y_user * scale (Canvas инвертирует Y)
        y: CANVAS_CENTER.y - y * scale
    };
}

// Отрисовка осей и меток
function drawAxes(r) {
    // Удаляем все старые элементы (оси, метки, область)
    layer.destroyChildren(); 

    const scale = SCALE_BASIS / r; // Пикселей на единицу

    // --- Ось X ---
    layer.add(new Konva.Line({
        points: [0, CANVAS_CENTER.y, WIDTH, CANVAS_CENTER.y],
        stroke: 'black',
        strokeWidth: 1,
    }));
    // --- Ось Y ---
    layer.add(new Konva.Line({
        points: [CANVAS_CENTER.x, 0, CANVAS_CENTER.x, HEIGHT],
        stroke: 'black',
        strokeWidth: 1,
    }));
    
    // Метки (r, r/2, -r/2, -r)
    const labels = [r, r/2, -r/2, -r];
    labels.forEach(val => {
        const pix = val * scale;
        
        // Метка на X
        layer.add(new Konva.Text({
            x: CANVAS_CENTER.x + pix - 10, y: CANVAS_CENTER.y + 5,
            text: val.toFixed(1), fontSize: 10, fill: 'gray'
        }));
        // Короткая черточка на X
        layer.add(new Konva.Line({
            points: [CANVAS_CENTER.x + pix, CANVAS_CENTER.y - 3, CANVAS_CENTER.x + pix, CANVAS_CENTER.y + 3],
            stroke: 'black', strokeWidth: 1,
        }));
        
        // Метка на Y (только для положительных, отрицательные загромождают)
        if (val !== 0) {
             layer.add(new Konva.Text({
                x: CANVAS_CENTER.x + 5, y: CANVAS_CENTER.y - pix - 5,
                text: val.toFixed(1), fontSize: 10, fill: 'gray'
            }));
            // Короткая черточка на Y
            layer.add(new Konva.Line({
                points: [CANVAS_CENTER.x - 3, CANVAS_CENTER.y - pix, CANVAS_CENTER.x + 3, CANVAS_CENTER.y - pix],
                stroke: 'black', strokeWidth: 1,
            }));
        }
    });
}

// Отрисовка области на основе r
function drawArea(r) {
    const scale = SCALE_BASIS / r;

    // --- Часть 1: Прямоугольник (0 <= x <= r/2 И 0 <= y <= r) ---
    // x: 0 -> r/2 (длина r/2 * scale)
    // y: 0 -> r (длина r * scale)
    const rect = new Konva.Rect({
        x: CANVAS_CENTER.x,
        y: CANVAS_CENTER.y - r * scale, // Начинаем с верхнего левого угла
        width: (r / 2) * scale,
        height: r * scale,
        fill: 'lightblue',
        opacity: 0.6
    });
    layer.add(rect);

    // --- Часть 2: Четверть круга (x <= 0 И y <= 0 И x^2 + y^2 < (r/2)^2) ---
    const quarterCircle = new Konva.Wedge({
        x: CANVAS_CENTER.x,
        y: CANVAS_CENTER.y,
        radius: (r / 2) * scale,
        angle: 90,
        rotation: 90, // Начинаем от оси X (0 градусов) и идём в III квадрант
        fill: 'lightblue',
        opacity: 0.6
    });
    layer.add(quarterCircle);

    // --- Часть 3: Трапеция/Треугольник (x <= 0 И 0 <= y <= r И y < 2x + r) ---
    // Вершины:
    // A: (0, r) -> (CENTER_X, CENTER_Y - r*scale)
    // B: (0, 0) -> (CENTER_X, CENTER_Y)
    // C: (-r/2, 0) - точка пересечения y=0 и y=2x+r
    // D: (-r/2, r) - точка пересечения x=-r/2 и y=r
    // Фактически это треугольник с вершинами (0, r), (0, 0), и (-r/2, 0)
    // НО! Условие y < 2x + r задает *линию*!
    // y < 2x + r И x <= 0 И 0 <= y <= r
    
    // Пересечение: y=r и y=2x+r -> r=2x+r -> 2x=0 -> x=0. Точка (0, r)
    // Пересечение: y=0 и y=2x+r -> 0=2x+r -> x=-r/2. Точка (-r/2, 0)
    
    // Фигура - Прямоугольный треугольник с вершинами: (0, r), (0, 0), (-r/2, 0)
    const pA = toCanvasCoords(0, r, r);
    const pB = toCanvasCoords(0, 0, r);
    const pC = toCanvasCoords(-r/2, 0, r);

    const triangle = new Konva.Shape({
        sceneFunc: function(context, shape) {
            context.beginPath();
            context.moveTo(pA.x, pA.y);
            context.lineTo(pB.x, pB.y);
            context.lineTo(pC.x, pC.y);
            context.closePath();
            context.fillStrokeShape(shape);
        },
        fill: 'lightblue',
        opacity: 0.6,
        stroke: 'blue',
        strokeWidth: 0 // Убираем границу для лучшего слияния с другими частями
    });
    layer.add(triangle);

    // Нарисуем границу области поверх, для лучшей видимости
    // drawAreaBorder(r);
}

// Дополнительная функция для рисования границы области
function drawAreaBorder(r) {
    const scale = SCALE_BASIS / r;

    // Граница Прямоугольника
    const rectBorder = new Konva.Line({
        points: [
            CANVAS_CENTER.x, CANVAS_CENTER.y - r * scale, // (0, r)
            CANVAS_CENTER.x + (r / 2) * scale, CANVAS_CENTER.y - r * scale, // (r/2, r)
            CANVAS_CENTER.x + (r / 2) * scale, CANVAS_CENTER.y, // (r/2, 0)
            CANVAS_CENTER.x, CANVAS_CENTER.y // (0, 0)
        ],
        stroke: 'darkblue',
        strokeWidth: 2,
        closed: true // Закрытая фигура
    });
    layer.add(rectBorder);

    // Гипотенуза Треугольника (y=2x+r)
    const pC = toCanvasCoords(-r/2, 0, r);
    const pA = toCanvasCoords(0, r, r);
    const triangleHypotenuse = new Konva.Line({
        points: [pC.x, pC.y, pA.x, pA.y],
        stroke: 'darkblue',
        strokeWidth: 2,
    });
    layer.add(triangleHypotenuse);

    // Граница Четверти круга (Дуга)
    const arcBorder = new Konva.Arc({
        x: CANVAS_CENTER.x,
        y: CANVAS_CENTER.y,
        innerRadius: (r / 2) * scale,
        outerRadius: (r / 2) * scale,
        angle: 90,
        rotation: 90,
        stroke: 'darkblue',
        strokeWidth: 2,
    });
    layer.add(arcBorder);


    // Правая граница для четверти курга
    const quaterRightBorder = new Konva.Line({
      points: [CANVAS_CENTER.x, CANVAS_CENTER.y - r * scale, CANVAS_CENTER.x, CANVAS_CENTER.y],
      stroke: 'darkblue',
      strokeWidth: 2,
    });
    layer.add(quaterRightBorder);
}


// Отрисовка пользовательской точки
function drawPoint(x, y, r) {
    const coords = toCanvasCoords(x, y, r);
    
    // Если точка ещё не создана, создаем ее
    point = new Konva.Circle({
        radius: 5,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 1
    });
    layer.add(point);
    
    // Обновляем позицию точки
    point.position(coords);
    
    // Проверка попадания (дополнительно)
    const isHit = checkHit(x, y, r);
    point.fill(isHit ? 'green' : 'red');
    
    console.log(`Точка (${x.toFixed(2)}, ${y.toFixed(2)}) попадает: ${isHit ? 'ДА' : 'НЕТ'}`);
}

// Функция проверки попадания (JS-версия вашей Java-логики)
// ! TOOD снести нахуй 
function checkHit(x, y, r) {
    // D1: Прямоугольник (0 <= x <= r/2 И 0 <= y <= r)
    const hit1 = (y >= 0 && y <= r && x >= 0 && x <= r/2);
    
    // D2: Треугольник (x <= 0 И 0 <= y <= r И y < 2x + r)
    const hit2 = (x <= 0 && y >= 0 && y <= r && y < 2 * x + r);
    
    // D3: Четверть круга (x <= 0 И y <= 0 И x^2 + y^2 <= (r/2)^2)
    const R_sq = (r / 2) * (r / 2);
    const hit3 = (x <= 0 && y <= 0 && (x * x + y * y) <= R_sq);
    
    // Область - это объединение
    return hit1 || hit2 || hit3;
}


// Главная функция, вызываемая по кнопке
function drawVisualization() {
    const r = parseFloat(document.getElementById('rInput').value);
    const x = parseFloat(document.getElementById('xInput').value);
    const y = parseFloat(document.getElementById('yInput').value);

    if (isNaN(r) || isNaN(x) || isNaN(y)) {
        alert("Пожалуйста, введите корректные числа для r, x и y.");
        return;
    }
    
    // 1. Отрисовка осей и меток (удаляет старую область)
    drawAxes(r);
    
    // 2. Отрисовка области
    drawArea(r);
    
    // 3. Отрисовка точки
    drawPoint(x, y, r);

    // 4. Отрисовка слоя
    layer.draw();
}

console.log("hi from canvas.js");
// Инициализация при загрузке
initKonva();
console.log("Konva ininted successfully");
drawVisualization(); // Рисуем начальное состояние