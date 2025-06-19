/**
 * Presets Management
 * Handles saving and loading rule presets
 */

class PresetManager {
    constructor() {
        this.presets = {
            'NBA Rules': {
                scoring: {
                    threePointValue: 3,
                    twoPointValue: 2,
                    freeThrowValue: 1
                },
                time: {
                    quarterLength: 12,
                    shotClock: 24
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
            },
            'FIBA Rules': {
                scoring: {
                    threePointValue: 3,
                    twoPointValue: 2,
                    freeThrowValue: 1
                },
                time: {
                    quarterLength: 10,
                    shotClock: 24
                },
                team: {
                    playersPerTeam: 5,
                    foulOutLimit: 5
                },
                advanced: {
                    bonusRule: true,
                    threeSecondRule: true,
                    bonusPossession: false
                }
            },
            'NCAA Rules': {
                scoring: {
                    threePointValue: 3,
                    twoPointValue: 2,
                    freeThrowValue: 1
                },
                time: {
                    quarterLength: 20, // Two 20-minute halves
                    shotClock: 30
                },
                team: {
                    playersPerTeam: 5,
                    foulOutLimit: 5
                },
                advanced: {
                    bonusRule: true,
                    threeSecondRule: true,
                    bonusPossession: false
                }
            },
            'Experimental Rules': {
                scoring: {
                    threePointValue: 4,
                    twoPointValue: 2,
                    freeThrowValue: 1
                },
                time: {
                    quarterLength: 8,
                    shotClock: 18
                },
                team: {
                    playersPerTeam: 4,
                    foulOutLimit: 4
                },
                advanced: {
                    bonusRule: false,
                    threeSecondRule: false,
                    bonusPossession: true
                }
            }
        };
        
        // Try to load any saved presets from localStorage
        this.loadSavedPresets();
    }

    loadSavedPresets() {
        try {
            const savedPresets = localStorage.getItem('basketballSimulatorPresets');
            if (savedPresets) {
                const parsedPresets = JSON.parse(savedPresets);
                // Merge with default presets, with saved presets taking precedence
                this.presets = { ...this.presets, ...parsedPresets };
            }
        } catch (error) {
            console.error('Error loading saved presets:', error);
        }
    }

    savePresets() {
        try {
            localStorage.setItem('basketballSimulatorPresets', JSON.stringify(this.presets));
        } catch (error) {
            console.error('Error saving presets:', error);
        }
    }

    getPreset(presetName) {
        return this.presets[presetName];
    }

    getAllPresets() {
        return Object.keys(this.presets).map(name => ({
            name,
            rules: this.presets[name]
        }));
    }

    savePreset(name, rules) {
        this.presets[name] = JSON.parse(JSON.stringify(rules)); // Deep copy
        this.savePresets();
    }

    deletePreset(name) {
        // Don't allow deleting default presets
        const defaultPresets = ['NBA Rules', 'FIBA Rules', 'NCAA Rules', 'Experimental Rules'];
        if (defaultPresets.includes(name)) {
            console.error(`Cannot delete default preset: ${name}`);
            return false;
        }
        
        if (this.presets[name]) {
            delete this.presets[name];
            this.savePresets();
            return true;
        }
        return false;
    }
}

// Export the class for use in other modules
window.PresetManager = PresetManager;