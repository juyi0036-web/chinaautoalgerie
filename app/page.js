'use client';

import { useState, useEffect, useRef } from 'react';

const RATE_CNY_DZD = 19.69;
const RATE_CNY_EUR = 0.13;

// ---- Car cost models ----
// baseVehicleDZD = 车辆裸价（不含 FOB），fobSurcharge = 从上海工厂到 FOB 上海港的费用
const carModels = {
  lavida: {
    name: 'Volkswagen Lavida 2025',
    baseVehicleDZD: 1851000,
    fobSurcharge: 30000,
    fobSurchargeLabel: 'FOB Shanghai — Transport usine → port, documentation export, manutention',
    seaFreight: 185000,
    seaInsuranceRate: 0.008,
    seaPortFees: 30000,
    seaLabel: 'Transport maritime Shanghai → Alger — Fret, assurance, déchargement',
    customsRate: 0.30,
    tvaRate: 0.19,
    dossierFees: 25000,
    tariffLabel: 'Droits de douane (30%) + TVA (19%) + Frais de dossier — Algérie',
  },
  livan: {
    name: 'Geely Livan X3 Pro 2026',
    baseVehicleDZD: 1157000,
    fobSurcharge: 30000,
    fobSurchargeLabel: 'FOB Shanghai — Transport usine → port, documentation export, manutention',
    seaFreight: 185000,
    seaInsuranceRate: 0.008,
    seaPortFees: 30000,
    seaLabel: 'Transport maritime Shanghai → Alger — Fret, assurance, déchargement',
    customsRate: 0.30,
    tvaRate: 0.19,
    dossierFees: 25000,
    tariffLabel: 'Droits de douane (30%) + TVA (19%) + Frais de dossier — Algérie',
  },
};

function formatDA(amount) {
  return amount.toLocaleString('fr-DZ') + ' DA';
}
function formatEUR(amount) {
  return Math.round(amount / RATE_CNY_DZD * RATE_CNY_EUR).toLocaleString('fr-FR') + ' \u20AC';
}

function calcSimTotal(model, toggles) {
  if (!model) return null;
  const { baseVehicleDZD, fobSurcharge, seaFreight, seaInsuranceRate, seaPortFees, customsRate, tvaRate, dossierFees } = model;

  let subtotal = baseVehicleDZD;
  const lines = [{ label: 'Prix de base du véhicule (hors FOB)', value: baseVehicleDZD, always: true }];

  if (toggles.fob) {
    subtotal += fobSurcharge;
    lines.push({ label: model.fobSurchargeLabel, value: fobSurcharge, toggle: 'fob' });
  }

  if (toggles.sea) {
    const assurance = Math.round(subtotal * seaInsuranceRate);
    const seaTotal = seaFreight + assurance + seaPortFees;
    subtotal += seaTotal;
    lines.push({ label: model.seaLabel, value: seaTotal, toggle: 'sea' });
  }

  if (toggles.tariff) {
    const cif = subtotal;
    const customs = Math.round(cif * customsRate);
    const tva = Math.round((cif + customs) * tvaRate);
    const tariffTotal = customs + tva + dossierFees;
    subtotal += tariffTotal;
    lines.push({ label: model.tariffLabel, value: tariffTotal, toggle: 'tariff' });
  }

  return { lines, total: subtotal };
}

