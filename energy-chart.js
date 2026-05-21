/*
=============================================================================
REACTION LAB - POTENTIAL ENERGY CHART RENDERER
Canvas-based graphic component that draws thermodynamics graphs and tracks
the simulation coordinate timeline in real-time.
=============================================================================
*/

class EnergyChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.progress = 0; // 0 to 1
        this.reaction = null;
        
        // Handle DPI high-res screens
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setReaction(reaction) {
        this.reaction = reaction;
        this.draw();
    }

    setProgress(progress) {
        this.progress = Math.min(Math.max(progress, 0), 1);
        this.draw();
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height || 140;
        
        // Match high-DPI displays
        const dpi = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpi;
        this.canvas.height = this.height * dpi;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.scale(dpi, dpi);
        
        this.draw();
    }

    // Solve for Bezier curve Y at a given X coordinate
    // using simplified binary search or de Casteljau's algorithm
    getBezierPoint(p0, p1, p2, p3, t) {
        const cx = 3 * (p1.x - p0.x);
        const bx = 3 * (p2.x - p1.x) - cx;
        const ax = p3.x - p0.x - cx - bx;

        const cy = 3 * (p1.y - p0.y);
        const by = 3 * (p2.y - p1.y) - cy;
        const ay = p3.y - p0.y - cy - by;

        const xt = ((ax * t + bx) * t + cx) * t + p0.x;
        const yt = ((ay * t + by) * t + cy) * t + p0.y;

        return { x: xt, y: yt };
    }

    // Binary search to find t parameter of Bezier curve for a target X
    getBezierYforX(p0, p1, p2, p3, targetX) {
        let tMin = 0;
        let tMax = 1;
        let t = 0.5;
        let point = this.getBezierPoint(p0, p1, p2, p3, t);
        const iterations = 15;

        for (let i = 0; i < iterations; i++) {
            if (point.x < targetX) {
                tMin = t;
            } else {
                tMax = t;
            }
            t = (tMin + tMax) / 2;
            point = this.getBezierPoint(p0, p1, p2, p3, t);
        }
        return point.y;
    }

    draw() {
        if (!this.ctx || !this.reaction) return;
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        
        ctx.clearRect(0, 0, w, h);
        
        const paddingLeft = 40;
        const paddingRight = 30;
        const paddingTop = 25;
        const paddingBottom = 25;
        
        const chartW = w - paddingLeft - paddingRight;
        const chartH = h - paddingTop - paddingBottom;

        // Draw Axes (Subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // Y Axis
        ctx.moveTo(paddingLeft, paddingTop - 10);
        ctx.lineTo(paddingLeft, h - paddingBottom);
        // X Axis
        ctx.lineTo(w - paddingRight + 10, h - paddingBottom);
        ctx.stroke();

        // Draw Axis Labels
        ctx.fillStyle = '#64748b';
        ctx.font = '600 8px "Outfit"';
        ctx.textBaseline = 'middle';
        
        // Potential Energy label (rotated)
        ctx.save();
        ctx.translate(14, h / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('POTENTIAL ENERGY', 0, 0);
        ctx.restore();

        // Reaction Progress label
        ctx.textAlign = 'center';
        ctx.fillText('REACTION COORDINATE', paddingLeft + chartW / 2, h - 8);

        // Map reaction curve coordinates to screen
        const pts = this.reaction.energyCurve;
        if (pts.length < 5) return;
        
        // Function to map relative reaction coords [0-100, 0-150] to screen pixels
        // relative scale: x goes 0 to 100, y goes 150 to 0 (where 0 is bottom, 150 is top)
        const mapX = (rx) => paddingLeft + (rx / 100) * chartW;
        const mapY = (ry) => paddingTop + (ry / 150) * chartH;

        // Control points
        const p0 = { x: mapX(pts[0].x), y: mapY(pts[0].y) };
        const p1 = { x: mapX(pts[1].x), y: mapY(pts[1].y) };
        const p2 = { x: mapX(pts[3].x), y: mapY(pts[3].y) }; // index 3 is control point 2
        const p3 = { x: mapX(pts[4].x), y: mapY(pts[4].y) };
        
        // Bezier handles
        // Reactants flat segment
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(mapX(0), p0.y);
        ctx.lineTo(p0.x, p0.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Main curve path (Gradient)
        const grad = ctx.createLinearGradient(paddingLeft, 0, w - paddingRight, 0);
        grad.addColorStop(0, '#6366f1'); // Indigo
        grad.addColorStop(0.5, '#f59e0b'); // Amber (Transition)
        grad.addColorStop(1, '#14b8a6'); // Teal
        
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.15)';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        // Draw the energetic Bezier path
        // Cubic bezier: control point 1 is pts[2] (Transition Peak x, but reactant y) or simple interpolation
        const cp1 = { x: mapX(pts[2].x - 10), y: mapY(pts[2].y) }; // Shift slightly left for curve shape
        const cp2 = { x: mapX(pts[2].x + 10), y: mapY(pts[2].y) }; // Shift right
        
        ctx.bezierCurveTo(cp1.x, p0.y, cp1.x, cp1.y, mapX(pts[2].x), cp1.y);
        ctx.bezierCurveTo(cp2.x, cp1.y, cp2.x, p3.y, p3.x, p3.y);
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // Products flat segment
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(mapX(100), p3.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Text indicators
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 9px "Outfit"';
        ctx.textAlign = 'left';
        ctx.fillText('Reactants', p0.x - 20, p0.y - 12);
        ctx.textAlign = 'right';
        ctx.fillText('Products', p3.x + 20, p3.y - 12);

        // Transition Peak label
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 8px "Outfit"';
        ctx.textAlign = 'center';
        ctx.fillText('TS', mapX(pts[2].x), mapY(pts[2].y) - 10);

        // Thermodynamic Measurements lines (Ea and Enthalpy Envelopes)
        const peakY = mapY(pts[2].y);
        const rectY = p0.y;
        const prodY = p3.y;
        const peakX = mapX(pts[2].x);

        // 1. Activation Energy (Ea)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(p0.x, rectY);
        ctx.lineTo(peakX, rectY);
        ctx.moveTo(peakX, rectY);
        ctx.lineTo(peakX, peakY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ea Arrowheads and Label
        ctx.fillStyle = '#f59e0b';
        ctx.font = '600 8px "Outfit"';
        ctx.textAlign = 'left';
        ctx.fillText(`Ea = +${Math.abs(this.reaction.activationEnergy)} kJ`, peakX + 6, (rectY + peakY) / 2);

        // 2. Enthalpy (dH)
        ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(p3.x, prodY);
        ctx.lineTo(p0.x - 10, prodY);
        ctx.moveTo(p0.x - 10, rectY);
        ctx.lineTo(p0.x - 10, prodY);
        ctx.stroke();
        ctx.setLineDash([]);

        // dH Arrowheads and Label
        ctx.fillStyle = '#14b8a6';
        ctx.font = '600 8px "Outfit"';
        ctx.textAlign = 'left';
        ctx.fillText(`ΔH = ${this.reaction.deltaH} kJ/mol`, p0.x - 5, (rectY + prodY) / 2);

        // Calculate current indicator position on the Bezier Curve
        // Map current progress [0-1] to timeline coords [0-100]
        const currentRx = 30 + this.progress * 40; // Sim curve stretches between rx=30 and rx=70
        let currentX = mapX(currentRx);
        let currentY = p0.y;

        if (currentRx < p0.x) {
            currentX = mapX(pts[0].x + this.progress * pts[1].x);
            currentY = p0.y;
        } else if (currentX >= p0.x && currentX <= p3.x) {
            // Bezier segment calculation
            currentY = this.getBezierYforX(p0, cp1, cp2, p3, currentX);
        } else {
            currentX = mapX(pts[4].x);
            currentY = p3.y;
        }

        // Keep current coordinates inside padding
        currentX = Math.min(Math.max(currentX, p0.x), p3.x);
        currentY = Math.min(Math.max(currentY, Math.min(peakY, p3.y)), Math.max(p0.y, p3.y));

        // Draw Tracking Cursor Indicator (Glowing Orb)
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.circle = (cx, cy, r) => { ctx.arc(cx, cy, r, 0, Math.PI * 2); };
        ctx.circle(currentX, currentY, 6);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI*2);
        ctx.stroke();
        
        ctx.shadowBlur = 0; // Reset
    }
}
