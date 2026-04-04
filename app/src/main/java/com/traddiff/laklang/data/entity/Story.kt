package com.traddiff.laklang.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "stories")
data class Story(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "title_lakota") val titleLakota: String,
    @ColumnInfo(name = "title_english") val titleEnglish: String,
    val body: String,
    @ColumnInfo(name = "audio_url") val audioUrl: String?,
    val category: String?,
    val source: String?,
    @ColumnInfo(name = "access_level") val accessLevel: String,
    @ColumnInfo(name = "review_status") val reviewStatus: String,
    @ColumnInfo(name = "review_notes") val reviewNotes: String?,
    @ColumnInfo(name = "reviewed_by") val reviewedBy: String?,
    @ColumnInfo(name = "reviewed_at") val reviewedAt: Long?,
    @ColumnInfo(name = "created_at") val createdAt: Long,
    @ColumnInfo(name = "updated_at") val updatedAt: Long,
)
