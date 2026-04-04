package com.traddiff.laklang.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "pronunciation_guides")
data class PronunciationGuide(
    @PrimaryKey val id: String,
    val symbol: String,
    val type: String,
    val ipa: String,
    @ColumnInfo(name = "english_approximation") val englishApproximation: String?,
    val description: String?,
    @ColumnInfo(name = "example_word") val exampleWord: String?,
    @ColumnInfo(name = "example_meaning") val exampleMeaning: String?,
    @ColumnInfo(name = "section_ref") val sectionRef: String?,
    @ColumnInfo(name = "access_level") val accessLevel: String,
    @ColumnInfo(name = "review_status") val reviewStatus: String,
    @ColumnInfo(name = "reviewed_by") val reviewedBy: String?,
    @ColumnInfo(name = "reviewed_at") val reviewedAt: Long?,
    @ColumnInfo(name = "created_at") val createdAt: Long,
)
