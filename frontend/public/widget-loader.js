/**
 * Embeddable Chat Widget Loader
 * Usage: <script src="https://yourdomain/widget-loader.js" data-bot-id="TENANT_ID"></script>
 */

(function() {
  'use strict';

  // Get the current script tag to read attributes
  const currentScript = document.currentScript || document.querySelector('script[data-bot-id]');
  
  if (!currentScript) {
    console.error('[Chat Widget] Could not find script tag with data-bot-id');
    return;
  }

  const botId = currentScript.getAttribute('data-bot-id');
  const position = currentScript.getAttribute('data-position') || 'bottom-right'; // bottom-right, bottom-left
  const primaryColor = currentScript.getAttribute('data-color') || '#4F46E5';
  const buttonText = currentScript.getAttribute('data-button-text') || '💬';
  
  if (!botId) {
    console.error('[Chat Widget] data-bot-id is required');
    return;
  }

  // Get the origin from the script src
  const scriptSrc = currentScript.src;
  const widgetOrigin = new URL(scriptSrc).origin;

  console.log('[Chat Widget] Initializing with bot ID:', botId);

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'chat-widget-container';
  widgetContainer.style.cssText = `
    position: fixed;
    ${position.includes('bottom') ? 'bottom: 20px;' : 'top: 20px;'}
    ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  `;

  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.id = 'chat-widget-toggle';
  toggleButton.innerHTML = buttonText;
  toggleButton.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${primaryColor};
    color: white;
    border: none;
    cursor: pointer;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  toggleButton.addEventListener('mouseenter', () => {
    toggleButton.style.transform = 'scale(1.1)';
    toggleButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
  });

  toggleButton.addEventListener('mouseleave', () => {
    toggleButton.style.transform = 'scale(1)';
    toggleButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  });

  // Create iframe container
  const iframeContainer = document.createElement('div');
  iframeContainer.id = 'chat-widget-iframe-container';
  iframeContainer.style.cssText = `
    position: fixed;
    ${position.includes('bottom') ? 'bottom: 90px;' : 'top: 90px;'}
    ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    width: 400px;
    height: 600px;
    max-width: calc(100vw - 40px);
    max-height: calc(100vh - 120px);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    display: none;
    z-index: 9998;
    background: white;
  `;

  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'chat-widget-iframe';
  iframe.src = `${widgetOrigin}/embed/${encodeURIComponent(botId)}`;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 12px;
  `;
  iframe.allow = 'clipboard-write';

  iframeContainer.appendChild(iframe);

  // Toggle chat visibility
  let isOpen = false;
  toggleButton.addEventListener('click', () => {
    isOpen = !isOpen;
    iframeContainer.style.display = isOpen ? 'block' : 'none';
    toggleButton.innerHTML = isOpen ? '✕' : buttonText;
    
    if (isOpen) {
      // Send a message to iframe to focus input
      iframe.contentWindow.postMessage({ type: 'CHAT_WIDGET_OPENED' }, widgetOrigin);
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      iframeContainer.style.display = 'none';
      toggleButton.innerHTML = buttonText;
    }
  });

  // Listen for messages from iframe (optional: handle height changes, etc.)
  window.addEventListener('message', (event) => {
    if (event.origin !== widgetOrigin) return;
    
    if (event.data.type === 'CHAT_WIDGET_CLOSE') {
      isOpen = false;
      iframeContainer.style.display = 'none';
      toggleButton.innerHTML = buttonText;
    }
    
    if (event.data.type === 'CHAT_WIDGET_RESIZE' && event.data.height) {
      iframeContainer.style.height = Math.min(event.data.height, window.innerHeight - 120) + 'px';
    }
  });

  // Append to body
  widgetContainer.appendChild(toggleButton);
  document.body.appendChild(widgetContainer);
  document.body.appendChild(iframeContainer);

  console.log('[Chat Widget] Loaded successfully');
})();







