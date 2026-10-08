"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Compass,
  FileText,
  Bookmark,
  Settings,
  Lock,
  Plus,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import {
  API_BASE,
  SystemUser,
  PlatformStats,
  DashboardStats,
  BookingRecord,
  TourSummary,
  BlogPost,
  fetchPlatformStats,
  fetchDashboardStats,
  fetchAllUsers,
  updateUserRole,
  fetchAllBookings,
  updateBookingStatus,
  fetchTourPackages,
  createTourPackage,
  fetchBookingByReference,
  testSystemHealth,
  getBlogPosts,
  createBlogPost,
  deleteBlogPost,
  uploadPostImage,
} from "@/lib/api";

import { DashboardSidebar, NavItem } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { UsersTab } from "@/components/dashboard/UsersTab";
import { BookingsTab } from "@/components/dashboard/BookingsTab";
import { ToursTab } from "@/components/dashboard/ToursTab";
import { StoriesTab } from "@/components/dashboard/StoriesTab";
import { SavedTab } from "@/components/dashboard/SavedTab";
import { ProfileSettingsTab } from "@/components/dashboard/ProfileSettingsTab";
import { CreateTourModal } from "@/components/dashboard/CreateTourModal";
import { CreateStoryModal } from "@/components/dashboard/CreateStoryModal";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";

  const { user, token, isLoggedIn, logout, updateProfile } = useAuth();
  const { toast } = useToast();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.replace(`/profile?tab=${tabId}`, { scroll: false });
    setSidebarOpen(false);
  };

  // Data States
  const [loading, setLoading] = useState(false);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const [tourStats, setTourStats] = useState<DashboardStats | null>(null);
  const [usersList, setUsersList] = useState<SystemUser[]>([]);
  const [bookingsList, setBookingsList] = useState<BookingRecord[]>([]);
  const [toursList, setToursList] = useState<TourSummary[]>([]);
  const [storiesList, setStoriesList] = useState<BlogPost[]>([]);

  // Connectivity Test State
  const [connectivityStatus, setConnectivityStatus] = useState<string | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [homeCity, setHomeCity] = useState(user?.homeCity || "Dhaka");
  const [nidOrPassport, setNidOrPassport] = useState(user?.nidOrPassport || "");
  const [emergencyContact, setEmergencyContact] = useState(user?.emergencyContact || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Voucher Lookup State
  const [voucherSearchRef, setVoucherSearchRef] = useState(searchParams.get("ref") || "");
  const [voucherResult, setVoucherResult] = useState<BookingRecord | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [searchingVoucher, setSearchingVoucher] = useState(false);

  // Create Tour Modal States
  const [createTourOpen, setCreateTourOpen] = useState(false);
  const [newTourTitle, setNewTourTitle] = useState("");
  const [newTourLocation, setNewTourLocation] = useState("");
  const [newTourDivision, setNewTourDivision] = useState("Chittagong");
  const [newTourCategory, setNewTourCategory] = useState("Hill Tracts");
  const [newTourPrice, setNewTourPrice] = useState(8500);
  const [newTourDays, setNewTourDays] = useState(3);
  const [newTourNights, setNewTourNights] = useState(2);
  const [newTourCapacity, setNewTourCapacity] = useState(14);
  const [newTourDescription, setNewTourDescription] = useState("");
  const [creatingTour, setCreatingTour] = useState(false);

  // Create Story Modal States
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryDivision, setNewStoryDivision] = useState("Chittagong");
  const [newStoryCategory, setNewStoryCategory] = useState("Travel Guide");
  const [newStoryContent, setNewStoryContent] = useState("");
  const [newStoryCover, setNewStoryCover] = useState("");
  const [uploadingStoryCover, setUploadingStoryCover] = useState(false);
  const [creatingStory, setCreatingStory] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setHomeCity(user.homeCity || "Dhaka");
      setNidOrPassport(user.nidOrPassport || "");
      setEmergencyContact(user.emergencyContact || "");
      setBio(user.bio || "");
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [tStats, bPosts, tList] = await Promise.all([
        fetchDashboardStats().catch(() => null),
        getBlogPosts().catch(() => []),
        fetchTourPackages().catch(() => []),
      ]);

      if (tStats) setTourStats(tStats);
      setStoriesList(bPosts);
      setToursList(tList);

      if (user?.role === "SuperAdmin" || user?.role === "Admin") {
        const [pStats, uList, bList] = await Promise.all([
          fetchPlatformStats(token).catch(() => null),
          fetchAllUsers(token).catch(() => []),
          fetchAllBookings().catch(() => []),
        ]);
        if (pStats) setPlatformStats(pStats);
        setUsersList(uList);
        setBookingsList(bList);
      } else {
        fetchAllBookings()
          .then((all) => {
            const mine = all.filter((b) => b.customerEmail.toLowerCase() === user?.email.toLowerCase());
            setBookingsList(mine);
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error("Data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn && token) {
      loadData();
    }
  }, [isLoggedIn, token, user?.role]);

  const runConnectivityTest = async () => {
    setConnectivityStatus("Testing gateway...");
    const t0 = performance.now();
    try {
      await testSystemHealth();
      const latency = Math.round(performance.now() - t0);
      setConnectivityStatus(`Operational (${latency}ms)`);
    } catch {
      setConnectivityStatus("Unreachable");
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setProfileMessage(null);
    try {
      const res = await uploadPostImage(file);
      setAvatarUrl(res.url);

      const updateRes = await updateProfile({
        fullName,
        phoneNumber,
        homeCity,
        nidOrPassport,
        emergencyContact,
        bio,
        avatarUrl: res.url,
      });

      if (updateRes.success) {
        setProfileMessage({ type: "success", text: "Profile image updated successfully." });
      }
    } catch {
      setProfileMessage({ type: "error", text: "Failed to upload image. Please try again." });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const updateRes = await updateProfile({
        fullName,
        phoneNumber,
        homeCity,
        nidOrPassport,
        emergencyContact,
        bio,
        avatarUrl,
      });

      if (updateRes.success) {
        setProfileMessage({ type: "success", text: "Profile details updated successfully." });
      } else {
        setProfileMessage({ type: "error", text: updateRes.error || "Failed to update profile." });
      }
    } catch {
      setProfileMessage({ type: "error", text: "An error occurred while saving." });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters long." });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update password.");
      }

      setPasswordMessage({ type: "success", text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Password update failed.",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!token) return;
    try {
      await updateUserRole(userId, newRole, token);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole as SystemUser["role"] } : u))
      );
    } catch {
      toast.error("Role Update Failed", "Could not persist role assignment.");
    }
  };

  const handleBookingStatusChange = async (bookingId: string, status: string, paymentStatus?: string) => {
    try {
      await updateBookingStatus(bookingId, status, paymentStatus);
      setBookingsList((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status, paymentStatus: paymentStatus || b.paymentStatus } : b))
      );
    } catch {
      toast.error("Booking Update Failed", "Could not update status.");
    }
  };

  const handleVoucherLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherSearchRef.trim()) return;

    setSearchingVoucher(true);
    setVoucherResult(null);
    setVoucherError(null);

    try {
      const record = await fetchBookingByReference(voucherSearchRef.trim(), user?.email);
      setVoucherResult(record);
      toast.success("Voucher Verified", `Found reservation for ${record.customerName}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking voucher not found.";
      setVoucherError(msg);
      toast.error("Voucher Not Found", msg);
    } finally {
      setSearchingVoucher(false);
    }
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTour(true);
    try {
      const created = await createTourPackage(
        {
          title: newTourTitle.trim(),
          summary: newTourDescription.trim() || newTourTitle.trim(),
          description: newTourDescription.trim(),
          destination: newTourLocation.trim(),
          country: "Bangladesh",
          region: newTourDivision,
          startCity: "Dhaka",
          endCity: "Dhaka",
          durationDays: newTourDays,
          durationNights: newTourNights,
          basePrice: newTourPrice,
          depositAmount: Math.round(newTourPrice * 0.3),
          maxGroupSize: newTourCapacity,
          difficulty: "Moderate",
          category: newTourCategory,
          coverImageUrl:
            "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
          highlights: ["Scenic vistas", "Local authentic meals", "Guided security tour"],
          inclusions: ["All transportation", "Eco resort stay", "Experienced trip guide"],
          exclusions: ["Personal items", "Shopping"],
          isActive: true,
          isFeatured: false,
        },
        token || undefined
      );

      setToursList((prev) => [created, ...prev]);
      setCreateTourOpen(false);
      setNewTourTitle("");
      setNewTourLocation("");
      setNewTourDescription("");
      toast.success("Expedition Created!", `"${created.title}" is now published.`);
    } catch (err: unknown) {
      toast.error("Creation Failed", err instanceof Error ? err.message : "Failed to create tour package.");
    } finally {
      setCreatingTour(false);
    }
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingStory(true);
    try {
      const created = await createBlogPost({
        title: newStoryTitle.trim(),
        division: newStoryDivision,
        category: newStoryCategory,
        content: newStoryContent.trim(),
        coverImageUrl:
          newStoryCover ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        authorName: user?.fullName || "Explorer",
      });

      setStoriesList((prev) => [created, ...prev]);
      setCreateStoryOpen(false);
      setNewStoryTitle("");
      setNewStoryContent("");
      setNewStoryCover("");
      toast.success("Narrative Published!", `"${created.title}" is now live.`);
    } catch (err: unknown) {
      toast.error("Publish Failed", err instanceof Error ? err.message : "Failed to publish story.");
    } finally {
      setCreatingStory(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteBlogPost(storyId);
      setStoriesList((prev) => prev.filter((s) => s.id !== storyId));
    } catch {
      toast.error("Deletion Failed", "Failed to delete story.");
    }
  };

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-[80vh] bg-[#F9FAFB] flex items-center justify-center py-20 px-6">
        <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg p-8 text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[#111827]">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-[#111827] tracking-tight">Authentication Required</h2>
          <p className="text-xs text-[#4B5563]">
            Please sign in with your authorized credentials to access your dashboard.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="w-full py-2.5 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-md transition-colors"
            >
              Sign In to Platform
            </Link>
            <Link
              href="/register"
              className="w-full py-2.5 bg-[#FFFFFF] border border-[#D1D5DB] hover:bg-[#F9FAFB] text-[#111827] text-xs font-semibold rounded-md transition-colors"
            >
              Create Traveler Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = user.role === "SuperAdmin";
  const isAdmin = user.role === "Admin";
  const isTraveller = user.role === "User";

  const navItems: NavItem[] = [
    {
      id: "overview",
      label: !isTraveller ? "Operations Overview" : "Explorer Overview",
      icon: LayoutDashboard,
    },
    ...(!isTraveller
      ? [
          {
            id: "users",
            label: isSuperAdmin ? "User Governance" : "User Monitoring",
            icon: Users,
          },
        ]
      : []),
    {
      id: "bookings",
      label: !isTraveller ? "Booking Manifest" : "My Bookings & Vouchers",
      icon: Calendar,
    },
    {
      id: "tours",
      label: !isTraveller ? "Tour Packages" : "Explore Tours",
      icon: Compass,
    },
    {
      id: "stories",
      label: !isTraveller ? "Story Moderation" : "My Travel Stories",
      icon: FileText,
    },
    ...(isTraveller
      ? [
          {
            id: "saved",
            label: "Saved Itineraries",
            icon: Bookmark,
          },
        ]
      : []),
    {
      id: "profile",
      label: "Profile & Security",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex font-sans antialiased">
      {/* 1. LEFT SIDEBAR */}
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isSuperAdmin={isSuperAdmin}
        isAdmin={isAdmin}
        navItems={navItems}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        avatarUrl={avatarUrl}
        user={user}
        logout={logout}
      />

      {/* 2. RIGHT MAIN CONTAINER */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <DashboardHeader
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          navItems={navItems}
          handleTabChange={handleTabChange}
          loadData={loadData}
          loading={loading}
          avatarUrl={avatarUrl}
          user={user}
          logout={logout}
        />

        <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl w-full mx-auto">
          {/* Header Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
                {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
              </h1>
              <p className="text-xs text-[#4B5563] mt-0.5">
                {isSuperAdmin
                  ? "Supreme platform administration, security governance, and dispatch."
                  : isAdmin
                  ? "Operational trip oversight, participant records, and verification."
                  : "Track personal expeditions, vouchers, and community contributions."}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {!isTraveller && (
                <button
                  onClick={() => setCreateTourOpen(true)}
                  className="px-3.5 py-2 bg-[#111827] hover:bg-black text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Tour Package</span>
                </button>
              )}
              {isTraveller && (
                <Link
                  href="/tours"
                  className="px-3.5 py-2 bg-[#111827] hover:bg-black text-white rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Browse Expeditions</span>
                </Link>
              )}
            </div>
          </div>

          {/* TAB CONTENTS */}
          {activeTab === "overview" && (
            <OverviewTab
              platformStats={platformStats}
              tourStats={tourStats}
              usersList={usersList}
              bookingsList={bookingsList}
              toursList={toursList}
              isTraveller={isTraveller}
              connectivityStatus={connectivityStatus}
              runConnectivityTest={runConnectivityTest}
              handleTabChange={handleTabChange}
            />
          )}

          {activeTab === "users" && !isTraveller && (
            <UsersTab
              usersList={usersList}
              isSuperAdmin={isSuperAdmin}
              handleRoleChange={handleRoleChange}
            />
          )}

          {activeTab === "bookings" && (
            <BookingsTab
              bookingsList={bookingsList}
              isTraveller={isTraveller}
              handleBookingStatusChange={handleBookingStatusChange}
              voucherSearchRef={voucherSearchRef}
              setVoucherSearchRef={setVoucherSearchRef}
              handleVoucherLookup={handleVoucherLookup}
              searchingVoucher={searchingVoucher}
              voucherError={voucherError}
              voucherResult={voucherResult}
              onRefresh={loadData}
            />
          )}

          {activeTab === "tours" && (
            <ToursTab
              toursList={toursList}
              isTraveller={isTraveller}
              setCreateTourOpen={setCreateTourOpen}
            />
          )}

          {activeTab === "stories" && (
            <StoriesTab
              storiesList={storiesList}
              isTraveller={isTraveller}
              setCreateStoryOpen={setCreateStoryOpen}
              handleDeleteStory={handleDeleteStory}
            />
          )}

          {activeTab === "saved" && isTraveller && (
            <SavedTab toursList={toursList} />
          )}

          {activeTab === "profile" && (
            <ProfileSettingsTab
              user={user}
              fullName={fullName}
              setFullName={setFullName}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              homeCity={homeCity}
              setHomeCity={setHomeCity}
              nidOrPassport={nidOrPassport}
              setNidOrPassport={setNidOrPassport}
              emergencyContact={emergencyContact}
              setEmergencyContact={setEmergencyContact}
              bio={bio}
              setBio={setBio}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              savingProfile={savingProfile}
              profileMessage={profileMessage}
              handleProfileSubmit={handleProfileSubmit}
              handleAvatarFileChange={handleAvatarFileChange}
              uploadingAvatar={uploadingAvatar}
              currentPassword={currentPassword}
              setCurrentPassword={setCurrentPassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              changingPassword={changingPassword}
              passwordMessage={passwordMessage}
              handlePasswordSubmit={handlePasswordSubmit}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      <CreateTourModal
        createTourOpen={createTourOpen}
        setCreateTourOpen={setCreateTourOpen}
        newTourTitle={newTourTitle}
        setNewTourTitle={setNewTourTitle}
        newTourLocation={newTourLocation}
        setNewTourLocation={setNewTourLocation}
        newTourDivision={newTourDivision}
        setNewTourDivision={setNewTourDivision}
        newTourCategory={newTourCategory}
        setNewTourCategory={setNewTourCategory}
        newTourPrice={newTourPrice}
        setNewTourPrice={setNewTourPrice}
        newTourDays={newTourDays}
        setNewTourDays={setNewTourDays}
        newTourNights={newTourNights}
        setNewTourNights={setNewTourNights}
        newTourDescription={newTourDescription}
        setNewTourDescription={setNewTourDescription}
        creatingTour={creatingTour}
        handleCreateTour={handleCreateTour}
      />

      <CreateStoryModal
        createStoryOpen={createStoryOpen}
        setCreateStoryOpen={setCreateStoryOpen}
        newStoryTitle={newStoryTitle}
        setNewStoryTitle={setNewStoryTitle}
        newStoryDivision={newStoryDivision}
        setNewStoryDivision={setNewStoryDivision}
        newStoryCategory={newStoryCategory}
        setNewStoryCategory={setNewStoryCategory}
        newStoryContent={newStoryContent}
        setNewStoryContent={setNewStoryContent}
        newStoryCover={newStoryCover}
        setNewStoryCover={setNewStoryCover}
        uploadingStoryCover={uploadingStoryCover}
        setUploadingStoryCover={setUploadingStoryCover}
        creatingStory={creatingStory}
        handleCreateStory={handleCreateStory}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#111827] border-t-transparent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
