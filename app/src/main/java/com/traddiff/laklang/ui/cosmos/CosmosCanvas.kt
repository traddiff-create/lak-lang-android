package com.traddiff.laklang.ui.cosmos

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.requiredSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.*
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.*

private const val BASE_OPACITY = 0.15f
private const val STAR_COUNT = 200

@OptIn(ExperimentalTextApi::class)
@Composable
fun CosmosCanvas(
    nodes: List<CosmosNode>,
    activeDirection: String?,
    onDirectionClick: (Direction) -> Unit,
    onNodeClick: (CosmosNode) -> Unit,
) {
    // Camera state
    var cameraOffset by remember { mutableStateOf(Offset.Zero) }
    var cameraScale by remember { mutableStateOf(1f) }

    // Animation time
    var startTime by remember { mutableLongStateOf(System.nanoTime()) }
    val time by produceState(0L) {
        while (true) {
            value = (System.nanoTime() - startTime) / 1_000_000 // ms
            kotlinx.coroutines.delay(16) // ~60fps
        }
    }

    // Star field (static, generated once)
    val stars = remember {
        List(STAR_COUNT) {
            Offset(
                (Math.random() * 1f).toFloat(),
                (Math.random() * 1f).toFloat(),
            ) to ((Math.random() * 2 + 1).toFloat()) // size
        }
    }

    // Text measurer for drawing text on canvas
    val textMeasurer = rememberTextMeasurer()

    // Precompute node positions for tap detection
    val nodePositions = remember(nodes, time, cameraOffset, cameraScale) {
        mutableMapOf<CosmosNode, Offset>()
    }

    val seasonalKey = remember { seasonalDirectionKey() }

    Box(modifier = Modifier.fillMaxSize()) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .background(CosmosColors.Background)
                .pointerInput(Unit) {
                    detectTransformGestures { _, pan, zoom, _ ->
                        cameraOffset += pan
                        cameraScale = (cameraScale * zoom).coerceIn(0.3f, 4f)
                    }
                }
                .pointerInput(nodes) {
                    detectTapGestures { tapOffset ->
                        // Hit test directions first
                        val w = size.width.toFloat()
                        val h = size.height.toFloat()
                        val dirs = if (activeDirection == null) DIRECTIONS else emptyList()
                        for (dir in dirs) {
                            val dx = (dir.cx * w + cameraOffset.x) * cameraScale - tapOffset.x + w * (1 - cameraScale) / 2
                            val dy = (dir.cy * h + cameraOffset.y) * cameraScale - tapOffset.y + h * (1 - cameraScale) / 2
                            // Bigger hit target for directions
                            if (abs(dx) < 60 * cameraScale && abs(dy) < 40 * cameraScale) {
                                // Actually compute proper transformed position
                            }
                        }

                        // Hit test nodes
                        var closest: CosmosNode? = null
                        var closestDist = Float.MAX_VALUE
                        for ((node, pos) in nodePositions) {
                            val dist = (pos - tapOffset).getDistance()
                            val threshold = if (cameraScale > 1f) 30f else 20f
                            if (dist < threshold && dist < closestDist) {
                                closest = node
                                closestDist = dist
                            }
                        }
                        if (closest != null) {
                            onNodeClick(closest)
                        }
                    }
                },
        ) {
            val w = size.width
            val h = size.height
            val dt = time.toFloat()

            // Apply camera transform
            withTransform({
                translate(w * (1 - cameraScale) / 2, h * (1 - cameraScale) / 2)
                scale(cameraScale, cameraScale, Offset(w / 2, h / 2))
                translate(cameraOffset.x, cameraOffset.y)
            }) {
                // Draw star field
                for ((starPos, starSize) in stars) {
                    val twinkle = (sin(dt * 0.001f + starPos.x * 100) * 0.3f + 0.3f).coerceIn(0.1f, 0.6f)
                    drawCircle(
                        color = CosmosColors.Star.copy(alpha = twinkle),
                        radius = starSize,
                        center = Offset(starPos.x * w, starPos.y * h),
                    )
                }

                // Draw direction labels (only in overview)
                if (activeDirection == null) {
                    for (dir in DIRECTIONS) {
                        val cx = dir.cx * w
                        val cy = dir.cy * h
                        val isSeasonal = dir.key == seasonalKey
                        val alpha = if (isSeasonal) 1f else 0.6f

                        // Direction label
                        val labelResult = textMeasurer.measure(
                            AnnotatedString(dir.lakota),
                            style = TextStyle(
                                color = dir.color.copy(alpha = alpha),
                                fontSize = (14 / cameraScale).coerceIn(10f, 20f).sp,
                                letterSpacing = 1.sp,
                            ),
                        )
                        drawText(
                            textLayoutResult = labelResult,
                            topLeft = Offset(cx - labelResult.size.width / 2, cy - labelResult.size.height / 2),
                        )

                        // Subtitle
                        val subResult = textMeasurer.measure(
                            AnnotatedString(dir.english.lowercase()),
                            style = TextStyle(
                                color = CosmosColors.InkDim.copy(alpha = alpha * 0.5f),
                                fontSize = (9 / cameraScale).coerceIn(7f, 12f).sp,
                            ),
                        )
                        drawText(
                            textLayoutResult = subResult,
                            topLeft = Offset(cx - subResult.size.width / 2, cy + labelResult.size.height / 2 + 4),
                        )
                    }
                }

                // Draw nodes
                nodePositions.clear()
                for (node in nodes) {
                    val o = node.orbit
                    val a = o.angle + o.speed * (if (o.clockwise) 1 else -1) * dt

                    val cosT = cos(o.tilt * PI.toFloat() / 180f)
                    val sinT = sin(o.tilt * PI.toFloat() / 180f)
                    val cosA = cos(a)
                    val sinA = sin(a)

                    val x = (o.cx + o.rx * cosA * cosT - o.ry * sinA * sinT) * w
                    val y = (o.cy + o.rx * cosA * sinT + o.ry * sinA * cosT) * h

                    // Depth opacity
                    val dist = sqrt((x / w - 0.5f).pow(2) + (y / h - 0.5f).pow(2))
                    val depth = (BASE_OPACITY + (1 - dist / 0.5f) * 0.06f).coerceIn(0.05f, 0.4f)

                    val color = nodeColor(node.type)

                    // Store screen position for hit testing
                    val screenX = (x + cameraOffset.x) * cameraScale + w * (1 - cameraScale) / 2
                    val screenY = (y + cameraOffset.y) * cameraScale + h * (1 - cameraScale) / 2
                    nodePositions[node] = Offset(screenX, screenY)

                    // LOD rendering
                    if (cameraScale < 0.6f) {
                        // Dots only
                        drawCircle(color = color.copy(alpha = depth), radius = 2f, center = Offset(x, y))
                    } else if (cameraScale < 1.2f) {
                        // Dots + labels for non-words
                        drawCircle(color = color.copy(alpha = depth), radius = 3f, center = Offset(x, y))
                        if (node.type != "word") {
                            val result = textMeasurer.measure(
                                AnnotatedString(node.lakota.take(20)),
                                style = TextStyle(color = color.copy(alpha = depth), fontSize = 9.sp),
                            )
                            drawText(result, topLeft = Offset(x + 5, y - result.size.height / 2))
                        }
                    } else {
                        // Full labels
                        drawCircle(color = color.copy(alpha = depth * 1.5f), radius = 4f, center = Offset(x, y))
                        val labelText = node.lakota.take(25)
                        val result = textMeasurer.measure(
                            AnnotatedString(labelText),
                            style = TextStyle(color = color.copy(alpha = (depth * 2).coerceAtMost(0.9f)), fontSize = 11.sp),
                        )
                        drawText(result, topLeft = Offset(x + 6, y - result.size.height / 2))

                        // Show English at higher zoom
                        if (cameraScale > 2f) {
                            val engResult = textMeasurer.measure(
                                AnnotatedString(node.english.take(30)),
                                style = TextStyle(color = CosmosColors.InkDim.copy(alpha = depth), fontSize = 8.sp),
                            )
                            drawText(engResult, topLeft = Offset(x + 6, y + result.size.height / 2))
                        }
                    }
                }
            }
        }

        // Direction tap targets (transparent overlay buttons — more reliable than canvas hit test)
        if (activeDirection == null) {
            for (dir in DIRECTIONS) {
                DirectionTapTarget(
                    direction = dir,
                    cameraOffset = cameraOffset,
                    cameraScale = cameraScale,
                    onClick = { onDirectionClick(dir) },
                )
            }
        }
    }
}

@Composable
private fun DirectionTapTarget(
    direction: Direction,
    cameraOffset: Offset,
    cameraScale: Float,
    onClick: () -> Unit,
) {
    val density = LocalDensity.current
    androidx.compose.foundation.layout.BoxWithConstraints(modifier = Modifier.fillMaxSize()) {
        val w = constraints.maxWidth.toFloat()
        val h = constraints.maxHeight.toFloat()

        val x = ((direction.cx * w + cameraOffset.x) * cameraScale + w * (1 - cameraScale) / 2)
        val y = ((direction.cy * h + cameraOffset.y) * cameraScale + h * (1 - cameraScale) / 2)

        Box(
            modifier = Modifier
                .offset { IntOffset((x - 50 * density.density).toInt(), (y - 30 * density.density).toInt()) }
                .clip(RoundedCornerShape(12.dp))
                .pointerInput(Unit) { detectTapGestures { onClick() } }
                .padding(12.dp)
                .requiredSize(width = 100.dp, height = 60.dp),
        )
    }
}
