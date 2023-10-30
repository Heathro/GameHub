﻿// <auto-generated />
using System;
using API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace API.Data.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20231024105426_PlatformsGenres")]
    partial class PlatformsGenres
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "7.0.11");

            modelBuilder.Entity("API.Entities.AppUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("City")
                        .HasColumnType("TEXT");

                    b.Property<string>("Country")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("Created")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("LastActive")
                        .HasColumnType("TEXT");

                    b.Property<byte[]>("PasswordHash")
                        .HasColumnType("BLOB");

                    b.Property<byte[]>("PasswordSalt")
                        .HasColumnType("BLOB");

                    b.Property<string>("Realname")
                        .HasColumnType("TEXT");

                    b.Property<string>("Summary")
                        .HasColumnType("TEXT");

                    b.Property<string>("Username")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("API.Entities.Avatar", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("AppUserId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("PublicId")
                        .HasColumnType("TEXT");

                    b.Property<string>("Url")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("AppUserId")
                        .IsUnique();

                    b.ToTable("Avatars");
                });

            modelBuilder.Entity("API.Entities.Game", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Description")
                        .HasColumnType("TEXT");

                    b.Property<string>("Title")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Games");
                });

            modelBuilder.Entity("API.Entities.Genres", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Action")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Adventure")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Card")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Educational")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Fighting")
                        .HasColumnType("INTEGER");

                    b.Property<int>("GameId")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Horror")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Platformer")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Puzzle")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Racing")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Rhythm")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Roleplay")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Shooter")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Simulation")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Sport")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Stealth")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Strategy")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Survival")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("GameId")
                        .IsUnique();

                    b.ToTable("Genres");
                });

            modelBuilder.Entity("API.Entities.Platforms", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("GameId")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Linux")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Macos")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Windows")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("GameId")
                        .IsUnique();

                    b.ToTable("Platforms");
                });

            modelBuilder.Entity("API.Entities.Poster", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("GameId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("PublicId")
                        .HasColumnType("TEXT");

                    b.Property<string>("Url")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("GameId")
                        .IsUnique();

                    b.ToTable("Posters");
                });

            modelBuilder.Entity("API.Entities.Screenshot", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("GameId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("PublicId")
                        .HasColumnType("TEXT");

                    b.Property<string>("Url")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("GameId");

                    b.ToTable("Screenshots");
                });

            modelBuilder.Entity("API.Entities.Avatar", b =>
                {
                    b.HasOne("API.Entities.AppUser", "AppUser")
                        .WithOne("Avatar")
                        .HasForeignKey("API.Entities.Avatar", "AppUserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AppUser");
                });

            modelBuilder.Entity("API.Entities.Genres", b =>
                {
                    b.HasOne("API.Entities.Game", "Game")
                        .WithOne("Genres")
                        .HasForeignKey("API.Entities.Genres", "GameId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Game");
                });

            modelBuilder.Entity("API.Entities.Platforms", b =>
                {
                    b.HasOne("API.Entities.Game", "Game")
                        .WithOne("Platforms")
                        .HasForeignKey("API.Entities.Platforms", "GameId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Game");
                });

            modelBuilder.Entity("API.Entities.Poster", b =>
                {
                    b.HasOne("API.Entities.Game", "Game")
                        .WithOne("Poster")
                        .HasForeignKey("API.Entities.Poster", "GameId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Game");
                });

            modelBuilder.Entity("API.Entities.Screenshot", b =>
                {
                    b.HasOne("API.Entities.Game", "Game")
                        .WithMany("Screenshots")
                        .HasForeignKey("GameId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Game");
                });

            modelBuilder.Entity("API.Entities.AppUser", b =>
                {
                    b.Navigation("Avatar");
                });

            modelBuilder.Entity("API.Entities.Game", b =>
                {
                    b.Navigation("Genres");

                    b.Navigation("Platforms");

                    b.Navigation("Poster");

                    b.Navigation("Screenshots");
                });
#pragma warning restore 612, 618
        }
    }
}