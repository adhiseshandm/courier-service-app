import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Download, RefreshCw } from 'lucide-react';
import { trackConsignment, downloadInvoice, updateConsignmentStatus, API_BASE_URL } from '../services/api';
import TrackingTimeline from '../components/TrackingTimeline';
import { io } from 'socket.io-client';

// Lazy load map components
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'; // Import Routing CSS

// Fix Leaflet Default Icon Issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/713/713311.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10]
});

// Routing Machine Component
const RoutingMachine = ({ origin, destination, current }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !origin || !destination) return;

        const waypoints = [
            L.latLng(origin[0], origin[1])
        ];

        if (current &&
            (current[0] !== origin[0] || current[1] !== origin[1]) &&
            (current[0] !== destination[0] || current[1] !== destination[1])) {
            waypoints.push(L.latLng(current[0], current[1]));
        }

        waypoints.push(L.latLng(destination[0], destination[1]));

        const routingControl = L.Routing.control({
            waypoints,
            header: false, // Hide header
            show: false,   // Hide instructions
            collapsible: true,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            lineOptions: {
                styles: [{ color: '#2563eb', weight: 5, opacity: 0.7 }]
            },
            createMarker: function () { return null; } // We use our own React markers
        }).addTo(map);

        return () => {
            // Safe removal
            try {
                map.removeControl(routingControl);
            } catch (e) {
                console.warn("Error removing routing control", e);
            }
        };
    }, [map, origin, destination, current]);

    return null;
};

