let bgImg;
let teacherBtn, btn2, btn3, btn4;
let iframe;
let borderColor;

function preload() {
  bgImg = loadImage('bg.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  teacherBtn = createButton('教科系老師列表');
  teacherBtn.size(100, 50);
  teacherBtn.position(50, 50);
  teacherBtn.style('font-size', '12px');
  teacherBtn.style('background', 'rgba(255,255,255,0.5)');
  teacherBtn.style('border-width', '2.5px');
  teacherBtn.style('border-style', 'solid');
  teacherBtn.style('border-radius', '5px');
  teacherBtn.mousePressed(showIframe);

  btn2 = createButton('遊戲1');
  btn2.size(100, 50);
  btn2.position(50, 150);
  btn2.style('font-size', '12px');
  btn2.style('background', 'rgba(255,255,255,0.5)');
  btn2.style('border-width', '2.5px');
  btn2.style('border-style', 'solid');
  btn2.style('border-radius', '5px');
  btn2.mousePressed(showGame1);

  btn3 = createButton('遊戲2');
  btn3.size(100, 50);
  btn3.position(50, 250);
  btn3.style('font-size', '12px');
  btn3.style('background', 'rgba(255,255,255,0.5)');
  btn3.style('border-width', '2.5px');
  btn3.style('border-style', 'solid');
  btn3.style('border-radius', '5px');
  btn3.mousePressed(showGame2);

  // 新增按鈕四「說明」
  btn4 = createButton('說明');
  btn4.size(100, 50);
  btn4.position(50, 350);
  btn4.style('font-size', '12px');
  btn4.style('background', 'rgba(255,255,255,0.5)');
  btn4.style('border-width', '2.5px');
  btn4.style('border-style', 'solid');
  btn4.style('border-radius', '5px');
  btn4.mousePressed(showInfo);
}

function draw() {
  if (bgImg) {
    background(bgImg);
  } else {
    background(220);
  }

  // 邊框顏色隨時間變化
  borderColor = color(
    128 + 127 * sin(millis() / 500),
    128 + 127 * sin(millis() / 700),
    128 + 127 * sin(millis() / 900)
  );
  if (teacherBtn) {
    teacherBtn.style('border-color', borderColor.toString('#rrggbb'));
  }
  if (btn2) {
    btn2.style('border-color', borderColor.toString('#rrggbb'));
  }
  if (btn3) {
    btn3.style('border-color', borderColor.toString('#rrggbb'));
  }
}

function showIframe() {
  // 再次點擊時關閉 iframe
  if (iframe && iframe.elt.src.includes('et.tku.edu.tw')) {
    iframe.remove();
    iframe = null;
    return;
  }
  removeIframe();
  iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw/Front/Member/allteachers/Page.aspx?id=deUAtLOEI8A=');
  iframe.size(windowWidth * 0.8, windowHeight * 0.8);
  iframe.position(windowWidth * 0.1, windowHeight * 0.1);
  iframe.style('z-index', '1000');
}

function showGame1() {
  if (iframe && iframe.elt.src.includes('index1.html')) {
    iframe.remove();
    iframe = null;
    return;
  }
  removeIframe();
  iframe = createElement('iframe');
  iframe.attribute('src', 'index1.html');
  iframe.size(windowWidth * 0.8, windowHeight * 0.8);
  iframe.position(windowWidth * 0.1, windowHeight * 0.1);
  iframe.style('z-index', '1000');
}

function showGame2() {
  if (iframe && iframe.elt.src.includes('index3.html')) {
    iframe.remove();
    iframe = null;
    return;
  }
  removeIframe();
  iframe = createElement('iframe');
  iframe.attribute('src', 'index3.html');
  iframe.size(windowWidth * 0.8, windowHeight * 0.8);
  iframe.position(windowWidth * 0.1, windowHeight * 0.1);
  iframe.style('z-index', '1000');
}

// 新增說明頁面
function showInfo() {
  // 再次點擊時關閉說明文字
  if (iframe && iframe.elt.id === 'infoBox') {
    iframe.remove();
    iframe = null;
    return;
  }
  removeIframe();
  // 用 div 顯示說明文字在畫面中央
  iframe = createDiv(
    "1. 遊玩遊戲1跟2之前記得先點教科系老師列表認識老師們<br>" +
    "2. 遊戲1為比出手指1根2根或是3根的來選擇正確答案得選擇題<br>" +
    "3. 遊戲2為利用手指拿動文字放到對應的老師圖片上<br>" +
    "4. 再次點擊說明按鈕關閉此頁面" 
  );
  iframe.id('infoBox');
  iframe.style('position', 'fixed');
  iframe.style('left', '50%');
  iframe.style('top', '50%');
  iframe.style('transform', 'translate(-50%, -50%)');
  iframe.style('background', 'rgba(255,255,255,0.95)');
  iframe.style('padding', '32px');
  iframe.style('border-radius', '12px');
  iframe.style('font-size', '20px');
  iframe.style('color', '#222');
  iframe.style('z-index', '2000');
  iframe.style('box-shadow', '0 4px 24px rgba(0,0,0,0.2)');
  iframe.style('text-align', 'left');
  iframe.style('max-width', '80vw');
}

// 移除舊的 iframe，避免重複產生
function removeIframe() {
  if (iframe) {
    iframe.remove();
    iframe = null;
  }
}