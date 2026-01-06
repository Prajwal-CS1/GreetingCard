const openBtn = document.getElementById('openBtn');
const front = document.getElementById('front');
const inside = document.getElementById('inside');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const noContainer = document.getElementById('noContainer');
let noRainInterval = null;

openBtn.addEventListener('click', () => {
    front.classList.add('hidden');
    inside.classList.remove('hidden');
    // gentle pop effect
    const card = document.getElementById('card');
    card.style.transform = 'scale(1.03)';
    setTimeout(() => card.style.transform = '', 320);
    // spawn a couple of hearts for extra flair
    spawnHearts(6);
});

yesBtn.addEventListener('click', () => {
    // play a little sound and show success message + confetti
    playDing();
    inside.innerHTML = `<h2 class="mb-2">Yes! 💕</h2><p class="mb-3">yayyyyyyyyyyyy!</p>`;
    showConfetti();
    // lovely glow
    document.getElementById('card').classList.add('success');
});

// Make NO hard to click: dodge on hover, and on click spawn "no"s everywhere
// Hover behavior: normally dodge; after activation, hovering spawns running NOs
// track repeated clicks/taps so that after several tries the button shows a message
let noClickCount = 0;
const NO_CLICK_THRESHOLD = 5; // after this many clicks show the message

noBtn.addEventListener('mouseenter', () => {
    // Only dodge if it has been clicked at least once AND hasn't transformed yet
    if (noClickCount > 0 && noClickCount < NO_CLICK_THRESHOLD) {
        dodgeButton(noBtn);
    }
});

noBtn.addEventListener('touchstart', (e) => {
    if (noClickCount > 0 && noClickCount < NO_CLICK_THRESHOLD) {
        e.preventDefault();
        dodgeButton(noBtn);
    }
});

noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    noClickCount++;

    if (noClickCount >= NO_CLICK_THRESHOLD) {
        // Transform into message
        showNoTransformation(noBtn);
    } else {
        // Dodge on click
        dodgeButton(noBtn);

        // After a couple of tries, show the temporary message
        if (noClickCount >= 2 && noClickCount < NO_CLICK_THRESHOLD) {
            showTemporaryText(noBtn, 'no i am not', 4500);
        }
    }
});

function showTemporaryText(btn, text, duration) {
    if (btn.dataset.tempState) return;
    btn.dataset.tempState = 'true';

    const originalText = btn.textContent;
    btn.textContent = text;

    // Add a slight style change for emphasis if desired
    btn.style.fontWeight = 'bold';

    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.fontWeight = '';
        delete btn.dataset.tempState;
    }, duration);
}

function showNoTransformation(btn) {
    // Hide the button or settle it
    btn.style.display = 'none';

    // Create the popup message element
    const popup = document.createElement('div');
    popup.className = 'final-message-popup';
    popup.textContent = 'i am not the one';
    document.body.appendChild(popup);

    // Trigger the "pop up" animation
    setTimeout(() => popup.classList.add('show'), 20);

    // Optional: play a subtle sound or flair when it pops
    startNoRain();
}


function dodgeButton(btn) {
    // allow the NO button to move anywhere on the viewport using fixed positioning
    const btnRect = btn.getBoundingClientRect();
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    const padding = 8;

    // compute a random position within the viewport while keeping the button fully visible
    const maxX = Math.max(0, vw - btnRect.width - padding);
    const maxY = Math.max(0, vh - btnRect.height - padding);
    const x = Math.floor(Math.random() * maxX) + padding;
    const y = Math.floor(Math.random() * maxY) + padding;

    // apply fixed positioning and make sure it's above other elements
    btn.classList.add('floating-btn');
    btn.style.left = x + 'px';
    btn.style.top = y + 'px';
    btn.style.transform = `rotate(${(Math.random() * 40 - 20)}deg)`;

    // small bounce for personality
    setTimeout(() => { btn.style.transform += ' translateY(-6px)'; }, 200);
    setTimeout(() => { btn.style.transform = `rotate(${(Math.random() * 40 - 20)}deg)`; }, 520);
}

