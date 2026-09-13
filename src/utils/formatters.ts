/**
 * Utilitaire de formatage des prix en Franc Guinéen (GNF)
 * Exemple : 15000 -> "15 000 GNF"
 * Exemple : 15000, perKg=true -> "15 000 GNF/kg"
 */
export function formatPrice(amount: number | string | undefined | null, perKg = false): string {
    if (amount === undefined || amount === null || amount === '') {
        return `0 GNF${perKg ? '/kg' : ''}`;
    }

    let numVal = typeof amount === 'number' ? amount : parseFloat(String(amount).replace(/[^0-9.-]/g, ''));
    if (isNaN(numVal)) numVal = 0;

    // Formatage avec espace comme séparateur de milliers (ex: 15 000 GNF)
    const formatted = Math.round(numVal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${formatted} GNF${perKg ? '/kg' : ''}`;
}

export default formatPrice;
