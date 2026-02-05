'use client';

import { ServiceHealth } from '@/lib/health-checker';
import { serviceGroups } from '@/lib/services';
import StatusCard from './StatusCard';

interface ServiceListProps {
  services: ServiceHealth[];
}

export default function ServiceList({ services }: ServiceListProps) {
  // Group services by their group
  const grouped = services.reduce((acc, service) => {
    const group = service.group as keyof typeof serviceGroups;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(service);
    return acc;
  }, {} as Record<string, ServiceHealth[]>);

  // Sort groups by order
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    const orderA = serviceGroups[a as keyof typeof serviceGroups]?.order ?? 99;
    const orderB = serviceGroups[b as keyof typeof serviceGroups]?.order ?? 99;
    return orderA - orderB;
  });

  return (
    <div className="space-y-8">
      {sortedGroups.map(([groupKey, groupServices]) => {
        const groupInfo = serviceGroups[groupKey as keyof typeof serviceGroups];
        
        return (
          <div key={groupKey}>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              {groupInfo?.name || groupKey}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {groupServices.map((service) => (
                <StatusCard key={service.serviceId} service={service} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
