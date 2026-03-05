
        // 1. Optimized Mouse Move Glow Effect using requestAnimationFrame
        let mouseX = 0, mouseY = 0;
        let isGlowUpdateScheduled = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (!isGlowUpdateScheduled) {
                window.requestAnimationFrame(updateGlowEffect);
                isGlowUpdateScheduled = true;
            }
        });

        function updateGlowEffect() {
            const cards = document.querySelectorAll('.glass-card, .glass-panel, .btn-glow');
            
            cards.forEach(card => {
                // Optimization: Check if element is roughly in view before calculating
                const rect = card.getBoundingClientRect();
                
                // Only calculate if the card is visible in the viewport
                if (rect.bottom > 0 && rect.top < window.innerHeight) {
                    const x = mouseX - rect.left;
                    const y = mouseY - rect.top;
                    
                    // Simple check without getComputedStyle for performance
                    card.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(255,255,255,0.04), transparent 40%)`;
                    
                    if(card.classList.contains('glass-card') && !card.classList.contains('cap-active')) {
                         card.style.backgroundColor = "transparent";
                    }
                }
            });

            isGlowUpdateScheduled = false;
        }

        // 2. Select/Deselect Capabilities
        document.addEventListener('click', (e) => {
            const clickedCard = e.target.closest('.capability-card');
            const allCards = document.querySelectorAll('.capability-card');

            if (clickedCard) {
                allCards.forEach(c => c.classList.remove('cap-active'));
                clickedCard.classList.add('cap-active');
            } else {
                allCards.forEach(c => c.classList.remove('cap-active'));
            }
        });

        // 3. Scroll Reveal Animation
        const revealElements = document.querySelectorAll('.reveal-up');
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(el => revealObserver.observe(el));

        // 4. Stats Counter
        const statsSection = document.getElementById('stats-section');
        const counters = document.querySelectorAll('.counter');
        let started = false;

        const startCounters = () => {
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; 
                const increment = target / (duration / 16);
                
                let current = 0;
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
            });
        };

        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !started) {
                startCounters();
                started = true;
            }
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);

        // 5. Typing Effect for Hero
        const textElement = document.getElementById('typing-text');
        const words = ["Intelligence.", "Innovation.", "Experiences."];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                textElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                textElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                setTimeout(type, 2000); // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                setTimeout(type, 500); // Pause before new word
            } else {
                setTimeout(type, isDeleting ? 100 : 150);
            }
        }
        document.addEventListener('DOMContentLoaded', type);
