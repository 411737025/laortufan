let video;
let facePredictions = [];
let handPredictions = [];
let idx = null;
let handShape = "";
let facemesh, handpose;
let canvas;

// 老師圖片與名稱綁定
let teacherImgs = [];
let teacherNames = ["李世忠老師", "顧大維老師", "賴婷鈴老師", "蔡森暉老師", "陳慶帆老師"];
let teacherFiles = ["1.png", "2.png", "3.png", "4.png", "5.png"];
let topTeacherIdx; // 畫面上方的老師索引
let bottomOptions = []; // 下方選項（名稱）索引

function preload() {
  // 載入老師圖片
  for (let i = 0; i < teacherFiles.length; i++) {
    teacherImgs[i] = loadImage(teacherFiles[i]);
  }
}

function setup() {
  canvas = createCanvas(640, 480);

  // 攝影機
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 將 canvas 置中於視窗
  let x = (windowWidth - width) / 2;
  let y = (windowHeight - height) / 2;
  canvas.position(x, y);

  // 啟動 facemesh
  facemesh = ml5.facemesh(video, () => {});
  facemesh.on('predict', results => {
    facePredictions = results;
  });

  // 啟動 handpose
  handpose = ml5.handpose(video, () => {});
  handpose.on('predict', results => {
    handPredictions = results;
    if (handPredictions.length > 0) {
      handShape = detectHandShape(handPredictions[0]);
      if (handShape === "one") idx = 94;
      else if (handShape === "two") idx = 151;
      else if (handShape === "three") idx = 123;
      else idx = null;
    } else {
      handShape = "";
      idx = null;
    }
  });

  // 隨機產生上方老師
  topTeacherIdx = floor(random(teacherNames.length));

  // 下方產生3個選項，且其中一個必須是正確答案
  bottomOptions = [topTeacherIdx];
  while (bottomOptions.length < 3) {
    let r = floor(random(teacherNames.length));
    if (!bottomOptions.includes(r)) {
      bottomOptions.push(r);
    }
  }
  shuffle(bottomOptions, true);
}

let showWrong = false;
let wrongTimer = 0;
let showCorrect = false;
let correctTimer = 0;
let correctCount = 0;
let wrongCount = 0;

function draw() {
  background(220);
  imageMode(CENTER);
  // 圖片透明度 70%
  push();
  tint(255, 178); // 255*0.7=178
  image(video, width / 2, height / 2, width, height);
  pop();
  imageMode(CORNER);

  // 左上角顯示答對/答錯次數
  textAlign(LEFT, TOP);
  textSize(20);
  fill(0, 120, 0);
  text("正確：" + correctCount, 16, 12);
  fill(200, 0, 0);
  text("錯誤：" + wrongCount, 16, 38);

  // 畫面上半部中央顯示隨機老師圖片（縮小60%，透明度70%）
  let imgY = height * 0.25;
  imageMode(CENTER);
  push();
  tint(255, 178); // 70% 透明
  image(teacherImgs[topTeacherIdx], width / 2, imgY, 160 * 0.6, 160 * 0.6);
  pop();

  // 畫面下半部美化排列3個名稱選項（方形背景，透明50%）
  textAlign(CENTER, CENTER);
  let optionY = height * 0.75;
  let spacing = width / 4;
  let btnW = 180 * 0.6;
  let btnH = 60 * 0.6;
  let btnColor = color(255, 255, 255, 128); // 50% 透明

  // 上方標題
  let fingerLabels = ["1根手指選此答案", "2根手指選此答案", "3根手指選此答案"];
  textSize(18 * 0.8); // 縮小50%
  fill(30, 30, 60);
  noStroke();
  for (let i = 0; i < 3; i++) {
    let x = spacing * (i + 1);
    text(fingerLabels[i], x, optionY - btnH / 2 - 10); // 框上方10px
  }

  // 選項方框與文字
  textSize(32 * 0.6);
  for (let i = 0; i < 3; i++) {
    let x = spacing * (i + 1);

    // 方形背景
    fill(btnColor);
    stroke(80, 120, 200);
    strokeWeight(2.5);
    rectMode(CENTER);
    rect(x, optionY, btnW, btnH, 10);

    // 文字
    noStroke();
    fill(30, 30, 60);
    text(teacherNames[bottomOptions[i]], x, optionY);
  }

  // 顯示回答錯誤
  if (showWrong) {
    textSize(40);
    fill(255, 0, 0);
    text("回答錯誤", width / 2, height / 2);
    // 2秒後自動消失
    if (millis() - wrongTimer > 2000) {
      showWrong = false;
    }
  }

  // 顯示回答正確
  if (showCorrect) {
    textSize(40);
    fill(0, 180, 0);
    text("回答正確", width / 2, height / 2);
    // 2.5秒後自動進入新題
    if (millis() - correctTimer > 2500) {
      showCorrect = false;
      nextQuestion();
    }
  }

  // 判斷手勢選擇答案
  if (!showWrong && !showCorrect && handShape && ["one", "two", "three"].includes(handShape)) {
    let answerIdx = { one: 0, two: 1, three: 2 }[handShape];
    // 避免重複判斷，僅在偵測到手勢時執行一次
    if (typeof draw.lastHandShape === "undefined" || draw.lastHandShape !== handShape) {
      draw.lastHandShape = handShape;
      if (bottomOptions[answerIdx] === topTeacherIdx) {
        // 答對，顯示正確，2.5秒後再出題
        showCorrect = true;
        correctTimer = millis();
        correctCount++;
      } else {
        // 答錯，顯示錯誤
        showWrong = true;
        wrongTimer = millis();
        wrongCount++;
      }
    }
  }
  // 若沒偵測到手勢則重置
  if (!["one", "two", "three"].includes(handShape)) {
    draw.lastHandShape = null;
  }
}

// 重新出題
function nextQuestion() {
  // 隨機產生上方老師
  topTeacherIdx = floor(random(teacherNames.length));
  // 下方產生3個選項，且其中一個必須是正確答案
  bottomOptions = [topTeacherIdx];
  while (bottomOptions.length < 3) {
    let r = floor(random(teacherNames.length));
    if (!bottomOptions.includes(r)) {
      bottomOptions.push(r);
    }
  }
  shuffle(bottomOptions, true);
}

// 偵測手勢（判斷伸出幾根手指頭）
function detectHandShape(prediction) {
  const landmarks = prediction.landmarks;
  function isFingerUp(tipIdx, pipIdx) {
    return landmarks[tipIdx][1] < landmarks[pipIdx][1];
  }
  const fingers = [
    isFingerUp(8, 6),
    isFingerUp(12, 10),
    isFingerUp(16, 14),
    isFingerUp(20, 18)
  ];
  const upCount = fingers.filter(up => up).length;
  if (upCount === 1) return "one";
  if (upCount === 2) return "two";
  if (upCount === 3) return "three";
  return "";
}