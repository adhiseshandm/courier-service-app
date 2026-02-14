import React from 'react';
import { CheckCircle, Truck, Package, MapPin } from 'lucide-react';

const TrackingTimeline = ({ history }) => {
    return (
        <div className="py-8">
            <div className="relative">
                {/* Vertical Line for Mobile / Horizontal for Desktop */}
                <div className="absolute left-6 top-0 bottom-0 w-1 bg-gray-200 md:hidden"></div>
                <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-gray-200"></div>

                <div className="flex flex-col md:flex-row justify-between relative z-10">
                    {history.map((step, index) => {
                        const isCompleted = step.completed;
                        const isCurrent = !step.completed && (index === 0 || history[index - 1].completed);

                        let Icon = Package;
                        if (step.status === 'In Transit') Icon = Truck;
                        if (step.status === 'Out for Delivery') Icon = MapPin;
                        if (step.status === 'Delivered') Icon = CheckCircle;

                        return (
                            <div key={index} className="flex md:flex-col items-center mb-8 md:mb-0 md:w-1/4">
                                {/* Icon Bubble */}
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${isCompleted ? 'bg-green-600 border-green-600 text-white' : isCurrent ? 'bg-blue-600 border-blue-200 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <Icon size={20} />
                                </div>

                                {/* Text Content */}
                                <div className="ml-4 md:ml-0 md:mt-4 text-left md:text-center">
                                    <h4 className={`font-bold ${isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'}`}>{step.status}</h4>
                                    <p className="text-sm text-gray-500">{step.location}</p>
                                    {step.date && <p className="text-xs text-gray-400 mt-1">{new Date(step.date).toLocaleDateString()}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TrackingTimeline;
