import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder Dictionary Array strings mapping native UI boundaries
const resources = {
  en: {
    translation: {
      "search_placeholder": "Search properties, cities, or ZIP codes...",
      "sign_in": "Sign In",
      "compare": "Compare",
      "properties_mapped": "{{count}} homes mapped organically",
      "newest_matches": "Newest Matches",
      "premium_boost": "PREMIUM BOOST"
    }
  },
  es: {
    translation: {
      "search_placeholder": "Busque propiedades, ciudades, o códigos postales...",
      "sign_in": "Iniciar sesión",
      "compare": "Comparar",
      "properties_mapped": "{{count}} casas mapeadas orgánicamente",
      "newest_matches": "Partidos más nuevos",
      "premium_boost": "IMPULSO PREMIUM"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default Native Language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
