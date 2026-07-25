// Svelte action: traps Tab/Shift+Tab focus cycling within a modal container.
// Use on the outermost overlay element: `<div use:trapFocus role="dialog" ...>`.
// Pairs with `autofocus` on the modal's primary button (see Button.svelte) —
// that establishes the initial focus; this action just keeps Tab from
// escaping to the hidden HUD behind the overlay.
export function trapFocus(node) {
    function focusableElements() {
        return Array.from(
            node.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
        );
    }

    function onKeydown(e) {
        if (e.key !== 'Tab') return;
        const items = focusableElements();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    node.addEventListener('keydown', onKeydown);
    return {
        destroy() {
            node.removeEventListener('keydown', onKeydown);
        },
    };
}
