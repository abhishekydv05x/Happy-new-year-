// Basic interactive 3D Neon New Year site logic
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const tapOverlay = document.getElementById('tapOverlay');
const timerEl = document.getElementById('timer');
const toPage2Btn = document.getElementById('toPage2');
const muteBtn = document.getElementById('muteBtn');
const card = document.getElementById('card');

const randomMsgEl = document.getElementById('randomMsg');
const nameForm = document.getElementById('nameForm');
const nameInput = document.getElementById('nameInput');
const personal = document.getElementById('personalWish');
const bigName = document.getElementById('bigName');
const backBtn = document.getElementById('backBtn');

let seconds = 15;
let timerInterval = null;
let audioMuted = false;
let audioCtx = null;
let osc = null;
let gainNode = null;

const messages = [
  "May your year sparkle and shine!",
  "Wishing you joy, peace & lots of success!",
  "A year of new beginnings and bright moments!",
  "Cheers to health, happiness and prosperity!",
  "Let this year be filled with magic and dreams come true!",
  "New adventures are waiting — seize them!",
  "May you laugh more, worry less, and shine brighter!",
  "A toast to beautiful memories yet to come!"
];

function initParticles(){
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const count = Math.round((w*h)/80000);

  for(let i=0;i<count;i++){
    particles.push({
      x: Math.random()*w,
      y: Math.random()*h,
      r: 1 + Math.random()*3,
      vx: (Math.random()-0.5)*0.4,
      vy: -0.2 - Math.random()*0.8,
      alpha: 0.2 + Math.random()*0.6
    });
  }

  function resize(){ w=canvas.width=innerWidth; h=canvas.height=innerHeight; }
  addEventListener('resize', resize);

  function draw(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.x += p.vx;
      p.y += p.vy;
      if(p.y < -10) { p.y = h + 10; p.x = Math.random()*w; }
      if(p.x < -20) p.x = w + 20;
      if(p.x > w + 20) p.x = -20;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}
initParticles();

// Parallax card movement
document.addEventListener('mousemove', e=>{
  const cx = innerWidth/2, cy = innerHeight/2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  const rx = dy * 6;
  const ry = -dx * 10;
  card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
});

// small floating animation for timer
function pulseTimer(){
  timerEl.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}], {duration:1200, iterations:Infinity});
}
pulseTimer();

// Start experience (gesture required for audio in many browsers)
function startExperience(){
  tapOverlay.style.display = 'none';
  ensureAudio();
  playAmbientMelody();
  speakSimple("Happy New Year! Wishing you a bright and peaceful year ahead.");
  startTimer();
  // allow navigation once timer reaches zero
}

tapOverlay.addEventListener('click', startExperience);
page1.addEventListener('click', (e)=>{
  // If overlay visible and user clicks anywhere, start
  if(tapOverlay && tapOverlay.style.display !== 'none'){
    startExperience();
  }
});

// Timer logic
function startTimer(){
  seconds = 15;
  timerEl.textContent = seconds;
  toPage2Btn.disabled = true;
  timerInterval = setInterval(()=>{
    seconds--;
    timerEl.textContent = seconds;
    if(seconds <= 0){
      clearInterval(timerInterval);
      timerEl.textContent = "0";
      toPage2Btn.disabled = false;
      toPage2Btn.classList.add('ready');
      toPage2Btn.textContent = "Enter Wishes ✨️";
      // slight bump
      toPage2Btn.animate([{transform:'translateY(6px)'},{transform:'translateY(0)'}],{duration:600, easing:'cubic-bezier(.2,.8,.2,1)'});
    }
  }, 1000);
}

// Page navigation
toPage2Btn.addEventListener('click', ()=>{
  page1.classList.add('hidden');
  page2.classList.remove('hidden');
  cycleMessages();
  // auto-focus input
  setTimeout(()=> nameInput.focus(), 400);
});

