export interface GeocodingResult {
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  rua: string,
  numero: string,
  bairro: string,
  cidade: string,
  estado: string
): Promise<GeocodingResult | null> {
  const parts = [rua, numero, bairro, cidade, estado, 'Brasil'].filter(Boolean);
  const query = parts.join(', ');
  const encoded = encodeURIComponent(query);

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MonitoramentoEscolar/1.0',
        'Accept-Language': 'pt-BR',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}
