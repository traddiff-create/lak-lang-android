package com.traddiff.laklang.ui.stories

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.traddiff.laklang.ui.components.AssetAudioPlayer
import com.traddiff.laklang.viewmodel.StoriesViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StoryDetailScreen(
    storyId: String,
    onBack: () -> Unit,
    onWordClick: (String) -> Unit,
    viewModel: StoriesViewModel = viewModel(),
) {
    val state by viewModel.storyDetail.collectAsStateWithLifecycle()

    LaunchedEffect(storyId) {
        viewModel.loadStoryDetail(storyId)
    }

    val story = state.story

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(story?.titleEnglish ?: "") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        if (story == null) {
            Box(modifier = Modifier.fillMaxSize().padding(padding))
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                Text(
                    text = story.titleLakota,
                    style = MaterialTheme.typography.headlineSmall,
                    fontStyle = FontStyle.Italic,
                    color = MaterialTheme.colorScheme.primary,
                )
                Text(
                    text = story.titleEnglish,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                )
            }

            // Audio player — shown when story has an audio asset
            story.audioUrl?.let { audioPath ->
                if (audioPath.startsWith("audio/")) {
                    item {
                        AssetAudioPlayer(
                            assetPath = audioPath,
                            label = "Lakota Song Chants",
                        )
                    }
                }
            }

            // Values this story teaches
            if (state.connectedValues.isNotEmpty()) {
                item {
                    Text(
                        text = "This story teaches:",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    state.connectedValues.forEach { value ->
                        Card(
                            modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.tertiaryContainer,
                            ),
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Text(
                                    text = "${value.lakota} — ${value.english}",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onTertiaryContainer,
                                )
                                value.description?.let { desc ->
                                    Text(
                                        text = desc,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onTertiaryContainer,
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Persons featured
            if (state.connectedPersons.isNotEmpty()) {
                item {
                    Text(
                        text = "People in this story:",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    state.connectedPersons.forEach { person ->
                        ListItem(
                            headlineContent = { Text(person.englishName) },
                            supportingContent = {
                                Text("${person.lakotaName}${person.role?.let { " — $it" } ?: ""}")
                            },
                        )
                    }
                }
            }

            // Story body
            item {
                HorizontalDivider()
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = story.body,
                    style = MaterialTheme.typography.bodyLarge,
                    lineHeight = MaterialTheme.typography.bodyLarge.lineHeight * 1.4,
                )
            }

            // Source
            story.source?.let { src ->
                item {
                    Text(
                        text = "Source: $src",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}
