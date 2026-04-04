package com.traddiff.laklang.data.entity

data class SearchResult(
    val id: String,
    val type: String, // word, story, cultural_module, value, person, dialogue
    val primaryText: String,
    val secondaryText: String?,
    val category: String?,
)
