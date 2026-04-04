package com.traddiff.laklang.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cultural_modules")
data class CulturalModule(
    @PrimaryKey val id: String,
    val title: String,
    val body: String,
    val category: String?,
    @ColumnInfo(name = "access_level") val accessLevel: String,
    @ColumnInfo(name = "review_status") val reviewStatus: String,
    @ColumnInfo(name = "reviewed_by") val reviewedBy: String?,
    @ColumnInfo(name = "reviewed_at") val reviewedAt: Long?,
    @ColumnInfo(name = "created_at") val createdAt: Long,
    @ColumnInfo(name = "updated_at") val updatedAt: Long,
)
