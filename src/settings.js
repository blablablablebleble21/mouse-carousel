// Settings UI Logic

let config = {};
let currentEditIndex = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Settings page loading...');
    try {
        config = await window.electronAPI.getConfig();
        console.log('Config loaded:', config);
        initTabs();
        populateUI();
        attachEventListeners();
        console.log('Settings page ready!');
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
});

// Tab Navigation
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            // Remove active class
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class
            btn.classList.add('active');
            document.getElementById(`${target}-tab`).classList.add('active');
        });
    });
}

// Populate UI with config values
function populateUI() {
    console.log('Populating UI with config:', config);
    
    // Get theme colors
    const themeColors = typeof config.theme === 'string' 
        ? (config.themes && config.themes[config.theme]) || config.themes.dark
        : config.theme;
    
    console.log('Theme colors:', themeColors);
    
    // Appearance Tab
    if (themeColors) {
        document.getElementById('bgColor').value = rgbaToHex(themeColors.bgColor);
        document.getElementById('bgColorText').value = themeColors.bgColor;
        const opacityMatch = themeColors.bgColor.match(/[\d.]+\)$/);
        if (opacityMatch) {
            document.getElementById('bgOpacity').value = parseFloat(opacityMatch[0]) * 100;
        }
        
        document.getElementById('accentColor').value = rgbaToHex(themeColors.accentColor);
        document.getElementById('accentColorText').value = themeColors.accentColor;
        
        document.getElementById('iconColor').value = rgbaToHex(themeColors.iconColor);
        document.getElementById('iconColorText').value = themeColors.iconColor;
        
        document.getElementById('hoverIconColor').value = rgbaToHex(themeColors.hoverIconColor);
        document.getElementById('hoverIconColorText').value = themeColors.hoverIconColor;
    }
    
    document.getElementById('ringSize').value = config.ringSize;
    document.getElementById('ringSizeValue').textContent = `${config.ringSize}px`;
    
    document.getElementById('animationSpeed').value = config.animationSpeed;
    document.getElementById('animationSpeedValue').textContent = `${config.animationSpeed}ms`;
    
    // Hotkeys Tab
    document.getElementById('carouselHotkey').value = config.hotkey;
    document.getElementById('settingsHotkey').value = config.settingsHotkey;
    
    // Actions Tab
    renderActionsList();
}

