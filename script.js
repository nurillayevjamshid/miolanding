/* ============================================
   MIO BEAUTY - Landing Page Script
   Ultra-dynamic background + Advanced Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    initDynamicBackground();
    initPhoneMask();
    initFormHandling();
    initInteractions();
});

// ============================================
// Advanced Dynamic Background (Canvas)
// ============================================
function initDynamicBackground() {
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');

    let width, height;
    let time = 0;
    let mouseX = 0.5, mouseY = 0.5;
    let targetMouseX = 0.5, targetMouseY = 0.5;

    const metaballs = [];
    const metaballCount = 10;
    const ribbons = [];
    const ribbonCount = 5;
    const softCircles = [];
    const circleCount = 25;
    const beams = [];
    const beamCount = 6;
    const sparkles = [];
    const sparkleCount = 60;
    const dustParticles = [];
    const dustCount = 80;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function initMetaballs() {
        for (let i = 0; i < metaballCount; i++) {
            metaballs.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 1.0,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 150 + 80,
                phase: Math.random() * Math.PI * 2
            });
        }
    }

    function initRibbons() {
        for (let i = 0; i < ribbonCount; i++) {
            ribbons.push({
                yBase: height * (0.1 + i * 0.18),
                amplitude: 40 + i * 25,
                frequency: 0.0025 + i * 0.0006,
                speed: 0.01 + i * 0.003,
                phase: Math.random() * Math.PI * 2,
                thickness: 70 + i * 20,
                opacity: 0.02 + i * 0.004,
                hueShift: i * 10
            });
        }
    }

    function initCircles() {
        for (let i = 0; i < circleCount; i++) {
            softCircles.push({
                baseX: Math.random() * width,
                baseY: Math.random() * height,
                x: 0, y: 0,
                radius: Math.random() * 80 + 20,
                opacity: Math.random() * 0.06 + 0.015,
                phase: Math.random() * Math.PI * 2,
                phaseSpeed: Math.random() * 0.012 + 0.004,
                wanderRadius: Math.random() * 150 + 50,
                r: 240 + Math.random() * 15,
                g: 170 + Math.random() * 40,
                b: 150 + Math.random() * 30
            });
        }
    }

    function initBeams() {
        for (let i = 0; i < beamCount; i++) {
            beams.push({
                angle: (Math.PI * 0.35) + (Math.PI * 0.4 / beamCount) * i,
                width: Math.random() * 180 + 100,
                length: Math.max(width, height) * 1.2,
                opacity: Math.random() * 0.012 + 0.006,
                speed: (Math.random() - 0.5) * 0.0025,
                originX: -50,
                originY: -100
            });
        }
    }

    function initSparkles() {
        for (let i = 0; i < sparkleCount; i++) {
            sparkles.push(createSparkle());
        }
    }

    function createSparkle(x, y, isExplosion = false) {
        return {
            x: x !== undefined ? x : Math.random() * width,
            y: y !== undefined ? y : Math.random() * height,
            size: isExplosion ? Math.random() * 4 + 1 : Math.random() * 2.5 + 0.5,
            opacity: 0,
            maxOpacity: Math.random() * 0.6 + 0.2,
            phase: Math.random() * Math.PI * 2,
            speed: isExplosion ? Math.random() * 0.1 + 0.05 : Math.random() * 0.025 + 0.01,
            vx: isExplosion ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 0.4,
            vy: isExplosion ? (Math.random() - 0.5) * 6 : -0.2 - Math.random() * 0.2,
            life: isExplosion ? 1.0 : -1 // -1 means infinite
        };
    }

    function initDust() {
        for (let i = 0; i < dustCount; i++) {
            dustParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 1.5 + 0.5,
                vx: (Math.random() - 0.5) * 0.2,
                vy: (Math.random() - 0.5) * 0.2,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    }

    function drawRibbons() {
        ribbons.forEach(ribbon => {
            ribbon.phase += ribbon.speed;
            ctx.beginPath();
            ctx.moveTo(-20, ribbon.yBase);
            for (let x = -20; x <= width + 20; x += 3) {
                const wave1 = Math.sin(x * ribbon.frequency + ribbon.phase);
                const wave2 = Math.sin(x * ribbon.frequency * 0.5 + ribbon.phase * 0.7);
                const y = ribbon.yBase + (wave1 * ribbon.amplitude) + (wave2 * ribbon.amplitude * 0.5) + (mouseY - 0.5) * 80;
                ctx.lineTo(x, y);
            }
            const grad = ctx.createLinearGradient(0, 0, width, 0);
            const r = 244 - ribbon.hueShift, g = 185 + ribbon.hueShift, b = 160 + ribbon.hueShift;
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
            grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${ribbon.opacity})`);
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = ribbon.thickness;
            ctx.lineCap = 'round';
            ctx.stroke();
        });
    }

    function drawMetaballs() {
        metaballs.forEach(ball => {
            ball.x += ball.vx; ball.y += ball.vy; ball.phase += 0.008;
            if (ball.x < -200) ball.vx = Math.abs(ball.vx);
            if (ball.x > width + 200) ball.vx = -Math.abs(ball.vx);
            if (ball.y < -200) ball.vy = Math.abs(ball.vy);
            if (ball.y > height + 200) ball.vy = -Math.abs(ball.vy);
            const r = ball.radius + Math.sin(ball.phase) * 15;
            const grad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, r);
            grad.addColorStop(0, 'rgba(255, 215, 190, 0.07)');
            grad.addColorStop(1, 'rgba(255, 215, 190, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2); ctx.fill();
        });
    }

    function drawDust() {
        ctx.fillStyle = 'rgba(255, 220, 200, 0.2)';
        dustParticles.forEach(p => {
            p.x += p.vx + (mouseX - 0.5) * 0.5;
            p.y += p.vy + (mouseY - 0.5) * 0.5;
            if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
            ctx.globalAlpha = p.opacity;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    function drawSparkles() {
        for (let i = sparkles.length - 1; i >= 0; i--) {
            const sp = sparkles[i];
            sp.phase += sp.speed; sp.x += sp.vx; sp.y += sp.vy;
            if (sp.life > 0) {
                sp.life -= 0.015;
                sp.opacity = sp.maxOpacity * sp.life;
                if (sp.life <= 0) { sparkles.splice(i, 1); continue; }
            } else {
                sp.opacity = sp.maxOpacity * Math.abs(Math.sin(sp.phase));
                if (sp.y < -20) { sp.y = height + 20; sp.x = Math.random() * width; }
            }
            if (sp.opacity > 0.02) {
                ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 210, 180, ${sp.opacity})`; ctx.fill();
            }
        }
    }

    function animate() {
        time += 0.01;
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;
        ctx.clearRect(0, 0, width, height);
        drawRibbons();
        drawMetaballs();
        drawDust();
        drawSparkles();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', e => {
        targetMouseX = e.clientX / width; targetMouseY = e.clientY / height;
        updateParallax();
    });
    document.addEventListener('mousedown', e => {
        for (let i = 0; i < 15; i++) sparkles.push(createSparkle(e.clientX, e.clientY, true));
    });

    resize(); initMetaballs(); initRibbons(); initCircles(); initBeams(); initSparkles(); initDust();
    animate();
}

// ============================================
// Parallax & UI Interactions
// ============================================
function updateParallax() {
    const brandContent = document.querySelector('.brand-content');
    const formWrapper = document.querySelector('.form-wrapper');
    const mobileContent = document.querySelector('.mobile-brand-content');

    const moveX = (window.innerWidth / 2 - window.event.clientX) / 40;
    const moveY = (window.innerHeight / 2 - window.event.clientY) / 40;

    if (brandContent) brandContent.style.transform = `translate(${moveX * 0.5}px, ${moveY * 0.5}px)`;
    if (mobileContent) mobileContent.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;

    if (formWrapper) {
        const rotateX = (window.innerHeight / 2 - window.event.clientY) / 50;
        const rotateY = (window.event.clientX - window.innerWidth / 2) / 50;
        formWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${window.innerWidth < 768 ? -170 : 0}px)`;
    }
}

function initInteractions() {
    // Reveal text animation
    const reveals = document.querySelectorAll('.text-logo, .brand-tagline, .form-wrapper, .feature-item');
    reveals.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${0.2 + i * 0.1}s`;
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = window.innerWidth < 768 && el.classList.contains('form-wrapper') ? 'translateY(-170px)' : 'translateY(0)';
        }, 100);
    });

    // Ripple effect on click
    document.addEventListener('click', e => {
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });
}

function initPhoneMask() {
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput) return;
    phoneInput.addEventListener('focus', () => { if (!phoneInput.value) phoneInput.value = '+998 '; });
    phoneInput.addEventListener('input', e => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 12);
        if (!val.startsWith('998')) val = '998' + val.replace(/^998/, '');
        let res = '+998';
        if (val.length > 3) res += ' ' + val.substring(3, 5);
        if (val.length > 5) res += ' ' + val.substring(5, 8);
        if (val.length > 8) res += ' ' + val.substring(8, 10);
        if (val.length > 10) res += ' ' + val.substring(10, 12);
        e.target.value = res;
    });
}

function initFormHandling() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    form.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        btn.classList.add('loading');
        
        const formData = {
            name: document.getElementById('nameInput').value,
            phone: document.getElementById('phoneInput').value,
            message: document.getElementById('problemInput').value
        };

        try {
            const response = await fetch('/.netlify/functions/send-to-crm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();

            if (response.ok) {
                form.style.display = 'none';
                document.querySelector('.form-header').style.display = 'none';
                document.getElementById('successMessage').classList.add('show');
                
                // Automatically redirect to Telegram channel after a short delay
                setTimeout(() => {
                    window.location.href = 'https://t.me/miobeauty';
                }, 1000);
            } else {
                console.error('CRM Error:', result);
                alert('Xabarni yuborishda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring yoki admin bilan bog\'laning.');
            }
        } catch (error) {
            console.error('Network Error:', error);
            alert('Internet aloqasini tekshiring.');
        } finally {
            btn.classList.remove('loading');
        }
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
        form.reset(); form.style.display = 'flex';
        document.querySelector('.form-header').style.display = 'block';
        document.getElementById('successMessage').classList.remove('show');
    });
}
