let video;
let handpose;
let predictions = [];
let font;
let magnets = [];
let num = 3;

// 綁定圖片與名稱
let imgFiles = ["1.png", "2.png", "3.png", "4.png", "5.png"];
let imgLabels = [
  "介面設計",
  "攝影與視覺傳達",
  "教育心理學",
  "教育統計概論",
  "程式設計與實習"
];
let imgs = [];
let topImgsIdxs = []; // 畫面上方顯示的三張圖片索引
let bottomLabelsIdxs = []; // 下方顯示的三個名稱索引

function preload() {
  for (let i = 0; i < imgFiles.length; i++) {
    imgs[i] = loadImage(imgFiles[i]);
  }
}

function setup() {
  createCanvas(640, 480);
  // 將畫布置中於視窗
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  let canvas = document.getElementsByTagName('canvas')[0];
  if (canvas) {
    canvas.style.position = 'absolute';
    canvas.style.left = `${x}px`;
    canvas.style.top = `${y}px`;
  }

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });

  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(24);

  // 隨機產生上方三張圖片
  nextQuestion();
}

function modelReady() {
  // Model loaded
}

let showCorrect = false;
let showWrong = false;
let correctTimer = 0;
let wrongTimer = 0;

// 記錄每個磁鐵方塊的初始位置
let magnetInitPos = [];

function draw() {
  background(220);
  imageMode(CENTER);
  image(video, width / 2, height / 2, width, height);
  imageMode(CORNER);

  // 畫面上半部中央顯示三張隨機圖片（不顯示名稱），透明度70%
  let imgY = height * 0.25;
  let imgSpacing = width / 4;
  let imgW = 100, imgH = 100;
  push();
  tint(255, 178); // 70% 透明
  for (let i = 0; i < 3; i++) {
    let x = imgSpacing * (i + 1);
    imageMode(CENTER);
    image(imgs[topImgsIdxs[i]], x, imgY, imgW, imgH);
  }
  pop();

  // 畫面下半部顯示三個可拖動的名稱選項
  let optionY = height * 0.75;
  let spacing = width / 4;
  let btnColor = color(255, 255, 255, 180); // 70% 透明
  textSize(24);

  // 初始化磁鐵方塊（只在第一次或題目變換時）
  if (magnets.length !== 3) {
    magnets = [];
    magnetInitPos = [];
    for (let i = 0; i < 3; i++) {
      let x = spacing * (i + 1);
      magnets.push(new Magnet(x, optionY, imgLabels[bottomLabelsIdxs[i]], i));
      magnetInitPos.push({ x: x, y: optionY });
    }
  }

  // 顯示並更新磁鐵方塊（只顯示未消失的）
  for (let m of magnets) {
    if (!m.removed) m.display();
  }

  // 手勢拖曳功能
  if (predictions.length > 0 && !showCorrect && !showWrong) {
    let hand = predictions[0];
    let tip = hand.landmarks[8]; // 食指指尖
    let thumb = hand.landmarks[4]; // 拇指指尖
    let tipX = tip[0];
    let tipY = tip[1];
    let d = dist(tipX, tipY, thumb[0], thumb[1]);

    if (d < 50) {
      // 找到最近且未消失的磁鐵方塊
      let minDist = Infinity;
      let targetMagnet = null;
      for (let m of magnets) {
        if (m.removed) continue;
        let md = dist(tipX, tipY, m.x, m.y);
        if (md < m.getWidth() / 2 && md < minDist) {
          minDist = md;
          targetMagnet = m;
        }
      }
      // 拖曳最近的方塊
      if (targetMagnet) {
        targetMagnet.x = tipX;
        targetMagnet.y = tipY;

        // 檢查是否碰到正確的圖片
        let idx = magnets.indexOf(targetMagnet);
        let labelIdx = bottomLabelsIdxs[idx];
        let imgTargetIdx = topImgsIdxs.indexOf(labelIdx);
        let answered = false;
        if (imgTargetIdx !== -1) {
          let imgX = imgSpacing * (imgTargetIdx + 1);
          let imgYCenter = imgY;
          let distToImg = dist(targetMagnet.x, targetMagnet.y, imgX, imgYCenter);
          if (distToImg < imgW / 2) {
            // 答對
            showCorrect = true;
            correctTimer = millis();
            targetMagnet.removed = true;
            answered = true;
          }
        }
        // 檢查是否拖到任一圖片區域但不是正確答案
        if (!answered) {
          let isWrong = false;
          for (let i = 0; i < 3; i++) {
            let imgX = imgSpacing * (i + 1);
            let imgYCenter = imgY;
            let distToImg = dist(targetMagnet.x, targetMagnet.y, imgX, imgYCenter);
            if (distToImg < imgW / 2) {
              isWrong = true;
              break;
            }
          }
          if (isWrong) {
            showWrong = true;
            wrongTimer = millis();
            // 回到原位
            targetMagnet.x = magnetInitPos[idx].x;
            targetMagnet.y = magnetInitPos[idx].y;
          }
        }
      }
    }
  }

  // 顯示回答正確
  if (showCorrect) {
    textSize(40);
    fill(0, 180, 0);
    text("回答正確", width / 2, height / 2);
    // 1秒後消失
    if (millis() - correctTimer > 1000) {
      showCorrect = false;
      // 若全部都消失，重新出題
      if (magnets.every(m => m.removed)) {
        nextQuestion();
      }
    }
  }

  // 顯示回答錯誤
  if (showWrong) {
    textSize(40);
    fill(255, 0, 0);
    text("回答錯誤", width / 2, height / 2);
    // 1秒後消失
    if (millis() - wrongTimer > 1000) {
      showWrong = false;
    }
  }
}

// 隨機產生三張圖片與三個對應名稱
function nextQuestion() {
  // 上方三張圖片
  topImgsIdxs = [];
  while (topImgsIdxs.length < 3) {
    let idx = floor(random(imgLabels.length));
    if (!topImgsIdxs.includes(idx)) {
      topImgsIdxs.push(idx);
    }
  }
  // 下方三個名稱，必須對應上方三張圖片
  bottomLabelsIdxs = [...topImgsIdxs];
  shuffle(bottomLabelsIdxs, true);

  // 重新初始化磁鐵方塊
  magnets = [];
  magnetInitPos = [];
}

// 磁鐵方塊物件
class Magnet {
  constructor(x, y, label, idx) {
    this.x = x;
    this.y = y;
    this.label = label;
    this.idx = idx;
    this.paddingX = 28;
    this.paddingY = 16;
    this.removed = false;
  }

  getWidth() {
    textSize(24 * 0.6);
    return textWidth(this.label) + this.paddingX * 2;
  }

  display() {
    if (this.removed) return;
    textSize(24 * 0.6);
    let tw = textWidth(this.label);
    let th = textAscent() + textDescent();
    let w = tw + this.paddingX * 2;
    let h = th + this.paddingY * 2;

    fill(255, 255, 255, 180);
    stroke(80, 120, 200);
    strokeWeight(2.5);
    rectMode(CENTER);
    rect(this.x, this.y, w, h, 10);

    noStroke();
    fill(30, 30, 60);
    text(this.label, this.x, this.y + 2);
  }
}