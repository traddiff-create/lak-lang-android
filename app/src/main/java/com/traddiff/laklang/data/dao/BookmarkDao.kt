package com.traddiff.laklang.data.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.traddiff.laklang.data.entity.Bookmark
import kotlinx.coroutines.flow.Flow

@Dao
interface BookmarkDao {

    @Query("SELECT * FROM bookmarks ORDER BY created_at DESC")
    fun getAll(): Flow<List<Bookmark>>

    @Query("SELECT * FROM bookmarks WHERE item_type = :type ORDER BY created_at DESC")
    fun getByType(type: String): Flow<List<Bookmark>>

    @Query("SELECT EXISTS(SELECT 1 FROM bookmarks WHERE item_id = :itemId AND item_type = :itemType)")
    fun isBookmarked(itemId: String, itemType: String): Flow<Boolean>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(bookmark: Bookmark)

    @Query("DELETE FROM bookmarks WHERE item_id = :itemId AND item_type = :itemType")
    suspend fun delete(itemId: String, itemType: String)
}