// Render actions list
function renderActionsList() {
    console.log('Rendering actions list, count:', config.actions.length);
    const list = document.getElementById('actions-list');
    const counter = document.getElementById('action-count');
    
    if (!list) {
        console.error('Actions list element not found!');
        return;
    }
    
    // Clear existing content
    list.innerHTML = '';
    counter.textContent = config.actions.length;
    
    config.actions.forEach((action, index) => {
        const item = document.createElement('div');
        item.className = 'action-item';
        
        const typeLabel = action.type === 'keyboard' ? 'Keyboard' : 'Execute';
        let detail = '';
        if (action.type === 'keyboard') {
            const keys = Array.isArray(action.keys) ? action.keys.join('+') : action.keys;
            detail = `Keys: ${keys}`;
        } else {
            detail = `Command: ${action.command}`;
        }
        
        // Fix icon class - ensure it has bi- prefix
        const iconClass = action.icon.startsWith('bi-') ? action.icon : `bi-${action.icon}`;
        
        item.innerHTML = `
            <div class="action-icon">
                <i class="bi ${iconClass}"></i>
            </div>
            <div class="action-info">
                <div class="action-name">${action.name}</div>
                <div class="action-detail">${typeLabel} - ${detail}</div>
            </div>
            <div class="action-actions">
                <button class="icon-btn" data-index="${index}" data-action="edit">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="icon-btn" data-index="${index}" data-action="test">
                    <i class="bi bi-play"></i>
                </button>
                <button class="icon-btn danger" data-index="${index}" data-action="delete">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;
        
        list.appendChild(item);
    });
    
    console.log('Actions list rendered with', config.actions.length, 'items');
}

// Attach event listeners
function attachEventListeners() {
    console.log('Attaching event listeners...');
    
    // Event delegation for action list buttons - works even after DOM changes
    const actionsList = document.getElementById('actions-list');
    if (actionsList) {
        console.log('Setting up event delegation for actions list');
        actionsList.addEventListener('click', (e) => {
            // Find the button that was clicked
            const btn = e.target.closest('.icon-btn[data-action]');
            if (!btn) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const index = parseInt(btn.dataset.index);
            const action = btn.dataset.action;
            
            console.log('Action button clicked via delegation:', action, 'for index:', index);
            
            if (action === 'edit') {
                editAction(index);
            } else if (action === 'test') {
                testAction(index);
            } else if (action === 'delete') {
                deleteAction(index);
            }
        });
    } else {
        console.error('Actions list element not found for event delegation!');
    }
    
    // Color pickers
    setupColorPicker('bgColor', 'bgColorText', 'bgOpacity');
    setupColorPicker('accentColor', 'accentColorText');
    setupColorPicker('iconColor', 'iconColorText');
    setupColorPicker('hoverIconColor', 'hoverIconColorText');
    
    // Sliders
    document.getElementById('ringSize').addEventListener('input', (e) => {
        document.getElementById('ringSizeValue').textContent = `${e.target.value}px`;
    });
    
    document.getElementById('animationSpeed').addEventListener('input', (e) => {
        document.getElementById('animationSpeedValue').textContent = `${e.target.value}ms`;
    });
    
    // Add action button
    const addBtn = document.getElementById('add-action-btn');
    if (addBtn) {
        console.log('Add action button found, attaching listener');
        addBtn.addEventListener('click', () => {
            console.log('Add action clicked');
            currentEditIndex = null;
            openActionModal();
        });
    } else {
        console.error('Add action button not found!');
    }
    
    // Modal close
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');
    
    if (modalClose) modalClose.addEventListener('click', closeActionModal);
    if (modalCancel) modalCancel.addEventListener('click', closeActionModal);
    
    // Close modal on background click
    const actionModal = document.getElementById('action-modal');
    if (actionModal) {
        actionModal.addEventListener('click', (e) => {
            if (e.target.id === 'action-modal') {
                closeActionModal();
            }
        });
    }
    
    // Modal save
    const saveActionBtn = document.getElementById('save-action-btn');
    if (saveActionBtn) {
        console.log('Save action button found');
        saveActionBtn.addEventListener('click', () => {
            console.log('Save action button clicked');
            saveAction();
        });
    } else {
        console.error('Save action button not found!');
    }
    
    // Action type change
    const actionType = document.getElementById('action-type');
    if (actionType) {
        actionType.addEventListener('change', (e) => {
            document.getElementById('keyboard-config').style.display = 
                e.target.value === 'keyboard' ? 'block' : 'none';
            document.getElementById('exec-config').style.display = 
                e.target.value === 'exec' ? 'block' : 'none';
        });
    }
    
    // Icon preview
    const actionIcon = document.getElementById('action-icon');
    const chooseIcon = document.getElementById('choose-icon');
    if (actionIcon) actionIcon.addEventListener('input', updateIconPreview);
    if (chooseIcon) {
        console.log('Choose icon button found');
        chooseIcon.addEventListener('click', () => {
            console.log('Choose icon clicked');
            openIconPicker();
        });
    }
    
    // Test action in modal
    const testActionBtn = document.getElementById('test-action-btn');
    if (testActionBtn) testActionBtn.addEventListener('click', testCurrentAction);
    
    // Save all settings
    const saveAppearance = document.getElementById('save-appearance');
    const saveHotkeys = document.getElementById('save-hotkeys');
    if (saveAppearance) saveAppearance.addEventListener('click', saveAppearanceSettings);
    if (saveHotkeys) saveHotkeys.addEventListener('click', saveHotkeySettings);
    
    // Reset buttons for each tab
    const resetActions = document.getElementById('reset-actions');
    if (resetActions) {
        console.log('Reset actions button found');
        resetActions.addEventListener('click', resetActionsToDefaults);
    }
    
    const resetAppearance = document.getElementById('reset-appearance');
    if (resetAppearance) {
        console.log('Reset appearance button found');
        resetAppearance.addEventListener('click', resetAppearanceToDefaults);
    }
    
    const resetHotkeysBtn = document.getElementById('reset-hotkeys');
    if (resetHotkeysBtn) {
        console.log('Reset hotkeys button found');
        resetHotkeysBtn.addEventListener('click', resetHotkeys);
    }
    
    // Hotkey recording
    setupHotkeyRecording('carouselHotkey', 'record-carousel-hotkey');
    setupHotkeyRecording('settingsHotkey', 'record-settings-hotkey');
    
    console.log('Event listeners attached successfully');
}

// Setup color picker with text input and opacity
function setupColorPicker(pickerId, textId, opacityId = null) {
    const picker = document.getElementById(pickerId);
    const text = document.getElementById(textId);
    const opacity = opacityId ? document.getElementById(opacityId) : null;
    
    picker.addEventListener('input', () => {
        const hex = picker.value;
        const opacityValue = opacity ? opacity.value / 100 : 1;
        const rgba = hexToRgba(hex, opacityValue);
        text.value = rgba;
    });
    
    text.addEventListener('input', () => {
        const rgba = text.value;
        picker.value = rgbaToHex(rgba);
        if (opacity) {
            const match = rgba.match(/[\d.]+\)$/);
            if (match) {
                opacity.value = parseFloat(match[0]) * 100;
            }
        }
    });
    
    if (opacity) {
        opacity.addEventListener('input', () => {
            const hex = picker.value;
            const opacityValue = opacity.value / 100;
            text.value = hexToRgba(hex, opacityValue);
            const valueDisplay = document.getElementById(opacityId.replace('Opacity', 'OpacityValue'));
            if (valueDisplay) {
                valueDisplay.textContent = opacity.value + '%';
            }
        });
    }
}

// Setup hotkey recording
function setupHotkeyRecording(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const recordBtn = document.getElementById(buttonId);
    
    let isRecording = false;
    
    recordBtn.addEventListener('click', () => {
        if (isRecording) {
            isRecording = false;
            recordBtn.innerHTML = '<i class="bi bi-record-circle"></i> Record New Hotkey';
            recordBtn.classList.remove('btn-danger');
            recordBtn.classList.add('btn-secondary');
            return;
        }
        
        isRecording = true;
        recordBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Press Keys...';
        recordBtn.classList.remove('btn-secondary');
        recordBtn.classList.add('btn-danger');
        input.value = '';
        input.focus();
    });
    
    input.addEventListener('keydown', (e) => {
        // Only intercept keys when recording
        if (!isRecording) {
            // Allow normal editing
            return;
        }
        
        e.preventDefault();
        
        const keys = [];
        
        // Add modifiers
        if (e.ctrlKey || e.metaKey) keys.push('CommandOrControl');
        if (e.altKey) keys.push('Alt');
        if (e.shiftKey) keys.push('Shift');
        // Note: Win/Super key is captured as metaKey on Windows
        
        // Add main key
        const key = e.key;
        if (key !== 'Control' && key !== 'Alt' && key !== 'Shift' && key !== 'Meta' && key !== 'Super') {
            if (key === ' ') {
                keys.push('Space');
            } else if (key === ';') {
                keys.push(';');
            } else if (key.length === 1) {
                keys.push(key.toUpperCase());
            } else {
                keys.push(key);
            }
        }
        
        // Need at least modifier + key (2 parts)
        if (keys.length >= 2) {
            input.value = keys.join('+');
            isRecording = false;
            recordBtn.innerHTML = '<i class=\"bi bi-record-circle\"></i> Record New Hotkey';
            recordBtn.classList.remove('btn-danger');
            recordBtn.classList.add('btn-secondary');
        } else if (keys.length === 1) {
            // Show current key combo being built
            input.value = keys.join('+') + '+...';
        }
    });
}

// Open action modal
function openActionModal(action = null) {
    const modal = document.getElementById('action-modal');
    console.log('Opening action modal, action:', action);
    
    // Populate quick icon picker
    const quickIcons = ['spotify', 'clipboard', 'clipboard-check', 'crop', 'gear', 'window-stack', 
                        'play-circle', 'pause-circle', 'stop-circle', 'volume-up', 'music-note', 
                        'browser-chrome', 'calculator', 'camera', 'folder', 'file-text',
                        'terminal', 'keyboard', 'mouse', 'controller'];
    
    const quickIconsContainer = document.getElementById('quick-icons');
    quickIconsContainer.innerHTML = quickIcons.map(icon => `
        <div class="quick-icon" data-icon="${icon}" style="cursor: pointer; padding: 8px; border: 2px solid var(--border); border-radius: 6px; transition: all 0.2s; background: var(--bg);">
            <i class="bi bi-${icon}" style="font-size: 1.5rem; color: var(--primary);"></i>
        </div>
    `).join('');
    
    // Add click handlers for quick icons
    document.querySelectorAll('.quick-icon').forEach(el => {
        el.addEventListener('click', () => {
            const icon = el.getAttribute('data-icon');
            document.getElementById('action-icon').value = icon;
            updateIconPreview();
            // Highlight selected icon
            document.querySelectorAll('.quick-icon').forEach(q => {
                q.style.borderColor = 'var(--border)';
                q.style.background = 'var(--bg)';
            });
            el.style.borderColor = 'var(--primary)';
            el.style.background = 'rgba(147, 51, 234, 0.2)';
        });
        el.addEventListener('mouseenter', (e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.transform = 'scale(1.15)';
        });
        el.addEventListener('mouseleave', (e) => {
            const currentIcon = document.getElementById('action-icon').value;
            if (e.currentTarget.getAttribute('data-icon') !== currentIcon) {
                e.currentTarget.style.borderColor = 'var(--border)';
            }
            e.currentTarget.style.transform = 'scale(1)';
        });
    });
    
    if (action) {
        console.log('Editing action:', action);
        document.getElementById('modal-title').textContent = 'Edit Action';
        document.getElementById('action-name').value = action.name;
        document.getElementById('action-icon').value = action.icon;
        document.getElementById('action-type').value = action.type;
        
        if (action.type === 'keyboard') {
            // Parse keys - handle both string and array
            let keyParts = [];
            if (Array.isArray(action.keys)) {
                keyParts = action.keys;
            } else if (typeof action.keys === 'string') {
                keyParts = action.keys.split('+').map(k => k.trim().toLowerCase());
            }
            
            // Extract main key and modifiers
            let mainKey = '';
            const modifiers = [];
            
            keyParts.forEach(key => {
                const lower = key.toLowerCase();
                if (lower === 'control' || lower === 'ctrl' || lower === 'commandorcontrol') {
                    modifiers.push('control');
                } else if (lower === 'super' || lower === 'win' || lower === 'meta' || lower === 'command') {
                    modifiers.push('super');
                } else if (lower === 'alt') {
                    modifiers.push('alt');
                } else if (lower === 'shift') {
                    modifiers.push('shift');
                } else if (lower === 'super' || lower === 'command' || lower === 'meta') {
                    modifiers.push('command');
                } else {
                    mainKey = key;
                }
            });
            
            document.getElementById('key-input').value = mainKey;
            
            // Clear all checkboxes first
            document.querySelectorAll('#keyboard-config input[type="checkbox"]').forEach(cb => cb.checked = false);
            
            // Set modifiers
            modifiers.forEach(mod => {
                const checkbox = document.querySelector(`#keyboard-config input[value="${mod}"]`);
                if (checkbox) checkbox.checked = true;
            });
            
            document.getElementById('keyboard-config').style.display = 'block';
            document.getElementById('exec-config').style.display = 'none';
        } else {
            document.getElementById('command-input').value = action.command;
            document.getElementById('keyboard-config').style.display = 'none';
            document.getElementById('exec-config').style.display = 'block';
        }
    } else {
        document.getElementById('modal-title').textContent = 'Add New Action';
        document.getElementById('action-name').value = '';
        document.getElementById('action-icon').value = 'plus-circle';
        document.getElementById('action-type').value = 'keyboard';
        document.getElementById('key-input').value = '';
        document.querySelectorAll('#keyboard-config input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('command-input').value = '';
        document.getElementById('keyboard-config').style.display = 'block';
        document.getElementById('exec-config').style.display = 'none';
    }
    
    updateIconPreview();
    modal.classList.add('active');
    
    // Focus the first input
    setTimeout(() => {
        document.getElementById('action-name').focus();
    }, 100);
}

