// Canvas helpers
const fwCanvas = document.getElementById('fireworks');
const fwCtx = fwCanvas.getContext('2d');
const cakeCanvas = document.getElementById('cake');
const cakeCtx = cakeCanvas.getContext('2d');
const cakeWrap = document.getElementById('cakeWrap');

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  W = Math.floor(window.innerWidth);
  H = Math.floor(window.innerHeight);
  fwCanvas.width = Math.floor(W * DPR);
  fwCanvas.height = Math.floor(H * DPR);
  fwCanvas.style.width = W + 'px';
  fwCanvas.style.height = H + 'px';
  try {
    if (typeof fwCtx.setTransform === 'function') {
      fwCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    } else {
      fwCtx.resetTransform && fwCtx.resetTransform();
      fwCtx.scale(DPR, DPR);
    }
  } catch (e) {
    // Fallback for older browsers
    fwCtx.resetTransform && fwCtx.resetTransform();
    fwCtx.scale(DPR, DPR);
  }
}
window.addEventListener('resize', resize);
resize();

// -------- Pixel cake drawing (no glow, no rotation) --------
function drawPixelCake(ctx) {
  ctx.clearRect(0, 0, cakeCanvas.width, cakeCanvas.height);

  const cx = cakeCanvas.width / 2;
  const cy = cakeCanvas.height / 2 + 20;

  const px = 10; // pixel size
  const rows = 9;
  const cols = 12;
  const left = cx - (cols * px)/2;
  const top = cy - (rows * px)/2;

  // Cake body (flat pixel blocks)
  for (let r = 3; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.fillStyle = (r % 2 === 0) ? '#ffb3de' : '#ff9bd5';
      ctx.fillRect(left + c*px, top + r*px, px-1, px-1);
    }
  }

  // Icing drips
  ctx.fillStyle = '#fff0fb';
  for (let c = 0; c < cols; c++) {
    ctx.fillRect(left + c*px, top + 2*px, px-1, px-1);
    if (c % 3 === 0) ctx.fillRect(left + c*px, top + 3*px, px-1, px-1);
  }

  // Candle (flat)
  const candleW = px;
  const candleH = px*3;
  const candleX = cx - candleW/2;
  const candleY = top - candleH + 2*px;
  ctx.fillStyle = '#6bd5ff';
  ctx.fillRect(candleX, candleY, candleW, candleH);

  // Flame (no glow)
  ctx.fillStyle = '#ffc34d';
  ctx.beginPath();
  ctx.ellipse(cx, candleY - 6, 6, 10, 0, 0, Math.PI*2);
  ctx.fill();
}

drawPixelCake(cakeCtx);

// -------- Fireworks engine --------
const particles = [];
function rand(min, max){ return Math.random() * (max - min) + min; }

class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y;
    const angle = rand(0, Math.PI * 2);
    const speed = rand(2.2, 6.2);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = rand(60, 120);
    this.age = 0;
    this.color = color;
    this.size = rand(1.2, 2.6);
  }
  step() {
    this.age++;
    this.vy += 0.03; // gravity
    this.vx *= 0.99;
    this.vy *= 0.99;
    this.x += this.vx;
    this.y += this.vy;
    return this.age < this.life;
  }
  draw(ctx) {
    const t = this.age / this.life;
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
  }
}

function burst(x, y, colors) {
  const count = 90;
  for (let i=0;i<count;i++) {
    particles.push(new Particle(x, y, colors[Math.floor(Math.random()*colors.length)]));
  }
}

function fireworksTick() {
  // dark background layer
  fwCtx.fillStyle = 'rgba(4, 6, 12, 0.40)';
  fwCtx.fillRect(0,0,W,H);

  // draw current photo softly under fireworks
  drawPhotoBackground();

  // fireworks
  fwCtx.save();
  fwCtx.globalCompositeOperation = 'lighter';
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (!p.step()) particles.splice(i,1);
    else p.draw(fwCtx);
  }
  fwCtx.restore();
  requestAnimationFrame(fireworksTick);
}
requestAnimationFrame(fireworksTick);
// Make sure something happens immediately
burst(window.innerWidth/2, window.innerHeight*0.35, ['#ff7bd7','#ffd089','#6bd5ff','#a3ff78']);
// Start showing photos immediately
photoAlpha = 0.45;
console.log('Birthday site initialized');

// Auto ambient fireworks (保留)
setInterval(()=>{
  burst(rand(W*0.1, W*0.9), rand(H*0.15, H*0.8), ['#ff7bd7','#ffd089','#6bd5ff','#a3ff78']);
}, 2200);

