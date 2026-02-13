const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const PARTICLE_COUNT = 3000;
const HEART_SIZE = 15;

let width, height, particles = [], isCelebrated = false, time = 0, yesScale = 1;
const phrases = ["No", "Are you sure?", "Really?", "Think again!", "Pls?", "I have snacks!", "Error 404"];
let phraseIndex = 0;

window.onload = () => { resize(); initParticles(); animate(); };
window.addEventListener('resize', resize);
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

const moveNoButton = () => {
    if (isCelebrated) return;
    yesScale += 0.2;
    yesBtn.style.transform = `scale(${yesScale})`;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    noBtn.innerText = phrases[phraseIndex];
    
    const maxX = window.innerWidth * 0.7;
    const maxY = window.innerHeight * 0.7;
    const x = Math.random() * maxX - (maxX / 2);
    const y = Math.random() * maxY - (maxY / 2);

    noBtn.style.position = 'fixed';
    noBtn.style.left = '50%';
    noBtn.style.top = '50%';
    noBtn.style.transform = `translate(${x}px, ${y}px)`;
};

noBtn.addEventListener('mouseover', moveNoButton);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); });

window.acceptProposal = function () {
    if (isCelebrated) return;
    isCelebrated = true;

    document.getElementById('mainUI').style.opacity = '0';
    document.getElementById('mainUI').style.pointerEvents = 'none';
    
    const successLayer = document.getElementById('successScreen');
    successLayer.style.opacity = '1';
    successLayer.classList.add('active'); // এনিমেশন শুরু করবে

    createHeartRain();
    
    particles.forEach(p => {
        p.vx = (Math.random() - 0.5) * 15;
        p.vy = (Math.random() - 0.5) * 15;
    });
};

function createHeartRain() {
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart-rain';
        heart.innerText = ['❤️', '💖', '💕', '💗'][Math.floor(Math.random() * 4)];
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
        heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
    }, 200);
}

class Particle {
    constructor() {
        this.setHeartPos();
        this.x = this.tx; this.y = this.ty; this.z = this.tz;
        this.vx = this.vy = this.vz = 0;
        this.size = Math.random() * 2;
        this.color = `hsl(${340 + Math.random() * 40}, 100%, ${60 + Math.random() * 20}%)`;
    }
    setHeartPos() {
        let t = Math.random() * Math.PI * 2;
        let u = Math.random();
        let scale = Math.pow(u, 1/3) * HEART_SIZE;
        this.tx = 16 * Math.pow(Math.sin(t), 3) * scale;
        this.ty = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) * scale;
        this.tz = (Math.random() - 0.5) * 5 * scale;
    }
    update(beat) {
        if (isCelebrated) {
            this.x += this.vx; this.y += this.vy; this.size *= 0.99;
        } else {
            let p = 1 + beat * 0.1;
            this.x += (this.tx * p - this.x) * 0.1;
            this.y += (this.ty * p - this.y) * 0.1;
            this.z += (this.tz * p - this.z) * 0.1;
        }
    }
    draw(ctx, rx, ry) {
        let y1 = this.y * Math.cos(rx) - this.z * Math.sin(rx);
        let z1 = this.z * Math.cos(rx) + this.y * Math.sin(rx);
        let x1 = this.x * Math.cos(ry) - z1 * Math.sin(ry);
        let z2 = z1 * Math.cos(ry) + this.x * Math.sin(ry);
        let s = 500 / (500 + z2);
        if (s < 0) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(width/2 + x1*s, height/2 + y1*s, this.size*s, 0, 7);
        ctx.fill();
    }
}

function initParticles() { for(let i=0; i<PARTICLE_COUNT; i++) particles.push(new Particle()); }

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(15, 2, 5, 0.3)';
    ctx.fillRect(0, 0, width, height);
    time += 0.02;
    let beat = Math.pow(Math.sin(time * 3), 60) * 0.5;
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(p => { p.update(beat); p.draw(ctx, 0, time * 0.2); });
    ctx.globalCompositeOperation = 'source-over';
}
