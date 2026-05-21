/*
=============================================================================
REACTION LAB - INTERACTIVE QUIZ & ELECTRON ASSESSMENT GAME
Implements multiple-choice questionnaires, drag-and-drop valence shell games,
score cards, and localized feedback mechanisms.
=============================================================================
*/

const QuizModules = [
    {
        id: "water_quiz",
        title: "Synthesis of Water",
        questions: [
            {
                type: "mc",
                text: "Why do Hydrogen (H₂) and Oxygen (O₂) gases not react instantly when mixed together at room temperature?",
                options: [
                    "They repel each other electrostatically due to matching electronegativities.",
                    "(Recommended) They require activation energy to vibrate and break their existing covalent bonds.",
                    "Oxygen is a noble gas and refuses to share electrons without extreme pressure.",
                    "Water synthesis is an endothermic reaction and must absorb heat from the surroundings first."
                ],
                correctIndex: 1,
                feedback: "Excellent! The H-H single bonds and O=O double bonds are highly stable. The molecules must collide with sufficient kinetic energy (supplied by a spark) to break these bonds and enter the transition state."
            },
            {
                type: "mc",
                text: "What type of chemical bond is formed between Hydrogen and Oxygen in a water molecule?",
                options: [
                    "Ionic Bond (electrons are completely transferred)",
                    "Metallic Bond (electrons form a mobile sea)",
                    "Polar Covalent Bond (electrons are shared, but pulled closer to Oxygen)",
                    "Nonpolar Covalent Bond (electrons are shared perfectly equally)"
                ],
                correctIndex: 2,
                feedback: "Correct. Oxygen is highly electronegative (3.44) compared to Hydrogen (2.20). This difference pulls the shared electrons closer to Oxygen, giving water its bent, polar properties."
            },
            {
                type: "valence",
                text: "Interactive Shell Challenge: Double Covalent Sharing in Oxygen. Click the empty valence slots on the oxygen atom to fill them and complete its outer valence octet!",
                element: "O",
                targetSlots: 2,
                feedback: "Wonderful! By filling the valence shell, Oxygen attains a stable outer octet, representing the stable configuration of oxygen atoms in product bonds."
            }
        ]
    },
    {
        id: "neutralization_quiz",
        title: "Acid-Base Neutralization",
        questions: [
            {
                type: "mc",
                text: "What is the net chemical result of a strong acid reacting with a strong base in water?",
                options: [
                    "Dissociated ions assemble into a gaseous cloud that escapes the solution.",
                    "Protons (H⁺) and hydroxide ions (OH⁻) attract electrostatically and bind covalently to form neutral water.",
                    "Sodium and chlorine atoms form a stable covalent crystal that sinks instantly.",
                    "Enthalpy surges to positive levels, cooling the solution down to freezing point."
                ],
                correctIndex: 1,
                feedback: "Correct! The true reaction in any neutralization is the combination of H⁺ and OH⁻ to form stable H₂O molecules."
            },
            {
                type: "mc",
                text: "Which of the following ions are referred to as 'spectator ions' in the neutralization of HCl and NaOH?",
                options: [
                    "H⁺ and OH⁻",
                    "H⁺ and Cl⁻",
                    "Na⁺ and Cl⁻",
                    "Na⁺ and OH⁻"
                ],
                correctIndex: 2,
                feedback: "Perfect! Na⁺ and Cl⁻ remain fully dissolved and solvated by water molecules before and after the reaction, acting as mere spectators to the neutralization."
            }
        ]
    },
    {
        id: "redox_quiz",
        title: "Single Displacement Redox",
        questions: [
            {
                type: "mc",
                text: "During the redox reaction between solid Zinc metal and Hydrochloric acid, what occurs to the Zinc atoms?",
                options: [
                    "They gain two electrons from chloride ions and undergo reduction.",
                    "They lose two electrons to hydrogen ions, undergo oxidation, and dissolve as Zn²⁺.",
                    "They form covalent double bonds with hydrogen to create ZnH₂ gas bubbles.",
                    "They act as spectator ions, floating around in water unchanged."
                ],
                correctIndex: 1,
                feedback: "Correct! Zinc is an active, electropositive metal. It readily undergoes oxidation, losing 2 valence electrons (Zn -> Zn²⁺ + 2e⁻) which are transferred to hydrogen ions."
            }
        ]
    },
    {
        id: "precipitation_quiz",
        title: "Double Displacement Precipitation",
        questions: [
            {
                type: "mc",
                text: "In the precipitation reaction of AgNO₃ and NaCl, what is the chemical formula of the insoluble precipitate that forms?",
                options: [
                    "NaNO₃ (Sodium Nitrate)",
                    "AgCl (Silver Chloride)",
                    "AgNO₃ (Silver Nitrate)",
                    "NaCl (Sodium Chloride)"
                ],
                correctIndex: 1,
                feedback: "Correct! When AgNO₃ and NaCl are mixed, Ag⁺ and Cl⁻ ions collide and form AgCl, which is highly insoluble in water and precipitates out as a white solid."
            },
            {
                type: "mc",
                text: "What makes Silver Chloride (AgCl) precipitate while Sodium Nitrate (NaNO₃) remains fully dissolved?",
                options: [
                    "Sodium ions are too heavy to settle to the bottom of the container.",
                    "Silver and chlorine atoms share electrons in a highly volatile nonpolar covalent bond.",
                    "The electrostatic attraction between Ag⁺ and Cl⁻ ions is extremely strong, overcoming the hydration forces of water.",
                    "Nitrate ions react with water to form a gas that holds sodium dissolved."
                ],
                correctIndex: 2,
                feedback: "Excellent! The lattice energy of AgCl is so high that the electrostatic attraction between Ag⁺ and Cl⁻ cannot be overcome by the hydration energy of water molecules, making it insoluble."
            }
        ]
    },
    {
        id: "combustion_quiz",
        title: "Methane Combustion",
        questions: [
            {
                type: "mc",
                text: "Methane combustion (CH₄ + 2O₂ → CO₂ + 2H₂O) is a highly exothermic reaction. What does this mean in terms of potential energy?",
                options: [
                    "The products have higher potential energy than the reactants, absorbing heat.",
                    "The products have lower potential energy than the reactants, releasing heat to the surroundings.",
                    "The activation energy barrier is zero, so the reaction happens instantly.",
                    "Carbon dioxide and water have matching electronegativities, neutralizing the energy."
                ],
                correctIndex: 1,
                feedback: "Correct! Exothermic reactions have a negative change in enthalpy (ΔH < 0), meaning the potential energy of the products is lower than that of the reactants, releasing energy as heat and light."
            },
            {
                type: "mc",
                text: "During the transition state of the combustion reaction, what is happening to the atomic bonds?",
                options: [
                    "No bonds are broken, the molecules simply compress under pressure.",
                    "Thermal energy has broken all C-H and O=O bonds, allowing atoms to freely rearrange into C=O and H-O bonds.",
                    "Covalent bonds are converted into ionic spectator salts.",
                    "Gaseous hydrogen atoms gain electrons and escape as hydrogen gas."
                ],
                correctIndex: 1,
                feedback: "Perfect! The spark supplies the activation energy needed to break all existing C-H and O=O bonds. The atoms then form stronger C=O and H-O bonds, releasing a large amount of energy."
            }
        ]
    },
    {
        id: "salt_quiz",
        title: "Synthesis of Table Salt",
        questions: [
            {
                type: "mc",
                text: "What is the primary driving force behind the reaction between Sodium metal and Chlorine gas?",
                options: [
                    "The chlorine diatomic molecules undergo endothermic expansion to absorb heat.",
                    "Sodium transfers its single valence electron to highly electronegative Chlorine, forming stable ionic charges.",
                    "Sodium and chlorine atoms share their electrons equally in a nonpolar covalent lattice.",
                    "Liquid sodium undergoes physical boiling, pushing chlorine molecules out of the container."
                ],
                correctIndex: 1,
                feedback: "Correct! Sodium (electronegativity 0.93) has a low ionization energy and easily loses its one valence electron. Chlorine (electronegativity 3.16) has a high electron affinity and readily accepts it, creating stable Na⁺ and Cl⁻ ions."
            },
            {
                type: "mc",
                text: "What is the physical structure of the product formed in the Sodium-Chlorine synthesis reaction?",
                options: [
                    "A series of linear diatomic covalent chains that vaporize instantly.",
                    "A tetrahedral organic molecular configuration.",
                    "An alternating cubic ionic crystal lattice held together by strong electrostatic forces.",
                    "A free-floating sea of delocalized metallic electrons."
                ],
                correctIndex: 2,
                feedback: "Perfect! Sodium chloride (NaCl) forms a crystalline cubic lattice where each Na⁺ ion is surrounded by six Cl⁻ ions, and vice versa, held together by high electrostatic lattice energy."
            },
            {
                type: "valence",
                text: "Interactive Shell Challenge: Valence Octet Completion for Chlorine. Click the empty valence slot on the chlorine atom to fill it and complete its stable outer shell octet!",
                element: "Cl",
                targetSlots: 1,
                feedback: "Wonderful! By accepting one electron, Chlorine completes its valence octet, achieving the stable electronic configuration of a chloride anion (Cl⁻)."
            }
        ]
    },
    {
        id: "haber_quiz",
        title: "Haber-Bosch Synthesis",
        questions: [
            {
                type: "mc",
                text: "Why does the Haber-Bosch synthesis of Ammonia require high temperature, high pressure, and a metal catalyst?",
                options: [
                    "Because nitrogen molecules repel hydrogen molecules electrostatically.",
                    "Because the nitrogen-nitrogen bond is a weak single covalent bond that must be kept from breaking.",
                    "Because nitrogen gas (N₂) has an extremely strong covalent triple bond (N≡N) with a very high activation energy barrier.",
                    "Because the reaction is highly endothermic and must absorb heat to yield products."
                ],
                correctIndex: 2,
                feedback: "Correct! The N≡N triple bond is incredibly strong (945 kJ/mol). The metal catalyst, heat, and pressure are needed to weaken and split these triple bonds, allowing nitrogen atoms to react with hydrogen."
            },
            {
                type: "mc",
                text: "What is the molecular geometry and polarity of the synthesized Ammonia (NH₃) molecule?",
                options: [
                    "Linear and nonpolar.",
                    "Trigonal pyramidal and polar covalent.",
                    "Perfect tetrahedral and metallic.",
                    "Planar triangular and ionic."
                ],
                correctIndex: 1,
                feedback: "Perfect! Ammonia has a trigonal pyramidal geometry due to the three N-H single bonds and a lone pair of electrons on the nitrogen atom. The electronegativity difference makes the molecule polar covalent."
            },
            {
                type: "valence",
                text: "Interactive Shell Challenge: Valence Octet Sharing in Nitrogen. Click the 3 empty valence slots on the nitrogen atom to fill them and complete its outer shell!",
                element: "N",
                targetSlots: 3,
                feedback: "Excellent! By sharing 3 electrons with 3 hydrogen atoms, Nitrogen completes its outer octet, achieving a stable, filled valence shell."
            }
        ]
    },
    {
        id: "decomposition_quiz",
        title: "Catalytic Peroxide Decomposition",
        questions: [
            {
                type: "mc",
                text: "What role does Manganese Dioxide (MnO₂) play in the decomposition of Hydrogen Peroxide (H₂O₂)?",
                options: [
                    "It acts as a reactant, being completely consumed to form Manganese Chloride.",
                    "It acts as a cooling agent, absorbing the reaction's heat to prevent boiling.",
                    "It acts as a catalyst, providing an alternative transition path that dramatically lowers the activation energy.",
                    "It acts as a surfactant, holding the oxygen bubbles dissolved in the solution."
                ],
                correctIndex: 2,
                feedback: "Excellent! Catalysts like MnO₂ lower the activation energy of a reaction without being consumed themselves. This allows the unstable O-O bond in hydrogen peroxide to snap rapidly at room temperature."
            },
            {
                type: "mc",
                text: "The catalytic decomposition of hydrogen peroxide (2H₂O₂ → 2H₂O + O₂ ↑) is a disproportionation reaction. What does this mean?",
                options: [
                    "The reactants undergo both physical boiling and melting simultaneously.",
                    "Oxygen atoms in the reactant are both oxidized (to O₂) and reduced (to H₂O) in the same reaction.",
                    "The mass of the products is greater than the starting mass of the reactants.",
                    "Nitrogen and hydrogen gases are synthesized as byproducts."
                ],
                correctIndex: 1,
                feedback: "Correct! In H₂O₂, the oxidation state of oxygen is -1. In the products, oxygen is reduced to -2 in H₂O and oxidized to 0 in O₂. A reaction where an element is simultaneously oxidized and reduced is called disproportionation."
            }
        ]
    }
];

