import React, { useState, useEffect } from 'react'
import { Calculator as CalcIcon, Download, AlertCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import { tarifService, portService, calculationService, pdfService } from '../services/api'
import { countriesService } from '../services/countriesApi'
import { worldPortsService } from '../services/worldPortsApi'
import { agriculturalProductsService } from '../services/agriculturalProductsApi'
import { useMaritimeCountries } from '../hooks/useMaritimeCountries'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import CostDashboard from '../components/CostDashboard'
import { WORLD_CURRENCIES } from '../data/worldCurrencies'
import { updateExchangeRates } from '../utils/currencyConverter'

function Calculator() {
  const { user } = useAuth();
  const { t: translate, lang: language } = useLanguage();
  const isImportateur = user?.role === 'IMPORTATEUR';
  
  const {
    countries: maritimeCountries,
    loading: maritimeCountriesLoading,
    error: maritimeCountriesError,
  } = useMaritimeCountries()

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [countries, setCountries] = useState([])
  const [countriesError, setCountriesError] = useState(null)
  const [productsError, setProductsError] = useState(null)
  const [countriesData, setCountriesData] = useState([]) // Pour drapeaux et devises - affichage uniquement
  const [ports, setPorts] = useState([])
  const [portMessage, setPortMessage] = useState(null)
  const [portsLoading, setPortsLoading] = useState(false)
  
  // States pour le port de départ indépendant
  const [paysDepart, setPaysDepart] = useState('');
  const [portDepartId, setPortDepartId] = useState('');
  const [portDepartNom, setPortDepartNom] = useState('');
  
  // State pour le nom du port destination
  const [portDestNom, setPortDestNom] = useState('');
  
  // States carbon
  const [carbonEnabled, setCarbonEnabled] = useState(false);
  const [carbonData, setCarbonData] = useState(null);
  const [carbonLoading, setCarbonLoading] = useState(false);
  const [carbonError, setCarbonError] = useState(null);
  const [carbonMode, setCarbonMode] = useState('maritime');
  const [carbonSubtype, setCarbonSubtype] = useState('');
  
  // States séparés pour les ports importateur
  const [portsOrigine, setPortsOrigine] = useState([]);
  const [portsDestination, setPortsDestination] = useState([]);
  const [portsOrigineLoading, setPortsOrigineLoading] = useState(false);
  const [portsDestinationLoading, setPortsDestinationLoading] = useState(false);
  const [portsOrigineMessage, setPortsOrigineMessage] = useState(null);
  const [portsDestinationMessage, setPortsDestinationMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    // Champs communs
    categorie: '',
    codeHs: '',
    valeurFob: '',
    poidsNet: '',
    poidsBrut: '',
    typeUnite: '',
    currency: 'MAD',
    incoterm: 'CIF',
    
    // Champs exportateur (existant)
    paysDestination: '',
    portId: '',
    coutTransport: '',
    assurance: '',
    
    // Champs importateur (nouveau)
    paysOrigine: '',
    portEmbarquement: '',
    portDechargement: '',
    
    // Legal identifiers
    nomEntreprise: '',
    registreCommerce: '',
    ice: '',
    
    // Profitability
    prixVentePrevisionnel: '',
  })
  
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCategories()
    loadCountries()
  }, [])

  useEffect(() => {
    if (formData.categorie) {
      loadProductsByCategory(formData.categorie)
    }
  }, [formData.categorie])

  const loadCategories = async () => {
    try {
      // Charger les catégories depuis le service agricole (Fruits, Légumes UNIQUEMENT)
      const agriculturalCategories = agriculturalProductsService.getCategories()
      setCategories(agriculturalCategories)
    } catch (err) {
      console.error('Error loading categories:', err)
      // Fallback vers backend si erreur
      try {
        const response = await tarifService.getCategories()
        setCategories(response.data)
      } catch (backendErr) {
        console.error('Error loading backend categories:', backendErr)
      }
    }
  }

  // Helper function to normalize country names for matching
  const normalizeCountryName = (name) => {
    const nameMap = {
      'United States': 'États-Unis',
      'USA': 'États-Unis',
      'South Africa': 'Afrique du Sud',
      'United Kingdom': 'Royaume-Uni',
      'UK': 'Royaume-Uni',
      'UAE': 'Émirats arabes unis',
      'United Arab Emirates': 'Émirats arabes unis',
      'China': 'Chine',
      'India': 'Inde',
      'Japan': 'Japon',
      'South Korea': 'Corée du Sud',
      'Brazil': 'Brésil',
      'Egypt': 'Égypte',
      'Morocco': 'Maroc',
      'Ivory Coast': 'Côte d\'Ivoire',
      'Cote d\'Ivoire': 'Côte d\'Ivoire'
    }
    return nameMap[name] || name
  }

  const loadCountries = async () => {
    try {
      setCountriesError(null)
      // Charger les pays avec devises depuis REST Countries API
      const countriesWithCurrencies = await countriesService.getAll()
      
      // Stocker les données complètes pour référence
      setCountriesData(countriesWithCurrencies)
      
      // Update exchange rates for real-time currency conversion
      updateExchangeRates(countriesWithCurrencies)

      let maritimeCountriesRest = []
      try {
        maritimeCountriesRest = await countriesService.getMaritimeCountries()
      } catch {
        maritimeCountriesRest = []
      }
      // maritimeCountriesRest is used to build the final maritime-only list for the dropdown
      
      // Important: do NOT intersect with backend tariff countries here.
      // Some deployments return only "France" from the backend, which would reduce the list to a single country.
      const maritimeCountryNames = (maritimeCountriesRest || []).map((c) => c.name).filter(Boolean)

      if (!maritimeCountryNames.length) {
        setCountriesError(
          "Impossible de charger la liste complète des pays (REST Countries indisponible). Liste de secours utilisée."
        )
      }

      setCountries(maritimeCountryNames)
      
    } catch (err) {
      setCountriesError(
        "Erreur lors du chargement des pays (REST Countries indisponible). Liste de secours utilisée."
      )
      try {
        const fallback = await countriesService.getMaritimeCountries()
        setCountries((fallback || []).map((c) => c.name).filter(Boolean))
      } catch {
        setCountries([])
      }
    }
  }

  const loadProductsByCategory = async (category) => {
    try {
      // Charger les produits agricoles depuis le service (Bananes, Tomates, etc.)
      const agriculturalProducts = agriculturalProductsService.getProductsByCategory(category)
      
      // Formater pour compatibilité avec le backend
      const formattedProducts = agriculturalProducts.map(product => ({
        id: product.id,
        codeHs: product.codeHs,
        nomProduit: product.nom,
        categorie: product.categorie,
        description: product.description
      }))
      
      setProducts(formattedProducts)
    } catch (err) {
      console.error('Error loading agricultural products:', err)
      // Fallback vers backend si erreur
      try {
        const response = await tarifService.getProductsByCategory(category)
        const uniqueProducts = response.data.reduce((acc, product) => {
          if (!acc.find(p => p.codeHs === product.codeHs)) {
            acc.push(product)
          }
          return acc
        }, [])
        setProducts(uniqueProducts)
      } catch (backendErr) {
        console.error('Error loading backend products:', backendErr)
      }
    }
  }

  const loadPortsByCountry = async (country) => {
    if (!country) {
      setPorts([])
      setPortMessage(null)
      return
    }
    
    setPortsLoading(true)
    setPortMessage(null)
    
    try {
      // Normalize country name for consistent matching
      const normalizedCountry = normalizeCountryName(country)
      
      // Récupérer les données du pays pour vérifier s'il est enclavé
      const countryData = countriesData.find(c => c.name === country || c.name === normalizedCountry)
      
      // Charger les ports depuis le service mondial avec couverture 100% (use normalized name)
      const portsResult = await worldPortsService.getPortsByCountry(normalizedCountry, countryData)
      
      if (portsResult.hasPorts && portsResult.ports.length > 0) {
        // Utiliser les ports réels de la base UNCTAD avec frais calculés
        const portsWithFees = portsResult.ports.map((port, index) => {
          // Extraire les frais depuis la structure UNCTAD
          const totalFees = port.totalFees || port.fees?.THC || 500
          
          return {
            id: port.id || `${country.toLowerCase()}-${index + 1}`,
            nom: port.name,
            nomPort: port.name,
            ville: port.city,
            pays: country,
            countryCode: port.countryCode,
            typePort: 'Maritime',
            capacity: port.capacity,
            fraisPortuaires: totalFees, // Frais UNCTAD réels
            currency: port.currency || 'USD',
            region: port.region,
            fees: port.fees, // Structure complète des frais (THC, pilotage, etc.)
            coordinates: port.coordinates,
            lat: port.lat,
            lon: port.lon,
            isGeneric: false // Tous les ports UNCTAD sont réels
          }
        })

        setPorts(portsWithFees)
        setPortMessage(null)
      } else {
        setPorts([])
        setPortMessage(portsResult.message || `Aucun port disponible pour ${country}`)
      }
    } catch (err) {
      console.error('❌ [Calculator] Error loading ports from API:', err)
      console.error('❌ [Calculator] Error stack:', err.stack)
      setPorts([])
      setPortMessage('Erreur lors du chargement des ports')
    } finally {
      setPortsLoading(false)
    }
  }

  // Fonctions séparées pour les ports importateur
  const loadPortsByOrigine = async (country) => {
    if (!country) {
      setPortsOrigine([])
      setPortsOrigineMessage(null)
      return
    }
    
    setPortsOrigineLoading(true)
    setPortsOrigineMessage(null)
    
    try {
      // Normalize country name for consistent matching
      const normalizedCountry = normalizeCountryName(country)
      
      // Récupérer les données du pays pour vérifier s'il est enclavé
      const countryData = countriesData.find(c => c.name === country || c.name === normalizedCountry)
      
      // Charger les ports depuis le service mondial avec couverture 100% (use normalized name)
      const portsResult = await worldPortsService.getPortsByCountry(normalizedCountry, countryData)
      
      if (portsResult.hasPorts && portsResult.ports.length > 0) {
        // Utiliser les ports réels de la base UNCTAD avec frais calculés
        const portsWithFees = portsResult.ports.map((port, index) => {
          // Extraire les frais depuis la structure UNCTAD
          const totalFees = port.totalFees || port.fees?.THC || 500
          
          return {
            id: port.id || `${country.toLowerCase()}-${index + 1}`,
            nom: port.name,
            nomPort: port.name,
            ville: port.city,
            pays: country,
            countryCode: port.countryCode,
            typePort: 'Maritime',
            capacity: port.capacity,
            fraisPortuaires: totalFees, // Frais UNCTAD réels
            currency: port.currency || 'USD',
            region: port.region,
            fees: port.fees, // Structure complète des frais (THC, pilotage, etc.)
            coordinates: port.coordinates,
            lat: port.lat,
            lon: port.lon,
            isGeneric: false // Tous les ports UNCTAD sont réels
          }
        })

        setPortsOrigine(portsWithFees)
        setPortsOrigineMessage(null)
      } else {
        setPortsOrigine([])
        setPortsOrigineMessage(portsResult.message || `Aucun port disponible pour ${country}`)
      }
    } catch (err) {
      console.error('❌ [Calculator] Error loading ports from API:', err)
      console.error('❌ [Calculator] Error stack:', err.stack)
      setPortsOrigine([])
      setPortsOrigineMessage('Erreur lors du chargement des ports origine')
    } finally {
      setPortsOrigineLoading(false)
    }
  }

  const loadPortsByDestination = async (country) => {
    if (!country) {
      setPortsDestination([])
      setPortsDestinationMessage(null)
      return
    }
    
    setPortsDestinationLoading(true)
    setPortsDestinationMessage(null)
    
    try {
      // Normalize country name for consistent matching
      const normalizedCountry = normalizeCountryName(country)
      
      // Récupérer les données du pays pour vérifier s'il est enclavé
      const countryData = countriesData.find(c => c.name === country || c.name === normalizedCountry)
      
      // Charger les ports depuis le service mondial avec couverture 100% (use normalized name)
      const portsResult = await worldPortsService.getPortsByCountry(normalizedCountry, countryData)
      
      if (portsResult.hasPorts && portsResult.ports.length > 0) {
        // Utiliser les ports réels de la base UNCTAD avec frais calculés
        const portsWithFees = portsResult.ports.map((port, index) => {
          // Extraire les frais depuis la structure UNCTAD
          const totalFees = port.totalFees || port.fees?.THC || 500
          
          return {
            id: port.id || `${country.toLowerCase()}-${index + 1}`,
            nom: port.name,
            nomPort: port.name,
            ville: port.city,
            pays: country,
            countryCode: port.countryCode,
            typePort: 'Maritime',
            capacity: port.capacity,
            fraisPortuaires: totalFees, // Frais UNCTAD réels
            currency: port.currency || 'USD',
            region: port.region,
            fees: port.fees, // Structure complète des frais (THC, pilotage, etc.)
            coordinates: port.coordinates,
            lat: port.lat,
            lon: port.lon,
            isGeneric: false // Tous les ports UNCTAD sont réels
          }
        })

        setPortsDestination(portsWithFees)
        setPortsDestinationMessage(null)
      } else {
        setPortsDestination([])
        setPortsDestinationMessage(portsResult.message || `Aucun port disponible pour ${country}`)
      }
    } catch (err) {
      console.error('❌ [Calculator] Error loading ports from API:', err)
      setPortsDestination([])
      setPortsDestinationMessage('Erreur lors du chargement des ports destination')
    } finally {
      setPortsDestinationLoading(false)
    }
  }

  const handleInputChange = async (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (name === 'categorie') {
      setFormData(prev => ({ ...prev, codeHs: '' }))
      setProducts([])
    }
    
    // Logique spécifique pour l'importateur
    if (isImportateur) {
      if (name === 'paysOrigine') {
        setFormData(prev => ({ ...prev, portEmbarquement: '' }))
        // Charger les ports pour le pays d'origine avec état séparé
        setPortsOrigine([])
        setPortsOrigineMessage(null)
        if (value) {
          loadPortsByOrigine(value)
        }
      }
      if (name === 'paysDestination') {
        setFormData(prev => ({ ...prev, portDechargement: '' }))
        // Charger les ports pour le pays de destination avec état séparé
        setPortsDestination([])
        setPortsDestinationMessage(null)
        if (value) {
          loadPortsByDestination(value)
        }
      }
    } else {
      // Logique existante pour l'exportateur
      if (name === 'paysDestination') {
        setFormData(prev => ({ ...prev, portId: '' }))
        setPorts([])
        setPortMessage(null)
        
        // Charger automatiquement la devise du pays sélectionné
        if (value) {
          try {
            const countryData = countriesData.find(c => c.name === value)
            if (countryData && countryData.currency) {
              setFormData(prev => ({
                ...prev,
                currency: countryData.currency.code
              }))
            }
          } catch (err) {
          }
          
          // Charger les ports pour ce pays
          loadPortsByCountry(value)
        }
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (isImportateur) {
        // Mode importateur utilise le même endpoint que l'exportateur
        console.log('IMPORT DATA ENVOYÉ:', JSON.stringify(formData, null, 2));
        
        const response = await calculationService.calculateLandedCost(formData)
        setResult(response.data)
        
      } else {
        // Logique existante pour l'exportateur
        const calculationData = {
          codeHs: formData.codeHs,
          paysDestination: formData.paysDestination,
          valeurFob: parseFloat(formData.valeurFob),
          coutTransport: parseFloat(formData.coutTransport) || 0,
          assurance: parseFloat(formData.assurance),
          currency: formData.currency,
          portId: formData.portId ? parseInt(formData.portId) : null,
          nomEntreprise: formData.nomEntreprise || null,
          registreCommerce: formData.registreCommerce || null,
          ice: formData.ice || null,
          incoterm: formData.incoterm || 'CIF',
          prixVentePrevisionnel: formData.prixVentePrevisionnel ? parseFloat(formData.prixVentePrevisionnel) : null,
          poidsNet: formData.poidsNet ? parseFloat(formData.poidsNet) : null,
          poidsBrut: formData.poidsBrut ? parseFloat(formData.poidsBrut) : null,
          typeUnite: formData.typeUnite || null
        }
        
        const response = await calculationService.calculateLandedCost(calculationData)
        setResult(response.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du calcul')
      console.error('Calculation error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      // Get port name for PDF
      const allPorts = [...ports, ...portsDestination];
      const foundPort = allPorts.find(
        p => String(p.id) === String(formData.portId)
      );
      const portDestNomPdf = foundPort?.nomPort || 
                             foundPort?.nom || 
                             foundPort?.name || '';
      console.log('portId:', formData.portId, 'foundPort:', foundPort, 'portNom:', portDestNomPdf);
      
      const calculationData = {
        codeHs: formData.codeHs,
        paysDestination: formData.paysDestination,
        valeurFob: parseFloat(formData.valeurFob) || 0,
        coutTransport: parseFloat(formData.coutTransport) || 0,
        assurance: parseFloat(formData.assurance) || 0,
        currency: formData.currency || 'USD',
        portId: formData.portId ? parseInt(formData.portId) : null,
        nomEntreprise: formData.nomEntreprise || null,
        registreCommerce: formData.registreCommerce || null,
        ice: formData.ice || null,
        incoterm: formData.incoterm || null,
        prixVentePrevisionnel: parseFloat(formData.prixVentePrevisionnel) || null,
        poidsNet: parseFloat(formData.poidsNet) || null,
        poidsBrut: parseFloat(formData.poidsBrut) || null,
        typeUnite: formData.typeUnite || null,
        // Add language and port name for PDF translation
        lang: language,
        portNom: portDestNomPdf,
      }
      
      const pdfBlob = await pdfService.generateLandedCostPdf(calculationData)
      const url = window.URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `landed_cost_${formData.codeHs.replace('.', '_')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('PDF generation error:', err)
      alert('Erreur lors de la génération du PDF')
    }
  }

  const calculateCarbon = async () => {
    setCarbonLoading(true);
    setCarbonError(null);
    setCarbonData(null);
    try {
      const token = localStorage.getItem('token');
      const poids = parseFloat(
        formData.poidsNet || formData.poidsBrut || 1
      );
      
      // Lire directement les options sélectionnées dans les selects
      const allSelects = Array.from(document.querySelectorAll('select'));
      let originValue = '';
      let destValue = '';

      allSelects.forEach(sel => {
        const opt = sel.options[sel.selectedIndex];
        if (!opt || !opt.value) return;
        // Nettoyer le texte : supprimer emoji, " | prix"
        const rawText = opt.text
          .replace(/[\u{1F1E0}-\u{1F1FF}]{2}/gu, '') // supprimer drapeaux
          .replace(/\s*\|.*$/, '')                    // supprimer "| 2715 USD"
          .trim();
        // Extraire nom port : supprimer préfixes "Port of/de/du"
        // et supprimer suffixe " - Ville" SEULEMENT si pas le seul token
        let portName = rawText
          .replace(/^Port of /i, '')
          .replace(/^Port de /i, '')
          .replace(/^Port du /i, '')
          .replace(/^Port d['']/i, '')
          .trim();
        // Supprimer " - ville" seulement si le nom a plus d'un mot
        if (portName.includes(' - ')) {
          const beforeDash = portName.split(' - ')[0].trim();
          if (beforeDash.length > 2) portName = beforeDash;
        }

        // Select port départ (index 2, pas de name)
        if (!sel.name && opt.value === String(portDepartId) && portDepartId) {
          originValue = portName;
        }
        // Select port destination (name="portId")
        if (sel.name === 'portId' && opt.value) {
          destValue = portName;
        }
      });

      if (!originValue) originValue = paysDepart || 'Casablanca';
      if (!destValue) destValue = formData.paysDestination || '';
      
      // Récupérer coords port départ
      const portDepart = portsOrigine.find(
        p => String(p.id) === String(portDepartId)
      );

      // Récupérer coords port destination  
      const portDest = ports.find(
        p => String(p.id) === String(formData.portId)
      );

      // Chercher les coordonnées dans tous les formats possibles
      const getCoords = (port) => {
        if (!port) return null;
        if (port.coordinates?.lat && port.coordinates?.lng) 
          return {lat: port.coordinates.lat, lng: port.coordinates.lng};
        if (port.coordinates?.lat && port.coordinates?.lon) 
          return {lat: port.coordinates.lat, lng: port.coordinates.lon};
        if (port.lat && port.lon) 
          return {lat: port.lat, lng: port.lon};
        if (port.lat && port.lng) 
          return {lat: port.lat, lng: port.lng};
        if (port.latitude && port.longitude) 
          return {lat: port.latitude, lng: port.longitude};
        return null;
      };
      const originCoords = getCoords(portDepart);
      const destCoords = getCoords(portDest);
      
      const response = await fetch('/api/v1/carbon/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          origin: originValue,
          destination: destValue,
          weightTon: poids / 1000,
          transportMode: carbonMode,
          vehicleSubtype: carbonSubtype || null,
          originLat: originCoords?.lat || null,
          originLng: originCoords?.lng || null,
          destLat: destCoords?.lat || null,
          destLng: destCoords?.lng || null
        })
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setCarbonData(data);
    } catch (err) {
      setCarbonError(translate('carbon.error'));
    } finally {
      setCarbonLoading(false);
    }
  };

  const generateCarbonPDF = () => {
    if (!carbonData) return;
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const m = 20;
    doc.setFillColor(11, 31, 58);
    doc.rect(0, 0, W, 42, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(translate('pdf.carbon.title'), W/2, 18, {align:'center'});
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(translate('pdf.carbon.subtitle'), W/2, 30, {align:'center'});
    doc.setDrawColor(28, 167, 199);
    doc.setLineWidth(2);
    doc.line(m, 38, W-m, 38);
    let y = 54;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 31, 58);
    doc.text(translate('pdf.carbon.shipment'), m, y);
    y += 5;
    doc.setDrawColor(220,220,220);
    doc.setLineWidth(0.4);
    doc.line(m, y, W-m, y);
    y += 8;
    const details = [
      [translate('pdf.carbon.origin'), portDepartNom || portsOrigine?.[0]?.nomPort || 'N/A'],
      [translate('pdf.carbon.destination'), formData.paysDestination || 'N/A'],
      [translate('pdf.carbon.weight'), (parseFloat(formData.poidsNet||formData.poidsBrut||0)/1000)+' t'],
      [translate('pdf.carbon.mode'), translate('pdf.carbon.' + carbonMode)],
      ...(carbonSubtype ? [
        [translate('carbon.subtype.label'), translate('carbon.subtype.' + carbonSubtype)]
      ] : []),
      [translate('pdf.carbon.distance'), carbonData.distanceKm+' km'],
    ];
    doc.setFontSize(9);
    details.forEach(([label, val]) => {
      doc.setFont('helvetica','bold');
      doc.setTextColor(71,85,105);
      doc.text(label+' :', m, y);
      doc.setFont('helvetica','normal');
      doc.setTextColor(30,30,30);
      doc.text(String(val), m+48, y);
      y += 8;
    });
    y += 4;
    doc.setFontSize(11);
    doc.setFont('helvetica','bold');
    doc.setTextColor(11,31,58);
    doc.text(translate('pdf.carbon.results'), m, y);
    y += 5;
    doc.setDrawColor(220,220,220);
    doc.setLineWidth(0.4);
    doc.line(m, y, W-m, y);
    y += 8;
    doc.setFillColor(224,242,254);
    doc.roundedRect(m, y, W-m*2, 18, 2, 2, 'F');
    
    // Titre + valeur sur la même ligne, valeur alignée à droite
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(11, 31, 58);
    const co2Label = translate('pdf.carbon.co2total') || 'Empreinte CO\u2082 totale';
    const co2Value = parseFloat(carbonData.co2Kg).toFixed(2) + ' kg CO\u2082';
    doc.text(co2Label + ' : ' + co2Value, m+4, y+11);
    y += 26;
    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.setTextColor(100,116,139);
    doc.text('Soit '+parseFloat(carbonData.co2Tonnes).toFixed(4)+' tonnes de CO\u2082', m, y);
    y += 12;
    doc.setFontSize(11);
    doc.setFont('helvetica','bold');
    doc.setTextColor(11,31,58);
    doc.text(translate('pdf.carbon.methodology'), m, y);
    y += 5;
    doc.setDrawColor(220,220,220);
    doc.setLineWidth(0.4);
    doc.line(m, y, W-m, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.setTextColor(71,85,105);
    doc.text(translate('pdf.carbon.formula')+' : '+carbonData.formulaDisplay, m, y);
    y += 7;
    // Tronquer l'équation si trop longue
    const maxEqWidth = W - m*2 - 8;
    const equation = carbonData.equation || '';
    
    // Remplacer les noms techniques par des abréviations
    const shortEq = equation
      .replace('[container_ship]', '[cont.]')
      .replace('[bulk_carrier]', '[bulk]')
      .replace('[tanker]', '[tank.]')
      .replace('[ferry]', '[ferry]');
    
    // Hauteur dynamique selon longueur
    const eqLines = doc.splitTextToSize(shortEq, maxEqWidth);
    const eqHeight = Math.max(12, eqLines.length * 10 + 4);
    
    doc.setFillColor(241,245,249);
    doc.roundedRect(m, y, W-m*2, eqHeight, 2, 2, 'F');
    doc.setFont('helvetica','normal');
    doc.setFontSize(8);
    doc.setTextColor(11,31,58);
    doc.text(eqLines, m+3, y+8);
    y += eqHeight + 8;
    doc.setFontSize(11);
    doc.setFont('helvetica','bold');
    doc.setTextColor(11,31,58);
    doc.text(translate('pdf.carbon.financial'), m, y);
    y += 5;
    doc.setDrawColor(220,220,220);
    doc.setLineWidth(0.4);
    doc.line(m, y, W-m, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica','normal');
    doc.setTextColor(71,85,105);
    doc.text(translate('pdf.carbon.cbam')+' :', m, y);
    doc.setFont('helvetica','bold');
    doc.setFontSize(12);
    doc.setTextColor(28,167,199);
    doc.text(carbonData.cbamTaxEur+' \u20ac', W-m, y+2, {align:'right'});
    y += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica','italic');
    doc.setTextColor(148,163,184);
    doc.text(translate('pdf.carbon.disclaimer'), m, y);
    doc.setFillColor(11,31,58);
    doc.rect(0, H-16, W, 16, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(7);
    doc.setFont('helvetica','normal');
    const now = new Date().toLocaleDateString('fr-FR',{
      day:'2-digit',month:'2-digit',year:'numeric',
      hour:'2-digit',minute:'2-digit'
    });
    doc.text(translate('pdf.carbon.generated')+' '+now, m, H-6);
    doc.text('smart-export-global.com', W-m, H-6, {align:'right'});
    doc.save('certificat-carbone-export.pdf');
  };

  useEffect(() => {
    if (carbonEnabled) {
      const poids = parseFloat(
        formData.poidsNet || formData.poidsBrut || 0
      );
      if (!formData.paysDestination) {
        setCarbonError(
          'Veuillez sélectionner une destination avant d\'activer le calcul carbone.'
        );
        return;
      }
      calculateCarbon();
    } else {
      setCarbonData(null);
      setCarbonError(null);
    }
  }, [carbonEnabled, portDepartId, paysDepart, 
      formData.portId, formData.paysDestination, carbonMode, carbonSubtype]);

  useEffect(() => {
    if (formData.portId && ports.length > 0) {
      const found = ports.find(
        p => String(p.id) === String(formData.portId)
      );
      setPortDestNom(found ? (found.nomPort || found.nom || found.name) : '');
    } else {
      setPortDestNom('');
    }
  }, [formData.portId, ports]);

  return (
    <div>
      {/* Header Section */}
      <div style={{
  background: 'linear-gradient(135deg, #0B1F3A 0%, #1CA7C7 100%)',
  padding: '40px 32px',
  width: '100%',
  margin: 0
}}>
  <h1 style={{
    color: 'white',
    fontSize: '32px',
    fontWeight: '700',
    margin: 0,
    lineHeight: '1.2'
  }}>
    {translate('calculator.title')}
  </h1>
  <p style={{
    color: 'rgba(255,255,255,0.8)',
    margin: '8px 0 0 0',
    fontSize: '16px'
  }}>
    {translate('calculator.subtitle')}
  </p>
</div>

      <div className="maritime-calculator" style={{ marginTop: '0px' }}>

      <div className="calculator-container">
        {/* Left Column - Form */}
        <div className="form-column">
          <div className="form-card">
            <div className="card-header">
              <CalcIcon className="card-icon" />
              <h2 className="card-title">
                {translate('calculator.productInfo')}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="calculator-form">
              {/* Formulaire Importateur - Copie exacte de l'exportateur */}
              {isImportateur && (
                <div className="form-section">
                  <h3 className="section-title">{translate('calculator.basicInfo')}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.category')}
                      </label>
                      <select
                        name="categorie"
                        value={formData.categorie}
                        onChange={handleInputChange}
                        required
                        style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      >
                        <option value="">{translate('calculator.selectCategory')}</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.destination')}
                      </label>
                      {maritimeCountriesError && (
                        <div className="form-error">
                          {maritimeCountriesError}
                        </div>
                      )}
                      {countriesError && (
                        <div className="form-error">
                          {countriesError}
                        </div>
                      )}
                      <select
                        name="paysDestination"
                        value={formData.paysDestination}
                        onChange={handleInputChange}
                        required
                        style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      >
                        <option value="">{translate('calculator.selectDestination')}</option>
                        {maritimeCountries.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flagEmoji ? `${c.flagEmoji} ` : ''}{c.nameFr || c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.unloadingPort')}
                      </label>
                      {portsLoading ? (
                        <div className="loading-text">Chargement des ports...</div>
                      ) : (
                        <select
                          name="portDechargement"
                          value={formData.portDechargement}
                          onChange={e => setFormData({
                            ...formData, 
                            portDechargement: e.target.value
                          })}
                          disabled={portsDestinationLoading}
                          style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                        >
                          <option value="">{translate('calculator.selectPort')}</option>
                          {portsDestination.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nomPort || p.nom || p.name}
                              {p.ville ? ` - ${p.ville}` : ''}
                              {p.fraisPortuaires ? ` | ${p.fraisPortuaires} USD` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                      {portsDestinationMessage && (
                        <div className="form-warning">
                          {portsDestinationMessage}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.product')}
                      </label>
                      {productsError && (
                        <div className="form-error">
                          {productsError}
                        </div>
                      )}
                      <select
                        name="codeHs"
                        value={formData.codeHs}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.categorie || products.length === 0}
                        style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      >
                        <option value="">{translate('calculator.selectProduct')}</option>
                        {products.map((p) => (
                          <option key={p.codeHs} value={p.codeHs}>
                            {p.codeHs} - {p.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {!isImportateur && (
                <div className="form-section">
                  <h3 className="section-title">{translate('calculator.basicInfo')}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.category')}
                      </label>
                      <select
                        name="categorie"
                        value={formData.categorie}
                        onChange={handleInputChange}
                        required
                        style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      >
                        <option value="">{translate('calculator.selectCategory')}</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Pays de départ */}
                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.paysDepart')}
                      </label>
                      <select
                        value={paysDepart}
                        onChange={(e) => {
                          setPaysDepart(e.target.value);
                          setPortDepartId('');
                          setPortDepartNom('');
                          loadPortsByOrigine(e.target.value);
                        }}
                        className="form-select"
                      >
                        <option value="">{translate('calculator.selectDepartureCountry')}</option>
                        {maritimeCountries.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.flagEmoji ? `${c.flagEmoji} ` : ''}{c.nameFr || c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Port de départ */}
                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.portDepart')}
                      </label>
                      {portsOrigineLoading ? (
                        <div className="loading-text">Chargement des ports...</div>
                      ) : (
                        <select
                          value={portDepartId}
                          onChange={(e) => {
                            const found = portsOrigine.find(
                              p => String(p.id) === String(e.target.value)
                            );
                            setPortDepartId(e.target.value);
                            setPortDepartNom(found ? (found.nomPort || found.nom) : '');
                          }}
                          disabled={!paysDepart || portsOrigine.length === 0}
                          style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                        >
                          <option value="">{translate('calculator.selectPort')}</option>
                          {portsOrigine.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nomPort || p.nom || p.name}
                              {p.ville ? ` - ${p.ville}` : ''}
                              {p.fraisPortuaires ? ` | ${p.fraisPortuaires} USD` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                      {portsOrigineMessage && (
                        <div className="form-warning">
                          {portsOrigineMessage}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.destination')}
                      </label>
                      {maritimeCountriesError && (
                        <div className="form-error">
                          {maritimeCountriesError}
                        </div>
                      )}
                      {countriesError && (
                        <div className="form-error">
                          {countriesError}
                        </div>
                      )}
                      <select
                        name="paysDestination"
                        value={formData.paysDestination}
                        onChange={handleInputChange}
                        required
                        disabled={maritimeCountriesLoading}
                        style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      >
                        <option value="">
                          {maritimeCountriesLoading ? translate('calculator.loadingCountries') : translate('calculator.selectCountry')}
                        </option>
                        {(maritimeCountries || []).map((c) => (
                          <option key={c.iso2 || c.code} value={c.nameFr || c.name}>
                            {c.flagEmoji ? `${c.flagEmoji} ` : ''}{c.nameFr || c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        Port (destination)
                      </label>
                      {portsLoading ? (
                        <div className="loading-text">Chargement des ports...</div>
                      ) : (
                        <select
                          name="portId"
                          value={formData.portId}
                          onChange={handleInputChange}
                          disabled={!formData.paysDestination || ports.length === 0}
                          style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                        >
                          <option value="">{translate('calculator.selectPort')}</option>
                          {ports.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.nomPort || p.nom || p.name}
                              {p.ville ? ` - ${p.ville}` : ''}
                              {p.fraisPortuaires ? ` | ${p.fraisPortuaires} USD` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                      {portMessage && (
                        <div className="form-warning">
                          {portMessage}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.product')}
                      </label>
                      <select
                        name="codeHs"
                        value={formData.codeHs}
                        onChange={handleInputChange}
                        required
                        disabled={!formData.categorie}
                        style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      >
                        <option value="">{translate('calculator.selectProduct')}</option>
                        {products.map(product => (
                          <option key={product.id} value={product.codeHs}>
                            {product.nomProduit} ({product.codeHs})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Financial Information Card */}
              <div className="form-section">
                <h3 className="section-title">{translate('calculator.financialInfo')}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      {isImportateur ? translate('calculator.fobValue') : 'Valeur CIF (FOB)'}
                    </label>
                    <input
                      type="number"
                      name="valeurFob"
                      value={formData.valeurFob}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0.01"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                      <label className="form-label">
                        {translate('calculator.transportCost')}
                      </label>
                      <input
                        type="number"
                        name="coutTransport"
                        value={formData.coutTransport}
                        onChange={handleInputChange}
                        required
                        step="0.01"
                        min="0"
                        style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      placeholder="Ex: 500"
                      />
                    </div>

                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.insurance')}
                    </label>
                    <input
                      type="number"
                      name="assurance"
                      value={formData.assurance}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                      placeholder="0.00"
                    />
                  </div>

                  {isImportateur && (
                    <div className="form-group">
                      <label className="form-label">
                        Valeur CIF (Cost Insurance Freight)
                      </label>
                      <input
                        type="number"
                        name="valeurCif"
                        value={formData.valeurCif || ''}
                        onChange={handleInputChange}
                        placeholder="Calculé automatiquement"
                        readOnly
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '2px solid #CBD5E0',
                          borderRadius: '8px',
                          backgroundColor: '#F7FAFC',
                          color: '#2D3748',
                          fontSize: '14px',
                          display: 'block',
                          marginTop: '4px'
                        }}
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.currency')}
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    >
                      {WORLD_CURRENCIES.map(currency => (
                        <option key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Legal Information Card */}
              <div className="form-section">
                <h3 className="section-title">{translate('calculator.legalInfo')}</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.companyName')}
                    </label>
                    <input
                      type="text"
                      name="nomEntreprise"
                      value={formData.nomEntreprise}
                      onChange={handleInputChange}
                      placeholder={translate('calculator.companyName')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.rc')}
                    </label>
                    <input
                      type="text"
                      name="registreCommerce"
                      value={formData.registreCommerce}
                      onChange={handleInputChange}
                      placeholder={translate('calculator.rc')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.ice')}
                    </label>
                    <input
                      type="text"
                      name="ice"
                      value={formData.ice}
                      onChange={handleInputChange}
                      placeholder={translate('calculator.ice')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.incoterm')}
                    </label>
                    <select
                      name="incoterm"
                      value={formData.incoterm}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    >
                      <option value="FOB">FOB (Free On Board)</option>
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                      <option value="DDP">DDP (Delivered Duty Paid)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="form-section">
                <h3 className="section-title">Additional Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.sellingPrice')}
                    </label>
                    <input
                      type="number"
                      name="prixVentePrevisionnel"
                      value={formData.prixVentePrevisionnel}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder={translate('calculator.profitAnalysis')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.netWeight')}
                    </label>
                    <input
                      type="number"
                      name="poidsNet"
                      value={formData.poidsNet}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder={translate('calculator.netWeight')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.grossWeight')}
                    </label>
                    <input
                      type="number"
                      name="poidsBrut"
                      value={formData.poidsBrut}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder={translate('calculator.grossWeight')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      {translate('calculator.unitType')}
                    </label>
                    <input
                      type="text"
                      name="typeUnite"
                      value={formData.typeUnite}
                      onChange={handleInputChange}
                      placeholder={translate('calculator.unitTypePlaceholder')}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '2px solid #CBD5E0',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2D3748',
                        fontSize: '14px',
                        display: 'block',
                        marginTop: '4px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="form-error-card">
                  <AlertCircle className="error-icon" />
                  <p className="error-text">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? translate('calculator.loading') : translate('calculator.calculate')}
              </button>

              {/* Transport mode select */}
              <div style={{marginBottom:'12px'}}>
                <label style={{
                  display:'block', marginBottom:'4px',
                  fontSize:'0.85rem', color:'#475569', fontWeight:'500'
                }}>
                  {translate('carbon.mode.label')}
                </label>
                <select
                  value={carbonMode}
                  onChange={(e) => {
                    setCarbonMode(e.target.value);
                    setCarbonSubtype('');
                    if (carbonEnabled) calculateCarbon();
                  }}
                  style={{
                    width:'100%', padding:'8px 10px',
                    border:'1px solid #cbd5e1', borderRadius:'6px',
                    fontSize:'0.88rem', color:'#0B1F3A', background:'white'
                  }}
                >
                  <option value="maritime">{translate('carbon.mode.maritime')}</option>
                  <option value="road">{translate('carbon.mode.road')}</option>
                  <option value="air">{translate('carbon.mode.air')}</option>
                  <option value="rail">{translate('carbon.mode.rail')}</option>
                </select>
              </div>

              {/* Vessel type select - only for maritime */}
              {carbonMode === 'maritime' && (
                <div style={{marginBottom:'12px'}}>
                  <label style={{
                    display:'block', marginBottom:'4px',
                    fontSize:'0.85rem', color:'#475569', fontWeight:'500'
                  }}>
                    {translate('carbon.subtype.label')}
                  </label>
                  <select
                    value={carbonSubtype}
                    onChange={(e) => {
                      setCarbonSubtype(e.target.value);
                      if (carbonEnabled) calculateCarbon();
                    }}
                    style={{
                      width:'100%', padding:'8px 10px',
                      border:'1px solid #cbd5e1', borderRadius:'6px',
                      fontSize:'0.88rem', color:'#0B1F3A', background:'white'
                    }}
                  >
                    <option value="">
                      {translate('carbon.subtype.placeholder')}
                    </option>
                    <option value="container_ship">
                      {translate('carbon.subtype.container_ship')} — 0.016 kg CO₂/t-km
                    </option>
                    <option value="bulk_carrier">
                      {translate('carbon.subtype.bulk_carrier')} — 0.013 kg CO₂/t-km
                    </option>
                    <option value="tanker">
                      {translate('carbon.subtype.tanker')} — 0.011 kg CO₂/t-km
                    </option>
                    <option value="ferry">
                      {translate('carbon.subtype.ferry')} — 0.190 kg CO₂/t-km
                    </option>
                  </select>
                </div>
              )}

              {/* Checkbox carbon */}
              <div style={{marginTop:'16px',display:'flex',
                alignItems:'center',gap:'10px'}}>
                <input
                  type="checkbox"
                  id="carbonToggle"
                  checked={carbonEnabled}
                  onChange={(e) => setCarbonEnabled(e.target.checked)}
                  style={{width:'18px',height:'18px',
                    accentColor:'#1CA7C7',cursor:'pointer'}}
                />
                <label htmlFor="carbonToggle" style={{
                  color:'#0B1F3A',fontWeight:'500',
                  cursor:'pointer',fontSize:'0.95rem'
                }}>
                  {translate('carbon.checkbox')}
                </label>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className="results-column">
          {result && (
            <div className="results-container">
              <div className="results-card">
                <CostDashboard 
                  result={result} 
                  currency={result?.devise || result?.currency || formData?.currency || 'USD'} 
                />
              </div>
              
              <button
                onClick={handleDownloadPdf}
                className="download-button"
              >
                <Download className="button-icon" />
                {translate('calculator.downloadReport')}
              </button>

              {/* Encart résultat carbon */}
              {carbonEnabled && (
                <div style={{marginTop:'20px',border:'1px solid #1CA7C7',
                  borderRadius:'12px',overflow:'hidden'}}>
                  <div style={{
                    background:'linear-gradient(135deg,#0B1F3A 0%,#1CA7C7 100%)',
                    padding:'16px 20px',color:'white',
                    fontWeight:'600',fontSize:'1rem'
                  }}>
                    {translate('carbon.title')}
                  </div>
                  <div style={{padding:'20px',background:'#f8fafc'}}>
                    {carbonLoading && (
                      <p style={{color:'#64748b',textAlign:'center'}}>
                        {translate('carbon.loading')}
                      </p>
                    )}
                    {carbonError && (
                      <p style={{color:'#dc2626',textAlign:'center'}}>
                        {carbonError}
                      </p>
                    )}
                    {carbonData && !carbonLoading && (
                      <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                        <div style={{display:'flex',justifyContent:'space-between',
                          alignItems:'center'}}>
                          <span style={{color:'#475569',fontWeight:'500'}}>
                            {translate('carbon.co2')}
                          </span>
                          <span style={{color:'#0B1F3A',fontWeight:'700',
                            fontSize:'1.1rem'}}>
                            {carbonData.co2Kg} kg CO₂
                          </span>
                        </div>
                        <div style={{borderTop:'1px solid #e2e8f0'}}/>
                        <div>
                          <p style={{color:'#475569',fontWeight:'500',
                            marginBottom:'6px'}}>
                            {translate('carbon.equation')}
                          </p>
                          <p style={{background:'#e0f2fe',borderRadius:'8px',
                            padding:'10px 14px',color:'#0B1F3A',
                            fontFamily:'monospace',fontSize:'0.9rem'}}>
                            {carbonData.equation}
                          </p>
                        </div>
                        <div style={{borderTop:'1px solid #e2e8f0'}}/>
                        <div style={{display:'flex',justifyContent:'space-between',
                          alignItems:'center'}}>
                          <span style={{color:'#475569',fontWeight:'500'}}>
                            {translate('carbon.cbam')}
                          </span>
                          <span style={{color:'#1CA7C7',fontWeight:'700',
                            fontSize:'1.1rem'}}>
                            {carbonData.cbamTaxEur} €
                          </span>
                        </div>
                        <div style={{background:'#f1f5f9',borderRadius:'8px',
                          padding:'10px 14px',color:'#64748b',fontSize:'0.82rem'}}>
                          {translate('carbon.formula')} : {carbonData.formulaDisplay}
                        </div>
                        <button
                          onClick={generateCarbonPDF}
                          style={{marginTop:'4px',width:'100%',padding:'11px',
                            background:'linear-gradient(135deg,#0B1F3A 0%,#1CA7C7 100%)',
                            color:'white',border:'none',borderRadius:'8px',
                            fontWeight:'600',fontSize:'0.88rem',
                            cursor:'pointer',letterSpacing:'0.4px'}}
                        >
                          {translate('carbon.download')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {!result && (
            <div className="placeholder-card">
              <div className="placeholder-icon">
                <CalcIcon className="w-12 h-12" />
              </div>
              <h3 className="placeholder-title">{translate('calculator.readyTitle')}</h3>
              <p className="placeholder-text">
                {translate('calculator.readyText')}
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}

export default Calculator
