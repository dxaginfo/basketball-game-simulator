/**
 * Main Application
 * Connects UI, simulator, and visualization components
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const simulator = new BasketballSimulator();
    const courtVisualizer = new CourtVisualizer('court-container');
    const presetManager = new PresetManager();
    
    // Connect components
    simulator.setVisualizer(courtVisualizer);
    courtVisualizer.initialize();
    
    // UI Elements
    const runSimulationBtn = document.getElementById('run-simulation');
    const pauseSimulationBtn = document.getElementById('pause-simulation');
    const resetSimulationBtn = document.getElementById('reset-simulation');
    const simulationSpeedSlider = document.getElementById('simulation-speed');
    const savePresetBtn = document.getElementById('save-preset');
    const loadPresetBtn = document.getElementById('load-preset');
    
    // Modal elements
    const presetsModal = document.getElementById('presets-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const presetsList = document.getElementById('presets-list');
    const savePresetForm = document.getElementById('save-preset-form');
    const confirmSavePresetBtn = document.getElementById('confirm-save-preset');
    const confirmLoadPresetBtn = document.getElementById('confirm-load-preset');
    const cancelPresetBtn = document.getElementById('cancel-preset');
    
    // Rule Input Elements
    const threePointValueInput = document.getElementById('three-point-value');
    const twoPointValueInput = document.getElementById('two-point-value');
    const freeThrowValueInput = document.getElementById('free-throw-value');
    const quarterLengthInput = document.getElementById('quarter-length');
    const shotClockInput = document.getElementById('shot-clock');
    const playersPerTeamInput = document.getElementById('players-per-team');
    const foulOutLimitInput = document.getElementById('foul-out-limit');
    const bonusRuleCheckbox = document.getElementById('bonus-rule');
    const threeSecondRuleCheckbox = document.getElementById('three-second-rule');
    const bonusPossessionCheckbox = document.getElementById('bonus-possession');
    
    // Stats Display Elements
    const finalScoreDisplay = document.getElementById('final-score');
    const fgPercentageDisplay = document.getElementById('fg-percentage');
    const threePtPercentageDisplay = document.getElementById('three-pt-percentage');
    const reboundsDisplay = document.getElementById('rebounds');
    const turnoversDisplay = document.getElementById('turnovers');
    const fastBreaksDisplay = document.getElementById('fast-breaks');
    
    // Impact Analysis Display Elements
    const paceImpactDisplay = document.getElementById('pace-impact');
    const scoringImpactDisplay = document.getElementById('scoring-impact');
    const lengthImpactDisplay = document.getElementById('length-impact');
    const fatigueImpactDisplay = document.getElementById('fatigue-impact');
    const comebackImpactDisplay = document.getElementById('comeback-impact');
    
    // Initialize with default values
    updateUIFromRules(simulator.rules);
    populatePresetsList();
    
    // Event Listeners
    runSimulationBtn.addEventListener('click', startSimulation);
    pauseSimulationBtn.addEventListener('click', pauseSimulation);
    resetSimulationBtn.addEventListener('click', resetSimulation);
    simulationSpeedSlider.addEventListener('input', updateSimulationSpeed);
    
    savePresetBtn.addEventListener('click', showSavePresetDialog);
    loadPresetBtn.addEventListener('click', showLoadPresetDialog);
    closeModalBtn.addEventListener('click', closeModal);
    confirmSavePresetBtn.addEventListener('click', savePreset);
    confirmLoadPresetBtn.addEventListener('click', loadSelectedPreset);
    cancelPresetBtn.addEventListener('click', closeModal);
    
    // Listen for window resize to adjust court
    window.addEventListener('resize', () => {
        courtVisualizer.updateCourtSize();
    });
    
    // Functions
    function updateRulesFromUI() {
        const rules = {
            scoring: {
                threePointValue: parseInt(threePointValueInput.value),
                twoPointValue: parseInt(twoPointValueInput.value),
                freeThrowValue: parseFloat(freeThrowValueInput.value)
            },
            time: {
                quarterLength: parseInt(quarterLengthInput.value),
                shotClock: parseInt(shotClockInput.value)
            },
            team: {
                playersPerTeam: parseInt(playersPerTeamInput.value),
                foulOutLimit: parseInt(foulOutLimitInput.value)
            },
            advanced: {
                bonusRule: bonusRuleCheckbox.checked,
                threeSecondRule: threeSecondRuleCheckbox.checked,
                bonusPossession: bonusPossessionCheckbox.checked
            }
        };
        
        return rules;
    }
    
    function updateUIFromRules(rules) {
        // Update UI elements based on rules
        threePointValueInput.value = rules.scoring.threePointValue;
        twoPointValueInput.value = rules.scoring.twoPointValue;
        freeThrowValueInput.value = rules.scoring.freeThrowValue;
        quarterLengthInput.value = rules.time.quarterLength;
        shotClockInput.value = rules.time.shotClock;
        playersPerTeamInput.value = rules.team.playersPerTeam;
        foulOutLimitInput.value = rules.team.foulOutLimit;
        bonusRuleCheckbox.checked = rules.advanced.bonusRule;
        threeSecondRuleCheckbox.checked = rules.advanced.threeSecondRule;
        bonusPossessionCheckbox.checked = rules.advanced.bonusPossession;
    }
    
    function startSimulation() {
        // Apply current UI rules to simulator
        const rules = updateRulesFromUI();
        simulator.updateRules(rules);
        
        // Initialize visualization
        courtVisualizer.createPlayers(rules.team.playersPerTeam, rules.team.playersPerTeam);
        
        // Start simulation
        simulator.startSimulation();
        
        // Update UI
        runSimulationBtn.disabled = true;
        pauseSimulationBtn.disabled = false;
        resetSimulationBtn.disabled = false;
    }
    
    function pauseSimulation() {
        simulator.pauseSimulation();
        pauseSimulationBtn.textContent = simulator.isRunning ? 'Pause' : 'Resume';
        
        if (!simulator.isRunning) {
            pauseSimulationBtn.textContent = 'Resume';
            simulator.pauseSimulation();
        } else {
            pauseSimulationBtn.textContent = 'Pause';
            simulator.startSimulation();
        }
    }
    
    function resetSimulation() {
        simulator.resetGame();
        courtVisualizer.resetAnimation();
        
        // Reset UI
        runSimulationBtn.disabled = false;
        pauseSimulationBtn.disabled = true;
        resetSimulationBtn.disabled = true;
        pauseSimulationBtn.textContent = 'Pause';
        
        // Clear stats displays
        finalScoreDisplay.textContent = 'Team A 0 - 0 Team B';
        fgPercentageDisplay.textContent = '0% - 0%';
        threePtPercentageDisplay.textContent = '0% - 0%';
        reboundsDisplay.textContent = '0 - 0';
        turnoversDisplay.textContent = '0 - 0';
        fastBreaksDisplay.textContent = '0 - 0';
        
        // Clear impact analysis
        paceImpactDisplay.textContent = '-';
        scoringImpactDisplay.textContent = '-';
        lengthImpactDisplay.textContent = '-';
        fatigueImpactDisplay.textContent = '-';
        comebackImpactDisplay.textContent = '-';
    }
    
    function updateSimulationSpeed() {
        const speed = parseInt(simulationSpeedSlider.value);
        simulator.simulationSpeed = speed;
        courtVisualizer.setAnimationSpeed(speed);
    }
    
    function updateStatsDisplay() {
        if (!simulator.isGameOver()) return;
        
        const summary = simulator.generateGameSummary();
        
        // Update scoreboard
        finalScoreDisplay.textContent = `Team A ${summary.finalScore.A} - ${summary.finalScore.B} Team B`;
        
        // Format percentages
        const fgPctA = Math.round(summary.shootingPercentages.A.fg * 100);
        const fgPctB = Math.round(summary.shootingPercentages.B.fg * 100);
        const threePctA = Math.round(summary.shootingPercentages.A.three * 100);
        const threePctB = Math.round(summary.shootingPercentages.B.three * 100);
        
        fgPercentageDisplay.textContent = `${fgPctA}% - ${fgPctB}%`;
        threePtPercentageDisplay.textContent = `${threePctA}% - ${threePctB}%`;
        reboundsDisplay.textContent = `${summary.stats.A.rebounds} - ${summary.stats.B.rebounds}`;
        turnoversDisplay.textContent = `${summary.stats.A.turnovers} - ${summary.stats.B.turnovers}`;
        fastBreaksDisplay.textContent = `${summary.stats.A.fastBreaks} - ${summary.stats.B.fastBreaks}`;
        
        // Update impact analysis
        paceImpactDisplay.textContent = summary.ruleImpact.pace;
        scoringImpactDisplay.textContent = summary.ruleImpact.scoring;
        lengthImpactDisplay.textContent = summary.ruleImpact.length;
        fatigueImpactDisplay.textContent = summary.ruleImpact.fatigue;
        comebackImpactDisplay.textContent = summary.ruleImpact.comeback;
    }
    
    // Set up periodic stats update
    setInterval(updateStatsDisplay, 1000);
    
    // Preset Management Functions
    function populatePresetsList() {
        presetsList.innerHTML = '';
        const presets = presetManager.getAllPresets();
        
        presets.forEach(preset => {
            const presetItem = document.createElement('div');
            presetItem.className = 'p-2 border rounded mb-2 hover:bg-gray-50 cursor-pointer';
            presetItem.dataset.presetName = preset.name;
            
            presetItem.innerHTML = `
                <div class="font-medium">${preset.name}</div>
                <div class="text-sm text-gray-500">${getPresetDescription(preset.rules)}</div>
            `;
            
            presetItem.addEventListener('click', () => {
                // Highlight selected preset
                document.querySelectorAll('#presets-list > div').forEach(item => {
                    item.classList.remove('bg-blue-50', 'border-blue-300');
                });
                presetItem.classList.add('bg-blue-50', 'border-blue-300');
            });
            
            presetsList.appendChild(presetItem);
        });
    }
    
    function getPresetDescription(rules) {
        return `${rules.time.quarterLength}m quarters, ${rules.time.shotClock}s shot clock, ${rules.scoring.threePointValue}pt 3's`;
    }
    
    function showSavePresetDialog() {
        presetsModal.classList.remove('hidden');
        presetsModal.classList.add('flex');
        savePresetForm.classList.remove('hidden');
        confirmSavePresetBtn.classList.remove('hidden');
        confirmLoadPresetBtn.classList.add('hidden');
    }
    
    function showLoadPresetDialog() {
        presetsModal.classList.remove('hidden');
        presetsModal.classList.add('flex');
        savePresetForm.classList.add('hidden');
        confirmSavePresetBtn.classList.add('hidden');
        confirmLoadPresetBtn.classList.remove('hidden');
    }
    
    function closeModal() {
        presetsModal.classList.add('hidden');
        presetsModal.classList.remove('flex');
    }
    
    function savePreset() {
        const presetName = document.getElementById('preset-name').value.trim();
        if (!presetName) {
            alert('Please enter a name for your preset');
            return;
        }
        
        const rules = updateRulesFromUI();
        presetManager.savePreset(presetName, rules);
        
        // Update the presets list
        populatePresetsList();
        
        // Close the modal
        document.getElementById('preset-name').value = '';
        closeModal();
    }
    
    function loadSelectedPreset() {
        const selectedPreset = document.querySelector('#presets-list > div.bg-blue-50');
        if (!selectedPreset) {
            alert('Please select a preset to load');
            return;
        }
        
        const presetName = selectedPreset.dataset.presetName;
        const rules = presetManager.getPreset(presetName);
        
        if (rules) {
            updateUIFromRules(rules);
            simulator.updateRules(rules);
            closeModal();
        }
    }
});