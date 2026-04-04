package com.traddiff.laklang.ui.detail

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
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
import com.traddiff.laklang.data.entity.PronunciationGuide
import com.traddiff.laklang.data.entity.Story
import com.traddiff.laklang.data.entity.Value
import com.traddiff.laklang.data.entity.VocabularyItem
import com.traddiff.laklang.viewmodel.WordDetailViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WordDetailScreen(
    wordId: String,
    onBack: () -> Unit,
    onWordClick: (String) -> Unit,
    onStoryClick: (String) -> Unit,
    viewModel: WordDetailViewModel = viewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(wordId) {
        viewModel.loadWord(wordId)
    }

    val word = state.word

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(word?.lakota ?: "") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.toggleBookmark() }) {
                        Icon(
                            imageVector = if (state.isBookmarked) Icons.Filled.Bookmark
                            else Icons.Filled.BookmarkBorder,
                            contentDescription = if (state.isBookmarked) "Remove bookmark" else "Bookmark",
                        )
                    }
                },
            )
        },
    ) { padding ->
        if (word == null) {
            Box(modifier = Modifier.fillMaxSize().padding(padding))
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // Word header
            item {
                Column {
                    Text(
                        text = word.lakota,
                        style = MaterialTheme.typography.displaySmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    if (word.phoneticGuide != null) {
                        Text(
                            text = word.phoneticGuide,
                            style = MaterialTheme.typography.titleMedium,
                            fontStyle = FontStyle.Italic,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    if (word.ipa != null) {
                        Text(
                            text = "/${word.ipa}/",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        word.category?.let { cat ->
                            SuggestionChip(
                                onClick = {},
                                label = { Text(cat.replaceFirstChar { it.uppercase() }) },
                            )
                        }
                        word.partOfSpeech?.let { pos ->
                            SuggestionChip(
                                onClick = {},
                                label = { Text(pos) },
                            )
                        }
                    }
                }
            }

            // English meaning
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant,
                    ),
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = word.english,
                            style = MaterialTheme.typography.titleLarge,
                        )
                    }
                }
            }

            // Cultural context
            if (!word.culturalNote.isNullOrBlank()) {
                item {
                    Column {
                        Text(
                            text = "Cultural Context",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = word.culturalNote,
                            style = MaterialTheme.typography.bodyLarge,
                            color = MaterialTheme.colorScheme.onSurface,
                        )
                    }
                }
            }

            // Related words
            if (state.relatedWords.isNotEmpty()) {
                item {
                    RelatedWordsSection(
                        words = state.relatedWords,
                        onWordClick = onWordClick,
                    )
                }
            }

            // Connected values
            if (state.connectedValues.isNotEmpty()) {
                item {
                    ConnectedValuesSection(values = state.connectedValues)
                }
            }

            // Connected stories
            if (state.connectedStories.isNotEmpty()) {
                item {
                    ConnectedStoriesSection(
                        stories = state.connectedStories,
                        onStoryClick = onStoryClick,
                    )
                }
            }

            // Pronunciation breakdown
            if (state.pronunciationBreakdown.isNotEmpty()) {
                item {
                    PronunciationSection(guides = state.pronunciationBreakdown)
                }
            }

            // Source citation
            if (!word.source.isNullOrBlank()) {
                item {
                    Text(
                        text = "Source: ${word.source}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

@Composable
private fun RelatedWordsSection(words: List<VocabularyItem>, onWordClick: (String) -> Unit) {
    Column {
        Text(
            text = "Related Words",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(8.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(words) { word ->
                Card(
                    onClick = { onWordClick(word.id) },
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.secondaryContainer,
                    ),
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = word.lakota,
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSecondaryContainer,
                        )
                        Text(
                            text = word.english,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ConnectedValuesSection(values: List<Value>) {
    Column {
        Text(
            text = "Connected Values",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(8.dp))
        values.forEach { value ->
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.tertiaryContainer,
                ),
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = value.lakota,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onTertiaryContainer,
                    )
                    Text(
                        text = value.english,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onTertiaryContainer,
                    )
                }
            }
        }
    }
}

@Composable
private fun ConnectedStoriesSection(stories: List<Story>, onStoryClick: (String) -> Unit) {
    Column {
        Text(
            text = "Connected Stories",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(8.dp))
        stories.forEach { story ->
            Card(
                onClick = { onStoryClick(story.id) },
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        text = story.titleEnglish,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        text = story.titleLakota,
                        style = MaterialTheme.typography.bodySmall,
                        fontStyle = FontStyle.Italic,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

@Composable
private fun PronunciationSection(guides: List<PronunciationGuide>) {
    Column {
        Text(
            text = "Pronunciation Breakdown",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
        )
        Spacer(modifier = Modifier.height(8.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surfaceVariant,
            ),
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                guides.forEach { guide ->
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        Text(
                            text = guide.symbol,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.width(40.dp),
                        )
                        Text(
                            text = "/${guide.ipa}/",
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.width(60.dp),
                        )
                        Text(
                            text = guide.englishApproximation?.let { "as in \"$it\"" } ?: "",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
            }
        }
    }
}
