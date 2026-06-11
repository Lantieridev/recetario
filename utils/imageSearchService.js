import dotenv from 'dotenv';

dotenv.config();

// Mapeo inteligente de palabras clave para fallback estético de Unsplash
const FALLBACK_CATEGORIES = {
    flan: {
        keywords: ['flan'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/5/5e/Flan_con_dulce_de_leche_y_crema.jpg',
            'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=60'
        ]
    },
    noquis: {
        keywords: ['ñoqui', 'noqui'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/d/d5/Plato_de_%C3%B1oquis_argentinos_con_salsa_de_carne_y_tomate_con_queso_rallado.jpg',
            'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=60'
        ]
    },
    lentejas: {
        keywords: ['lentejas'],
        images: [
            'https://images.unsplash.com/photo-1579640873954-766bf0235bf3?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1721942893918-214eae0cac20?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1621179816782-1c39a6583fbc?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1621179817588-f4a923daa3ef?w=600&auto=format&fit=crop&q=60'
        ]
    },
    verdeo: {
        keywords: ['verdeo'],
        images: [
            'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1606728035253-49e812177c9e?w=600&auto=format&fit=crop&q=60'
        ]
    },
    comida_rapida: {
        keywords: ['comida rapida', 'comida rápida', 'hamburguesa', 'taco', 'fast food', 'burger', 'paty'],
        images: [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=60'
        ]
    },
    bebidas: {
        keywords: ['bebidas', 'bebida', 'trago', 'negroni', 'fernet', 'coctel', 'cóctel', 'cocktail', 'cola'],
        images: [
            'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1620165479836-f68bc54e19d2?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&auto=format&fit=crop&q=60'
        ]
    },
    panaderia: {
        keywords: ['panadería', 'panaderia', 'pan', 'medialuna', 'croissant', 'factura', 'facturas', 'bizcocho', 'masa madre'],
        images: [
            'https://images.unsplash.com/photo-1623334044303-241021148842?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1599940778173-e276d4acb2bb?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1681218079567-35aef7c8e7e4?w=600&auto=format&fit=crop&q=60'
        ]
    },
    minutas: {
        keywords: ['minutas', 'minuta', 'milanesa', 'empanada', 'papas fritas'],
        images: [
            'https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1608039783021-6116a558f0c5?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1624128082323-beb6b8b508db?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1560611588-163f295eb145?w=600&auto=format&fit=crop&q=60'
        ]
    },
    chocotorta: {
        keywords: ['chocotorta'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/1/1d/Chocotorta_portion_on_a_plate.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/4/41/Chocotorta.jpg',
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60'
        ]
    },
    pastafrola: {
        keywords: ['pastafrola'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/b/b8/Pastafrola.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/1/19/Pastafrola_con_coco.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/f/f5/Pastafrola_de_membrillo_cruda_con_enrejado_de_masa.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/8/8e/Pastafrola_cuadrada.jpg'
        ]
    },
    ravioles: {
        keywords: ['raviol', 'ravioli'],
        images: [
            'https://images.unsplash.com/photo-1628885363743-fbf9c98d4196?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1665761543682-6305ccc5398b?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1676832661871-994153cf2d93?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1594610352113-ad218529cfb7?w=600&auto=format&fit=crop&q=60'
        ]
    },
    fernet: {
        keywords: ['fernet', 'fernet con cola', 'fernet con coca'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/b/b0/Fernet_con_coca.jpg'
        ]
    },
    locro: {
        keywords: ['locro'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/1/17/Locro_%28served_in_Recoleta%2C_Buenos_Aires%2C_Argentina%29.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/8/8c/Locro_de_Santiago_del_Estero_%28Argentina%29.jpg',
            'https://images.unsplash.com/photo-1552962294-29d5f5a49ecb?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1573729582839-5c40e12f4ad1?w=600&auto=format&fit=crop&q=60'
        ]
    },
    lomito: {
        keywords: ['lomito'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/f/fd/Lomito_de_Mendoza.jpg',
            'https://images.unsplash.com/photo-1554433607-66b5efe9d304?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1700937314577-898450cafe35?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1712746784291-e29d5d2694d4?w=600&auto=format&fit=crop&q=60'
        ]
    },
    asado: {
        keywords: ['asado', 'parrilla', 'parrillada'],
        images: [
            'https://upload.wikimedia.org/wikipedia/commons/6/65/Asado_2005.jpg',
            'https://upload.wikimedia.org/wikipedia/commons/9/93/Asado_a_la_estaca_en_General_Pico%2C_Argentina_2007.jpg',
            'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1627947063935-55577ec3c2e1?w=600&auto=format&fit=crop&q=60'
        ]
    },
    postres: {
        keywords: ['postre', 'torta', 'chocolate', 'dulce', 'helado', 'vainilla', 'caramelo', 'frutilla', 'manzana', 'banana', 'limon', 'lemon', 'coco', 'pastelera', 'budin', 'magdalena', 'muffin', 'galletita', 'cookie', 'alfajor', 'factura', 'medialuna', 'waffle', 'panqueque', 'crepa', 'mousse', 'tiramisu', 'cheesecake', 'brownie'],
        images: [
            'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60'
        ]
    },
    pastas: {
        keywords: ['fideo', 'tallarin', 'pasta', 'lasagn', 'lasañ', 'spaghetti', 'espagueti', 'canelon', 'sorrentin', 'capelet', 'tartelet'],
        images: [
            'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=600&auto=format&fit=crop&q=60'
        ]
    },
    pizza: {
        keywords: ['pizza', 'fugazzeta', 'muzzarella', 'prepizza', 'calzone', 'empanada', 'tarta'],
        images: [
            'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=600&auto=format&fit=crop&q=60'
        ]
    },
    ensaladas: {
        keywords: ['ensalada', 'lechuga', 'tomate', 'primavera', 'guacamole', 'vegetal', 'wok', 'vegetariano', 'vegano', 'palta', 'brócoli', 'acelga', 'espinaca', 'verdura'],
        images: [
            'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&auto=format&fit=crop&q=60'
        ]
    },
    hamburguesas: {
        keywords: ['hamburguesa', 'burger', 'paty', 'sanguche', 'sandwich'],
        images: [
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=60'
        ]
    },
    carnes: {
        keywords: ['pollo', 'carne', 'milanesa', 'guiso', 'bife', 'cerdo', 'estofado', 'carbonada', 'churrasco', 'pechuga', 'patita', 'alita', 'costilla', 'matambre', 'peceto', 'vacio', 'entraña', 'bacon', 'panceta', 'salchicha', 'chorizo', 'morcilla', 'brochette'],
        images: [
            'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1606728035253-49e812177c9e?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=600&auto=format&fit=crop&q=60'
        ]
    },
    general: {
        keywords: [],
        images: [
            'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=60',
            'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60'
        ]
    }
};