class QuizController {
    constructor() {
        this.modulesList = document.getElementById('quiz-modules-list');
        this.quizIntro = document.getElementById('quiz-intro');
        this.qBox = document.getElementById('quiz-question-box');
        this.qResults = document.getElementById('quiz-results');
        
        this.qProgress = document.getElementById('quiz-q-progress');
        this.qPoints = document.getElementById('quiz-q-points');
        this.qText = document.getElementById('quiz-q-text');
        this.interactiveArea = document.getElementById('quiz-interactive-area');
        this.optionsList = document.getElementById('quiz-options-list');
        
        this.feedbackBox = document.getElementById('quiz-feedback-box');
        this.feedbackTitle = document.getElementById('quiz-feedback-title');
        this.feedbackDesc = document.getElementById('quiz-feedback-desc');
        
        this.btnSubmit = document.getElementById('btn-quiz-submit');
        this.btnNext = document.getElementById('btn-quiz-next');
        
        this.currentModule = null;
        this.currentQuestionIdx = 0;
        this.selectedOptionIdx = null;
        this.moduleScores = {}; // module_id -> score
        this.totalScore = 0;
        
        this.valenceSlotsFilled = 0;
        
        this.init();
    }

    init() {
        this.renderModules();
        
        this.btnSubmit.addEventListener('click', () => this.submitAnswer());
        this.btnNext.addEventListener('click', () => this.nextQuestion());
        
        document.getElementById('btn-quiz-restart').addEventListener('click', () => {
            this.startModule(this.currentModule);
        });
    }

