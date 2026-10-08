using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHotelsTravelTipsAndReviewsUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Reviews",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Hotels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Location = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    Place = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Tier = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Rating = table.Column<double>(type: "double precision", nullable: false),
                    ReviewsCount = table.Column<int>(type: "integer", nullable: false),
                    PriceNumeric = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PricePerNight = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CoverImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    GalleryImages = table.Column<List<string>>(type: "text[]", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Pros = table.Column<List<string>>(type: "text[]", nullable: false),
                    Cons = table.Column<List<string>>(type: "text[]", nullable: false),
                    Amenities = table.Column<List<string>>(type: "text[]", nullable: false),
                    RoomTypesJson = table.Column<string>(type: "text", nullable: false),
                    HowToReach = table.Column<string>(type: "text", nullable: false),
                    NearbyAttractionsJson = table.Column<string>(type: "text", nullable: false),
                    ReceptionPhone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReceptionEmail = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    CheckInTime = table.Column<string>(type: "text", nullable: false),
                    CheckOutTime = table.Column<string>(type: "text", nullable: false),
                    RelatedTourSlug = table.Column<string>(type: "text", nullable: true),
                    RelatedTourTitle = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Hotels", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TravelTips",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Slug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    BadgeColor = table.Column<string>(type: "text", nullable: false),
                    ReadingTime = table.Column<string>(type: "text", nullable: false),
                    Division = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CoverImage = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Summary = table.Column<string>(type: "text", nullable: false),
                    KeyHighlights = table.Column<List<string>>(type: "text[]", nullable: false),
                    Overview = table.Column<string>(type: "text", nullable: false),
                    CheckpostProceduresJson = table.Column<string>(type: "text", nullable: true),
                    TransportationJson = table.Column<string>(type: "text", nullable: true),
                    FieldScheduleJson = table.Column<string>(type: "text", nullable: true),
                    PackingList = table.Column<List<string>>(type: "text[]", nullable: false),
                    SafetyDirectives = table.Column<List<string>>(type: "text[]", nullable: false),
                    CommunityEtiquette = table.Column<List<string>>(type: "text[]", nullable: false),
                    EmergencyContactsJson = table.Column<string>(type: "text", nullable: true),
                    RelatedTourSlug = table.Column<string>(type: "text", nullable: true),
                    RelatedTourTitle = table.Column<string>(type: "text", nullable: true),
                    RelatedHotelId = table.Column<string>(type: "text", nullable: true),
                    RelatedHotelName = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TravelTips", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId",
                table: "Reviews",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Hotels_Slug",
                table: "Hotels",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TravelTips_Slug",
                table: "TravelTips",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews");

            migrationBuilder.DropTable(
                name: "Hotels");

            migrationBuilder.DropTable(
                name: "TravelTips");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_UserId",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Reviews");
        }
    }
}
