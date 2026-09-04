(() => {
    const template = `
        <button class="accessibility-toggle" type="button" aria-controls="accessibility-panel" aria-expanded="false" aria-label="Open accessibility controls">
            <span class="accessibility-toggle__icon" aria-hidden="true">🦽</span>
            <span class="visually-hidden">Open accessibility controls</span>
        </button>
        <section class="accessibility-panel" id="accessibility-panel" role="region" aria-label="Accessibility panel" aria-hidden="true">
            <header class="accessibility-panel__header">
                <div>
                    <p class="accessibility-panel__title">Accessibility</p>
                    <p class="accessibility-panel__subtitle">NPC Rwanda</p>
                </div>
               
                <button type="button" class="accessibility-panel__close" data-action="close-panel" aria-label="Close accessibility panel">&times;</button>
            </header>
             <p class="accessibility-status" role="status" aria-live="polite"></p>
            <div class="accessibility-panel__grid">
                <div class="accessibility-section">
                    <h3>Text & Font</h3>
                    <div class="accessibility-actions">
                        <button type="button" data-action="increase-text">Increase Text</button>
                        <button type="button" data-action="decrease-text">Decrease Text</button>
                        <button type="button" data-action="readable-font">Readable Font</button>
                    </div>
                </div>
                <div class="accessibility-section">
                    <h3>Contrast & Color</h3>
                    <div class="accessibility-actions">
                        <button type="button" data-action="grayscale">Grayscale</button>
                        <button type="button" data-action="high-contrast">High Contrast</button>
                        <button type="button" data-action="negative-contrast">Negative Contrast</button>
                        <button type="button" data-action="light-background">Light Background</button>
                        <button type="button" data-action="links-underline">Links Underline</button>
                    </div>
                </div>
                <div class="accessibility-section">
                    <h3>Profiles & Support</h3>
                    <div class="accessibility-actions">
                        <button type="button" data-action="profile-lowvision">Low vision</button>
                        <button type="button" data-action="profile-dyslexia">Dyslexia</button>
                        <button type="button" data-action="profile-colorblind">Color blind</button>
                        <button type="button" data-action="profile-cognitive">Cognitive</button>
                        <button type="button" data-action="screen-reader">Screen reader</button>
                    </div>
                </div>
                <div class="accessibility-section">
                    <h3>Motion & Helpers</h3>
                    <div class="accessibility-actions">
                        <button type="button" data-action="pause-animations">Pause motion</button>
                        <button type="button" data-action="hide-images">Hide images</button>
                        <button type="button" data-action="cursor-helper">Cursor helper</button>
                    </div>
                </div>
            </div>
           <button type="button" class="accessibility-reset" data-action="reset-all">Reset settings</button>
            
        </section>
    `;

    const menu = document.createElement('div');
    menu.className = 'accessibility-menu';
    menu.innerHTML = template;
    document.body.appendChild(menu);

    const panel = menu.querySelector('.accessibility-panel');
    const toggle = menu.querySelector('.accessibility-toggle');
    const status = menu.querySelector('.accessibility-status');

    const state = {
        fontSize: 1,
        highContrast: false,
        highlightLinks: false,
        animationsPaused: false,
        imagesHidden: false,
        lineHeight: false,
        textCentered: false,
        cursorEnabled: false,
        letterSpacing: false,
        dyslexic: false,
        cognitive: false,
        smartContrast: false,
        lowVision: false,
        screenReader: false,
        grayscale: false,
        negativeContrast: false,
        lightBackground: false,
        linksUnderline: false,
        readableFont: false,
        cursorHelper: false
    };
    let utterance = null;
    const supportsSpeech = typeof window.speechSynthesis !== 'undefined';

    const announce = (message) => {
        if (status) status.textContent = message;
    };

    const cancelSpeech = () => {
        if (supportsSpeech) {
            window.speechSynthesis.cancel();
            utterance = null;
        }
    };

    const readPage = () => {
        if (!supportsSpeech) return announce('Speech synthesis is unavailable in this browser.');
        cancelSpeech();
        const text = Array.from(document.querySelectorAll('main, section, article'))
            .map((node) => node.textContent || '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (!text) return announce('No readable text detected.');
        utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.lang = document.documentElement.lang || 'en-US';
        utterance.onend = () => {
            state.screenReader = false;
            announce('Screen reader finished.');
        };
        window.speechSynthesis.speak(utterance);
        announce('Reading page aloud.');
    };

    const toggleScreenReader = () => {
        if (state.screenReader) {
            cancelSpeech();
            state.screenReader = false;
            announce('Screen reader stopped.');
            return;
        }
        state.screenReader = true;
        readPage();
    };

    // Duplicate adjustFontSize removed

    const toggleClass = (className, flagName, message) => {
        state[flagName] = !state[flagName];
        document.body.classList.toggle(className, state[flagName]);
        announce(message);
    };

    const adjustFontSize = (delta) => {
        state.fontSize = Math.max(0.9, Math.min(1.6, state.fontSize + delta));
        document.documentElement.style.fontSize = `${state.fontSize}em`;
        announce(`Text size ${state.fontSize.toFixed(1)}em`);
    };

    const closePanel = () => {
        panel.classList.remove('is-open');
        panel.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
        announce('Accessibility tools closed');
    };

    const openPanel = () => {
        panel.classList.add('is-open');
        panel.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
        announce('Accessibility tools opened');
    };

    const applyAction = {
        'open-panel': openPanel,
        'profile-lowvision': () => toggleClass('accessibility-low-vision', 'lowVision', 'Low vision profile active'),
        'profile-dyslexia': () => toggleClass('accessibility-dyslexic-font', 'dyslexic', 'Dyslexia font active'),
        'profile-colorblind': () => toggleClass('accessibility-smart-contrast', 'smartContrast', 'Color blind palette applied'),
        'profile-cognitive': () => toggleClass('accessibility-cognitive-helper', 'cognitive', 'Cognitive-friendly layout active'),
        'grayscale': () => toggleClass('accessibility-grayscale', 'grayscale', 'Grayscale mode toggled'),
        'high-contrast': () => toggleClass('accessibility-high-contrast', 'highContrast', 'High contrast mode toggled'),
        'negative-contrast': () => toggleClass('accessibility-negative-contrast', 'negativeContrast', 'Negative contrast mode toggled'),
        'light-background': () => toggleClass('accessibility-light-background', 'lightBackground', 'Light background mode toggled'),
        'links-underline': () => toggleClass('accessibility-links-underline', 'linksUnderline', 'Underline links toggled'),
        'readable-font': () => toggleClass('accessibility-readable-font', 'readableFont', 'Readable font toggled'),
        'increase-text': () => adjustFontSize(0.15),
        'decrease-text': () => adjustFontSize(-0.15),
        'highlight-links': () => toggleClass('accessibility-highlight-links', 'highlightLinks', 'Link highlighting toggled'),
        'text-spacing': () => toggleClass('accessibility-letter-spacing', 'letterSpacing', 'Text spacing increased'),
        'line-height': () => toggleClass('accessibility-line-height', 'lineHeight', 'Line height adjusted'),
        'text-align': () => toggleClass('accessibility-center-text', 'textCentered', 'Centered text mode toggled'),
        'pause-animations': () => {
            state.animationsPaused = !state.animationsPaused;
            if (state.animationsPaused) {
                panel.dataset.paused = 'true';
                const style = document.createElement('style');
                style.id = 'accessibility-pause-animations';
                style.textContent = '* { animation-play-state: paused !important; transition: none !important; }';
                document.head.appendChild(style);
                announce('Animations paused');
            } else {
                const style = document.getElementById('accessibility-pause-animations');
                if (style) style.remove();
                panel.dataset.paused = 'false';
                announce('Animations resumed');
            }
        },
        'hide-images': () => {
            state.imagesHidden = !state.imagesHidden;
            document.body.classList.toggle('accessibility-hide-images', state.imagesHidden);
            announce(state.imagesHidden ? 'Images hidden' : 'Images visible');
        },
        'screen-reader': toggleScreenReader,
        'cursor': () => toggleClass('accessibility-cursor', 'cursorEnabled', 'Cursor helper toggled'),
        'move-left': () => {
            menu.classList.add('accessibility-menu--left');
            menu.classList.remove('accessibility-menu--right');
        },
        'move-right': () => {
            menu.classList.add('accessibility-menu--right');
            menu.classList.remove('accessibility-menu--left');
        },
        'reset-all': () => {
            Object.keys(state).forEach((key) => {
                state[key] = key === 'fontSize' ? 1 : false;
            });
            document.documentElement.style.fontSize = '';
            document.body.classList.remove(
                'accessibility-high-contrast',
                'accessibility-highlight-links',
                'accessibility-hide-images',
                'accessibility-dyslexic-font',
                'accessibility-letter-spacing',
                'accessibility-line-height',
                'accessibility-center-text',
                'accessibility-cognitive-helper',
                'accessibility-smart-contrast',
                'accessibility-low-vision',
                'accessibility-cursor'
            );
            const pauseStyle = document.getElementById('accessibility-pause-animations');
            if (pauseStyle) pauseStyle.remove();
            panel.dataset.paused = 'false';
            document.body.style.filter = '';
            announce('Accessibility settings reset');
        },
        'close-panel': () => {
            closePanel();
        }
    };

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        if (panel.classList.contains('is-open')) {
            closePanel();
        } else {
            openPanel();
            const firstControl = panel.querySelector('button[data-action]');
            if (firstControl) firstControl.focus();
        }
    });

    panel.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        if (!action) return;
        const handler = applyAction[action];
        if (handler) handler();
    });

    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target) && panel.classList.contains('is-open')) {
            closePanel();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && panel.classList.contains('is-open')) {
            closePanel();
        }
    });

    const styleId = 'accessibility-menu-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .accessibility-menu {
                position: fixed;
                right: 20px;
                top: 100px;
                z-index: 9999;
                display: flex;
                flex-direction: row-reverse;
                align-items: flex-start;
                gap: 0.6rem;
                font-family: var(--font-body, 'Source Sans 3', sans-serif);
                pointer-events: none;
            }
            .accessibility-menu--left {
                left: 18px;
                right: auto;
            }
            .accessibility-toggle {
                border: none;
                border-radius: 50%;
                padding: 0.6rem;
                width: 58px;
                height: 58px;
                background: linear-gradient(135deg, var(--accent-yellow), var(--primary-blue));
                color: #001f3f;
                font-size: 1.6rem;
                box-shadow: 0 24px 45px rgba(0,0,0,0.35);
                cursor: pointer;
                transition: transform 0.25s ease, box-shadow 0.25s ease;
                pointer-events: auto;
            }
            .accessibility-toggle:is(:focus-visible, :hover) {
                transform: translateY(-3px) scale(1.08);
                box-shadow: 0 28px 60px rgba(0,0,0,0.5);
            }
            .accessibility-panel {
                width: min(320px, 100vw - 2rem);
                max-height: 550px;
                background: var(--white);
                border-radius: 14px;
                box-shadow: 0 16px 40px rgba(0,0,0,0.25);
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.9rem;
                border: 1px solid var(--border-light);
                transform: translateY(-10px);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s ease, transform 0.25s ease;
                margin-right: 0.4rem;
                overflow-y: auto;
                max-height: calc(100vh - 120px);
            }
            .accessibility-panel.is-open {
                pointer-events: auto;
            }
            .accessibility-panel.is-open {
                opacity: 1;
                pointer-events: auto;
                transform: translateY(0);
            }
            .accessibility-panel__header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .accessibility-panel__title {
                font-size: 1.1rem;
                font-weight: 700;
                margin: 0;
            }
            .accessibility-panel__subtitle {
                font-size: 0.8rem;
                margin: 0;
                color: var(--text-muted);
            }
            .accessibility-panel__close {
                background: transparent;
                border: none;
                font-size: 1.3rem;
                cursor: pointer;
                color: var(--text-dark);
            }
            .accessibility-panel__grid {
                display: grid;
                gap: 1rem;
            }
            .accessibility-section h3 {
                font-size: 0.9rem;
                font-weight: 700;
                margin-bottom: 0.4rem;
            }
            .accessibility-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 0.35rem;
            }
            .accessibility-actions button {
                flex: 1 1 140px;
                border-radius: 10px;
                border: 1px solid var(--border-light);
                padding: 0.4rem 0.75rem;
                font-size: 0.8rem;
                cursor: pointer;
                background: #f3f8fd;
                color: var(--text-dark);
                transition: background 0.2s ease, border-color 0.2s ease;
            }
            .accessibility-actions button:focus-visible {
                outline: 3px solid var(--primary-blue);
                outline-offset: 2px;
            }
            .accessibility-actions button:hover {
                background: #e3edfe;
                border-color: var(--primary-blue);
            }
            .accessibility-panel__footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.6rem;
                flex-wrap: wrap;
            }
            .accessibility-panel__movement button {
                border-radius: 999px;
                border: 1px solid var(--border-light);
                padding: 0.35rem 0.75rem;
                background: transparent;
                cursor: pointer;
            }
            .accessibility-reset {
                flex: 1;
                border-radius: 12px;
                border: none;
                background: var(--agitos-red);
                color: var(--white);
                font-weight: 700;
                padding: 0.5rem 0.9rem;
            }
            .accessibility-status {
                height: 1.25rem;
                font-size: 0.8rem;
                color: var(--text-muted);
            }
            body.accessibility-high-contrast {
                background: #000 !important;
                color: #fff !important;
                filter: none !important;
            }
            body.accessibility-high-contrast a {
                color: #ffd700 !important;
                text-shadow: 0 0 4px rgba(0, 0, 0, 0.35);
            }
            body.accessibility-highlight-links a {
                outline: 2px solid var(--accent-yellow);
                background: rgba(255, 255, 0, 0.25);
            }
            body.accessibility-hide-images img {
                opacity: 0;
            }
            body.accessibility-grayscale {
                filter: grayscale(100%) brightness(95%) contrast(1.05);
            }
            body.accessibility-negative-contrast {
                filter: invert(1) hue-rotate(180deg) contrast(1.1);
            }
            body.accessibility-light-background {
                background: #fff !important;
                color: #0b2c6f !important;
                filter: none !important;
            }
            body.accessibility-light-background a {
                color: #0b2c6f !important;
            }
            body.accessibility-links-underline a {
                text-decoration: underline !important;
            }
            body.accessibility-readable-font,
            body.accessibility-readable-font * {
                font-family: 'Open Sans', 'Source Sans 3', sans-serif !important;
            }
            body.accessibility-dyslexic-font,
            body.accessibility-dyslexic-font * {
                font-family: 'OpenDyslexic', 'Source Sans 3', sans-serif !important;
            }
            body.accessibility-letter-spacing {
                letter-spacing: 0.12em;
            }
            body.accessibility-line-height {
                line-height: 1.9;
            }
            body.accessibility-smart-contrast {
                background: radial-gradient(circle at top, #ffd54f, #ffca28 45%, #0058a3 90%) !important;
                color: #001f3f !important;
                filter: none !important;
                text-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
            }
            body.accessibility-low-vision {
                background: linear-gradient(180deg, #0f2637, #10243d);
                color: #f4f6fb !important;
                min-height: 100vh;
                padding: 0 !important;
                border: 8px solid var(--accent-yellow);
                filter: saturate(1.1);
            }
            body.accessibility-low-vision *, 
            body.accessibility-low-vision h1,
            body.accessibility-low-vision p,
            body.accessibility-low-vision a {
                color: #f4f6fb !important;
            }
            body.accessibility-cursor-helper *:focus-visible {
                outline: 3px solid var(--accent-green) !important;
                outline-offset: 2px;
            }
            body.accessibility-cursor-helper {
                cursor: pointer !important;
            }
            body.accessibility-cognitive-helper {
                letter-spacing: 0.1em;
                background: rgba(255, 253, 248, 0.9);
            }
            body.accessibility-cursor {
                cursor: pointer !important;
            }
            body.accessibility-smart-contrast * {
                color: #001f3f !important;
            }
            body.accessibility-smart-contrast a {
                color: #001f3f !important;
                text-decoration: underline;
            }
            body.accessibility-center-text {
                text-align: center;
            }
            .visually-hidden {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                border: 0;
            }
            @media (max-width: 768px) {
                .accessibility-menu {
                    position: fixed;
                    top: auto;
                    bottom: 20px;
                    right: 16px;
                    left: auto;
                    transform: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
})();
