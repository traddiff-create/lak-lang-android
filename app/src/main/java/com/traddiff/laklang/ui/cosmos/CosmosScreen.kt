package com.traddiff.laklang.ui.cosmos

import android.graphics.BitmapFactory
import androidx.compose.animation.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.traddiff.laklang.viewmodel.CosmosViewModel

@Composable
fun CosmosScreen(
    onWordClick: (String) -> Unit = {},
    onStoryClick: (String) -> Unit = {},
    onDirectionClick: (String) -> Unit = {},
    viewModel: CosmosViewModel = viewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CosmosColors.Background),
    ) {
        if (state.loading) {
            Text(
                text = "loading the cosmos...",
                color = CosmosColors.InkDim,
                fontSize = 12.sp,
                letterSpacing = 1.5.sp,
                modifier = Modifier.align(Alignment.Center),
            )
        } else {
            CosmosCanvas(
                nodes = state.nodes,
                activeDirection = state.activeDirection,
                onDirectionClick = { onDirectionClick(it.key) },
                onNodeClick = { viewModel.selectNode(it) },
            )
        }

        // Direction back button
        if (state.activeDirection != null) {
            Text(
                text = "< overview",
                color = CosmosColors.InkDim,
                fontSize = 12.sp,
                modifier = Modifier
                    .align(Alignment.TopStart)
                    .padding(16.dp)
                    .clickable { viewModel.selectDirection(null) },
            )
        }

        // Node count
        if (!state.loading) {
            Text(
                text = "${state.nodes.size} items",
                color = CosmosColors.Ghost,
                fontSize = 10.sp,
                letterSpacing = 1.sp,
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 8.dp),
            )
        }

        // Overlay for selected node
        state.selectedNode?.let { node ->
            CosmosOverlay(
                node = node,
                connectedNodes = state.connectedNodes,
                onDismiss = { viewModel.selectNode(null) },
                onNodeClick = { connected ->
                    when (connected.type) {
                        "word" -> { viewModel.selectNode(null); onWordClick(connected.id) }
                        "story" -> { viewModel.selectNode(null); onStoryClick(connected.id) }
                        else -> viewModel.selectNode(connected)
                    }
                },
            )
        }
    }
}

@Composable
private fun CosmosOverlay(
    node: CosmosNode,
    connectedNodes: List<CosmosNode>,
    onDismiss: () -> Unit,
    onNodeClick: (CosmosNode) -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(CosmosColors.BackgroundDeep.copy(alpha = 0.92f))
            .clickable(onClick = onDismiss),
        contentAlignment = Alignment.Center,
    ) {
        Column(
            modifier = Modifier
                .widthIn(max = 340.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(CosmosColors.Background)
                .clickable(enabled = false, onClick = {}) // block dismiss
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            // Type badge
            Text(
                text = node.type.uppercase(),
                color = nodeColor(node.type),
                fontSize = 10.sp,
                letterSpacing = 2.sp,
                fontWeight = FontWeight.Medium,
            )

            // Person portrait from LOC public domain photos
            node.imageAsset?.let { assetPath ->
                Spacer(Modifier.height(12.dp))
                val context = LocalContext.current
                val bitmap = remember(assetPath) {
                    try {
                        context.assets.open(assetPath).use { BitmapFactory.decodeStream(it) }
                    } catch (_: Exception) { null }
                }
                bitmap?.let {
                    Image(
                        bitmap = it.asImageBitmap(),
                        contentDescription = "${node.english} portrait",
                        modifier = Modifier
                            .size(96.dp)
                            .clip(CircleShape),
                        contentScale = ContentScale.Crop,
                    )
                }
            }

            Spacer(Modifier.height(12.dp))

            // Lakota text
            Text(
                text = node.lakota,
                color = CosmosColors.Ink,
                fontSize = 24.sp,
                fontWeight = FontWeight.Light,
                textAlign = TextAlign.Center,
            )

            Spacer(Modifier.height(6.dp))

            // English text
            Text(
                text = node.english,
                color = CosmosColors.InkDim,
                fontSize = 14.sp,
                textAlign = TextAlign.Center,
            )

            // Connected nodes
            if (connectedNodes.isNotEmpty()) {
                Spacer(Modifier.height(20.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(1.dp)
                        .background(CosmosColors.Ghost),
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    text = "CONNECTED (${connectedNodes.size})",
                    color = CosmosColors.Ghost,
                    fontSize = 9.sp,
                    letterSpacing = 1.5.sp,
                )
                Spacer(Modifier.height(8.dp))

                // Chips
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                ) {
                    connectedNodes.take(12).forEach { connected ->
                        Text(
                            text = connected.lakota.ifEmpty { connected.english },
                            color = nodeColor(connected.type),
                            fontSize = 12.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier
                                .padding(3.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(CosmosColors.Ghost)
                                .clickable { onNodeClick(connected) }
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun FlowRow(
    modifier: Modifier = Modifier,
    horizontalArrangement: Arrangement.Horizontal = Arrangement.Start,
    content: @Composable () -> Unit,
) {
    androidx.compose.foundation.layout.FlowRow(
        modifier = modifier,
        horizontalArrangement = horizontalArrangement,
        content = { content() },
    )
}
