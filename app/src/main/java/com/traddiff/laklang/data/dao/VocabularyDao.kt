package com.traddiff.laklang.data.dao

import androidx.room.Dao
import androidx.room.Query
import com.traddiff.laklang.data.entity.VocabularyItem
import kotlinx.coroutines.flow.Flow

@Dao
interface VocabularyDao {

    @Query("""
        SELECT * FROM vocabulary_items
        WHERE review_status = 'approved' AND access_level = 'public'
        ORDER BY lakota ASC
    """)
    fun getAllApproved(): Flow<List<VocabularyItem>>

    @Query("""
        SELECT * FROM vocabulary_items
        WHERE review_status = 'approved' AND access_level = 'public'
        AND category = :category
        ORDER BY lakota ASC
    """)
    fun getByCategory(category: String): Flow<List<VocabularyItem>>

    @Query("""
        SELECT DISTINCT category FROM vocabulary_items
        WHERE review_status = 'approved' AND access_level = 'public'
        AND category IS NOT NULL
        ORDER BY category ASC
    """)
    fun getCategories(): Flow<List<String>>

    @Query("""
        SELECT * FROM vocabulary_items
        WHERE review_status = 'approved' AND access_level = 'public'
        AND (lakota LIKE '%' || :query || '%' OR english LIKE '%' || :query || '%')
        ORDER BY
            CASE WHEN lakota LIKE :query || '%' THEN 0
                 WHEN english LIKE :query || '%' THEN 1
                 ELSE 2 END,
            lakota ASC
        LIMIT 100
    """)
    fun search(query: String): Flow<List<VocabularyItem>>

    @Query("""
        SELECT * FROM vocabulary_items
        WHERE review_status = 'approved' AND access_level = 'public'
        ORDER BY lakota ASC
    """)
    suspend fun getAllApprovedList(): List<VocabularyItem>

    @Query("SELECT * FROM vocabulary_items WHERE id = :id")
    suspend fun getById(id: String): VocabularyItem?

    @Query("""
        SELECT * FROM vocabulary_items
        WHERE review_status = 'approved' AND access_level = 'public'
        ORDER BY RANDOM() LIMIT 1
    """)
    suspend fun getRandomWord(): VocabularyItem?

    @Query("""
        SELECT COUNT(*) FROM vocabulary_items
        WHERE review_status = 'approved' AND access_level = 'public'
    """)
    suspend fun getApprovedCount(): Int
}
