package com.traddiff.laklang.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "bookmarks")
data class Bookmark(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    @ColumnInfo(name = "item_id") val itemId: String,
    @ColumnInfo(name = "item_type") val itemType: String, // word, story, cultural_module
    @ColumnInfo(name = "created_at") val createdAt: Long = System.currentTimeMillis(),
)
