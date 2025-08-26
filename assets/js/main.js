
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
});
