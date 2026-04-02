import { createContext, useContext, useState } from 'react'

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
    register: {
      title: 'Créer un compte', subtitle: 'Rejoignez Smart Export Global',
      firstName: 'Prénom', lastName: 'Nom', emailLabel: 'Email', phone: 'Téléphone',
      birthDate: 'Date de naissance', company: 'Entreprise', country: 'Pays', role: 'Rôle',
      passwordSection: 'Mot de passe', confirmPassword: 'Confirmer le mot de passe',
      personalInfo: 'Informations personnelles', professionalInfo: 'Informations professionnelles',
      createAccount: 'Créer mon compte', creating: 'Création...', error: 'Erreur lors de la création',
      hasAccount: 'Déjà un compte ? Se connecter'
    },
    marketplace: {
      title: 'Marketplace Maritime', subtitle: 'Trouvez le conteneur idéal pour votre expédition',
      search: 'Rechercher...', allTypes: 'Tous les types', allCargo: 'Toutes cargaisons',
      myOffers: 'Mes Offres', myRequests: 'Mes Requêtes', myMatches: 'Mes Correspondances',
      map: 'Carte', newOffer: '+ Nouvelle Offre', newRequest: '+ Nouvelle Demande',
      available: 'Disponible', noOffers: 'Aucune offre disponible',
      deleteOffer: 'Supprimer cette offre ?', deleteRequest: 'Supprimer cette requête ?',
      confirmMatch: 'Confirmer ce matching ?', loading: 'Chargement...'
    },
    transactions: {
      title: 'Mes Transactions', loading: 'Chargement...', noTransactions: 'Aucune transaction',
      errorLoad: 'Erreur chargement', eirSuccess: 'EIR uploadé avec succès !',
      status: { AT_PROVIDER: 'Chez le fournisseur', IN_TRANSIT: 'En transit',
        DELIVERED: 'Livré', LOADING: 'En chargement', COMPLETED: 'Terminé' }
    },
    support: {
      title: 'Support & Réclamations', newTicket: 'Nouveau ticket', subject: 'Sujet',
      description: 'Description', submit: 'Soumettre', loading: 'Chargement...',
      validation: 'Sujet et description obligatoires', noTickets: 'Aucun ticket',
      status: { OPEN: 'Ouvert', IN_PROGRESS: 'En cours', RESOLVED: 'Résolu' }
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
      title: 'Sign in to your account', subtitle: 'Access your Smart Export Global space',
      forgotPassword: 'Forgot password?', register: 'Register',
      connecting: 'Signing in...', connect: 'Sign in',
      errorCredentials: 'Incorrect email or password'
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
    marketplace: {
      title: 'Maritime Marketplace', subtitle: 'Find the ideal container for your shipment',
      search: 'Search...', allTypes: 'All types', allCargo: 'All cargo',
      myOffers: 'My Offers', myRequests: 'My Requests', myMatches: 'My Matches',
      map: 'Map', newOffer: '+ New Offer', newRequest: '+ New Request',
      available: 'Available', noOffers: 'No offers available',
      deleteOffer: 'Delete this offer?', deleteRequest: 'Delete this request?',
      confirmMatch: 'Confirm this match?', loading: 'Loading...'
    },
    transactions: {
      title: 'My Transactions', loading: 'Loading...', noTransactions: 'No transactions',
      errorLoad: 'Error loading', eirSuccess: 'EIR uploaded successfully!',
      status: { AT_PROVIDER: 'At provider', IN_TRANSIT: 'In transit',
        DELIVERED: 'Delivered', LOADING: 'Loading', COMPLETED: 'Completed' }
    },
    support: {
      title: 'Support & Claims', newTicket: 'New ticket', subject: 'Subject',
      description: 'Description', submit: 'Submit', loading: 'Loading...',
      validation: 'Subject and description required', noTickets: 'No tickets',
      status: { OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved' }
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
      title: 'Iniciar sesión', subtitle: 'Accede a tu espacio Smart Export Global',
      forgotPassword: '¿Olvidaste tu contraseña?', register: 'Registrarse',
      connecting: 'Conectando...', connect: 'Entrar',
      errorCredentials: 'Email o contraseña incorrectos'
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
    marketplace: {
      title: 'Marketplace Marítimo', subtitle: 'Encuentra el contenedor ideal para tu envío',
      search: 'Buscar...', allTypes: 'Todos los tipos', allCargo: 'Toda la carga',
      myOffers: 'Mis Ofertas', myRequests: 'Mis Solicitudes', myMatches: 'Mis Coincidencias',
      map: 'Mapa', newOffer: '+ Nueva Oferta', newRequest: '+ Nueva Solicitud',
      available: 'Disponible', noOffers: 'No hay ofertas disponibles',
      deleteOffer: '¿Eliminar esta oferta?', deleteRequest: '¿Eliminar esta solicitud?',
      confirmMatch: '¿Confirmar esta coincidencia?', loading: 'Cargando...'
    },
    transactions: {
      title: 'Mis Transacciones', loading: 'Cargando...', noTransactions: 'No hay transacciones',
      errorLoad: 'Error al cargar', eirSuccess: 'EIR subido con éxito!',
      status: { AT_PROVIDER: 'En el proveedor', IN_TRANSIT: 'En tránsito',
        DELIVERED: 'Entregado', LOADING: 'Cargando', COMPLETED: 'Completado' }
    },
    support: {
      title: 'Soporte y Reclamaciones', newTicket: 'Nuevo ticket', subject: 'Asunto',
      description: 'Descripción', submit: 'Enviar', loading: 'Cargando...',
      validation: 'Asunto y descripción obligatorios', noTickets: 'No hay tickets',
      status: { OPEN: 'Abierto', IN_PROGRESS: 'En progreso', RESOLVED: 'Resuelto' }
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