// Close action modal
function closeActionModal() {
    const modal = document.getElementById('action-modal');
    modal.classList.remove('active');
    currentEditIndex = null;
    
    // Clear form
    document.getElementById('action-name').value = '';
    document.getElementById('action-icon').value = 'plus-circle';
    document.getElementById('key-input').value = '';
    document.getElementById('command-input').value = '';
    document.querySelectorAll('#keyboard-config input[type="checkbox"]').forEach(cb => cb.checked = false);
}

// Update icon preview
function updateIconPreview() {
    const icon = document.getElementById('action-icon').value;
    document.getElementById('icon-preview').className = `bi bi-${icon}`;
}

// Icon picker
const popularIcons = [
    'alarm', 'archive', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down',
    'bell', 'bookmark', 'box', 'briefcase', 'brush', 'bucket',
    'calculator', 'calendar', 'camera', 'cart', 'chat', 'check-circle',
    'clipboard', 'clock', 'cloud', 'code', 'compass', 'copy',
    'credit-card', 'crop', 'database', 'download', 'droplet', 'emoji-smile',
    'envelope', 'eye', 'file', 'file-text', 'film', 'filter',
    'flag', 'folder', 'gear', 'gift', 'globe', 'graph-up',
    'grid', 'hammer', 'heart', 'home', 'house', 'image',
    'inbox', 'info-circle', 'journal', 'joystick', 'key', 'laptop',
    'layers', 'lightning', 'link', 'list', 'lock', 'map',
    'megaphone', 'mic', 'moon', 'music-note', 'palette', 'paperclip',
    'pencil', 'people', 'person', 'phone', 'pin', 'play-circle',
    'plug', 'plus-circle', 'power', 'printer', 'puzzle', 'question-circle',
    'recycle', 'save', 'scissors', 'search', 'server', 'share',
    'shield', 'shop', 'shuffle', 'skip-forward', 'slash-circle', 'speaker',
    'speedometer', 'star', 'stop-circle', 'sun', 'tag', 'terminal',
    'thermometer', 'trash', 'trophy', 'truck', 'tv', 'type',
    'umbrella', 'unlock', 'upload', 'volume-up', 'wallet', 'wifi',
    'window', 'wrench', 'x-circle', 'zoom-in', 'zoom-out', 'app',
    'backspace', 'battery-charging', 'brightness-high', 'bug', 'bullseye', 'calculator',
    'camera-video', 'cash', 'controller', 'cpu', 'discord', 'display',
    'fire', 'folder-fill', 'funnel', 'gear-fill', 'github', 'google',
    'hdd', 'headphones', 'keyboard', 'lightning-charge', 'list-check', 'mailbox',
    'menu-app', 'menu-button-wide', 'microphone', 'mouse', 'nintendo-switch', 'pc-display',
    'pencil-square', 'pie-chart', 'play-btn', 'playstation', 'rocket-takeoff', 'save2',
    'send', 'server', 'shop-window', 'skip-backward', 'skip-end', 'skip-start',
    'sliders', 'spotify', 'steam', 'stickies', 'table', 'tablet',
    'toggles', 'tools', 'translate', 'twitch', 'twitter', 'ubuntu',
    'usb', 'vector-pen', 'vinyl', 'volume-down', 'volume-mute', 'volume-off',
    'watch', 'webcam', 'whatsapp', 'wifi-off', 'windows', 'xbox',
    'youtube', 'bezier', 'broadcast', 'microsoft', 'nvidia', 'window-stack'
];

