import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

// Tell Font Awesome to skip adding the CSS automatically 
// since it's already included in globals.css
config.autoAddCss = false;

// Configure FontAwesome for better performance
config.showMissingIcons = false;
config.keepOriginalSource = false;
config.observeMutations = false;

// Enable CSS pseudo-elements for better rendering
config.cssPrefix = 'fa';
config.replacementClass = 'svg-inline--fa';
config.familyPrefix = 'fa';

// Optimize for React
config.autoReplaceSvg = 'nest';
