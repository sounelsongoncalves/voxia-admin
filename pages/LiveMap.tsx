import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { locationsRepo, Location } from '../repositories/locationsRepo';
import { vehiclesRepo } from '../repositories/vehiclesRepo';
import { Status } from '../types';
import { useToast } from '../components/ToastContext';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -23.5505,
  lng: -46.6333
};

interface VehicleWithLocation {
  id: string;
  plate: string;
  model: string;
  status: Status | string;
  fuel: number;
  latitude: number;
  longitude: number;
}

export const LiveMap: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [filterId, setFilterId] = useState(searchParams.get('vehicle') || '');
  const [vehicles, setVehicles] = useState<VehicleWithLocation[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    const fetchVehiclesWithLocations = async () => {
      try {
        const vehiclesList = await vehiclesRepo.getVehicles();
        const locations = await locationsRepo.getLatestLocations();

        const vehiclesWithLoc: VehicleWithLocation[] = vehiclesList
          .map(v => {
            const loc = locations.find((l: any) => l.vehicle_id === v.id);
            if (!loc) return null;

            return {
              id: v.id,
              plate: v.plate,
              model: v.model || 'Modelo Desconhecido',
              status: v.status,
              fuel: v.fuel || 0,
              latitude: loc.latitude,
              longitude: loc.longitude,
            };
          })
          .filter(v => v !== null) as VehicleWithLocation[];

        setVehicles(vehiclesWithLoc);

        // Center map on filtered vehicle if present
        if (filterId && map) {
          const target = vehiclesWithLoc.find(v =>
            v.id.toLowerCase().includes(filterId.toLowerCase()) ||
            v.plate.toLowerCase().includes(filterId.toLowerCase())
          );
          if (target) {
            map.panTo({ lat: target.latitude, lng: target.longitude });
            map.setZoom(15);
          }
        } else if (vehiclesWithLoc.length > 0 && map && !filterId) {
          // Optional: Fit bounds to show all vehicles
          const bounds = new google.maps.LatLngBounds();
          vehiclesWithLoc.forEach(v => bounds.extend({ lat: v.latitude, lng: v.longitude }));
          map.fitBounds(bounds);
        }

      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      }
    };

    if (isLoaded) {
      fetchVehiclesWithLocations();
    }

    const subscription = locationsRepo.subscribeToLocations((newLocation: Location) => {
      setVehicles(prev => {
        const index = prev.findIndex(v => v.id === newLocation.vehicle_id);
        if (index === -1) return prev;

        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          latitude: newLocation.latitude,
          longitude: newLocation.longitude,
        };
        return updated;
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isLoaded, map, filterId]);

  const handleFilter = () => {
    if (filterId && map) {
      const target = vehicles.find(v =>
        v.id.toLowerCase().includes(filterId.toLowerCase()) ||
        v.plate.toLowerCase().includes(filterId.toLowerCase())
      );

      if (target) {
        map.panTo({ lat: target.latitude, lng: target.longitude });
        map.setZoom(15);
      } else {
        showToast('Veículo não encontrado ou sem localização.', 'warning'); // Replaced alert with showToast
      }
    }
  };

  const handleMyLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.panTo({ lat: position.coords.latitude, lng: position.coords.longitude });
          map.setZoom(15);
        },
        () => showToast('Não foi possível obter sua localização.', 'error') // Replaced alert with showToast
      );
    } else {
      showToast('Geolocalização não suportada pelo navegador.', 'error'); // Replaced alert with showToast
    }
  };

  const filteredVehicles = vehicles.filter(v =>
    !filterId ||
    v.id.toLowerCase().includes(filterId.toLowerCase()) ||
    v.plate.toLowerCase().includes(filterId.toLowerCase())
  );

  if (!googleMapsApiKey) {
    return (
      <div className="h-[calc(100vh-2rem)] flex flex-col items-center justify-center bg-bg-sec rounded-xl border border-surface-border p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-txt-tertiary mb-4">map</span>
        <h2 className="text-xl font-bold text-txt-primary mb-2">Mapa Indisponível</h2>
        <p className="text-txt-tertiary max-w-md">
          A chave da API do Google Maps não foi configurada. Por favor, adicione <code>VITE_GOOGLE_MAPS_KEY</code> ao seu arquivo .env.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="h-[calc(100vh-2rem)] flex flex-col items-center justify-center bg-bg-sec rounded-xl border border-surface-border p-8 text-center">
        <span className="material-symbols-outlined text-6xl text-semantic-error mb-4">error</span>
        <h2 className="text-xl font-bold text-txt-primary mb-2">Erro ao carregar o mapa</h2>
        <p className="text-txt-tertiary">{loadError.message}</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-txt-primary">Rastreamento de Frota em Tempo Real</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={filterId}
            onChange={(e) => setFilterId(e.target.value)}
            placeholder="Buscar ID ou Matrícula..."
            className="bg-surface-1 border border-surface-border text-sm rounded-lg px-4 py-2 text-txt-primary focus:border-brand-primary outline-none w-64 placeholder-txt-tertiary"
            onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
          />
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-brand-primary text-bg-main font-bold rounded-lg text-sm hover:bg-brand-hover transition-colors"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 bg-bg-sec rounded-xl border border-surface-border relative overflow-hidden z-0">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center text-txt-tertiary bg-surface-1 z-50">
            Carregando Google Maps...
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={defaultCenter}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#263c3f" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6b9a76" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#38414e" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#212a37" }],
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca5b3" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#746855" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#1f2835" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#f3d19c" }],
                },
                {
                  featureType: "transit",
                  elementType: "geometry",
                  stylers: [{ color: "#2f3948" }],
                },
                {
                  featureType: "transit.station",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#17263c" }],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#515c6d" }],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#17263c" }],
                },
              ],
              disableDefaultUI: false,
              zoomControl: true,
            }}
          >
            {filteredVehicles.map(v => (
              <Marker
                key={v.id}
                position={{ lat: v.latitude, lng: v.longitude }}
                title={`${v.plate} - ${v.model}`}
                onClick={() => navigate(`/vehicles/${v.id}`)}
              // Note: Custom icons can be added here with the icon prop
              />
            ))}
          </GoogleMap>
        )}

        {/* Map Controls Overlay */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[1000]">
          <button
            onClick={handleMyLocation}
            className="p-3 bg-surface-1 hover:bg-surface-2 border border-surface-border rounded-lg text-txt-primary shadow-lg mt-2 transition-colors"
            title="Minha Localização"
          >
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </div>
    </div>
  );
};
