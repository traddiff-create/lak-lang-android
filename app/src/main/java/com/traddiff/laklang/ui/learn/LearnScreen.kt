package com.traddiff.laklang.ui.learn

import android.app.Application
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.CulturalModule
import com.traddiff.laklang.data.entity.DialogueExample
import com.traddiff.laklang.data.entity.PronunciationGuide
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn

class LearnViewModel(application: Application) : AndroidViewModel(application) {
    private val learnDao = (application as LakLangApp).database.learnDao()

    val pronunciationGuides: StateFlow<List<PronunciationGuide>> =
        learnDao.getPronunciationGuides()
            .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    val culturalModules: StateFlow<List<CulturalModule>> =
        learnDao.getCulturalModules()
            .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())

    val dialogues: StateFlow<List<DialogueExample>> =
        learnDao.getDialogues()
            .stateIn(viewModelScope, SharingStarted.Lazily, emptyList())
}

@Composable
fun LearnScreen(
    onModuleClick: (String) -> Unit,
    viewModel: LearnViewModel = viewModel(),
) {
    val guides by viewModel.pronunciationGuides.collectAsStateWithLifecycle()
    val modules by viewModel.culturalModules.collectAsStateWithLifecycle()
    val dialogues by viewModel.dialogues.collectAsStateWithLifecycle()

    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Pronunciation", "Culture", "Dialogues")

    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            text = "Learn",
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(16.dp),
        )

        TabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) },
                )
            }
        }

        when (selectedTab) {
            0 -> PronunciationTab(guides)
            1 -> CultureTab(modules, onModuleClick)
            2 -> DialogueTab(dialogues)
        }
    }
}

@Composable
private fun PronunciationTab(guides: List<PronunciationGuide>) {
    val grouped = guides.groupBy { it.type }

    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        grouped.forEach { (type, typeGuides) ->
            item {
                Text(
                    text = type.replaceFirstChar { it.uppercase() } + "s",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
            items(typeGuides) { guide ->
                Card(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.padding(12.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        Text(
                            text = guide.symbol,
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.width(48.dp),
                        )
                        Column {
                            Text(
                                text = "/${guide.ipa}/",
                                style = MaterialTheme.typography.bodyLarge,
                            )
                            guide.englishApproximation?.let {
                                Text(
                                    text = "Like \"$it\"",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                                )
                            }
                            guide.exampleWord?.let { word ->
                                Text(
                                    text = "$word${guide.exampleMeaning?.let { " ($it)" } ?: ""}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.secondary,
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
private fun CultureTab(modules: List<CulturalModule>, onModuleClick: (String) -> Unit) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        items(modules, key = { it.id }) { module ->
            Card(
                onClick = { onModuleClick(module.id) },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = module.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    module.category?.let { cat ->
                        SuggestionChip(
                            onClick = {},
                            label = { Text(cat.replaceFirstChar { it.uppercase() }) },
                        )
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = module.body.take(150) + "...",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }
        }
    }
}

@Composable
private fun DialogueTab(dialogues: List<DialogueExample>) {
    LazyColumn(
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        items(dialogues, key = { it.id }) { dialogue ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = dialogue.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                    )
                    dialogue.context?.let {
                        Text(
                            text = it,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    HorizontalDivider()
                    Spacer(modifier = Modifier.height(8.dp))
                    // Show the Lakota text
                    Text(
                        text = dialogue.lakotaText
                            .removeSurrounding("[", "]")
                            .take(200),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = dialogue.englishTranslation.take(200),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "${dialogue.numExchanges} exchanges",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.outline,
                    )
                }
            }
        }
    }
}