const TrackConsignment = () => {
    const [trackingId, setTrackingId] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [socket, setSocket] = useState(null);
    const [geoCoords, setGeoCoords] = useState({ origin: null, destination: null, current: null });

    // Socket Connection
    useEffect(() => {
        const newSocket = io(API_BASE_URL);
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    // Geocoding Function
    const fetchCoordinates = async (address) => {
        if (!address) return null;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
                headers: {
                    'User-Agent': 'CourierApp/1.0'
                }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (e) {
            console.error("Geocoding failed for", address, e);
        }
        return null;
    };

    // Update Coordinates when Data Changes
    useEffect(() => {
        if (trackingData) {
            const getCoords = async () => {
                // Try backend coords first, else fallback to geocoding
                let origin = trackingData.originCoords;
                let destination = trackingData.destCoords;
                let current = trackingData.currentCoords;

                // If coordinates look like default Hub [21.1458, 79.0882] but name isn't Hub, fetch real ones
                if (isDefaultHub(origin) && !trackingData.branch?.includes('Hub') && trackingData.branch !== 'Main Branch') {
                    const fetched = await fetchCoordinates(trackingData.branch || trackingData.sender?.address);
                    if (fetched) origin = fetched;
                }

                // Always try to improve Destination accuracy
                const destFetched = await fetchCoordinates(trackingData.receiver?.destination);
                if (destFetched) destination = destFetched;

                // Update current similarly
                if (trackingData.status !== 'Delivered') {
                    // Update current based on status/location description
                    const currentLocName = trackingData.branch || 'Hub';
                    const currentFetched = await fetchCoordinates(currentLocName);
                    if (currentFetched) current = currentFetched;
                } else {
                    current = destination;
                }

                setGeoCoords({ origin, destination, current });
            };
            getCoords();
        }
    }, [trackingData]);

    const isDefaultHub = (coords) => coords && coords[0] === 21.1458 && coords[1] === 79.0882;

    // Listen for updates
    useEffect(() => {
        if (!socket || !trackingData) return;

        socket.emit('join-tracking', trackingData._id);

        socket.on('tracking-update', (update) => {
            console.log('Real-time update received:', update);
            setTrackingData(prev => ({
                ...prev,
                status: update.status,
                branch: update.location,
                history: [
                    ...prev.history.map(h => ({
                        ...h,
                        completed: getStatusPriority(h.status) <= getStatusPriority(update.status)
                    }))
                ]
            }));
        });

        return () => {
            socket.off('tracking-update');
        };
    }, [socket, trackingData?._id]);

    const getStatusPriority = (status) => {
        const priorities = { 'Booked': 1, 'In Transit': 2, 'Out for Delivery': 3, 'Delivered': 4 };
        return priorities[status] || 0;
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingId.trim()) return;

        setLoading(true);
        setError('');
        setTrackingData(null);
        setGeoCoords({ origin: null, destination: null, current: null });

        try {
            const response = await trackConsignment(trackingId);
            if (response.success) {
                setTrackingData(response.data);
            } else {
                setError(response.message || 'Consignment not found');
            }
        } catch (err) {
            setError('Failed to track consignment. Please check the ID.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!trackingData) return;
        try {
            await downloadInvoice(trackingData._id);
        } catch (err) {
            alert('Failed to download invoice');
        }
    };

    const simulateUpdate = async (newStatus) => {
        if (!trackingData) return;
        try {
            await updateConsignmentStatus(trackingData._id, newStatus, 'Hub/Transit Point');
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-[#0a192f]">Track Your Shipment</h1>
                <p className="text-gray-500 text-lg">Enter your consignment ID to track real-time status</p>
            </div>

            {/* Search Box */}
            <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto flex items-center">
                <div className="pl-4 text-gray-400">
                    <Search size={24} />
                </div>
                <input
                    type="text"
                    placeholder="Enter Tracking ID (e.g., 65c4...)"
                    className="flex-1 p-4 outline-none text-lg text-gray-700 bg-transparent"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                />
                <button
                    onClick={handleTrack}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center space-x-2"
                >
                    <span>{loading ? 'Searching...' : 'Track'}</span>
                    {!loading && <ArrowRight size={20} />}
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100 max-w-2xl mx-auto">
                    {error}
                </div>
            )}

            {/* Results */}
            {trackingData && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-[#0a192f] text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <p className="text-blue-200 text-sm uppercase tracking-wider mb-1">Consignment ID</p>
                            <h2 className="text-2xl font-mono font-bold tracking-wide">{trackingData._id}</h2>
                        </div>
                        <div className="mt-4 md:mt-0 text-right flex items-center space-x-3">
                            <button
                                onClick={() => {
                                    const message = `🚚 *Tracking Update*\nID: *${trackingData._id}*\nStatus: *${trackingData.status}*\nLocation: ${trackingData.branch || 'Hub'}\nTrack: ${window.location.href}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all"
                                title="Share on WhatsApp"
                            >
                                💬
                            </button>
                            <button
                                onClick={handleDownloadInvoice}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2"
                            >
                                <Download size={16} />
                                <span>Invoice</span>
                            </button>
                            <span className="bg-green-500/20 text-green-300 px-4 py-1.5 rounded-full text-sm font-bold border border-green-500/30">
                                {trackingData.status}
                            </span>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Simulation Controls (Demo Only) */}
                        <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">⚡ Live Simulation (Demo)</p>
                            <div className="flex flex-wrap gap-2">
                                {['In Transit', 'Out for Delivery', 'Delivered'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => simulateUpdate(status)}
                                        className="px-3 py-1.5 bg-white text-blue-600 text-xs font-bold rounded-lg border border-blue-200 hover:bg-blue-600 hover:text-white transition-colors"
                                    >
                                        Set: {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <p className="text-gray-500 text-sm mb-2">Origin</p>
                                <h3 className="font-bold text-lg text-gray-800">{trackingData.sender.name}</h3>
                                <p className="text-gray-600">{trackingData.branch || 'Main Branch'}</p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl">
                                <p className="text-gray-500 text-sm mb-2">Destination</p>
                                <h3 className="font-bold text-lg text-gray-800">{trackingData.receiver.destination}</h3>
                                <p className="text-gray-600">Expected Delivery: Soon</p>
                            </div>
                        </div>

                        <TrackingTimeline history={trackingData.history} />
                    </div>

                    {/* Live Map Section */}
                    <div className="bg-gray-50 p-6 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <span className="mr-2">🌍</span> Live Shipment Map
                        </h3>
                        <div className="h-96 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 z-0 relative">
                            {geoCoords.origin && geoCoords.destination ? (
                                <MapContainer center={geoCoords.current || geoCoords.origin} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                                    {/* CartoDB Voyager Tiles for Premium Look */}
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    />

                                    <RoutingMachine
                                        origin={geoCoords.origin}
                                        destination={geoCoords.destination}
                                        current={geoCoords.current}
                                    />

                                    <Marker position={geoCoords.origin}>
                                        <Popup>Origin: {trackingData.branch}</Popup>
                                    </Marker>
                                    <Marker position={geoCoords.destination}>
                                        <Popup>Destination: {trackingData.receiver.destination}</Popup>
                                    </Marker>
                                    {geoCoords.current && (
                                        <Marker position={geoCoords.current} icon={truckIcon}>
                                            <Popup>Current Location: {trackingData.status}</Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                    Loading Map Data...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackConsignment;
