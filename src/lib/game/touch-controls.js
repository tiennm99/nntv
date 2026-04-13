// Touch/swipe gesture detection for mobile controls
// Converts swipe gestures into directional input (up/down/left/right)

const SWIPE_THRESHOLD = 30;

export class TouchControls {
    constructor() {
        this.startX = 0;
        this.startY = 0;
    }

    onTouchStart(e) {
        if (e.touches.length !== 1) return;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
    }

    // Returns direction string ('up','down','left','right') or null if not a valid swipe
    onTouchEnd(e) {
        const dx = e.changedTouches[0].clientX - this.startX;
        const dy = e.changedTouches[0].clientY - this.startY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (absDx < SWIPE_THRESHOLD && absDy < SWIPE_THRESHOLD) return null;

        // Prevent page scroll when a valid swipe is detected
        e.preventDefault();

        if (absDx > absDy) {
            return dx > 0 ? 'right' : 'left';
        }
        return dy > 0 ? 'down' : 'up';
    }
}
