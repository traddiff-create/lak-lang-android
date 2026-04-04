package com.traddiff.laklang.data.dao

import androidx.room.Dao
import androidx.room.Query
import com.traddiff.laklang.data.entity.GraphEdge
import com.traddiff.laklang.data.entity.Person
import com.traddiff.laklang.data.entity.Story
import com.traddiff.laklang.data.entity.Value

@Dao
interface GraphDao {

    @Query("""
        SELECT * FROM graph_edges
        WHERE (source_node_id = :nodeId OR target_node_id = :nodeId)
        AND access_level = 'public'
    """)
    suspend fun getEdgesForNode(nodeId: String): List<GraphEdge>

    @Query("SELECT * FROM graph_edges WHERE access_level = 'public'")
    suspend fun getAllEdges(): List<GraphEdge>

    @Query("SELECT * FROM `values` WHERE review_status = 'approved' AND access_level = 'public'")
    suspend fun getAllValues(): List<Value>

    @Query("SELECT * FROM persons WHERE review_status = 'approved' AND access_level = 'public'")
    suspend fun getAllPersons(): List<Person>

    @Query("""
        SELECT * FROM stories
        WHERE review_status = 'approved' AND access_level = 'public'
        AND id IN (
            SELECT target_node_id FROM graph_edges
            WHERE source_node_id = :nodeId AND target_node_type = 'story'
            UNION
            SELECT source_node_id FROM graph_edges
            WHERE target_node_id = :nodeId AND source_node_type = 'story'
        )
    """)
    suspend fun getConnectedStories(nodeId: String): List<Story>

    @Query("""
        SELECT * FROM `values`
        WHERE review_status = 'approved' AND access_level = 'public'
        AND id IN (
            SELECT target_node_id FROM graph_edges
            WHERE source_node_id = :nodeId AND target_node_type = 'value'
            UNION
            SELECT source_node_id FROM graph_edges
            WHERE target_node_id = :nodeId AND source_node_type = 'value'
        )
    """)
    suspend fun getConnectedValues(nodeId: String): List<Value>

    @Query("""
        SELECT * FROM persons
        WHERE review_status = 'approved' AND access_level = 'public'
        AND id IN (
            SELECT target_node_id FROM graph_edges
            WHERE source_node_id = :nodeId AND target_node_type = 'person'
            UNION
            SELECT source_node_id FROM graph_edges
            WHERE target_node_id = :nodeId AND source_node_type = 'person'
        )
    """)
    suspend fun getConnectedPersons(nodeId: String): List<Person>

    @Query("""
        SELECT v.* FROM vocabulary_items v
        WHERE v.review_status = 'approved' AND v.access_level = 'public'
        AND v.category = (
            SELECT category FROM vocabulary_items WHERE id = :wordId
        )
        AND v.id != :wordId
        LIMIT 10
    """)
    suspend fun getRelatedWordsByCategory(wordId: String): List<com.traddiff.laklang.data.entity.VocabularyItem>
}
