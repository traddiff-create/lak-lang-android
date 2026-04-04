package com.traddiff.laklang.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "dialogue_examples")
data class DialogueExample(
    @PrimaryKey val id: String,
    val type: String,
    val title: String,
    val context: String?,
    @ColumnInfo(name = "section_ref") val sectionRef: String?,
    @ColumnInfo(name = "lakota_text") val lakotaText: String,
    @ColumnInfo(name = "english_translation") val englishTranslation: String,
    @ColumnInfo(name = "num_exchanges") val numExchanges: Int,
    val participants: String?,
    @ColumnInfo(name = "speaker_genders") val speakerGenders: String?,
    @ColumnInfo(name = "access_level") val accessLevel: String,
    @ColumnInfo(name = "review_status") val reviewStatus: String,
    @ColumnInfo(name = "reviewed_by") val reviewedBy: String?,
    @ColumnInfo(name = "reviewed_at") val reviewedAt: Long?,
    @ColumnInfo(name = "created_at") val createdAt: Long,
)
