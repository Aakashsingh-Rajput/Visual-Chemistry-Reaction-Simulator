/*
=============================================================================
REACTION LAB - MOLECULAR PHYSICS & ANIMATION ENGINE
Implements particle collision, thermal brownian kinetics, covalent spring bonds,
electrostatic ionic vectors, electron transfers, and localized phase overrides.
=============================================================================
*/

class ChemistryEngine {
    constructor(canvasId, isSandbox = false) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isSandbox = isSandbox;
        
        this.atoms = [];
        this.bonds = []; // Covalent connections: { atom1, atom2, type: 'single'|'double' }
        this.particles = []; // Visual effect sparks/electrons: { x, y, vx, vy, size, color, alpha, life }
        
        this.temperature = 300; // Kelvin
        this.concentration = 1; // 1: normal, 2: double
        this.autoBonding = true;
        this.activeReaction = null;
        this.currentStep = 1;
        this.playbackProgress = 0; // 0 to 1
        this.isPlaying = false;
        this.speed = 1.0;
        this.sparkWave = null; // { x, y, r, maxR, alpha }
        
        this.inspectorCallback = null;
        this.selectedAtom = null;
        
        this.setupEvents();
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Start animation loop
        this.lastTime = performance.now();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setupEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Check if clicked an atom
            let clickedAtom = null;
            for (let atom of this.atoms) {
                const dist = Math.hypot(atom.x - mouseX, atom.y - mouseY);
                if (dist <= atom.radius + 5) {
                    clickedAtom = atom;
                    break;
                }
            }

