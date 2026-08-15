'use client';

import React, { useState, useEffect, useRef } from 'react';

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState('');
  
  const [state, setState] = useState({
    fontSize: 1.0,
    highContrast: false,
    linksUnderline: false,
    animationsPaused: false,
    imagesHidden: false,
    dyslexic: false,
    cognitive: false,
    smartContrast: false,
    lowVision: false,
    screenReader: false,
    grayscale: false,
    negativeContrast: false,
    lightBackground: false,
    readableFont: false,
    cursorHelper: false,
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const announce = (message: string) => {
    setStatus(message);
    // Clear after 3 seconds
    setTimeout(() => setStatus(''), 3000);
  };

  const cancelSpeech = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
  };

  const readPage = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      announce('Speech synthesis is unavailable in this browser.');
      return;
    }

    cancelSpeech();

    const mainContent = Array.from(document.querySelectorAll('main, section, article'))
      .map((node) => node.textContent || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!mainContent) {
      announce('No readable text detected.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(mainContent);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = document.documentElement.lang || 'en-US';
    
    utterance.onend = () => {
      setState((prev) => ({ ...prev, screenReader: false }));
      announce('Screen reader finished.');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    announce('Reading page aloud.');
  };

  const toggleScreenReader = () => {
    const nextVal = !state.screenReader;
    setState((prev) => ({ ...prev, screenReader: nextVal }));
    if (nextVal) {
      readPage();
    } else {
      cancelSpeech();
      announce('Screen reader stopped.');
    }
  };

  const toggleClass = (className: string, key: keyof typeof state, message: string) => {
    const nextVal = !state[key];
    setState((prev) => ({ ...prev, [key]: nextVal }));
    document.body.classList.toggle(className, nextVal as boolean);
    announce(message);
  };

  const adjustFontSize = (delta: number) => {
    const nextSize = Math.max(0.9, Math.min(1.6, state.fontSize + delta));
    setState((prev) => ({ ...prev, fontSize: nextSize }));
    document.documentElement.style.fontSize = `${nextSize}em`;
    announce(`Text size ${nextSize.toFixed(2)}em`);
  };

  const toggleAnimations = () => {
    const nextVal = !state.animationsPaused;
    setState((prev) => ({ ...prev, animationsPaused: nextVal }));
    
    const existingStyle = document.getElementById('accessibility-pause-animations');
    if (nextVal) {
      const style = document.createElement('style');
      style.id = 'accessibility-pause-animations';
      style.textContent = '* { animation-play-state: paused !important; transition: none !important; }';
      document.head.appendChild(style);
      announce('Animations paused');
    } else {
      if (existingStyle) existingStyle.remove();
      announce('Animations resumed');
    }
  };

  const toggleImages = () => {
    const nextVal = !state.imagesHidden;
    setState((prev) => ({ ...prev, imagesHidden: nextVal }));
    document.body.classList.toggle('accessibility-hide-images', nextVal);
    announce(nextVal ? 'Images hidden' : 'Images visible');
  };

  const resetAll = () => {
    cancelSpeech();
    
    // Clear styles
    document.documentElement.style.fontSize = '';
    const pauseStyle = document.getElementById('accessibility-pause-animations');
    if (pauseStyle) pauseStyle.remove();

    // Clear classes
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
      'accessibility-cursor',
      'accessibility-grayscale',
      'accessibility-negative-contrast',
      'accessibility-light-background',
      'accessibility-links-underline',
      'accessibility-readable-font'
    );

    setState({
      fontSize: 1.0,
      highContrast: false,
      linksUnderline: false,
      animationsPaused: false,
      imagesHidden: false,
      dyslexic: false,
      cognitive: false,
      smartContrast: false,
      lowVision: false,
      screenReader: false,
      grayscale: false,
      negativeContrast: false,
      lightBackground: false,
      readableFont: false,
      cursorHelper: false,
    });
    announce('Accessibility settings reset');
  };

  // Close panel on outside click or Esc
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.accessibility-menu')) {
        setIsOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  return (
    <div className="accessibility-menu">
      <button
        className="accessibility-toggle"
        type="button"
        aria-controls="accessibility-panel"
        aria-expanded={isOpen}
        aria-label="Open accessibility controls"
        onClick={() => setIsOpen(!isOpen)}
        style={{ pointerEvents: 'auto' }}
      >
        <span className="accessibility-toggle__icon" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-universal-access" style={{ fontSize: '1.7rem' }} />
        </span>
        <span className="visually-hidden">Open accessibility controls</span>
      </button>

      <section
        className={`accessibility-panel ${isOpen ? 'is-open' : ''}`}
        id="accessibility-panel"
        role="region"
        aria-label="Accessibility panel"
        aria-hidden={!isOpen}
      >
        <header className="accessibility-panel__header">
          <div>
            <p className="accessibility-panel__title">Accessibility</p>
            <p className="accessibility-panel__subtitle">NPC Rwanda</p>
          </div>
          <button
            type="button"
            className="accessibility-panel__close"
            aria-label="Close accessibility panel"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
        </header>

        <p className="accessibility-status" role="status" aria-live="polite">
          {status}
        </p>

        <div className="accessibility-panel__grid">
          <div className="accessibility-section">
            <h3>Text & Font</h3>
            <div className="accessibility-actions">
              <button type="button" onClick={() => adjustFontSize(0.15)}>
                Increase Text
              </button>
              <button type="button" onClick={() => adjustFontSize(-0.15)}>
                Decrease Text
              </button>
              <button
                type="button"
                className={state.readableFont ? 'active' : ''}
                onClick={() =>
                  toggleClass('accessibility-readable-font', 'readableFont', 'Readable font toggled')
                }
              >
                Readable Font
              </button>
            </div>
          </div>

          <div className="accessibility-section">
            <h3>Contrast & Color</h3>
            <div className="accessibility-actions">
              <button
                type="button"
                className={state.grayscale ? 'active' : ''}
                onClick={() => toggleClass('accessibility-grayscale', 'grayscale', 'Grayscale mode toggled')}
              >
                Grayscale
              </button>
              <button
                type="button"
                className={state.highContrast ? 'active' : ''}
                onClick={() =>
                  toggleClass('accessibility-high-contrast', 'highContrast', 'High contrast mode toggled')
                }
              >
                High Contrast
              </button>
              <button
                type="button"
                className={state.negativeContrast ? 'active' : ''}
                onClick={() =>
                  toggleClass('accessibility-negative-contrast', 'negativeContrast', 'Negative contrast mode toggled')
                }
              >
                Negative Contrast
              </button>
              <button
                type="button"
                className={state.lightBackground ? 'active' : ''}
                onClick={() =>
                  toggleClass('accessibility-light-background', 'lightBackground', 'Light background mode toggled')
                }
              >
                Light Background
              </button>
              <button
                type="button"
                className={state.linksUnderline ? 'active' : ''}
                onClick={() =>
                  toggleClass('accessibility-links-underline', 'linksUnderline', 'Underline links toggled')
                }
              >
                Links Underline
              </button>
            </div>
          </div>

          <div className="accessibility-section">
            <h3>Profiles & Support</h3>
            <div className="accessibility-actions">
              <button
                type="button"
                className={state.lowVision ? 'active' : ''}
                onClick={() => toggleClass('accessibility-low-vision', 'lowVision', 'Low vision profile active')}
              >
                Low vision
              </button>
              <button
                type="button"
                className={state.dyslexic ? 'active' : ''}
                onClick={() => toggleClass('accessibility-dyslexic-font', 'dyslexic', 'Dyslexia font active')}
              >
                Dyslexia
              </button>
              <button
                type="button"
                className={state.smartContrast ? 'active' : ''}
                onClick={() =>
                  toggleClass('accessibility-smart-contrast', 'smartContrast', 'Color blind palette applied')
                }
              >
                Color blind
              </button>
              <button
                type="button"
                className={state.cognitive ? 'active' : ''}
                onClick={() =>
                  toggleClass('accessibility-cognitive-helper', 'cognitive', 'Cognitive-friendly layout active')
                }
              >
                Cognitive
              </button>
              <button
                type="button"
                className={state.screenReader ? 'active' : ''}
                onClick={toggleScreenReader}
              >
                Screen reader
              </button>
            </div>
          </div>

          <div className="accessibility-section">
            <h3>Motion & Helpers</h3>
            <div className="accessibility-actions">
              <button
                type="button"
                className={state.animationsPaused ? 'active' : ''}
                onClick={toggleAnimations}
              >
                Pause motion
              </button>
              <button
                type="button"
                className={state.imagesHidden ? 'active' : ''}
                onClick={toggleImages}
              >
                Hide images
              </button>
              <button
                type="button"
                className={state.cursorHelper ? 'active' : ''}
                onClick={() => toggleClass('accessibility-cursor', 'cursorHelper', 'Cursor helper toggled')}
              >
                Cursor helper
              </button>
            </div>
          </div>
        </div>

        <button type="button" className="accessibility-reset" onClick={resetAll}>
          Reset settings
        </button>
      </section>
    </div>
  );
};
