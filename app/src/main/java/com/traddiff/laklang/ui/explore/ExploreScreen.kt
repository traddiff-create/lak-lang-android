package com.traddiff.laklang.ui.explore

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.traddiff.laklang.data.entity.VocabularyItem
import com.traddiff.laklang.viewmodel.ExploreViewModel

@Composable
fun ExploreScreen(
    onWordClick: (String) -> Unit,
    viewModel: ExploreViewModel = viewModel(),
) {
    val selectedCategory by viewModel.selectedCategory.collectAsStateWithLifecycle()
    val categories by viewModel.categories.collectAsStateWithLifecycle()
    val words by viewModel.words.collectAsStateWithLifecycle()
    val wordOfTheDay by viewModel.wordOfTheDay.collectAsStateWithLifecycle()
    val totalWords by viewModel.totalWords.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(bottom = 16.dp),
    ) {
        // Stats
        item {
            Text(
                text = "$totalWords Lakota words to explore",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            )
        }

        // Word of the Day
        if (wordOfTheDay != null) {
            item {
                WordOfTheDayCard(
                    word = wordOfTheDay!!,
                    onClick = { onWordClick(wordOfTheDay!!.id) },
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                )
            }
        }

        // Category chips
        item {
            Row(
                modifier = Modifier
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                FilterChip(
                    selected = selectedCategory == null,
                    onClick = { viewModel.selectCategory(null) },
                    label = { Text("All") },
                )
                categories.forEach { category ->
                    FilterChip(
                        selected = selectedCategory == category,
                        onClick = { viewModel.selectCategory(category) },
                        label = { Text(category.replaceFirstChar { it.uppercase() }) },
                    )
                }
            }
        }

        // Word list
        items(words, key = { it.id }) { word ->
            WordListItem(word = word, onClick = { onWordClick(word.id) })
        }
    }
}

@Composable
private fun WordOfTheDayCard(
    word: VocabularyItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer,
        ),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "Word of the Day",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f),
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = word.lakota,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
            )
            if (word.phoneticGuide != null) {
                Text(
                    text = word.phoneticGuide,
                    style = MaterialTheme.typography.bodyMedium,
                    fontStyle = FontStyle.Italic,
                    color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f),
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = word.english,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
            )
        }
    }
}

@Composable
private fun WordListItem(word: VocabularyItem, onClick: () -> Unit) {
    ListItem(
        headlineContent = { Text(word.lakota) },
        supportingContent = { Text(word.english) },
        trailingContent = {
            word.category?.let { cat ->
                SuggestionChip(
                    onClick = {},
                    label = {
                        Text(
                            text = cat.replaceFirstChar { it.uppercase() },
                            style = MaterialTheme.typography.labelSmall,
                        )
                    },
                )
            }
        },
        modifier = Modifier.clickable(onClick = onClick),
    )
}
