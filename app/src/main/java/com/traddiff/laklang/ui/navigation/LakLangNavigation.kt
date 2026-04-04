package com.traddiff.laklang.ui.navigation

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.traddiff.laklang.data.entity.SearchResult
import com.traddiff.laklang.ui.detail.WordDetailScreen
import com.traddiff.laklang.ui.explore.ExploreScreen
import com.traddiff.laklang.ui.learn.CulturalModuleDetailScreen
import com.traddiff.laklang.ui.learn.LearnScreen
import com.traddiff.laklang.ui.saved.SavedScreen
import com.traddiff.laklang.ui.search.SpotlightOverlay
import com.traddiff.laklang.ui.stories.StoryDetailScreen
import com.traddiff.laklang.ui.stories.StoriesScreen
import com.traddiff.laklang.ui.cosmos.CosmosScreen
import com.traddiff.laklang.ui.cosmos.DirectionScreen

sealed class Screen(val route: String, val label: String, val icon: ImageVector) {
    data object Explore : Screen("explore", "Explore", Icons.Filled.Home)
    data object Stories : Screen("stories", "Stories", Icons.AutoMirrored.Filled.MenuBook)
    data object Learn : Screen("learn", "Learn", Icons.Filled.School)
    data object Saved : Screen("saved", "Saved", Icons.Filled.Bookmark)
    data object Cosmos : Screen("cosmos", "Cosmos", Icons.Filled.Star)
}

private val bottomTabs = listOf(Screen.Explore, Screen.Stories, Screen.Learn, Screen.Saved, Screen.Cosmos)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LakLangNavigation() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    val showBottomBar = currentDestination?.route in bottomTabs.map { it.route }
    var showSpotlight by remember { mutableStateOf(false) }

    // Handle back press when Spotlight is open
    BackHandler(enabled = showSpotlight) {
        showSpotlight = false
    }

    fun handleSearchResult(result: SearchResult) {
        when (result.type) {
            "word" -> navController.navigate("word/${result.id}")
            "story" -> navController.navigate("story/${result.id}")
            "cultural_module" -> navController.navigate("module/${result.id}")
            else -> {} // Values, persons, dialogues — detail screens can be added later
        }
    }

    Box {
        Scaffold(
            topBar = {
                if (showBottomBar) {
                    TopAppBar(
                        title = {
                            Text(
                                text = "LakLang",
                                style = MaterialTheme.typography.titleLarge,
                            )
                        },
                        actions = {
                            IconButton(onClick = { showSpotlight = true }) {
                                Icon(
                                    Icons.Filled.Search,
                                    contentDescription = "Search everything",
                                )
                            }
                        },
                    )
                }
            },
            bottomBar = {
                if (showBottomBar) {
                    NavigationBar {
                        bottomTabs.forEach { screen ->
                            NavigationBarItem(
                                icon = { Icon(screen.icon, contentDescription = screen.label) },
                                label = { Text(screen.label) },
                                selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                                onClick = {
                                    navController.navigate(screen.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                },
                            )
                        }
                    }
                }
            },
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = Screen.Explore.route,
                modifier = Modifier.padding(innerPadding),
            ) {
                composable(Screen.Explore.route) {
                    ExploreScreen(
                        onWordClick = { wordId -> navController.navigate("word/$wordId") },
                    )
                }
                composable(Screen.Stories.route) {
                    StoriesScreen(
                        onStoryClick = { storyId -> navController.navigate("story/$storyId") },
                    )
                }
                composable(Screen.Learn.route) {
                    LearnScreen(
                        onModuleClick = { moduleId -> navController.navigate("module/$moduleId") },
                    )
                }
                composable(Screen.Saved.route) {
                    SavedScreen(
                        onWordClick = { wordId -> navController.navigate("word/$wordId") },
                        onStoryClick = { storyId -> navController.navigate("story/$storyId") },
                        onModuleClick = { moduleId -> navController.navigate("module/$moduleId") },
                    )
                }
                composable(Screen.Cosmos.route) {
                    CosmosScreen(
                        onWordClick = { wordId -> navController.navigate("word/$wordId") },
                        onStoryClick = { storyId -> navController.navigate("story/$storyId") },
                        onDirectionClick = { key -> navController.navigate("cosmos/$key") },
                    )
                }
                composable(
                    route = "cosmos/{directionKey}",
                    arguments = listOf(navArgument("directionKey") { type = NavType.StringType }),
                ) { backStackEntry ->
                    val dirKey = backStackEntry.arguments?.getString("directionKey") ?: return@composable
                    DirectionScreen(
                        directionKey = dirKey,
                        onBack = { navController.popBackStack() },
                        onWordClick = { id -> navController.navigate("word/$id") },
                        onStoryClick = { id -> navController.navigate("story/$id") },
                        onModuleClick = { id -> navController.navigate("module/$id") },
                    )
                }

                // Detail screens
                composable(
                    route = "word/{wordId}",
                    arguments = listOf(navArgument("wordId") { type = NavType.StringType }),
                ) { backStackEntry ->
                    val wordId = backStackEntry.arguments?.getString("wordId") ?: return@composable
                    WordDetailScreen(
                        wordId = wordId,
                        onBack = { navController.popBackStack() },
                        onWordClick = { id -> navController.navigate("word/$id") },
                        onStoryClick = { id -> navController.navigate("story/$id") },
                    )
                }
                composable(
                    route = "story/{storyId}",
                    arguments = listOf(navArgument("storyId") { type = NavType.StringType }),
                ) { backStackEntry ->
                    val storyId = backStackEntry.arguments?.getString("storyId") ?: return@composable
                    StoryDetailScreen(
                        storyId = storyId,
                        onBack = { navController.popBackStack() },
                        onWordClick = { id -> navController.navigate("word/$id") },
                    )
                }
                composable(
                    route = "module/{moduleId}",
                    arguments = listOf(navArgument("moduleId") { type = NavType.StringType }),
                ) { backStackEntry ->
                    val moduleId = backStackEntry.arguments?.getString("moduleId") ?: return@composable
                    CulturalModuleDetailScreen(
                        moduleId = moduleId,
                        onBack = { navController.popBackStack() },
                    )
                }
            }
        }

        // Spotlight overlay — renders on top of everything
        SpotlightOverlay(
            visible = showSpotlight,
            onDismiss = { showSpotlight = false },
            onResultClick = { result -> handleSearchResult(result) },
        )
    }
}