function openIconPicker() {
    const modal = document.getElementById('icon-picker-modal');
    const grid = document.getElementById('icon-grid');
    const search = document.getElementById('icon-search');
    
    // Populate icon grid
    function renderIcons(filter = '') {
        const filtered = filter ? popularIcons.filter(icon => icon.includes(filter.toLowerCase())) : popularIcons;
        grid.innerHTML = filtered.map(icon => `
            <div class="icon-option" data-icon="${icon}" style="cursor: pointer; padding: 15px; border: 2px solid var(--border); border-radius: 8px; text-align: center; transition: all 0.2s; background: var(--surface);">
                <i class="bi bi-${icon}" style="font-size: 2rem; color: var(--primary);"></i>
                <div style="font-size: 0.7rem; margin-top: 5px; color: var(--text); opacity: 0.8;">${icon}</div>
            </div>
        `).join('');
        
        // Add click handlers
        document.querySelectorAll('.icon-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const icon = opt.getAttribute('data-icon');
                document.getElementById('action-icon').value = icon;
                updateIconPreview();
                modal.classList.remove('active');
            });
            opt.addEventListener('mouseenter', (e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.transform = 'scale(1.1)';
            });
            opt.addEventListener('mouseleave', (e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'scale(1)';
            });
        });
    }
    
    renderIcons();
    search.value = '';
    search.addEventListener('input', (e) => renderIcons(e.target.value));
    modal.classList.add('active');
}

