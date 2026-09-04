import listings from '@/data/demo-listings.json';
import type { Property, RentalApplication } from '@/types/rental';

export const DEMO_LANDLORD_ID = listings.DEMO_LANDLORD_ID;
export const DEMO_PROPERTIES = listings.DEMO_PROPERTIES as Property[];
export const DEMO_APPLICATIONS = listings.DEMO_APPLICATIONS as RentalApplication[];
