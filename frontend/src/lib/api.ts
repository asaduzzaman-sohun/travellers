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

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: "User" | "Admin" | "SuperAdmin";
  phoneNumber?: string;
  homeCity?: string;
  nidOrPassport?: string;
  emergencyContact?: string;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface SystemUser {
  id: string;
  fullName: string;
  email: string;
  role: "User" | "Admin" | "SuperAdmin";
  phoneNumber?: string;
  homeCity?: string;
  nidOrPassport?: string;
  emergencyContact?: string;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface PlatformStats {
  totalUsers: number;
  superAdminCount: number;
  adminCount: number;
  travelerCount: number;
  totalTours: number;
  totalBookings: number;
  totalRevenue: number;
  totalDepositCollected: number;
  totalBlogs: number;
  databaseStatus: string;
  encryptionAlgorithm: string;
  serverTimeUtc: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserProfile;
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("tourflow_jwt_token");
  }
  return null;
}

export function getAuthHeaders(explicitToken?: string): Record<string, string> {
  const token = explicitToken || getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface BlogComment {
  id: string;
  blogPostId: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  content: string;
  createdAtUtc: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  division: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar?: string;
  coverImageUrl: string;
  upvotes: number;
  views: number;
  isPinned: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string;
  commentCount?: number;
  comments?: BlogComment[];
}

export interface CreateBlogPostInput {
  title: string;
  content: string;
  summary?: string;
  category?: string;
  division?: string;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
  coverImageUrl?: string;
}

export interface UpdateBlogPostInput {
  title?: string;
  content?: string;
  summary?: string;
  category?: string;
  division?: string;
  coverImageUrl?: string;
}

// Blog API functions
export async function getBlogPosts(params?: {
  category?: string;
  division?: string;
  search?: string;
}): Promise<BlogPost[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.division && params.division !== "All") query.set("division", params.division);
  if (params?.search) query.set("search", params.search);

  const qs = query.toString();
  const url = `${API_BASE}/blogposts${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch blog posts");
  return res.json();
}

export async function getBlogPost(idOrSlug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blogposts/${idOrSlug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch story details");
  return res.json();
}

export async function createBlogPost(data: CreateBlogPostInput, token?: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blogposts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create post");
  }
  return res.json();
}

export async function updateBlogPost(id: string, data: UpdateBlogPostInput, token?: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE}/blogposts/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update post");
  }
  return res.json();
}

export async function deleteBlogPost(id: string, token?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/blogposts/${id}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(token),
    },
  });
  if (!res.ok) throw new Error("Failed to delete post");
}

export async function upvoteBlogPost(id: string): Promise<{ id: string; upvotes: number }> {
  const res = await fetch(`${API_BASE}/blogposts/${id}/upvote`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to upvote");
  return res.json();
}

export async function addBlogComment(
  id: string,
  comment: { authorName?: string; authorEmail?: string; content: string },
  token?: string
): Promise<BlogComment> {
  const res = await fetch(`${API_BASE}/blogposts/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token),
    },
    body: JSON.stringify(comment),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to add comment");
  }
  return res.json();
}

export async function deleteBlogComment(id: string, commentId: string, token?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/blogposts/${id}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(token),
    },
  });
  if (!res.ok) throw new Error("Failed to delete comment");
}

export async function uploadPostImage(file: File, token?: string): Promise<{ url: string; relativeUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/blogposts/upload-image`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(token),
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload image");
  }

  return res.json();
}

export async function fetchPlatformStats(token: string): Promise<PlatformStats> {
  const res = await fetch(`${API_BASE}/auth/platform-stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load platform stats");
  return res.json();
}

export async function fetchAllUsers(token: string): Promise<SystemUser[]> {
  const res = await fetch(`${API_BASE}/auth/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load system users");
  return res.json();
}

export async function updateUserRole(userId: string, role: string, token: string): Promise<{ message: string; user: SystemUser }> {
  const res = await fetch(`${API_BASE}/auth/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update role");
  }
  return res.json();
}

