'use client';

import { useState, useEffect, useRef } from 'react';

const RATE_CNY_DZD = 19.69;
const RATE_CNY_EUR = 0.13;

// ---- Car cost models ----
// baseVehicleDZD = 车辆裸价（不含 FOB），精确到百位
// fobItems = FOB 港口之前的明细费用（RMB → DZD，精确到百位）
// fobServiceFeeDZD = 服务费（devis 固定值，非比例计算）
const carModels = {
  lavida: {
    name: 'Volkswagen Lavida 2025',
    baseVehicleDZD: 1575200,
    baseVehicleRMB: 80000,
    incoterm: 'FOB Shanghai',
    fobItems: [
      { label: 'Inspection du véhicule (contrôle qualité)', rmb: 2000, dzd: 39400 },
      { label: 'Transport intérieur jusqu\'au port de Shanghai', rmb: 1500, dzd: 29500 },
      { label: 'Frais d\'agence export (formalités)', rmb: 3000, dzd: 59100 },
      { label: 'Déclaration en douane (exportation)', rmb: 600, dzd: 11800 },
      { label: 'Frais portuaires (terminal & manutention)', rmb: 2500, dzd: 49200 },
      { label: 'Documents export (facture, packing list, BL)', rmb: 600, dzd: 11800 },
      { label: 'Frais bancaires (virement T/T)', rmb: 300, dzd: 5900 },
      { label: 'Divers (imprévus)', rmb: 500, dzd: 9800 },
    ],
    fobServiceFeeDZD: 89600,  // 4 550 RMB × 19.69 → 89 600
    fobServiceFeeRMB: 4550,
    fobServiceLabel: 'Service China Auto Algérie (5%)',
    seaFreight: 185000,
    seaInsuranceRate: 0.008,
    seaPortFees: 30000,
    customsRate: 0.30,
    tvaRate: 0.19,
  },
  livan: {
    name: 'Geely Livan X3 Pro 2026',
    incoterm: 'FOB Guangdong',
    minOrder: 4,
    minOrderNote: 'Minimum 4 véhicules par conteneur (1ère commande)',
    fobItems: [
      { label: 'Transport intérieur jusqu\'au port de Nanhai (Guangdong)', rmb: 1600, dzd: 31500 },
      { label: 'Frais d\'agence export (formalités)', rmb: 3000, dzd: 59100 },
      { label: 'Déclaration en douane (exportation)', rmb: 600, dzd: 11800 },
      { label: 'Frais portuaires (terminal & manutention)', rmb: 2500, dzd: 49200 },
      { label: 'Documents export (facture, packing list, BL)', rmb: 600, dzd: 11800 },
      { label: 'Divers (imprévus)', rmb: 500, dzd: 9800 },
    ],
    fobServiceFeeDZD: 59100,  // 3 000 RMB × 19.69 → 59 100
    fobServiceFeeRMB: 3000,
    fobServiceLabel: 'Service China Auto Algérie (5%)',
    seaFreight: 185000,
    seaInsuranceRate: 0.008,
    seaPortFees: 30000,
    customsRate: 0.30,
    tvaRate: 0.19,
    variants: [
      { key: 'manual', label: 'Manuelle · Sans toit ouvrant', baseVehicleRMB: 43300, baseVehicleDZD: 852600 },
      { key: 'manual-sun', label: 'Manuelle · Avec toit ouvrant', baseVehicleRMB: 44300, baseVehicleDZD: 872300 },
      { key: 'auto', label: 'Automatique · Avec toit ouvrant', baseVehicleRMB: 48500, baseVehicleDZD: 955000 },
    ],
    defaultVariant: 'manual',
  },
  tcross: {
    name: 'Volkswagen T-Cross 2023',
    baseVehicleDZD: 1098500,
    baseVehicleRMB: 55789,
    incoterm: 'FOB Shanghai',
    fobItems: [
      { label: 'Inspection du véhicule (contrôle qualité + rapport)', rmb: 2000, dzd: 39400 },
      { label: 'Transport intérieur jusqu\'au port de Shanghai', rmb: 1500, dzd: 29500 },
      { label: 'Préparation véhicule (nettoyage, contrôle, remise en état)', rmb: 500, dzd: 9800 },
      { label: 'Frais d\'agence export (formalités)', rmb: 3000, dzd: 59100 },
      { label: 'Déclaration en douane (exportation)', rmb: 600, dzd: 11800 },
      { label: 'Frais portuaires (terminal & manutention)', rmb: 2500, dzd: 49200 },
      { label: 'Documents export (facture, packing list, BL)', rmb: 600, dzd: 11800 },
      { label: 'Frais bancaires (virement T/T)', rmb: 200, dzd: 3900 },
      { label: 'Divers (imprévus)', rmb: 500, dzd: 9800 },
    ],
    fobServiceFeeDZD: 66200,
    fobServiceFeeRMB: 3359,
    fobServiceLabel: 'Service China Auto Algérie (5%)',
    seaFreight: 185000,
    seaInsuranceRate: 0.008,
    seaPortFees: 30000,
    customsRate: 0.30,
    tvaRate: 0.19,
  },
  coolray: {
    name: 'Geely Coolray 668',
    baseVehicleDZD: 1063300,
    baseVehicleRMB: 54000,
    incoterm: 'FOB Nansha',
    fobItems: [
      { label: 'Inspection du véhicule (contrôle qualité)', rmb: 0, dzd: 0 },
      { label: 'Transport intérieur jusqu\'au port de Nansha (Guangdong)', rmb: 0, dzd: 0 },
      { label: 'Frais d\'agence export (formalités)', rmb: 1500, dzd: 29500 },
      { label: 'Déclaration en douane (exportation)', rmb: 600, dzd: 11800 },
      { label: 'Frais portuaires (terminal & manutention)', rmb: 2500, dzd: 49200 },
      { label: 'Documents export (facture, packing list, BL)', rmb: 600, dzd: 11800 },
      { label: 'Frais bancaires (virement T/T)', rmb: 0, dzd: 0 },
      { label: 'Divers (imprévus)', rmb: 500, dzd: 9800 },
    ],
    fobServiceFeeDZD: 58700,
    fobServiceFeeRMB: 2985,
    fobServiceLabel: 'Service China Auto Algérie (5%)',
    seaFreight: 185000,
    seaInsuranceRate: 0.008,
    seaPortFees: 30000,
    customsRate: 0.30,
    tvaRate: 0.19,
  },
};

