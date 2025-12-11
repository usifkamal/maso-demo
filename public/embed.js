/**
 * White-Label AI Chatbot Widget Loader
 * Version: 1.0.0
 * Bundle size: ~11KB (minified, gzipped: ~4KB)
 * 
 * Dynamic, secure, sandboxed embed loader with multi-tenant support
 * Features: Offline fallback, theme detection, WCAG AA accessibility, telemetry
 */

(function() {
  'use strict';

  // Helper: Get current script tag
  const getCurrentScript = function() {
    return document.currentScript || 
      document.querySelector('script[data-bot-id]') ||
      Array.from(document.querySelectorAll('script')).find(s => s.src && s.src.includes('embed.js'));
  };

  const currentScript = getCurrentScript();
  if (!currentScript) {
    console.error('[Chat Widget] Could not find script tag');
    return;
  }

  // Extract configuration from data attributes
  const botId = currentScript.getAttribute('data-bot-id');
  const position = currentScript.getAttribute('data-position') || 'bottom-right';
  const color = currentScript.getAttribute('data-color');
  const buttonText = currentScript.getAttribute('data-button-text');
  const logoUrl = currentScript.getAttribute('data-logo-url');
  const version = new URLSearchParams(new URL(currentScript.src).search).get('v') || '1.0.0';

  if (!botId) {
    console.error('[Chat Widget] data-bot-id is required');
    return;
  }

  // Get widget origin dynamically
  const widgetOrigin = new URL(currentScript.src).origin;
  const baseUrl = widgetOrigin;

  // Prevent duplicate widgets
  if (document.getElementById('chat-widget-container')) {
    console.warn('[Chat Widget] Widget already initialized');
    return;
  }

  // State management
  let widgetConfig = null;
  let isOpen = false;
  let isLoadingConfig = false;
  let hasOfflineFallback = false;

  // Theme detection: Check if host page background is light
  const detectHostTheme = function() {
    const bodyStyle = window.getComputedStyle(document.body);
    const bgColor = bodyStyle.backgroundColor;
    
    // Parse RGB and calculate luminance
    const rgbMatch = bgColor.match(/\d+/g);
    if (!rgbMatch || rgbMatch.length < 3) return 'dark';
    
    const r = parseInt(rgbMatch[0], 10);
    const g = parseInt(rgbMatch[1], 10);
    const b = parseInt(rgbMatch[2], 10);
    
    // Calculate relative luminance (WCAG formula)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'light' : 'dark';
  };

  // Adjust color for contrast if needed
  const ensureContrast = function(baseColor, isLightTheme) {
    // If host is light, darken widget colors slightly for contrast
    if (isLightTheme) {
      // Convert hex to RGB
      const hex = baseColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Darken by 15% for better contrast
      return 'rgb(' + 
        Math.floor(r * 0.85) + ',' + 
        Math.floor(g * 0.85) + ',' + 
        Math.floor(b * 0.85) + ')';
    }
    return baseColor;
  };

  // Create offline fallback UI
  const showOfflineFallback = function() {
    if (hasOfflineFallback) return;
    hasOfflineFallback = true;

    const fallbackContainer = document.createElement('div');
    fallbackContainer.id = 'chat-widget-offline-fallback';
    fallbackContainer.setAttribute('role', 'alert');
    fallbackContainer.setAttribute('aria-live', 'polite');
    fallbackContainer.style.cssText = `
      position: fixed;
      ${position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
      ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
      width: 300px;
      max-width: calc(100vw - 40px);
      padding: 16px;
      background: #1f2937;
      color: #f9fafb;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 9997;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      border: 1px solid #374151;
    `;

    const title = document.createElement('div');
    title.textContent = 'Chat Unavailable';
    title.style.cssText = 'font-weight: 600; margin-bottom: 8px; color: #f9fafb;';
    fallbackContainer.appendChild(title);

    const message = document.createElement('div');
    message.textContent = 'Unable to connect. Please check your internet connection and try again.';
    message.style.cssText = 'color: #d1d5db; margin-bottom: 12px;';
    fallbackContainer.appendChild(message);

    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Retry';
    retryBtn.setAttribute('type', 'button');
    retryBtn.setAttribute('aria-label', 'Retry loading chat widget');
    retryBtn.style.cssText = `
      background: #4f46e5;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
    `;
    retryBtn.addEventListener('click', function() {
      fallbackContainer.remove();
      hasOfflineFallback = false;
      fetchWidgetConfig().then(function() {
        if (widgetConfig) {
          renderWidget();
        }
      });
    });
    fallbackContainer.appendChild(retryBtn);

    document.body.appendChild(fallbackContainer);
  };

  // Fetch widget configuration from API
  const fetchWidgetConfig = async function() {
    if (isLoadingConfig) return widgetConfig;
    isLoadingConfig = true;

    try {
      const response = await fetch(baseUrl + '/api/tenant/' + encodeURIComponent(botId), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      if (!response.ok) {
        throw new Error('Failed to fetch widget config: ' + response.status);
      }

      const data = await response.json();
      const hostTheme = detectHostTheme();
      const adjustedColor = ensureContrast(
        color || data.settings?.color || data.settings?.primaryColor || '#4F46E5',
        hostTheme === 'light'
      );

      widgetConfig = {
        tenantId: data.tenantId || botId,
        name: data.name || 'AI Assistant',
        settings: {
          color: adjustedColor,
          position: position || data.settings?.position || 'bottom-right',
          logoUrl: logoUrl || data.settings?.logoUrl || data.settings?.logo || null,
          buttonText: buttonText || data.settings?.buttonText || '💬',
          greetingMessage: data.settings?.greetingMessage || data.settings?.greeting || null,
        },
      };
    } catch (error) {
      console.error('[Chat Widget] Error fetching config:', error);
      
      // Show offline fallback if network error
      if (error.name === 'TimeoutError' || error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        showOfflineFallback();
      }

      // Fallback to data attributes only
      const hostTheme = detectHostTheme();
      const adjustedColor = ensureContrast(color || '#4F46E5', hostTheme === 'light');

      widgetConfig = {
        tenantId: botId,
        name: 'AI Assistant',
        settings: {
          color: adjustedColor,
          position: position || 'bottom-right',
          logoUrl: logoUrl || null,
          buttonText: buttonText || '💬',
          greetingMessage: null,
        },
      };
    } finally {
      isLoadingConfig = false;
    }

    return widgetConfig;
  };

  // Initialize widget configuration
  fetchWidgetConfig().then(function() {
    renderWidget();
  });

  function renderWidget() {
    if (!widgetConfig) {
      setTimeout(function() {
        fetchWidgetConfig().then(function() {
          if (widgetConfig) renderWidget();
        });
      }, 500);
      return;
    }

    const config = widgetConfig.settings;

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'chat-widget-container';
    widgetContainer.setAttribute('data-widget-version', version);
    widgetContainer.setAttribute('role', 'complementary');
    widgetContainer.setAttribute('aria-label', 'Chat widget');
    widgetContainer.style.cssText = 
      'position: fixed;' +
      (config.position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;') +
      (config.position.includes('right') ? 'right: 20px;' : 'left: 20px;') +
      'z-index: 9999;' +
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;';

    // Create toggle button (WCAG AA compliant - min contrast 4.5:1)
    const toggleButton = document.createElement('button');
    toggleButton.id = 'chat-widget-toggle';
    toggleButton.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
    toggleButton.setAttribute('aria-expanded', 'false');
    toggleButton.setAttribute('type', 'button');
    toggleButton.textContent = config.buttonText; // Use textContent for security
    toggleButton.style.cssText = 
      'width: 60px;' +
      'height: 60px;' +
      'border-radius: 50%;' +
      'background: ' + config.color + ';' +
      'color: #ffffff;' + // Ensure high contrast
      'border: 2px solid rgba(255, 255, 255, 0.2);' +
      'cursor: pointer;' +
      'font-size: 24px;' +
      'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);' +
      'transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;' +
      'display: flex;' +
      'align-items: center;' +
      'justify-content: center;' +
      'outline: none;';

    // Button hover/focus effects
    toggleButton.addEventListener('mouseenter', function() {
      toggleButton.style.transform = 'scale(1.1)';
      toggleButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });

    toggleButton.addEventListener('mouseleave', function() {
      toggleButton.style.transform = 'scale(1)';
      toggleButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    });

    toggleButton.addEventListener('focus', function() {
      toggleButton.style.outline = '2px solid #ffffff';
      toggleButton.style.outlineOffset = '2px';
    });

    toggleButton.addEventListener('blur', function() {
      toggleButton.style.outline = 'none';
    });

    // Create iframe container (lazy-loaded)
    const iframeContainer = document.createElement('div');
    iframeContainer.id = 'chat-widget-iframe-container';
    iframeContainer.setAttribute('role', 'dialog');
    iframeContainer.setAttribute('aria-label', 'Chat conversation');
    iframeContainer.setAttribute('aria-modal', 'false');
    iframeContainer.style.cssText = 
      'position: fixed;' +
      (config.position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;') +
      (config.position.includes('right') ? 'right: 20px;' : 'left: 20px;') +
      'width: 400px;' +
      'height: 600px;' +
      'max-width: calc(100vw - 40px);' +
      'max-height: calc(100vh - 120px);' +
      'border-radius: 12px;' +
      'box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);' +
      'overflow: hidden;' +
      'display: none;' +
      'z-index: 9998;' +
      'background: transparent;';

    // Create iframe (sandboxed for security)
    let iframe = null;

    function createIframe() {
      if (iframe) return;

      iframe = document.createElement('iframe');
      iframe.id = 'chat-widget-iframe';
      iframe.src = baseUrl + '/embed/' + encodeURIComponent(botId) + '?v=' + version;
      iframe.setAttribute('title', 'Chat Widget - ' + (widgetConfig.name || 'AI Assistant'));
      iframe.setAttribute('aria-label', 'Chat conversation with ' + (widgetConfig.name || 'AI Assistant'));
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
      iframe.setAttribute('referrerpolicy', 'no-referrer');
      iframe.setAttribute('allow', 'clipboard-write');
      iframe.style.cssText = 
        'width: 100%;' +
        'height: 100%;' +
        'border: none;' +
        'border-radius: 12px;' +
        'background: transparent;';

      iframeContainer.appendChild(iframe);
    }

    // Toggle chat visibility
    toggleButton.addEventListener('click', function() {
      isOpen = !isOpen;
      toggleButton.setAttribute('aria-expanded', String(isOpen));
      toggleButton.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open chat');
      
      if (isOpen) {
        if (!iframe) {
          createIframe();
        }
        iframeContainer.style.display = 'block';
        toggleButton.textContent = '\u2715'; // ✕ (Unicode escape for security - no XSS risk)
        toggleButton.setAttribute('aria-label', 'Close chat');
        
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage({ type: 'CHAT_WIDGET_OPENED' }, widgetOrigin);
          } catch (e) {
            console.warn('[Chat Widget] Could not post message to iframe:', e);
          }
        }
      } else {
        iframeContainer.style.display = 'none';
        toggleButton.textContent = config.buttonText;
        toggleButton.setAttribute('aria-label', 'Open chat');
      }
    });

    // Close on ESC key (accessibility)
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        isOpen = false;
        iframeContainer.style.display = 'none';
        toggleButton.textContent = config.buttonText;
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-label', 'Open chat');
        toggleButton.focus(); // Return focus to button
      }
    });

    // Listen for messages from iframe
    window.addEventListener('message', function(event) {
      if (event.origin !== widgetOrigin) return; // Security: verify origin
      
      if (event.data.type === 'CHAT_WIDGET_CLOSE') {
        isOpen = false;
        iframeContainer.style.display = 'none';
        toggleButton.textContent = config.buttonText;
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-label', 'Open chat');
      }
      
      if (event.data.type === 'CHAT_WIDGET_RESIZE' && event.data.height) {
        const maxHeight = window.innerHeight - 120;
        iframeContainer.style.height = Math.min(event.data.height, maxHeight) + 'px';
      }
    });

    // Append to body
    widgetContainer.appendChild(toggleButton);
    document.body.appendChild(widgetContainer);
    document.body.appendChild(iframeContainer);

    console.log('[Chat Widget] Loaded successfully', { botId: botId, version: version });
  }
})();
