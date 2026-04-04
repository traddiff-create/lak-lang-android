package com.traddiff.laklang.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "vocabulary_items")
data class VocabularyItem(
    @PrimaryKey val id: String,
    val lakota: String,
    val english: String,
    @ColumnInfo(name = "part_of_speech") val partOfSpeech: String?,
    @ColumnInfo(name = "phonetic_guide") val phoneticGuide: String?,
    val ipa: String?,
    val category: String?,
    @ColumnInfo(name = "cultural_note") val culturalNote: String?,
    val source: String?,
    @ColumnInfo(name = "access_level") val accessLevel: String,
    @ColumnInfo(name = "review_status") val reviewStatus: String,
    @ColumnInfo(name = "review_notes") val reviewNotes: String?,
    @ColumnInfo(name = "reviewed_by") val reviewedBy: String?,
    @ColumnInfo(name = "reviewed_at") val reviewedAt: Long?,
    @ColumnInfo(name = "created_at") val createdAt: Long,
    @ColumnInfo(name = "updated_at") val updatedAt: Long,
)
