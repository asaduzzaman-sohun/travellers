export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
export const API_ROOT = API_BASE.replace(/\/api\/?$/, "");

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

export async function fetchBookingByReference(
  refCode: string,
  email?: string,
  token?: string | null
): Promise<BookingRecord> {
  const url = `${API_BASE}/bookings/reference/${encodeURIComponent(refCode.trim())}${
    email ? `?email=${encodeURIComponent(email.trim())}` : ""
  }`;
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { headers });
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

export async function initiatePayment(
  bookingId: string,
  paymentMethod: string,
  token?: string | null
): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/payments/initiate`, {
    method: "POST",
    headers,
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
  paymentMethod: string = "bkash",
  token?: string | null
): Promise<any> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/payments/verify`, {
    method: "POST",
    headers,
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

export interface PromoOffer {
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minimumTravelers: number;
  applicableCategory?: string | null;
}

export interface PromoValidationResult {
  isValid: boolean;
  normalizedCode?: string | null;
  grossTotal: number;
  discountAmount: number;
  finalTotal: number;
  message: string;
  description?: string | null;
  discountType?: string | null;
  discountValue?: number | null;
}

export interface RateLimitPolicyMetadata {
  name: string;
  algorithm: string;
  permitLimit: number;
  windowDescription: string;
  partitionStrategy: string;
}

export interface RateLimitEventRecord {
  timestampUtc: string;
  policy: string;
  clientKey: string;
  path: string;
}

export interface SystemMetricsResponse {
  instanceId: string;
  startedAtUtc: string;
  uptimeSeconds: number;
  totalRequests: number;
  totalRateLimitRejections: number;
  averageResponseTimeMs: number;
  requestsByMethod: Record<string, number>;
  rejectionsByPolicy: Record<string, number>;
  recentThrottles: RateLimitEventRecord[];
  policies: RateLimitPolicyMetadata[];
}

export interface LoadBalancerDestination {
  id: string;
  address: string;
  activeHealth: string;
  passiveHealth: string;
  isAvailable: boolean;
  concurrentRequests: number;
}

export interface LoadBalancerStatusResponse {
  gateway: string;
  algorithm: string;
  edgeRateLimit: string;
  healthCheckIntervalSeconds: number;
  uptimeSeconds: number;
  totalProxiedRequests: number;
  totalGatewayThrottled: number;
  healthyNodeCount: number;
  totalNodeCount: number;
  destinations: LoadBalancerDestination[];
}

export async function fetchActivePromos(): Promise<PromoOffer[]> {
  const res = await fetch(`${API_BASE}/bookings/promos`);
  if (!res.ok) return [];
  return res.json();
}

export async function validatePromoCode(
  tourScheduleId: string,
  numberOfTravelers: number,
  promoCode: string
): Promise<PromoValidationResult> {
  const res = await fetch(`${API_BASE}/bookings/validate-promo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tourScheduleId, numberOfTravelers, promoCode }),
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After") || "30";
    throw new Error(`Too many promo checks. Please wait ${retryAfter}s before retrying.`);
  }

  const data = await res.json().catch(() => null);
  if (!data) throw new Error("Unable to verify promo code right now.");
  return data;
}

export async function fetchSystemMetrics(token: string): Promise<{
  metrics: SystemMetricsResponse;
  servedBy: string | null;
  loadBalancer: string | null;
  responseTimeMs: string | null;
}> {
  const res = await fetch(`${API_BASE}/system/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Metrics endpoint unauthorized or unavailable");
  }
  const metrics: SystemMetricsResponse = await res.json();
  return {
    metrics,
    servedBy: res.headers.get("X-Served-By"),
    loadBalancer: res.headers.get("X-LoadBalancer"),
    responseTimeMs: res.headers.get("X-Response-Time-Ms"),
  };
}

export async function fetchLoadBalancerStatus(): Promise<LoadBalancerStatusResponse> {
  const gatewayRoot = API_BASE.replace(/\/api\/?$/, "");
  const res = await fetch(`${gatewayRoot}/lb-status`);
  if (!res.ok) {
    throw new Error("Load balancer diagnostic endpoint unavailable");
  }
  return res.json();
}

// ---------------- SignalR Realtime Chat & Notifications ----------------

// Real-time AI Travel Concierge & Notifications API
export interface ChatTourCardDto {
  id: string;
  title: string;
  slug: string;
  destination: string;
  region: string;
  durationDays: number;
  durationNights: number;
  effectivePrice: number;
  currency: string;
  coverImageUrl?: string | null;
  nextStartDate?: string | null;
  nextAvailableSeats?: number | null;
}

export interface ChatHotelCardDto {
  id: string;
  name: string;
  slug: string;
  location: string;
  tier: string;
  priceNumeric: number;
  currency: string;
  rating: number;
  coverImage?: string | null;
  relatedTourSlug?: string | null;
}

export interface ChatPromoChipDto {
  code: string;
  description: string;
  discountLabel: string;
  minimumTravelers: number;
  applicableCategory?: string | null;
}

export interface ChatBookingCardDto {
  id: string;
  bookingReference: string;
  tourTitle: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  depositPaid: number;
  balanceRemaining: number;
  numberOfTravelers: number;
  departureDate?: string | null;
}

export interface ChatRichMetadata {
  tours?: ChatTourCardDto[] | null;
  hotels?: ChatHotelCardDto[] | null;
  promos?: ChatPromoChipDto[] | null;
  bookings?: ChatBookingCardDto[] | null;
  suggestedFollowUps?: string[] | null;
  usedExternalLlm?: boolean | null;
}

export interface ChatMessageDto {
  id: string;
  sessionId?: string | null;
  roomId: string;
  senderUserId?: string | null;
  senderName: string;
  senderEmail: string;
  senderRole: string;
  message: string;
  metadata?: ChatRichMetadata | null;
  createdAtUtc: string;
}

export interface ChatSessionDto {
  id: string;
  roomId: string;
  ownerUserId: string;
  ownerName: string;
  ownerEmail: string;
  title: string;
  isEscalatedToHuman: boolean;
  lastMessageAtUtc: string;
  createdAtUtc: string;
  messageCount: number;
  lastMessagePreview?: string | null;
}

export interface AskChatbotResponse {
  session: ChatSessionDto;
  userMessage: ChatMessageDto;
  assistantMessage: ChatMessageDto;
}

export interface RealtimeNotificationDto {
  id: string;
  category: string;
  title: string;
  message: string;
  actionUrl?: string | null;
  isRead: boolean;
  createdAtUtc: string;
  targetRole?: string | null;
}

export interface NotificationsFeedResponse {
  notifications: RealtimeNotificationDto[];
  unreadCount: number;
}

export async function fetchChatSessions(token: string): Promise<ChatSessionDto[]> {
  const res = await fetch(`${API_BASE}/chat/sessions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unable to load your conversation history");
  return res.json();
}

export async function createChatSession(
  token: string,
  payload?: { title?: string; initialMessage?: string }
): Promise<ChatSessionDto> {
  const res = await fetch(`${API_BASE}/chat/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload ?? {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Unable to start a new AI conversation");
  }
  return res.json();
}

export async function fetchSessionMessages(
  sessionId: string,
  token: string,
  take = 80
): Promise<ChatMessageDto[]> {
  const res = await fetch(
    `${API_BASE}/chat/sessions/${encodeURIComponent(sessionId)}/messages?take=${take}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Unable to load messages for this session");
  return res.json();
}

export async function askChatbot(
  sessionId: string,
  message: string,
  token: string
): Promise<AskChatbotResponse> {
  const res = await fetch(
    `${API_BASE}/chat/sessions/${encodeURIComponent(sessionId)}/ask`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to send message to TourFlow AI Concierge");
  }
  return res.json();
}

export async function escalateChatSession(
  sessionId: string,
  token: string
): Promise<ChatSessionDto> {
  const res = await fetch(
    `${API_BASE}/chat/sessions/${encodeURIComponent(sessionId)}/escalate`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Could not escalate session");
  }
  return res.json();
}

export async function replyAsHumanSpecialist(
  sessionId: string,
  message: string,
  token: string
): Promise<ChatSessionDto> {
  const res = await fetch(
    `${API_BASE}/chat/sessions/${encodeURIComponent(sessionId)}/reply`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to send specialist reply");
  }
  return res.json();
}

export async function deleteChatSession(
  sessionId: string,
  token: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/chat/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!res.ok) throw new Error("Failed to remove conversation");
}

export async function fetchNotifications(
  token: string,
  take = 30
): Promise<NotificationsFeedResponse> {
  const res = await fetch(`${API_BASE}/notifications?take=${take}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unable to load notifications");
  return res.json();
}

export async function markNotificationRead(
  id: string,
  token: string
): Promise<{ id: string; isRead: boolean; unreadCount: number }> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unable to mark notification as read");
  return res.json();
}

export async function markAllNotificationsRead(
  token: string
): Promise<{ unreadCount: number }> {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unable to mark notifications as read");
  return res.json();
}

export async function sendAdminBroadcast(
  payload: {
    title: string;
    message: string;
    category?: string;
    actionUrl?: string;
    targetEmail?: string;
    targetRole?: string;
  },
  token: string
): Promise<RealtimeNotificationDto> {
  const res = await fetch(`${API_BASE}/notifications/broadcast`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.message || "Failed to send live broadcast");
  }
  return res.json();
}



