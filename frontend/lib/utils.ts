import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTrackingUrl(carrier: string, trackingNumber: string): string {
  if (!carrier || !trackingNumber) return '#';

  const c = carrier.toLowerCase().replace(/\s+/g, '');

  if (c.includes('bluedart')) {
    return `https://bluedart.com/trackdartresultthirdparty?trackFor=0&trackNo=${trackingNumber}`;
  }
  if (c.includes('delhivery')) {
    return `https://www.delhivery.com/track/package/${trackingNumber}`;
  }
  if (c.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  }
  if (c.includes('indiapost')) {
    return `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx`;
    // India Post doesn't easily support query params for direct result, usually just the page.
  }
  if (c.includes('dtdc')) {
    return `https://www.dtdc.in/tracking/shipment-tracking.asp`;
  }

  return '#';
}
