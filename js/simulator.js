/**
 * Game Mechanics Simulator
 * Simulates basketball games with customizable rules
 */

class BasketballSimulator {
    constructor() {
        this.rules = {
            scoring: {
                threePointValue: 3,
                twoPointValue: 2,
                freeThrowValue: 1
            },
            time: {
                quarterLength: 12, // minutes
                shotClock: 24 // seconds
            },
            team: {
                playersPerTeam: 5,
                foulOutLimit: 6
            },
            advanced: {
                bonusRule: true,
                threeSecondRule: true,
                bonusPossession: false
            }
        };
        
        this.teams = {
            A: this.createTeam("Team A"),
            B: this.createTeam("Team B")
        };
        
        this.gameState = {
            time: 0, // seconds elapsed
            quarter: 1,
            possession: null, // team with the ball
            score: { A: 0, B: 0 },
            fouls: { A: 0, B: 0 },
            shotClock: this.rules.time.shotClock,
            gameEvents: []
        };
        
        this.simulationSpeed = 1; // real-time to sim-time ratio
        this.simulationInterval = null;
        this.visualizer = null;
        this.isRunning = false;
    }

    createTeam(name) {
        const skillLevels = ['low', 'medium', 'high'];
        const players = [];
        
        for (let i = 0; i < this.rules.team.playersPerTeam; i++) {
            players.push({
                id: i,
                position: this.getPositionForIndex(i),
                shooting: this.randomSkill(skillLevels),
                defense: this.randomSkill(skillLevels),
                ballHandling: this.randomSkill(skillLevels),
                rebounding: this.randomSkill(skillLevels),
                speed: this.randomSkill(skillLevels),
                fatigue: 0,
                fouls: 0,
                points: 0,
                rebounds: 0,
                assists: 0,
                steals: 0,
                blocks: 0,
                turnovers: 0
            });
        }
        
        return {
            name,
            players,
            stats: {
                fgAttempts: 0,
                fgMade: 0,
                threeAttempts: 0,
                threeMade: 0,
                ftAttempts: 0,
                ftMade: 0,
                rebounds: 0,
                offRebounds: 0,
                defRebounds: 0,
                assists: 0,
                steals: 0,
                blocks: 0,
                turnovers: 0,
                fouls: 0,
                fastBreaks: 0
            }
        };
    }

    getPositionForIndex(index) {
        const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
        return positions[index % positions.length];
    }

    randomSkill(levels) {
        return levels[Math.floor(Math.random() * levels.length)];
    }

    updateRules(newRules) {
        // Update rules and reset the game
        this.rules = {
            ...this.rules,
            ...newRules
        };
        
        // Reset game state with new rules
        this.resetGame();
    }

    resetGame() {
        // Reset teams
        this.teams = {
            A: this.createTeam("Team A"),
            B: this.createTeam("Team B")
        };
        
        // Reset game state
        this.gameState = {
            time: 0,
            quarter: 1,
            possession: Math.random() < 0.5 ? 'A' : 'B', // random first possession
            score: { A: 0, B: 0 },
            fouls: { A: 0, B: 0 },
            shotClock: this.rules.time.shotClock,
            gameEvents: []
        };
        
        // Reset visualization if connected
        if (this.visualizer) {
            this.visualizer.resetAnimation();
        }
        
        this.isRunning = false;
    }

    setVisualizer(visualizer) {
        this.visualizer = visualizer;
    }

    startSimulation() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        const simStepMs = 50; // milliseconds between simulation steps
        
