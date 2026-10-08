"use client";

import React, { useRef } from "react";

interface ProfileSettingsTabProps {
  user: {
    fullName: string;
    email: string;
    role: string;
  };
  fullName: string;
  setFullName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  homeCity: string;
  setHomeCity: (city: string) => void;
  nidOrPassport: string;
  setNidOrPassport: (nid: string) => void;
  emergencyContact: string;
  setEmergencyContact: (contact: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  savingProfile: boolean;
  profileMessage: { type: "success" | "error"; text: string } | null;
  handleProfileSubmit: (e: React.FormEvent) => void;
  handleAvatarFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingAvatar: boolean;
  // Password change
  currentPassword: string;
  setCurrentPassword: (p: string) => void;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  changingPassword: boolean;
  passwordMessage: { type: "success" | "error"; text: string } | null;
  handlePasswordSubmit: (e: React.FormEvent) => void;
}

export function ProfileSettingsTab({
  user,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  homeCity,
  setHomeCity,
  nidOrPassport,
  setNidOrPassport,
  emergencyContact,
  setEmergencyContact,
  bio,
  setBio,
  avatarUrl,
  setAvatarUrl,
  savingProfile,
  profileMessage,
  handleProfileSubmit,
  handleAvatarFileChange,
  uploadingAvatar,
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  changingPassword,
  passwordMessage,
  handlePasswordSubmit,
}: ProfileSettingsTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-md">
        <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#111827]">
              Personal Details & Identification
            </h2>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Update your traveler profile, contacts, and NID credentials.
            </p>
          </div>
          <span className="text-[11px] font-medium bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB] px-2 py-0.5 rounded">
            Role: {user.role}
          </span>
        </div>

        {profileMessage && (
          <div
            className={`mx-6 mt-4 p-3 border text-xs rounded-md ${
              profileMessage.type === "success"
                ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#111827]"
                : "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]"
            }`}
          >
            {profileMessage.text}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="p-6 space-y-6 text-xs">
          {/* Avatar Upload Row */}
          <div className="flex items-center gap-5 pb-6 border-b border-[#E5E7EB]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-14 w-14 rounded-full object-cover border border-[#E5E7EB]"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-[#111827] text-white flex items-center justify-center font-bold text-lg border border-[#E5E7EB]">
                {fullName[0] || "U"}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#FFFFFF] border border-[#D1D5DB] hover:border-[#111827] text-[#111827] font-medium px-3 py-1.5 rounded-md text-xs transition-colors"
                >
                  {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="text-[#6B7280] hover:text-[#111827] px-2 py-1 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#6B7280]">JPG, PNG, or WEBP up to 10MB.</p>
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">Full Legal Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">Email Address (Account ID)</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-[#F3F4F6] border border-[#E5E7EB] rounded-md px-3 py-2 text-xs text-[#6B7280] cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">Phone Number</label>
              <input
                type="tel"
                placeholder="+880 1711-234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">National ID / Passport</label>
              <input
                type="text"
                placeholder="NID or Passport number"
                value={nidOrPassport}
                onChange={(e) => setNidOrPassport(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">Home Division / City</label>
              <input
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">Emergency Contact Number</label>
              <input
                type="tel"
                placeholder="+880 1812-345678"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-medium text-[#111827]">Explorer Bio / Bio Notes</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief note about your field expeditions..."
              className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md p-3 text-xs text-[#111827] focus:outline-none focus:border-[#111827] transition-colors"
            />
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 bg-[#111827] hover:bg-black text-white font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-md">
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <h2 className="text-sm font-semibold text-[#111827]">Security & Password Update</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Ensure your account stays protected with a strong, distinct password.
          </p>
        </div>

        {passwordMessage && (
          <div
            className={`mx-6 mt-4 p-3 border text-xs rounded-md ${
              passwordMessage.type === "success"
                ? "bg-[#F3F4F6] border-[#E5E7EB] text-[#111827]"
                : "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]"
            }`}
          >
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#111827]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#111827]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-medium text-[#111827]">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#D1D5DB] rounded-md px-3 py-2 text-xs text-[#111827] focus:outline-none focus:border-[#111827]"
                required
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="px-5 py-2 bg-[#111827] hover:bg-black text-white font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
