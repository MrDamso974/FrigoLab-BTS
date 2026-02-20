window.FRIGOLAB_DATA = {
  refrigerants: [
    { name:"R134a", family:"HFC", safety:"A1", odp:0, gwp:1430, glide:"≈0 K", uses:"Froid commercial léger, auto (ancien)", notes:"Transition vers HFO / mélanges." },
    { name:"R404A", family:"HFC Blend", safety:"A1", odp:0, gwp:3922, glide:"faible", uses:"Froid négatif (ancien)", notes:"Fort GWP → remplacé par R448A/R449A." },
    { name:"R410A", family:"HFC Blend", safety:"A1", odp:0, gwp:2088, glide:"faible", uses:"Clim/HP (ancien)", notes:"Transition vers R32 / R454B etc." },

    { name:"R1234yf", family:"HFO", safety:"A2L", odp:0, gwp:4, glide:"≈0 K", uses:"Automobile", notes:"A2L → procédures adaptées." },
    { name:"R1234ze(E)", family:"HFO", safety:"A2L", odp:0, gwp:7, glide:"≈0 K", uses:"Chillers", notes:"A2L." },
    { name:"R513A", family:"HFO Blend", safety:"A1", odp:0, gwp:631, glide:"faible", uses:"Remplacement R134a", notes:"A1, GWP réduit." },
    { name:"R448A", family:"HFO Blend", safety:"A1", odp:0, gwp:"~1273", glide:"moyen", uses:"Remplacement R404A", notes:"Zeotropique : attention glide." },
    { name:"R449A", family:"HFO Blend", safety:"A1", odp:0, gwp:"~1397", glide:"moyen", uses:"Remplacement R404A", notes:"Proche R448A selon cas." },

    { name:"R744 (CO₂)", family:"Naturel", safety:"A1", odp:0, gwp:1, glide:"≈0 K", uses:"Transcritique, supermarchés", notes:"Très hautes pressions." },
    { name:"R717 (NH₃)", family:"Naturel", safety:"B2L", odp:0, gwp:0, glide:"≈0 K", uses:"Industrie", notes:"Toxique → détecteurs & locaux." },
    { name:"R290 (Propane)", family:"Naturel", safety:"A3", odp:0, gwp:3, glide:"≈0 K", uses:"Petits systèmes", notes:"Très inflammable (A3)." },
    { name:"R600a (Isobutane)", family:"Naturel", safety:"A3", odp:0, gwp:3, glide:"≈0 K", uses:"Domestique", notes:"A3 très courant." },

    { name:"R22", family:"HCFC", safety:"A1", odp:0.055, gwp:1810, glide:"≈0 K", uses:"Ancien parc", notes:"Phase-out selon réglementation." }
  ],

  systems: [
    { title:"Compression de vapeur (DX)", icon:"🔁", text:"Compresseur → condenseur → détendeur → évaporateur. Le fluide évapore à basse pression (absorbe Q) et condense à haute pression (rejette Q)." },
    { title:"Détente directe vs indirecte", icon:"🧊", text:"DX : fluide frigorigène dans l’évaporateur. Indirect : fluide secondaire (eau glycolée) transporte le froid." },
    { title:"Booster CO₂ (transcritique)", icon:"🚀", text:"Architecture supermarché : étages BP/HP, régulation HP gas cooler, récupération chaleur possible." },
    { title:"Cascade", icon:"🪜", text:"Deux cycles : un cycle bas T° condense via un autre cycle plus haut T°." },
    { title:"Chiller", icon:"💧", text:"Production d’eau glacée : évaporateur côté eau, distribution hydraulique (pompes, vannes, échangeurs)." },
    { title:"Pompe à chaleur (PAC)", icon:"♨️", text:"Cycle inversable : chauffage, dégivrage, régulation, COP saisonnier." }
  ],

  components: {
    condensers: [
      { name:"Air (ventilé)", notes:"Batterie + ventilateurs. Attention encrassement & débit d’air." },
      { name:"Eau (tubulaire/plaques)", notes:"Très efficace. Nécessite traitement d’eau (entartrage/corrosion)." },
      { name:"Évaporatif", notes:"Très bon rendement. Maintenance stricte (hygiène, dépôts)." },
      { name:"Gas cooler (CO₂)", notes:"Au-dessus du point critique : pas de condensation, rejet dans refroidisseur gaz." }
    ],
    expansion: [
      { name:"Capillaire", notes:"Simple, pas de régulation active (domestique)." },
      { name:"TXV (thermostatique)", notes:"Régule surchauffe. Bulbe + égalisation interne/externe." },
      { name:"EEV (électronique)", notes:"Très précis, utile CO₂/chillers/VRF. Besoin contrôleur." }
    ],
    evaporators: [
      { name:"Batterie à air (ventilé)", notes:"Vitrines, chambres froides. Dégivrage électrique/gaz chaud." },
      { name:"Échangeur à plaques", notes:"Chillers. Compact, bon transfert." },
      { name:"Noyé (flooded)", notes:"Industrie : rendement élevé, régulation niveau." }
    ],
    compressors: [
      { name:"Hermétique (piston/rotatif/scroll)", notes:"Petit/moyen. Moteur dans la coque." },
      { name:"Semi-hermétique", notes:"Réparable, courant en commercial." },
      { name:"Ouvert", notes:"Grosses puissances, maintenance plus lourde." },
      { name:"Vis (screw)", notes:"Industrie, grandes puissances, bon en charge variable." },
      { name:"Centrifuge", notes:"Très grandes puissances (chillers), plage de fonctionnement spécifique." }
    ],
    essentials: [
      "Filtre déshydrateur (liquide)",
      "Voyant liquide (indicateur humidité)",
      "Électrovanne liquide (pump-down si besoin)",
      "Pressostats HP/BP (ou capteurs + contrôleur)",
      "Soupapes de sécurité (selon réglementation)",
      "Accumulateur d’aspiration (protection retour liquide)",
      "Séparateur d’huile + gestion retour (industrie/CO₂)",
      "Réservoir liquide (bouteille)",
      "Vannes de service, prises pression",
      "Sondes T°/P (diagnostic & régulation)"
    ]
  },

  diagnostics: [
    { symptom:"Surchauffe trop élevée", causes:["Manque de charge","Restriction ligne liquide","TXV sous-alimente / bulbe mal posé","Débit d’air évapo faible"], actions:["Contrôle fuite + recharge","Mesure ΔP filtre","Vérifier bulbe/isolation","Nettoyage batterie/ventilos"] },
    { symptom:"Surchauffe trop faible (retour liquide)", causes:["Surcharge","TXV trop ouvert","EEV mal réglée","Charge thermique faible"], actions:["Ajuster charge","Réglage détendeur","Vérifier régulation","Contrôler fonctionnement global"] },
    { symptom:"HP élevée", causes:["Condenseur encrassé","Débit air/eau insuffisant","Surcharge","Non condensables"], actions:["Nettoyage","Vérifier ventilateurs/eau","Ajuster charge","Procédure correcte"] },
    { symptom:"BP basse / manque puissance", causes:["Restriction","Manque de charge","Givre évapo / débit air faible","Détendeur bloqué"], actions:["Trouver restriction","Test fuite","Dégivrer/nettoyer","Contrôler détendeur"] }
  ]
};