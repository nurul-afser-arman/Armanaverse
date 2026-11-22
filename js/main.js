(() => {
  const scenes = [...document.querySelectorAll('.scene')];
  const dots = [...document.querySelectorAll('.dot')];
  const toast = document.getElementById('toast');
  let current = 0;
  let audioCtx = null, masterGain = null, musicOn = true, musicStarted = false, musicTimer = null;

  function showToast(message) {
    toast.textContent = message; toast.classList.add('show');
    clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2300);
  }
  function goTo(name) {
    const index = scenes.findIndex(s => s.dataset.scene === name);
    if (index < 0) return;
    scenes[current].classList.remove('active');
    current = index;
    scenes[current].classList.add('active');
    dots.forEach((d,i) => d.classList.toggle('current', i === current));
    window.scrollTo({top:0, behavior:'smooth'});
  }
  document.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click', () => goTo(btn.dataset.next)));

  // One continuous, original dreamy birthday instrumental for the entire journey.
  // It starts after the first user gesture and is never restarted when scenes change.
  function startMusic() {
    if (musicStarted) {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) { showToast('Your browser does not support background music.'); return; }
    audioCtx = new AudioContextClass();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = musicOn ? 0.105 : 0;
    masterGain.connect(audioCtx.destination);

    // A gentle repeating melody with soft bell-like notes and warm lower harmonies.
    const melody = [
      523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.00, 698.46,
      523.25, 659.25, 783.99, 880.00, 783.99, 698.46, 659.25, 587.33
    ];
    const bass = [261.63, 220.00, 174.61, 196.00];
    const beat = 0.46;
    let step = 0;
    let nextNoteTime = audioCtx.currentTime + 0.08;

    function tone(freq, at, duration, volume, type='sine', attack=0.035) {
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, at);
      env.gain.setValueAtTime(0.0001, at);
      env.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), at + attack);
      env.gain.exponentialRampToValueAtTime(0.0001, at + duration);
      osc.connect(env); env.connect(masterGain);
      osc.start(at); osc.stop(at + duration + 0.025);
    }
    function scheduleNote(at, index) {
      const note = melody[index % melody.length];
      tone(note, at, 0.72, 0.16, 'sine', 0.045);
      tone(note * 2, at, 0.42, 0.025, 'sine', 0.018);
      if (index % 4 === 0) {
        const chordRoot = bass[Math.floor(index / 4) % bass.length];
        tone(chordRoot, at, 1.65, 0.055, 'triangle', 0.22);
        tone(chordRoot * 1.5, at, 1.35, 0.022, 'sine', 0.2);
      }
    }
    function scheduler() {
      if (!audioCtx || audioCtx.state !== 'running') return;
      while (nextNoteTime < audioCtx.currentTime + 0.14) {
        scheduleNote(nextNoteTime, step);
        nextNoteTime += beat;
        step = (step + 1) % melody.length;
      }
    }
    audioCtx.resume().then(() => {
      scheduler();
      musicTimer = setInterval(scheduler, 25);
      musicStarted = true;
    }).catch(() => showToast('Tap once more to start the birthday music.'));
  }
  function setMusic(on) {
    musicOn = on;
    if (masterGain && audioCtx) masterGain.gain.setTargetAtTime(on ? 0.12 : 0, audioCtx.currentTime, 0.08);
    document.getElementById('musicIcon').textContent = on ? '♫' : '♪';
    document.getElementById('musicLabel').textContent = on ? 'Music on' : 'Muted';
    document.getElementById('musicToggle').setAttribute('aria-label', on ? 'Mute background music' : 'Play background music');
  }
  document.getElementById('musicToggle').addEventListener('click', () => {
    if (!musicStarted) { if (!musicOn) setMusic(true); startMusic(); }
    else setMusic(!musicOn);
  });

  // Mini-game: collect five stars.
  const field = document.getElementById('gameField'), scoreEl = document.getElementById('starScore');
  let score = 0, gameStarted = false;
  function spawnStar() {
    if (!gameStarted || score >= 5) return;
    const star = document.createElement('button');
    star.className = 'star-target'; star.type = 'button'; star.textContent = '✦';
    star.style.left = (10 + Math.random()*80) + '%'; star.style.top = (15 + Math.random()*70) + '%';
    star.setAttribute('aria-label','Collect star');
    star.addEventListener('click', () => {
      if (star.parentNode) star.remove();
      score++; scoreEl.textContent = score;
      if (score >= 5) {
        gameStarted = false;
        document.getElementById('gameHint').textContent = 'You did it! Your universe is ready. ✨';
        document.getElementById('startGame').textContent = 'Enter Armanaverse ✦';
        document.getElementById('startGame').onclick = () => goTo('entrance');
      } else spawnStar();
    });
    field.appendChild(star);
  }
  document.getElementById('startGame').addEventListener('click', () => {
    startMusic();
    if (score >= 5) { goTo('entrance'); return; }
    if (gameStarted) return;
    gameStarted = true; document.getElementById('gameHint').textContent = '';
    for (let i=0;i<Math.min(3,5-score);i++) spawnStar();
  });

  // Ready / NO interaction.
  let noCount = 0;
  document.getElementById('yesBtn').addEventListener('click', () => { startMusic(); goTo('birthday'); });
  const noBtn = document.getElementById('noBtn');
  noBtn.addEventListener('click', () => {
    noCount++;
    const messages = ['Are you sure? Think again, Madam. 🥺','Really? After all this curiosity? 😂','The YES button is looking lonely...','Madam, even the stars are waiting! ✨'];
    document.getElementById('choiceMessage').textContent = messages[Math.min(noCount-1,messages.length-1)];
    if (noCount >= 2) {
      noBtn.style.transform = `translate(${(Math.random()*70-35)}px,${(Math.random()*30-15)}px)`;
    }
  });

  // Wish candle.
  document.getElementById('wishCandle').addEventListener('click', () => {
    document.querySelector('.wish-flame').style.opacity = '0';
    document.getElementById('wishMessage').textContent = 'Wish sent into the universe. May it find its way to you. ✨';
    document.getElementById('wishContinue').classList.remove('hidden');
    burstConfetti();
  });

  // Compliment reveal.
  document.querySelectorAll('.compliment-card').forEach(card => card.addEventListener('click', () => {
    document.querySelectorAll('.compliment-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    document.getElementById('complimentReveal').textContent = card.dataset.message;
  }));

  // Cosmic scale story. The first state is visible immediately, so the first
  // tap always moves forward to Earth (never repeats the opening 'Me' state).
  const cosmicSteps = [
    {symbol:'•',label:'Me — a tiny part of this enormous world.',size:28,color:'radial-gradient(circle at 30% 30%,#fff,#f7b9da 25%,#6f4c9f 75%)'},
    {symbol:'🌍',label:'Earth — already enormous compared to me.',size:75,color:'radial-gradient(circle at 30% 30%,#a5e3ff,#3574b8 55%,#1b315c)'},
    {symbol:'☀',label:'The Sun — making our Earth look so small.',size:115,color:'radial-gradient(circle,#fff6ae 0 15%,#ffb34d 45%,#e75c36 75%)'},
    {symbol:'✦',label:'Stephenson 2-18 — among the largest known stars.',size:165,color:'radial-gradient(circle,#ffe1bd,#d66b52 60%,#54213d)'},
    {symbol:'✧',label:'The Milky Way — a galaxy beyond imagination.',size:210,color:'radial-gradient(circle,#f8d4ff,#956ec5 30%,#28204f 75%)'}
  ];
  let cosmicIndex = 0;
  const cosmosObject = document.getElementById('cosmosObject');
  const cosmosCaption = document.getElementById('cosmosCaption');
  const cosmosNext = document.getElementById('cosmosNext');
  function showCosmicStep(index) {
    const step = cosmicSteps[index];
    cosmosObject.style.width = step.size + 'px';
    cosmosObject.style.height = step.size + 'px';
    cosmosObject.style.background = step.color;
    cosmosObject.textContent = step.symbol;
    cosmosCaption.textContent = step.label;
  }
  showCosmicStep(cosmicIndex);
  cosmosNext.addEventListener('click', () => {
    if (cosmicIndex < cosmicSteps.length - 1) {
      cosmicIndex += 1;
      showCosmicStep(cosmicIndex);
      if (cosmicIndex === cosmicSteps.length - 1) cosmosNext.textContent = 'And then...';
    } else {
      document.getElementById('cosmosStage').classList.add('hidden');
      cosmosNext.classList.add('hidden');
      document.getElementById('cosmosFinal').classList.remove('hidden');
      document.getElementById('cosmosContinue').classList.remove('hidden');
    }
  });

  // Wish jar rotation.
  const wishes = [
    'May you find peace even on the busiest days. ♡',
    'May your hard work turn into beautiful achievements. ✨',
    'May you always have people who celebrate your happiness.',
    'May your confidence grow louder than your doubts.',
    'May laughter find you in the most unexpected moments.',
    'May every new chapter bring something worth remembering.',
    'May you always feel appreciated, respected, and cared for.',
    'May your dreams feel closer with every brave step.'
  ];
  let wishIndex = 0;
  document.getElementById('wishJar').addEventListener('click', () => {
    document.getElementById('wishNote').textContent = wishes[wishIndex++ % wishes.length];
    document.getElementById('wishJar').animate([{transform:'scale(1)'},{transform:'scale(1.08) rotate(-4deg)'},{transform:'scale(1)'}],{duration:500});
  });

  // Book opens, then birthday card appears.
  document.getElementById('openBook').addEventListener('click', () => {
    const book = document.getElementById('openBook');
    if (book.classList.contains('open')) return;
    book.classList.add('open');
    document.querySelector('.book-prompt').textContent = 'A little magic is unfolding...';
    setTimeout(() => {
      book.classList.add('hidden');
      document.getElementById('birthdayCard').classList.remove('hidden');
      document.getElementById('finalLine').classList.remove('hidden');
      document.getElementById('exitBtn').classList.remove('hidden');
      burstConfetti();
    }, 1450);
  });
  document.getElementById('exitBtn').addEventListener('click', () => {
    document.querySelector('.finale-inner').innerHTML = '<p class="eyebrow">You reached the end of Armanaverse</p><h1 class="display">Until the next<br><em>little adventure.</em></h1><p class="lead">Thank you for being here, Madam. Take all the good wishes with you. ♡</p><div class="portal"><span>✦</span></div>';
    document.getElementById('progressDots').classList.add('hidden');
    window.scrollTo({top:0,behavior:'smooth'});
  });

  function burstConfetti() {
    const colors = ['#ffc0df','#c5a3ff','#ffe3a6','#fff'];
    for(let i=0;i<36;i++){
      const p=document.createElement('span'); p.textContent=['✦','•','♡'][i%3];
      p.style.cssText=`position:fixed;z-index:50;left:${Math.random()*100}vw;top:-20px;color:${colors[i%colors.length]};font-size:${10+Math.random()*16}px;pointer-events:none;transition:transform ${2+Math.random()*2}s linear,opacity 3s;`;
      document.body.appendChild(p);
      requestAnimationFrame(()=>{p.style.transform=`translate(${Math.random()*100-50}px,${110+Math.random()*90}vh) rotate(${Math.random()*360}deg)`;p.style.opacity='0'});
      setTimeout(()=>p.remove(),4200);
    }
  }

  // Ambient starfield.
  const canvas = document.getElementById('starfield'), ctx = canvas.getContext('2d');
  let stars=[];
  function resize(){canvas.width=innerWidth*devicePixelRatio;canvas.height=innerHeight*devicePixelRatio;ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);stars=Array.from({length:Math.min(130,Math.floor(innerWidth/7))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.4+.2,a:Math.random()*.6+.15,v:Math.random()*.004+.001}));}
  function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);stars.forEach(s=>{s.a+=s.v;if(s.a>.85||s.a<.12)s.v*=-1;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=`rgba(255,225,247,${s.a})`;ctx.fill()});requestAnimationFrame(draw)}
  addEventListener('resize',resize);resize();draw();
})();