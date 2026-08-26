# -*- coding: utf-8 -*-
"""
Génère un DEVIS FOB (forme identique au devis Livan X3 Pro fourni par le fournisseur)
pour n'importe quel modèle de carModels, rempli avec les DONNÉES RÉELLES du site.
Chaque devis affiche RMB + DZD (1 RMB = RATE DZD, DA arrondi à la centaine),
Réf., conditions de paiement et Incoterm.

Usage :
  python3 gen_devis_fob.py            # génère les 4 modèles
  python3 gen_devis_fob.py lavida     # génère un seul modèle
  python3 gen_devis_fob.py livan tcross
"""
import sys
from fpdf import FPDF
from fpdf.enums import XPos, YPos

FONT = "/Library/Fonts/Arial Unicode.ttf"
RATE = 19.69  # 1 RMB = 19.69 DZD
PAGE_W = 210
LM, RM = 18, 18


def fmt(n):
    return f"{n:,}".replace(",", " ")


def da(rmb):
    # Arrondi au centaine (DA) selon la convention du site
    return int(round(rmb * RATE / 100) * 100)


# ============================================================
# DONNÉES RÉELLES (alignées sur app/page.js → carModels + cartes)
# items[0] = prix d'achat du véhicule ; puis postes FOB
# ============================================================
MODELS = {
    "lavida": {
        "ref": "CAA-FOB-LAVIDA2025-2608-01",
        "incoterm": "FOB Shanghai (Chine)",
        "veh": [
            ("Marque", "Volkswagen"),
            ("Modèle", "Lavida 2025"),
            ("Année", "2025 (tout neuf)"),
            ("Motorisation", "1.5L Essence"),
            ("Transmission", "Automatique"),
            ("Conduite", "Volant à gauche (LHD)"),
            ("Couleur", "Noir / Gris / Blanc / Argent (au choix)"),
            ("Quantité", "1 unité"),
        ],
        "items": [
            ("Prix d'achat du véhicule", "Achat en Chine", 80000),
            ("Inspection du véhicule", "Contrôle qualité", 2000),
            ("Transport intérieur", "Jusqu'au port de Shanghai", 1500),
            ("Frais d'agence export", "Formalités export", 3000),
            ("Déclaration en douane", "Exportation", 600),
            ("Frais portuaires", "Terminal & manutention", 2500),
            ("Documents export", "Facture, Packing List, BL", 600),
            ("Frais bancaires", "Virement bancaire (T/T)", 300),
            ("Divers", "Imprévus", 500),
        ],
        "service": 4550,  # Service China Auto Algérie (5%)
        "container_note": None,
    },
    "livan": {
        "ref": "CAA-FOB-LIVANX3PRO-2608-01",
        "incoterm": "FOB Guangdong (Chine)",
        "veh": [
            ("Marque", "Geely"),
            ("Modèle", "Livan X3 Pro 2026"),
            ("Année", "2026 (tout neuf)"),
            ("Transmission", "Manuelle (variante par défaut)"),
            ("Conduite", "Volant à gauche (LHD)"),
            ("Couleur", "Noir / Gris / Blanc / Argent (au choix)"),
            ("Variantes", "Manuelle sans toit / Manuelle avec toit / Automatique avec toit"),
            ("Quantité", "4 unités minimum (conteneur)"),
        ],
        "items": [
            ("Prix d'achat du véhicule", "Achat en Chine (variante Manuelle, sans toit)", 43300),
            ("Transport intérieur", "Jusqu'au port de Nanhai (Guangdong)", 1600),
            ("Frais d'agence export", "Formalités export", 3000),
            ("Déclaration en douane", "Exportation", 600),
            ("Frais portuaires", "Terminal & manutention", 2500),
            ("Documents export", "Facture, Packing List, BL", 600),
            ("Divers", "Imprévus", 500),
        ],
        "service": 3000,
        "container_note": "Il faut au moins 4 véhicules par conteneur (40 pieds HQ) pour la première commande.",
    },
    "tcross": {
        "ref": "CAA-FOB-TCROSS2023-2608-01",
        "incoterm": "FOB Shanghai (Chine)",
        "veh": [
            ("Marque", "Volkswagen"),
            ("Modèle", "T-Cross 2023"),
            ("Année", "2023 (occasion)"),
            ("Kilométrage", "50 000 km"),
            ("Motorisation", "Essence"),
            ("Transmission", "Automatique"),
            ("Conduite", "Volant à gauche (LHD)"),
            ("Couleur", "Noir / Gris / Blanc (au choix)"),
            ("Quantité", "1 unité"),
        ],
        "items": [
            ("Prix d'achat du véhicule", "Véhicule d'occasion contrôlé", 8900),
            ("Inspection du véhicule", "Contrôle qualité + rapport", 2000),
            ("Transport intérieur", "Jusqu'au port de Shanghai", 1500),
            ("Préparation véhicule", "Nettoyage, contrôle, remise en état", 500),
            ("Frais d'agence export", "Formalités export", 3000),
            ("Déclaration en douane", "Exportation", 600),
            ("Frais portuaires", "Terminal & manutention", 2500),
            ("Documents export", "Facture, Packing List, BL", 600),
            ("Frais bancaires", "Virement bancaire (T/T)", 200),
            ("Divers", "Imprévus", 500),
        ],
        "service": 900,
        "container_note": None,
    },
    "coolray": {
        "ref": "CAA-FOB-COOLRAY668-2608-01",
        "incoterm": "FOB Nansha (Guangdong, Chine)",
        "veh": [
            ("Marque", "Geely"),
            ("Modèle", "Coolray 668 (version internationale Afrique)"),
            ("Année", "2026 (tout neuf)"),
            ("Motorisation", "1.5L Essence"),
            ("Transmission", "Automatique (CVT)"),
            ("Conduite", "Volant à gauche (LHD)"),
            ("Couleur", "Noir / Gris / Blanc / Rouge (au choix)"),
            ("Équipements", "Toit ouvrant d'origine, vitres teintées d'origine, garantie 4 ans / 100 000 km"),
            ("Multimédia", "Système international : langues français / arabe / anglais"),
            ("Quantité", "1 unité"),
        ],
        "items": [
            ("Prix d'achat du véhicule", "Achat en Chine", 54000),
            ("Inspection du véhicule", "Contrôle qualité", 0),
            ("Transport intérieur", "Jusqu'au port de Nansha", 0),
            ("Frais d'agence export", "Formalités export", 1500),
            ("Déclaration en douane", "Exportation", 600),
            ("Frais portuaires", "Terminal & manutention", 2500),
            ("Documents export", "Facture, Packing List, BL", 600),
            ("Frais bancaires", "Virement bancaire (T/T)", 0),
            ("Divers", "Imprévus", 500),
        ],
        "service": 2985,
        "container_note": "Il faut au moins un conteneur (environ 4 voitures par conteneur 40 pieds HQ pour la première commande).",
    },
}


