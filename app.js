/*
=============================================================================
REACTION LAB - CENTRAL APP CONTROLLER
Coordinates view switching, dynamic library listings, HUD updates,
playback sync, atom inspectors, and sandbox chambers.
=============================================================================
*/

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialise App Controllers
    let simulatorEngine = null;
    let sandboxEngine = null;
    let energyChart = null;
    let quizController = null;
    let isPlaybackLoopRunning = false;

    // View Switching
    const navItems = document.querySelectorAll('.nav-item');
    const tabViews = document.querySelectorAll('.tab-view');

    function switchTab(tabId) {
        navItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        tabViews.forEach(view => {
            if (view.id === `view-${tabId}`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Initialize engines depending on active tab
        if (tabId === 'simulator' && !simulatorEngine) {
            initSimulator();
        } else if (tabId === 'sandbox' && !sandboxEngine) {
            initSandbox();
        } else if (tabId === 'quiz' && !quizController) {
            quizController = new QuizController();
        }
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // 2. Initialize SIMULATOR
    function initSimulator() {
        simulatorEngine = new ChemistryEngine('chemistry-canvas');
        energyChart = new EnergyChart('energy-chart');
        
        // Add Inspector panel callback
        simulatorEngine.inspectorCallback = updateInspectorPanel;

        const reactionSelect = document.getElementById('reaction-select');
        reactionSelect.addEventListener('change', (e) => {
            loadSelectedReaction(e.target.value);
        });

        // Playback buttons
        const btnPlayPause = document.getElementById('btn-play-pause');
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');

        btnPlayPause.addEventListener('click', () => {
            simulatorEngine.isPlaying = !simulatorEngine.isPlaying;
            if (simulatorEngine.isPlaying) {
                playIcon.classList.add('hidden');
                pauseIcon.classList.remove('hidden');
                document.getElementById('simulation-state-text').innerText = "Reaction Progressing";
                if (!isPlaybackLoopRunning) {
                    runPlaybackLoop();
                }
            } else {
                playIcon.classList.remove('hidden');
                pauseIcon.classList.add('hidden');
                document.getElementById('simulation-state-text').innerText = "Paused";
            }
        });

        document.getElementById('btn-reset-reaction').addEventListener('click', () => {
            loadSelectedReaction(reactionSelect.value);
        });

        // Replay reaction
        document.getElementById('btn-replay').addEventListener('click', () => {
            loadSelectedReaction(reactionSelect.value);
            simulatorEngine.isPlaying = true;
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
            document.getElementById('simulation-state-text').innerText = "Reaction Progressing";
            if (!isPlaybackLoopRunning) {
                runPlaybackLoop();
            }
        });

        // Speed control
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            simulatorEngine.speed = val;
            document.getElementById('speed-val').innerText = `${val.toFixed(1)}x`;
        });

        // Step Navigation Buttons
        document.getElementById('btn-step-prev').addEventListener('click', () => {
            if (simulatorEngine.currentStep > 1) {
                navigatorStep(simulatorEngine.currentStep - 1);
            }
        });

        document.getElementById('btn-step-next').addEventListener('click', () => {
            if (simulatorEngine.activeReaction && simulatorEngine.currentStep < simulatorEngine.activeReaction.steps.length) {
                navigatorStep(simulatorEngine.currentStep + 1);
            }
        });

        // Action Trigger Button
        const btnTrigger = document.getElementById('btn-trigger-action');
        btnTrigger.addEventListener('click', () => {
            simulatorEngine.triggerActivation();
            document.getElementById('trigger-overlay').classList.add('hidden');
            // Advance UI step state
            navigatorStep(2);
        });

        // Environmental controls (Temperature & Concentration)
        const envTempSlider = document.getElementById('env-temp');
        if (envTempSlider) {
            envTempSlider.addEventListener('input', (e) => {
                const temp = parseInt(e.target.value);
                simulatorEngine.temperature = temp;
                document.getElementById('env-temp-val').innerText = `${temp}K`;
            });
        }

        const envConcentrationSelect = document.getElementById('env-concentration');
        if (envConcentrationSelect) {
            envConcentrationSelect.addEventListener('change', (e) => {
                const conc = parseInt(e.target.value);
                simulatorEngine.concentration = conc;
                loadSelectedReaction(reactionSelect.value);
            });
        }

        // Load Default Reaction
        loadSelectedReaction('water');
    }

    function loadSelectedReaction(reactionId) {
        simulatorEngine.loadReaction(reactionId);
        
        const reaction = ReactionsCatalog[reactionId];
        energyChart.setReaction(reaction);
        energyChart.setProgress(0);

        // Update UI
        document.getElementById('formula-display').innerHTML = reaction.equationHtml;
        document.getElementById('enthalpy-val').innerText = `ΔH = ${reaction.deltaH} kJ/mol (${reaction.enthalpy})`;
        document.getElementById('simulation-state-text').innerText = "Ready to React";
        
        // Reset playback play status
        simulatorEngine.isPlaying = false;
        document.getElementById('play-icon').classList.remove('hidden');
        document.getElementById('pause-icon').classList.add('hidden');

        // Render explainer dots and timeline markers
        buildExplainerDots(reaction);
        buildTimelineMarkers(reaction);
        updateTimelineUI(0);
        navigatorStep(1);
    }

    // Step navigator
    function navigatorStep(stepIndex) {
        simulatorEngine.setStep(stepIndex);
        
        const reaction = simulatorEngine.activeReaction;
        const stepData = reaction.steps[stepIndex - 1];

        // Update explainer text
        document.getElementById('step-badge').innerText = `Step ${stepIndex} of ${reaction.steps.length}`;
        document.getElementById('step-title').innerText = stepData.title;
        document.getElementById('step-desc').innerText = stepData.description;

        // Highlight active dot
        const dots = document.querySelectorAll('.step-dot');
        dots.forEach((dot, idx) => {
            if (idx === stepIndex - 1) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Highlight timeline markers
        const markers = document.querySelectorAll('.step-marker');
        markers.forEach((m, idx) => {
            if (idx < stepIndex) {
                m.classList.add('active');
            } else {
                m.classList.remove('active');
            }
        });

        // Update energy curve position and timeline progress fill
        const progress = (stepIndex - 1) / (reaction.steps.length - 1);
        energyChart.setProgress(progress);
        updateTimelineUI(progress);

        // Check if activation trigger is needed
        const triggerOverlay = document.getElementById('trigger-overlay');
        if (stepData.requiresTrigger) {
            triggerOverlay.classList.remove('hidden');
            document.getElementById('trigger-action-text').innerText = stepData.triggerText;
            document.getElementById('trigger-action-icon').innerText = stepData.triggerIcon;
        } else {
            triggerOverlay.classList.add('hidden');
        }
    }

    function buildExplainerDots(reaction) {
        const dotsContainer = document.getElementById('step-dots');
        dotsContainer.innerHTML = '';
        reaction.steps.forEach((step, idx) => {
            const dot = document.createElement('div');
            dot.className = `step-dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                navigatorStep(idx + 1);
            });
            dotsContainer.appendChild(dot);
        });
    }

    function buildTimelineMarkers(reaction) {
        const timelineTrack = document.getElementById('timeline-track');
        // Clear old markers
        const oldMarkers = timelineTrack.querySelectorAll('.step-marker');
        oldMarkers.forEach(m => m.remove());

        reaction.steps.forEach((step, idx) => {
            const pos = step.timelinePos;
            const marker = document.createElement('div');
            marker.className = `step-marker ${idx === 0 ? 'active' : ''}`;
            marker.style.left = `${pos}%`;
            marker.title = step.title;
            timelineTrack.appendChild(marker);
        });
    }

    function updateTimelineUI(progress) {
        const percentage = progress * 100;
        document.getElementById('timeline-fill').style.width = `${percentage}%`;
        document.getElementById('timeline-handle').style.left = `${percentage}%`;
    }

    // Interactive Timeline Scrubbing
    const timelineTrack = document.getElementById('timeline-track');
    timelineTrack.addEventListener('mousedown', (e) => {
        scrubTimeline(e);
        
        function onMouseMove(moveEvent) {
            scrubTimeline(moveEvent);
        }
        
        function onMouseUp() {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    function scrubTimeline(e) {
        const rect = timelineTrack.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let progress = offsetX / rect.width;
        progress = Math.min(Math.max(progress, 0), 1);
        
        updateTimelineUI(progress);
        energyChart.setProgress(progress);
        
        // Find closest step
        if (simulatorEngine.activeReaction) {
            const stepCount = simulatorEngine.activeReaction.steps.length;
            const closestStep = Math.round(progress * (stepCount - 1)) + 1;
            if (closestStep !== simulatorEngine.currentStep) {
                navigatorStep(closestStep);
            }
        }
    }

    // Playback loop
    function runPlaybackLoop() {
        if (!simulatorEngine || !simulatorEngine.isPlaying) {
            isPlaybackLoopRunning = false;
            return;
        }
        isPlaybackLoopRunning = true;

        // Auto progress steps
        const stepProgressInc = 0.003 * simulatorEngine.speed;
        simulatorEngine.playbackProgress += stepProgressInc;
        
        if (simulatorEngine.playbackProgress >= 1.0) {
            simulatorEngine.playbackProgress = 1.0;
            simulatorEngine.isPlaying = false;
            isPlaybackLoopRunning = false;
            document.getElementById('play-icon').classList.remove('hidden');
            document.getElementById('pause-icon').classList.add('hidden');
            document.getElementById('simulation-state-text').innerText = "Reaction Completed";
        }

        // Sync with energy chart and step explainer
        energyChart.setProgress(simulatorEngine.playbackProgress);
        updateTimelineUI(simulatorEngine.playbackProgress);

        const stepCount = simulatorEngine.activeReaction.steps.length;
        const currentProgressStep = Math.round(simulatorEngine.playbackProgress * (stepCount - 1)) + 1;
        
        if (currentProgressStep !== simulatorEngine.currentStep) {
            navigatorStep(currentProgressStep);
        }

        if (simulatorEngine.isPlaying) {
            requestAnimationFrame(runPlaybackLoop);
        } else {
            isPlaybackLoopRunning = false;
        }
    }

    // Update periodic inspect panel
    function updateInspectorPanel(atom) {
        const placeholder = document.getElementById('inspector-placeholder');
        const details = document.getElementById('inspector-details');

        if (!atom) {
            placeholder.classList.remove('hidden');
            details.classList.add('hidden');
            return;
        }

        placeholder.classList.add('hidden');
        details.classList.remove('hidden');

        const elem = ElementsData[atom.element];
        document.getElementById('inspect-symbol').innerText = elem.symbol;
        document.getElementById('inspect-symbol').style.borderColor = elem.color;
        document.getElementById('inspect-name').innerText = elem.name;
        document.getElementById('inspect-number').innerText = elem.atomicNumber;
        document.getElementById('inspect-negativity').innerText = elem.electronegativity;
        document.getElementById('inspect-valence').innerText = `${atom.valence} / ${atom.valenceMax}`;

        // Determine current state text
        let stateText = "Neutral gaseous atom";
        if (atom.charge === 1) stateText = "Dissociated Cation (+1)";
        else if (atom.charge === -1) stateText = "Dissociated Anion (-1)";
        else if (atom.charge === 2) stateText = "Dissociated Metal Cation (+2)";
        else if (atom.state === "lattice") stateText = "Crystalline solid lattice";
        else if (atom.state === "precipitate") stateText = "Solid precipitate settling";

        document.getElementById('inspect-state').innerText = stateText;

        // Custom role texts based on reactions
        let role = "Reactant Particle";
        if (atom.bonds.length > 0) role = "Bonded Compound Component";
        document.getElementById('inspect-role').innerText = role;
    }

    // 3. Populate Reference Catalog (Library Cards)
    const libraryContainer = document.getElementById('library-cards-container');
    if (libraryContainer) {
        libraryContainer.innerHTML = '';
        Object.keys(ReactionsCatalog).forEach(key => {
            const rx = ReactionsCatalog[key];
            const card = document.createElement('div');
            card.className = 'glass-card library-card';
            card.innerHTML = `
                <h3>${rx.title}</h3>
                <div class="library-equation">${rx.equationHtml}</div>
                <p class="library-description">${rx.description}</p>
                <div class="library-stats">
                    <div class="stat-box">
                        <span class="lbl">Enthalpy (ΔH)</span>
                        <span class="val" style="color: #14b8a6">${rx.deltaH} kJ/mol</span>
                    </div>
                    <div class="stat-box">
                        <span class="lbl">Activation (Ea)</span>
                        <span class="val" style="color: #f59e0b">+${rx.activationEnergy} kJ</span>
                    </div>
                </div>
                <button class="btn btn-glow btn-full" style="margin-top: 20px" data-load="${rx.id}">
                    Load into Simulator
                </button>
            `;
            
            // Add load listener
            card.querySelector('[data-load]').addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-load');
                document.getElementById('reaction-select').value = id;
                switchTab('simulator');
                loadSelectedReaction(id);
            });

            libraryContainer.appendChild(card);
        });
    }

    // 4. Initialize MOLECULAR SANDBOX
    function initSandbox() {
        sandboxEngine = new ChemistryEngine('sandbox-canvas', true);
        
        // Spawn elements buttons
        const spawnBtns = document.querySelectorAll('.spawn-btn');
        spawnBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const element = btn.getAttribute('data-element');
                const atom = sandboxEngine.spawnAtom(element);
                sandboxEngine.spawnSpark(atom.x, atom.y, atom.color, 8);
                updateSandboxHUD();
            });
        });

        // Sandbox temperature slider
        const tempSlider = document.getElementById('sandbox-temp');
        tempSlider.addEventListener('input', (e) => {
            const temp = parseInt(e.target.value);
            sandboxEngine.temperature = temp;
            document.getElementById('sandbox-temp-val').innerText = `${temp} K`;
        });

        // Auto-bonding switch
        const autoBondSwitch = document.getElementById('sandbox-auto-bond');
        autoBondSwitch.addEventListener('change', (e) => {
            sandboxEngine.autoBonding = e.target.checked;
        });

        // Export button
        const exportBtn = document.getElementById('btn-export-sandbox');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const serializedAtoms = sandboxEngine.atoms.map(a => ({
                    id: a.id,
                    element: a.element,
                    x: parseFloat(a.x.toFixed(2)),
                    y: parseFloat(a.y.toFixed(2)),
                    charge: a.charge,
                    state: a.state
                }));

                const serializedBonds = sandboxEngine.bonds.map(b => ({
                    atom1Id: b.atom1.id,
                    atom2Id: b.atom2.id,
                    type: b.type
                }));

                const formulaText = getFormulaFromAtoms(sandboxEngine.atoms)
                    .replace(/<sub>/g, '')
                    .replace(/<\/sub>/g, '');

                const exportData = {
                    format: "ReactionLab-Sandbox",
                    timestamp: new Date().toISOString(),
                    formula: formulaText,
                    atoms: serializedAtoms,
                    bonds: serializedBonds
                };

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 4));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `sandbox_molecule_${formulaText.toLowerCase() || 'empty'}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
            });
        }

        // Import button and file listener
        const importBtn = document.getElementById('btn-import-sandbox');
        const importFile = document.getElementById('sandbox-import-file');
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => {
                importFile.click();
            });

            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const data = JSON.parse(evt.target.result);
                        if (data.format !== "ReactionLab-Sandbox" || !Array.isArray(data.atoms)) {
                            alert("Invalid file format. Please import a valid Reaction Lab Sandbox JSON file.");
                            return;
                        }

                        // Clear Sandbox chamber
                        sandboxEngine.clear();

                        // Recreate atoms
                        const atomMap = {};
                        data.atoms.forEach(atomData => {
                            const atom = sandboxEngine.spawnAtom(atomData.element, atomData.x, atomData.y);
                            if (atom) {
                                atom.charge = atomData.charge || 0;
                                atom.state = atomData.state || "gas";
                                atomMap[atomData.id] = atom;
                            }
                        });

                        // Recreate bonds
                        if (Array.isArray(data.bonds)) {
                            data.bonds.forEach(bondData => {
                                const a1 = atomMap[bondData.atom1Id];
                                const a2 = atomMap[bondData.atom2Id];
                                if (a1 && a2) {
                                    sandboxEngine.createCovalentBond(a1, a2, bondData.type);
                                }
                            });
                        }

                        // Play a welcome spark array
                        sandboxEngine.spawnSpark(sandboxEngine.width / 2, sandboxEngine.height / 2, "#10b981", 30);
                        updateSandboxHUD();

                    } catch (err) {
                        alert("Error parsing JSON file: " + err.message);
                    }
                };
                reader.readAsText(file);
                // Reset file input
                importFile.value = '';
            });
        }

        // Clear button
        document.getElementById('btn-clear-sandbox').addEventListener('click', () => {
            sandboxEngine.clear();
            updateSandboxHUD();
        });

        // Periodic HUD count checks
        setInterval(updateSandboxHUD, 800);
    }

    function updateSandboxHUD() {
        if (!sandboxEngine) return;
        const atoms = sandboxEngine.atoms.length;
        const bonds = sandboxEngine.bonds.length;
        document.getElementById('sandbox-molecule-count').innerText = `Atoms: ${atoms} | Bonds: ${bonds}`;
        
        // Update chemical formula HUD
        const formulaLbl = document.getElementById('sandbox-formula-lbl');
        if (formulaLbl) {
            formulaLbl.innerHTML = getFormulaFromAtoms(sandboxEngine.atoms);
        }
    }

    function getFormulaFromAtoms(atoms) {
        if (!atoms || atoms.length === 0) return "-";
        
        const counts = {};
        atoms.forEach(atom => {
            counts[atom.element] = (counts[atom.element] || 0) + 1;
        });

        const elements = Object.keys(counts);
        
        // Hill System sort (C first, then H, then others alphabetically)
        elements.sort((a, b) => {
            if (a === "C" && b !== "C") return -1;
            if (b === "C" && a !== "C") return 1;
            if (a === "H" && b !== "H") return -1;
            if (b === "H" && a !== "H") return 1;
            return a.localeCompare(b);
        });

        return elements.map(el => {
            const count = counts[el];
            return count > 1 ? `${el}<sub>${count}</sub>` : el;
        }).join("");
    }

    // Auto load default tab
    switchTab('simulator');
});