            if (clickedAtom) {
                this.selectedAtom = clickedAtom;
                if (this.inspectorCallback) {
                    this.inspectorCallback(clickedAtom);
                }
                
                if (this.isSandbox) {
                    this.draggedAtom = clickedAtom;
                }
            } else {
                this.selectedAtom = null;
                if (this.inspectorCallback) this.inspectorCallback(null);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isSandbox && this.draggedAtom) {
                const rect = this.canvas.getBoundingClientRect();
                this.draggedAtom.x = e.clientX - rect.left;
                this.draggedAtom.y = e.clientY - rect.top;
                this.draggedAtom.vx = 0;
                this.draggedAtom.vy = 0;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.draggedAtom = null;
        });
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height || 400;
        
        const dpi = window.devicePixelRatio || 1;
        this.canvas.width = this.width * dpi;
        this.canvas.height = this.height * dpi;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.scale(dpi, dpi);
    }

    clear() {
        this.atoms = [];
        this.bonds = [];
        this.particles = [];
        this.sparkWave = null;
        this.selectedAtom = null;
        if (this.inspectorCallback) this.inspectorCallback(null);
    }

    spawnAtom(elementSymbol, x, y) {
        const data = ElementsData[elementSymbol];
        if (!data) return null;
        
        // Initial setup
        const atom = {
            id: Math.random().toString(36).substr(2, 9),
            element: elementSymbol,
            name: data.name,
            x: x || Math.random() * (this.width - 60) + 30,
            y: y || Math.random() * (this.height - 80) + 40,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            radius: data.radius,
            color: data.color,
            electronegativity: data.electronegativity,
            valence: data.valence,
            valenceMax: data.valenceMax,
            charge: 0, // ionic charge
            chargeLabel: "", // visual indicator e.g. "2+"
            bonds: [], // indices or links
            state: "gas", // "gas", "lattice", "precipitate", "solvated"
            alpha: 1.0,
            angle: Math.random() * Math.PI * 2, // for valence orbitals rotation
            targetX: null,
            targetY: null,
            glow: false,
            isMetalic: false
        };

        this.atoms.push(atom);
        return atom;
    }

    createCovalentBond(atom1, atom2, type = 'single') {
        // Prevent duplicate bonds
        const exists = this.bonds.some(b => 
            (b.atom1.id === atom1.id && b.atom2.id === atom2.id) ||
            (b.atom1.id === atom2.id && b.atom2.id === atom1.id)
        );
        if (exists) return;

        const bond = { atom1, atom2, type };
        this.bonds.push(bond);
        
        if (!atom1.bonds.includes(atom2.id)) atom1.bonds.push(atom2.id);
        if (!atom2.bonds.includes(atom1.id)) atom2.bonds.push(atom1.id);
    }

    breakAllBonds() {
        this.bonds = [];
        this.atoms.forEach(a => a.bonds = []);
    }

    spawnSpark(x, y, color = '#ff8800', count = 12) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                color,
                alpha: 1.0,
                life: 1.0,
                decay: Math.random() * 0.04 + 0.02
            });
        }
    }

    // Dynamic Step Setup according to chemical reactions
    loadReaction(reactionId) {
        this.clear();
        this.activeReaction = ReactionsCatalog[reactionId];
        this.currentStep = 1;
        this.playbackProgress = 0;
        this.isPlaying = false;
        
        if (!this.activeReaction) return;
        
        this.initializeReactionState();
    }

    initializeReactionState() {
        const id = this.activeReaction.id;
        this.clear();

        if (id === "water") {
            this.temperature = 300;
            const count = this.concentration;
            for (let i = 0; i < count; i++) {
                const yOffset = i * 160;
                // Spawn 4 Hydrogen atoms (forming 2 H2 molecules) and 2 Oxygen atoms (forming 1 O2 molecule) per count unit
                const h1 = this.spawnAtom("H", this.width * 0.2, this.height * (0.2 + yOffset / 400));
                const h2 = this.spawnAtom("H", this.width * 0.25, this.height * (0.25 + yOffset / 400));
                this.createCovalentBond(h1, h2);

                const h3 = this.spawnAtom("H", this.width * 0.2, this.height * (0.55 + yOffset / 400));
                const h4 = this.spawnAtom("H", this.width * 0.25, this.height * (0.5 + yOffset / 400));
                this.createCovalentBond(h3, h4);

                const o1 = this.spawnAtom("O", this.width * 0.75, this.height * (0.35 + yOffset / 400));
                const o2 = this.spawnAtom("O", this.width * 0.8, this.height * (0.45 + yOffset / 400));
                this.createCovalentBond(o1, o2, 'double');
            }
            
            this.atoms.forEach(a => {
                a.vx = (Math.random() - 0.5) * 1.5;
                a.vy = (Math.random() - 0.5) * 1.5;
            });
        } 
        else if (id === "neutralization") {
            this.temperature = 300;
            const count = this.concentration;
            for (let i = 0; i < count; i++) {
                // HCl reactant molecule
                const h = this.spawnAtom("H", this.width * 0.25, this.height * (0.3 + i * 0.3));
                const cl = this.spawnAtom("Cl", this.width * 0.35, this.height * (0.3 + i * 0.3));
                h.subType = "hcl-H";
                this.createCovalentBond(h, cl);
                
                // NaOH reactant molecule / pair
                const na = this.spawnAtom("Na", this.width * 0.7, this.height * (0.6 - i * 0.2));
                const o = this.spawnAtom("O", this.width * 0.8, this.height * (0.5 - i * 0.2));
                const h_oh = this.spawnAtom("H", this.width * 0.85, this.height * (0.45 - i * 0.2));
                h_oh.subType = "naoh-H";
                this.createCovalentBond(o, h_oh);
                
                na.x = o.x - 35;
                na.y = o.y + 15;
                na.vx = cl.vx = na.vy = cl.vy = 0.5;
            }
        }
        else if (id === "redox") {
            this.temperature = 300;
            // Solid Zinc lattice at bottom
            const latticeSpacingX = 45;
            const startX = this.width / 2 - (2 * latticeSpacingX);
            const startY = this.height - 40;

            for (let i = 0; i < 5; i++) {
                const zn = this.spawnAtom("Zn", startX + i * latticeSpacingX, startY);
                zn.state = "lattice";
                zn.vx = zn.vy = 0;
            }

            // Spawn 2 * concentration HCl molecules floating above
            const hclCount = 2 * this.concentration;
            for (let i = 0; i < hclCount; i++) {
                const fraction = (i + 0.5) / hclCount;
                const h = this.spawnAtom("H", this.width * (fraction - 0.05), this.height * 0.3);
                const cl = this.spawnAtom("Cl", this.width * (fraction + 0.05), this.height * 0.4);
                this.createCovalentBond(h, cl);
            }
        }
        else if (id === "precipitation") {
            this.temperature = 300;
            const count = this.concentration;
            
            for (let i = 0; i < count; i++) {
                const ag = this.spawnAtom("Ag", this.width * (0.15 + i * 0.15), this.height * (0.35 + i * 0.1));
                const n = this.spawnAtom("N", this.width * (0.3 + i * 0.15), this.height * (0.3 + i * 0.05));
                const o1 = this.spawnAtom("O", n.x - 12, n.y - 12);
                const o2 = this.spawnAtom("O", n.x + 12, n.y - 12);
                const o3 = this.spawnAtom("O", n.x, n.y + 12);
                this.createCovalentBond(n, o1);
                this.createCovalentBond(n, o2);
                this.createCovalentBond(n, o3);

                const na = this.spawnAtom("Na", this.width * (0.7 - i * 0.15), this.height * (0.65 - i * 0.1));
                const cl = this.spawnAtom("Cl", this.width * (0.8 - i * 0.15), this.height * (0.6 - i * 0.1));
            }
            
            this.atoms.forEach(a => {
                a.vx = (Math.random() - 0.5) * 1.5;
                a.vy = (Math.random() - 0.5) * 1.5;
            });
        }
        else if (id === "combustion") {
            this.temperature = 300;
            const count = this.concentration;
            
            for (let i = 0; i < count; i++) {
                // CH4 molecules
                const c = this.spawnAtom("C", this.width * 0.3, this.height * (0.3 + i * 0.4));
                const h1 = this.spawnAtom("H", c.x - 30, c.y - 30);
                const h2 = this.spawnAtom("H", c.x + 30, c.y - 30);
                const h3 = this.spawnAtom("H", c.x - 30, c.y + 30);
                const h4 = this.spawnAtom("H", c.x + 30, c.y + 30);
                
                this.createCovalentBond(c, h1);
                this.createCovalentBond(c, h2);
                this.createCovalentBond(c, h3);
                this.createCovalentBond(c, h4);

                // Two O2 molecules per methane (so 2 * count O2 molecules total)
                const o1 = this.spawnAtom("O", this.width * 0.7, this.height * (0.25 + i * 0.4));
                const o2 = this.spawnAtom("O", o1.x + 20, o1.y + 16);
                this.createCovalentBond(o1, o2, 'double');

                const o3 = this.spawnAtom("O", this.width * 0.75, this.height * (0.45 + i * 0.4));
                const o4 = this.spawnAtom("O", o3.x + 20, o3.y + 16);
                this.createCovalentBond(o3, o4, 'double');
            }
        }
    }

    setStep(stepIndex) {
        if (!this.activeReaction) return;
        this.currentStep = Math.min(Math.max(stepIndex, 1), this.activeReaction.steps.length);
        
        // Sync playback progress
        const targetProgress = (this.currentStep - 1) / (this.activeReaction.steps.length - 1);
        this.playbackProgress = targetProgress;
        
        this.applyStepMechanisms();
    }

    applyStepMechanisms() {
        const id = this.activeReaction.id;
        const step = this.currentStep;

        if (id === "water") {
            if (step === 1) {
                this.initializeReactionState();
            } else if (step === 2) {
                // Flash explosion wave triggers this
                this.temperature = 800;
                this.breakAllBonds();
                this.atoms.forEach(a => {
                    a.glow = true;
                    // Energetic Brownian motion
                    a.vx = (Math.random() - 0.5) * 8;
                    a.vy = (Math.random() - 0.5) * 8;
                });
                this.spawnSpark(this.width / 2, this.height / 2, "#f59e0b", 40);
            } else if (step === 3) {
                this.temperature = 500;
                // Atoms begin to form polar attractions, move towards rearrangement positions dynamically
                const hAtoms = this.atoms.filter(a => a.element === "H");
                const oAtoms = this.atoms.filter(a => a.element === "O");

                for (let i = 0; i < oAtoms.length; i++) {
                    const yOffset = (i % 2 === 0) ? 15 : -15;
                    if (hAtoms[2 * i] && hAtoms[2 * i + 1] && oAtoms[i]) {
                        hAtoms[2 * i].targetX = oAtoms[i].x - 20;
                        hAtoms[2 * i].targetY = oAtoms[i].y + yOffset;
                        hAtoms[2 * i + 1].targetX = oAtoms[i].x + 20;
                        hAtoms[2 * i + 1].targetY = oAtoms[i].y + yOffset;
                    }
                }
            } else if (step === 4) {
                this.temperature = 350;
                this.breakAllBonds();
                const hAtoms = this.atoms.filter(a => a.element === "H");
                const oAtoms = this.atoms.filter(a => a.element === "O");

                // Establish stable covalent bonds for H2O dynamically
                for (let i = 0; i < oAtoms.length; i++) {
                    if (hAtoms[2 * i] && hAtoms[2 * i + 1] && oAtoms[i]) {
                        this.createCovalentBond(oAtoms[i], hAtoms[2 * i]);
                        this.createCovalentBond(oAtoms[i], hAtoms[2 * i + 1]);
                        this.spawnSpark(oAtoms[i].x, oAtoms[i].y, "#06b6d4", 15);
                    }
                }

                this.atoms.forEach(a => {
                    a.glow = false;
                    a.targetX = null;
                    a.targetY = null;
                });
            }
        }
        else if (id === "neutralization") {
            if (step === 1) {
                this.initializeReactionState();
            } else if (step === 2) {
                // Ionization: Break existing bonds, assign charges
                this.breakAllBonds();
                
                const hClAtoms = this.atoms.filter(a => a.element === "H" && a.subType === "hcl-H");
                const hOhAtoms = this.atoms.filter(a => a.element === "H" && a.subType === "naoh-H");
                const clAtoms = this.atoms.filter(a => a.element === "Cl");
                const naAtoms = this.atoms.filter(a => a.element === "Na");
                const oAtoms = this.atoms.filter(a => a.element === "O");

                // Re-bind OH group covalently (remains as stable hydroxide ion) and assign charges
                for (let i = 0; i < oAtoms.length; i++) {
                    if (oAtoms[i] && hOhAtoms[i]) {
                        this.createCovalentBond(oAtoms[i], hOhAtoms[i]);
                        oAtoms[i].charge = -1;
                        oAtoms[i].chargeLabel = "-";
                        oAtoms[i].state = "solvated";
                        hOhAtoms[i].charge = 0;
                        hOhAtoms[i].chargeLabel = "";
                        hOhAtoms[i].state = "solvated";
                    }
                }

                // Hydration tags and ionic charges for reactants
                hClAtoms.forEach(h => {
                    h.charge = 1; h.chargeLabel = "+"; h.state = "solvated";
                    this.spawnSpark(h.x, h.y, "#38bdf8", 8);
                });
                clAtoms.forEach(cl => {
                    cl.charge = -1; cl.chargeLabel = "-"; cl.state = "solvated";
                });
                naAtoms.forEach(na => {
                    na.charge = 1; na.chargeLabel = "+"; na.state = "solvated";
                    this.spawnSpark(na.x, na.y, "#38bdf8", 8);
                });

                // Scatter
                this.atoms.forEach(a => {
                    a.vx = (Math.random() - 0.5) * 3;
                    a.vy = (Math.random() - 0.5) * 3;
                });
            } else if (step === 3) {
                // Accelerate H+ and OH- group towards each other dynamically
                const hClAtoms = this.atoms.filter(a => a.element === "H" && a.subType === "hcl-H");
                const oAtoms = this.atoms.filter(a => a.element === "O");
                
                for (let i = 0; i < hClAtoms.length; i++) {
                    if (hClAtoms[i] && oAtoms[i]) {
                        hClAtoms[i].targetX = oAtoms[i].x - 15;
                        hClAtoms[i].targetY = oAtoms[i].y - 15;
                    }
                }
            } else if (step === 4) {
                this.breakAllBonds();
                
                const hClAtoms = this.atoms.filter(a => a.element === "H" && a.subType === "hcl-H");
                const hOhAtoms = this.atoms.filter(a => a.element === "H" && a.subType === "naoh-H");
                const clAtoms = this.atoms.filter(a => a.element === "Cl");
                const naAtoms = this.atoms.filter(a => a.element === "Na");
                const oAtoms = this.atoms.filter(a => a.element === "O");

                for (let i = 0; i < oAtoms.length; i++) {
                    const o = oAtoms[i];
                    const h_oh = hOhAtoms[i];
                    const h_cl = hClAtoms[i];

                    if (o && h_oh && h_cl) {
                        // Form H2O covalent bonds
                        this.createCovalentBond(o, h_oh);
                        this.createCovalentBond(o, h_cl);
                        
                        o.charge = 0; o.chargeLabel = ""; o.state = "gas";
                        h_oh.charge = 0; h_oh.chargeLabel = ""; h_oh.state = "gas";
                        h_cl.charge = 0; h_cl.chargeLabel = ""; h_cl.state = "gas";
                        
                        h_cl.targetX = null; h_cl.targetY = null;
                        this.spawnSpark(o.x, o.y, "#06b6d4", 15);
                    }
                }

                // Spectator ions keep their dissolved state
                clAtoms.forEach(cl => {
                    cl.charge = -1; cl.chargeLabel = "-"; cl.state = "solvated";
                });
                naAtoms.forEach(na => {
                    na.charge = 1; na.chargeLabel = "+"; na.state = "solvated";
                });
            }
        }
        else if (id === "redox") {
            if (step === 1) {
                this.initializeReactionState();
            } else if (step === 2) {
                // Acid fully dissociates: break H-Cl bonds
                this.breakAllBonds();
                
                const hAtoms = this.atoms.filter(a => a.element === "H");
                const clAtoms = this.atoms.filter(a => a.element === "Cl");
                const znAtoms = this.atoms.filter(a => a.element === "Zn");
                
                hAtoms.forEach(a => {
                    a.charge = 1; a.chargeLabel = "+"; a.state = "solvated";
                });
                clAtoms.forEach(a => {
                    a.charge = -1; a.chargeLabel = "-"; a.state = "solvated";
                });

                // Guide H+ ions to settle on the Zinc lattice interface dynamically
                for (let i = 0; i < hAtoms.length; i++) {
                    let znIdx = 0;
                    if (hAtoms.length === 2) {
                        znIdx = (i === 0) ? 1 : 3;
                    } else {
                        // 4 H atoms: map to 0, 1, 3, 4 (skips central 2)
                        znIdx = (i < 2) ? i : i + 1;
                    }
                    if (hAtoms[i] && znAtoms[znIdx]) {
                        hAtoms[i].targetX = znAtoms[znIdx].x;
                        hAtoms[i].targetY = znAtoms[znIdx].y - 20;
                    }
                }
            } else if (step === 3) {
                const hAtoms = this.atoms.filter(a => a.element === "H");
                const znAtoms = this.atoms.filter(a => a.element === "Zn");
                
                // Electron transfer: Zn loses 2e-, goes to H+
                const reactiveZns = (this.concentration === 2) ? [znAtoms[1], znAtoms[3]] : [znAtoms[2]];
                const hPairs = [];
                for (let i = 0; i < this.concentration; i++) {
                    hPairs.push([hAtoms[i * 2], hAtoms[i * 2 + 1]]);
                }

                for (let i = 0; i < reactiveZns.length; i++) {
                    const zn = reactiveZns[i];
                    const pair = hPairs[i];
                    
                    if (zn && pair && pair[0] && pair[1]) {
                        zn.charge = 2;
                        zn.chargeLabel = "2+";
                        zn.state = "solvated";
                        zn.glow = true;
                        
                        // Dissolve Zn2+ into acid solution
                        zn.targetX = this.width * (0.4 + i * 0.2);
                        zn.targetY = this.height * 0.45;
                        zn.vx = (Math.random() - 0.5) * 2;
                        zn.vy = -2.5;

                        // Reduce H+ to neutral gas molecules
                        pair[0].charge = 0; pair[0].chargeLabel = ""; pair[0].state = "gas";
                        pair[1].charge = 0; pair[1].chargeLabel = ""; pair[1].state = "gas";
                        
                        pair[0].targetX = this.width * (0.35 + i * 0.3);
                        pair[0].targetY = this.height * 0.3;
                        pair[1].targetX = this.width * (0.35 + i * 0.3) + 15;
                        pair[1].targetY = this.height * 0.3;

                        // Spawn electronic transfer visual particles
                        this.spawnSpark(zn.x, zn.y, "#06b6d4", 20);
                    }
                }
            } else if (step === 4) {
                const hAtoms = this.atoms.filter(a => a.element === "H");
                
                // Covalent Hydrogen gas molecule bubble floats up dynamically!
                for (let i = 0; i < this.concentration; i++) {
                    const h1 = hAtoms[i * 2];
                    const h2 = hAtoms[i * 2 + 1];
                    if (h1 && h2) {
                        h1.targetX = null; h1.targetY = null;
                        h2.targetX = null; h2.targetY = null;
                        this.createCovalentBond(h1, h2);
                        
                        // Float bubble gas molecule up
                        h1.vy = h2.vy = -1.5;
                        h1.state = h2.state = "gas";
                    }
                }

                const znAtoms = this.atoms.filter(a => a.element === "Zn");
                znAtoms.forEach(zn => {
                    if (zn.charge === 2) {
                        zn.targetX = null;
                        zn.targetY = null;
                    }
                });
            }
        }
        else if (id === "precipitation") {
            if (step === 1) {
                this.initializeReactionState();
            } else if (step === 2) {
                // Complete ionization
                this.breakAllBonds();
                
                const nAtoms = this.atoms.filter(a => a.element === "N");
                const oAtoms = this.atoms.filter(a => a.element === "O");
                const agAtoms = this.atoms.filter(a => a.element === "Ag");
                const clAtoms = this.atoms.filter(a => a.element === "Cl");
                const naAtoms = this.atoms.filter(a => a.element === "Na");

                // Restructure NO3 groups covalently and assign charges
                for (let i = 0; i < nAtoms.length; i++) {
                    const n = nAtoms[i];
                    if (n) {
                        for (let j = 0; j < 3; j++) {
                            const o = oAtoms[i * 3 + j];
                            if (o) this.createCovalentBond(n, o);
                        }
                        n.charge = -1; n.chargeLabel = "-"; n.state = "solvated";
                    }
                }

                for (let i = 0; i < agAtoms.length; i++) {
                    const ag = agAtoms[i];
                    const cl = clAtoms[i];
                    const na = naAtoms[i];

                    if (ag && cl && na) {
                        ag.charge = 1; ag.chargeLabel = "+"; ag.state = "solvated";
                        cl.charge = -1; cl.chargeLabel = "-"; cl.state = "solvated";
                        na.charge = 1; na.chargeLabel = "+"; na.state = "solvated";

                        // Collision: Ag+ and Cl- pull together stacked
                        ag.targetX = this.width / 2 - 20;
                        ag.targetY = this.height * 0.45 + (i * 25);
                        cl.targetX = this.width / 2 + 20;
                        cl.targetY = this.height * 0.45 + (i * 25);
                    }
                }
            } else if (step === 3) {
                const agAtoms = this.atoms.filter(a => a.element === "Ag");
                const clAtoms = this.atoms.filter(a => a.element === "Cl");

                // Lock together in cubic ionic lattice dynamically
                for (let i = 0; i < agAtoms.length; i++) {
                    const ag = agAtoms[i];
                    const cl = clAtoms[i];
                    if (ag && cl) {
                        ag.targetX = this.width / 2 - 12;
                        ag.targetY = this.height * 0.45 + (i * 25);
                        cl.targetX = this.width / 2 + 12;
                        cl.targetY = this.height * 0.45 + (i * 25);

                        ag.state = "lattice";
                        cl.state = "lattice";
                        
                        this.spawnSpark(this.width / 2, this.height * 0.45 + (i * 25), "#ffffff", 15);
                    }
                }
            } else if (step === 4) {
                const agAtoms = this.atoms.filter(a => a.element === "Ag");
                const clAtoms = this.atoms.filter(a => a.element === "Cl");

                // Sinks to the bottom dynamically (precipitate settles in pile)
                for (let i = 0; i < agAtoms.length; i++) {
                    const ag = agAtoms[i];
                    const cl = clAtoms[i];
                    if (ag && cl) {
                        ag.targetX = this.width / 2 - 12;
                        ag.targetY = this.height - 40 - (i * 20);
                        
                        cl.targetX = this.width / 2 + 12;
                        cl.targetY = this.height - 40 - (i * 20);

                        ag.state = "precipitate";
                        cl.state = "precipitate";
                        
                        ag.vx = cl.vx = 0;
                        ag.vy = cl.vy = 0.8; // settle speed
                    }
                }
            }
        }
        else if (id === "combustion") {
            if (step === 1) {
                this.initializeReactionState();
            } else if (step === 2) {
                // Fire spark explosion wave!
                this.temperature = 1000;
                this.breakAllBonds();
                this.atoms.forEach(a => {
                    a.glow = true;
                    a.vx = (Math.random() - 0.5) * 10;
                    a.vy = (Math.random() - 0.5) * 10;
                });
                this.spawnSpark(this.width / 2, this.height / 2, "#f43f5e", 50);
            } else if (step === 3) {
                this.temperature = 600;
                // Exothermic assembly: atoms guide towards product arrangements dynamically
                const cAtoms = this.atoms.filter(a => a.element === "C");
                const hAtoms = this.atoms.filter(a => a.element === "H");
                const oAtoms = this.atoms.filter(a => a.element === "O");

                for (let i = 0; i < cAtoms.length; i++) {
                    const c = cAtoms[i];
                    if (c) {
                        // CO2 configuration (Linear)
                        c.targetX = this.width * 0.35;
                        c.targetY = this.height * (0.3 + i * 0.4);
                        if (oAtoms[i * 4]) {
                            oAtoms[i * 4].targetX = c.targetX - 25;
                            oAtoms[i * 4].targetY = c.targetY;
                        }
                        if (oAtoms[i * 4 + 1]) {
                            oAtoms[i * 4 + 1].targetX = c.targetX + 25;
                            oAtoms[i * 4 + 1].targetY = c.targetY;
                        }

                        // 2 H2O configurations (Bent)
                        if (oAtoms[i * 4 + 2]) {
                            oAtoms[i * 4 + 2].targetX = this.width * 0.7;
                            oAtoms[i * 4 + 2].targetY = this.height * (0.25 + i * 0.4);
                            if (hAtoms[i * 4]) {
                                hAtoms[i * 4].targetX = oAtoms[i * 4 + 2].targetX - 20;
                                hAtoms[i * 4].targetY = oAtoms[i * 4 + 2].targetY + 15;
                            }
                            if (hAtoms[i * 4 + 1]) {
                                hAtoms[i * 4 + 1].targetX = oAtoms[i * 4 + 2].targetX + 20;
                                hAtoms[i * 4 + 1].targetY = oAtoms[i * 4 + 2].targetY + 15;
                            }
                        }

                        if (oAtoms[i * 4 + 3]) {
                            oAtoms[i * 4 + 3].targetX = this.width * 0.7;
                            oAtoms[i * 4 + 3].targetY = this.height * (0.45 + i * 0.4);
                            if (hAtoms[i * 4 + 2]) {
                                hAtoms[i * 4 + 2].targetX = oAtoms[i * 4 + 3].targetX - 20;
                                hAtoms[i * 4 + 2].targetY = oAtoms[i * 4 + 3].targetY - 15;
                            }
                            if (hAtoms[i * 4 + 3]) {
                                hAtoms[i * 4 + 3].targetX = oAtoms[i * 4 + 3].targetX + 20;
                                hAtoms[i * 4 + 3].targetY = oAtoms[i * 4 + 3].targetY - 15;
                            }
                        }
                    }
                }
            } else if (step === 4) {
                this.temperature = 400;
                this.breakAllBonds();

                const cAtoms = this.atoms.filter(a => a.element === "C");
                const hAtoms = this.atoms.filter(a => a.element === "H");
                const oAtoms = this.atoms.filter(a => a.element === "O");

                for (let i = 0; i < cAtoms.length; i++) {
                    const c = cAtoms[i];
                    if (c && oAtoms[i * 4] && oAtoms[i * 4 + 1]) {
                        // Form stable CO2 double covalent bonds
                        this.createCovalentBond(c, oAtoms[i * 4], 'double');
                        this.createCovalentBond(c, oAtoms[i * 4 + 1], 'double');
                    }

                    // Form stable H2O covalent single bonds
                    if (oAtoms[i * 4 + 2] && hAtoms[i * 4] && hAtoms[i * 4 + 1]) {
                        this.createCovalentBond(oAtoms[i * 4 + 2], hAtoms[i * 4]);
                        this.createCovalentBond(oAtoms[i * 4 + 2], hAtoms[i * 4 + 1]);
                    }
                    if (oAtoms[i * 4 + 3] && hAtoms[i * 4 + 2] && hAtoms[i * 4 + 3]) {
                        this.createCovalentBond(oAtoms[i * 4 + 3], hAtoms[i * 4 + 2]);
                        this.createCovalentBond(oAtoms[i * 4 + 3], hAtoms[i * 4 + 3]);
                    }

                    if (c) {
                        this.spawnSpark(c.x, c.y, "#f43f5e", 20);
                    }
                    if (oAtoms[i * 4 + 2]) {
                        this.spawnSpark(oAtoms[i * 4 + 2].x, oAtoms[i * 4 + 2].y, "#06b6d4", 15);
                    }
                    if (oAtoms[i * 4 + 3]) {
                        this.spawnSpark(oAtoms[i * 4 + 3].x, oAtoms[i * 4 + 3].y, "#06b6d4", 15);
                    }
                }

                this.atoms.forEach(a => {
                    a.glow = false;
                    a.targetX = null;
                    a.targetY = null;
                    // Zoom away at high product speed
                    a.vx = (Math.random() - 0.5) * 4;
                    a.vy = (Math.random() - 0.5) * 4;
                });
            }
        }
    }

    triggerActivation() {
        if (!this.activeReaction) return;
        
        // Trigger spark visually
        this.sparkWave = {
            x: this.width / 2,
            y: this.height / 2,
            r: 5,
            maxR: this.width * 0.6,
            alpha: 1.0
        };

        this.spawnSpark(this.width / 2, this.height / 2, "#f59e0b", 45);
        
        // Advance to step 2 automatically
        this.setStep(2);
    }

    updatePhysics(dt) {
        // Temperature based vibration speed scaling factor
        const tempFactor = Math.sqrt(this.temperature / 300);

        // 1. Move atoms towards targets (if defined) or apply kinetics
        this.atoms.forEach(atom => {
            if (atom.targetX !== null && atom.targetY !== null) {
                // Move towards target smoothly (LERP)
                atom.x += (atom.targetX - atom.x) * 0.08 * this.speed;
                atom.y += (atom.targetY - atom.y) * 0.08 * this.speed;
                atom.vx = 0;
                atom.vy = 0;
            } else {
                // Normal kinetics
                // Apply small Brownian jitter
                if (atom.state !== "lattice" && atom.state !== "precipitate") {
                    atom.vx += (Math.random() - 0.5) * 0.15 * tempFactor * this.speed;
                    atom.vy += (Math.random() - 0.5) * 0.15 * tempFactor * this.speed;
                }

                // Cap velocity
                const speedLimit = 6 * tempFactor;
                const currSpeed = Math.hypot(atom.vx, atom.vy);
                if (currSpeed > speedLimit) {
                    atom.vx = (atom.vx / currSpeed) * speedLimit;
                    atom.vy = (atom.vy / currSpeed) * speedLimit;
                }

                // Apply velocity
                atom.x += atom.vx * this.speed * (dt / 16);
                atom.y += atom.vy * this.speed * (dt / 16);
                
                // Sinking precipitate slowing
                if (atom.state === "precipitate") {
                    atom.vx *= 0.95; // damp x
                    if (atom.y >= this.height - atom.radius - 10) {
                        atom.y = this.height - atom.radius - 10;
                        atom.vy = 0;
                        atom.vx = 0;
                    }
                }
            }

            // Orbital shell angle increment
            atom.angle += 0.04 * tempFactor * this.speed;

            // Soft wall boundaries
            const border = 25;
            if (atom.state !== "lattice" && atom.state !== "precipitate") {
                if (atom.x < border + atom.radius) {
                    atom.x = border + atom.radius;
                    atom.vx *= -0.8;
                }
                if (atom.x > this.width - border - atom.radius) {
                    atom.x = this.width - border - atom.radius;
                    atom.vx *= -0.8;
                }
                if (atom.y < border + atom.radius) {
                    atom.y = border + atom.radius;
                    atom.vy *= -0.8;
                }
                if (atom.y > this.height - border - atom.radius) {
                    atom.y = this.height - border - atom.radius;
                    atom.vy *= -0.8;
                }
            }
        });

        // 2. Atoms elastic elastic collisions
        for (let i = 0; i < this.atoms.length; i++) {
            for (let j = i + 1; j < this.atoms.length; j++) {
                const a1 = this.atoms[i];
                const a2 = this.atoms[j];

                // Are they covalently bonded? If so, spring force binds them
                const isBonded = this.bonds.some(b => 
                    (b.atom1.id === a1.id && b.atom2.id === a2.id) ||
                    (b.atom1.id === a2.id && b.atom2.id === a1.id)
                );

                const dx = a2.x - a1.x;
                const dy = a2.y - a1.y;
                const dist = Math.hypot(dx, dy);
                const minDist = a1.radius + a2.radius + 8; // buffer

                if (isBonded) {
                    // Check if bond is stretched beyond critical snapping distance in sandbox mode
                    if (this.isSandbox) {
                        const snapLimit = a1.radius + a2.radius + 80;
                        if (dist > snapLimit) {
                            const bondIdx = this.bonds.findIndex(b =>
                                (b.atom1.id === a1.id && b.atom2.id === a2.id) ||
                                (b.atom1.id === a2.id && b.atom2.id === a1.id)
                            );
                            if (bondIdx !== -1) {
                                const midX = (a1.x + a2.x) / 2;
                                const midY = (a1.y + a2.y) / 2;
                                this.spawnSpark(midX, midY, '#ef4444', 12);
                                
                                this.bonds.splice(bondIdx, 1);
                                a1.bonds = a1.bonds.filter(id => id !== a2.id);
                                a2.bonds = a2.bonds.filter(id => id !== a1.id);
                                
                                a1.glow = true;
                                a2.glow = true;
                                setTimeout(() => {
                                    a1.glow = false;
                                    a2.glow = false;
                                }, 300);
                            }
                            continue;
                        }
                    }

                    // Hooke's Law Spring Force
                    const targetSpringDist = a1.radius + a2.radius + 12;
                    const forceK = 0.08;
                    const diff = dist - targetSpringDist;
                    const force = diff * forceK;

                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;

                    if (a1.targetX === null) { a1.vx += fx; a1.vy += fy; }
                    if (a2.targetX === null) { a2.vx -= fx; a2.vy -= fy; }
                } else {
                    // Normal collision repulsion
                    if (dist < minDist) {
                        const overlap = minDist - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;

                        // Push apart
                        if (a1.targetX === null) {
                            a1.x -= nx * overlap * 0.5;
                            a1.y -= ny * overlap * 0.5;
                            a1.vx -= nx * 0.5;
                            a1.vy -= ny * 0.5;
                        }
                        if (a2.targetX === null) {
                            a2.x += nx * overlap * 0.5;
                            a2.y += ny * overlap * 0.5;
                            a2.vx += nx * 0.5;
                            a2.vy += ny * 0.5;
                        }
                        
                        // Sandbox auto-bonding
                        if (this.isSandbox && this.autoBonding) {
                            // Check compatibility e.g. H + O, C + O, C + H
                            const elements = [a1.element, a2.element].sort().join("");
                            const compatible = ["HO", "CO", "CH", "ClNa", "AgCl"].includes(elements);
                            if (compatible) {
                                this.createCovalentBond(a1, a2);
                            }
                        }
                    }
                }
            }
        }

        // 3. Update Visual particles (sparks, electrons)
        this.particles.forEach((p, idx) => {
            p.x += p.vx * this.speed;
            p.y += p.vy * this.speed;
            p.life -= p.decay * this.speed;
            if (p.life <= 0) {
                this.particles.splice(idx, 1);
            }
        });

        // 4. Update shockwave
        if (this.sparkWave) {
            this.sparkWave.r += 12 * this.speed;
            this.sparkWave.alpha = 1.0 - (this.sparkWave.r / this.sparkWave.maxR);
            if (this.sparkWave.r >= this.sparkWave.maxR) {
                this.sparkWave = null;
            }
        }
    }

    drawEngine() {
        if (!this.ctx) return;
        const ctx = this.ctx;
        
        ctx.clearRect(0, 0, this.width, this.height);

        // Draw background grid lines (Sophisticated scientific laboratory feel)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < this.width; x += gridSize) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.height); ctx.stroke();
        }
        for (let y = 0; y < this.height; y += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.width, y); ctx.stroke();
        }

        // 1. Draw Shockwave
        if (this.sparkWave) {
            ctx.save();
            const grad = ctx.createRadialGradient(
                this.sparkWave.x, this.sparkWave.y, this.sparkWave.r * 0.2,
                this.sparkWave.x, this.sparkWave.y, this.sparkWave.r
            );
            grad.addColorStop(0, 'rgba(245, 158, 11, 0)');
            grad.addColorStop(0.8, `rgba(244, 63, 94, ${this.sparkWave.alpha * 0.3})`);
            grad.addColorStop(1, `rgba(99, 102, 241, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.sparkWave.x, this.sparkWave.y, this.sparkWave.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 2. Draw Covalent/Ionic Bonds
        this.bonds.forEach(bond => {
            const a1 = bond.atom1;
            const a2 = bond.atom2;

            ctx.save();
            const dx = a2.x - a1.x;
            const dy = a2.y - a1.y;
            const dist = Math.hypot(dx, dy);
            
            // Draw dual capsule neon bond lines
            const grad = ctx.createLinearGradient(a1.x, a1.y, a2.x, a2.y);
            grad.addColorStop(0, a1.color);
            grad.addColorStop(1, a2.color);

            ctx.strokeStyle = grad;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';

            if (bond.type === 'double') {
                // Two parallel lines
                const offsetX = -dy / dist * 4;
                const offsetY = dx / dist * 4;
                
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(a1.x + offsetX, a1.y + offsetY);
                ctx.lineTo(a2.x + offsetX, a2.y + offsetY);
                ctx.moveTo(a1.x - offsetX, a1.y - offsetY);
                ctx.lineTo(a2.x - offsetX, a2.y - offsetY);
                ctx.stroke();
            } else {
                // Single line
                ctx.lineWidth = 3.5;
                ctx.beginPath();
                ctx.moveTo(a1.x, a1.y);
                ctx.lineTo(a2.x, a2.y);
                ctx.stroke();
            }
            ctx.restore();
        });

        // 3. Draw Atoms
        this.atoms.forEach(atom => {
            ctx.save();
            
            // Halo glow for reaction states or selection
            const isSelected = this.selectedAtom && this.selectedAtom.id === atom.id;
            if (atom.glow || isSelected) {
                ctx.shadowColor = isSelected ? '#38bdf8' : atom.color;
                ctx.shadowBlur = isSelected ? 20 : 12;
            }

            // Outer solvation halo (if solvated)
            if (atom.state === "solvated") {
                ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
                ctx.lineWidth = 4;
                ctx.beginPath();
                ctx.arc(atom.x, atom.y, atom.radius + 10, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Draw core nucleus (Solid circular filled atom)
            ctx.fillStyle = atom.color;
            ctx.beginPath();
            ctx.arc(atom.x, atom.y, atom.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Inside label text
            ctx.fillStyle = atom.element === "H" || atom.element === "Ag" ? "#0f172a" : "#ffffff";
            ctx.font = `bold ${atom.radius * 0.9}px "Outfit"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(atom.element, atom.x, atom.y + 0.5);

            // Draw Ionic Charge Sign overlays (e.g. +, -)
            if (atom.chargeLabel) {
                ctx.shadowBlur = 0; // reset
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 9px "JetBrains Mono"';
                ctx.fillText(atom.chargeLabel, atom.x + atom.radius - 2, atom.y - atom.radius + 2);
            }

            ctx.restore();

            // 4. Draw Electron Orbitals Cloud & Orbiting Valence Electrons
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const orbitR = atom.radius + 10;
            ctx.arc(atom.x, atom.y, orbitR, 0, Math.PI * 2);
            ctx.stroke();

            // Draw orbiting valence dots
            // Determine electrons count to draw
            let eCount = atom.valence;
            if (atom.charge === 1) eCount -= 1; // Na+ lost 1
            if (atom.charge === -1) eCount += 1; // Cl- gained 1
            if (atom.charge === 2) eCount -= 2; // Zn2+ lost 2

            eCount = Math.max(0, eCount);

            ctx.fillStyle = '#06b6d4';
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 6;
            
            for (let i = 0; i < eCount; i++) {
                const angle = atom.angle + (i * (Math.PI * 2 / eCount));
                const ex = atom.x + Math.cos(angle) * orbitR;
                const ey = atom.y + Math.sin(angle) * orbitR;
                
                ctx.beginPath();
                ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });

        // 5. Draw Visual Sparks effects
        this.particles.forEach(p => {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha * p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    animate(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Physics update
        this.updatePhysics(dt);
        
        // Canvas render
        this.drawEngine();

        requestAnimationFrame(this.animate);
    }
}