# ============================================================
# Rendu PDF
# ============================================================
def row2(pdf, label_w, label, value, line_h=7):
    pdf.set_font("AU", "B", 10)
    pdf.cell(label_w, line_h, "  " + label, border=1, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.set_font("AU", "", 10)
    val_w = PAGE_W - LM - RM - label_w
    pdf.multi_cell(val_w, line_h, "  " + value, border=1, new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def build_pdf(key):
    m = MODELS[key]
    pdf = FPDF(format="A4")
    pdf.add_font("AU", "", FONT)
    pdf.add_font("AU", "B", FONT)
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_margins(LM, 16, RM)

    # ---------- PAGE 1 ----------
    pdf.add_page()
    pdf.set_font("AU", "B", 16)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 9, "DEVIS FOB – EXPORTATION DE VÉHICULES", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("AU", "", 10)
    pdf.set_text_color(90, 90, 90)
    pdf.cell(0, 6, "Détail des coûts (Prix FOB – " + m["incoterm"] + ")", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(2)

    pdf.set_font("AU", "", 10)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 6, "Nom du fournisseur : Shanghai Juyi Supply Chain Management Co., Ltd. (China Auto Algérie)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 6, "Client : ________________________", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(95, 6, "Date : 26 / 08 / 2026", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 6, "Référence (Réf.) : " + m["ref"], new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(95, 6, "Validité de l'offre : 30 jours", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(0, 6, "Mode de vente : FOB (franco à bord)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(3)

    # Informations du véhicule
    pdf.set_font("AU", "B", 11)
    pdf.cell(0, 7, "Informations du véhicule", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    for k, v in m["veh"]:
        row2(pdf, 42, k, v)
    pdf.ln(3)

    # Détail des coûts FOB
    pdf.set_font("AU", "B", 11)
    pdf.cell(0, 7, "Détail des coûts FOB", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("AU", "B", 10)
    pdf.set_fill_color(225, 232, 229)
    c1, c2, c3, c4 = 52, 54, 30, 34
    pdf.cell(c1, 7, "  Poste", border=1, fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(c2, 7, "  Description", border=1, fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(c3, 7, "RMB", border=1, fill=True, align="R", new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(c4, 7, "DZD", border=1, fill=True, align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    pdf.set_font("AU", "", 10)
    total_fob = 0
    total_fob_da = 0
    for poste, desc, rmb in m["items"]:
        d = da(rmb)
        total_fob += rmb
        total_fob_da += d
        pdf.cell(c1, 7, "  " + poste, border=1, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(c2, 7, "  " + desc, border=1, new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(c3, 7, "  " + fmt(rmb), border=1, align="R", new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(c4, 7, "  " + fmt(d), border=1, align="R", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    service = m["service"]
    service_da = da(service)

    pdf.ln(2)
    pdf.set_font("AU", "B", 10)
    pdf.cell(0, 6, f"Coût total FOB : {fmt(total_fob)} RMB ({fmt(total_fob_da)} DZD) + service (5%) {fmt(service)} RMB ({fmt(service_da)} DZD)", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.cell(0, 6, f"Prix FOB proposé : {fmt(total_fob + service)} RMB / {fmt(total_fob_da + service_da)} DZD par véhicule", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("AU", "", 10)
    pdf.cell(0, 6, "Incoterm : " + m["incoterm"], new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    if m["container_note"]:
        pdf.cell(0, 6, m["container_note"], new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font("AU", "", 9)
    pdf.set_text_color(110, 110, 110)
    pdf.cell(0, 6, f"Taux de change appliqué : 1 RMB = {RATE} DZD (DA arrondi à la centaine).", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ---------- PAGE 2 ----------
    pdf.add_page()
    pdf.set_font("AU", "B", 12)
    pdf.set_text_color(20, 20, 20)
    pdf.cell(0, 8, "Informations complémentaires", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.ln(1)

    def bullets(title, lines):
        pdf.set_font("AU", "B", 10)
        pdf.cell(0, 6, title, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_font("AU", "", 10)
        for t in lines:
            pdf.cell(6, 5, "-", new_x=XPos.RIGHT, new_y=YPos.TOP)
            pdf.multi_cell(PAGE_W - LM - RM - 6, 5, " " + t, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(2)

    bullets("Non inclus dans le prix", [
        "Transport maritime",
        "Assurance maritime",
        "Déchargement au port d'arrivée",
        "Droits de douane (en Chine et en Algérie)",
        "TVA",
        "Frais de dédouanement",
        "Immatriculation",
    ])
    bullets("Documents fournis", [
        "Facture commerciale",
        "Packing List",
        "Bill of Lading (BL)",
        "Certificat d'origine (si demandé)",
        "Déclaration d'exportation",
    ])
    bullets("Conditions de paiement", [
        "50 % d'acompte à la commande.",
        "50 % avant embarquement.",
        "Paiement par virement bancaire (T/T).",
        "Le véhicule est payé intégralement avant l'expédition.",
        "Offre valable 30 jours à compter de la date ci-dessus.",
    ])

    pdf.ln(3)
    pdf.set_font("AU", "", 9)
    pdf.set_text_color(110, 110, 110)
    pdf.multi_cell(0, 5, "Contact : WhatsApp +852 6972 4241  -  Email contact@chinaautoalgerie.com", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.multi_cell(0, 5, "China Auto Algérie - Votre porte d'entrée pour les véhicules chinois en Algérie.", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    out = f"/Users/sheng.yu/WorkBuddy/2026-07-28-18-33-28/Devis_FOB_{key.capitalize()}.pdf"
    pdf.output(out)
    print(f"PDF généré: {out}")
    print(f"  -> Prix FOB : {fmt(total_fob + service)} RMB / {fmt(total_fob_da + service_da)} DZD")
    return out


if __name__ == "__main__":
    keys = [k for k in sys.argv[1:] if k in MODELS]
    if not keys:
        keys = list(MODELS.keys())
    for k in keys:
        build_pdf(k)