backBtn.addEventListener('click', ()=>{
  page2.classList.add('hidden');
  page1.classList.remove('hidden');
});

// Random messages cycle
let msgInterval = null;
function cycleMessages(){
  if(msgInterval) clearInterval(msgInterval);
  randomMsgEl.textContent = messages[Math.floor(Math.random()*messages.length)];
  msgInterval = setInterval(()=>{
    randomMsgEl.classList.add('faded');
    setTimeout(()=>{
      randomMsgEl.textContent = messages[Math.floor(Math.random()*messages.length)];
      randomMsgEl.classList.remove('faded');
    }, 400);
  }, 3000);
}

// Speech & ambient melody
function ensureAudio(){
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.06;
    gainNode.connect(audioCtx.destination);
  }
}

function playAmbientMelody(){
  if(!audioCtx) ensureAudio();
  osc = audioCtx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 220;
  osc.connect(gainNode);
  osc.start();

  // gentle pitch modulation to feel like a calm tune
  let t = audioCtx.currentTime;
  const notes = [220, 246.94, 261.63, 293.66]; // A3, B3, C4, D4
  for(let i=0;i<8;i++){
    osc.frequency.setValueAtTime(notes[i % notes.length], t + i*0.6);
  }
  // stop after 18s to not run forever (keeps short ambient)
  setTimeout(()=> {
    if(osc) { try{ osc.stop(); }catch(e){} osc=null; }
  }, 18000);
}

function speakSimple(text, options = {}){
  if(audioMuted) return;
  if('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(text);
    u.rate = options.rate || 0.95;
    u.pitch = options.pitch || 1.05;
    u.lang = options.lang || 'en-US';
    // optional softer volume
    u.volume = options.volume !== undefined ? options.volume : 1;
    // ensure user gesture resumed audio context for browsers requiring resume
    if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } else {
    console.warn('SpeechSynthesis not supported in this browser.');
  }
}

// Name form submit
nameForm.addEventListener('submit', e=>{
  e.preventDefault();
  const name = (nameInput.value || 'Friend').trim();
  showPersonalWish(name);
});

function showPersonalWish(name){
  bigName.textContent = `${name.toUpperCase()} —`;
  personal.classList.remove('hidden');
  // animate appearance
  personal.animate([{opacity:0, transform:'translateY(10px)'}, {opacity:1, transform:'translateY(0)'}], {duration:600, easing:'cubic-bezier(.2,.8,.2,1)'});
  // speak including the name
  speakSimple(`Happy New Year, ${name}! May this year bring you joy, health and success!`, {rate:0.95, pitch:1.02});
  // also a short melodic flourish
  playShortFlourish();
}

function playShortFlourish(){
  if(!audioCtx) ensureAudio();
  const osc2 = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  g.gain.value = 0.08;
  g.connect(audioCtx.destination);
  osc2.connect(g);
  osc2.type = 'sine';
  const now = audioCtx.currentTime;
  const notes = [440, 523.25, 659.25]; // A4, C5, E5
  osc2.frequency.setValueAtTime(notes[0], now);
  osc2.start();
  osc2.frequency.exponentialRampToValueAtTime(notes[2], now + 0.5);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
  setTimeout(()=>{ try{osc2.stop()}catch(e){} }, 800);
}

// Mute toggle
muteBtn.addEventListener('click', ()=>{
  audioMuted = !audioMuted;
  muteBtn.textContent = audioMuted ? '🔇' : '🔈';
  if(audioMuted && audioCtx) {
    try { audioCtx.suspend(); } catch(e){}
  } else if(audioCtx && audioCtx.state === 'suspended') {
    try { audioCtx.resume(); } catch(e){}
  }
});

// Small keyboard accessibility
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    // go back
    if(!page1.classList.contains('hidden')){
      // do nothing
    } else {
      backBtn.click();
    }
  }
});

// Prevent accidental selection
document.addEventListener('selectstart', e=>e.preventDefault());
