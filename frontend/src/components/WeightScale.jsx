import React, { useState } from 'react';

const WeightScale = ({ onWeightChange }) => {
    const [weight, setWeight] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState('');

    const connectScale = async () => {
        if (!navigator.serial) {
            setError('Web Serial API not supported in this browser.');
            return;
        }

        try {
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            setIsConnected(true);
            setError('');

            const textDecoder = new TextDecoderStream();
            const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
            const reader = textDecoder.readable.getReader();

            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    break;
                }
                if (value) {
                    // Logic to parse scale data
                    // Example format: "ST,GS,  1.50kg" -> extract 1.50
                    // This regex depends on the specific scale model
                    // Using a generic number extraction for demo
                    const matches = value.match(/(\d+\.\d+)/);
                    if (matches) {
                        const newWeight = parseFloat(matches[1]);
                        setWeight(newWeight);
                        onWeightChange(newWeight);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setError('Failed to connect to scale: ' + err.message);
            setIsConnected(false);
        }
    };

    const handleManualChange = (e) => {
        const val = parseFloat(e.target.value);
        setWeight(val);
        onWeightChange(val);
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg mb-4">
            <h3 className="text-lg font-semibold mb-2">Weight Measurement</h3>
            <div className="flex items-center space-x-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input
                        type="number"
                        step="0.001"
                        value={weight}
                        onChange={handleManualChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>
                <div>
                    <button
                        type="button"
                        onClick={connectScale}
                        disabled={isConnected}
                        className={`px-4 py-2 rounded text-white ${isConnected ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isConnected ? 'Scale Connected' : 'Connect Scale'}
                    </button>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
    );
};

export default WeightScale;
