let config = null;

// Initialize the carousel
async function init() {
    try {
        // Get configuration
        config = await window.electronAPI.getConfig();
        
        // Apply theme
        applyTheme(config.theme);
        
        // Apply custom CSS variables
        document.documentElement.style.setProperty('--ring-size', `${config.ringSize}px`);
        document.documentElement.style.setProperty('--animation-speed', `${config.animationSpeed}ms`);
        
        // Render actions
        renderActions();
        
        // Listen for config updates
        window.electronAPI.onConfigUpdate((newConfig) => {
            config = newConfig;
            applyTheme(config.theme);
            renderActions();
        });
        
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Apply theme colors
function applyTheme(themeName) {
    const theme = config.themes[themeName] || config.themes.dark;
    
    document.documentElement.style.setProperty('--bg-color', theme.bgColor);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    document.documentElement.style.setProperty('--icon-color', theme.iconColor);
    document.documentElement.style.setProperty('--hover-icon-color', theme.hoverIconColor);
}

// Render action sectors
function renderActions() {
    const container = document.getElementById('actions-container');
    container.innerHTML = '';
    
    const enabledActions = config.actions.filter(action => action.enabled);
    const totalActions = enabledActions.length;
    
    if (totalActions === 0) {
        console.warn('No enabled actions found');
        return;
    }
    
    // Dynamic ring size based on action count
    // More actions = larger ring for better spacing
    const baseSize = 280;
    const sizePerAction = 25;
    const dynamicSize = Math.max(baseSize, baseSize + (totalActions - 6) * sizePerAction);
    document.documentElement.style.setProperty('--ring-size', `${dynamicSize}px`);
    
    // Calculate sector angle for even distribution
    const angleStep = 360 / totalActions;
    const halfAngle = angleStep / 2;
    
    console.log(`Rendering ${totalActions} actions with ${angleStep}° per sector`);
    
    enabledActions.forEach((action, index) => {
        const sector = document.createElement('div');
        sector.className = 'ring-sector';
        sector.dataset.actionIndex = index;
        
        if (!action.enabled) {
            sector.classList.add('disabled');
        }
        
        // Calculate rotation angle for this sector
        const sectorAngle = index * angleStep;
        
        // Dynamic clip-path based on sector angle
        // Creates a pie slice from center outward
        const clipAngle1 = 90 - halfAngle; // Start angle
        const clipAngle2 = 90 + halfAngle; // End angle
        
        // Calculate clip-path points for proper pie slice
        const x1 = 50 + 50 * Math.cos((clipAngle1 - 90) * Math.PI / 180);
        const y1 = 50 + 50 * Math.sin((clipAngle1 - 90) * Math.PI / 180);
        const x2 = 50 + 50 * Math.cos((clipAngle2 - 90) * Math.PI / 180);
        const y2 = 50 + 50 * Math.sin((clipAngle2 - 90) * Math.PI / 180);
        
        sector.style.clipPath = `polygon(50% 50%, ${x1}% ${y1}%, ${x2}% ${y2}%)`;
        sector.style.transform = `rotate(${sectorAngle}deg)`;
        
        // Create icon - fix icon class to include bi prefix
        const icon = document.createElement('i');
        const iconClass = action.icon.startsWith('bi-') ? action.icon : `bi-${action.icon}`;
        icon.className = `bi ${iconClass} icon`;
        
        // Set initial rotation to keep icon upright
        const baseRotation = -1 * sectorAngle;
        icon.style.transform = `rotate(${baseRotation}deg)`;
        icon.style.transition = 'all 0.5s ease';
        
        // Create tooltip
        const tooltip = document.createElement('span');
        tooltip.className = 'action-tooltip';
        tooltip.textContent = action.name;
        
        sector.appendChild(icon);
        sector.appendChild(tooltip);
        
        // Add click handler - execute the actual action object, not by ID
        sector.addEventListener('click', () => {
            if (action.enabled) {
                window.electronAPI.executeAction(action);
            }
        });
        
        // Add hover animation - scale AND spin 360 degrees
        sector.addEventListener('mouseenter', () => {
            if (action.enabled) {
                // Get current rotation angle based on sector position
                const baseRotation = -1 * sectorAngle;
                icon.style.transform = `rotate(${baseRotation + 360}deg) scale(1.3)`;
                icon.style.color = 'var(--hover-icon-color)';
            }
        });
        
        sector.addEventListener('mouseleave', () => {
            // Reset to base rotation
            const baseRotation = -1 * sectorAngle;
            icon.style.transform = `rotate(${baseRotation}deg) scale(1)`;
            icon.style.color = 'var(--icon-color)';
        });
        
        container.appendChild(sector);
    });
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Press 'C' to open config
    if (e.key === 'c' || e.key === 'C') {
        window.electronAPI.openConfig();
    }
    
    // Press ESC to close
    if (e.key === 'Escape') {
        window.close();
    }
});

// Pointer lock for better cursor control
window.addEventListener('mouseenter', () => {
    document.body.requestPointerLock();
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