// Save action
async function saveAction() {
    const name = document.getElementById('action-name').value.trim();
    const icon = document.getElementById('action-icon').value.trim();
    const type = document.getElementById('action-type').value;
    
    if (!name || !icon) {
        showToast('Name and icon are required', 'error');
        return;
    }
    
    const action = { 
        name, 
        icon, 
        type,
        enabled: true  // Always enable new actions
    };
    
    if (type === 'keyboard') {
        const mainKey = document.getElementById('key-input').value.trim().toLowerCase();
        if (!mainKey) {
            showToast('Key is required', 'error');
            return;
        }
        
        const modifiers = [];
        document.querySelectorAll('#keyboard-config input[type="checkbox"]:checked').forEach(cb => {
            modifiers.push(cb.value);
        });
        
        const keyParts = [...modifiers, mainKey];
        // Save as array for consistency with config format
        action.keys = [mainKey, ...modifiers];
    } else {
        const command = document.getElementById('command-input').value.trim();
        if (!command) {
            showToast('Command is required', 'error');
            return;
        }
        action.command = command;
    }
    
    try {
        console.log('Saving action:', action, 'Edit index:', currentEditIndex);
        if (currentEditIndex !== null) {
            const result = await window.electronAPI.updateAction(currentEditIndex, action);
            console.log('Update result:', result);
            config = await window.electronAPI.getConfig();
            showToast('Action updated!');
        } else {
            const result = await window.electronAPI.addAction(action);
            console.log('Add result:', result);
            config = await window.electronAPI.getConfig();
            showToast('Action added!');
        }
        
        renderActionsList();
        closeActionModal();
    } catch (error) {
        console.error('Save action error:', error);
        showToast(error.message || 'Failed to save action', 'error');
    }
}

