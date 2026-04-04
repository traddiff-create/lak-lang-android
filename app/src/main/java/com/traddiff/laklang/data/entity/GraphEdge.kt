package com.traddiff.laklang.data.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "graph_edges")
data class GraphEdge(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "source_node_id") val sourceNodeId: String,
    @ColumnInfo(name = "source_node_type") val sourceNodeType: String,
    @ColumnInfo(name = "target_node_id") val targetNodeId: String,
    @ColumnInfo(name = "target_node_type") val targetNodeType: String,
    @ColumnInfo(name = "relationship_type") val relationshipType: String,
    val metadata: String?,
    @ColumnInfo(name = "access_level") val accessLevel: String,
    @ColumnInfo(name = "created_at") val createdAt: Long,
)
