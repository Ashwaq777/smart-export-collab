import { createContext, useContext, useState } from 'react'

// Service MyMemory API
const translateText = async (text, targetLang) => {
  if (!text || targetLang === 'fr') return text
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=fr|${targetLang}` 
    )
    const data = await response.json()
    return data.responseData?.translatedText || text
  } catch {
    return text
  }
}

export { translateText }

const translations = {
  fr: {
    nav: {
      home: 'Accueil', calculator: 'Calculateur', traceability: 'Traçabilité',
      marketplace: 'Marketplace', transactions: 'Transactions', documents: 'Documents EIR',
      tracking: 'Suivi des navires', support: 'Support', about: 'À propos',
      admin: 'Administration', profile: 'Mon Profil', logout: 'Déconnexion', simulation: 'Simuler'
    },
    login: {
      title: 'Connexion à votre compte', subtitle: 'Accédez à votre espace Smart Export Global',
      forgotPassword: 'Mot de passe oublié ?', register: "S'inscrire",
      connecting: 'Connexion...', connect: 'Se connecter',
      errorCredentials: 'Email ou mot de passe incorrect'
    },
    modal: {
      newRequest: "Nouvelle Demande de Conteneur",
      newOffer: "Nouvelle Offre de Conteneur",
      country: "Pays",
      selectCountry: "-- Sélectionner pays --",
      loadingPort: "Port de Chargement",
      selectPort: "-- Sélectionner port --",
      containerType: "Type de Conteneur",
      cargoType: "Type de Cargaison",
      requiredDate: "Date Requise",
      availableDate: "Date Disponible",
      size: "Taille",
      standard: "Standard",
      highCube: "High Cube",
      reefer: "Reefer",
      technicalDetails: "Détails Techniques",
      photos: "Photos du conteneur",
      createRequest: "Créer la demande",
      createOffer: "Créer l'offre",
      creating: "Création...",
      loadingCountries: "Chargement des pays...",
      loadingPorts: "Chargement des ports..."
    },
    admin: {
      overview: "Vue d'ensemble",
      users: "Utilisateurs",
      countries: "Pays",
      ports: "Ports",
      tariffs: "Tarifs",
      claims: "Réclamations",
      containers: "Conteneurs",
      search: "Rechercher...",
      block: "Bloquer",
      unblock: "Débloquer",
      totalUsers: "Total Utilisateurs",
      activeOffers: "Offres Actives",
      transactions: "Transactions",
      pendingTickets: "Tickets en attente",
      activeUsers: "Utilisateurs actifs",
      blockedUsers: "Utilisateurs bloqués",
      totalMatches: "Total Matchings",
      recentTransactions: "Transactions récentes",
      noTransactions: "Aucune transaction",
      searchUser: "Rechercher utilisateur...",
      role: "Rôle",
      status: "Statut",
      active: "Actif",
      blocked: "Bloqué",
      email: "Email",
      name: "Nom",
      portName: "Nom du port",
      country: "Pays",
      unlocode: "Code UNLOCODE",
      portFees: "Frais portuaires",
      addPort: "Ajouter un port",
      editPort: "Modifier le port",
      noClaims: "Aucune réclamation",
      reply: "Répondre",
      sendReply: "Envoyer la réponse",
      replyPlaceholder: "Votre réponse...",
      usersManagement: {
        title: "Gestion des utilisateurs",
        columns: {
          avatarName: "Avatar + Nom",
          email: "Email", 
          role: "Rôle",
          status: "Statut",
          company: "Entreprise",
          country: "Pays",
          actions: "Actions",
          createdAt: "Date création"
        },
        actions: {
          detail: "Détail",
          block: "Bloquer",
          unblock: "Débloquer",
          delete: "Supprimer",
          confirmDelete: "Confirmer la suppression",
          confirmBlock: "Confirmer le blocage"
        },
        search: "Rechercher par email ou rôle...",
        refresh: "Actualiser",
        results: "utilisateur(s) affiché(s) sur",
        notSpecified: "Non renseigné"
      },
      stats: {
        importers: "Importateurs",
        exporters: "Exportateurs", 
        active: "↑ actif"
      },
      sidebar: {
        marketplace: "Marketplace",
        exchangeRates: "Taux de change",
        administration: "Administration",
        logout: "Déconnexion"
      },
      header: {
        title: "Admin Dashboard",
        subtitle: "Gestion de la plateforme Smart Export Global"
      },
      countriesManagement: {
        title: "Gestion des pays",
        columns: {
          flag: "Drapeau",
          code: "Code",
          name: "Pays", 
          region: "Région",
          currency: "Devise",
          customsDuty: "Douane %",
          vat: "TVA %",
          parafiscal: "Parafiscal %",
          fees: "Frais",
          actions: "Actions"
        },
        search: "Rechercher un pays...",
        refresh: "Actualiser",
        edit: "Modifier",
        form: {
          customsDuty: "Droits Douane %",
          vat: "TVA %",
          parafiscal: "Taxe Parafiscale %",
          portFees: "Frais Portuaires"
        }
      },
      portsManagement: {
        title: "Gestion des ports",
        count: "ports",
        columns: {
          name: "Nom",
          country: "Pays",
          code: "Code", 
          fees: "Frais",
          type: "Type",
          actions: "Actions"
        },
        search: "Rechercher port ou pays...",
        refresh: "Actualiser",
        edit: "Modifier",
        form: {
          portName: "Nom du port",
          portCode: "Code port",
          feesEur: "Frais EUR",
          type: "Type"
        }
      },
      rates: {
        title: "Taux de change",
        columns: {
          currency: "Devise",
          code: "Code",
          rate: "Taux vs USD",
          symbol: "Symbole",
          updatedAt: "Mise à jour",
          actions: "Actions"
        },
        search: "Rechercher une devise...",
        refresh: "Actualiser",
        edit: "Modifier"
      },
      transactionsList: {
        title: "Transactions récentes",
        columns: {
          id: "ID",
          client: "Client",
          type: "Type",
          amount: "Montant",
          status: "Statut",
          date: "Date",
          provider: "Provider",
          seeker: "Seeker"
        },
        completed: "COMPLETED",
        na: "N/A"
      },
      claimsManagement: {
        title: "Réclamations",
        columns: {
          user: "Utilisateur",
          subject: "Sujet",
          category: "Catégorie",
          priority: "Priorité",
          status: "Statut", 
          date: "Date",
          actions: "Actions"
        },
        actions: {
          respond: "Répondre"
        },
        priority: {
          low: "Faible",
          medium: "Moyen",
          high: "Élevé",
          urgent: "Urgent"
        },
        modal: {
          title: "Répondre à la réclamation",
          subject: "Sujet",
          response: "Réponse",
          placeholder: "Tapez votre réponse...",
          send: "Envoyer",
          cancel: "Annuler"
        },
        statusOptions: {
          open: "Ouvert",
          inProgress: "En cours", 
          resolved: "Résolu",
          closed: "Fermé"
        }
      },
      userDetail: {
        title: "Détails de l'utilisateur",
        fields: {
          fullName: "Nom complet",
          email: "Email",
          phone: "Téléphone",
          company: "Entreprise",
          country: "Pays",
          role: "Rôle",
          accountStatus: "Statut du compte",
          createdAt: "Date de création",
          lastLogin: "Dernière connexion"
        },
        close: "Fermer"
      },
      modals: {
        editCountry: "Modifier",
        editPort: "Modifier Port",
        save: "Enregistrer",
        cancel: "Annuler"
      },
      alerts: {
        roleUpdated: "Role mis a jour",
        statusUpdated: "Statut mis a jour", 
        userDeleted: "Utilisateur supprime",
        countryUpdated: "Pays mis à jour",
        portUpdated: "Port mis à jour",
        responseSent: "Réponse envoyée",
        error: "Erreur"
      },
      marketplace: {
        title: "Marketplace",
        activeOffers: "Offres actives",
        inactiveOffers: "Offres inactives",
        byType: "Répartition par type",
        byCountry: "Répartition par pays",
        containerList: "Liste des conteneurs",
        columns: {
          id: "ID",
          type: "Type",
          country: "Pays",
          owner: "Propriétaire",
          email: "Email",
          status: "Statut",
          actions: "Actions"
        },
        actions: {
          deactivate: "Désactiver",
          activate: "Activer",
          delete: "Supprimer"
        },
        confirmDeactivate: "Désactiver ce conteneur ?"
      },
      offer: {
        number: "Numéro",
        condition: "État",
        year: "Année",
        status: "Statut"
      },
      exchangeRates: {
        title: "Taux de change",
        searchPlaceholder: "Rechercher une devise...",
        refresh: "Actualiser",
        columns: {
          currency: "Devise",
          code: "Code",
          rateVsUsd: "Taux vs USD",
          symbol: "Symbole",
          updatedAt: "Mise à jour",
          actions: "Actions"
        },
        actions: {
          edit: "Modifier"
        }
      }
    },
    register: {
      title: 'Créer un compte', subtitle: 'Rejoignez Smart Export Global',
      firstName: 'Prénom', lastName: 'Nom', emailLabel: 'Email', phone: 'Téléphone',
      birthDate: 'Date de naissance', company: 'Entreprise', country: 'Pays', role: 'Rôle',
      passwordSection: 'Mot de passe', confirmPassword: 'Confirmer le mot de passe',
      personalInfo: 'Informations personnelles', professionalInfo: 'Informations professionnelles',
      createAccount: 'Créer mon compte', creating: 'Création...', error: 'Erreur lors de la création',
      hasAccount: 'Déjà un compte ? Se connecter'
    },
    home: {
      hero: {
        badge: 'Plateforme B2B Maritime',
        title: 'Optimisez votre logistique de conteneurs',
        subtitle: 'Connectez importateurs et exportateurs pour maximiser l\'utilisation des conteneurs maritimes',
        ctaStart: 'Commencer maintenant',
        ctaLearn: 'En savoir plus',
        countries: 'Pays',
        products: 'Produits',
        accuracy: 'Précision',
        maritimeShipping: 'Transport Maritime',
        portCosts: 'Coûts portuaires en temps réel',
        customsDuties: 'Droits de douane',
        accurateCalc: 'Calculs précis',
        globalCoverage: 'Couverture mondiale',
        countriesCount: '150+ pays'
      }
    },
    marketplace: {
      title: 'Marketplace Maritime', subtitle: 'Trouvez le conteneur idéal pour votre expédition',
      search: 'Rechercher...', allTypes: 'Tous les types', allCargo: 'Toutes les cargaisons',
      myOffers: 'Mes Offres', myRequests: 'Mes Demandes', myMatches: 'Mes Correspondances',
      map: 'Carte', newOffer: '+ Créer une offre', newRequest: '+ Nouvelle Demande',
      available: 'Disponible', noOffers: 'Aucune offre disponible',
      deleteOffer: 'Supprimer cette offre ?', deleteRequest: 'Supprimer cette demande ?',
      confirmMatch: 'Confirmer cette correspondance ?', loading: 'Chargement...',
      importer: 'Importateur', deleteDirectRequest: 'Supprimer cette demande directe ?',
      noContainerAvailable: 'Aucun conteneur disponible', noOfferPublished: 'Aucune offre publiée',
      viewDetails: 'Voir les détails', edit: 'Modifier', delete: 'Supprimer',
      matchesFound: 'correspondance(s) trouvée(s) !',
      matchesAlreadyFound: 'Correspondances déjà trouvées. Consultez Mes Correspondances.',
      noMatchFound: '❌ Aucune correspondance trouvée. Essayez un autre type de conteneur.',
      noDirectRequest: 'Aucune demande directe envoyée',
      noDirectRequestDesc: 'Envoyez des demandes directes aux importateurs depuis le marketplace',
      noMatchRequest: 'Aucune requête de matching',
      noMatchRequestDesc: 'Créez des requêtes pour trouver des offres correspondantes',
      searching: '⏳ Recherche...', findMatches: '🎯 Trouver correspondances',
      noMatches: 'Aucune correspondance', noMatchesDesc: 'Les correspondances apparaissent ici via le matchmaking',
      compatible: 'compatible', noRequestReceived: 'Aucune demande reçue',
      noRequestReceivedDesc: 'Les demandes directes apparaîtront ici',
      noMatchesImporterDesc: 'Les correspondances apparaissent quand des exportateurs trouvent vos offres',
      directRequestTo: 'Demande directe à', noDate: 'Date non spécifiée',
      accepted: 'Acceptée', pending: 'En attente', rejected: 'Refusée',
      details: 'Détails', offer: 'Offre', request: 'Demande',
      sendRequest: 'Envoyer une demande'
    },
    requestForm: {
      title: 'Envoyer une demande',
      subtitle: 'Le provider recevra un email avec votre demande',
      message: 'Message',
      messagePlaceholder: 'Décrivez votre besoin, la marchandise, les conditions...',
      company: 'Entreprise (optionnel)',
      companyPlaceholder: 'Nom de votre entreprise',
      date: 'Date souhaitée (optionnel)',
      submit: 'Envoyer la demande',
      back: 'Retour'
    },
    offerDetail: {
      number: "Numéro",
      condition: "État",
      year: "Année",
      status: "Statut"
    },
    transactions: {
      title: 'Transactions', subtitle: 'Suivez vos échanges de conteneurs',
      status: {
        AT_PROVIDER: 'Chez fournisseur', IN_TRANSIT: 'En transit',
        DELIVERED: 'Livré', LOADING: 'Chargement', COMPLETED: 'Terminé'
      },
      actionsDocuments: 'Actions et Documents',
      uploadEir: 'Déposer EIR',
      downloadEir: 'Télécharger EIR',
      waitingEir: 'En attente EIR',
      eirAvailable: "EIR disponible",
      advance: "Avancer",
      provider: "Fournisseur",
      seeker: "Demandeur",
      role: "Rôle"
    },
    support: {
      title: 'Support & Réclamations', newTicket: 'Nouveau ticket', subject: 'Sujet',
      description: 'Description', submit: 'Soumettre', loading: 'Chargement...',
      validation: 'Sujet et description obligatoires', noTickets: 'Aucun ticket',
      subtitle: 'Notre équipe est là pour vous aider',
      signaler: 'Signalez un problème ou réclamation',
      createdAt: 'Créé le', reply: 'Répondre', close: 'Fermer',
      replyPlaceholder: 'Votre réponse...', sendReply: 'Envoyer la réponse',
      category: 'Catégorie', priority: 'Priorité',
      reclamation: 'Réclamation',
      status: { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu' }
    },
    footer: {
      title: 'Smart Export Global',
      description: 'Plateforme B2B de logistique maritime',
      rights: ' 2024 Smart Export Global. Tous droits réservés.',
      links: { marketplace: 'Marketplace', transactions: 'Transactions',
               support: 'Support', about: 'À propos' }
    },
    calculator: {
      title: 'Calculateur de Coûts', subtitle: 'Estimez vos coûts d\'importation/exportation',
      productInfo: "Informations du produit",
      basicInfo: "Informations de base", 
      financialInfo: "Informations financières",
      legalInfo: "Informations légales",
      additionalInfo: "Informations complémentaires",
      fobValue: "Valeur FOB marchandise",
      transportCost: "Coût de transport",
      insurance: "Assurance",
      currency: "Devise",
      category: "Catégorie",
      destination: "Destination",
      unloadingPort: "Port de déchargement",
      product: "Produit",
      companyName: "Nom Entreprise",
      rc: "Registre Commerce (RC)",
      ice: "ICE",
      incoterm: "Incoterm",
      netWeight: "Poids Net (kg)",
      grossWeight: "Poids Brut (kg)",
      calculate: "Calculer",
      selectCategory: "Sélectionnez une catégorie",
      selectDestination: "Sélectionner pays de destination",
      selectPort: "Sélectionner port de déchargement",
      selectProduct: "Sélectionner produit",
      autoCalculated: "Calculé automatiquement",
      profitAnalysis: "Pour analyse de rentabilité",
      sellingPrice: "Prix de vente prévisionnel (optionnel)",
      unitType: "Type Unité",
      unitTypePlaceholder: "Type Unité (ex: conteneur 40)",
      paysDepart: "Pays de départ",
      portDepart: "Port de départ",
      selectDepartureCountry: "-- Pays de départ --",
      selectCountry: "-- Sélectionner pays --",
      loadingCountries: "-- Chargement pays --",
      readyTitle: "Prêt à calculer ?",
      readyText: "Remplissez le formulaire pour estimer vos coûts d'importation/exportation",
      costBreakdown: "Détail des Coûts",
      item: "Description",
      amount: "Montant",
      rate: "Taux",
      valeurFob: "Valeur FOB",
      transport: "Transport",
      assurance: "Assurance",
      cifValue: "Valeur CIF",
      droitsDouane: "Droits de douane",
      tva: "TVA",
      fraisPortuaires: "Frais portuaires",
      totalLanded: "COÛT TOTAL (Landed Cost)",
      sensitivityAnalysis: "Analyse de Sensibilité Devises",
      sensitivityDesc: "Impact d'une variation de ±2% du taux de change sur le coût total",
      variationPlus: "Variation +2%",
      variationMinus: "Variation -2%",
      equivalentEur: "Équivalent EUR",
      currencyLabel: "Devise",
      taxWarning: "Taux douaniers estimés (source: OMC/WTO moyennes MFN)",
      taxWarningDesc: "Taux douaniers estimés basés sur les moyennes OMC/WTO MFN. Pour une précision maximale, consultez les autorités douanières de",
      disclaimer: "Estimation basée sur flux réels et tarifs officiels en vigueur au",
      disclaimerSource: "Source taux de change: ExchangeRate-API",
      totalDouane: "TOTAL DOUANE",
      totalTva: "TOTAL TVA",
      taxeParafiscale: "TAXE PARAFISCALE",
      fraisPortuairesCard: "FRAIS PORTUAIRES",
      profitabilityAnalysis: "Analyse de Rentabilité",
      projectedSellingPrice: "Prix de Vente Prévisionnel",
      netMargin: "Marge Nette",
      indicator: "Indicateur",
      sivAlert: "⚠️ Alerte Sécurité Douanière (SIV)",
      currentCifValue: "Valeur CAF actuelle",
      minSivEntryPrice: "Prix d'entrée SIV minimum",
      productLabel: "Produit",
      destinationLabel: "Destination",
      portLabel: "Port"
    },
    carbon: {
      checkbox: "Ajouter le calcul carbone",
      title: "Empreinte Carbone",
      co2: "Empreinte CO₂",
      equation: "Détail du calcul",
      cbam: "Taxe CBAM estimée",
      loading: "Calcul en cours...",
      error: "Erreur lors du calcul carbone",
      formula: "Formule",
      download: "Télécharger le certificat carbone",
      subtype: {
        label: "Type de navire",
        placeholder: "-- Type général (0.025) --",
        container_ship: "Porte-conteneurs",
        bulk_carrier: "Vrac (Bulk carrier)",
        tanker: "Tanker",
        ferry: "Ferry"
      },
      mode: {
        label: "Mode de transport",
        maritime: "Maritime",
        road: "Routier",
        air: "Aérien",
        rail: "Ferroviaire"
      }
    },
    pdf: {
      carbon: {
        title: "CERTIFICAT CARBONE EXPORT",
        subtitle: "Smart Export Global — Empreinte Carbone",
        shipment: "Détails de l'expédition",
        origin: "Origine",
        destination: "Destination",
        weight: "Poids",
        mode: "Mode de transport",
        maritime: "Maritime",
        road: "Routier",
        air: "Aérien",
        rail: "Ferroviaire",
        distance: "Distance calculée",
        results: "Résultats",
        co2total: "Empreinte CO₂ totale",
        methodology: "Méthodologie",
        formula: "Formule",
        financial: "Informations financières",
        cbam: "Taxe CBAM estimée",
        disclaimer: "Valeur indicative. Source : EU ETS. 85 €/tonne CO₂.",
        generated: "Généré le"
      }
    },
    traceability: {
      title: 'Traçabilité', subtitle: 'Suivez vos expéditions en temps réel',
      search: 'Rechercher une expédition...', noResults: 'Aucun résultat',
      loading: 'Chargement...', status: 'Statut',
      new: 'Nouveau', newForm: 'Nouveau Formulaire', records: 'Enregistrements', history: 'Historique',
      productIdentification: 'Identification du Produit',
      originProduction: 'Origine & Production',
      shipment: 'Expédition',
      reception: 'Réception',
      euImport: 'Importation UE',
      documents: 'Documents & Références',
      save: 'Enregistrer', saving: 'Enregistrement...',
      cancel: 'Annuler', newLot: 'Nouveau lot',
      exportExcel: 'Exporter Excel',
      // Sections A-J
      sectionA: 'A. Métadonnées Système',
      sectionB: 'B. Identification Produit',
      sectionC: 'C. Origine & Production',
      sectionD: 'D. Expédition',
      sectionE: 'E. Réception',
      sectionF: 'F. Import UE',
      sectionG: 'G. Documents',
      sectionH: 'H. Liaison de Traçabilité',
      sectionI: 'I. Validation & Conformité',
      sectionJ: 'J. Documents & Signature officielle',
      // Field labels
      recordId: 'ID Enregistrement',
      creationDate: 'Date/heure création',
      creatorUser: 'Utilisateur créateur',
      formVersion: 'Version formulaire',
      initialStatus: 'Statut initial',
      conformity: 'Conformité',
      autoGenerated: 'Auto-généré',
      connectedUser: 'Utilisateur connecté',
      tlc: 'Traceability Lot Code (TLC)*',
      productDesc: 'Description Produit*',
      gtin: 'GTIN (14 chiffres)',
      commercialLot: 'Lot Commercial*',
      sanitaryLot: 'Lot Sanitaire*',
      quantity: 'Quantité',
      unit: 'Unité',
      originCountry: 'Pays d\'origine*',
      productionSite: 'Site de production – nom*',
      productionAddress: 'Site de production – adresse*',
      sanitaryApproval: 'N° Agrément Sanitaire',
      productionDate: 'Date de production*',
      harvestDate: 'Date de récolte*',
      producer: 'Producteur',
      plot: 'Parcelle',
      treatments: 'Traitements',
      senderName: 'Nom expéditeur*',
      senderAddress: 'Adresse expéditeur*',
      senderGln: 'GLN expéditeur',
      shipmentDate: 'Date & heure expédition*',
      transport: 'Moyen de transport',
      temperature: 'Température transport (°C)',
      recipientName: 'Nom destinataire*',
      recipientAddress: 'Adresse destinataire*',
      recipientGln: 'GLN destinataire',
      receptionDate: 'Date & heure réception*',
      destination: 'Destination',
      euOperator: 'Opérateur responsable UE',
      euAddress: 'Adresse opérateur UE',
      eori: 'Numéro EORI',
      docType: 'Type de document',
      docNumber: 'Numéro document*',
      sanitaryCert: 'Certificat sanitaire',
      lot: 'Lot de référence',
      glnCreator: 'GLN Créateur du TLC (13 chiffres) — FSMA 204',
      sourceSystem: 'Système Source — Audit',
      certifyText: '✅ Je certifie que toutes les données saisies sont exactes, complètes et conformes aux réglementations FSMA 204 (US) et à la réglementation européenne applicable.',
      responsibleSig: 'Signature électronique responsable',
      validationDate: 'Date de validation',
      draft: 'BROUILLON',
      validated: 'VALIDÉ',
      locked: 'VERROUILLÉ',
      mainDoc: 'Document principal',
      scannedSig: 'Signature scannée',
      dropFile: 'Glissez-déposez un fichier ici',
      dropSig: 'Glissez-déposez votre signature',
      filters: '🔍 Filtres',
      startDate: 'Date début',
      endDate: 'Date fin',
      loadFilter: 'Charger / Filtrer',
      exportAll: 'Export Excel (tout)',
      exportSelection: 'Exporter la sélection',
      // Additional keys for history and tables
      date: 'Date',
      action: 'Action',
      user: 'Utilisateur',
      details: 'Détails',
      noHistory: 'Aucun historique',
      identifier: 'Identifiant',
      parcel: 'Parcelle',
      docs: 'Docs'
    },
    eir: {
      title: 'Documents EIR', upload: 'Téléverser un document',
      download: 'Télécharger', noDocuments: 'Aucun document disponible',
      loading: 'Chargement...', subtitle: 'Equipment Interchange Receipts - Vos documents logistiques',
      loadError: 'Erreur lors du chargement des documents EIR', downloadError: 'Erreur lors du téléchargement du document',
      uploadSuccess: '✅ Document EIR téléversé avec succès', uploadError: 'Erreur lors du téléversement du document',
      deleteSuccess: '✅ Document EIR supprimé avec succès', deleteError: 'Erreur lors de la suppression du document',
      deleteConfirm: 'Supprimer ce document EIR ?', noDocumentsText: 'Les documents EIR apparaissent ici une fois que les transactions sont confirmées et les documents téléversés.'
    },
    common: {
      save: 'Enregistrer', cancel: 'Annuler', confirm: 'Confirmer', delete: 'Supprimer',
      edit: 'Modifier', loading: 'Chargement...', error: 'Une erreur est survenue',
      success: 'Opération réussie', back: 'Retour', next: 'Suivant', submit: 'Soumettre'
    }
  },
  en: {
    nav: {
      home: 'Home', calculator: 'Calculator', traceability: 'Traceability',
      marketplace: 'Marketplace', transactions: 'Transactions', documents: 'EIR Documents',
      tracking: 'Vessel Tracking', support: 'Support', about: 'About',
      admin: 'Administration', profile: 'My Profile', logout: 'Logout', simulation: 'Simulate'
    },
    login: {
      title: 'Login to your account', subtitle: 'Access your Smart Export Global space',
      forgotPassword: 'Forgot password?', register: 'Sign up',
      connecting: 'Connecting...', connect: 'Sign in',
      errorCredentials: 'Incorrect email or password'
    },
    modal: {
      newRequest: "New Container Request",
      newOffer: "New Container Offer",
      country: "Country",
      selectCountry: "-- Select country --",
      loadingPort: "Loading Port",
      selectPort: "-- Select port --",
      containerType: "Container Type",
      cargoType: "Cargo Type",
      requiredDate: "Required Date",
      availableDate: "Available Date",
      size: "Size",
      standard: "Standard",
      highCube: "High Cube",
      reefer: "Reefer",
      technicalDetails: "Technical Details",
      photos: "Container photos",
      createRequest: "Create request",
      createOffer: "Create offer",
      creating: "Creating...",
      loadingCountries: "Loading countries...",
      loadingPorts: "Loading ports..."
    },
    admin: {
      overview: "Overview",
      users: "Users",
      countries: "Countries",
      ports: "Ports",
      tariffs: "Tariffs",
      claims: "Claims",
      containers: "Containers",
      search: "Search...",
      block: "Block",
      unblock: "Unblock",
      totalUsers: "Total Users",
      activeOffers: "Active Offers",
      transactions: "Transactions",
      pendingTickets: "Pending Tickets",
      activeUsers: "Active users",
      blockedUsers: "Blocked users",
      totalMatches: "Total Matches",
      recentTransactions: "Recent transactions",
      noTransactions: "No transactions",
      searchUser: "Search user...",
      role: "Role",
      status: "Status",
      active: "Active",
      blocked: "Blocked",
      email: "Email",
      name: "Name",
      portName: "Port name",
      country: "Country",
      unlocode: "UNLOCODE",
      portFees: "Port fees",
      addPort: "Add port",
      editPort: "Edit port",
      noClaims: "No claims",
      reply: "Reply",
      sendReply: "Send reply",
      replyPlaceholder: "Your reply...",
      usersManagement: {
        title: "User Management",
        columns: {
          avatarName: "Avatar + Name",
          email: "Email", 
          role: "Role",
          status: "Status",
          company: "Company",
          country: "Country",
          actions: "Actions",
          createdAt: "Creation Date"
        },
        actions: {
          detail: "Detail",
          block: "Block",
          unblock: "Unblock",
          delete: "Delete",
          confirmDelete: "Confirm deletion",
          confirmBlock: "Confirm block"
        },
        search: "Search by email or role...",
        refresh: "Refresh",
        results: "user(s) shown out of",
        notSpecified: "Not specified"
      },
      stats: {
        importers: "Importers",
        exporters: "Exporters", 
        active: "↑ active"
      },
      sidebar: {
        marketplace: "Marketplace",
        exchangeRates: "Exchange Rates",
        administration: "Administration",
        logout: "Logout"
      },
      header: {
        title: "Admin Dashboard",
        subtitle: "Smart Export Global Platform Management"
      },
      countriesManagement: {
        title: "Country Management",
        columns: {
          flag: "Flag",
          code: "Code",
          name: "Country", 
          region: "Region",
          currency: "Currency",
          customsDuty: "Customs %",
          vat: "VAT %",
          parafiscal: "Parafiscal %",
          fees: "Fees",
          actions: "Actions"
        },
        search: "Search a country...",
        refresh: "Refresh",
        edit: "Edit",
        form: {
          customsDuty: "Customs Duty %",
          vat: "VAT %",
          parafiscal: "Parafiscal Tax %",
          portFees: "Port Fees"
        }
      },
      portsManagement: {
        title: "Port Management",
        count: "ports",
        columns: {
          name: "Name",
          country: "Country",
          code: "Code", 
          fees: "Fees",
          type: "Type",
          actions: "Actions"
        },
        search: "Search port or country...",
        refresh: "Refresh",
        edit: "Edit",
        form: {
          portName: "Port Name",
          portCode: "Port Code",
          feesEur: "Fees EUR",
          type: "Type"
        }
      },
      rates: {
        title: "Exchange Rates",
        columns: {
          currency: "Currency",
          code: "Code",
          rate: "Rate vs USD",
          symbol: "Symbol",
          updatedAt: "Updated",
          actions: "Actions"
        },
        search: "Search a currency...",
        refresh: "Refresh",
        edit: "Edit"
      },
      transactionsList: {
        title: "Recent Transactions",
        columns: {
          id: "ID",
          client: "Client",
          type: "Type",
          amount: "Amount",
          status: "Status",
          date: "Date",
          provider: "Provider",
          seeker: "Seeker"
        },
        completed: "COMPLETED",
        na: "N/A"
      },
      claimsManagement: {
        title: "Claims",
        columns: {
          user: "User",
          subject: "Subject",
          category: "Category",
          priority: "Priority",
          status: "Status", 
          date: "Date",
          actions: "Actions"
        },
        actions: {
          respond: "Respond"
        },
        priority: {
          low: "Low",
          medium: "Medium",
          high: "High",
          urgent: "Urgent"
        },
        modal: {
          title: "Respond to Claim",
          subject: "Subject",
          response: "Response",
          placeholder: "Type your response...",
          send: "Send",
          cancel: "Cancel"
        },
        statusOptions: {
          open: "Open",
          inProgress: "In Progress", 
          resolved: "Resolved",
          closed: "Closed"
        }
      },
      userDetail: {
        title: "User Details",
        fields: {
          fullName: "Full Name",
          email: "Email",
          phone: "Phone",
          company: "Company",
          country: "Country",
          role: "Role",
          accountStatus: "Account Status",
          createdAt: "Creation Date",
          lastLogin: "Last Login"
        },
        close: "Close"
      },
      modals: {
        editCountry: "Edit",
        editPort: "Edit Port",
        save: "Save",
        cancel: "Cancel"
      },
      alerts: {
        roleUpdated: "Role updated",
        statusUpdated: "Status updated", 
        userDeleted: "User deleted",
        countryUpdated: "Country updated",
        portUpdated: "Port updated",
        responseSent: "Response sent",
        error: "Error"
      },
      marketplace: {
        title: "Marketplace",
        activeOffers: "Active Offers",
        inactiveOffers: "Inactive Offers",
        byType: "Distribution by Type",
        byCountry: "Distribution by Country",
        containerList: "Container List",
        columns: {
          id: "ID",
          type: "Type",
          country: "Country",
          owner: "Owner",
          email: "Email",
          status: "Status",
          actions: "Actions"
        },
        actions: {
          deactivate: "Deactivate",
          activate: "Activate",
          delete: "Delete"
        },
        confirmDeactivate: "Deactivate this container?"
      },
      offer: {
        number: "Number",
        condition: "Condition",
        year: "Year",
        status: "Status"
      },
      exchangeRates: {
        title: "Exchange Rates",
        searchPlaceholder: "Search currency...",
        refresh: "Refresh",
        columns: {
          currency: "Currency",
          code: "Code",
          rateVsUsd: "Rate vs USD",
          symbol: "Symbol",
          updatedAt: "Updated At",
          actions: "Actions"
        },
        actions: {
          edit: "Edit"
        }
      }
    },
    register: {
      title: 'Create an account', subtitle: 'Join Smart Export Global',
      firstName: 'First name', lastName: 'Last name', emailLabel: 'Email', phone: 'Phone',
      birthDate: 'Date of birth', company: 'Company', country: 'Country', role: 'Role',
      passwordSection: 'Password', confirmPassword: 'Confirm password',
      personalInfo: 'Personal information', professionalInfo: 'Professional information',
      createAccount: 'Create my account', creating: 'Creating...', error: 'Error creating account',
      hasAccount: 'Already have an account? Sign in'
    },
    home: {
      hero: {
        badge: 'B2B Maritime Platform',
        title: 'Optimize your container logistics',
        subtitle: 'Connect importers and exporters to maximize maritime container utilization',
        ctaStart: 'Get started',
        ctaLearn: 'Learn more',
        countries: 'Countries',
        products: 'Products',
        accuracy: 'Accuracy',
        maritimeShipping: 'Maritime Shipping',
        portCosts: 'Real-time port costs',
        customsDuties: 'Customs Duties',
        accurateCalc: 'Accurate calculations',
        globalCoverage: 'Global Coverage',
        countriesCount: '150+ countries'
      }
    },
    marketplace: {
      title: 'Maritime Marketplace', subtitle: 'Find the perfect container for your shipment',
      search: 'Search...', allTypes: 'All types', allCargo: 'All cargo',
      myOffers: 'My Offers', myRequests: 'My Requests', myMatches: 'My Matches',
      map: 'Map', newOffer: '+ New Offer', newRequest: '+ New Request',
      available: 'Available', noOffers: 'No offers available',
      deleteOffer: 'Delete this offer?', deleteRequest: 'Delete this request?',
      confirmMatch: 'Confirm this match?', loading: 'Loading...',
      importer: 'Importer', deleteDirectRequest: 'Delete this direct request?',
      noContainerAvailable: 'No containers available', noOfferPublished: 'No offers published',
      viewDetails: 'View details', edit: 'Edit', delete: 'Delete',
      matchesFound: 'match(es) found!', matchesAlreadyFound: 'Matches already found. Check My Matches.',
      noMatchFound: '❌ No match found. Try another container type.',
      noDirectRequest: 'No direct requests sent',
      noDirectRequestDesc: 'Send direct requests to importers from the marketplace',
      noMatchRequest: 'No matching requests', noMatchRequestDesc: 'Create requests to find matching offers',
      searching: '⏳ Searching...', findMatches: '🎯 Find matches',
      noMatches: 'No matches', noMatchesDesc: 'Matches appear here via matchmaking',
      compatible: 'compatible', noRequestReceived: 'No requests received',
      noRequestReceivedDesc: 'Direct requests will appear here',
      noMatchesImporterDesc: 'Matches appear when exporters find your offers',
      directRequestTo: 'Direct request to', noDate: 'No date specified',
      accepted: 'Accepted', pending: 'Pending', rejected: 'Rejected',
      details: 'Details', offer: 'Offer', request: 'Request',
      sendRequest: 'Send Request'
    },
    requestForm: {
      title: 'Send a Request',
      subtitle: 'The provider will receive an email with your request',
      message: 'Message',
      messagePlaceholder: 'Describe your needs, merchandise, conditions...',
      company: 'Company (optional)',
      companyPlaceholder: 'Your company name',
      date: 'Desired date (optional)',
      submit: 'Send Request',
      back: 'Back'
    },
    offerDetail: {
      number: "Number",
      condition: "Condition",
      year: "Year",
      status: "Status"
    },
    transactions: {
      title: 'My Transactions', loading: 'Loading...', noTransactions: 'No transactions',
      errorLoad: 'Error loading', eirSuccess: 'EIR uploaded successfully!',
      subtitle: 'Check the status of your ongoing transactions',
      viewOffer: 'View offer', waitingEir: 'Waiting for EIR document from provider',
      advanceStatus: 'Advance status', uploadEir: 'Upload EIR',
      downloadEir: 'Download EIR', actionsDocuments: 'Actions & Documents',
      transaction: 'Transaction',
      status: { AT_PROVIDER: 'At provider', IN_TRANSIT: 'In transit',
        DELIVERED: 'Delivered', LOADING: 'Loading', COMPLETED: 'Completed' },
      eirAvailable: "EIR available",
      advance: "Advance",
      provider: "Provider",
      seeker: "Seeker",
      role: "Role"
    },
    support: {
      title: 'Support & Claims', newTicket: 'New ticket', subject: 'Subject',
      description: 'Description', submit: 'Submit', loading: 'Loading...',
      validation: 'Subject and description required', noTickets: 'No tickets',
      subtitle: 'Our team is here to help you',
      signaler: 'Report an issue or complaint',
      createdAt: 'Created on', reply: 'Reply', close: 'Close',
      replyPlaceholder: 'Your response...', sendReply: 'Send reply',
      category: 'Category', priority: 'Priority',
      reclamation: 'Claim',
      status: { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved' }
    },
    footer: {
      title: 'Smart Export Global',
      description: 'B2B maritime logistics platform',
      rights: ' 2024 Smart Export Global. All rights reserved.',
      links: { marketplace: 'Marketplace', transactions: 'Transactions',
               support: 'Support', about: 'About' }
    },
    calculator: {
      title: 'Cost Calculator', subtitle: 'Estimate your export costs',
      calculate: 'Calculate', result: 'Result', origin: 'Origin',
      destination: 'Destination', weight: 'Weight (kg)', volume: 'Volume (m³)',
      containerType: 'Container type', cargo: 'Cargo type',
      reset: 'Reset', loading: 'Calculating...',
      productInfo: 'Product Information', basicInfo: 'Basic Information',
      financialInfo: 'Financial Information', legalInfo: 'Legal Information',
      additionalInfo: 'Additional Information',
      fobValue: 'FOB merchandise value',
      transportCost: 'Transport cost',
      insurance: 'Insurance',
      currency: 'Currency',
      category: 'Category',
      unloadingPort: 'Unloading port',
      product: 'Product',
      companyName: 'Company Name',
      rc: 'Trade Register (RC)',
      ice: 'ICE',
      incoterm: 'Incoterm',
      netWeight: 'Net Weight (kg)',
      grossWeight: 'Gross Weight (kg)',
      selectCategory: 'Select a category',
      selectDestination: 'Select destination country',
      selectPort: 'Select unloading port',
      selectProduct: 'Select product',
      autoCalculated: 'Auto calculated',
      profitAnalysis: 'For profitability analysis',
      sellingPrice: 'Estimated selling price (optional)',
      unitType: 'Unit Type',
      unitTypePlaceholder: 'Unit Type (ex: 40ft container)',
      valuePlaceholder: '0.00',
      transportPlaceholder: 'Ex: 500', downloadReport: 'Download PDF Report',
      paysDepart: 'Country of departure',
      portDepart: 'Departure port',
      readyTitle: 'Ready to Calculate?', readyText: 'Fill in the form to see your complete import cost breakdown',
      selectDepartureCountry: "-- Country of departure --",
      selectCountry: "-- Select country --",
      loadingCountries: "-- Loading countries --",
      costBreakdown: "Cost Breakdown",
      item: "Item",
      amount: "Amount",
      rate: "Rate",
      valeurFob: "FOB Value",
      transport: "Transport",
      assurance: "Insurance",
      cifValue: "CIF Value",
      droitsDouane: "Customs duties",
      tva: "VAT",
      fraisPortuaires: "Port fees",
      totalLanded: "TOTAL LANDED COST",
      sensitivityAnalysis: "Currency Sensitivity Analysis",
      sensitivityDesc: "Impact of ±2% exchange rate variation on total cost",
      variationPlus: "Variation +2%",
      variationMinus: "Variation -2%",
      equivalentEur: "EUR Equivalent",
      currencyLabel: "Currency",
      taxWarning: "Estimated customs rates (source: WTO/MFN averages)",
      taxWarningDesc: "Estimated customs rates based on WTO MFN averages. For maximum accuracy, consult customs authorities of",
      disclaimer: "Estimate based on real flows and official rates in effect on",
      disclaimerSource: "Exchange rate source: ExchangeRate-API",
      totalDouane: "TOTAL CUSTOMS",
      totalTva: "TOTAL VAT",
      taxeParafiscale: "PARAFISCAL TAX",
      fraisPortuairesCard: "PORT FEES",
      profitabilityAnalysis: "Profitability Analysis",
      projectedSellingPrice: "Projected Selling Price",
      netMargin: "Net Margin",
      indicator: "Indicator",
      sivAlert: "⚠️ Customs Security Alert (SIV)",
      currentCifValue: "Current CIF Value",
      minSivEntryPrice: "Minimum SIV Entry Price",
      productLabel: "Product",
      destinationLabel: "Destination",
      portLabel: "Port"
    },
    carbon: {
      checkbox: "Add carbon calculation",
      title: "Carbon Footprint",
      co2: "CO₂ Footprint",
      equation: "Calculation detail",
      cbam: "Estimated CBAM Tax",
      loading: "Calculating...",
      error: "Error during carbon calculation",
      formula: "Formula",
      download: "Download carbon certificate",
      subtype: {
        label: "Vessel type",
        placeholder: "-- General type (0.025) --",
        container_ship: "Container ship",
        bulk_carrier: "Bulk carrier",
        tanker: "Tanker",
        ferry: "Ferry"
      },
      mode: {
        label: 'Transport mode',
        maritime: 'Maritime',
        road: 'Road',
        air: 'Air',
        rail: 'Rail'
      }
    },
    pdf: {
      carbon: {
        title: "CARBON EXPORT CERTIFICATE",
        subtitle: "Smart Export Global — Carbon Footprint",
        shipment: "Shipment Details",
        origin: "Origin",
        destination: "Destination",
        weight: "Weight",
        mode: "Transport mode",
        maritime: "Maritime",
        road: "Road",
        air: "Air",
        rail: "Rail",
        distance: "Calculated distance",
        results: "Results",
        co2total: "Total CO₂ Footprint",
        methodology: "Methodology",
        formula: "Formula",
        financial: "Financial Information",
        cbam: "Estimated CBAM Tax",
        disclaimer: "Indicative value. Source: EU ETS. 85 €/tonne CO₂.",
        generated: "Generated on"
      }
    },
    traceability: {
      title: 'Traceability', subtitle: 'Track your shipments in real time',
      search: 'Search a shipment...', noResults: 'No results found',
      loading: 'Loading...', status: 'Status',
      new: 'New', newForm: 'New Form', records: 'Records', history: 'History',
      productIdentification: 'Product Identification',
      originProduction: 'Origin & Production',
      shipment: 'Shipment',
      reception: 'Reception',
      euImport: 'EU Import',
      documents: 'Documents & References',
      save: 'Save', saving: 'Saving...',
      cancel: 'Cancel', newLot: 'New lot',
      exportExcel: 'Export Excel',
      // Sections A-J
      sectionA: 'A. System Metadata',
      sectionB: 'B. Product Identification',
      sectionC: 'C. Origin & Production',
      sectionD: 'D. Shipment',
      sectionE: 'E. Reception',
      sectionF: 'F. EU Import',
      sectionG: 'G. Documents',
      sectionH: 'H. Traceability Link',
      sectionI: 'I. Validation & Compliance',
      sectionJ: 'J. Documents & Official Signature',
      // Field labels
      recordId: 'Record ID',
      creationDate: 'Creation date/time',
      creatorUser: 'Creator user',
      formVersion: 'Form version',
      initialStatus: 'Initial status',
      conformity: 'Compliance',
      autoGenerated: 'Auto-generated',
      connectedUser: 'Connected user',
      tlc: 'Traceability Lot Code (TLC)*',
      productDesc: 'Product Description*',
      gtin: 'GTIN (14 digits)',
      commercialLot: 'Commercial Lot*',
      sanitaryLot: 'Sanitary Lot*',
      quantity: 'Quantity',
      unit: 'Unit',
      originCountry: 'Country of origin*',
      productionSite: 'Production site - name*',
      productionAddress: 'Production site - address*',
      sanitaryApproval: 'Sanitary Approval No.',
      productionDate: 'Production date*',
      harvestDate: 'Harvest date*',
      producer: 'Producer',
      plot: 'Plot',
      treatments: 'Treatments',
      senderName: 'Sender name*',
      senderAddress: 'Sender address*',
      senderGln: 'Sender GLN',
      shipmentDate: 'Shipment date/time*',
      transport: 'Transport method',
      temperature: 'Transport temperature (°C)',
      recipientName: 'Recipient name*',
      recipientAddress: 'Recipient address*',
      recipientGln: 'Recipient GLN',
      receptionDate: 'Reception date/time*',
      destination: 'Destination',
      euOperator: 'Responsible EU Operator',
      euAddress: 'EU Operator address',
      eori: 'EORI Number',
      docType: 'Document type',
      docNumber: 'Document number*',
      sanitaryCert: 'Sanitary certificate',
      lot: 'Reference lot',
      glnCreator: 'GLN TLC Creator (13 digits) — FSMA 204',
      sourceSystem: 'Source System — Audit',
      certifyText: '✅ I certify that all entered data are accurate, complete and compliant with FSMA 204 (US) regulations and applicable European regulations.',
      responsibleSig: 'Electronic signature of responsible person',
      validationDate: 'Validation date',
      draft: 'DRAFT',
      validated: 'VALIDATED',
      locked: 'LOCKED',
      mainDoc: 'Main document',
      scannedSig: 'Scanned signature',
      dropFile: 'Drag and drop a file here',
      dropSig: 'Drag and drop your signature',
      filters: '🔍 Filters',
      startDate: 'Start date',
      endDate: 'End date',
      loadFilter: 'Load / Filter',
      exportAll: 'Export Excel (all)',
      exportSelection: 'Export selection',
      // Additional keys for history and tables
      date: 'Date',
      action: 'Action',
      user: 'User',
      details: 'Details',
      noHistory: 'No history',
      identifier: 'Identifier',
      parcel: 'Plot',
      docs: 'Docs'
    },
    eir: {
      title: 'EIR Documents', upload: 'Upload a document',
      download: 'Download', noDocuments: 'No documents available',
      loading: 'Loading...', subtitle: 'Equipment Interchange Receipts - Your logistics documents',
      loadError: 'Error loading EIR documents', downloadError: 'Error downloading document',
      uploadSuccess: '✅ EIR document uploaded successfully', uploadError: 'Error uploading document',
      deleteSuccess: '✅ EIR document deleted successfully', deleteError: 'Error deleting document',
      deleteConfirm: 'Delete this EIR document?', noDocumentsText: 'EIR documents appear here once transactions are confirmed and documents uploaded.'
    },
    common: {
      save: 'Save', cancel: 'Cancel', confirm: 'Confirm', delete: 'Delete',
      edit: 'Edit', loading: 'Loading...', error: 'An error occurred',
      success: 'Operation successful', back: 'Back', next: 'Next', submit: 'Submit'
    }
  },
  es: {
    nav: {
      home: 'Inicio', calculator: 'Calculadora', traceability: 'Trazabilidad',
      marketplace: 'Marketplace', transactions: 'Transacciones', documents: 'Documentos EIR',
      tracking: 'Seguimiento', support: 'Soporte', about: 'Acerca de',
      admin: 'Administración', profile: 'Mi Perfil', logout: 'Cerrar sesión', simulation: 'Simular'
    },
    login: {
      title: 'Iniciar sesión en tu cuenta', subtitle: 'Accede a tu espacio Smart Export Global',
      forgotPassword: '¿Olvidaste tu contraseña?', register: 'Registrarse',
      connecting: 'Conectando...', connect: 'Iniciar sesión',
      errorCredentials: 'Email o contraseña incorrectos'
    },
    modal: {
      newRequest: "Nueva Solicitud de Contenedor",
      newOffer: "Nueva Oferta de Contenedor",
      country: "País",
      selectCountry: "-- Seleccionar país --",
      loadingPort: "Puerto de Carga",
      selectPort: "-- Seleccionar puerto --",
      containerType: "Tipo de Contenedor",
      cargoType: "Tipo de Carga",
      requiredDate: "Fecha Requerida",
      availableDate: "Fecha Disponible",
      size: "Tamaño",
      standard: "Estándar",
      highCube: "High Cube",
      reefer: "Reefer",
      technicalDetails: "Detalles Técnicos",
      photos: "Fotos del contenedor",
      createRequest: "Crear solicitud",
      createOffer: "Crear oferta",
      creating: "Creando...",
      loadingCountries: "Cargando países...",
      loadingPorts: "Cargando puertos..."
    },
    admin: {
      overview: "Resumen",
      users: "Usuarios",
      countries: "Países",
      ports: "Puertos",
      tariffs: "Tarifas",
      claims: "Reclamaciones",
      containers: "Contenedores",
      search: "Buscar...",
      block: "Bloquear",
      unblock: "Desbloquear",
      totalUsers: "Total Usuarios",
      activeOffers: "Ofertas Activas",
      transactions: "Transacciones",
      pendingTickets: "Tickets pendientes",
      activeUsers: "Usuarios activos",
      blockedUsers: "Usuarios bloqueados",
      totalMatches: "Total Coincidencias",
      recentTransactions: "Transacciones recientes",
      noTransactions: "Sin transacciones",
      searchUser: "Buscar usuario...",
      role: "Rol",
      status: "Estado",
      active: "Activo",
      blocked: "Bloqueado",
      email: "Correo",
      name: "Nombre",
      portName: "Nombre del puerto",
      country: "País",
      unlocode: "UNLOCODE",
      portFees: "Tasas portuarias",
      addPort: "Agregar puerto",
      editPort: "Editar puerto",
      noClaims: "Sin reclamaciones",
      reply: "Responder",
      sendReply: "Enviar respuesta",
      replyPlaceholder: "Tu respuesta...",
      usersManagement: {
        title: "Gestión de Usuarios",
        columns: {
          avatarName: "Avatar + Nombre",
          email: "Email", 
          role: "Rol",
          status: "Estado",
          company: "Empresa",
          country: "País",
          actions: "Acciones",
          createdAt: "Fecha Creación"
        },
        actions: {
          detail: "Detalle",
          block: "Bloquear",
          unblock: "Desbloquear",
          delete: "Eliminar",
          confirmDelete: "Confirmar eliminación",
          confirmBlock: "Confirmar bloqueo"
        },
        search: "Buscar por email o rol...",
        refresh: "Actualizar",
        results: "usuario(s) mostrado(s) de",
        notSpecified: "No especificado"
      },
      stats: {
        importers: "Importadores",
        exporters: "Exportadores", 
        active: "↑ activo"
      },
      sidebar: {
        marketplace: "Marketplace",
        exchangeRates: "Tasa de Cambio",
        administration: "Administración",
        logout: "Cerrar sesión"
      },
      header: {
        title: "Panel de Administración",
        subtitle: "Gestión de la Plataforma Smart Export Global"
      },
      countriesManagement: {
        title: "Gestión de Países",
        columns: {
          flag: "Bandera",
          code: "Código",
          name: "País", 
          region: "Región",
          currency: "Divisa",
          customsDuty: "Aduanas %",
          vat: "IVA %",
          parafiscal: "Parafiscal %",
          fees: "Tarifas",
          actions: "Acciones"
        },
        search: "Buscar un país...",
        refresh: "Actualizar",
        edit: "Modificar",
        form: {
          customsDuty: "Derechos Aduana %",
          vat: "IVA %",
          parafiscal: "Tasa Parafiscal %",
          portFees: "Tarifas Portuarias"
        }
      },
      portsManagement: {
        title: "Gestión de Puertos",
        count: "puertos",
        columns: {
          name: "Nombre",
          country: "País",
          code: "Código", 
          fees: "Tarifas",
          type: "Tipo",
          actions: "Acciones"
        },
        search: "Buscar puerto o país...",
        refresh: "Actualizar",
        edit: "Modificar",
        form: {
          portName: "Nombre del puerto",
          portCode: "Código puerto",
          feesEur: "Tarifas EUR",
          type: "Tipo"
        }
      },
      rates: {
        title: "Tasa de Cambio",
        columns: {
          currency: "Divisa",
          code: "Código",
          rate: "Tasa vs USD",
          symbol: "Símbolo",
          updatedAt: "Actualizado",
          actions: "Acciones"
        },
        search: "Buscar una divisa...",
        refresh: "Actualizar",
        edit: "Modificar"
      },
      transactionsList: {
        title: "Transacciones Recientes",
        columns: {
          id: "ID",
          client: "Cliente",
          type: "Tipo",
          amount: "Monto",
          status: "Estado",
          date: "Fecha",
          provider: "Proveedor",
          seeker: "Solicitante"
        },
        completed: "COMPLETADO",
        na: "N/D"
      },
      claimsManagement: {
        title: "Reclamaciones",
        columns: {
          user: "Usuario",
          subject: "Asunto",
          category: "Categoría",
          priority: "Prioridad",
          status: "Estado", 
          date: "Fecha",
          actions: "Acciones"
        },
        actions: {
          respond: "Responder"
        },
        priority: {
          low: "Baja",
          medium: "Media",
          high: "Alta",
          urgent: "Urgente"
        },
        modal: {
          title: "Responder a Reclamación",
          subject: "Asunto",
          response: "Respuesta",
          placeholder: "Escriba su respuesta...",
          send: "Enviar",
          cancel: "Cancelar"
        },
        statusOptions: {
          open: "Abierto",
          inProgress: "En Progreso", 
          resolved: "Resuelto",
          closed: "Cerrado"
        }
      },
      userDetail: {
        title: "Detalles del Usuario",
        fields: {
          fullName: "Nombre Completo",
          email: "Email",
          phone: "Teléfono",
          company: "Empresa",
          country: "País",
          role: "Rol",
          accountStatus: "Estado de Cuenta",
          createdAt: "Fecha Creación",
          lastLogin: "Último Acceso"
        },
        close: "Cerrar"
      },
      modals: {
        editCountry: "Modificar",
        editPort: "Modificar Puerto",
        save: "Guardar",
        cancel: "Cancelar"
      },
      alerts: {
        roleUpdated: "Rol actualizado",
        statusUpdated: "Estado actualizado", 
        userDeleted: "Usuario eliminado",
        countryUpdated: "País actualizado",
        portUpdated: "Puerto actualizado",
        responseSent: "Respuesta enviada",
        error: "Error"
      },
      marketplace: {
        title: "Marketplace",
        activeOffers: "Ofertas activas",
        inactiveOffers: "Ofertas inactivas",
        byType: "Distribución por tipo",
        byCountry: "Distribución por país",
        containerList: "Lista de contenedores",
        columns: {
          id: "ID",
          type: "Tipo",
          country: "País",
          owner: "Propietario",
          email: "Email",
          status: "Estado",
          actions: "Acciones"
        },
        actions: {
          deactivate: "Desactivar",
          activate: "Activar",
          delete: "Eliminar"
        },
        confirmDeactivate: "¿Desactivar este contenedor?"
      },
      offer: {
        number: "Número",
        condition: "Estado",
        year: "Año",
        status: "Estado"
      },
      exchangeRates: {
        title: "Tasa de Cambio",
        searchPlaceholder: "Buscar divisa...",
        refresh: "Actualizar",
        columns: {
          currency: "Divisa",
          code: "Código",
          rateVsUsd: "Tasa vs USD",
          symbol: "Símbolo",
          updatedAt: "Actualización",
          actions: "Acciones"
        },
        actions: {
          edit: "Modificar"
        }
      }
    },
    register: {
      title: 'Crear una cuenta', subtitle: 'Únete a Smart Export Global',
      firstName: 'Nombre', lastName: 'Apellido', emailLabel: 'Correo electrónico', phone: 'Teléfono',
      birthDate: 'Fecha de nacimiento', company: 'Empresa', country: 'País', role: 'Rol',
      passwordSection: 'Contraseña', confirmPassword: 'Confirmar contraseña',
      personalInfo: 'Información personal', professionalInfo: 'Información profesional',
      createAccount: 'Crear mi cuenta', creating: 'Creando...', error: 'Error al crear la cuenta',
      hasAccount: '¿Ya tienes cuenta? Iniciar sesión'
    },
    home: {
      hero: {
        badge: 'Plataforma B2B Marítima',
        title: 'Optimiza tu logística de contenedores',
        subtitle: 'Conecta importadores y exportadores para maximizar el uso de contenedores marítimos',
        ctaStart: 'Empezar ahora',
        ctaLearn: 'Saber más',
        countries: 'Países',
        products: 'Productos',
        accuracy: 'Precisión',
        maritimeShipping: 'Transporte Marítimo',
        portCosts: 'Costos portuarios en tiempo real',
        customsDuties: 'Derechos de aduana',
        accurateCalc: 'Cálculos precisos',
        globalCoverage: 'Cobertura global',
        countriesCount: '150+ países'
      }
    },
    marketplace: {
      title: 'Marketplace Marítimo', subtitle: 'Encuentra el contenedor ideal para tu envío',
      search: 'Buscar...', allTypes: 'Todos los tipos', allCargo: 'Toda la carga',
      myOffers: 'Mis Ofertas', myRequests: 'Mis Solicitudes', myMatches: 'Mis Coincidencias',
      map: 'Mapa', newOffer: '+ Nueva Oferta', newRequest: '+ Nueva Solicitud',
      available: 'Disponible', noOffers: 'No hay ofertas disponibles',
      deleteOffer: '¿Eliminar esta oferta?', deleteRequest: '¿Eliminar esta solicitud?',
      confirmMatch: '¿Confirmar esta coincidencia?', loading: 'Cargando...',
      importer: 'Importador', deleteDirectRequest: '¿Eliminar esta solicitud directa?',
      noContainerAvailable: 'No hay contenedores disponibles', noOfferPublished: 'No hay ofertas publicadas',
      viewDetails: 'Ver detalles', edit: 'Editar', delete: 'Eliminar',
      matchesFound: 'coincidencia(s) encontrada(s)!', matchesAlreadyFound: 'Coincidencias ya encontradas. Ver Mis Coincidencias.',
      noMatchFound: '❌ No se encontraron coincidencias. Prueba otro tipo de contenedor.',
      noDirectRequest: 'No se enviaron solicitudes directas',
      noDirectRequestDesc: 'Envía solicitudes directas a importadores desde el marketplace',
      noMatchRequest: 'No hay solicitudes de matching', noMatchRequestDesc: 'Crea solicitudes para encontrar ofertas coincidentes',
      searching: '⏳ Buscando...', findMatches: '🎯 Buscar coincidencias',
      noMatches: 'No hay coincidencias', noMatchesDesc: 'Las coincidencias aparecen aquí vía matchmaking',
      compatible: 'compatible', noRequestReceived: 'No se recibieron solicitudes',
      noRequestReceivedDesc: 'Las solicitudes directas aparecerán aquí',
      noMatchesImporterDesc: 'Las coincidencias aparecen cuando los exportadores encuentran tus ofertas',
      directRequestTo: 'Solicitud directa a', noDate: 'Fecha no especificada',
      accepted: 'Aceptada', pending: 'Pendiente', rejected: 'Rechazada',
      details: 'Detalles', offer: 'Oferta', request: 'Solicitud',
      sendRequest: 'Enviar solicitud'
    },
    requestForm: {
      title: 'Enviar una solicitud',
      subtitle: 'El proveedor recibirá un correo con su solicitud',
      message: 'Mensaje',
      messagePlaceholder: 'Describa su necesidad, mercancía, condiciones...',
      company: 'Empresa (opcional)',
      companyPlaceholder: 'Nombre de su empresa',
      date: 'Fecha deseada (opcional)',
      submit: 'Enviar solicitud',
      back: 'Volver'
    },
    offerDetail: {
      number: "Número",
      condition: "Estado",
      year: "Año",
      status: "Estado"
    },
    transactions: {
      title: 'Mis Transacciones', loading: 'Cargando...', noTransactions: 'No hay transacciones',
      errorLoad: 'Error al cargar', eirSuccess: 'EIR subido con éxito!',
      subtitle: 'Consulta el estado de tus transacciones en curso',
      viewOffer: 'Ver oferta', waitingEir: 'Esperando documento EIR del proveedor',
      advanceStatus: 'Avanzar estado', uploadEir: 'Subir EIR',
      downloadEir: 'Descargar EIR', actionsDocuments: 'Acciones & Documentos',
      transaction: 'Transacción',
      status: { AT_PROVIDER: 'En el proveedor', IN_TRANSIT: 'En tránsito',
        DELIVERED: 'Entregado', LOADING: 'Cargando', COMPLETED: 'Completado' },
      eirAvailable: "EIR disponible",
      advance: "Avanzar",
      provider: "Proveedor",
      seeker: "Solicitante",
      role: "Rol"
    },
    support: {
      title: 'Soporte y Reclamaciones', newTicket: 'Nuevo ticket', subject: 'Asunto',
      description: 'Descripción', submit: 'Enviar', loading: 'Cargando...',
      validation: 'Asunto y descripción obligatorios', noTickets: 'No hay tickets',
      subtitle: 'Nuestro equipo está aquí para ayudarle',
      signaler: 'Reportar un problema o reclamación',
      createdAt: 'Creado el', reply: 'Responder', close: 'Cerrar',
      replyPlaceholder: 'Su respuesta...', sendReply: 'Enviar respuesta',
      category: 'Categoría', priority: 'Prioridad',
      reclamation: 'Reclamación',
      status: { OPEN: 'Abierto', IN_PROGRESS: 'En curso', RESOLVED: 'Resuelto' }
    },
    footer: {
      title: 'Smart Export Global',
      description: 'Plataforma B2B de logística marítima',
      rights: '2024 Smart Export Global. Todos los derechos reservados.',
      links: { marketplace: 'Marketplace', transactions: 'Transacciones',
               support: 'Soporte', about: 'Acerca de' }
    },
    calculator: {
      title: 'Calculatrice de coûts', subtitle: 'Estimez vos coûts d\'exportation',
      calculate: 'Calculer', result: 'Résultat', origin: 'Origine',
      destination: 'Destino', weight: 'Poids (kg)', volume: 'Volumen (m³)',
      containerType: 'Tipo de contenedor', cargo: 'Tipo de carga',
      reset: 'Restablecer', loading: 'Calculando...',
      productInfo: 'Información del producto', basicInfo: 'Información básica',
      financialInfo: 'Información financiera', legalInfo: 'Información legal',
      additionalInfo: 'Información adicional',
      fobValue: 'Valor FOB mercancía',
      transportCost: 'Costo de transporte',
      insurance: 'Seguro',
      currency: 'Divisa',
      category: 'Categoría',
      unloadingPort: 'Puerto de descarga',
      product: 'Producto',
      companyName: 'Nombre Empresa',
      rc: 'Registro Comercial (RC)',
      ice: 'ICE',
      incoterm: 'Incoterm',
      netWeight: 'Peso Neto (kg)',
      grossWeight: 'Peso Bruto (kg)',
      selectCategory: 'Seleccione una categoría',
      selectDestination: 'Seleccionar país destino',
      selectPort: 'Seleccionar puerto',
      selectProduct: 'Seleccionar producto',
      autoCalculated: 'Auto calculado',
      profitAnalysis: 'Para análisis de rentabilidad',
      sellingPrice: 'Precio de venta estimado (opcional)',
      unitType: 'Tipo de Unidad',
      unitTypePlaceholder: 'Tipo de Unidad (ex: 40ft container)',
      valuePlaceholder: '0.00',
      transportPlaceholder: 'Ej: 500', downloadReport: 'Descargar reporte PDF',
      paysDepart: 'País de salida',
      portDepart: 'Puerto de salida',
      readyTitle: '¿Listo para calcular?', readyText: 'Complete el formulario para ver su desglose completo de costos de importación',
      selectDepartureCountry: "-- País de salida --",
      selectCountry: "-- Seleccionar país --",
      loadingCountries: "-- Cargando países --",
      costBreakdown: "Desglose de Costos",
      item: "Descripción",
      amount: "Monto",
      rate: "Tasa",
      valeurFob: "Valor FOB",
      transport: "Transporte",
      assurance: "Seguro",
      cifValue: "Valor CIF",
      droitsDouane: "Derechos de aduana",
      tva: "IVA",
      fraisPortuaires: "Gastos portuarios",
      totalLanded: "COSTO TOTAL (Landed Cost)",
      sensitivityAnalysis: "Análisis de Sensibilidad de Divisas",
      sensitivityDesc: "Impacto de una variación de ±2% en el tipo de cambio sobre el costo total",
      variationPlus: "Variación +2%",
      variationMinus: "Variación -2%",
      equivalentEur: "Equivalente EUR",
      currencyLabel: "Divisa",
      taxWarning: "Tasas aduaneras estimadas (fuente: promedios OMC/NMF)",
      taxWarningDesc: "Tasas aduaneras estimadas basadas en promedios OMC/NMF. Para máxima precisión, consulte las autoridades aduaneras de",
      disclaimer: "Estimación basada en flujos reales y tarifas oficiales vigentes el",
      disclaimerSource: "Fuente de tipo de cambio: ExchangeRate-API",
      totalDouane: "TOTAL ADUANA",
      totalTva: "TOTAL IVA",
      taxeParafiscale: "IMPUESTO PARAFISCAL",
      fraisPortuairesCard: "GASTOS PORTUARIOS",
      profitabilityAnalysis: "Análisis de Rentabilidad",
      projectedSellingPrice: "Precio de Venta Proyectado",
      netMargin: "Margen Neto",
      indicator: "Indicador",
      sivAlert: "⚠️ Alerta de Seguridad Aduanera (SIV)",
      currentCifValue: "Valor CIF actual",
      minSivEntryPrice: "Precio mínimo de entrada SIV",
      productLabel: "Producto",
      destinationLabel: "Destino",
      portLabel: "Puerto"
    },
    carbon: {
      checkbox: "Añadir cálculo de carbono",
      title: "Huella de Carbono",
      co2: "Huella CO₂",
      equation: "Detalle del cálculo",
      cbam: "Impuesto CBAM estimado",
      loading: "Calculando...",
      error: "Error en el cálculo de carbono",
      formula: "Fórmula",
      download: "Descargar certificado de carbono",
      subtype: {
        label: "Tipo de buque",
        placeholder: "-- Tipo general (0.025) --",
        container_ship: "Portacontenedores",
        bulk_carrier: "Granelero",
        tanker: "Buque tanque",
        ferry: "Ferry"
      },
      mode: {
        label: 'Modo de transporte',
        maritime: 'Marítimo',
        road: 'Carretera',
        air: 'Aéreo',
        rail: 'Ferroviario'
      }
    },
    pdf: {
      carbon: {
        title: "CERTIFICADO DE CARBONO EXPORT",
        subtitle: "Smart Export Global — Huella de Carbono",
        shipment: "Detalles del envío",
        origin: "Origen",
        destination: "Destino",
        weight: "Peso",
        mode: "Modo de transporte",
        maritime: "Marítimo",
        road: "Carretera",
        air: "Aéreo",
        rail: "Ferroviario",
        distance: "Distancia calculada",
        results: "Resultados",
        co2total: "Huella CO₂ total",
        methodology: "Metodología",
        formula: "Fórmula",
        financial: "Información financiera",
        cbam: "Impuesto CBAM estimado",
        disclaimer: "Valor indicativo. Fuente: EU ETS. 85 €/tonelada CO₂.",
        generated: "Generado el"
      }
    },
    traceability: {
      title: 'Trazabilidad', subtitle: 'Siga sus envíos en tiempo real',
      search: 'Buscar un envío...', noResults: 'No se encontraron resultados',
      loading: 'Cargando...', status: 'Estado',
      new: 'Nuevo', newForm: 'Nuevo Formulario', records: 'Registros', history: 'Historial',
      productIdentification: 'Identificación del Producto',
      originProduction: 'Origen y Producción',
      shipment: 'Envío',
      reception: 'Recepción',
      euImport: 'Importación UE',
      documents: 'Documentos y Referencias',
      save: 'Guardar', saving: 'Guardando...',
      cancel: 'Cancelar', newLot: 'Nuevo lote',
      exportExcel: 'Exportar Excel',
      // Sections A-J
      sectionA: 'A. Metadatos del Sistema',
      sectionB: 'B. Identificación del Producto',
      sectionC: 'C. Origen y Producción',
      sectionD: 'D. Envío',
      sectionE: 'E. Recepción',
      sectionF: 'F. Importación UE',
      sectionG: 'G. Documentos',
      sectionH: 'H. Enlace de Trazabilidad',
      sectionI: 'I. Validación y Cumplimiento',
      sectionJ: 'J. Documentos y Firma Oficial',
      // Field labels
      recordId: 'ID Registro',
      creationDate: 'Fecha/hora creación',
      creatorUser: 'Usuario creador',
      formVersion: 'Versión formulario',
      initialStatus: 'Estado inicial',
      conformity: 'Cumplimiento',
      autoGenerated: 'Auto-generado',
      connectedUser: 'Usuario conectado',
      tlc: 'Traceability Lot Code (TLC)*',
      productDesc: 'Descripción del Producto*',
      gtin: 'GTIN (14 dígitos)',
      commercialLot: 'Lote Comercial*',
      sanitaryLot: 'Lote Sanitario*',
      quantity: 'Cantidad',
      unit: 'Unidad',
      originCountry: 'País de origen*',
      productionSite: 'Sitio de producción - nombre*',
      productionAddress: 'Sitio de producción - dirección*',
      sanitaryApproval: 'N° Aprobación Sanitaria',
      productionDate: 'Fecha de producción*',
      harvestDate: 'Fecha de cosecha*',
      producer: 'Productor',
      plot: 'Parcela',
      treatments: 'Tratamientos',
      senderName: 'Nombre remitente*',
      senderAddress: 'Dirección remitente*',
      senderGln: 'GLN remitente',
      shipmentDate: 'Fecha/hora envío*',
      transport: 'Método de transporte',
      temperature: 'Temperatura transporte (°C)',
      recipientName: 'Nombre destinatario*',
      recipientAddress: 'Dirección destinatario*',
      recipientGln: 'GLN destinatario',
      receptionDate: 'Fecha/hora recepción*',
      destination: 'Destino',
      euOperator: 'Operador UE Responsable',
      euAddress: 'Dirección Operador UE',
      eori: 'Número EORI',
      docType: 'Tipo de documento',
      docNumber: 'Número documento*',
      sanitaryCert: 'Certificado sanitario',
      lot: 'Lote de referencia',
      glnCreator: 'GLN Creador TLC (13 dígitos) — FSMA 204',
      sourceSystem: 'Sistema Fuente — Auditoría',
      certifyText: '✅ Certifico que todos los datos ingresados son exactos, completos y conformes con las regulaciones FSMA 204 (US) y las regulaciones europeas aplicables.',
      responsibleSig: 'Firma electrónica del responsable',
      validationDate: 'Fecha de validación',
      draft: 'BORRADOR',
      validated: 'VALIDADO',
      locked: 'BLOQUEADO',
      mainDoc: 'Documento principal',
      scannedSig: 'Firma escaneada',
      dropFile: 'Arrastre y suelte un archivo aquí',
      dropSig: 'Arrastre y suelte su firma',
      filters: '🔍 Filtros',
      startDate: 'Fecha inicio',
      endDate: 'Fecha fin',
      loadFilter: 'Cargar / Filtrar',
      exportAll: 'Exportar Excel (todo)',
      exportSelection: 'Exportar selección',
      // Additional keys for history and tables
      date: 'Fecha',
      action: 'Acción',
      user: 'Usuario',
      details: 'Detalles',
      noHistory: 'Sin historial',
      identifier: 'Identificador',
      parcel: 'Parcela',
      docs: 'Docs'
    },
    eir: {
      title: 'Documentos EIR', upload: 'Subir un documento',
      download: 'Descargar', noDocuments: 'No hay documentos disponibles',
      loading: 'Cargando...', subtitle: 'Equipment Interchange Receipts - Sus documentos logísticos',
      loadError: 'Error al cargar documentos EIR', downloadError: 'Error al descargar documento',
      uploadSuccess: '✅ Documento EIR subido con éxito', uploadError: 'Error al subir documento',
      deleteSuccess: '✅ Documento EIR eliminado con éxito', deleteError: 'Error al eliminar documento',
      deleteConfirm: '¿Eliminar este documento EIR?', noDocumentsText: 'Los documentos EIR aparecen aquí una vez que las transacciones están confirmadas y los documentos subidos.'
    },
    common: {
      save: 'Guardar', cancel: 'Cancelar', confirm: 'Confirmar', delete: 'Eliminar',
      edit: 'Editar', loading: 'Cargando...', error: 'Ha ocurrido un error',
      success: 'Operación exitosa', back: 'Volver', next: 'Siguiente', submit: 'Enviar'
    }
  }
}

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'fr')

  const changeLang = (code) => {
    localStorage.setItem('lang', code)
    setLang(code)
  }

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[lang]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
