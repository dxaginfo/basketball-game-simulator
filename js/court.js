/**
 * Court Visualization Module
 * Responsible for drawing the basketball court and visualizing the simulation
 */

class CourtVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.players = [];
        this.ball = null;
        this.courtWidth = this.container.clientWidth;
        this.courtHeight = this.container.clientHeight;
        this.initialized = false;
        this.events = [];
        this.animationSpeed = 5; // Default speed (1-10)
    }

    initialize() {
        if (this.initialized) return;

        // Create SVG element
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");
        this.svg.setAttribute("viewBox", `0 0 ${this.courtWidth} ${this.courtHeight}`);
        this.container.appendChild(this.svg);

        // Draw court elements
        this.drawCourt();
        this.initialized = true;
    }

    drawCourt() {
        // Main court outline
        this.drawRect(0, 0, this.courtWidth, this.courtHeight, "court-line");

        // Center circle
        const centerX = this.courtWidth / 2;
        const centerY = this.courtHeight / 2;
        const centerRadius = Math.min(this.courtWidth, this.courtHeight) * 0.1;
        this.drawCircle(centerX, centerY, centerRadius, "court-circle");

        // Center line
        this.drawLine(0, centerY, this.courtWidth, centerY, "court-line");

        // Draw both baskets
        this.drawBasket(0, true); // Left basket
        this.drawBasket(this.courtWidth, false); // Right basket

        // Three point lines
        const threePointRadius = Math.min(this.courtWidth, this.courtHeight) * 0.35;
        
        // Left three point arc
        const leftBasketX = this.courtWidth * 0.05;
        this.drawArc(leftBasketX, centerY, threePointRadius, Math.PI * 0.5, Math.PI * 1.5, "court-line");
        
        // Right three point arc
        const rightBasketX = this.courtWidth * 0.95;
        this.drawArc(rightBasketX, centerY, threePointRadius, Math.PI * 1.5, Math.PI * 2.5, "court-line");
        
        // Three point straight lines
        const distFromSideline = this.courtHeight * 0.1;
        // Left side
        this.drawLine(leftBasketX - threePointRadius, distFromSideline, leftBasketX - threePointRadius, this.courtHeight - distFromSideline, "court-line");
        // Right side
        this.drawLine(rightBasketX + threePointRadius, distFromSideline, rightBasketX + threePointRadius, this.courtHeight - distFromSideline, "court-line");
    }

    drawBasket(x, isLeft) {
        const centerY = this.courtHeight / 2;
        const keyWidth = this.courtHeight * 0.4;
        const keyHeight = this.courtWidth * 0.15;
        const basketRadius = Math.min(this.courtWidth, this.courtHeight) * 0.02;

        // Position adjustment based on which side
        const xPos = isLeft ? x : x - keyHeight;
        
        // Free throw lane (key)
        this.drawRect(
            xPos,
            centerY - keyWidth / 2,
            keyHeight,
            keyWidth,
            "court-key"
        );
        
        // Free throw circle
        const ftX = isLeft ? xPos + keyHeight : xPos;
        this.drawCircle(ftX, centerY, keyWidth * 0.25, "court-circle");
        
        // Basket
        const basketX = isLeft ? x + this.courtWidth * 0.02 : x - this.courtWidth * 0.02;
        this.drawCircle(basketX, centerY, basketRadius, "court-circle", "#e11d48");
    }

    // SVG Helper Methods
    drawRect(x, y, width, height, className, fillColor = "none") {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);
        rect.setAttribute("class", className);
        if (fillColor !== "none") rect.setAttribute("fill", fillColor);
        this.svg.appendChild(rect);
        return rect;
    }

    drawCircle(cx, cy, r, className, fillColor = "none") {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", r);
        circle.setAttribute("class", className);
        if (fillColor !== "none") circle.setAttribute("fill", fillColor);
        this.svg.appendChild(circle);
        return circle;
    }

    drawLine(x1, y1, x2, y2, className) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("class", className);
        this.svg.appendChild(line);
        return line;
    }

    drawArc(cx, cy, r, startAngle, endAngle, className) {
        const startX = cx + r * Math.cos(startAngle);
        const startY = cy + r * Math.sin(startAngle);
        const endX = cx + r * Math.cos(endAngle);
        const endY = cy + r * Math.sin(endAngle);
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", `M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`);
        path.setAttribute("class", className);
        this.svg.appendChild(path);
        return path;
    }

    // Player and Ball Methods
    createPlayers(teamACount, teamBCount) {
        // Clear existing players
        this.players = [];
        
        // Team positions (adjust these for better positioning)
        const teamAStartX = this.courtWidth * 0.25;
        const teamBStartX = this.courtWidth * 0.75;
        const centerY = this.courtHeight / 2;
        const spacing = this.courtHeight * 0.15;
        
        // Create Team A players
        for (let i = 0; i < teamACount; i++) {
            const offsetY = (i - (teamACount - 1) / 2) * spacing;
            const player = this.drawCircle(
                teamAStartX, 
                centerY + offsetY, 
                10, 
                "player player-transition", 
                "#ef4444"
            );
            player.setAttribute("data-team", "A");
            player.setAttribute("data-player", i);
            this.players.push(player);
        }
        
        // Create Team B players
        for (let i = 0; i < teamBCount; i++) {
            const offsetY = (i - (teamBCount - 1) / 2) * spacing;
            const player = this.drawCircle(
                teamBStartX, 
                centerY + offsetY, 
                10, 
                "player player-transition", 
                "#3b82f6"
            );
            player.setAttribute("data-team", "B");
            player.setAttribute("data-player", i);
            this.players.push(player);
        }
        
        // Create ball
        this.ball = this.drawCircle(
            centerX, 
            centerY, 
            6, 
            "ball", 
            "#f59e0b"
        );
    }

    // Animation methods will go here
    updateCourtSize() {
        this.courtWidth = this.container.clientWidth;
        this.courtHeight = this.container.clientHeight;
        
        if (this.svg) {
            this.svg.setAttribute("viewBox", `0 0 ${this.courtWidth} ${this.courtHeight}`);
            // Clear and redraw everything
            while (this.svg.firstChild) {
                this.svg.removeChild(this.svg.firstChild);
            }
            this.drawCourt();
            // Recreate players if needed
            if (this.players.length > 0) {
                const teamACount = this.players.filter(p => p.getAttribute("data-team") === "A").length;
                const teamBCount = this.players.filter(p => p.getAttribute("data-team") === "B").length;
                this.createPlayers(teamACount, teamBCount);
            }
        }
    }

    // Handle simulation events and animation
    addEvent(eventType, data, timestamp) {
        this.events.push({
            type: eventType,
            data: data,
            timestamp: timestamp
        });
    }

    setAnimationSpeed(speed) {
        // Speed range: 1 (slowest) to 10 (fastest)
        this.animationSpeed = Math.max(1, Math.min(10, speed));
    }

    playAnimation() {
        // Implementation will go here
        // This will play through the events in sequence
        console.log("Animation started with", this.events.length, "events");
    }

    pauseAnimation() {
        // Implementation will go here
    }

    resetAnimation() {
        // Clear events and reset court
        this.events = [];
        
        // Reset players and ball to starting positions
        if (this.players.length > 0) {
            const teamACount = this.players.filter(p => p.getAttribute("data-team") === "A").length;
            const teamBCount = this.players.filter(p => p.getAttribute("data-team") === "B").length;
            this.createPlayers(teamACount, teamBCount);
        }
    }
}

// Export the class for use in other modules
window.CourtVisualizer = CourtVisualizer;