function formatDA(amount) {
  return amount.toLocaleString('fr-DZ') + ' DA';
}
function formatEUR(amount) {
  return Math.round(amount / RATE_CNY_DZD * RATE_CNY_EUR).toLocaleString('fr-FR') + ' \u20AC';
}
function roundDA(v) {
  return Math.round(v / 100) * 100;
}

function calcSimTotal(model, toggles, variantKey) {
  if (!model) return null;
  const variant = model.variants ? model.variants.find(v => v.key === variantKey) : null;
  const baseVehicleDZD = variant ? variant.baseVehicleDZD : model.baseVehicleDZD;
  const baseVehicleRMB = variant ? variant.baseVehicleRMB : model.baseVehicleRMB;
  const { fobItems, fobServiceFeeDZD, fobServiceLabel, incoterm, seaFreight, seaInsuranceRate, seaPortFees, customsRate, tvaRate } = model;

  let subtotal = baseVehicleDZD;
  const lines = [{ label: 'Prix d\'achat du véhicule (hors FOB)', value: baseVehicleDZD, always: true }];
  const fobLines = [];
  const seaLines = [];
  const tariffLines = [];

  if (toggles.fob) {
    const fobTotal = fobItems.reduce((sum, item) => sum + item.dzd, 0);
    subtotal += fobTotal + fobServiceFeeDZD;
    lines.push({ label: 'Coût ' + incoterm, value: fobTotal + fobServiceFeeDZD, toggle: 'fob' });
    fobLines.push(...fobItems.map(item => ({ ...item, type: 'fob' })));
    fobLines.push({ label: fobServiceLabel, dzd: fobServiceFeeDZD, type: 'fob' });
  }

  if (toggles.sea) {
    const assurance = roundDA(subtotal * seaInsuranceRate);
    const seaTotal = seaFreight + assurance + seaPortFees;
    subtotal += seaTotal;
    lines.push({ label: 'Fret maritime, assurance & port Algérie', value: seaTotal, toggle: 'sea' });
    seaLines.push(
      { label: 'Fret maritime Shanghai → Alger', dzd: seaFreight, type: 'sea' },
      { label: 'Assurance maritime (0,8%)', dzd: assurance, type: 'sea' },
      { label: 'Frais portuaires & déchargement Alger', dzd: seaPortFees, type: 'sea' }
    );
  }

  if (toggles.tariff) {
    const cif = subtotal;
    const customs = roundDA(cif * customsRate);
    const tva = roundDA((cif + customs) * tvaRate);
    subtotal += customs + tva;
    lines.push({ label: 'Droits de douane & TVA', value: customs + tva, toggle: 'tariff' });
    tariffLines.push(
      { label: 'Droits de douane (30% de la valeur CIF)', dzd: customs, type: 'tariff' },
      { label: 'TVA Algérie (19%)', dzd: tva, type: 'tariff' }
    );
  }

  return { lines, total: subtotal, fobLines, seaLines, tariffLines, baseVehicleDZD, baseVehicleRMB };
}

