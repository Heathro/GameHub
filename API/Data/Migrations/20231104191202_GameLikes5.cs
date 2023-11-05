using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class GameLikes5 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GameLikes_Games_TargetGameId",
                table: "GameLikes");

            migrationBuilder.DropForeignKey(
                name: "FK_GameLikes_Users_SourceUserId",
                table: "GameLikes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GameLikes",
                table: "GameLikes");

            migrationBuilder.RenameTable(
                name: "GameLikes",
                newName: "Likes");

            migrationBuilder.RenameIndex(
                name: "IX_GameLikes_TargetGameId",
                table: "Likes",
                newName: "IX_Likes_TargetGameId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Likes",
                table: "Likes",
                columns: new[] { "SourceUserId", "TargetGameId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Likes_Games_TargetGameId",
                table: "Likes",
                column: "TargetGameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Likes_Users_SourceUserId",
                table: "Likes",
                column: "SourceUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Likes_Games_TargetGameId",
                table: "Likes");

            migrationBuilder.DropForeignKey(
                name: "FK_Likes_Users_SourceUserId",
                table: "Likes");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Likes",
                table: "Likes");

            migrationBuilder.RenameTable(
                name: "Likes",
                newName: "GameLikes");

            migrationBuilder.RenameIndex(
                name: "IX_Likes_TargetGameId",
                table: "GameLikes",
                newName: "IX_GameLikes_TargetGameId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GameLikes",
                table: "GameLikes",
                columns: new[] { "SourceUserId", "TargetGameId" });

            migrationBuilder.AddForeignKey(
                name: "FK_GameLikes_Games_TargetGameId",
                table: "GameLikes",
                column: "TargetGameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GameLikes_Users_SourceUserId",
                table: "GameLikes",
                column: "SourceUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
