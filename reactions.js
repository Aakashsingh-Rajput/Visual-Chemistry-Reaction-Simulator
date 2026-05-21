/*
=============================================================================
REACTION LAB - CHEMICAL REACTION MODELS & STEP DATA
Defines atomic structures, ionization states, steps, text descriptions,
thermodynamic curves, and elements metadata.
=============================================================================
*/

const ElementsData = {
    "H": {
        symbol: "H",
        name: "Hydrogen",
        atomicNumber: 1,
        electronegativity: 2.20,
        radius: 12,
        valence: 1,
        valenceMax: 2,
        color: "#ffffff",
        description: "Lightest element, highly flammable gas, forms single covalent bonds."
    },
    "O": {
        symbol: "O",
        name: "Oxygen",
        atomicNumber: 8,
        electronegativity: 3.44,
        radius: 18,
        valence: 6,
        valenceMax: 8,
        color: "#ef4444",
        description: "Highly reactive nonmetal, strong oxidizing agent, forms double covalent bonds."
    },
    "C": {
        symbol: "C",
        name: "Carbon",
        atomicNumber: 6,
        electronegativity: 2.55,
        radius: 20,
        valence: 4,
        valenceMax: 8,
        color: "#3b82f6",
        description: "Basis of organic chemistry, tetravalent element capable of forming single/double/triple bonds."
    },
    "Na": {
        symbol: "Na",
        name: "Sodium",
        atomicNumber: 11,
        electronegativity: 0.93,
        radius: 24,
        valence: 1,
        valenceMax: 8,
        color: "#10b981",
        description: "Soft, highly reactive alkali metal. Easily loses its single valence electron to form a stable Na⁺ cation."
    },
    "Cl": {
        symbol: "Cl",
        name: "Chlorine",
        atomicNumber: 17,
        electronegativity: 3.16,
        radius: 22,
        valence: 7,
        valenceMax: 8,
        color: "#a855f7",
        description: "Halogen element. Highly electronegative gas, readily gains one electron to form a Cl⁻ anion."
    },
    "Zn": {
        symbol: "Zn",
        name: "Zinc",
        atomicNumber: 30,
        electronegativity: 1.65,
        radius: 26,
        valence: 2,
        valenceMax: 8,
        color: "#94a3b8",
        description: "Transition metal. Reacts with strong acids, losing two valence electrons to form Zn²⁺."
    },
    "Ag": {
        symbol: "Ag",
        name: "Silver",
        atomicNumber: 47,
        electronegativity: 1.93,
        radius: 28,
        valence: 1,
        valenceMax: 8,
        color: "#cbd5e1",
        description: "Precious transition metal. In solution, Ag⁺ reacts with Cl⁻ to form an extremely insoluble AgCl precipitate."
    },
    "N": {
        symbol: "N",
        name: "Nitrogen",
        atomicNumber: 7,
        electronegativity: 3.04,
        radius: 18,
        valence: 5,
        color: "#f59e0b",
        description: "Nonmetal element. Forms Nitrate (NO₃⁻) groups that are spectator ions in precipitation reactions."
    }
};

