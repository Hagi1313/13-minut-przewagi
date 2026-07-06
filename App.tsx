import { useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { books, categories, userName, type Book } from './src/data/books';

type MainScreen = 'home' | 'search' | 'practice' | 'myList' | 'settings';
type Screen = MainScreen | 'book' | 'category';
type MyListTab = 'continue' | 'favorites' | 'completed';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([
    'jak-zdobyc-przyjaciol',
  ]);

  const openBook = (book: Book) => {
    setSelectedBook(book);
    setSelectedCategory(null);
    setScreen('book');
  };

  const openCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedBook(null);
    setScreen('category');
  };

  const goToMainScreen = (nextScreen: MainScreen) => {
    setSelectedBook(null);
    setSelectedCategory(null);
    setScreen(nextScreen);
  };

  const toggleFavorite = (bookId: string) => {
    setFavoriteIds((currentIds) => {
      if (currentIds.includes(bookId)) {
        return currentIds.filter((id) => id !== bookId);
      }

      return [...currentIds, bookId];
    });
  };

  return (
    <View style={styles.app}>
      <StatusBar style="light" />

      <View style={styles.content}>
        {screen === 'home' && (
          <HomeScreen
            favoriteIds={favoriteIds}
            onOpenBook={openBook}
            onOpenCategory={openCategory}
            onOpenSettings={() => goToMainScreen('settings')}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {screen === 'search' && (
          <SearchScreen
            favoriteIds={favoriteIds}
            onOpenBook={openBook}
            onOpenCategory={openCategory}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {screen === 'practice' && <PracticeScreen onOpenBook={openBook} />}

        {screen === 'myList' && (
          <MyListScreen
            favoriteIds={favoriteIds}
            onOpenBook={openBook}
            onOpenSettings={() => goToMainScreen('settings')}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {screen === 'settings' && (
          <SettingsScreen onBack={() => goToMainScreen('home')} />
        )}

        {screen === 'category' && selectedCategory && (
          <CategoryScreen
            category={selectedCategory}
            favoriteIds={favoriteIds}
            onBack={() => goToMainScreen('search')}
            onOpenBook={openBook}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {screen === 'book' && selectedBook && (
          <BookScreen
            book={selectedBook}
            isFavorite={favoriteIds.includes(selectedBook.id)}
            onBack={() => goToMainScreen('home')}
            onToggleFavorite={() => toggleFavorite(selectedBook.id)}
          />
        )}
      </View>

      <BottomNavigation currentScreen={screen} onNavigate={goToMainScreen} />
    </View>
  );
}

function HomeScreen({
  favoriteIds,
  onOpenBook,
  onOpenCategory,
  onOpenSettings,
  onToggleFavorite,
}: {
  favoriteIds: string[];
  onOpenBook: (book: Book) => void;
  onOpenCategory: (category: string) => void;
  onOpenSettings: () => void;
  onToggleFavorite: (bookId: string) => void;
}) {
  const featuredBook = books.find((book) => book.isFeatured) ?? books[0];
  const continueBooks = books.filter((book) => book.progressPercent);
  const newBooks = books.filter((book) => book.isNew);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Dzień dobry,</Text>
          <Text style={styles.greetingName}>{userName} 👋</Text>
        </View>

        <Pressable style={styles.settingsButton} onPress={onOpenSettings}>
          <Text style={styles.settingsButtonText}>⚙</Text>
        </Pressable>
      </View>

      <View style={styles.featuredCard}>
        <Image
          source={require('./assets/logo-main.png')}
          style={styles.featuredLogo}
          resizeMode="contain"
        />

        <View style={styles.featuredContent}>
          <Text style={styles.badge}>Wybrane dla Ciebie</Text>
          <Text style={styles.featuredTitle}>{featuredBook.title}</Text>
          <Text style={styles.featuredDescription}>
            13 minut książki + praktyczne lekcje z książki.
          </Text>

          <Pressable
            style={styles.smallGoldButton}
            onPress={() => onOpenBook(featuredBook)}
          >
            <Text style={styles.smallGoldButtonText}>Otwórz książkę</Text>
          </Pressable>
        </View>
      </View>

      <SectionHeader title="Kontynuuj" />

      <HorizontalBookList
        booksToShow={continueBooks}
        favoriteIds={favoriteIds}
        onOpenBook={onOpenBook}
        onToggleFavorite={onToggleFavorite}
      />

      <SectionHeader title="Ostatnio dodane" />

      <HorizontalBookList
        booksToShow={newBooks}
        favoriteIds={favoriteIds}
        onOpenBook={onOpenBook}
        onToggleFavorite={onToggleFavorite}
      />

      <SectionHeader title="Kategorie" actionLabel="Pokaż wszystko" />

      <View style={styles.categoryGrid}>
        {categories.slice(0, 6).map((category) => (
          <CategoryTile
            key={category}
            category={category}
            onPress={() => onOpenCategory(category)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function SearchScreen({
  favoriteIds,
  onOpenBook,
  onOpenCategory,
  onToggleFavorite,
}: {
  favoriteIds: string[];
  onOpenBook: (book: Book) => void;
  onOpenCategory: (category: string) => void;
  onToggleFavorite: (bookId: string) => void;
}) {
  const [query, setQuery] = useState('');

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return books;
    }

    return books.filter((book) => {
      const searchableText = [
        book.title,
        book.author,
        book.description,
        ...book.categories,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.screenTitle}>Szukaj</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Tytuł, autor lub tematyka"
        placeholderTextColor={colors.textMuted}
        style={styles.searchInput}
      />

      <SectionHeader
        title={query.trim() ? 'Wyniki wyszukiwania' : 'Ostatnio dodane'}
      />

      <VerticalBookList
        booksToShow={query.trim() ? filteredBooks : books.slice(0, 3)}
        favoriteIds={favoriteIds}
        onOpenBook={onOpenBook}
        onToggleFavorite={onToggleFavorite}
      />

      <SectionHeader title="Kategorie" />

      <View style={styles.categoryGrid}>
        {categories.map((category) => (
          <CategoryTile
            key={category}
            category={category}
            onPress={() => onOpenCategory(category)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function PracticeScreen({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.screenTitle}>Praktyka</Text>

      <Text style={styles.screenLead}>
        Praktyczne lekcje z książek. Tu nie tylko słuchasz. Tu przekładasz
        książkę na konkretne sytuacje z życia.
      </Text>

      {books.map((book) => (
        <View key={book.id} style={styles.practiceBookCard}>
          <View style={styles.practiceBookHeader}>
            <BookCover book={book} />

            <View style={styles.practiceBookInfo}>
              <Text style={styles.practiceBookTitle}>{book.title}</Text>
              <Text style={styles.practiceBookAuthor}>{book.author}</Text>
              <Text style={styles.practiceBookMeta}>
                {book.practicalLessons.length} praktyczne lekcje
              </Text>
            </View>
          </View>

          <Text style={styles.practiceSectionTitle}>
            Praktyczne lekcje z książki
          </Text>

          {book.practicalLessons.map((lesson, index) => (
            <View key={lesson.title} style={styles.practiceMiniCard}>
              <Text style={styles.practiceNumber}>{index + 1}</Text>

              <View style={styles.practiceMiniContent}>
                <Text style={styles.practiceMiniTitle}>{lesson.title}</Text>
                <Text style={styles.practiceMiniText}>{lesson.description}</Text>
              </View>
            </View>
          ))}

          <Pressable
            style={styles.secondaryButton}
            onPress={() => onOpenBook(book)}
          >
            <Text style={styles.secondaryButtonText}>Otwórz całą książkę</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

function CategoryScreen({
  category,
  favoriteIds,
  onBack,
  onOpenBook,
  onToggleFavorite,
}: {
  category: string;
  favoriteIds: string[];
  onBack: () => void;
  onOpenBook: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
}) {
  const categoryBooks = books.filter((book) =>
    book.categories.includes(category)
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Wróć</Text>
      </Pressable>

      <Text style={styles.screenTitle}>{category}</Text>

      <Text style={styles.screenLead}>
        Książki w tej kategorii. Każda zawiera 13 minut książki oraz praktyczne
        lekcje z książki.
      </Text>

      <VerticalBookList
        booksToShow={categoryBooks}
        favoriteIds={favoriteIds}
        onOpenBook={onOpenBook}
        onToggleFavorite={onToggleFavorite}
      />
    </ScrollView>
  );
}

function BookScreen({
  book,
  isFavorite,
  onBack,
  onToggleFavorite,
}: {
  book: Book;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}) {
  const player = useAudioPlayer(require('./assets/audio/sample.mp3'));
  const status = useAudioPlayerStatus(player);

  const currentTime = formatSeconds(status.currentTime);
  const duration = formatSeconds(status.duration);

  const handlePlayPause = () => {
    if (status.playing) {
      player.pause();
      return;
    }

    player.play();
  };

  const handleReplay = () => {
    player.seekTo(0);
    player.play();
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Wróć</Text>
      </Pressable>

      <View style={styles.bookDetailCard}>
        <View style={styles.bookDetailTop}>
          <BookCover book={book} large />

          <View style={styles.bookDetailInfo}>
            <Text style={styles.badge}>{book.categories[0]}</Text>
            <Text style={styles.bookDetailTitle}>{book.title}</Text>
            <Text style={styles.meta}>
              {book.author} • {book.durationMinutes} minut
            </Text>

            <Pressable
              style={styles.favoriteDetailButton}
              onPress={onToggleFavorite}
            >
              <Text style={styles.favoriteDetailButtonText}>
                {isFavorite ? '♥ W ulubionych' : '♡ Dodaj do ulubionych'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.screenLead}>{book.description}</Text>

        <View style={styles.twoPartCard}>
          <Text style={styles.partLabel}>Część 1</Text>
          <Text style={styles.partTitle}>13 minut książki</Text>
          <Text style={styles.partText}>{book.bookSummaryDescription}</Text>

          <View style={styles.playerCard}>
            <Text style={styles.playerTitle}>Odtwarzacz audio</Text>

            <Text style={styles.playerTime}>
              {currentTime} / {duration}
            </Text>

            <Pressable style={styles.playButton} onPress={handlePlayPause}>
              <Text style={styles.playButtonText}>
                {status.playing ? 'Pauza' : 'Odtwórz'}
              </Text>
            </Pressable>

            <View style={styles.spacer10} />

            <Pressable style={styles.replayButton} onPress={handleReplay}>
              <Text style={styles.replayButtonText}>Od początku</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.twoPartCard}>
          <Text style={styles.partLabel}>Część 2</Text>
          <Text style={styles.partTitle}>Praktyczne lekcje z książki</Text>
          <Text style={styles.partText}>{book.practicalLessonsTitle}</Text>

          {book.practicalLessons.map((lesson, index) => (
            <View key={lesson.title} style={styles.actionStep}>
              <Text style={styles.actionNumber}>{index + 1}</Text>

              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{lesson.title}</Text>
                <Text style={styles.actionText}>{lesson.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MyListScreen({
  favoriteIds,
  onOpenBook,
  onOpenSettings,
  onToggleFavorite,
}: {
  favoriteIds: string[];
  onOpenBook: (book: Book) => void;
  onOpenSettings: () => void;
  onToggleFavorite: (bookId: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<MyListTab>('continue');

  const continueBooks = books.filter((book) => book.progressPercent);
  const favoriteBooks = books.filter((book) => favoriteIds.includes(book.id));
  const completedBooks = books.filter((book) => book.isCompleted);

  const visibleBooks =
    activeTab === 'continue'
      ? continueBooks
      : activeTab === 'favorites'
        ? favoriteBooks
        : completedBooks;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitleNoMargin}>Moja lista</Text>

        <Pressable style={styles.settingsButton} onPress={onOpenSettings}>
          <Text style={styles.settingsButtonText}>⚙</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <TabButton
          label="Kontynuuj"
          active={activeTab === 'continue'}
          onPress={() => setActiveTab('continue')}
        />
        <TabButton
          label="Ulubione"
          active={activeTab === 'favorites'}
          onPress={() => setActiveTab('favorites')}
        />
        <TabButton
          label="Ukończone"
          active={activeTab === 'completed'}
          onPress={() => setActiveTab('completed')}
        />
      </View>

      <VerticalBookList
        booksToShow={visibleBooks}
        favoriteIds={favoriteIds}
        onOpenBook={onOpenBook}
        onToggleFavorite={onToggleFavorite}
      />
    </ScrollView>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Pressable style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Wróć</Text>
      </Pressable>

      <Text style={styles.screenTitle}>Ustawienia</Text>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Konto</Text>
        <SettingsRow label="Imię: Łukasz" />
        <SettingsRow label="Zmień język" />
        <SettingsRow label="Kontakt z pomocą techniczną" />
        <SettingsRow label="Podziel się opinią" />
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Subskrypcja</Text>
        <SettingsRow label="Plan: wersja testowa MVP" />
        <SettingsRow label="Zarządzaj subskrypcją" />
      </View>

      <Text style={styles.versionText}>13 Minut Przewagi • MVP 0.8</Text>
    </ScrollView>
  );
}

function HorizontalBookList({
  booksToShow,
  favoriteIds,
  onOpenBook,
  onToggleFavorite,
}: {
  booksToShow: Book[];
  favoriteIds: string[];
  onOpenBook: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.horizontalList}
    >
      {booksToShow.map((book) => (
        <CompactBookCard
          key={book.id}
          book={book}
          isFavorite={favoriteIds.includes(book.id)}
          onPress={() => onOpenBook(book)}
          onToggleFavorite={() => onToggleFavorite(book.id)}
        />
      ))}
    </ScrollView>
  );
}

function VerticalBookList({
  booksToShow,
  favoriteIds,
  onOpenBook,
  onToggleFavorite,
}: {
  booksToShow: Book[];
  favoriteIds: string[];
  onOpenBook: (book: Book) => void;
  onToggleFavorite: (bookId: string) => void;
}) {
  if (booksToShow.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Brak wyników</Text>
        <Text style={styles.emptyText}>
          Spróbuj wpisać inny tytuł, autora albo kategorię.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.verticalList}>
      {booksToShow.map((book) => (
        <WideBookCard
          key={book.id}
          book={book}
          isFavorite={favoriteIds.includes(book.id)}
          onPress={() => onOpenBook(book)}
          onToggleFavorite={() => onToggleFavorite(book.id)}
        />
      ))}
    </View>
  );
}

function CompactBookCard({
  book,
  isFavorite,
  onPress,
  onToggleFavorite,
}: {
  book: Book;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.compactCard, { backgroundColor: book.coverColor }]}
    >
      <BookCover book={book} />

      <View style={styles.bookCardFooter}>
        <Text style={styles.bookDuration}>◷ {book.durationMinutes} minut</Text>

        <Pressable onPress={onToggleFavorite}>
          <Text style={styles.heart}>{isFavorite ? '♥' : '♡'}</Text>
        </Pressable>
      </View>

      <Text style={styles.bookCategory}>▦ {book.categories[0]}</Text>
      <Text style={styles.listenText}>🎧 13 minut książki</Text>
      <Text style={styles.practiceText}>✦ Praktyczne lekcje</Text>
    </Pressable>
  );
}

function WideBookCard({
  book,
  isFavorite,
  onPress,
  onToggleFavorite,
}: {
  book: Book;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.wideCard, { backgroundColor: book.coverColor }]}
    >
      <BookCover book={book} />

      <View style={styles.wideCardContent}>
        <View style={styles.wideCardTop}>
          <Text style={styles.wideCardTitle}>{book.title}</Text>

          <Pressable onPress={onToggleFavorite}>
            <Text style={styles.heart}>{isFavorite ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        <Text style={styles.wideCardAuthor}>{book.author}</Text>
        <Text style={styles.wideCardMeta}>◷ {book.durationMinutes} minut</Text>
        <Text style={styles.listenText}>🎧 13 minut książki</Text>
        <Text style={styles.practiceText}>✦ Praktyczne lekcje z książki</Text>
        <Text style={styles.wideCardCategory}>
          ▦ {book.categories.join(', ')}
        </Text>
      </View>
    </Pressable>
  );
}

function BookCover({
  book,
  large = false,
}: {
  book: Book;
  large?: boolean;
}) {
  return (
    <View style={large ? styles.bookCoverLarge : styles.bookCover}>
      <Text style={large ? styles.bookCoverTitleLarge : styles.bookCoverTitle}>
        {book.coverTitle}
      </Text>
      <Text
        style={large ? styles.bookCoverSubtitleLarge : styles.bookCoverSubtitle}
      >
        {book.coverSubtitle}
      </Text>
      <Text style={styles.bookCoverAuthor}>{book.author}</Text>
    </View>
  );
}

function CategoryTile({
  category,
  onPress,
}: {
  category: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.categoryTile} onPress={onPress}>
      <Text style={styles.categoryIcon}>{getCategoryIcon(category)}</Text>
      <Text style={styles.categoryTileText}>{category}</Text>
    </Pressable>
  );
}

function SectionHeader({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && <Text style={styles.sectionAction}>{actionLabel} ›</Text>}
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={active ? styles.tabActive : styles.tab} onPress={onPress}>
      <Text style={active ? styles.tabTextActive : styles.tabText}>
        {label}
      </Text>
    </Pressable>
  );
}

function SettingsRow({ label }: { label: string }) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsRowText}>{label}</Text>
      <Text style={styles.settingsArrow}>›</Text>
    </View>
  );
}

function BottomNavigation({
  currentScreen,
  onNavigate,
}: {
  currentScreen: Screen;
  onNavigate: (screen: MainScreen) => void;
}) {
  const activeScreen: MainScreen =
    currentScreen === 'category'
      ? 'search'
      : currentScreen === 'book'
        ? 'home'
        : currentScreen === 'settings'
          ? 'myList'
          : currentScreen;

  return (
    <View style={styles.bottomNavigation}>
      <NavigationItem
        icon="⌂"
        label="Dla Ciebie"
        active={activeScreen === 'home'}
        onPress={() => onNavigate('home')}
      />

      <NavigationItem
        icon="⌕"
        label="Szukaj"
        active={activeScreen === 'search'}
        onPress={() => onNavigate('search')}
      />

      <NavigationItem
        icon="✦"
        label="Praktyka"
        active={activeScreen === 'practice'}
        onPress={() => onNavigate('practice')}
      />

      <NavigationItem
        icon="▰"
        label="Moja lista"
        active={activeScreen === 'myList'}
        onPress={() => onNavigate('myList')}
      />
    </View>
  );
}

function NavigationItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={active ? styles.navItemActive : styles.navItem}
    >
      <Text style={active ? styles.navIconActive : styles.navIcon}>{icon}</Text>
      <Text style={active ? styles.navTextActive : styles.navText}>{label}</Text>
    </Pressable>
  );
}

function formatSeconds(seconds: number | undefined) {
  const safeSeconds =
    typeof seconds === 'number' && Number.isFinite(seconds) ? seconds : 0;

  const roundedSeconds = Math.floor(safeSeconds);
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
}

function getCategoryIcon(category: string) {
  if (category.includes('Finanse')) return '◉';
  if (category.includes('Motywacja')) return '★';
  if (category.includes('Rozwój')) return '▲';
  if (category.includes('Przedsiębiorczość')) return '◆';
  if (category.includes('Psychologia')) return '●';
  if (category.includes('Produktywność')) return '✓';
  if (category.includes('Zdrowie')) return '✚';
  if (category.includes('Relacje')) return '♡';
  return '▦';
}

const colors = {
  background: '#050D1F',
  surface: '#081528',
  surfaceDeep: '#061020',
  border: '#22324F',
  borderStrong: '#3B4A67',
  text: '#F8FAFC',
  textMuted: '#AEB9CC',
  textSoft: '#CBD5E1',
  gold: '#D9A441',
  goldSoft: '#E5B85A',
  navyText: '#0B2A44',
  mint: '#43C5A7',
};

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  page: {
    flexGrow: 1,
    padding: 18,
    paddingBottom: 104,
  },
  headerRow: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  greeting: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  greetingName: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingsButtonText: {
    color: colors.gold,
    fontSize: 24,
    fontWeight: '900',
  },
  featuredCard: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    marginBottom: 24,
  },
  featuredLogo: {
    width: 110,
    height: 110,
    borderRadius: 20,
    marginRight: 16,
  },
  featuredContent: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    color: colors.surfaceDeep,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  featuredDescription: {
    color: colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  smallGoldButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    borderRadius: 13,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  smallGoldButtonText: {
    color: colors.surfaceDeep,
    fontSize: 13,
    fontWeight: '900',
  },
  screenTitle: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: 14,
  },
  screenTitleNoMargin: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  screenLead: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    color: colors.textSoft,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 18,
  },
  sectionHeader: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 10,
  },
  sectionAction: {
    color: colors.goldSoft,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  horizontalList: {
    paddingRight: 18,
    paddingBottom: 22,
  },
  compactCard: {
    width: 190,
    borderRadius: 20,
    padding: 14,
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  bookCover: {
    width: 118,
    height: 154,
    borderRadius: 10,
    backgroundColor: colors.surfaceDeep,
    padding: 10,
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  bookCoverLarge: {
    width: 130,
    height: 170,
    borderRadius: 12,
    backgroundColor: colors.surfaceDeep,
    padding: 12,
    justifyContent: 'center',
    marginRight: 16,
  },
  bookCoverTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bookCoverTitleLarge: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  bookCoverSubtitle: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  bookCoverSubtitleLarge: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  bookCoverAuthor: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 14,
  },
  bookCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookDuration: {
    color: colors.navyText,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },
  bookCategory: {
    color: colors.navyText,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 5,
  },
  heart: {
    color: colors.navyText,
    fontSize: 26,
    fontWeight: '900',
  },
  listenText: {
    color: colors.mint,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },
  practiceText: {
    color: colors.navyText,
    fontSize: 13,
    fontWeight: '900',
  },
  searchInput: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: colors.text,
    fontSize: 16,
    marginBottom: 24,
  },
  verticalList: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
  },
  wideCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  wideCardContent: {
    flex: 1,
    marginLeft: 14,
  },
  wideCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wideCardTitle: {
    flex: 1,
    color: colors.navyText,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    marginRight: 8,
  },
  wideCardAuthor: {
    color: colors.navyText,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 8,
  },
  wideCardMeta: {
    color: colors.navyText,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  wideCardCategory: {
    color: colors.navyText,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginTop: 4,
  },
  categoryGrid: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryTile: {
    width: '48%',
    minHeight: 112,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    color: colors.gold,
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 8,
  },
  categoryTileText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  backButton: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    color: colors.goldSoft,
    fontSize: 17,
    fontWeight: '900',
  },
  bookDetailCard: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookDetailTop: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  bookDetailInfo: {
    flex: 1,
  },
  bookDetailTitle: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
    marginBottom: 8,
  },
  meta: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
  },
  favoriteDetailButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  favoriteDetailButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  twoPartCard: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  partLabel: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  partTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 8,
  },
  partText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
  },
  playerCard: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 18,
    padding: 14,
  },
  playerTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
  },
  playerTime: {
    color: colors.textSoft,
    fontSize: 15,
    marginBottom: 14,
  },
  playButton: {
    backgroundColor: colors.gold,
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: 'center',
  },
  playButtonText: {
    color: colors.surfaceDeep,
    fontSize: 16,
    fontWeight: '900',
  },
  replayButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 15,
    paddingVertical: 13,
    alignItems: 'center',
  },
  replayButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  actionStep: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  actionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    color: colors.surfaceDeep,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '900',
    marginRight: 10,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  actionText: {
    color: colors.textSoft,
    fontSize: 14,
    lineHeight: 21,
  },
  practiceBookCard: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    marginBottom: 18,
  },
  practiceBookHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  practiceBookInfo: {
    flex: 1,
    marginLeft: 14,
  },
  practiceBookTitle: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900',
    marginBottom: 5,
  },
  practiceBookAuthor: {
    color: colors.textSoft,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  practiceBookMeta: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  practiceSectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  practiceMiniCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 13,
    marginBottom: 10,
  },
  practiceNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold,
    color: colors.surfaceDeep,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '900',
    marginRight: 10,
  },
  practiceMiniContent: {
    flex: 1,
  },
  practiceMiniTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  practiceMiniText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 13,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  tabs: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  tabActive: {
    flex: 1,
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  tabText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  tabTextActive: {
    color: colors.surfaceDeep,
    fontSize: 13,
    fontWeight: '900',
  },
  settingsSection: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    marginBottom: 26,
  },
  settingsSectionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 10,
  },
  settingsRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsRowText: {
    color: colors.textSoft,
    fontSize: 16,
    fontWeight: '700',
  },
  settingsArrow: {
    color: colors.goldSoft,
    fontSize: 28,
    fontWeight: '900',
  },
  versionText: {
    color: colors.textMuted,
    textAlign: 'center',
    fontSize: 13,
    marginTop: 10,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  bottomNavigation: {
    height: 78,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.surfaceDeep,
  },
  navIcon: {
    color: colors.textMuted,
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 2,
  },
  navIconActive: {
    color: colors.goldSoft,
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 2,
  },
  navText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  navTextActive: {
    color: colors.goldSoft,
    fontSize: 11,
    fontWeight: '900',
  },
  spacer10: {
    height: 10,
  },
});