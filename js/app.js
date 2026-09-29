/**
 * LUXURY WEDDING EXPERIENCE — CENTRAL ORCHESTRATOR V7.2 (TIMELINE FIX & PAUSE)
 * GSAP MOTION SYSTEM + LENIS SMOOTH SCROLL (Inertia Control)
 */

import weddingConfig from './config.js';

gsap.registerPlugin(ScrollTrigger);

// =========================================
// 0.1 ESTABILIZACIÓN MÓVIL Y RESIZE
// =========================================
ScrollTrigger.config({ ignoreMobileResize: true });

// =========================================
// 0.5 MOTOR DE INERCIA Y SCROLL SUAVE (LENIS)
// =========================================
const lenis = new Lenis({
    duration: 1.2,      
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    smooth: true,
    smoothTouch: false  
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => { ScrollTrigger.refresh(); }, 300);
});

window.addEventListener("orientationchange", () => {
    lenis.stop(); 
    setTimeout(() => { ScrollTrigger.refresh(); lenis.start(); }, 500); 
});

window.scrollTo(0, 0);
lenis.stop();

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0, 0);

// =========================================
// 0. CEREMONIAL GATE & AUDIO GLOBAL
// =========================================
const enterBtn = document.getElementById('enter-experience');
const audioTrack = document.getElementById('ambient-track');
const ceremonialGate = document.getElementById('ceremonial-gate');
const audioToggleButton = document.getElementById('audio-toggle');
const audioContainer = document.getElementById('audioContainer');

const videoElement = document.getElementById('save-date-video');
const videoBtn = document.getElementById('video-fullscreen-btn');

let isAudioPlaying = false;
let wasAmbientPlayingBeforeVideo = false;

if(enterBtn) {
    enterBtn.addEventListener('click', () => {
        
        if(audioTrack && weddingConfig.audio.enabled) {
            audioTrack.volume = 0; 
            audioTrack.play().then(() => {
                isAudioPlaying = true;
                if(audioToggleButton) {
                    audioToggleButton.removeAttribute('disabled');
                    audioToggleButton.classList.add('is-playing');
                }
                gsap.to(audioTrack, { volume: 1, duration: 3 });
            }).catch(e => console.warn("Audio bloqueado por navegador", e));
        }

        gsap.to("#ceremonial-content", { opacity: 0, duration: 0.5 });
        gsap.to(ceremonialGate, { 
            opacity: 0, duration: 1.5, delay: 0.3, ease: "power2.inOut",
            onComplete: () => {
                gsap.set(ceremonialGate, { display: "none" });
                if(audioContainer) audioContainer.classList.add('is-active');
                initSPAAnimations(); 
                lenis.start();       
            }
        });
    });
}

if(weddingConfig.audio.enabled && audioToggleButton && audioTrack) {
    audioToggleButton.addEventListener('click', () => {
        if (isAudioPlaying) {
            audioTrack.pause();
            audioToggleButton.classList.remove('is-playing');
        } else {
            audioTrack.play().catch(e => console.warn("Autoplay bloqueado", e));
            audioToggleButton.classList.add('is-playing');
        }
        isAudioPlaying = !isAudioPlaying;
    });
}

// =========================================
// 0.8 LÓGICA DE VIDEO NATIVO FULLSCREEN (CAPÍTULO VI)
// =========================================
if (videoBtn && videoElement) {
    videoBtn.addEventListener('click', () => {
        
        if (isAudioPlaying && audioTrack) {
            wasAmbientPlayingBeforeVideo = true;
            audioTrack.pause();
            audioToggleButton.classList.remove('is-playing');
            isAudioPlaying = false;
        } else {
            wasAmbientPlayingBeforeVideo = false;
        }

        videoElement.muted = false;
        videoElement.currentTime = 0; 

        try {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            } else if (videoElement.webkitEnterFullscreen) { 
                videoElement.webkitEnterFullscreen();
            } else if (videoElement.msRequestFullscreen) {
                videoElement.msRequestFullscreen();
            }
        } catch (e) {
            console.warn("Fullscreen API falló en el video", e);
        }
    });

    const exitHandler = () => {
        if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
            videoElement.muted = true; 
            if (wasAmbientPlayingBeforeVideo && audioTrack) {
                audioTrack.play();
                audioToggleButton.classList.add('is-playing');
                isAudioPlaying = true;
            }
        }
    };

    document.addEventListener('fullscreenchange', exitHandler);
    document.addEventListener('webkitfullscreenchange', exitHandler);
    
    videoElement.addEventListener('webkitendfullscreen', () => {
         videoElement.muted = true;
         if (wasAmbientPlayingBeforeVideo && audioTrack) {
             audioTrack.play();
             audioToggleButton.classList.add('is-playing');
             isAudioPlaying = true;
         }
    });
}

// =========================================
// 1. DATA INJECTION
// =========================================
document.getElementById('txt-chapter').textContent = weddingConfig.chapterOne.title;
document.getElementById('txt-couple').textContent = weddingConfig.couple.fullName;
document.getElementById('txt-meta').textContent = weddingConfig.chapterOne.metaText;

