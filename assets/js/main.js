
document.addEventListener('DOMContentLoaded', () => {
	// Guard to prevent double initialization when scripts are loaded twice
	if (window.__portfolioInit) return;
	window.__portfolioInit = true;

	// Enhanced cursor trail effect
	const cursorTrail = [];
	const trailLength = 15;
	let mouseX = 0;
	let mouseY = 0;
	let lastX = 0;
	let lastY = 0;

	const btn = document.getElementById('menuBtn');
	const menu = document.getElementById('mobileMenu');

	// Small helper to find focusable elements
	const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

	if (btn && menu) {
		// Ensure accessible attributes
		btn.setAttribute('aria-controls', 'mobileMenu');
		if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');

		const openMenu = () => {
			menu.classList.remove('hidden');
			btn.setAttribute('aria-expanded', 'true');
			// focus first focusable item in menu for keyboard users
			const first = menu.querySelector(focusableSelector);
			if (first) first.focus();
			// trap focus while menu is open
			trapFocus(menu, true);
		};

		const closeMenu = () => {
			menu.classList.add('hidden');
			btn.setAttribute('aria-expanded', 'false');
			trapFocus(menu, false);
			btn.focus();
		};

		const toggleMenu = () => {
			if (menu.classList.contains('hidden')) openMenu(); else closeMenu();
		};

		// Click toggles
		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			toggleMenu();
		});

		// Keyboard activation on Enter / Space for non-button elements
		btn.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
				e.preventDefault();
				toggleMenu();
			}
		});

		// Close on Escape
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
				closeMenu();
			}
		});

		// Close when clicking outside the menu
		document.addEventListener('click', (e) => {
			if (!menu.contains(e.target) && !btn.contains(e.target) && !menu.classList.contains('hidden')) {
				closeMenu();
			}
		});

		// Close menu when any link inside is clicked (navigation)
		menu.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', () => {
			// small delay to allow anchor navigation
			setTimeout(closeMenu, 50);
		}));
	}

	// Focus trap for modal-like mobile menu
	let _trapHandler = null;
	function trapFocus(container, enable) {
		if (!container) return;
		if (!enable) {
			if (_trapHandler) document.removeEventListener('keydown', _trapHandler);
			_trapHandler = null;
			return;
		}
		const focusable = Array.from(container.querySelectorAll(focusableSelector));
		if (focusable.length === 0) return;
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		_trapHandler = function (e) {
			if (e.key !== 'Tab') return;
			if (e.shiftKey) {
				if (document.activeElement === first) {
					e.preventDefault();
					last.focus();
				}
			} else {
				if (document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		};
		document.addEventListener('keydown', _trapHandler);
	}

	// -----------------------------
	// Theme persistence + toggles
	// -----------------------------
	const applyTheme = (theme) => {
		const desktop = document.getElementById('darkToggleDesktop');
		const mobile = document.getElementById('darkToggleMobile');
		if (theme === 'light') {
			document.body.classList.add('light');
			document.body.classList.remove('bg-zinc-950','text-zinc-100');
			document.body.classList.add('bg-white','text-zinc-900');
			if (desktop) desktop.textContent = '🌞 Light';
			if (mobile) mobile.textContent = '🌞 Light';
		} else {
			document.body.classList.remove('light');
			document.body.classList.add('bg-zinc-950','text-zinc-100');
			document.body.classList.remove('bg-white','text-zinc-900');
			if (desktop) desktop.textContent = '🌙 Dark';
			if (mobile) mobile.textContent = '🌙 Dark';
		}
	};

	// init theme from localStorage or prefers-color-scheme
	try {
		const saved = localStorage.getItem('theme');
		if (saved) applyTheme(saved);
		else {
			const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
			applyTheme(prefersLight ? 'light' : 'dark');
		}
	} catch (err) {
		// localStorage might be disabled in some environments
		console.warn('theme persistence disabled', err);
	}

	const toggleAndSave = (btnEl) => {
		// reuse inline toggle if present, otherwise use applyTheme
		if (typeof window.toggleTheme === 'function') {
			window.toggleTheme(btnEl);
			try { localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark'); } catch (e) {}
		} else {
			const now = document.body.classList.contains('light') ? 'dark' : 'light';
			applyTheme(now);
			try { localStorage.setItem('theme', now); } catch (e) {}
		}
	};

	document.getElementById('darkToggleDesktop')?.addEventListener('click', () => toggleAndSave(document.getElementById('darkToggleDesktop')));
	document.getElementById('darkToggleMobile')?.addEventListener('click', () => toggleAndSave(document.getElementById('darkToggleMobile')));

	// -----------------------------
	// Popup: close on backdrop click + Escape
	// -----------------------------
	const popup = document.getElementById('popup');
	const popupBox = document.getElementById('popupBox');
	if (popup) {
		// ensure ARIA attributes for accessibility
		popup.setAttribute('aria-hidden', popup.classList.contains('hidden') ? 'true' : 'false');
		document.addEventListener('click', (e) => {
			if (popup.classList.contains('hidden')) return;
			if (popupBox && !popupBox.contains(e.target)) {
				popup.classList.add('hidden');
				popup.setAttribute('aria-hidden', 'true');
			}
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && !popup.classList.contains('hidden')) {
				popup.classList.add('hidden');
				popup.setAttribute('aria-hidden', 'true');
			}
		});
	}

	// -----------------------------
	// Scroll progress bar
	// -----------------------------
	const progress = document.getElementById('progressBar');
	if (progress) {
		let ticking = false;
		const update = () => {
			const doc = document.documentElement;
			const scrollTop = window.scrollY || doc.scrollTop;
			const docHeight = Math.max(doc.scrollHeight, doc.offsetHeight, document.body.scrollHeight);
			const winHeight = window.innerHeight || doc.clientHeight;
			const pct = Math.min(100, Math.max(0, (scrollTop / (docHeight - winHeight)) * 100));
			progress.style.width = pct + '%';
			ticking = false;
		};
		window.addEventListener('scroll', () => {
			if (!ticking) {
				window.requestAnimationFrame(update);
				ticking = true;
			}
		}, { passive: true });
		// initial
		update();
	}

	// Enhanced cursor trail effect
	const initCursorTrail = () => {
		const trailContainer = document.createElement('div');
		trailContainer.className = 'cursor-trail-container';
		trailContainer.innerHTML = Array(trailLength).fill('<div class="cursor-trail-dot"></div>').join('');
		document.body.appendChild(trailContainer);

		const dots = Array.from(trailContainer.children);

		const moveTrail = () => {
			// Smooth movement
			lastX += (mouseX - lastX) / 8;
			lastY += (mouseY - lastY) / 8;

			// Update dots positions with trailing effect
			dots.forEach((dot, i) => {
				const factor = i / trailLength;
				const x = lastX - (lastX - mouseX) * factor;
				const y = lastY - (lastY - mouseY) * factor;
				
				dot.style.transform = `translate(${x}px, ${y}px) scale(${1 - factor * 0.5})`;
				dot.style.opacity = 1 - factor * 0.7;
			});

			requestAnimationFrame(moveTrail);
		};

		moveTrail();

		document.addEventListener('mousemove', (e) => {
			mouseX = e.clientX;
			mouseY = e.clientY;
		});

		// Hide trail on touch devices
		document.addEventListener('touchstart', () => {
			trailContainer.style.display = 'none';
		});
	};

	// Initialize cursor trail
	initCursorTrail();

	// Animated counters
	const initCounters = () => {
		const counters = document.querySelectorAll('.counter');
		const speed = 200; // Lower value = faster animation

		const animateCounter = (counter) => {
			const target = +counter.getAttribute('data-target');
			const count = +counter.innerText;

			const increment = target / speed;

			if (count < target) {
				counter.innerText = Math.ceil(count + increment);
				setTimeout(() => animateCounter(counter), 10);
			} else {
				counter.innerText = target.toLocaleString();
			}
		};

		// Check if counters are in viewport
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const counter = entry.target;
					animateCounter(counter);
					observer.unobserve(counter);
				}
			});
		}, {
			threshold: 0.5
		});

		counters.forEach(counter => {
			observer.observe(counter);
		});
	};

	// Initialize counters
	initCounters();

	// Animate skill bars when in view
	const initSkillBars = () => {
		const skillLevels = document.querySelectorAll('.skill-level');

		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const skillLevel = entry.target;
					const width = skillLevel.getAttribute('data-width');
					skillLevel.style.width = width;
					observer.unobserve(skillLevel);
				}
			});
		}, {
			threshold: 0.5
		});

		skillLevels.forEach(skillLevel => {
			observer.observe(skillLevel);
		});
	};

	// Initialize skill bars
	initSkillBars();

	// Contact form validation
	const initContactForm = () => {
		const form = document.getElementById('contactForm');
		if (!form) return;

		form.addEventListener('submit', (e) => {
			e.preventDefault();
			
			// Reset errors
			const errorElements = form.querySelectorAll('[id$="Error"]');
			errorElements.forEach(el => {
				el.classList.add('hidden');
				el.textContent = '';
			});

			// Get form values
			const name = document.getElementById('name').value.trim();
			const subject = document.getElementById('subject').value.trim();
			const email = document.getElementById('email').value.trim();
			const message = document.getElementById('message').value.trim();

			let isValid = true;

			// Validate name
			if (name === '') {
				document.getElementById('nameError').textContent = 'Name is required';
				document.getElementById('nameError').classList.remove('hidden');
				isValid = false;
			}

			// Validate subject
			if (subject === '') {
				document.getElementById('subjectError').textContent = 'Subject is required';
				document.getElementById('subjectError').classList.remove('hidden');
				isValid = false;
			}

			// Validate email
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (email === '') {
				document.getElementById('emailError').textContent = 'Email is required';
				document.getElementById('emailError').classList.remove('hidden');
				isValid = false;
			} else if (!emailRegex.test(email)) {
				document.getElementById('emailError').textContent = 'Please enter a valid email';
				document.getElementById('emailError').classList.remove('hidden');
				isValid = false;
			}

			// Validate message
			if (message === '') {
				document.getElementById('messageError').textContent = 'Message is required';
				document.getElementById('messageError').classList.remove('hidden');
				isValid = false;
			}

			// If form is valid, show success message
			if (isValid) {
				const formMessage = document.getElementById('formMessage');
				formMessage.textContent = 'Thank you for your message! I\'ll get back to you soon.';
				formMessage.className = 'mt-4 p-3 rounded-lg bg-green-900/30 text-green-400 border border-green-800 hidden';
				formMessage.classList.remove('hidden');

				// Reset form
				form.reset();

				// Hide message after 5 seconds
				setTimeout(() => {
					formMessage.classList.add('hidden');
				}, 5000);
			}
		});
	};

	// Initialize contact form
	initContactForm();

	// Staggered animations for grid elements
	const initStaggeredAnimations = () => {
		const staggeredContainers = document.querySelectorAll('.staggered-animation');
		
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('visible');
					observer.unobserve(entry.target);
				}
			});
		}, {
			threshold: 0.1
		});
		
		staggeredContainers.forEach(container => {
			observer.observe(container);
		});
	};
	
	// Initialize staggered animations
	initStaggeredAnimations();

	// -----------------------------
	// Section reveal on scroll (uses CSS .visible)
	// -----------------------------
	try {
		const sections = document.querySelectorAll('section');
		if ('IntersectionObserver' in window && sections.length) {
			const obs = new IntersectionObserver((entries) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
					}
				});
			}, { threshold: 0.12 });
			sections.forEach(s => obs.observe(s));
		} else {
			// fallback: reveal all
			document.querySelectorAll('section').forEach(s => s.classList.add('visible'));
		}
	} catch (err) {
		console.warn('section reveal error', err);
	}

	// -----------------------------
	// Jobs iframe: ensure initial load and loader hide on load
	// -----------------------------
	const iframe = document.getElementById('gitjobs');
	const loader = document.getElementById('loading');
	if (iframe) {
		iframe.addEventListener('load', () => {
			if (loader) loader.style.display = 'none';
		});
		// if iframe src is empty, load default
		if (!iframe.src || iframe.src.trim() === '') {
			// use the same default as page logic
			iframe.src = 'https://gitjobs.dev/embed?date_range=last3-days&kind%5B0%5D=full-time&kind%5B1%5D=part-time&kind%5B2%5D=contractor&kind%5B3%5D=internship&limit=10';
		}
	}

});