export async function fetchAllBookings(): Promise<BookingRecord[]> {
  const res = await fetch(`${API_BASE}/bookings`);
  if (!res.ok) throw new Error("Failed to load bookings");
  return res.json();
}

export async function updateBookingStatus(
  bookingId: string,
  status: string,
  paymentStatus?: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, paymentStatus }),
  });
  if (!res.ok) throw new Error("Failed to update booking status");
}

export async function fetchTourPackages(): Promise<TourSummary[]> {
  const res = await fetch(`${API_BASE}/tourpackages`);
  if (!res.ok) throw new Error("Failed to load tour packages");
  return res.json();
}

export async function fetchTourBySlug(idOrSlug: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tourpackages/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw new Error("Tour package not found");
  return res.json();
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/tourpackages/stats`);
  if (!res.ok) throw new Error("Failed to load tour stats");
  return res.json();
}

export async function createTourPackage(tour: any, token?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tourpackages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token),
    },
    body: JSON.stringify(tour),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create tour package");
  }
  return res.json();
}

export async function fetchBookingByReference(refCode: string, email?: string): Promise<BookingRecord> {
  const url = `${API_BASE}/bookings/reference/${encodeURIComponent(refCode.trim())}${
    email ? `?email=${encodeURIComponent(email.trim())}` : ""
  }`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Reservation not found");
  }
  return res.json();
}

export async function testSystemHealth(): Promise<{ status: string; timestampUtc: string; service: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend system health gateway unreachable");
  return res.json();
}

// Hotels API
export async function fetchHotels(params?: {
  search?: string;
  place?: string;
  tier?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: any[]; totalCount: number; page: number; pageSize: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.place && params.place !== "All") query.set("place", params.place);
  if (params?.tier && params.tier !== "All") query.set("tier", params.tier);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.pageSize) query.set("pageSize", params.pageSize.toString());

  const res = await fetch(`${API_BASE}/hotels?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load hotels from server");
  return res.json();
}

export async function fetchHotelBySlug(idOrSlug: string): Promise<any> {
  const res = await fetch(`${API_BASE}/hotels/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw new Error("Hotel not found");
  return res.json();
}

// Travel Tips API
export async function fetchTravelTips(params?: {
  search?: string;
  category?: string;
  division?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: any[]; totalCount: number; page: number; pageSize: number; totalPages: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.category && params.category !== "All") query.set("category", params.category);
  if (params?.division && params.division !== "All") query.set("division", params.division);
  if (params?.page) query.set("page", params.page.toString());
  if (params?.pageSize) query.set("pageSize", params.pageSize.toString());

  const res = await fetch(`${API_BASE}/traveltips?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to load travel tips from server");
  return res.json();
}

export async function fetchTravelTipBySlug(idOrSlug: string): Promise<any> {
  const res = await fetch(`${API_BASE}/traveltips/${encodeURIComponent(idOrSlug)}`);
  if (!res.ok) throw new Error("Travel tip not found");
  return res.json();
}

// Payments API
export async function fetchPaymentMethods(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/payments/methods`);
  if (!res.ok) throw new Error("Failed to load payment methods");
  return res.json();
}

export async function initiatePayment(bookingId: string, paymentMethod: string): Promise<any> {
  const res = await fetch(`${API_BASE}/payments/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, paymentMethod }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to initiate payment");
  }
  return res.json();
}

export async function verifyPayment(
  bookingId: string,
  transactionId: string,
  paymentMethod: string = "bkash"
): Promise<any> {
  const res = await fetch(`${API_BASE}/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId, transactionId, paymentMethod }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Payment verification failed");
  }
  return res.json();
}

// Reviews API
export async function submitReview(
  tourId: string,
  review: {
    rating: number;
    title: string;
    comment: string;
    reviewerLocation?: string;
    tripDateFormatted?: string;
  },
  token?: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/reviews/tour/${tourId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token),
    },
    body: JSON.stringify(review),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to submit review");
  }
  return res.json();
}

export async function fetchTourReviews(tourId: string): Promise<any[]> {
  const res = await fetch(`${API_BASE}/reviews/tour/${tourId}`);
  if (!res.ok) throw new Error("Failed to load reviews");
  return res.json();
}

