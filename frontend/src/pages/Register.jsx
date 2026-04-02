import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/ui/LanguageSelector';

const Register = () => {
  const { t } = useLanguage();
  // Informations personnelles
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // Informations professionnelles
  const [companyName, setCompanyName] = useState('');
  const [country, setCountry] = useState('');
  const [role, setRole] = useState('EXPORTATEUR');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Liste des pays pour le select
  const countries = [
    'Afghanistan', 'Afrique du Sud', 'Albanie', 'Algérie', 'Allemagne', 'Andorre', 'Angola', 'Antigua-et-Barbuda', 'Arabie Saoudite', 'Argentine', 'Arménie', 'Australie', 'Autriche', 'Azerbaïdjan',
    'Bahamas', 'Bahreïn', 'Bangladesh', 'Barbade', 'Belgique', 'Belize', 'Bénin', 'Bhoutan', 'Biélorussie', 'Bolivie', 'Bosnie-Herzégovine', 'Botswana', 'Brésil', 'Brunei', 'Bulgarie', 'Burkina Faso', 'Burundi',
    'Cambodge', 'Cameroun', 'Canada', 'Cap-Vert', 'République centrafricaine', 'Chili', 'Chine', 'Chypre', 'Colombie', 'Comores', 'Congo', 'Corée du Nord', 'Corée du Sud', 'Costa Rica', 'Côte d\'Ivoire', 'Croatie', 'Cuba',
    'Danemark', 'Djibouti', 'Dominique',
    'Égypte', 'Émirats arabes unis', 'Équateur', 'Érythrée', 'Espagne', 'Estonie', 'États-Unis', 'Éthiopie',
    'Fidji', 'Finlande', 'France',
    'Gabon', 'Gambie', 'Géorgie', 'Ghana', 'Grèce', 'Grenade', 'Guatemala', 'Guinée', 'Guinée équatoriale', 'Guyana',
    'Haïti', 'Honduras', 'Hongrie',
    'Inde', 'Indonésie', 'Iran', 'Iraq', 'Irlande', 'Islande', 'Israël', 'Italie', 'Jamaïque', 'Japon', 'Jordanie', 'Kazakhstan', 'Kenya', 'Kirghizistan', 'Kiribati', 'Koweït', 'Laos', 'Lesotho', 'Lettonie', 'Liban', 'Liberia', 'Libye', 'Liechtenstein', 'Lituanie', 'Luxembourg',
    'Macédoine', 'Madagascar', 'Malaisie', 'Malawi', 'Maldives', 'Mali', 'Malte', 'Maroc', 'Marshall', 'Maurice', 'Mauritanie', 'Mexique', 'Micronésie', 'Moldavie', 'Monaco', 'Mongolie', 'Monténégro', 'Mozambique', 'Myanmar',
    'Namibie', 'Nauru', 'Népal', 'Nicaragua', 'Niger', 'Nigeria', 'Norvège', 'Nouvelle-Zélande',
    'Oman', 'Ouganda', 'Ouzbékistan',
    'Pakistan', 'Palaos', 'Panama', 'Papouasie-Nouvelle-Guinée', 'Paraguay', 'Pays-Bas', 'Pérou', 'Philippines', 'Pologne', 'Portugal', 'Qatar',
    'Roumanie', 'Royaume-Uni', 'Russie', 'Rwanda',
    'Saint-Christophe-et-Niévès', 'Sainte-Lucie', 'Saint-Marin', 'Saint-Vincent-et-les-Grenadines', 'Salomon', 'Salvador', 'Samoa', 'Sao Tomé-et-Principe', 'Sénégal', 'Serbie', 'Seychelles', 'Sierra Leone', 'Singapour', 'Slovaquie', 'Slovénie', 'Somalie', 'Soudan', 'Sri Lanka', 'Suisse', 'Suriname', 'Suède', 'Syrie',
    'Tadjikistan', 'Tanzanie', 'Tchad', 'Thaïlande', 'Togo', 'Tonga', 'Trinité-et-Tobago', 'Tunisie', 'Turkménistan', 'Turquie', 'Tuvalu',
    'Ukraine', 'Uruguay',
    'Vanuatu', 'Vatican', 'Venezuela', 'Vietnam',
    'Yémen',
    'Zambie', 'Zimbabwe'
  ];

  const validateForm = () => {
    // Validation des champs obligatoires
    if (!firstName.trim()) {
      setError('Le prénom est obligatoire');
      return false;
    }
    
    if (!lastName.trim()) {
      setError('Le nom est obligatoire');
      return false;
    }
    
    if (!email.trim()) {
      setError('L\'email est obligatoire');
      return false;
    }
    
    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Veuillez entrer un email valide');
      return false;
    }
    
    if (!password) {
      setError('Le mot de passe est obligatoire');
      return false;
    }
    
    // Validation mot de passe
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }
    
    if (!/[A-Z]/.test(password)) {
      setError('Le mot de passe doit contenir au moins une majuscule');
      return false;
    }
    
    if (!/\d/.test(password)) {
      setError('Le mot de passe doit contenir au moins un chiffre');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        firstName,
        lastName,
        email,
        password,
        role
      };
      
      await authService.register(userData);
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const selectClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSelector variant="light" />
      </div>
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('register.subtitle')}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Informations personnelles */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('register.personalInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClasses}>
                  {t('register.firstName')} *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className={inputClasses}
                  placeholder={t('register.firstName')}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="lastName" className={labelClasses}>
                  {t('register.lastName')} *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className={inputClasses}
                  placeholder={t('register.lastName')}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className={labelClasses}>
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputClasses}
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="phone" className={labelClasses}>
                  {t('register.phone')}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={inputClasses}
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="birthDate" className={labelClasses}>
                  {t('register.birthDate')}
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  className={inputClasses}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('register.professionalInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyName" className={labelClasses}>
                  {t('register.company')}
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  className={inputClasses}
                  placeholder="Nom de votre entreprise"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="country" className={labelClasses}>
                  {t('register.country')}
                </label>
                <select
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={selectClasses}
                >
                  <option value="">Sélectionnez un pays</option>
                  {countries.map((countryName, index) => (
                    <option key={`${countryName}-${index}`} value={countryName}>
                      {countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="role" className={labelClasses}>
                  {t('register.role')} *
                </label>
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={selectClasses}
                  required
                >
                  <option value="EXPORTATEUR">Exportateur</option>
                  <option value="IMPORTATEUR">Importateur</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('register.passwordSection')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className={labelClasses}>
                  {t('register.passwordSection')} *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className={inputClasses}
                  placeholder="Min 8 caractères, 1 majuscule, 1 chiffre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className={labelClasses}>
                  {t('register.confirmPassword')} *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className={inputClasses}
                  placeholder={t('register.confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="text-sm">
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('register.hasAccount')}
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? t('register.creating') : t('register.createAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
