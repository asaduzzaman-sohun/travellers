export const API_BASE = "http://localhost:5000/api";

export interface TourSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;
  destination: string;
  country: string;
  region: string;
  startCity: string;
  endCity: string;
  idealSeason: string;
  durationDays: number;
  durationNights: number;
  basePrice: number;
  discountPrice?: number;
  depositAmount: number;
  maxGroupSize: number;
  difficulty: "Easy" | "Moderate" | "Challenging" | "Difficult" | "Extreme";
  category: string;
  coverImageUrl: string;
  highlights: string[];
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  upcomingDepartures: number;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  mealsIncluded?: string;
  accommodation?: string;
  location?: string;
  activityMetrics?: string;
}

export interface TourSchedule {
  id: string;
  startDate: string;
  endDate: string;
  pricePerPerson: number;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  status: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerLocation: string;
  rating: number;
  title: string;
  comment: string;
  tripDateFormatted: string;
  isVerifiedBooking: boolean;
}

export interface TourDetail extends TourSummary {
  description: string;
  galleryImages: string[];
  inclusions: string[];
  exclusions: string[];
  packingTips: string[];
  itineraryDays: ItineraryDay[];
  schedules: TourSchedule[];
  reviews: Review[];
}

export interface BookingRecord {
  id: string;
  bookingReference: string;
  tourTitle: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfTravelers: number;
  unitPrice: number;
  totalAmount: number;
  depositPaid: number;
  balanceRemaining: number;
  status: string;
  paymentStatus: string;
  dietaryRequirements?: string;
  specialRequests?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAtUtc: string;
  travelers: Array<{
    fullName: string;
    email?: string;
    passportNumber?: string;
    nationality?: string;
  }>;
}

export interface DashboardStats {
  totalTours: number;
  activeBookings: number;
  totalRevenue: number;
  upcomingDepartures: number;
}
