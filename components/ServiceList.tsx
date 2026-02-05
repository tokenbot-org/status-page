'use client';

import { ServiceHealth } from '@/lib/health-checker';
import StatusCard from './StatusCard';

interface ServiceListProps {
  services: ServiceHealth[];
}

export default function ServiceList({ services }: ServiceListProps) {
  // Group services by their group
  const grouped = services.reduce((acc, service) => {
    const group = service.group;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(service);
    return acc;
  }, {} as Record<string, ServiceHealth[]>);

  // Define group order
  const groupOrder = ['Core Services', 'API Services', 'Frontend', 'Infrastructure'];
  
  // Sort groups by order
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    const orderA = groupOrder.indexOf(a) >= 0 ? groupOrder.indexOf(a) : 99;
    const orderB = groupOrder.indexOf(b) >= 0 ? groupOrder.indexOf(b) : 99;
    return orderA - orderB;
  });

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <p style={{ color: '#888888' }}>No services configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedGroups.map(([groupName, groupServices]) => (
        <div key={groupName}>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2" style={{ color: '#ffffff' }}>
            <span 
              className="w-2 h-2 rounded-full"
              style={{ background: '#ffd60a' }}
            />
            {groupName}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {groupServices.map((service) => (
              <StatusCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
