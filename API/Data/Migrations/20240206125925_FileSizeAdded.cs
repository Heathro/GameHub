using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class FileSizeAdded : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Windows",
                table: "Files",
                newName: "WindowsName");

            migrationBuilder.RenameColumn(
                name: "Macos",
                table: "Files",
                newName: "MacosName");

            migrationBuilder.RenameColumn(
                name: "Linux",
                table: "Files",
                newName: "LinuxName");

            migrationBuilder.AddColumn<int>(
                name: "LinuxSize",
                table: "Files",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MacosSize",
                table: "Files",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "WindowsSize",
                table: "Files",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LinuxSize",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "MacosSize",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "WindowsSize",
                table: "Files");

            migrationBuilder.RenameColumn(
                name: "WindowsName",
                table: "Files",
                newName: "Windows");

            migrationBuilder.RenameColumn(
                name: "MacosName",
                table: "Files",
                newName: "Macos");

            migrationBuilder.RenameColumn(
                name: "LinuxName",
                table: "Files",
                newName: "Linux");
        }
    }
}
