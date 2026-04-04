package com.traddiff.laklang.ui.search

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.traddiff.laklang.data.entity.SearchResult
import com.traddiff.laklang.viewmodel.SpotlightViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpotlightOverlay(
    visible: Boolean,
    onDismiss: () -> Unit,
    onResultClick: (SearchResult) -> Unit,
    viewModel: SpotlightViewModel = viewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val focusRequester = remember { FocusRequester() }

    // Auto-focus search field when overlay appears
    LaunchedEffect(visible) {
        if (visible) {
            viewModel.clear()
            focusRequester.requestFocus()
        }
    }

    AnimatedVisibility(
        visible = visible,
        enter = fadeIn() + slideInVertically { -it / 4 },
        exit = fadeOut() + slideOutVertically { -it / 4 },
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background),
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Search bar
                OutlinedTextField(
                    value = state.query,
                    onValueChange = { viewModel.updateQuery(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                        .focusRequester(focusRequester),
                    placeholder = { Text("Search Lakota or English...") },
                    leadingIcon = {
                        Icon(
                            Icons.Filled.Search,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                        )
                    },
                    trailingIcon = {
                        IconButton(onClick = {
                            viewModel.clear()
                            onDismiss()
                        }) {
                            Icon(Icons.Filled.Close, contentDescription = "Close")
                        }
                    },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                    ),
                )

                // Result count
                if (state.query.isNotBlank() && !state.isSearching) {
                    Text(
                        text = "${state.totalResults} results",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(horizontal = 16.dp),
                    )
                }

                // Loading indicator
                if (state.isSearching) {
                    LinearProgressIndicator(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
                    )
                }

                // Grouped results
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 32.dp),
                ) {
                    state.results.forEach { (sectionTitle, results) ->
                        // Section header
                        item(key = "header_$sectionTitle") {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                Icon(
                                    imageVector = iconForSection(sectionTitle),
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp),
                                )
                                Text(
                                    text = sectionTitle,
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary,
                                )
                                Text(
                                    text = "(${results.size})",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                        }

                        // Results in section
                        items(results, key = { "${it.type}_${it.id}" }) { result ->
                            SpotlightResultItem(
                                result = result,
                                onClick = {
                                    onResultClick(result)
                                    viewModel.clear()
                                    onDismiss()
                                },
                            )
                        }
                    }

                    // Empty state
                    if (state.query.isNotBlank() && state.results.isEmpty() && !state.isSearching) {
                        item {
                            Box(
                                modifier = Modifier.fillMaxWidth().padding(32.dp),
                                contentAlignment = Alignment.Center,
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(
                                        Icons.Filled.SearchOff,
                                        contentDescription = null,
                                        modifier = Modifier.size(48.dp),
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = "No results for \"${state.query}\"",
                                        style = MaterialTheme.typography.bodyLarge,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                }
                            }
                        }
                    }

                    // Prompt when empty
                    if (state.query.isBlank()) {
                        item {
                            Column(
                                modifier = Modifier.fillMaxWidth().padding(32.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                            ) {
                                Text(
                                    text = "Search everything",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Words, stories, culture, values, people, dialogues",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.outline,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SpotlightResultItem(result: SearchResult, onClick: () -> Unit) {
    ListItem(
        headlineContent = {
            Text(
                text = result.primaryText,
                fontWeight = FontWeight.Medium,
            )
        },
        supportingContent = result.secondaryText?.let { secondary ->
            {
                Text(
                    text = secondary,
                    fontStyle = if (result.type == "word") FontStyle.Normal else FontStyle.Italic,
                    maxLines = 1,
                )
            }
        },
        leadingContent = {
            Icon(
                imageVector = iconForType(result.type),
                contentDescription = result.type,
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(24.dp),
            )
        },
        modifier = Modifier.clickable(onClick = onClick),
    )
}

private fun iconForSection(section: String): ImageVector = when (section) {
    "Words" -> Icons.Filled.Translate
    "Stories" -> Icons.Filled.AutoStories
    "Culture" -> Icons.Filled.Article
    "Values" -> Icons.Filled.Favorite
    "People" -> Icons.Filled.Person
    "Dialogues" -> Icons.Filled.Forum
    else -> Icons.Filled.Search
}

private fun iconForType(type: String): ImageVector = when (type) {
    "word" -> Icons.Filled.Translate
    "story" -> Icons.Filled.AutoStories
    "cultural_module" -> Icons.Filled.Article
    "value" -> Icons.Filled.Favorite
    "person" -> Icons.Filled.Person
    "dialogue" -> Icons.Filled.Forum
    else -> Icons.Filled.Search
}