// =========================================
// 2. SPA MOTION ORCHESTRATION (MATCH MEDIA)
// =========================================
function initSPAAnimations() {
    gsap.set(".hero-container", { opacity: 1 });
    
    let mm = gsap.matchMedia();

    mm.add({
        isDesktop: "(min-width: 769px)",
        isMobile: "(max-width: 768px)"
    }, (context) => {
        let { isDesktop, isMobile } = context.conditions;

        const svgInitialScale = isMobile ? 0.70 : 0.88;
        const scrollEndCh1 = isMobile ? "+=120%" : "+=150%";
        const scrollEndCh2 = isMobile ? "+=120%" : "+=100%"; 

        // --- CH1: EL UMBRAL ---
        const center = 500;
        const radiusCut = 1400; 
        const radiusEcho = 1480; 
        const endPolyCut = `${center},${center - radiusCut} ${center + radiusCut},${center} ${center},${center + radiusCut} ${center - radiusCut},${center}`;
        const endPolyEcho = `${center},${center - radiusEcho} ${center + radiusEcho},${center} ${center},${center + radiusEcho} ${center - radiusEcho},${center}`;

        gsap.set("#dna-layer", { transformOrigin: "500px 500px", scale: svgInitialScale });

        const ch1Tl = gsap.timeline({ scrollTrigger: { trigger: ".hero-container", end: scrollEndCh1 }, delay: 0.2 });
        
        ch1Tl
            .to(".diamond-shape:not(#echo-diamond)", { attr: { points: endPolyCut }, duration: 6.0, ease: "power3.inOut" }, 0)
            .to("#cutting-diamond", { strokeWidth: 0, duration: 6.0, ease: "power3.inOut" }, 0)
            .to("#echo-diamond", { attr: { points: endPolyEcho }, strokeWidth: 0, opacity: 0, duration: 6.0, ease: "power3.out" }, 0)
            .to("#dna-layer", { scale: 1, duration: 6.0, ease: "power3.inOut" }, 0) 
            .to("#audioContainer", { opacity: 1, duration: 6.0, ease: "power3.inOut" }, 0) 
            .to(".chapter-tag", { opacity: 0.85, y: 0, duration: 2.0, ease: "power3.out" }, 3.0)
            .to(".couple-names", { opacity: 1, y: 0, duration: 2.5, ease: "power4.out" }, 3.4)
            .to(".wedding-meta", { opacity: 0.75, y: 0, duration: 2.0, ease: "power3.out" }, 3.8)
            .to(".line-separator", { opacity: 0.6, scaleX: 1, duration: 2.0, ease: "power2.out" }, 4.2)
            .to("#heroContainer", { y: isMobile ? -8 : -12, duration: 4.8, repeat: -1, yoyo: true, ease: "sine.inOut" }, 6.0)
            .to(".scroll-indicator", { opacity: 0.95, duration: 1.5, ease: "power2.out" }, 4.2)
            .to(".scroll-indicator", { y: 6, opacity: 0.4, duration: 1.25, repeat: -1, yoyo: true, ease: "sine.inOut" }, 4.7);

        // --- CH2: LA ESENCIA ---
        gsap.utils.toArray(".fade-line-2").forEach((line) => {
            gsap.from(line, { scrollTrigger: { trigger: "#chapter-2", start: "top 70%" }, y: isMobile ? 15 : 30, opacity: 0, duration: 1.2, stagger: 0.2, ease: "power3.out" });
        });

        const ch2Tl = gsap.timeline({ scrollTrigger: { trigger: "#chapter-2", start: "top top", end: scrollEndCh2, scrub: 1, pin: true } });
        ch2Tl
            .to("#manifesto-content", { opacity: 0, y: -60, duration: 1, ease: "power2.in" }, 0)
            .to("#solid-canvas", { opacity: 0, duration: 1.5, ease: "none" }, 0.5)
            .to(".majestic-ethereal-photo", { scale: 1, duration: 2.5, ease: "power1.inOut" }, 0);

        // --- SECCIÓN 2B: FAMILIA ---
        gsap.utils.toArray(".fade-family").forEach((element) => {
            gsap.from(element, { scrollTrigger: { trigger: element, start: "top 85%" }, y: 30, opacity: 0, duration: 1.2, ease: "power3.out" });
        });

        // --- CAPÍTULO III: NUESTRO CAMINO (Galería Horizontal) ---
        const horizontalWrapper = document.getElementById("horizontal-wrapper");
        const horizontalContainer = document.getElementById("horizontal-container");
        
        if (horizontalWrapper && horizontalContainer) {
            let getScrollAmount = () => -(horizontalContainer.scrollWidth - window.innerWidth);

            // Un único ScrollTrigger controla TODA la escena (desplazamiento + salida),
            // evitando triggers duplicados y garantizando que la salida esté
            // perfectamente sincronizada con el mismo progreso de scroll.
            const ch3Tl = gsap.timeline({
                scrollTrigger: {
                    trigger: horizontalWrapper,
                    start: "top top",
                    end: () => `+=${horizontalContainer.scrollWidth - window.innerWidth}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });

            ch3Tl
                // 0% → 82%: recorrido horizontal normal de las 4 fotos
                .to(horizontalContainer, { x: getScrollAmount, ease: "none", duration: 0.82 }, 0)
                // 82% → 100%: la galería se disuelve ANTES de despinear,
                // así el despineo ocurre ya con la escena invisible (sin "corte")
                .to(horizontalWrapper, { opacity: 0, ease: "power2.in", duration: 0.18 }, 0.82);
        }

        // --- CAPÍTULO IV: COORDENADAS (COREOGRAFÍA PINEADA CON PAUSA) ---

        // 1. Estado inicial determinista: la iglesia arranca invisible.
        gsap.set("#bg-iglesia", { opacity: 0, scale: 1 });

        // 1.1 FUNDIDO DE ENTRADA — llena el espacio de respiro (margin-top) que antes
        // quedaba en blanco entre el fin de la galería y el inicio de Cap.IV.
        //
        // start: "top 130%" -> empieza a fundir ANTES de que la imagen sea visible
        //   (todavía está por debajo del viewport, así que el arranque del fundido
        //   nunca se nota).
        // end: "top -40%"   -> termina DESPUÉS de que .sticky-container ya quedó
        //   pegado arriba (eso ocurre en "top top"). Antes el fundido terminaba
        //   justo EN "top top", coincidiendo con el instante exacto en que el
        //   navegador cambia el comportamiento de posicionamiento (de flujo normal
        //   a sticky) — esa coincidencia es lo que se leía como "aparece de golpe".
        //   Ahora ese cambio ocurre a la mitad del fundido, no en su borde.
        gsap.fromTo("#bg-iglesia",
            { opacity: 0 },
            {
                opacity: 0.38,
                ease: "none",
                scrollTrigger: {
                    trigger: "#chapter-4",
                    start: "top 130%",
                    end: "top -40%",
                    scrub: true
                }
            }
        );

        // 2. Timeline Maestra
        const ch4Tl = gsap.timeline({ scrollTrigger: { trigger: "#chapter-4", start: "top top", end: "bottom bottom", scrub: 1 } });
        
        ch4Tl
            // Entrada del rótulo del capítulo (antes nunca se animaba: permanecía invisible)
            .to("#ch-tag", { opacity: 0.85, y: 0, duration: 1.0, ease: "power2.out" }, 0)

            // Inicia el movimiento sutil de parallax en el instante en que se fija (pin)
            .to("#bg-iglesia", { scale: 1.08, duration: 10.0, ease: "none" }, 0)
            
            // EL ESPACIO DE RESPIRO: Retrasamos la entrada de la fecha hasta el segundo 2.0
            .to("#layer-fecha", { opacity: 1, duration: 1.0 }, 2.0) 
            
            // Transición cruzada: Fecha sale -> Detalles Ceremonia entran
            .to("#layer-fecha", { opacity: 0, y: -40, duration: 1.2 }, 4.0) 
            .to("#layer-ceremonia", { opacity: 1, y: 0, duration: 1.2 }, 4.8)
            
            // Transición cruzada: Ceremonia/Iglesia sale -> Recepción/Jardín entran
            .to("#layer-ceremonia", { opacity: 0, y: -40, duration: 1.2 }, 7.5)
            .to("#bg-iglesia", { opacity: 0, duration: 1.5 }, 7.5)
            .to("#bg-jardin", { opacity: 0.38, duration: 1.5 }, 7.5)
            .to("#bg-jardin", { scale: 1.08, duration: 5.0, ease: "none" }, 7.5)
            .to("#layer-recepcion", { opacity: 1, y: 0, duration: 1.2 }, 8.5)
            
            // Salida final de la sección
            .to("#layer-recepcion", { opacity: 0, y: -40, duration: 1.2 }, 12.0)
            .to("#bg-jardin", { opacity: 0, duration: 1.2 }, 12.0)
            .to("#ch-tag", { opacity: 0, duration: 1.2 }, 12.0);
            
        // --- CH5 & CH6: MEMORIAS (Textos Fade) ---
        gsap.utils.toArray(".fade-gallery").forEach((element) => {
            gsap.from(element, { scrollTrigger: { trigger: element, start: "top 85%" }, y: 30, opacity: 0, duration: 1.2, ease: "power3.out" });
        });

        // --- CIERRE FLORAL ---
        const floralImage = document.querySelector(".floral-closure-photo");
        if (floralImage) {
            gsap.fromTo(floralImage, { y: "-15%" }, { y: "10%", ease: "none", scrollTrigger: { trigger: ".floral-closure-section", start: "top bottom", end: "bottom top", scrub: true } });
        }
    }); 
}