// Edit action
function editAction(index) {
    console.log('Editing action at index:', index);
    currentEditIndex = index;
    openActionModal(config.actions[index]);
}

// Delete action
function deleteAction(index) {
    if (!confirm('Delete this action?')) return;
    
    (async () => {
        try {
            console.log('Deleting action at index:', index);
            const result = await window.electronAPI.deleteAction(index);
            console.log('Delete result:', result);
            // Reload config from main process to ensure sync
            config = await window.electronAPI.getConfig();
            renderActionsList();
            showToast('Action deleted!');
        } catch (error) {
            console.error('Delete action error:', error);
            showToast(error.message || 'Failed to delete action', 'error');
        }
    })();
}

// Test action
function testAction(index) {
    (async () => {
        try {
            console.log('Testing action at index:', index);
            await window.electronAPI.testAction(index);
            showToast('Action executed!');
        } catch (error) {
            console.error('Test action error:', error);
            showToast('Failed to execute action', 'error');
        }
    })();
}

// Test current action in modal
async function testCurrentAction() {
    const type = document.getElementById('action-type').value;
    
    const tempAction = {
        name: 'Test',
        icon: 'test',
        type
    };
    
    if (type === 'keyboard') {
        const mainKey = document.getElementById('key-input').value.trim().toLowerCase();
        if (!mainKey) {
            showToast('Enter key to test', 'error');
            return;
        }
        
        const modifiers = [];
        document.querySelectorAll('#keyboard-config input[type="checkbox"]:checked').forEach(cb => {
            modifiers.push(cb.value);
        });
        
        tempAction.keys = [...modifiers, mainKey].join('+');
    } else {
        tempAction.command = document.getElementById('command-input').value.trim();
        if (!tempAction.command) {
            showToast('Enter command to test', 'error');
            return;
        }
    }
    
    try {
        console.log('Testing action:', tempAction);
        window.electronAPI.executeAction(tempAction);
        showToast('Test action executed!');
    } catch (error) {
        console.error('Test action error:', error);
        showToast('Failed to execute test action', 'error');
    }
}