export default function Home() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', city: '', model: '', budget: '', message: '' });
  const [formStatus, setFormStatus] = useState({ text: '', color: '' });
  const [submitting, setSubmitting] = useState(false);
  const [simModelKey, setSimModelKey] = useState('');
  const [simToggles, setSimToggles] = useState({ fob: false, sea: false, tariff: false });

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
    setSimModelKey(e.target.value);
    setSimToggles({ fob: false, sea: false, tariff: false });
  };

  const handleToggle = (key) => {
    setSimToggles(prev => ({ ...prev, [key]: !prev[key] }));
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
        <p className="section-subtitle">De l&apos;usine chinoise au port de Shanghai, puis jusqu&apos;à votre porte en Algérie.</p>
        <div className="image-gallery">
          <div className="gallery-item tall">
            <img src="/images/supply-chain-factory.png" alt="Chaîne de production automobile" />
            <div className="gallery-caption"><h4>Production en Chine</h4><p>Usines modernes et standards internationaux</p></div>
          </div>
          <div className="gallery-item">
            <img src="/images/supply-chain-inspection.png" alt="Contrôle qualité avant expédition" />
            <div className="gallery-caption"><h4>Inspection rigoureuse</h4><p>Chaque véhicule vérifié avant départ</p></div>
          </div>
          <div className="gallery-item">
            <img src="/images/supply-chain-port.png" alt="Port de Shanghai expédition" />
            <div className="gallery-caption"><h4>Expédition maritime</h4><p>Transport sécurisé depuis Shanghai</p></div>
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
            <h4>Le trajet de votre véhicule</h4>
            <p>De Shanghai à l&apos;Algérie — expédition maritime sécurisée et suivie</p>
          </div>
        </div>
      </section>

      {/* Modèles */}
      <div className="bg-light" id="modeles">
        <div className="section">
          <p className="section-label">Nos modèles disponibles</p>
          <h2 className="section-title">Des véhicules neufs, importés pour vous</h2>
          <p className="section-subtitle">Tous nos modèles sont neufs, avec devis FOB transparent. D&apos;autres modèles disponibles sur demande.</p>
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
                  <div className="car-spec-item"><span className="dot"></span>Blanc</div>
                  <div className="car-spec-item"><span className="dot"></span>Neuf</div>
                </div>
                <div className="car-price">1 881 000 DA</div>
                <div className="car-price-eur">≈ 12 420 €</div>
                <div className="car-price-note">Prix FOB Shanghai, hors transport maritime</div>
                <a href="#contact" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Demander un devis détaillé</a>
              </div>
            </div>
            <div className="car-card fade-in">
              <div className="car-card-image">
                <span className="car-badge">SUV</span>
                <img src="/images/geely-livan-x3-pro.png?v=7" alt="Geely Livan X3 Pro 2026" />
              </div>
              <div className="car-card-body">
                <span className="brand">Geely</span>
                <h3>Livan X3 Pro 2026</h3>
                <div className="car-specs">
                  <div className="car-spec-item"><span className="dot"></span>SUV Compact</div>
                  <div className="car-spec-item"><span className="dot"></span>Économique</div>
                  <div className="car-spec-item"><span className="dot"></span>4 véhicules/container</div>
                  <div className="car-spec-item"><span className="dot"></span>Neuf</div>
                </div>
                <div className="car-price">1 187 000 DA</div>
                <div className="car-price-eur">≈ 7 840 €</div>
                <div className="car-price-note">Prix FOB Shanghai, minimum 4 véhicules par conteneur</div>
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
          <div className="step fade-in"><h4>Acompte & Achat</h4><p>Versez 50% d&apos;acompte. Nous achetons et inspectons votre véhicule en Chine.</p></div>
          <div className="step fade-in"><h4>Expédition</h4><p>Transport maritime depuis Shanghai. Délai total d&apos;environ 45 à 60 jours selon le modèle.</p></div>
          <div className="step fade-in"><h4>Livraison</h4><p>Paiement du solde avant expédition. Notre équipe locale vous accueille pour la livraison en Algérie.</p></div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 40, padding: 24, background: 'var(--primary-light)', borderRadius: 'var(--radius)' }}>
          <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: 8 }}>💰 Paiement sécurisé</p>
          <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem' }}>50% à la commande · 50% avant expédition · Virement bancaire T/T</p>
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
            </select>
          </div>

          {simModelKey && carModels[simModelKey] && (() => {
            const model = carModels[simModelKey];
            const result = calcSimTotal(model, simToggles);

            return (
              <div className="sim-result">
                {/* Base price — always visible */}
                <div className="sim-base-price">
                  <span className="sim-base-label">Prix de base du véhicule (hors FOB)</span>
                  <span className="sim-base-value">{formatDA(model.baseVehicleDZD)}</span>
                  <span className="sim-base-eur">{formatEUR(model.baseVehicleDZD)}</span>
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
                      <span className="sim-checkbox-title">+ FOB Shanghai</span>
                      <span className="sim-checkbox-desc">Transport usine → port de Shanghai, documentation export, manutention portuaire</span>
                    </span>
                    <span className="sim-checkbox-price">+ {formatDA(model.fobSurcharge)}</span>
                  </label>

                  {/* Layer 2: Sea freight */}
                  <label className={`sim-checkbox ${simToggles.sea ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={simToggles.sea}
                      onChange={() => handleToggle('sea')}
                    />
                    <span className="sim-checkbox-indicator"></span>
                    <span className="sim-checkbox-body">
                      <span className="sim-checkbox-title">+ Transport maritime & assurance</span>
                      <span className="sim-checkbox-desc">Fret Shanghai → Alger, assurance maritime, déchargement portuaire</span>
                    </span>
                    <span className="sim-checkbox-price">
                      + {formatDA(model.seaFreight + Math.round(
                        (model.baseVehicleDZD + (simToggles.fob ? model.fobSurcharge : 0)) * model.seaInsuranceRate
                      ) + model.seaPortFees)}
                    </span>
                  </label>

                  {/* Layer 3: Local tariffs */}
                  <label className={`sim-checkbox ${simToggles.tariff ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={simToggles.tariff}
                      onChange={() => handleToggle('tariff')}
                    />
                    <span className="sim-checkbox-indicator"></span>
                    <span className="sim-checkbox-body">
                      <span className="sim-checkbox-title">+ Droits de douane & TVA Algérie</span>
                      <span className="sim-checkbox-desc">Droits de douane (30% CIF), TVA (19%), frais de dédouanement</span>
                    </span>
                    <span className="sim-checkbox-price">
                      + {(() => {
                        const subtotalForPreview = model.baseVehicleDZD + (simToggles.fob ? model.fobSurcharge : 0);
                        const seaTotalForPreview = simToggles.sea
                          ? model.seaFreight + Math.round(subtotalForPreview * model.seaInsuranceRate) + model.seaPortFees
                          : 0;
                        const cifForPreview = subtotalForPreview + seaTotalForPreview;
                        const customsForPreview = Math.round(cifForPreview * model.customsRate);
                        const tvaForPreview = Math.round((cifForPreview + customsForPreview) * model.tvaRate);
                        return formatDA(customsForPreview + tvaForPreview + model.dossierFees);
                      })()}
                    </span>
                  </label>
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
