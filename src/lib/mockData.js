export const mockProduits = [
  { id: '1', nom: 'Lait demi-écrémé 1L', categorie: 'laitier', marque: 'Lactel' },
  { id: '2', nom: 'Pâtes spaghetti 500g', categorie: 'epicerie', marque: 'Barilla' },
  { id: '3', nom: 'Yaourt nature x8', categorie: 'laitier', marque: 'Danone' },
  { id: '4', nom: 'Café moulu 250g', categorie: 'boissons', marque: 'Lavazza' },
  { id: '5', nom: 'Jambon cuit 4 tranches', categorie: 'charcuterie', marque: 'Fleury Michon' },
  { id: '6', nom: 'Beurre doux 250g', categorie: 'laitier', marque: 'Président' },
  { id: '7', nom: 'Pain de mie complet', categorie: 'boulangerie', marque: "Harry's" },
  { id: '8', nom: "Jus d'orange 1L", categorie: 'boissons', marque: 'Tropicana' },
]

export const mockMagasins = [
  { id: '1', nom: 'Lidl Part-Dieu', enseigne: 'Lidl', distance: 0.4, adresse: '11 Rue du Dr Bouchut, Lyon' },
  { id: '2', nom: 'Leclerc Villeurbanne', enseigne: 'Leclerc', distance: 1.8, adresse: '26 Av. Henri Barbusse, Villeurbanne' },
  { id: '3', nom: 'Carrefour Confluence', enseigne: 'Carrefour', distance: 2.1, adresse: '112 Cours Charlemagne, Lyon' },
  { id: '4', nom: 'Intermarché Croix-Rousse', enseigne: 'Intermarché', distance: 3.2, adresse: '42 Bd des Canuts, Lyon' },
]

// mockPrix[produit_id][magasin_id]
export const mockPrix = {
  '1': {
    '1': { normal: 0.89, promo: null },
    '2': { normal: 1.05, promo: 0.79 },
    '3': { normal: 1.29, promo: null },
    '4': { normal: 1.19, promo: null },
  },
  '2': {
    '1': { normal: 0.65, promo: null },
    '2': { normal: 0.89, promo: 0.65 },
    '3': { normal: 0.99, promo: null },
    '4': { normal: 0.79, promo: null },
  },
  '3': {
    '1': { normal: 2.49, promo: 1.89 },
    '2': { normal: 2.99, promo: null },
    '3': { normal: 2.79, promo: null },
    '4': { normal: 2.69, promo: null },
  },
  '4': {
    '1': { normal: 3.99, promo: null },
    '2': { normal: 4.49, promo: 3.49 },
    '3': { normal: 4.29, promo: null },
    '4': { normal: 3.89, promo: null },
  },
  '5': {
    '1': { normal: 2.15, promo: null },
    '2': { normal: 2.49, promo: null },
    '3': { normal: 2.89, promo: 2.39 },
    '4': { normal: 2.39, promo: null },
  },
  '6': {
    '1': { normal: 1.89, promo: null },
    '2': { normal: 2.09, promo: 1.75 },
    '3': { normal: 2.29, promo: null },
    '4': { normal: 1.99, promo: null },
  },
  '7': {
    '1': { normal: 1.49, promo: null },
    '2': { normal: 1.69, promo: null },
    '3': { normal: 1.89, promo: null },
    '4': { normal: 1.59, promo: 1.29 },
  },
  '8': {
    '1': { normal: 2.29, promo: null },
    '2': { normal: 2.59, promo: null },
    '3': { normal: 2.99, promo: 2.49 },
    '4': { normal: 2.45, promo: null },
  },
}

export const ENSEIGNE_COLORS = {
  Lidl: { bg: '#003580', text: '#fff', emoji: '🔵' },
  Leclerc: { bg: '#003DA5', text: '#fff', emoji: '🔵' },
  Carrefour: { bg: '#0066CC', text: '#fff', emoji: '🔷' },
  Intermarché: { bg: '#E31E24', text: '#fff', emoji: '🔴' },
  Aldi: { bg: '#0066B3', text: '#fff', emoji: '🔵' },
  Monoprix: { bg: '#CC0000', text: '#fff', emoji: '🔴' },
  Franprix: { bg: '#CC0000', text: '#fff', emoji: '🔴' },
  Casino: { bg: '#00843D', text: '#fff', emoji: '🟢' },
  default: { bg: '#6b7280', text: '#fff', emoji: '🏪' },
}

export function getEnseigneStyle(enseigne) {
  return ENSEIGNE_COLORS[enseigne] || ENSEIGNE_COLORS.default
}

// Calcule le total estimé pour un magasin donné avec une liste de produits
export function calculerTotal(produits, magasinId) {
  let total = 0
  let trouves = 0
  let promos = 0

  produits.forEach((produit) => {
    const prix = mockPrix[produit.id]?.[magasinId]
    if (prix) {
      const prixEffectif = prix.promo ?? prix.normal
      total += prixEffectif * (produit.quantite || 1)
      trouves++
      if (prix.promo) promos++
    }
  })

  return { total, trouves, promos, manquants: produits.length - trouves }
}
