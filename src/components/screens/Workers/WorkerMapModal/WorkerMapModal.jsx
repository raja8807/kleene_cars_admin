import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { supabase } from '@/lib/supabaseClient';
import styles from './WorkerMapModal.module.scss';
import { X } from 'react-bootstrap-icons';

// Component to smoothly recenter map when location updates
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (
            lat !== null &&
            lng !== null &&
            lat !== undefined &&
            lng !== undefined
        ) {
            map.flyTo([lat, lng], map.getZoom(), {
                animate: true,
                duration: 0.5,
            });
        }
    }, [lat, lng, map]);

    return null;
};

const WorkerMapModal = ({ worker, onClose }) => {
    const [location, setLocation] = useState({
        lat: worker?.latitude ?? null,
        lng: worker?.longitude ?? null,
    });

    // Stable initial center (prevents map re-mount)
    const initialCenter = useMemo(() => {
        if (
            worker?.latitude !== null &&
            worker?.latitude !== undefined &&
            worker?.longitude !== null &&
            worker?.longitude !== undefined
        ) {
            return [worker.latitude, worker.longitude];
        }
        return [0, 0]; // fallback
    }, [worker]);


    const starting = [8.720694, 77.773466]
    const destination = [8.698764, 77.714829]

    useEffect(() => {
        if (!worker?.id) return;

        // Set initial location
        if (
            worker.latitude !== null &&
            worker.longitude !== null &&
            worker.latitude !== undefined &&
            worker.longitude !== undefined
        ) {
            setLocation({
                lat: worker.latitude,
                lng: worker.longitude,
            });
        }


        // Create realtime channel
        const channel = supabase
            .channel(`worker-tracking-${worker.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'workers',
                    filter: `id=eq.${worker.id}`,
                },
                (payload) => {
                    console.log('ok');

                    const { latitude, longitude } = payload.new;


                    if (
                        latitude !== null &&
                        longitude !== null &&
                        latitude !== undefined &&
                        longitude !== undefined
                    ) {
                        setLocation({
                            lat: latitude,
                            lng: longitude,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [worker]);

    // Guard: No location
    if (
        location.lat === null ||
        location.lng === null ||
        location.lat === undefined ||
        location.lng === undefined
    ) {
        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <div className={styles.header}>
                        <h3>Tracking: {worker?.name}</h3>
                        <button onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>
                    <div className={styles.noLocation}>
                        <p>No location data available for this worker.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.header}>
                    <h3>Tracking: {worker?.name}</h3>
                    <button onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className={styles.mapContainer}>
                    <MapContainer
                        center={initialCenter}
                        zoom={15}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={[location.lat, location.lng]}>
                            <Popup>
                                <strong>{worker?.name}</strong>
                                <br />
                                {worker?.phone}
                            </Popup>
                        </Marker>

                        <RecenterAutomatically
                            lat={location.lat}
                            lng={location.lng}
                        />

                        {/* Dummy Direction Polyline */}
                        <Polyline
                            positions={[
                                [location.lat, location.lng], // Start at worker location
                                destination, // Example destination
                            ]}
                            pathOptions={{ color: 'blue', weight: 4, dashArray: '10, 10' }}
                        />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default WorkerMapModal;