function startNoRain() {
    if (noRainInterval) return; // already going
    noRainInterval = setInterval(() => spawnNo(), 70);
    setTimeout(() => {
        clearInterval(noRainInterval);
        noRainInterval = setInterval(() => spawnNo(), 35);
    }, 1400);
    // stop spawning after some time, but leave existing NO bubbles on screen
    setTimeout(() => stopNoRain(), 6500);
}

function stopNoRain() {
    clearInterval(noRainInterval);
    noRainInterval = null;
    // Intentionally do NOT remove existing .no-bubble elements so they persist on screen
}

function spawnNo() {
    // limit total number to avoid excessive memory use
    const maxBubbles = 400;
    if (document.querySelectorAll('.no-bubble').length > maxBubbles) return;

    const card = document.getElementById('card');
    const cardRect = card.getBoundingClientRect();

    const el = document.createElement('div');
    el.className = 'no-bubble';
    el.textContent = 'NO';
    const size = 14 + Math.random() * 36;
    el.style.fontSize = (size * 0.6) + 'px';
    el.style.padding = Math.round(8 + Math.random() * 10) + 'px ' + Math.round(10 + Math.random() * 8) + 'px';

    // START from somewhere inside the card container
    const startX = cardRect.left + Math.random() * cardRect.width;
    const startY = cardRect.top + Math.random() * cardRect.height;
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';
    el.style.background = randomColor();
    el.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;

    noContainer.appendChild(el);

    // choose an off-screen target so the NO travels across the screen
    const margin = 120;
    const edge = Math.floor(Math.random() * 4); // 0=right,1=left,2=top,3=bottom
    let endX, endY;
    switch (edge) {
        case 0: endX = window.innerWidth + margin + Math.random() * 200; endY = Math.random() * window.innerHeight; break;
        case 1: endX = -margin - Math.random() * 200; endY = Math.random() * window.innerHeight; break;
        case 2: endX = Math.random() * window.innerWidth; endY = -margin - Math.random() * 200; break;
        default: endX = Math.random() * window.innerWidth; endY = window.innerHeight + margin + Math.random() * 200; break;
    }

    // animate between the card and off-screen point repeatedly so NOs keep running
    const duration = 3000 + Math.random() * 4000;
    el.animate([
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${endX - startX}px, ${endY - startY}px) rotate(${(Math.random() * 720 - 360)}deg)`, opacity: 1 }
    ], { duration, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(.2,.8,.2,1)', delay: Math.random() * 500 });
    // element stays in DOM (persistent)
}

function randomColor() {
    const palette = ['#222', '#ff6b9a', '#ff9db7', '#ffd1dc', '#7f7fff', '#42d6a4', '#ffcd82'];
    return palette[Math.floor(Math.random() * palette.length)];
}

function showConfetti() {
    const confWrap = document.createElement('div');
    confWrap.className = 'confetti';
    document.body.appendChild(confWrap);
    const colors = ['#ff6b9a', '#ffcd82', '#ffd1dc', '#91f5d8', '#7f7fff', '#ffddee'];
    for (let i = 0; i < 90; i++) {
        const s = document.createElement('span');
        s.style.left = (30 + Math.random() * 40) + 'vw';
        s.style.top = (-10 - Math.random() * 10) + 'vh';
        s.style.width = (6 + Math.random() * 12) + 'px';
        s.style.height = (10 + Math.random() * 18) + 'px';
        s.style.background = colors[Math.floor(Math.random() * colors.length)];
        s.style.animationDuration = (1.2 + Math.random() * 2.2) + 's';
        s.style.transform = `rotate(${Math.random() * 360}deg)`;
        confWrap.appendChild(s);
        setTimeout(() => s.remove(), 4500);
    }
    setTimeout(() => confWrap.remove(), 4600);
}

// spawn small hearts when opening
function spawnHearts(count = 4) {
    const wrap = document.body;
    for (let i = 0; i < count; i++) {
        const h = document.createElement('div');
        h.className = 'heart';
        h.style.left = (40 + Math.random() * 20) + 'vw';
        h.style.top = (55 + Math.random() * 20) + 'vh';
        wrap.appendChild(h);
        setTimeout(() => h.classList.add('animate'), 40);
        setTimeout(() => h.remove(), 3200);
    }
}

// small tone for success
function playDing() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = 720;
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.9);
    } catch (e) {/* ignore if audio blocked */ }
}


