/**
 * ============================================================================
 * EditMee PDF Editor
 * File: utils.js
 * ----------------------------------------------------------------------------
 * Shared utility functions used throughout the application.
 * ============================================================================
 */

"use strict";

/* ============================================================================
 * DOM Helpers
 * ========================================================================== */

/**
 * Select a single element.
 * @param {string} selector
 * @param {ParentNode} parent
 * @returns {Element|null}
 */
export const $ = (selector, parent = document) =>
    parent.querySelector(selector);

/**
 * Select multiple elements.
 * @param {string} selector
 * @param {ParentNode} parent
 * @returns {Element[]}
 */
export const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

/* ============================================================================
 * Element Creation
 * ========================================================================== */

/**
 * Create a DOM element.
 * @param {string} tag
 * @param {Object} options
 * @returns {HTMLElement}
 */
export function createElement(tag, options = {}) {

    const element = document.createElement(tag);

    if (options.className)
        element.className = options.className;

    if (options.id)
        element.id = options.id;

    if (options.text)
        element.textContent = options.text;

    if (options.html)
        element.innerHTML = options.html;

    if (options.attributes) {

        Object.entries(options.attributes).forEach(([key, value]) => {

            element.setAttribute(key, value);

        });

    }

    return element;

}

/* ============================================================================
 * Visibility
 * ========================================================================== */

export function show(element) {

    if (!element) return;

    element.hidden = false;

}

export function hide(element) {

    if (!element) return;

    element.hidden = true;

}

export function toggle(element) {

    if (!element) return;

    element.hidden = !element.hidden;

}

/* ============================================================================
 * Class Helpers
 * ========================================================================== */

export function addClass(element, className) {

    element?.classList.add(className);

}

export function removeClass(element, className) {

    element?.classList.remove(className);

}

export function toggleClass(element, className) {

    element?.classList.toggle(className);

}

/* ============================================================================
 * Events
 * ========================================================================== */

export function on(element, event, callback, options = {}) {

    if (!element) return;

    element.addEventListener(event, callback, options);

}

export function off(element, event, callback) {

    if (!element) return;

    element.removeEventListener(event, callback);

}

/* ============================================================================
 * Debounce
 * ========================================================================== */

export function debounce(callback, delay = 300) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

}

/* ============================================================================
 * Throttle
 * ========================================================================== */

export function throttle(callback, delay = 100) {

    let waiting = false;

    return (...args) => {

        if (waiting) return;

        callback(...args);

        waiting = true;

        setTimeout(() => {

            waiting = false;

        }, delay);

    };

}

/* ============================================================================
 * UUID
 * ========================================================================== */

export function uuid() {

    return crypto.randomUUID();

}

/* ============================================================================
 * Deep Clone
 * ========================================================================== */

export function clone(data) {

    return structuredClone(data);

}

/* ============================================================================
 * File Helpers
 * ========================================================================== */

export function formatBytes(bytes) {

    if (bytes === 0) return "0 Bytes";

    const k = 1024;

    const sizes = [

        "Bytes",
        "KB",
        "MB",
        "GB"

    ];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;

}

export function isPDF(file) {

    return file?.type === "application/pdf";

}

/* ============================================================================
 * Download
 * ========================================================================== */

export function download(blob, filename) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

}

/* ============================================================================
 * Delay
 * ========================================================================== */

export function sleep(ms) {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

}

/* ============================================================================
 * Logger
 * ========================================================================== */

export const logger = {

    log(...args) {

        console.log("[EditMee]", ...args);

    },

    warn(...args) {

        console.warn("[EditMee]", ...args);

    },

    error(...args) {

        console.error("[EditMee]", ...args);

    }

};