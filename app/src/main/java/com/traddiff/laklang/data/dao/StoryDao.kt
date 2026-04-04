package com.traddiff.laklang.data.dao

import androidx.room.Dao
import androidx.room.Query
import com.traddiff.laklang.data.entity.Story
import kotlinx.coroutines.flow.Flow

@Dao
interface StoryDao {

    @Query("""
        SELECT * FROM stories
        WHERE review_status = 'approved' AND access_level = 'public'
        ORDER BY title_english ASC
    """)
    fun getAllApproved(): Flow<List<Story>>

    @Query("""
        SELECT * FROM stories
        WHERE review_status = 'approved' AND access_level = 'public'
        ORDER BY title_english ASC
    """)
    suspend fun getAllApprovedList(): List<Story>

    @Query("SELECT * FROM stories WHERE id = :id")
    suspend fun getById(id: String): Story?

    @Query("""
        SELECT * FROM stories
        WHERE review_status = 'approved' AND access_level = 'public'
        AND (title_lakota LIKE '%' || :query || '%' OR title_english LIKE '%' || :query || '%')
        ORDER BY title_english ASC
    """)
    fun search(query: String): Flow<List<Story>>
}
