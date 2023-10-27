using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class PlatformsGenres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Genres",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Action = table.Column<bool>(type: "INTEGER", nullable: false),
                    Adventure = table.Column<bool>(type: "INTEGER", nullable: false),
                    Card = table.Column<bool>(type: "INTEGER", nullable: false),
                    Educational = table.Column<bool>(type: "INTEGER", nullable: false),
                    Fighting = table.Column<bool>(type: "INTEGER", nullable: false),
                    Horror = table.Column<bool>(type: "INTEGER", nullable: false),
                    Platformer = table.Column<bool>(type: "INTEGER", nullable: false),
                    Puzzle = table.Column<bool>(type: "INTEGER", nullable: false),
                    Racing = table.Column<bool>(type: "INTEGER", nullable: false),
                    Rhythm = table.Column<bool>(type: "INTEGER", nullable: false),
                    Roleplay = table.Column<bool>(type: "INTEGER", nullable: false),
                    Shooter = table.Column<bool>(type: "INTEGER", nullable: false),
                    Simulation = table.Column<bool>(type: "INTEGER", nullable: false),
                    Sport = table.Column<bool>(type: "INTEGER", nullable: false),
                    Stealth = table.Column<bool>(type: "INTEGER", nullable: false),
                    Strategy = table.Column<bool>(type: "INTEGER", nullable: false),
                    Survival = table.Column<bool>(type: "INTEGER", nullable: false),
                    GameId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genres", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Genres_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Platforms",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Windows = table.Column<bool>(type: "INTEGER", nullable: false),
                    Macos = table.Column<bool>(type: "INTEGER", nullable: false),
                    Linux = table.Column<bool>(type: "INTEGER", nullable: false),
                    GameId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Platforms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Platforms_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Genres_GameId",
                table: "Genres",
                column: "GameId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_GameId",
                table: "Platforms",
                column: "GameId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Genres");

            migrationBuilder.DropTable(
                name: "Platforms");
        }
    }
}
