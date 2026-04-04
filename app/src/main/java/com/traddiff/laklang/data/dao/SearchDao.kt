package com.traddiff.laklang.data.dao

import androidx.room.Dao
import androidx.room.Query
import com.traddiff.laklang.data.entity.SearchResult

@Dao
interface SearchDao {

    @Query("""
        SELECT id, 'word' AS type, lakota AS primaryText, english AS secondaryText, category
        FROM vocabulary_items
        WHERE (lakota LIKE '%' || :query || '%' OR english LIKE '%' || :query || '%')
        AND review_status = 'approved' AND access_level = 'public'
        ORDER BY
            CASE WHEN lakota LIKE :query || '%' THEN 0
                 WHEN english LIKE :query || '%' THEN 1
                 ELSE 2 END
        LIMIT 20
    """)
    suspend fun searchWords(query: String): List<SearchResult>

    @Query("""
        SELECT id, 'story' AS type, title_english AS primaryText, title_lakota AS secondaryText, category
        FROM stories
        WHERE (title_lakota LIKE '%' || :query || '%' OR title_english LIKE '%' || :query || '%' OR body LIKE '%' || :query || '%')
        AND review_status = 'approved' AND access_level = 'public'
        ORDER BY title_english ASC
        LIMIT 10
    """)
    suspend fun searchStories(query: String): List<SearchResult>

    @Query("""
        SELECT id, 'cultural_module' AS type, title AS primaryText, category AS secondaryText, category
        FROM cultural_modules
        WHERE (title LIKE '%' || :query || '%' OR body LIKE '%' || :query || '%')
        AND review_status = 'approved' AND access_level = 'public'
        ORDER BY title ASC
        LIMIT 10
    """)
    suspend fun searchCulture(query: String): List<SearchResult>

    @Query("""
        SELECT id, 'value' AS type, lakota AS primaryText, english AS secondaryText, NULL AS category
        FROM `values`
        WHERE (lakota LIKE '%' || :query || '%' OR english LIKE '%' || :query || '%')
        AND review_status = 'approved' AND access_level = 'public'
        LIMIT 10
    """)
    suspend fun searchValues(query: String): List<SearchResult>

    @Query("""
        SELECT id, 'person' AS type, english_name AS primaryText, lakota_name AS secondaryText, role AS category
        FROM persons
        WHERE (lakota_name LIKE '%' || :query || '%' OR english_name LIKE '%' || :query || '%')
        AND review_status = 'approved' AND access_level = 'public'
        LIMIT 10
    """)
    suspend fun searchPersons(query: String): List<SearchResult>

    @Query("""
        SELECT id, 'dialogue' AS type, title AS primaryText, english_translation AS secondaryText, type AS category
        FROM dialogue_examples
        WHERE (title LIKE '%' || :query || '%' OR lakota_text LIKE '%' || :query || '%' OR english_translation LIKE '%' || :query || '%')
        AND review_status = 'approved' AND access_level = 'public'
        LIMIT 10
    """)
    suspend fun searchDialogues(query: String): List<SearchResult>
}