// -------- Photo slideshow in canvas --------
const photoFiles = [
  'IMG_1025.JPG','IMG_1730.JPG','IMG_2227.JPG','IMG_2524 5.JPG',
  'IMG_2589.JPG','IMG_2732.JPG','IMG_5573.JPG','IMG_5624.JPG','IMG_6044.JPG',
  'DDE1FB40-CB28-4B3B-9B69-A293220A7060-7281-00000209A0751CCF.JPG'
];
const photosCache = new Map();
let photoIdx = 0;
let photoAlpha = 0;
let autoSlideTimer = null;

function loadPhoto(name) {
  if (photosCache.has(name)) return photosCache.get(name);
  const img = new Image();
  // Ensure spaces and special chars are encoded properly
  img.src = 'assets/photos/' + encodeURIComponent(name);
  photosCache.set(name, img);
  return img;
}

function drawPhotoBackground() {
  const name = photoFiles[photoIdx % photoFiles.length];
  const img = loadPhoto(name);
  if (!img.complete) return; // wait until loaded
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(W / iw, H / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (W - dw) / 2;
  const dy = (H - dh) / 2;
  fwCtx.save();
  fwCtx.globalAlpha = Math.min(0.45, photoAlpha);
  fwCtx.globalCompositeOperation = 'source-over';
  fwCtx.drawImage(img, dx, dy, dw, dh);
  fwCtx.restore();
  // fade in
  if (photoAlpha < 0.45) photoAlpha += 0.01;
}

// -------- Background music (Happy Birthday via WebAudio) --------
let audioStarted = false;
let audioCtx = null;
let loopTimer = null;
function playNote(freq, duration, time, type='sine') {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.18, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration - 0.02);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(time);
  osc.stop(time + duration);
}

// Frequencies for C major
const notes = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77
};

// Happy Birthday (simplified) in C
const melody = [
  ['G4',0.4], ['G4',0.4], ['A4',0.6], ['G4',0.6], ['C5',0.6], ['B4',0.9],
  ['G4',0.4], ['G4',0.4], ['A4',0.6], ['G4',0.6], ['D5',0.6], ['C5',0.9],
  ['G4',0.4], ['G4',0.4], ['G5',0.6], ['E5',0.6], ['C5',0.6], ['B4',0.6], ['A4',0.9],
  ['F5',0.4], ['F5',0.4], ['E5',0.6], ['C5',0.6], ['D5',0.6], ['C5',0.9]
];
const GAP = 0.05;
const melodyTotal = melody.reduce((sum, [, d]) => sum + d + GAP, 0);

function scheduleMelody(start) {
  let t = start;
  for (const [n, dur] of melody) {
    const freq = notes[n];
    playNote(freq, dur, t, 'triangle');
    t += dur + GAP;
  }
}

function startMusic(){
  if (audioStarted) return;
  audioStarted = true;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function loop() {
    const start = audioCtx.currentTime + 0.05;
    scheduleMelody(start);
    loopTimer = setTimeout(loop, (melodyTotal + 0.2) * 1000);
  }
  loop();
}

// -------- Interaction: click cake triggers a big burst, photos & music --------
function nextPhoto() {
  photoIdx = (photoIdx + 1) % photoFiles.length;
  photoAlpha = 0; // reset fade
}

function startAutoSlide() {
  if (autoSlideTimer) return;
  autoSlideTimer = setInterval(nextPhoto, 4000);
}

function onCakeClick(ev){
  const rect = cakeCanvas.getBoundingClientRect();
  const x = rect.left + rect.width/2;
  const y = rect.top + rect.height/2;
  burst(x, y, ['#ff7bd7','#ffd089','#6bd5ff','#a3ff78','#fff']);
  nextPhoto();
  startAutoSlide();
  startMusic();
}

cakeWrap.addEventListener('click', onCakeClick);

// Keyboard accessibility
cakeWrap.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter' || e.key === ' ') onCakeClick(e);
});

// -------- ASCII cats: simple frame toggle --------
const catLeft = document.getElementById('catLeft');
const catRight = document.getElementById('catRight');
const frames = [
  "\\/\\_/\\ \n( ^.^ )\n > ^ <",
  "\\/\\_/\\ \n( o.o )\n < ^ >"
];
let f = 0;
setInterval(()=>{
  f = (f + 1) % frames.length;
  catLeft.textContent = frames[f];
  catRight.textContent = frames[(f+1)%frames.length];
}, 500);
