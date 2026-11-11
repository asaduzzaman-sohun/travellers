using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourFlow.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSignalRChatAndNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoomId = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    SenderUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    SenderName = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    SenderEmail = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    SenderRole = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Message = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RealtimeNotifications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TargetEmail = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: true),
                    TargetRole = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    Category = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Title = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: false),
                    Message = table.Column<string>(type: "character varying(600)", maxLength: 600, nullable: false),
                    ActionUrl = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    ReadByUsers = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RealtimeNotifications", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_RoomId_CreatedAtUtc",
                table: "ChatMessages",
                columns: new[] { "RoomId", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_RealtimeNotifications_TargetEmail_IsRead_CreatedAtUtc",
                table: "RealtimeNotifications",
                columns: new[] { "TargetEmail", "IsRead", "CreatedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_RealtimeNotifications_TargetRole_CreatedAtUtc",
                table: "RealtimeNotifications",
                columns: new[] { "TargetRole", "CreatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "RealtimeNotifications");
        }
    }
}