    renderModules() {
        if (!this.modulesList) return;
        this.modulesList.innerHTML = '';
        
        QuizModules.forEach(mod => {
            const btn = document.createElement('button');
            btn.className = 'quiz-module-btn';
            btn.innerHTML = `
                <span>${mod.title}</span>
                <span class="completion" id="score-${mod.id}">Not Attempted</span>
            `;
            btn.addEventListener('click', () => this.startModule(mod));
            this.modulesList.appendChild(btn);
        });
    }

    startModule(mod) {
        this.currentModule = mod;
        this.currentQuestionIdx = 0;
        this.selectedOptionIdx = null;
        this.valenceSlotsFilled = 0;
        
        // Update active class on buttons
        const buttons = this.modulesList.querySelectorAll('.quiz-module-btn');
        buttons.forEach((b, idx) => {
            if (QuizModules[idx].id === mod.id) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
        
        this.quizIntro.classList.add('hidden');
        this.qResults.classList.add('hidden');
        this.qBox.classList.remove('hidden');
        
        this.loadQuestion();
    }

    loadQuestion() {
        const q = this.currentModule.questions[this.currentQuestionIdx];
        this.selectedOptionIdx = null;
        this.valenceSlotsFilled = 0;
        
        this.qProgress.innerText = `Question ${this.currentQuestionIdx + 1} of ${this.currentModule.questions.length}`;
        this.qPoints.innerText = `${Math.round(100 / this.currentModule.questions.length)} Points`;
        this.qText.innerText = q.text;
        
        this.feedbackBox.classList.add('hidden');
        this.btnSubmit.classList.remove('hidden');
        this.btnNext.classList.add('hidden');
        
        this.optionsList.innerHTML = '';
        this.interactiveArea.innerHTML = '';
        this.interactiveArea.classList.add('hidden');

        if (q.type === 'mc') {
            this.interactiveArea.classList.add('hidden');
            q.options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.innerHTML = `
                    <div class="option-index">${String.fromCharCode(65 + idx)}</div>
                    <span>${opt}</span>
                `;
                btn.addEventListener('click', () => this.selectOption(idx));
                this.optionsList.appendChild(btn);
            });
        } 
        else if (q.type === 'valence') {
            this.interactiveArea.classList.remove('hidden');
            
            // Build interactive valence shell game
            const shellWrapper = document.createElement('div');
            shellWrapper.className = 'interactive-valence-shell';
            
            const atomTarget = document.createElement('div');
            atomTarget.className = 'atom-shell-target';
            
            const nucleus = document.createElement('div');
            nucleus.className = 'atom-shell-nucleus';
            nucleus.style.backgroundColor = ElementsData[q.element].color;
            nucleus.style.color = q.element === 'H' ? '#0f172a' : '#ffffff';
            nucleus.innerText = q.element;
            atomTarget.appendChild(nucleus);
            
            // Spawn 2 empty slots representing orbitals
            const slotsCount = q.targetSlots;
            for (let i = 0; i < slotsCount; i++) {
                const slot = document.createElement('div');
                slot.className = 'electron-slot';
                
                // Position slots circularly around nucleus
                const angle = (i * (Math.PI * 2 / slotsCount)) - Math.PI/2;
                const r = 52; // radius
                const x = 65 + Math.cos(angle) * r;
                const y = 65 + Math.sin(angle) * r;
                
                slot.style.left = `${x}px`;
                slot.style.top = `${y}px`;
                
                slot.addEventListener('click', () => {
                    if (!slot.classList.contains('filled')) {
                        slot.classList.add('filled');
                        this.valenceSlotsFilled++;
                        
                        // Small spark effect
                        const rect = slot.getBoundingClientRect();
                        const pRect = this.interactiveArea.getBoundingClientRect();
                        
                        if (this.valenceSlotsFilled === slotsCount) {
                            this.btnSubmit.classList.remove('disabled');
                        }
                    }
                });
                
                atomTarget.appendChild(slot);
            }
            
            shellWrapper.appendChild(atomTarget);
            
            const poolArea = document.createElement('div');
            poolArea.className = 'electron-pool-container';
            poolArea.innerHTML = `
                <p style="font-size:0.8rem;color:#94a3b8;margin-bottom:8px;text-align:center;">Click the empty orbital slots to share electrons!</p>
                <div class="electron-pool">
                    <span class="draggable-electron"></span>
                    <span class="draggable-electron"></span>
                </div>
            `;
            shellWrapper.appendChild(poolArea);
            
            this.interactiveArea.appendChild(shellWrapper);
        }
    }