        this.simulationInterval = setInterval(() => {
            this.simulationStep();
            
            // Check if game is over
            if (this.isGameOver()) {
                this.endSimulation();
            }
        }, simStepMs);
    }

    pauseSimulation() {
        clearInterval(this.simulationInterval);
        this.isRunning = false;
    }

    endSimulation() {
        clearInterval(this.simulationInterval);
        this.isRunning = false;
        this.generateGameSummary();
    }

    simulationStep() {
        // Advance time
        const timeStep = 1 * this.simulationSpeed; // seconds per step
        this.gameState.time += timeStep;
        this.gameState.shotClock -= timeStep;
        
        // Check for end of quarter
        const quarterLengthSecs = this.rules.time.quarterLength * 60;
        if (this.gameState.time >= quarterLengthSecs) {
            this.endQuarter();
        }
        
        // Process possessions and actions
        if (this.gameState.shotClock <= 0) {
            this.shotClockViolation();
        } else {
            this.simulatePossession();
        }
        
        // Update visualization
        if (this.visualizer) {
            // Add events for visualizer to process
        }
    }

    endQuarter() {
        this.gameState.quarter++;
        if (this.gameState.quarter > 4) {
            // Game is over
            this.isRunning = false;
            return;
        }
        
        // Reset for new quarter
        this.gameState.time = 0;
        this.gameState.shotClock = this.rules.time.shotClock;
        
        // Log quarter end event
        this.logGameEvent('quarterEnd', {
            quarter: this.gameState.quarter - 1,
            scoreA: this.gameState.score.A,
            scoreB: this.gameState.score.B
        });
    }

    shotClockViolation() {
        // Handle shot clock violation
        this.logGameEvent('shotClockViolation', {
            team: this.gameState.possession
        });
        
        // Change possession
        this.changePossession();
    }

    simulatePossession() {
        // Simple probability-based possession simulation
        const possessionTeam = this.gameState.possession;
        const defenseTeam = possessionTeam === 'A' ? 'B' : 'A';
        
        // Determine action probability based on time and score
        const remainingTime = this.rules.time.shotClock - this.gameState.shotClock;
        let actionProb;
        
        if (remainingTime < 5) {
            // Late in shot clock - more likely to shoot
            actionProb = Math.random();
            if (actionProb < 0.8) {
                this.attemptShot(possessionTeam);
            } else if (actionProb < 0.95) {
                this.simulatePass(possessionTeam);
            } else {
                this.simulateTurnover(possessionTeam, defenseTeam);
            }
        } else if (remainingTime < 15) {
            // Mid shot clock - mixed actions
            actionProb = Math.random();
            if (actionProb < 0.4) {
                this.attemptShot(possessionTeam);
            } else if (actionProb < 0.8) {
                this.simulatePass(possessionTeam);
            } else if (actionProb < 0.9) {
                this.simulateTurnover(possessionTeam, defenseTeam);
            } else {
                // No action this step (dribbling/setting up)
            }
        } else {
            // Early in shot clock - more passing and setup
            actionProb = Math.random();
            if (actionProb < 0.2) {
                this.attemptShot(possessionTeam);
            } else if (actionProb < 0.7) {
                this.simulatePass(possessionTeam);
            } else if (actionProb < 0.8) {
                this.simulateTurnover(possessionTeam, defenseTeam);
            } else {
                // No action this step (dribbling/setting up)
            }
        }
    }

    attemptShot(team) {
        const shotType = Math.random() < 0.35 ? 'three' : 'two';
        const shootingPlayer = this.getRandomPlayer(team);
        const defenseTeam = team === 'A' ? 'B' : 'A';
        const defenderPlayer = this.getRandomPlayer(defenseTeam);
        
        // Calculate shot success probability
        let successProb = 0;
        if (shotType === 'three') {
            // Base three-point percentage with player skill factor
            successProb = 0.35; // League average around 35%
            if (shootingPlayer.shooting === 'high') successProb += 0.1;
            if (shootingPlayer.shooting === 'low') successProb -= 0.1;
            
            // Defense impact
            if (defenderPlayer.defense === 'high') successProb -= 0.07;
            if (defenderPlayer.defense === 'low') successProb += 0.05;
            
            this.teams[team].stats.threeAttempts++;
        } else {
            // Base two-point percentage with player skill factor
            successProb = 0.47; // League average around 47%
            if (shootingPlayer.shooting === 'high') successProb += 0.08;
            if (shootingPlayer.shooting === 'low') successProb -= 0.08;
            
            // Defense impact
            if (defenderPlayer.defense === 'high') successProb -= 0.1;
            if (defenderPlayer.defense === 'low') successProb += 0.07;
        }
        
        // Account for fatigue
        successProb -= (shootingPlayer.fatigue / 100) * 0.15;
        
        // Ensure probability is within reasonable bounds
        successProb = Math.max(0.1, Math.min(0.95, successProb));
        
        // Determine shot outcome
        const shotSuccess = Math.random() < successProb;
        const shotPoints = shotType === 'three' ? this.rules.scoring.threePointValue : this.rules.scoring.twoPointValue;
        
        // Update stats
        this.teams[team].stats.fgAttempts++;
        if (shotSuccess) {
            this.gameState.score[team] += shotPoints;
            this.teams[team].stats.fgMade++;
            if (shotType === 'three') this.teams[team].stats.threeMade++;
            shootingPlayer.points += shotPoints;
            
            // Log successful shot event
            this.logGameEvent('madeShot', {
                team: team,
                player: shootingPlayer.id,
                shotType: shotType,
                points: shotPoints,
                shotClock: this.gameState.shotClock
            });
            
            // Change possession after made shot
            this.changePossession();
        } else {
            // Log missed shot event
            this.logGameEvent('missedShot', {
                team: team,
                player: shootingPlayer.id,
                shotType: shotType,
                shotClock: this.gameState.shotClock
            });
            
            // Rebound opportunity
            this.simulateRebound(team, defenseTeam);
        }
    }

    simulateRebound(offensiveTeam, defensiveTeam) {
        // Determine offensive vs. defensive rebound
        // Generally, defense gets around 70% of rebounds
        let defReboundProb = 0.7;
        
        // Adjust based on team rebounding skill
        const offPlayer = this.getRandomPlayer(offensiveTeam);
        const defPlayer = this.getRandomPlayer(defensiveTeam);
        
        if (offPlayer.rebounding === 'high') defReboundProb -= 0.1;
        if (offPlayer.rebounding === 'low') defReboundProb += 0.1;
        if (defPlayer.rebounding === 'high') defReboundProb += 0.1;
        if (defPlayer.rebounding === 'low') defReboundProb -= 0.1;
        
        // Defensive rebound
        if (Math.random() < defReboundProb) {
            this.teams[defensiveTeam].stats.rebounds++;
            this.teams[defensiveTeam].stats.defRebounds++;
            defPlayer.rebounds++;
            
            this.logGameEvent('rebound', {
                team: defensiveTeam,
                player: defPlayer.id,
                reboundType: 'defensive'
            });
            
            // Change possession
            this.gameState.possession = defensiveTeam;
            this.gameState.shotClock = this.rules.time.shotClock;
        } 
        // Offensive rebound
        else {
            this.teams[offensiveTeam].stats.rebounds++;
            this.teams[offensiveTeam].stats.offRebounds++;
            offPlayer.rebounds++;
            
            this.logGameEvent('rebound', {
                team: offensiveTeam,
                player: offPlayer.id,
                reboundType: 'offensive'
            });
            
            // Keep possession, reset shot clock if bonus possession rule
            if (this.rules.advanced.bonusPossession) {
                this.gameState.shotClock = this.rules.time.shotClock;
            } else {
                // Reset to 14 seconds (common rule)
                this.gameState.shotClock = Math.min(14, this.rules.time.shotClock);
            }
        }
    }

    simulatePass(team) {
        const passingPlayer = this.getRandomPlayer(team);
        const receivingPlayer = this.getRandomPlayerExcept(team, passingPlayer.id);
        
        this.logGameEvent('pass', {
            team: team,
            fromPlayer: passingPlayer.id,
            toPlayer: receivingPlayer.id
        });
        
        // Simple pass - no immediate outcome
    }

    simulateTurnover(offensiveTeam, defensiveTeam) {
        const offPlayer = this.getRandomPlayer(offensiveTeam);
        const defPlayer = this.getRandomPlayer(defensiveTeam);
        
        // Determine if it's a steal or other turnover
        const isSteal = Math.random() < 0.6;
        
        if (isSteal) {
            this.teams[defensiveTeam].stats.steals++;
            defPlayer.steals++;
            
            this.logGameEvent('steal', {
                offensiveTeam: offensiveTeam,
                defensiveTeam: defensiveTeam,
                offensivePlayer: offPlayer.id,
                defensivePlayer: defPlayer.id
            });
        } else {
            this.logGameEvent('turnover', {
                team: offensiveTeam,
                player: offPlayer.id,
                turnoverType: 'error' // could be 'error', 'travel', 'doubledribble', etc.
            });
        }
        
        this.teams[offensiveTeam].stats.turnovers++;
        offPlayer.turnovers++;
        
        // Change possession
        this.changePossession();
        
        // Check for fast break opportunity
        if (Math.random() < 0.3) {
            this.simulateFastBreak(defensiveTeam);
        }
    }

    simulateFastBreak(team) {
        const fastBreakPlayer = this.getRandomPlayer(team);
        
        this.teams[team].stats.fastBreaks++;
        
        this.logGameEvent('fastBreak', {
            team: team,
            player: fastBreakPlayer.id
        });
        
        // Fast breaks have higher shot success rate
        let successProb = 0.65; // Higher than normal
        if (fastBreakPlayer.shooting === 'high') successProb += 0.1;
        if (fastBreakPlayer.shooting === 'low') successProb -= 0.08;
        
        // Mostly two-pointers on fast breaks
        const shotType = Math.random() < 0.2 ? 'three' : 'two';
        const shotPoints = shotType === 'three' ? this.rules.scoring.threePointValue : this.rules.scoring.twoPointValue;
        
        // Determine outcome
        const shotSuccess = Math.random() < successProb;
        
        this.teams[team].stats.fgAttempts++;
        if (shotType === 'three') this.teams[team].stats.threeAttempts++;
        
        if (shotSuccess) {
            this.gameState.score[team] += shotPoints;
            this.teams[team].stats.fgMade++;
            if (shotType === 'three') this.teams[team].stats.threeMade++;
            fastBreakPlayer.points += shotPoints;
            
            this.logGameEvent('fastBreakScore', {
                team: team,
                player: fastBreakPlayer.id,
                points: shotPoints
            });
            
            // Change possession after made shot
            this.changePossession();
        } else {
            this.logGameEvent('fastBreakMiss', {
                team: team,
                player: fastBreakPlayer.id
            });
            
            // Rebound opportunity
            const opposingTeam = team === 'A' ? 'B' : 'A';
            this.simulateRebound(team, opposingTeam);
        }
    }

    changePossession() {
        this.gameState.possession = this.gameState.possession === 'A' ? 'B' : 'A';
        this.gameState.shotClock = this.rules.time.shotClock;
    }

    getRandomPlayer(team) {
        const players = this.teams[team].players;
        return players[Math.floor(Math.random() * players.length)];
    }

    getRandomPlayerExcept(team, playerId) {
        const players = this.teams[team].players.filter(p => p.id !== playerId);
        return players[Math.floor(Math.random() * players.length)];
    }

    logGameEvent(eventType, data) {
        this.gameState.gameEvents.push({
            time: this.gameState.time,
            quarter: this.gameState.quarter,
            shotClock: this.gameState.shotClock,
            eventType: eventType,
            data: data
        });
        
        // Also log to visualizer if connected
        if (this.visualizer) {
            this.visualizer.addEvent(eventType, data, {
                gameTime: this.gameState.time,
                quarter: this.gameState.quarter,
                shotClock: this.gameState.shotClock
            });
        }
    }

    isGameOver() {
        return this.gameState.quarter > 4;
    }

    generateGameSummary() {
        const summary = {
            finalScore: {
                A: this.gameState.score.A,
                B: this.gameState.score.B
            },
            stats: {
                A: this.teams.A.stats,
                B: this.teams.B.stats
            },
            shootingPercentages: {
                A: {
                    fg: this.teams.A.stats.fgAttempts > 0 ? this.teams.A.stats.fgMade / this.teams.A.stats.fgAttempts : 0,
                    three: this.teams.A.stats.threeAttempts > 0 ? this.teams.A.stats.threeMade / this.teams.A.stats.threeAttempts : 0,
                    ft: this.teams.A.stats.ftAttempts > 0 ? this.teams.A.stats.ftMade / this.teams.A.stats.ftAttempts : 0
                },
                B: {
                    fg: this.teams.B.stats.fgAttempts > 0 ? this.teams.B.stats.fgMade / this.teams.B.stats.fgAttempts : 0,
                    three: this.teams.B.stats.threeAttempts > 0 ? this.teams.B.stats.threeMade / this.teams.B.stats.threeAttempts : 0,
                    ft: this.teams.B.stats.ftAttempts > 0 ? this.teams.B.stats.ftMade / this.teams.B.stats.ftAttempts : 0
                }
            },
            ruleImpact: this.analyzeRuleImpact()
        };
        
        return summary;
    }

    analyzeRuleImpact() {
        // Analyze how rule changes impacted the game
        const impact = {
            pace: null,  // 'faster', 'slower', 'typical'
            scoring: null, // 'higher', 'lower', 'typical'
            length: null, // 'longer', 'shorter', 'typical'
            fatigue: null, // 'higher', 'lower', 'typical'
            comeback: null // 'easier', 'harder', 'typical'
        };
        
        // Total points scored
        const totalPoints = this.gameState.score.A + this.gameState.score.B;
        const pointsPerMinute = totalPoints / (this.rules.time.quarterLength * 4);
        
        // Pace analysis based on possessions
        const totalPossessions = this.teams.A.stats.fgAttempts + this.teams.B.stats.fgAttempts;
        const possessionsPerMinute = totalPossessions / (this.rules.time.quarterLength * 4);
        
        if (possessionsPerMinute > 2.5) impact.pace = 'faster';
        else if (possessionsPerMinute < 1.8) impact.pace = 'slower';
        else impact.pace = 'typical';
        
        // Scoring impact
        if (pointsPerMinute > 5) impact.scoring = 'higher';
        else if (pointsPerMinute < 3) impact.scoring = 'lower';
        else impact.scoring = 'typical';
        
        // Game length (based on quarters and overtime)
        impact.length = 'typical'; // No overtime in our simulation
        
        // Fatigue analysis
        const avgFatigue = (this.teams.A.players.reduce((sum, p) => sum + p.fatigue, 0) + 
                          this.teams.B.players.reduce((sum, p) => sum + p.fatigue, 0)) / 
                          (this.teams.A.players.length + this.teams.B.players.length);
        
        if (avgFatigue > 70) impact.fatigue = 'higher';
        else if (avgFatigue < 40) impact.fatigue = 'lower';
        else impact.fatigue = 'typical';
        
        // Comeback potential
        // Simple heuristic: check if there were significant score changes
        impact.comeback = 'typical'; // Would need game flow analysis for better measurement
        
        return impact;
    }
}

// Export the class for use in other modules
window.BasketballSimulator = BasketballSimulator;