// Save appearance settings
async function saveAppearanceSettings() {
    console.log('Saving appearance settings...');
    
    const themeName = typeof config.theme === 'string' ? config.theme : 'dark';
    const themeColors = {
        bgColor: document.getElementById('bgColorText').value,
        accentColor: document.getElementById('accentColorText').value,
        iconColor: document.getElementById('iconColorText').value,
        hoverIconColor: document.getElementById('hoverIconColorText').value
    };
    
    const newConfig = {
        ...config,
        theme: themeName,
        themes: {
            ...config.themes,
            [themeName]: themeColors
        },
        ringSize: parseInt(document.getElementById('ringSize').value),
        animationSpeed: parseInt(document.getElementById('animationSpeed').value)
    };
    
    console.log('New config:', newConfig);
    
    try {
        const result = await window.electronAPI.saveConfig(newConfig);
        console.log('Save config result:', result);
        config = newConfig;
        showToast('Appearance saved!');
    } catch (error) {
        console.error('Save appearance error:', error);
        showToast('Failed to save settings', 'error');
    }
}

// Save hotkey settings
async function saveHotkeySettings() {
    const carouselHotkey = document.getElementById('carouselHotkey').value.trim();
    const settingsHotkey = document.getElementById('settingsHotkey').value.trim();
    
    console.log('Saving hotkeys:', carouselHotkey, settingsHotkey);
    
    if (!carouselHotkey || !settingsHotkey) {
        showToast('Both hotkeys are required', 'error');
        return;
    }
    
    // Validate hotkey format - no double ++ or invalid formats
    const validateHotkey = (hotkey) => {
        // Check for double ++
        if (hotkey.includes('++')) {
            return 'Invalid hotkey format (double ++).';
        }
        // Must have at least one + separator
        if (!hotkey.includes('+')) {
            return 'Hotkey must include modifier (e.g., CommandOrControl+Key)';
        }
        // Check for empty parts
        const parts = hotkey.split('+');
        if (parts.some(part => !part.trim())) {
            return 'Invalid hotkey format (empty parts)';
        }
        return null;
    };
    
    const carouselError = validateHotkey(carouselHotkey);
    if (carouselError) {
        showToast(`Carousel hotkey error: ${carouselError}`, 'error');
        return;
    }
    
    const settingsError = validateHotkey(settingsHotkey);
    if (settingsError) {
        showToast(`Settings hotkey error: ${settingsError}`, 'error');
        return;
    }
    
    if (carouselHotkey === settingsHotkey) {
        showToast('Hotkeys must be different', 'error');
        return;
    }
    
    const newConfig = {
        ...config,
        hotkey: carouselHotkey,
        settingsHotkey: settingsHotkey
    };
    
    try {
        const result = await window.electronAPI.saveConfig(newConfig);
        console.log('Save hotkeys result:', result);
        config = newConfig;
        showToast('Hotkeys saved! Restart to apply changes.');
    } catch (error) {
        console.error('Save hotkeys error:', error);
        showToast('Failed to save hotkeys', 'error');
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Reset actions to defaults (6 default actions)
async function resetActionsToDefaults() {
    if (!confirm('Reset to 6 default actions? This will remove all custom actions.')) return;
    
    const defaultActions = [
        {
            name: "Spotify",
            icon: "spotify",
            type: "exec",
            command: "start spotify:",
            enabled: true
        },
        {
            name: "Copy",
            icon: "clipboard",
            type: "keyboard",
            keys: ["c", "control"],
            enabled: true
        },
        {
            name: "Paste",
            icon: "clipboard-check",
            type: "keyboard",
            keys: ["v", "control"],
            enabled: true
        },
        {
            name: "Screenshot",
            icon: "crop",
            type: "exec",
            command: "explorer ms-screenclip:",
            enabled: true
        },
        {
            name: "Settings",
            icon: "gear",
            type: "exec",
            command: "start ms-settings:",
            enabled: true
        },
        {
            name: "Last Window",
            icon: "window-stack",
            type: "keyboard",
            keys: ["tab", "alt"],
            enabled: true
        }
    ];
    
    const newConfig = {
        ...config,
        actions: defaultActions
    };
    
    try {
        console.log('Resetting actions to defaults');
        await window.electronAPI.saveConfig(newConfig);
        // Reload config from main process to ensure sync
        config = await window.electronAPI.getConfig();
        console.log('Config reloaded after reset:', config);
        console.log('Config actions count:', config.actions ? config.actions.length : 0);
        
        // Re-render immediately - no setTimeout needed
        renderActionsList();
        console.log('Actions list re-rendered after reset');
        
        // Show toast AFTER rendering completes
        showToast('Actions reset to defaults!');
    } catch (error) {
        console.error('Reset actions error:', error);
        showToast('Failed to reset actions', 'error');
    }
}

// Reset appearance to defaults (colors, sizes)
async function resetAppearanceToDefaults() {
    if (!confirm('Reset appearance settings to defaults? This keeps your actions.')) return;
    
    const newConfig = {
        ...config,
        theme: 'dark',
        ringSize: 300,
        animationSpeed: 200,
        themes: {
            ...config.themes,
            dark: {
                bgColor: 'rgba(25, 25, 25, 0.9)',
                accentColor: '#9333ea',
                iconColor: '#9333ea',
                hoverIconColor: '#ffffff'
            }
        }
    };
    
    try {
        console.log('Resetting appearance to defaults');
        await window.electronAPI.saveConfig(newConfig);
        config = await window.electronAPI.getConfig();
        populateUI();
        showToast('Appearance reset to defaults!');
    } catch (error) {
        console.error('Reset appearance error:', error);
        showToast('Failed to reset appearance', 'error');
    }
}

// Reset hotkeys to defaults
async function resetHotkeys() {
    if (!confirm('Reset hotkeys to defaults (Ctrl+; and Shift+Alt+Space)?')) return;
    
    const newConfig = {
        ...config,
        hotkey: 'CommandOrControl+Alt+Space',
        settingsHotkey: 'Shift+Alt+Space'
    };
    
    try {
        console.log('Resetting hotkeys to defaults');
        await window.electronAPI.saveConfig(newConfig);
        config = await window.electronAPI.getConfig();
        populateUI();
        showToast('Hotkeys reset! Restart to apply changes.');
    } catch (error) {
        console.error('Reset hotkeys error:', error);
        showToast('Failed to reset hotkeys', 'error');
    }
}

// Color conversion utilities
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function rgbaToHex(rgba) {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}
