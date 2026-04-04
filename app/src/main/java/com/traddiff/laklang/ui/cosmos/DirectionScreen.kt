package com.traddiff.laklang.ui.cosmos

import android.app.Application
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.traddiff.laklang.LakLangApp
import com.traddiff.laklang.data.entity.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

// Unified content item for display
data class DirectionItem(
    val id: String,
    val type: String,
    val primaryText: String,
    val secondaryText: String?,
    val badge: String? = null,
)

data class DirectionDetailState(
    val info: DirectionInfo? = null,
    val items: List<DirectionItem> = emptyList(),
    val loading: Boolean = true,
    val direction: Direction? = null,
)

class DirectionViewModel(application: Application) : AndroidViewModel(application) {

    private val db = (application as LakLangApp).database

    private val _state = MutableStateFlow(DirectionDetailState())
    val state: StateFlow<DirectionDetailState> = _state.asStateFlow()

    fun load(directionKey: String) {
        val info = DIRECTION_INFO[directionKey] ?: return
        val dir = DIRECTIONS.find { it.key == directionKey } ?: return
        _state.value = DirectionDetailState(info = info, direction = dir, loading = true)

        viewModelScope.launch {
            val items = when (directionKey) {
                "west" -> loadStories()
                "north" -> loadValues()
                "east" -> loadVocabulary()
                "south" -> loadPeopleAndDialogues()
                "sky" -> loadSacred()
                "earth" -> loadNature()
                "center" -> loadCenter()
                else -> emptyList()
            }
            _state.value = _state.value.copy(items = items, loading = false)
        }
    }

    private suspend fun loadStories(): List<DirectionItem> {
        return db.storyDao().getAllApprovedList().map { s ->
            DirectionItem(s.id, "story", s.titleEnglish, s.titleLakota, s.category)
        }
    }

    private suspend fun loadValues(): List<DirectionItem> {
        return db.graphDao().getAllValues().map { v ->
            DirectionItem(v.id, "value", v.lakota, v.english)
        }
    }

    private suspend fun loadVocabulary(): List<DirectionItem> {
        // Show a sample — not all 12,535
        return db.vocabularyDao().getAllApprovedList().take(200).map { w ->
            DirectionItem(w.id, "word", w.lakota, w.english, w.category)
        }
    }

    private suspend fun loadPeopleAndDialogues(): List<DirectionItem> {
        val persons = db.graphDao().getAllPersons().map { p ->
            DirectionItem(p.id, "person", p.englishName, p.lakotaName, p.role)
        }
        val dialogues = db.learnDao().getDialogues().first().map { d ->
            DirectionItem(d.id, "dialogue", d.title, d.englishTranslation.take(80), d.type)
        }
        return persons + dialogues
    }

    private suspend fun loadSacred(): List<DirectionItem> {
        // Sacred vocabulary + cultural modules about ceremonies
        val sacredWords = db.vocabularyDao().getByCategory("sacred").first().map { w ->
            DirectionItem(w.id, "word", w.lakota, w.english, "sacred")
        }
        val modules = db.learnDao().getCulturalModules().first()
            .filter { it.category?.contains("worldview", ignoreCase = true) == true ||
                it.title.contains("sacred", ignoreCase = true) }
            .map { m ->
                DirectionItem(m.id, "cultural_module", m.title, m.category)
            }
        return sacredWords + modules
    }

    private suspend fun loadNature(): List<DirectionItem> {
        val natureCategories = listOf("nature", "animals", "geography", "astronomy")
        val words = mutableListOf<DirectionItem>()
        for (cat in natureCategories) {
            db.vocabularyDao().getByCategory(cat).first().forEach { w ->
                words.add(DirectionItem(w.id, "word", w.lakota, w.english, cat))
            }
        }
        return words
    }

    private suspend fun loadCenter(): List<DirectionItem> {
        val modules = db.learnDao().getCulturalModules().first().map { m ->
            DirectionItem(m.id, "cultural_module", m.title, m.category)
        }
        val bookmarks = db.bookmarkDao().getAll().first().map { b ->
            DirectionItem(b.itemId, b.itemType, "Saved: ${b.itemType}", b.itemId.take(8))
        }
        return modules + bookmarks
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DirectionScreen(
    directionKey: String,
    onBack: () -> Unit,
    onWordClick: (String) -> Unit,
    onStoryClick: (String) -> Unit,
    onModuleClick: (String) -> Unit,
    viewModel: DirectionViewModel = viewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    LaunchedEffect(directionKey) {
        viewModel.load(directionKey)
    }

    val info = state.info
    val dir = state.direction
    val accentColor = dir?.color ?: CosmosColors.Ink

    Scaffold(
        containerColor = CosmosColors.Background,
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = CosmosColors.InkDim,
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent,
                ),
            )
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(bottom = 32.dp),
        ) {
            // Direction header
            if (info != null) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(
                            text = info.lakota,
                            color = accentColor,
                            fontSize = 32.sp,
                            fontWeight = FontWeight.Light,
                            letterSpacing = 2.sp,
                            textAlign = TextAlign.Center,
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = info.english,
                            color = CosmosColors.InkDim,
                            fontSize = 14.sp,
                            letterSpacing = 1.sp,
                            textAlign = TextAlign.Center,
                        )
                        Spacer(Modifier.height(20.dp))
                        Text(
                            text = info.description,
                            color = CosmosColors.Ink,
                            fontSize = 15.sp,
                            lineHeight = 24.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.widthIn(max = 320.dp),
                        )
                    }
                }

                // Divider with content count
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Box(
                            modifier = Modifier.weight(1f).height(1.dp)
                                .background(CosmosColors.Ghost),
                        )
                        Text(
                            text = if (state.loading) "loading..."
                            else " ${state.items.size} ${info.contentLabel} ",
                            color = accentColor,
                            fontSize = 11.sp,
                            letterSpacing = 1.sp,
                            modifier = Modifier.padding(horizontal = 12.dp),
                        )
                        Box(
                            modifier = Modifier.weight(1f).height(1.dp)
                                .background(CosmosColors.Ghost),
                        )
                    }
                }
            }

            // Loading
            if (state.loading) {
                item {
                    Box(
                        modifier = Modifier.fillMaxWidth().padding(32.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator(
                            color = accentColor,
                            modifier = Modifier.size(24.dp),
                            strokeWidth = 2.dp,
                        )
                    }
                }
            }

            // Content items
            items(state.items, key = { "${it.type}_${it.id}" }) { item ->
                DirectionContentCard(
                    item = item,
                    accentColor = accentColor,
                    onClick = {
                        when (item.type) {
                            "word" -> onWordClick(item.id)
                            "story" -> onStoryClick(item.id)
                            "cultural_module" -> onModuleClick(item.id)
                            else -> {}
                        }
                    },
                )
            }
        }
    }
}

@Composable
private fun DirectionContentCard(
    item: DirectionItem,
    accentColor: Color,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 24.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Accent dot
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(accentColor.copy(alpha = 0.6f)),
        )

        Spacer(Modifier.width(14.dp))

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.primaryText,
                color = CosmosColors.Ink,
                fontSize = 15.sp,
                fontWeight = FontWeight.Normal,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            item.secondaryText?.let { secondary ->
                Text(
                    text = secondary,
                    color = CosmosColors.InkDim,
                    fontSize = 12.sp,
                    fontStyle = FontStyle.Italic,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }

        item.badge?.let { badge ->
            Text(
                text = badge,
                color = accentColor.copy(alpha = 0.5f),
                fontSize = 10.sp,
                letterSpacing = 0.5.sp,
            )
        }
    }
}
