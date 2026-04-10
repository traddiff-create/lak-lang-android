package com.traddiff.laklang.ui.cosmos

import androidx.compose.ui.graphics.Color
import kotlin.math.abs

data class CosmosNode(
    val id: String,
    val type: String,
    val lakota: String,
    val english: String,
    val direction: Direction,
    val orbit: OrbitParams,
    val imageAsset: String? = null,
)

data class OrbitParams(
    val rx: Float,     // orbit radius X (fraction of canvas)
    val ry: Float,     // orbit radius Y
    val cx: Float,     // center X
    val cy: Float,     // center Y
    val angle: Float,  // starting angle (radians)
    val speed: Float,  // angular velocity
    val tilt: Float,   // orbit plane tilt (degrees)
    val clockwise: Boolean,
)

private const val ORBIT_SPEED_MIN = 0.00003f
private const val ORBIT_SPEED_MAX = 0.00012f

fun hashSeed(i: Int): Int {
    val h = (i + 1).toLong() * 2654435761L
    return (abs(h.toInt()) % 10000)
}

fun computeOrbit(index: Int, total: Int, direction: Direction, inRoom: Boolean): OrbitParams {
    val seed = hashSeed(index)
    val radius = if (inRoom) 0.25f else 0.12f
    return OrbitParams(
        rx = radius + (seed % 18) / 100f,
        ry = (radius * 0.7f) + ((seed * 7) % 14) / 100f,
        cx = if (inRoom) 0.5f else direction.cx,
        cy = if (inRoom) 0.5f else direction.cy,
        angle = (index.toFloat() / total.coerceAtLeast(1)) * (Math.PI.toFloat() * 2),
        speed = ORBIT_SPEED_MIN + (seed % 100) / 100f * (ORBIT_SPEED_MAX - ORBIT_SPEED_MIN),
        tilt = ((seed * 3) % 40 - 20).toFloat(),
        clockwise = seed % 2 == 0,
    )
}

fun nodeColor(type: String): Color = when (type) {
    "word" -> CosmosColors.Turquoise
    "story" -> CosmosColors.Ochre
    "value" -> CosmosColors.Sage
    "person" -> CosmosColors.Ember
    "place" -> CosmosColors.Earth
    "ceremony", "song" -> CosmosColors.Star
    else -> CosmosColors.Ink
}
