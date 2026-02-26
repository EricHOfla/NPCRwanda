/**
 * NPC Rwanda - Main JavaScript
 * Handles common functionality across all pages
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-in-out'
        });
    }

    // Sticky Navbar Scrolling Effect
    const navbar = document.getElementById('main-nav');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                // Only remove scrolled if it's not the about/sports/etc pages that have it by default
                const isSubPage = document.body.classList.contains('sub-page');
                if (!isSubPage) {
                    navbar.classList.remove('scrolled');
                }
            }
        });
    }

    // Set Current Year in Footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Active Link Highlighting (Optional enhancement)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
