
document.addEventListener('DOMContentLoaded', () => {
	const btn = document.getElementById('menuBtn');
	const menu = document.getElementById('mobileMenu');

	if (!btn || !menu) return; // nothing to do if elements missing

	// Ensure accessible attributes
	btn.setAttribute('aria-controls', 'mobileMenu');
	if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');

	const openMenu = () => {
		menu.classList.remove('hidden');
		btn.setAttribute('aria-expanded', 'true');
	};

	const closeMenu = () => {
		menu.classList.add('hidden');
		btn.setAttribute('aria-expanded', 'false');
	};

	const toggleMenu = () => {
		if (menu.classList.contains('hidden')) openMenu(); else closeMenu();
	};

	// Click toggles
	btn.addEventListener('click', toggleMenu);

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
			btn.focus();
		}
	});

	// Close when clicking outside the menu
	document.addEventListener('click', (e) => {
		if (!menu.contains(e.target) && !btn.contains(e.target) && !menu.classList.contains('hidden')) {
			closeMenu();
		}
	});

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
		const saved = localStorage.getItem('theme');
		if (saved) applyTheme(saved);
		else {
			const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
			applyTheme(prefersLight ? 'light' : 'dark');
		}

		const toggleAndSave = (btnEl) => {
			// reuse inline toggle if present, otherwise use applyTheme
			if (typeof window.toggleTheme === 'function') {
				window.toggleTheme(btnEl);
				// detect current body.light
				const now = document.body.classList.contains('light') ? 'light' : 'dark';
				localStorage.setItem('theme', now);
			} else {
				const now = document.body.classList.contains('light') ? 'dark' : 'light';
				applyTheme(now);
				localStorage.setItem('theme', now);
			}
		};

		document.getElementById('darkToggleDesktop')?.addEventListener('click', () => toggleAndSave(document.getElementById('darkToggleDesktop')));
		document.getElementById('darkToggleMobile')?.addEventListener('click', () => toggleAndSave(document.getElementById('darkToggleMobile')));

		// -----------------------------
		// Popup: close on backdrop click + Escape
		// -----------------------------
		const popup = document.getElementById('popup');
		const popupBox = document.getElementById('popupBox');
		document.addEventListener('click', (e) => {
			if (!popup || popup.classList.contains('hidden')) return;
			if (popupBox && !popupBox.contains(e.target)) {
				popup.classList.add('hidden');
			}
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && popup && !popup.classList.contains('hidden')) {
				popup.classList.add('hidden');
			}
		});

		// -----------------------------
		// Floating Contact FAB (inject for nicer UI)
		// -----------------------------
			const shouldShowFab = () => window.innerWidth <= 768;

			const createFab = () => {
				if (document.getElementById('fab-contact')) return;
				const fab = document.createElement('button');
				fab.id = 'fab-contact';
				fab.className = 'fab-contact';
				fab.type = 'button';
				fab.setAttribute('aria-label', 'Contact');
				fab.title = 'Contact';
				fab.innerHTML = '✉';
				fab.addEventListener('click', () => {
					const contact = document.getElementById('contact');
					if (contact) contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
				});
				document.body.appendChild(fab);
			};

			const removeFab = () => {
				const existing = document.getElementById('fab-contact');
				if (existing) existing.remove();
			};

			// create only on small screens, and update on resize
			if (shouldShowFab()) createFab();
			window.addEventListener('resize', () => {
				if (shouldShowFab()) createFab(); else removeFab();
			});
});