const ReactionsCatalog = {
    "water": {
        id: "water",
        title: "Synthesis of Water",
        subtitle: "Covalent Bond Breaking & Formation",
        equationHtml: "2H₂ + O₂ <span class='arrow'>→</span> 2H₂O",
        equationText: "2H2 + O2 -> 2H2O",
        enthalpy: "Exothermic",
        deltaH: -483.6, // kJ/mol (for 2 moles of H2O)
        activationEnergy: 150, // relative units
        description: "Synthesis of water from hydrogen and oxygen gases is highly exothermic but requires a spark (activation energy) to break existing covalent bonds, leading to atomic rearrangement and covalent sharing.",
        
        // Potential Energy Curve coordinates: [x, y] where x is 0 to 100, y is Potential Energy (high y = high energy)
        energyCurve: [
            { x: 0, y: 70, label: "Reactants" },
            { x: 30, y: 70 },
            { x: 55, y: 15 }, // Peak of curve (Transition State) - NOTE: lower y-coord is HIGHER on canvas
            { x: 70, y: 120 },
            { x: 100, y: 120, label: "Products" }
        ],
        
        steps: [
            {
                index: 1,
                title: "Gaseous Mixture",
                description: "Hydrogen (H₂) and Oxygen (O₂) molecules bounce around at room temperature. Although the reaction is thermodynamically favorable (exothermic), they do not react spontaneously. Their collisions do not have enough kinetic energy to break the strong H-H and O=O bonds.",
                requiresTrigger: true,
                triggerText: "Apply Spark (Activation Energy)",
                triggerIcon: "⚡",
                timelinePos: 25 // percentage along timeline
            },
            {
                index: 2,
                title: "Transition State (Bond Cleavage)",
                description: "The thermal spark injects activation energy. The heat causes molecules to vibrate violently and collide at high velocities. This kinetic energy breaks the covalent H-H single bonds and O=O double bonds, creating highly reactive, free atomic radicals in an unstable transition state.",
                requiresTrigger: false,
                timelinePos: 55
            },
            {
                index: 3,
                title: "Covalent Rearrangement",
                description: "Due to the high electronegativity of Oxygen (3.44) compared to Hydrogen (2.20), the oxygen atoms strongly attract the hydrogen atoms' electrons. Atoms collide and begin sharing electrons, forming new, stable polar covalent O-H single bonds.",
                requiresTrigger: false,
                timelinePos: 72
            },
            {
                index: 4,
                title: "Product Stabilization",
                description: "Two stable, bent water (H₂O) molecules are formed. The system settles into a lower potential energy state. The difference in energy between the reactants and products (ΔH = -483.6 kJ/mol) is released into the surroundings as heat and light, making this a combustion-like reaction.",
                requiresTrigger: false,
                timelinePos: 100
            }
        ]
    },
    "neutralization": {
        id: "neutralization",
        title: "Acid-Base Neutralization",
        subtitle: "Ionization & Electrostatic Fusion",
        equationHtml: "HCl + NaOH <span class='arrow'>→</span> H₂O + NaCl",
        equationText: "HCl + NaOH -> H2O + NaCl",
        enthalpy: "Exothermic",
        deltaH: -57.1, // kJ/mol
        activationEnergy: 30,
        description: "Strong acid Hydrochloric Acid (HCl) reacts with strong base Sodium Hydroxide (NaOH). In aqueous solution, they dissociate fully into ions. The hydronium (H⁺) and hydroxide (OH⁻) ions quickly bind to form stable water, while Na⁺ and Cl⁻ remain as dissolved ions.",
        
        energyCurve: [
            { x: 0, y: 80, label: "Reactants" },
            { x: 30, y: 80 },
            { x: 50, y: 65, label: "Transition" },
            { x: 70, y: 100 },
            { x: 100, y: 100, label: "Products" }
        ],
        
        steps: [
            {
                index: 1,
                title: "Reactants in Water",
                description: "Hydrochloric acid (HCl) gas and crystalline Sodium Hydroxide (NaOH) are added to the aqueous solvent. Currently they are in molecular form or neat lattice states before ionization begins.",
                requiresTrigger: true,
                triggerText: "Add Water (Dissolve Ions)",
                triggerIcon: "💧",
                timelinePos: 25
            },
            {
                index: 2,
                title: "Solvation & Ionization",
                description: "Water molecules surround and split the polar compounds! HCl dissociates completely into H⁺ and Cl⁻ ions. NaOH dissociates into Na⁺ and OH⁻ ions. The ions float freely, stabilized by solvent hydration shells.",
                requiresTrigger: false,
                timelinePos: 50
            },
            {
                index: 3,
                title: "Electrostatic Attraction",
                description: "The positive hydrogen ion (H⁺) and negative hydroxide ion (OH⁻) have intense opposite charges. They experience a strong electrostatic attraction and are accelerated towards one another, colliding through the solvent.",
                requiresTrigger: false,
                timelinePos: 75
            },
            {
                index: 4,
                title: "Neutralization & Spectator Ions",
                description: "H⁺ and OH⁻ combine to form a highly stable, neutral covalent H₂O molecule. Meanwhile, Na⁺ and Cl⁻ remain fully dissolved as separated, solvated spectator ions. If we evaporate the water, they would crystallize into solid table salt (NaCl).",
                requiresTrigger: false,
                timelinePos: 100
            }
        ]
    },
    "redox": {
        id: "redox",
        title: "Single Displacement (Redox)",
        subtitle: "Active Metal Electron Transfer",
        equationHtml: "Zn + 2HCl <span class='arrow'>→</span> ZnCl₂ + H₂ ↑",
        equationText: "Zn + 2HCl -> ZnCl2 + H2",
        enthalpy: "Exothermic",
        deltaH: -153.8, // kJ/mol
        activationEnergy: 65,
        description: "Active metal Zinc displaces hydrogen from Hydrochloric acid. Zinc atoms oxidation involves losing electrons to form Zn²⁺ cations, which dissolve. Hydrogen ions gain these electrons (reduction) to form hydrogen gas bubbles that escape.",
        
        energyCurve: [
            { x: 0, y: 75, label: "Reactants" },
            { x: 30, y: 75 },
            { x: 52, y: 40, label: "Transition" },
            { x: 75, y: 110 },
            { x: 100, y: 110, label: "Products" }
        ],
        
        steps: [
            {
                index: 1,
                title: "Metal Sheet in Acid",
                description: "A solid strip of Zinc metal (grey atomic lattice held by shared metallic valence electrons) is submerged into an aqueous hydrochloric acid (HCl) solution. The solution contains fully dissociated H⁺ and Cl⁻ ions floating above.",
                requiresTrigger: true,
                triggerText: "Submerge Zinc Strip",
                triggerIcon: "🧪",
                timelinePos: 25
            },
            {
                index: 2,
                title: "Electron Oxidation at Surface",
                description: "Highly mobile H⁺ ions collide with the zinc surface. Zinc (electronegativity 1.65) is much more active and electropositive than hydrogen. When two H⁺ ions contact a zinc atom, the zinc atom transfers 2 valence electrons directly to them.",
                requiresTrigger: false,
                timelinePos: 52
            },
            {
                index: 3,
                title: "Zinc Dissolution & Gas Synthesis",
                description: "The zinc atom, now having lost two electrons, becomes a Zn²⁺ cation. Having a charge, it is pulled away from the metallic lattice by water molecules and enters solution. The two H⁺ ions, having gained one electron each, become neutral hydrogen atoms (H) and bind covalently to form H₂ gas.",
                requiresTrigger: false,
                timelinePos: 75
            },
            {
                index: 4,
                title: "Hydrogen Gas Release",
                description: "Multiple H₂ gas molecules cluster together to form bubbles. Being much less dense than water, the H₂ gas bubbles nucleate on the zinc surface and float up to escape. The solution now contains dissolved Zinc Chloride (Zn²⁺ and Cl⁻ ions).",
                requiresTrigger: false,
                timelinePos: 100
            }
        ]
    },
    "precipitation": {
        id: "precipitation",
        title: "Double Displacement (Precipitation)",
        subtitle: "Insoluble Crystal Lattice Lock-in",
        equationHtml: "AgNO₃ + NaCl <span class='arrow'>→</span> AgCl ↓ + NaNO₃",
        equationText: "AgNO3 + NaCl -> AgCl + NaNO3",
        enthalpy: "Exothermic",
        deltaH: -65.7, // kJ/mol
        activationEnergy: 20,
        description: "Soluble salts Silver Nitrate (AgNO₃) and Sodium Chloride (NaCl) dissolve fully in water. Upon mixing, Ag⁺ cations and Cl⁻ anions collide. Due to incredibly low solubility, they lock together in a crystal lattice to form solid white AgCl precipitate.",
        
        energyCurve: [
            { x: 0, y: 70, label: "Reactants" },
            { x: 30, y: 70 },
            { x: 50, y: 60, label: "Transition" },
            { x: 70, y: 95 },
            { x: 100, y: 95, label: "Products" }
        ],
        
        steps: [
            {
                index: 1,
                title: "Two Soluble Solutions",
                description: "Aqueous Silver Nitrate (AgNO₃) and Sodium Chloride (NaCl) solutions are ready. Silver ions (Ag⁺), Nitrate ions (NO₃⁻), Sodium ions (Na⁺), and Chloride ions (Cl⁻) are all separately solvated and floating around.",
                requiresTrigger: true,
                triggerText: "Mix Aqueous Solutions",
                triggerIcon: "🧪",
                timelinePos: 25
            },
            {
                index: 2,
                title: "Ionic Collisions",
                description: "Upon mixing, the ions undergo rapid thermal movement. When Na⁺ and NO₃⁻ collide, their hydration forces are too strong to bond. However, when Ag⁺ and Cl⁻ collide, their mutual electrostatic attraction overcomes water solvation shells.",
                requiresTrigger: false,
                timelinePos: 50
            },
            {
                index: 3,
                title: "Precipitate Nucleation",
                description: "Ag⁺ and Cl⁻ ions link together. They alternatingly lock into a tight, solid cubic ionic crystal lattice. Water molecules are pushed out of the bonding interfaces as the ionic solid grows larger and becomes completely insoluble.",
                requiresTrigger: false,
                timelinePos: 75
            },
            {
                index: 4,
                title: "Precipitation Settling",
                description: "The solid white Silver Chloride (AgCl) crystal becomes too heavy to remain suspended. It settles to the bottom of the vessel as a precipitate (↓). The sodium (Na⁺) and nitrate (NO₃⁻) ions remain dissolved in the supernatant as spectator ions.",
                requiresTrigger: false,
                timelinePos: 100
            }
        ]
    },
    "combustion": {
        id: "combustion",
        title: "Methane Combustion",
        subtitle: "Highly Exothermic Hydrocarbon Oxidation",
        equationHtml: "CH₄ + 2O₂ <span class='arrow'>→</span> CO₂ + 2H₂O",
        equationText: "CH4 + 2O2 -> CO2 + 2H2O",
        enthalpy: "Highly Exothermic",
        deltaH: -890.8, // kJ/mol
        activationEnergy: 190,
        description: "Methane gas (CH₄) reacts with oxygen (O₂) to undergo combustion. A high activation energy spark breaks the stable C-H and O=O bonds, leading to violent collision and formation of extremely stable double-bonded CO₂ and H₂O molecules with huge heat release.",
        
        energyCurve: [
            { x: 0, y: 65, label: "Reactants" },
            { x: 30, y: 65 },
            { x: 55, y: 10, label: "Transition (Spark)" },
            { x: 75, y: 135 },
            { x: 100, y: 135, label: "Products" }
        ],
        
        steps: [
            {
                index: 1,
                title: "Combustible Mixture",
                description: "Methane (CH₄ - tetrahedral structure with 4 carbon-hydrogen covalent single bonds) and Oxygen (O₂ - diatomic oxygen double bond) gases are mixed in the chamber. The bonds are too strong to break under normal ambient thermal energy.",
                requiresTrigger: true,
                triggerText: "Ignite Mixture (Spark)",
                triggerIcon: "🔥",
                timelinePos: 25
            },
            {
                index: 2,
                title: "Ignition & Bond Cleavage",
                description: "The thermal spark heats the gas, supplying the activation energy barrier (+190 kJ/mol). The molecules crash into each other violently. This breaks all four C-H bonds in methane and both O=O double bonds in the two oxygen molecules, yielding free, energetic C, H, and O atoms.",
                requiresTrigger: false,
                timelinePos: 55
            },
            {
                index: 3,
                title: "Exothermic Assembly",
                description: "The free carbon atom binds with two oxygen atoms to form double bonds ($C=O$). The four hydrogen atoms pair up with the remaining two oxygen atoms to form water ($H-O-H$). This restructuring releases vast energy because the new bonds are much stronger and more stable.",
                requiresTrigger: false,
                timelinePos: 75
            },
            {
                index: 4,
                title: "Product Release",
                description: "One linear Carbon Dioxide (CO₂) molecule and two bent Water (H₂O) vapor molecules fly apart at high kinetic speeds. The enormous energy release (ΔH = -890.8 kJ/mol) creates a hot flame. The products have much lower potential energy than the starting reactants.",
                requiresTrigger: false,
                timelinePos: 100
            }
        ]
    }
};