export default function Home() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', city: '', model: '', budget: '', message: '' });
  const [formStatus, setFormStatus] = useState({ text: '', color: '' });
  const [submitting, setSubmitting] = useState(false);
  const [simModelKey, setSimModelKey] = useState('');
  const [simVariantKey, setSimVariantKey] = useState('');
  const [simToggles, setSimToggles] = useState({ fob: false, sea: false, tariff: false });
  const [simLead, setSimLead] = useState({ phone: '', email: '', status: '', submitting: false });

  const navbarRef = useRef(null);
  const fadeRefs = useRef([]);

  // Navbar scroll effect
  useEffect(() => {
    const onScroll = () => {
      if (navbarRef.current) {
        navbarRef.current.classList.toggle('scrolled', window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fade-in observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    const els = document.querySelectorAll('.fade-in');
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Smooth scroll for anchor links
  useEffect(() => {
    const handler = (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const handleChange = (e) => {
    setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleModelSelect = (e) => {
    const key = e.target.value;
    setSimModelKey(key);
    const model = carModels[key];
    setSimVariantKey(model?.defaultVariant || '');
    setSimToggles({ fob: false, sea: false, tariff: false });
  };

  const handleVariantSelect = (key) => {
    setSimVariantKey(key);
    setSimToggles({ fob: false, sea: false, tariff: false });
  };

  const handleToggle = (key) => {
    setSimToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSimLeadChange = (e) => {
    setSimLead(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSimLeadSubmit = async (e) => {
    e.preventDefault();
    if (!simLead.phone.trim()) {
      setSimLead(prev => ({ ...prev, status: 'Veuillez indiquer votre numéro WhatsApp.' }));
      return;
    }
    setSimLead(prev => ({ ...prev, submitting: true, status: '' }));

    const model = carModels[simModelKey];
    const variant = model?.variants?.find(v => v.key === simVariantKey);
    const result = model ? calcSimTotal(model, simToggles, simVariantKey) : null;
    const modelLabel = variant ? `${model.name} — ${variant.label}` : model?.name || '';
    const included = [
      simToggles.fob ? 'FOB' : '',
      simToggles.sea ? 'Fret maritime' : '',
      simToggles.tariff ? 'Douane & TVA' : '',
    ].filter(Boolean).join(', ') || 'Prix du véhicule seul';

    const payload = {
      name: 'Demande depuis calculateur',
      email: simLead.email,
      phone: simLead.phone,
      city: '',
      model: modelLabel,
      budget: result ? `Total estimé : ${formatDA(result.total)} (${formatEUR(result.total)})` : '',
      message: `Demande générée depuis le simulateur de prix.\nModèle : ${modelLabel}\nOptions incluses : ${included}\n${result ? `Total estimé : ${formatDA(result.total)} (${formatEUR(result.total)})` : ''}`,
    };

    try {
      const resp = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (resp.ok) {
        setSimLead({ phone: '', email: '', status: 'Merci, nous vous contacterons rapidement sur WhatsApp.', submitting: false });
      } else {
        setSimLead(prev => ({ ...prev, status: 'Échec de l\'envoi. Veuillez réessayer ou nous contacter sur WhatsApp.', submitting: false }));
      }
    } catch {
      setSimLead(prev => ({ ...prev, status: 'Erreur réseau. Veuillez réessayer ou nous contacter sur WhatsApp.', submitting: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormStatus({ text: '', color: '' });

    try {
      const resp = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });
      const data = await resp.json();
      if (resp.ok) {
        setFormStatus({ text: 'Merci, nous vous contacterons rapidement sur WhatsApp.', color: '#059669' });
        setFormState({ name: '', email: '', phone: '', city: '', model: '', budget: '', message: '' });
      } else {
        setFormStatus({ text: '\u274C \u00c9chec de l\'envoi. Veuillez r\u00e9essayer ou nous contacter sur WhatsApp.', color: '#dc2626' });
      }
    } catch {
      setFormStatus({ text: '\u274C Erreur r\u00e9seau. Veuillez r\u00e9essayer.', color: '#dc2626' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Trust Banner */}
      <div className="trust-banner">
        🇨🇳 Import direct · Prix FOB transparents · Service local en Algérie 🇩🇿
      </div>

      {/* Navbar */}
      <nav className="navbar" ref={navbarRef} id="navbar">
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <img src="/logo/Logo-Icon-v2.png" alt="China Auto Algérie" />
            China Auto Algérie
          </a>
          <ul className="nav-links">
            <li><a href="#pourquoi">Pourquoi nous</a></li>
            <li><a href="#modeles">Modèles</a></li>
            <li><a href="#processus">Processus</a></li>
            <li><a href="#simulateur">Simulateur</a></li>
            <li><a href="#equipe">Équipe</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <a href="#contact" className="btn btn-primary">Devis gratuit</a>
          <button className="mobile-menu-btn" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-badge">Import · Vente · Livraison</span>
          <h1>Votre prochaine voiture<br /><span className="accent">vient de Chine</span></h1>
          <p>
            China Auto Algérie est votre porte d&apos;entrée professionnelle pour les véhicules chinois neufs en Algérie.
            Prix direct usine, accompagnement complet, livraison locale.
          </p>
          <div className="hero-ctas">
            <a href="#contact" className="btn btn-white btn-large">📋 Obtenir un devis gratuit</a>
            <a href="https://wa.me/85269724241" className="btn btn-outline btn-large" style={{ color: 'white', borderColor: 'white' }}>📞 WhatsApp +852 6972 4241</a>
          </div>
        </div>
        <div className="hero-scroll">⌄</div>
      </section>

      {/* Pourquoi Nous */}
      <section className="section" id="pourquoi">
        <p className="section-label">Pourquoi nous choisir</p>
        <h2 className="section-title">Trois piliers, une promesse</h2>
        <p className="section-subtitle">Nous ne sommes pas un simple revendeur. Nous sommes votre partenaire automobile pour accéder directement au marché chinois.</p>
        <div className="cards-grid">
          <div className="value-card fade-in">
            <div className="value-card-image"><img src="/images/supply-chain-factory.png" alt="Usine automobile chinoise" /></div>
            <div className="value-card-body">
              <div className="icon">🏭</div>
              <h3>Chaîne d&apos;approvisionnement directe</h3>
              <p>Nous travaillons directement avec les usines et fournisseurs chinois. Pas d&apos;intermédiaire, pas de marge cachée. Le prix que vous voyez est le vrai prix FOB Shanghai.</p>
            </div>
          </div>
          <div className="value-card fade-in">
            <div className="value-card-image"><img src="/images/supply-chain-inspection.png" alt="Inspection qualité véhicule" /></div>
            <div className="value-card-body">
              <div className="icon">✅</div>
              <h3>Qualité contrôlée</h3>
              <p>Chaque véhicule est inspecté avant expédition. Nous sélectionnons des marques fiables comme Volkswagen, Geely, et d&apos;autres constructeurs chinois reconnus internationalement.</p>
            </div>
          </div>
          <div className="value-card fade-in">
            <div className="value-card-image"><img src="/images/team-algeria-local.png" alt="Équipe locale en Algérie" /></div>
            <div className="value-card-body">
              <div className="icon">🤝</div>
              <h3>Service local en Algérie</h3>
              <p>Une équipe algérienne vous accueille, vous présente les véhicules et assure la livraison. Vous avez un interlocuteur local, en français et en arabe, à chaque étape.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Logistics Gallery */}
      <section className="section" style={{ paddingTop: 0 }}>
        <p className="section-label">De la Chine à l&apos;Algérie</p>
        <h2 className="section-title">Une chaîne logistique maîtrisée</h2>
        <p className="section-subtitle">Conteneurisation, transport maritime et livraison — chaque étape est suivie avec rigueur.</p>
        <div className="image-gallery">
          <div className="gallery-item tall">
            <img src="/images/logistics-container-loading.png" alt="Chargement de conteneurs au port chinois" />
            <div className="gallery-caption"><h4>Chargement & conteneurisation</h4><p>Vos véhicules sécurisés dans des conteneurs au port d&apos;export</p></div>
          </div>
          <div className="gallery-item">
            <img src="/images/logistics-ocean-freight.png" alt="Transport maritime en conteneur" />
            <div className="gallery-caption"><h4>Transport maritime</h4><p>Fret sécurisé par voie maritime depuis la Chine</p></div>
          </div>
          <div className="gallery-item">
            <img src="/images/supply-chain-port.png" alt="Port de Shanghai expédition" />
            <div className="gallery-caption"><h4>Arrivée au port algérien</h4><p>Dédouanement et livraison jusqu&apos;à votre ville</p></div>
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="section" style={{ paddingTop: 20 }}>
        <div className="video-wrapper fade-in">
          <video autoPlay muted loop playsInline poster="/images/supply-chain-port.png">
            <source src="/videos/logistics-ship.mp4" type="video/mp4" />
          </video>
          <div className="video-caption">
            <h4>De la Chine jusqu&apos;à vous — le parcours complet</h4>
            <p>Chargement au port chinois, transport maritime, arrivée au port algérien, dédouanement et livraison clé en main</p>
          </div>
        </div>
      </section>

      {/* Modèles */}
      <div className="bg-light" id="modeles">
        <div className="section">
          <p className="section-label">Nos modèles disponibles</p>
          <h2 className="section-title">Des véhicules neufs, importés pour vous</h2>
          <p className="section-subtitle">Véhicules neufs et d&apos;occasion, importés pour vous avec devis FOB transparent. D&apos;autres modèles disponibles sur demande.</p>
          <div className="car-cards">
            <div className="car-card fade-in">
              <div className="car-card-image">
                <span className="car-badge">En stock</span>
                <img src="/images/volkswagen-lavida-2025.png?v=5" alt="Volkswagen Lavida 2025" />
              </div>
              <div className="car-card-body">
                <span className="brand">Volkswagen</span>
                <h3>Lavida 2025</h3>
                <div className="car-specs">
                  <div className="car-spec-item"><span className="dot"></span>1.5L Essence</div>
                  <div className="car-spec-item"><span className="dot"></span>Automatique</div>
                  <div className="car-spec-item"><span className="dot"></span>Neuf</div>
                </div>
                <div className="car-colors">
                  <span className="car-color-label">Couleurs :</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#1a1a1a' }}></span>Noir</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#8a8d91' }}></span>Gris</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#f2f2f2', boxShadow: '0 0 0 1px rgba(0,0,0,0.2)' }}></span>Blanc</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#c5c9cc' }}></span>Argent</span>
                </div>
                <div className="car-price"><span className="car-price-from">À partir de</span>1 575 200 DA</div>
                <div className="car-price-eur">≈ 80 000 RMB · 10 400 €</div>
                <div className="car-price-note">Prix d&apos;achat du véhicule, hors FOB et transport maritime</div>
                <a href="#contact" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Demander un devis détaillé</a>
              </div>
            </div>
            <div className="car-card fade-in">
              <div className="car-card-image">
                <span className="car-badge">Nouveau · SUV</span>
                <img src="/images/geely-livan-x3-pro.png?v=7" alt="Geely Livan X3 Pro 2026" />
              </div>
              <div className="car-card-body">
                <span className="brand">Geely</span>
                <h3>Livan X3 Pro 2026</h3>
                <p className="car-variant">Manuelle · Sans toit ouvrant</p>
                <div className="car-colors">
                  <span className="car-color-label">Couleurs :</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#1a1a1a' }}></span>Noir</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#8a8d91' }}></span>Gris</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#f2f2f2', boxShadow: '0 0 0 1px rgba(0,0,0,0.2)' }}></span>Blanc</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#c5c9cc' }}></span>Argent</span>
                </div>
                <div className="car-price"><span className="car-price-from">À partir de</span>852 600 DA</div>
                <div className="car-price-eur">≈ 43 300 RMB · 5 629 €</div>
                <div className="car-price-note">Prix d&apos;achat du véhicule, hors FOB et transport maritime. Min. 4 véhicules/conteneur</div>
                <a href="#contact" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Demander un devis détaillé</a>
              </div>
            </div>
            <div className="car-card fade-in">
              <div className="car-card-image">
                <span className="car-badge">Occasion</span>
                <img src="/images/volkswagen-tcross-2025.png" alt="Volkswagen T-Cross 2023" />
              </div>
              <div className="car-card-body">
                <span className="brand">Volkswagen</span>
                <h3>T-Cross 2023</h3>
                <div className="car-specs">
                  <div className="car-spec-item"><span className="dot"></span>Essence</div>
                  <div className="car-spec-item"><span className="dot"></span>Automatique</div>
                  <div className="car-spec-item"><span className="dot"></span>50 000 km</div>
                </div>
                <div className="car-colors">
                  <span className="car-color-label">Couleurs :</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#1a1a1a' }}></span>Noir</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#8a8d91' }}></span>Gris</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#f2f2f2', boxShadow: '0 0 0 1px rgba(0,0,0,0.2)' }}></span>Blanc</span>
                </div>
                <div className="car-price"><span className="car-price-from">À partir de</span>1 098 500 DA</div>
                <div className="car-price-eur">≈ 55 789 RMB · 7 253 €</div>
                <div className="car-price-note">Véhicule d&apos;occasion contrôlé. Prix d&apos;achat, hors FOB et transport maritime</div>
                <a href="#contact" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Demander un devis détaillé</a>
              </div>
            </div>
            <div className="car-card fade-in">
              <div className="car-card-image">
                <span className="car-badge">Nouveau · SUV</span>
                <img src="/images/geely-coolray-668.png" alt="Geely Coolray 668" />
              </div>
              <div className="car-card-body">
                <span className="brand">Geely</span>
                <h3>Coolray 668</h3>
                <div className="car-specs">
                  <div className="car-spec-item"><span className="dot"></span>Toit ouvrant panoramique</div>
                  <div className="car-spec-item"><span className="dot"></span>Vitres teintées d&apos;origine</div>
                  <div className="car-spec-item"><span className="dot"></span>Garantie 4 ans / 100 000 km</div>
                  <div className="car-spec-item"><span className="dot"></span>Multimédia FR · AR · EN</div>
                </div>
                <div className="car-colors">
                  <span className="car-color-label">Couleurs :</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#1a1a1a' }}></span>Noir</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#8a8d91' }}></span>Gris</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#f2f2f2', boxShadow: '0 0 0 1px rgba(0,0,0,0.2)' }}></span>Blanc</span>
                  <span className="car-color"><span className="swatch" style={{ background: '#b01116' }}></span>Rouge</span>
                </div>
                <div className="car-price"><span className="car-price-from">À partir de</span>1 063 300 DA</div>
                <div className="car-price-eur">≈ 54 000 RMB · 7 020 €</div>
                <div className="car-price-note">Version internationale Afrique. Réseau après-vente Geely agréé en Algérie. Prix hors FOB et transport maritime</div>
                <a href="#contact" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Demander un devis détaillé</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process */}
      <section className="section" id="processus">
        <p className="section-label">Comment ça marche</p>
        <h2 className="section-title">De la Chine à votre garage</h2>
        <p className="section-subtitle">Un processus clair et transparent, de la commande à la livraison en Algérie.</p>
        <div className="steps">
          <div className="step fade-in"><h4>Consultation</h4><p>Contactez-nous sur WhatsApp. Choisissez votre modèle et recevez un devis FOB personnalisé sous 24h.</p></div>
          <div className="step fade-in"><h4>Commande — 50%</h4><p>Versez 50% d&apos;acompte à la commande. Nous réservons et achetons votre véhicule en Chine.</p></div>
          <div className="step fade-in"><h4>Paiement complet</h4><p>Règlement du solde (50% restants) avant départ de Chine. Le véhicule est payé intégralement avant expédition.</p></div>
          <div className="step fade-in"><h4>Expédition & Livraison</h4><p>Transport maritime, dédouanement en Algérie, puis remise des clés par notre équipe locale.</p></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 40, padding: 24, background: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
          <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>💰 Paiement sécurisé</p>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem' }}>50% à la commande · 50% avant départ de Chine · Véhicule payé intégralement avant expédition</p>
        </div>
      </section>

      {/* Cost Simulator */}
      <section className="section" id="simulateur">
        <p className="section-label">Calculateur</p>
        <h2 className="section-title">Calculez votre prix total en quelques clics</h2>
        <p className="section-subtitle">Sélectionnez un modèle, puis ajoutez les coûts que vous souhaitez inclure. Le total se met à jour automatiquement.</p>
        <div className="simulator" id="simulator">
          <div className="sim-selector">
            <label htmlFor="carSelect">Choisissez votre modèle</label>
            <select id="carSelect" value={simModelKey} onChange={handleModelSelect}>
              <option value="">-- Sélectionner un modèle --</option>
              <option value="lavida">Volkswagen Lavida 2025</option>
              <option value="livan">Geely Livan X3 Pro 2026</option>
              <option value="tcross">Volkswagen T-Cross 2023 (Occasion)</option>
              <option value="coolray">Geely Coolray 668</option>
            </select>
          </div>

          {simModelKey && carModels[simModelKey] && (() => {
            const model = carModels[simModelKey];
            const result = calcSimTotal(model, simToggles, simVariantKey);

            return (
              <div className="sim-result">
                {/* Variant selector for Livan */}
                {model.variants && (
                  <div className="sim-variants">
                    <p className="sim-variants-title">Choisissez la finition :</p>
                    <div className="sim-variant-options">
                      {model.variants.map((v) => (
                        <label key={v.key} className={`sim-variant-radio ${simVariantKey === v.key ? 'checked' : ''}`}>
                          <input
                            type="radio"
                            name="sim-variant"
                            value={v.key}
                            checked={simVariantKey === v.key}
                            onChange={() => handleVariantSelect(v.key)}
                          />
                          <span className="sim-variant-radio-indicator"></span>
                          <span className="sim-variant-radio-body">
                            <span className="sim-variant-radio-label">{v.label}</span>
                            <span className="sim-variant-radio-price">{formatDA(v.baseVehicleDZD)}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Base price — always visible */}
                <div className="sim-base-price">
                  <span className="sim-base-label">Prix d&apos;achat du véhicule (hors FOB)</span>
                  <span className="sim-base-value">{formatDA(result.baseVehicleDZD)}</span>
                  <span className="sim-base-eur">≈ {result.baseVehicleRMB.toLocaleString('fr-FR')} RMB · {formatEUR(result.baseVehicleDZD)}</span>
                </div>

                {/* Toggle layers */}
                <div className="sim-layers">
                  <p className="sim-layers-title">Ajoutez les coûts supplémentaires :</p>

                  {/* Layer 1: FOB */}
                  <label className={`sim-checkbox ${simToggles.fob ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={simToggles.fob}
                      onChange={() => handleToggle('fob')}
                    />
                    <span className="sim-checkbox-indicator"></span>
                    <span className="sim-checkbox-body">
                      <span className="sim-checkbox-title">+ {model.incoterm}</span>
                      <span className="sim-checkbox-desc">Inspection, transport intérieur, documents export, frais portuaires et service 5%</span>
                    </span>
                    <span className="sim-checkbox-price">+ {formatDA(result.lines.find(l => l.toggle === 'fob')?.value || 0)}</span>
                  </label>
                  {simToggles.fob && result.fobLines.length > 0 && (
                    <div className="sim-layer-detail">
                      {result.fobLines.map((item, i) => (
                        <div key={i} className="sim-layer-detail-line">
                          <span>{item.label}</span>
                          <span>{formatDA(item.dzd)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Layer 2: Sea freight */}
                  <label className={`sim-checkbox ${simToggles.sea ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={simToggles.sea}
                      onChange={() => handleToggle('sea')}
                    />
                    <span className="sim-checkbox-indicator"></span>
                    <span className="sim-checkbox-body">
                      <span className="sim-checkbox-title">+ Fret maritime, assurance & port Algérie</span>
                      <span className="sim-checkbox-desc">Transport Shanghai → Alger, assurance maritime, frais de déchargement</span>
                    </span>
                    <span className="sim-checkbox-price">+ {formatDA(result.lines.find(l => l.toggle === 'sea')?.value || 0)}</span>
                  </label>
                  {simToggles.sea && result.seaLines.length > 0 && (
                    <div className="sim-layer-detail">
                      {result.seaLines.map((item, i) => (
                        <div key={i} className="sim-layer-detail-line">
                          <span>{item.label}</span>
                          <span>{formatDA(item.dzd)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Layer 3: Local tariffs */}
                  <label className={`sim-checkbox ${simToggles.tariff ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={simToggles.tariff}
                      onChange={() => handleToggle('tariff')}
                    />
                    <span className="sim-checkbox-indicator"></span>
                    <span className="sim-checkbox-body">
                      <span className="sim-checkbox-title">+ Droits de douane & TVA (importation Algérie)</span>
                      <span className="sim-checkbox-desc">Droits de douane 30% sur CIF + TVA 19% sur (CIF + douane)</span>
                    </span>
                    <span className="sim-checkbox-price">+ {formatDA(result.lines.find(l => l.toggle === 'tariff')?.value || 0)}</span>
                  </label>
                  {simToggles.tariff && result.tariffLines.length > 0 && (
                    <div className="sim-layer-detail">
                      {result.tariffLines.map((item, i) => (
                        <div key={i} className="sim-layer-detail-line">
                          <span>{item.label}</span>
                          <span>{formatDA(item.dzd)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Result breakdown */}
                {result && (
                  <div className="sim-breakdown">
                    <h4>Détail du calcul</h4>
                    {result.lines.map((line, i) => (
                      <div key={i} className={`sim-line ${line.always ? 'sim-line-base' : ''}`}>
                        <span>{line.label}</span>
                        <span>{formatDA(line.value)}</span>
                      </div>
                    ))}
                    <div className="sim-line sim-total">
                      <span>Total estimé</span>
                      <span>{formatDA(result.total)} ({formatEUR(result.total)})</span>
                    </div>
                  </div>
                )}

                <div className="sim-chart">
                  {result && result.lines.map((line, i) => {
                    const colors = ['#0F6E56', '#38B2AC', '#ED8936', '#E53E3E'];
                    return (
                      <div key={i} className="sim-chart-bar" style={{ flex: line.value, background: colors[i % colors.length] }} title={`${line.label}: ${formatDA(line.value)}`}></div>
                    );
                  })}
                </div>

                <div className="sim-note">
                  <p>⚠️ Estimation indicative. Les frais réels peuvent varier selon le volume, la saison et les tarifs douaniers en vigueur. Contactez-nous sur WhatsApp pour un devis personnalisé et précis.</p>
                </div>

                {/* Lead capture CTA */}
                <div className="sim-lead-cta">
                  <h4>Recevoir ce devis personnalisé</h4>
                  <p>Laissez vos coordonnées, notre équipe vous recontacte sous 24h — ou écrivez-nous directement sur WhatsApp.</p>
                  <form onSubmit={handleSimLeadSubmit} className="sim-lead-form">
                    <div className="sim-lead-fields">
                      <input
                        type="tel"
                        name="phone"
                        placeholder="WhatsApp / Téléphone *"
                        value={simLead.phone}
                        onChange={handleSimLeadChange}
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email (optionnel)"
                        value={simLead.email}
                        onChange={handleSimLeadChange}
                      />
                    </div>
                    <div className="sim-lead-actions">
                      <button type="submit" className="btn btn-primary" disabled={simLead.submitting}>
                        {simLead.submitting ? 'Envoi en cours...' : '📩 Envoyer ma demande'}
                      </button>
                      <a href="https://wa.me/85269724241" className="btn btn-whatsapp">
                        💬 WhatsApp +852 6972 4241
                      </a>
                    </div>
                    {simLead.status && (
                      <p className="sim-lead-status" style={{ color: simLead.status.includes('Merci') ? '#059669' : '#dc2626' }}>
                        {simLead.status}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Local Team */}
      <div className="bg-light" id="equipe">
        <div className="section">
          <div className="split-section reverse">
            <div className="split-image"><img src="/images/team-algeria-local.png" alt="Équipe China Auto Algérie" /></div>
            <div className="split-content">
              <p className="section-label">Service local</p>
              <h2>Une équipe algérienne à votre écoute</h2>
              <p>Chez China Auto Algérie, nous croyons que la confiance se construit localement. C&apos;est pourquoi nous avons une équipe sur place pour vous accompagner.</p>
              <p>De la première question sur WhatsApp à la remise des clés, vous avez un interlocuteur francophone et un point de contact physique en Algérie.</p>
              <ul className="checklist">
                <li>Conseil personnalisé en français et arabe</li>
                <li>Visite et présentation des véhicules</li>
                <li>Accompagnement administratif local</li>
                <li>Livraison et suivi après-vente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Delivery */}
      <section className="section">
        <div className="split-section">
          <div className="split-image"><img src="/images/delivery-handover.png" alt="Livraison d'une voiture en Algérie" /></div>
          <div className="split-content">
            <p className="section-label">Livraison réussie</p>
            <h2>Votre voiture, jusqu&apos;à votre porte</h2>
            <p>Notre objectif : que votre achat soit aussi simple que s&apos;il se passait dans une concession locale, mais avec les avantages de prix du marché chinois.</p>
            <p>Nous gérons l&apos;ensemble de la chaîne — inspection, documents, expédition maritime, dédouanement — et notre équipe locale s&apos;assure que la remise de votre véhicule se fasse en toute sérénité.</p>
            <a href="#contact" className="btn btn-primary btn-large" style={{ marginTop: 16 }}>🚗 Commander ma voiture</a>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="section">
        <div className="cta-section">
          <h2>Prêt à commander votre véhicule ?</h2>
          <p>Obtenez un devis gratuit et personnalisé en moins de 24 heures. Notre équipe francophone est à votre écoute.</p>
          <a href="#contact" className="btn btn-white btn-large">📋 Demander mon devis gratuit</a>
        </div>
      </section>

      {/* Contact */}
      <section className="section" id="contact">
        <p className="section-label">Contactez-nous</p>
        <h2 className="section-title">Parlons de votre projet</h2>
        <p className="section-subtitle">Remplissez le formulaire ou contactez-nous directement sur WhatsApp.</p>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Nos coordonnées</h3>
            <div className="contact-item">
              <div className="contact-item-icon">📞</div>
              <div className="contact-item-text">
                <strong>WhatsApp</strong>
                <a href="https://wa.me/85269724241">+852 6972 4241</a>
                <span>Réponse rapide en français et arabe</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">✉️</div>
              <div className="contact-item-text">
                <strong>Email</strong>
                <a href="mailto:contact@chinaautoalgerie.com">contact@chinaautoalgerie.com</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">📍</div>
              <div className="contact-item-text"><strong>Adresse</strong><span>Algérie</span></div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon">🕐</div>
              <div className="contact-item-text">
                <strong>Heures d&apos;ouverture</strong>
                <span>Dim – Jeu : 09h00 – 19h00<br />Ven : 09h00 – 12h00 · Sam : 10h00 – 17h00</span>
              </div>
            </div>
          </div>
          <div className="contact-form">
            <h4>Formulaire de contact</h4>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nom complet *</label>
                <input type="text" id="name" name="name" required placeholder="Votre nom" value={formState.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="votre@email.com" value={formState.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Téléphone WhatsApp *</label>
                <input type="tel" id="phone" name="phone" required placeholder="+213 XX XX XX XX" value={formState.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="city">Ville en Algérie</label>
                <input type="text" id="city" name="city" placeholder="Alger, Oran, Constantine..." value={formState.city} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="model">Modèle qui vous intéresse</label>
                <select id="model" name="model" value={formState.model} onChange={handleChange}>
                  <option value="">Sélectionnez un modèle</option>
                  <option value="Volkswagen Lavida 2025">Volkswagen Lavida 2025</option>
                  <option value="Geely Livan X3 Pro 2026">Geely Livan X3 Pro 2026</option>
                  <option value="Volkswagen T-Cross 2023 (Occasion)">Volkswagen T-Cross 2023 (Occasion)</option>
                  <option value="Geely Coolray 668">Geely Coolray 668</option>
                  <option value="Autre">Autre (précisez dans le message)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="budget">Budget approximatif</label>
                <input type="text" id="budget" name="budget" placeholder="Ex: 10 000 000 DZD" value={formState.budget} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" placeholder="Décrivez votre besoin : modèle, couleur, quantité, etc." value={formState.message} onChange={handleChange}></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Envoi en cours...' : 'Envoyer la demande'}
              </button>
              {formStatus.text && (
                <p style={{ marginTop: 12, fontSize: '0.9rem', textAlign: 'center', color: formStatus.color, minHeight: 22 }}>
                  {formStatus.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="#" className="nav-logo">
              <img src="/logo/Logo-Icon-v2.png" alt="China Auto Algérie" />
              China Auto Algérie
            </a>
            <p>Votre porte d&apos;entrée professionnelle pour les véhicules chinois neufs en Algérie. Import direct · Prix FOB transparents · Service local.</p>
          </div>
          <div>
            <h4>Navigation</h4>
            <ul>
              <li><a href="#pourquoi">Pourquoi nous</a></li>
              <li><a href="#modeles">Nos modèles</a></li>
              <li><a href="#processus">Processus</a></li>
              <li><a href="#simulateur">Simulateur de coûts</a></li>
              <li><a href="#equipe">Équipe</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="https://wa.me/85269724241">WhatsApp +852 6972 4241</a></li>
              <li><a href="mailto:contact@chinaautoalgerie.com">contact@chinaautoalgerie.com</a></li>
              <li>Algérie</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 China Auto Algérie. Tous droits réservés.</span>
          <span>Propulsé par Shanghai JUYI Supply Chain Management</span>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href="https://wa.me/85269724241" className="floating-whatsapp whatsapp-pulse" title="Contactez-nous sur WhatsApp" aria-label="WhatsApp">💬</a>
    </>
  );
}
