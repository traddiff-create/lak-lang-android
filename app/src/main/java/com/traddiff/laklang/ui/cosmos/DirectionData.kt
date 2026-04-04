package com.traddiff.laklang.ui.cosmos

import androidx.compose.ui.graphics.Color

data class Direction(
    val key: String,
    val lakota: String,
    val english: String,
    val nodeTypes: List<String>,
    val cx: Float, // center X as fraction (0-1)
    val cy: Float, // center Y as fraction (0-1)
    val color: Color,
)

val DIRECTIONS = listOf(
    Direction("west", "Wiyohpeyata", "West — Stories", listOf("story"), 0.15f, 0.50f, CosmosColors.Ochre),
    Direction("north", "Waziyata", "North — Wisdom", listOf("value"), 0.50f, 0.12f, CosmosColors.Sage),
    Direction("east", "Wihinanpata", "East — Knowledge", listOf("word"), 0.85f, 0.50f, CosmosColors.Turquoise),
    Direction("south", "Itokaga", "South — Community", listOf("person"), 0.50f, 0.88f, CosmosColors.Ember),
    Direction("sky", "Wankantanhan", "Sky — Spirit", listOf("ceremony", "song"), 0.75f, 0.20f, CosmosColors.Star),
    Direction("earth", "Maka", "Earth — Land", listOf("place"), 0.25f, 0.80f, CosmosColors.Earth),
    Direction("center", "Cante", "Center — Heart", emptyList(), 0.50f, 0.50f, CosmosColors.Center),
)

fun directionForType(type: String): Direction =
    DIRECTIONS.find { type in it.nodeTypes } ?: DIRECTIONS.last()

fun seasonalDirectionKey(): String {
    val month = java.util.Calendar.getInstance().get(java.util.Calendar.MONTH)
    return when {
        month in 2..4 -> "east"    // Spring → vocabulary
        month in 5..7 -> "south"   // Summer → community
        month in 8..10 -> "sky"    // Fall → ceremony
        else -> "west"             // Winter → stories
    }
}