    selectOption(idx) {
        const q = this.currentModule.questions[this.currentQuestionIdx];
        if (this.feedbackBox.classList.contains('hidden') === false) return; // already submitted
        
        this.selectedOptionIdx = idx;
        
        const buttons = this.optionsList.querySelectorAll('.quiz-opt-btn');
        buttons.forEach((btn, i) => {
            if (i === idx) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    submitAnswer() {
        const q = this.currentModule.questions[this.currentQuestionIdx];
        let isCorrect = false;

        if (q.type === 'mc') {
            if (this.selectedOptionIdx === null) return;
            isCorrect = (this.selectedOptionIdx === q.correctIndex);
            
            const buttons = this.optionsList.querySelectorAll('.quiz-opt-btn');
            buttons.forEach((btn, idx) => {
                if (idx === q.correctIndex) {
                    btn.className = 'quiz-opt-btn correct';
                } else if (idx === this.selectedOptionIdx) {
                    btn.className = 'quiz-opt-btn incorrect';
                }
            });
        } 
        else if (q.type === 'valence') {
            isCorrect = (this.valenceSlotsFilled === q.targetSlots);
        }

        // Show feedback panel
        this.feedbackBox.classList.remove('hidden');
        if (isCorrect) {
            this.feedbackBox.className = 'quiz-feedback correct-style';
            this.feedbackTitle.innerText = "Correct!";
            this.feedbackDesc.innerText = q.feedback;
            
            // Add points to module score
            const questionVal = Math.round(100 / this.currentModule.questions.length);
            if (!this.moduleScores[this.currentModule.id]) this.moduleScores[this.currentModule.id] = 0;
            this.moduleScores[this.currentModule.id] += questionVal;
        } else {
            this.feedbackBox.className = 'quiz-feedback incorrect-style';
            this.feedbackTitle.innerText = "Incorrect";
            this.feedbackDesc.innerText = q.feedback || "Review the simulation and try again!";
        }

        this.btnSubmit.classList.add('hidden');
        this.btnNext.classList.remove('hidden');
        
        this.updateTotalScore();
    }

    nextQuestion() {
        this.currentQuestionIdx++;
        if (this.currentQuestionIdx < this.currentModule.questions.length) {
            this.loadQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.qBox.classList.add('hidden');
        this.qResults.classList.remove('hidden');
        
        const score = this.moduleScores[this.currentModule.id] || 0;
        
        document.getElementById('quiz-results-title').innerText = "Module Completed!";
        document.getElementById('quiz-results-desc').innerText = `You scored ${score} out of 100 on the ${this.currentModule.title} quiz!`;
        
        // Update module list indicators
        const scoreElement = document.getElementById(`score-${this.currentModule.id}`);
        if (scoreElement) {
            scoreElement.innerText = `${score} / 100`;
            scoreElement.className = "completion status-active";
        }
    }

    updateTotalScore() {
        let sum = 0;
        let count = 0;
        QuizModules.forEach(mod => {
            if (this.moduleScores[mod.id] !== undefined) {
                sum += this.moduleScores[mod.id];
                count++;
            }
        });
        
        const displayTotal = document.getElementById('quiz-total-score');
        if (displayTotal) {
            displayTotal.innerText = `${sum} / ${QuizModules.length * 100}`;
        }
    }
}
