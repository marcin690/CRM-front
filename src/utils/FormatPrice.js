export const formatPrice = (price, currency = 'PLN') => {
    // Obsługa specyficznego formatowania dla różnych walut
    const currencyLocales = {
        PLN: 'pl-PL', // Polski złoty
        EUR: 'de-DE', // Euro
        USD: 'en-US', // Dolar amerykański
        GBP: 'en-GB', // Funt brytyjski
        JPY: 'ja-JP'  // Jen japoński
    };

    // Pobierz lokalizację na podstawie waluty lub ustaw domyślną
    const locale = currencyLocales[currency] || 'en-US'; // Domyślna lokalizacja

    // Sformatuj cenę z odpowiednią walutą i lokalizacją
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(price);
};