/**
 * Obtiene las 4 imágenes de contingencia (fallback) según palabras clave en la consulta
 */
export function getFallbackImages(query = '') {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) {
        return FALLBACK_CATEGORIES.general.images;
    }

    // 1. Buscar una categoría estática curada que coincida
    for (const key of Object.keys(FALLBACK_CATEGORIES)) {
        if (key === 'general') continue;
        const category = FALLBACK_CATEGORIES[key];
        const match = category.keywords.some(kw => normalizedQuery.includes(kw));
        if (match) {
            console.log(`[ImageSearch] Usando imágenes fallback curadas para categoría: ${key}`);
            return category.images;
        }
    }

    // 2. Si no coincide con ninguna categoría curada, retornar imágenes generales de comida de alta calidad
    console.log('[ImageSearch] Sin categoría específica. Usando fallback de comida general de alta calidad.');
    return FALLBACK_CATEGORIES.general.images;
}

/**
 * Busca 4 imágenes sugeridas usando Google Custom Search API.
 * Si falla, no está configurado o retorna vacío, usa el fallback estético.
 * 
 * @param {string} query Título de la receta
 * @returns {Promise<string[]>} Array de 4 URLs de imágenes
 */
export async function buscarImagenes(query) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const cx = process.env.GOOGLE_CX;

    if (!apiKey || !cx) {
        console.log('[ImageSearch] API Keys de Google no configuradas en .env. Usando fallback.');
        return getFallbackImages(query);
    }

    try {
        console.log(`[ImageSearch] Consultando Google Custom Search para: "${query}"...`);
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query + ' receta comida')}&searchType=image&num=4`;
        
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Google API respondió con código ${response.status}`);
        }

        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const urls = data.items.slice(0, 4).map(item => item.link);
            // Si por alguna razón nos devolvió menos de 4, rellenamos con general
            while (urls.length < 4) {
                const fallback = getFallbackImages(query);
                urls.push(fallback[urls.length]);
            }
            console.log('[ImageSearch] Imágenes obtenidas exitosamente desde Google.');
            return urls;
        } else {
            console.log('[ImageSearch] No se encontraron resultados en Google. Usando fallback.');
            return getFallbackImages(query);
        }
    } catch (error) {
        console.error('[ImageSearch] Error consultando Google Custom Search:', error.message);
        return getFallbackImages(query);
    }
}
