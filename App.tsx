import React, { useMemo, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { books, categories, userName, type Book } from './src/data/books';

const colors = {
  background: '#050914',
  card: '#0B101C',
  cardSoft: '#101725',
  border: '#30384A',
  text: '#FFFFFF',
  muted: '#AEB6C7',
  gold: '#D9B45A',
  goldDark: '#8B6A24',
  input: '#151C2A',
};

const coverImages: Record<string, any> = {
  'carnegie.png': require('./assets/covers/carnegie.png'),
  'potega-nawyku.png': require('./assets/covers/potega-nawyku.png'),
  'atomowe-nawyki.png': require('./assets/covers/atomowe-nawyki.png'),
  'esencjalista.png': require('./assets/covers/esencjalista.png'),
};

const audioSources: Record<string, any> = {
  'jak-zdobyc-przyjaciol': require('./assets/audio/jak-zdobyc-przyjaciol-13-minut.mp3'),
};

type TabId = 'home' | 'search' | 'practice' | 'library' | 'settings';

function formatSeconds(value?: number | null) {
  const safeValue = Number.isFinite(value || 0) ? Math.max(0, Math.floor(value || 0)) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getBookId(book: Book) {
  return String((book as any).id || '');
}

function getBookTitle(book: Book) {
  return String((book as any).title || '');
}

function getBookAuthor(book: Book) {
  return String((book as any).author || '');
}

function getBookDescription(book: Book) {
  return String(
    (book as any).description ||
      (book as any).bookSummaryDescription ||
      'Trzynaście minut najważniejszych idei z książki oraz praktyczne lekcje do wdrożenia.'
  );
}

function getBookSummaryDescription(book: Book) {
  return String(
    (book as any).bookSummaryDescription ||
      'Najważniejsze idee książki w formie krótkiego, konkretnego nagrania audio.'
  );
}

function getPracticalDescription(book: Book) {
  return String(
    (book as any).practicalDescription ||
      'Przykłady, sceny i gotowe sposoby zastosowania idei z książki w codziennym życiu.'
  );
}

function getBookCategories(book: Book): string[] {
  const rawCategories = (book as any).categories;

  if (Array.isArray(rawCategories)) {
    return rawCategories.map(String);
  }

  return [];
}

function getBookCoverName(book: Book) {
  return String((book as any).coverImage || '');
}

function BookCover({
  book,
  size = 'small',
}: {
  book: Book;
  size?: 'small' | 'large' | 'player';
}) {
  const coverName = getBookCoverName(book);
  const coverSource = coverImages[coverName];

  if (coverSource) {
    return (
      <Image
        source={coverSource}
        style={
          size === 'large'
            ? styles.coverImageLarge
            : size === 'player'
              ? styles.coverImagePlayer
              : styles.coverImage
        }
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={
        size === 'large'
          ? styles.coverFallbackLarge
          : size === 'player'
            ? styles.coverFallbackPlayer
            : styles.coverFallback
      }
    >
      <Text style={styles.coverFallbackNumber}>13</Text>
      <Text style={styles.coverFallbackText}>MINUT PRZEWAGI</Text>
    </View>
  );
}

function AudioPlayer({ source, book }: { source: any; book: Book }) {
  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);

  const [playbackRate, setPlaybackRate] = useState(1);
  const progressWidthRef = useRef(1);

  const currentTimeSeconds = status.currentTime || 0;
  const durationSeconds = status.duration || 0;

  const currentTime = formatSeconds(currentTimeSeconds);
  const duration = formatSeconds(durationSeconds);

  const progressPercent =
    durationSeconds > 0
      ? Math.min(100, Math.max(0, (currentTimeSeconds / durationSeconds) * 100))
      : 0;

  const playbackRates = [1, 1.25, 1.5, 1.75];

  const seekToLocation = (event: GestureResponderEvent) => {
    if (!durationSeconds) {
      return;
    }

    const locationX = event.nativeEvent.locationX || 0;
    const progressWidth = progressWidthRef.current || 1;
    const nextPercent = Math.min(1, Math.max(0, locationX / progressWidth));
    const nextTime = durationSeconds * nextPercent;

    player.seekTo(nextTime);
  };

  const progressPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: seekToLocation,
        onPanResponderMove: seekToLocation,
      }),
    [durationSeconds]
  );

  const handleProgressLayout = (event: LayoutChangeEvent) => {
    progressWidthRef.current = event.nativeEvent.layout.width || 1;
  };

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

  const handleSeek = (seconds: number) => {
    const nextTime = Math.min(
      Math.max(currentTimeSeconds + seconds, 0),
      durationSeconds || currentTimeSeconds + seconds
    );

    player.seekTo(nextTime);
  };

  const handleChangeSpeed = () => {
    const currentIndex = playbackRates.findIndex((rate) => rate === playbackRate);
    const nextRate = playbackRates[(currentIndex + 1) % playbackRates.length];

    setPlaybackRate(nextRate);

    const playerAny = player as any;

    if (typeof playerAny.setPlaybackRate === 'function') {
      playerAny.setPlaybackRate(nextRate);
      return;
    }

    if ('playbackRate' in playerAny) {
      playerAny.playbackRate = nextRate;
    }
  };

  return (
    <View style={styles.playerScreenCard}>
      <BookCover book={book} size="player" />

      <Text style={styles.playerBookTitle} numberOfLines={2}>
        {getBookTitle(book)}
      </Text>

      <Text style={styles.playerBookAuthor} numberOfLines={1}>
        {getBookAuthor(book)}
      </Text>

      <View style={styles.progressTouchArea} {...progressPanResponder.panHandlers}>
        <View style={styles.progressTrackLarge} onLayout={handleProgressLayout}>
          <View style={[styles.progressFillLarge, { width: `${progressPercent}%` }]} />
          <View style={[styles.progressThumb, { left: `${progressPercent}%` }]} />
        </View>
      </View>

      <View style={styles.playerTimeRow}>
        <Text style={styles.playerTime}>{currentTime}</Text>
        <Text style={styles.playerTime}>{duration}</Text>
      </View>

      <View style={styles.playerControlsRow}>
        <Pressable style={styles.iconControlButton} onPress={handleReplay}>
          <Text style={styles.iconControlText}>↺</Text>
        </Pressable>

        <Pressable style={styles.seekControlButton} onPress={() => handleSeek(-15)}>
          <Text style={styles.seekControlText}>-15</Text>
        </Pressable>

        <Pressable style={styles.playCircleButton} onPress={handlePlayPause}>
          <Text style={styles.playCircleText}>{status.playing ? 'Ⅱ' : '▶'}</Text>
        </Pressable>

        <Pressable style={styles.seekControlButton} onPress={() => handleSeek(15)}>
          <Text style={styles.seekControlText}>+15</Text>
        </Pressable>

        <Pressable style={styles.speedCompactButton} onPress={handleChangeSpeed}>
          <Text style={styles.speedCompactText}>{playbackRate}x</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Header({
  title,
  subtitle,
  onSettings,
}: {
  title: string;
  subtitle?: string;
  onSettings?: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTextWrap}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>

      {onSettings ? (
        <Pressable style={styles.settingsButton} onPress={onSettings}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function BookSmallCard({
  book,
  onPress,
}: {
  book: Book;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.smallBookCard} onPress={onPress}>
      <BookCover book={book} />
      <Text style={styles.smallBookTitle} numberOfLines={2}>
        {getBookTitle(book)}
      </Text>
      <Text style={styles.smallBookAuthor} numberOfLines={1}>
        {getBookAuthor(book)}
      </Text>
    </Pressable>
  );
}

function BookListCard({
  book,
  onPress,
}: {
  book: Book;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.listCard} onPress={onPress}>
      <BookCover book={book} />

      <View style={styles.listCardContent}>
        <Text style={styles.listCardTitle} numberOfLines={2}>
          {getBookTitle(book)}
        </Text>
        <Text style={styles.listCardAuthor}>{getBookAuthor(book)}</Text>
        <Text style={styles.listCardDescription} numberOfLines={3}>
          {getBookDescription(book)}
        </Text>
      </View>
    </Pressable>
  );
}

function HomeScreen({
  onOpenBook,
  onSettings,
}: {
  onOpenBook: (book: Book) => void;
  onSettings: () => void;
}) {
  const featuredBook = books[0];

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title={`Dzień dobry,\n${userName} 👋`} onSettings={onSettings} />

      {featuredBook ? (
        <Pressable style={styles.featuredCard} onPress={() => onOpenBook(featuredBook)}>
          <View style={styles.featuredCoverWrap}>
            <BookCover book={featuredBook} />
          </View>

          <View style={styles.featuredContent}>
            <Text style={styles.badge}>WYBRANE DLA CIEBIE</Text>
            <Text style={styles.featuredTitle}>{getBookTitle(featuredBook)}</Text>
            <Text style={styles.featuredSubtitle}>
              13 minut książki + praktyczne lekcje z książki.
            </Text>

            <View style={styles.featuredButton}>
              <Text style={styles.featuredButtonText}>Otwórz książkę</Text>
            </View>
          </View>
        </Pressable>
      ) : null}

      <Text style={styles.sectionTitle}>Kontynuuj</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {books.map((book) => (
          <BookSmallCard key={getBookId(book)} book={book} onPress={() => onOpenBook(book)} />
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Ostatnio dodane</Text>

      <View style={styles.verticalList}>
        {books.map((book) => (
          <BookListCard key={`latest-${getBookId(book)}`} book={book} onPress={() => onOpenBook(book)} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Kategorie</Text>

      <View style={styles.categoryWrap}>
        {categories.map((category) => (
          <View key={category} style={styles.categoryPill}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function SearchScreen({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
  const [query, setQuery] = useState('');

  const filteredBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return books;
    }

    return books.filter((book) => {
      const searchable = [
        getBookTitle(book),
        getBookAuthor(book),
        getBookDescription(book),
        ...getBookCategories(book),
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [query]);

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Szukaj" subtitle="Znajdź książkę, autora albo temat." />

      <TextInput
        style={styles.searchInput}
        placeholder="Tytuł, autor lub tematyka"
        placeholderTextColor={colors.muted}
        value={query}
        onChangeText={setQuery}
      />

      <Text style={styles.sectionTitle}>Wyniki</Text>

      <View style={styles.verticalList}>
        {filteredBooks.map((book) => (
          <BookListCard key={`search-${getBookId(book)}`} book={book} onPress={() => onOpenBook(book)} />
        ))}
      </View>
    </ScrollView>
  );
}

function PracticeScreen({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header
        title="Praktyka"
        subtitle="Sceny, wdrożenia i konkretne sposoby użycia wiedzy z książek."
      />

      <View style={styles.verticalList}>
        {books.map((book) => (
          <Pressable key={`practice-${getBookId(book)}`} style={styles.practiceCard} onPress={() => onOpenBook(book)}>
            <Text style={styles.practiceLabel}>Praktyczne lekcje</Text>
            <Text style={styles.practiceTitle}>{getBookTitle(book)}</Text>
            <Text style={styles.practiceText}>{getPracticalDescription(book)}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function LibraryScreen({ onOpenBook }: { onOpenBook: (book: Book) => void }) {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Moja lista" subtitle="Kontynuuj, ulubione i ukończone książki." />

      <Text style={styles.sectionTitle}>Kontynuuj</Text>

      <View style={styles.verticalList}>
        {books.slice(0, 2).map((book) => (
          <BookListCard key={`continue-${getBookId(book)}`} book={book} onPress={() => onOpenBook(book)} />
        ))}
      </View>

      <Text style={styles.sectionTitle}>Ulubione</Text>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Jeszcze nic tu nie ma</Text>
        <Text style={styles.emptyText}>Dodawanie do ulubionych zrobimy w kolejnym etapie.</Text>
      </View>

      <Text style={styles.sectionTitle}>Ukończone</Text>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>Lista będzie rosła</Text>
        <Text style={styles.emptyText}>Tutaj później pokażemy ukończone książki.</Text>
      </View>
    </ScrollView>
  );
}

function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <Header title="Ustawienia" subtitle="Profil, wersja aplikacji i subskrypcja." />

      <View style={styles.settingsCard}>
        <Text style={styles.settingsRowLabel}>Imię</Text>
        <Text style={styles.settingsRowValue}>{userName}</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsRowLabel}>Język</Text>
        <Text style={styles.settingsRowValue}>Polski</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsRowLabel}>Subskrypcja</Text>
        <Text style={styles.settingsRowValue}>Wkrótce</Text>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsRowLabel}>Wersja</Text>
        <Text style={styles.settingsRowValue}>MVP 1.0</Text>
      </View>
    </ScrollView>
  );
}

function BookScreen({
  book,
  onBack,
}: {
  book: Book;
  onBack: () => void;
}) {
  const bookId = getBookId(book);
  const audioSource = audioSources[bookId];
  const practicalLessons = Array.isArray((book as any).practicalLessons)
    ? ((book as any).practicalLessons as Array<any>)
    : [];

  return (
    <ScrollView contentContainerStyle={styles.playerScreenContent}>
      <Pressable style={styles.backButtonCompact} onPress={onBack}>
        <Text style={styles.backButtonCompactText}>← Wróć</Text>
      </Pressable>

      {audioSource ? (
        <AudioPlayer source={audioSource} book={book} />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Audio będzie dodane</Text>
          <Text style={styles.emptyText}>Ten tytuł nie ma jeszcze podpiętego pliku MP3.</Text>
        </View>
      )}

      <View style={styles.twoPartCardCompact}>
        <Text style={styles.partLabel}>Część 2</Text>
        <Text style={styles.partTitle}>Praktyczne lekcje z książki</Text>
        <Text style={styles.partText}>{getPracticalDescription(book)}</Text>

        {practicalLessons.length > 0 ? (
          <View style={styles.lessonList}>
            {practicalLessons.map((lesson, index) => (
              <View key={`${bookId}-lesson-${index}`} style={styles.lessonCard}>
                <Text style={styles.lessonNumber}>{index + 1}</Text>
                <View style={styles.lessonContent}>
                  <Text style={styles.lessonTitle}>{String(lesson.title || lesson.name || 'Lekcja')}</Text>
                  <Text style={styles.lessonText}>
                    {String(lesson.description || lesson.text || 'Praktyczne zastosowanie idei z książki.')}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Praktyka w przygotowaniu</Text>
            <Text style={styles.emptyText}>Tutaj dodamy drugie nagranie i konkretne sceny wdrożeniowe.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function BottomNav({
  activeTab,
  onChangeTab,
}: {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
}) {
  const items: Array<{ id: TabId; icon: string; label: string }> = [
    { id: 'home', icon: '⌂', label: 'Dla Ciebie' },
    { id: 'search', icon: '⌕', label: 'Szukaj' },
    { id: 'practice', icon: '✦', label: 'Praktyka' },
    { id: 'library', icon: '▰', label: 'Moja lista' },
  ];

  return (
    <View style={styles.bottomNav}>
      {items.map((item) => {
        const isActive = activeTab === item.id;

        return (
          <Pressable
            key={item.id}
            style={[styles.navItem, isActive && styles.navItemActive]}
            onPress={() => onChangeTab(item.id)}
          >
            <Text style={[styles.navIcon, isActive && styles.navIconActive]}>{item.icon}</Text>
            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const openBook = (book: Book) => {
    setSelectedBook(book);
  };

  const closeBook = () => {
    setSelectedBook(null);
  };

  const changeTab = (tab: TabId) => {
    setSelectedBook(null);
    setActiveTab(tab);
  };

  let content = null;

  if (selectedBook) {
    content = <BookScreen book={selectedBook} onBack={closeBook} />;
  } else if (activeTab === 'home') {
    content = <HomeScreen onOpenBook={openBook} onSettings={() => setActiveTab('settings')} />;
  } else if (activeTab === 'search') {
    content = <SearchScreen onOpenBook={openBook} />;
  } else if (activeTab === 'practice') {
    content = <PracticeScreen onOpenBook={openBook} />;
  } else if (activeTab === 'library') {
    content = <LibraryScreen onOpenBook={openBook} />;
  } else {
    content = <SettingsScreen />;
  }

  return (
    <SafeAreaView style={styles.app}>
      <StatusBar style="light" />
      <View style={styles.main}>{content}</View>

      {!selectedBook ? <BottomNav activeTab={activeTab} onChangeTab={changeTab} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  main: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContent: {
    padding: 22,
    paddingBottom: 120,
  },
  playerScreenContent: {
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 14,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
    fontWeight: '600',
  },
  settingsButton: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  settingsIcon: {
    color: colors.gold,
    fontSize: 34,
  },
  featuredCard: {
    flexDirection: 'row',
    gap: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 30,
    padding: 20,
    backgroundColor: colors.card,
    marginBottom: 30,
  },
  featuredCoverWrap: {
    width: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredContent: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldDark,
    color: colors.text,
    fontWeight: '900',
    fontSize: 13,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 14,
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 34,
    fontWeight: '900',
    marginBottom: 14,
  },
  featuredSubtitle: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '600',
    marginBottom: 18,
  },
  featuredButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.goldDark,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 18,
  },
  featuredButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 16,
    marginTop: 8,
  },
  horizontalList: {
    gap: 16,
    paddingRight: 20,
    paddingBottom: 26,
  },
  smallBookCard: {
    width: 160,
    borderRadius: 24,
    padding: 14,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallBookTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    marginTop: 12,
  },
  smallBookAuthor: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  verticalList: {
    gap: 14,
    marginBottom: 24,
  },
  listCard: {
    flexDirection: 'row',
    gap: 15,
    borderRadius: 24,
    padding: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  listCardContent: {
    flex: 1,
  },
  listCardTitle: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
  },
  listCardAuthor: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 5,
  },
  listCardDescription: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    fontWeight: '600',
  },
  coverImage: {
    width: 132,
    height: 190,
    borderRadius: 18,
    backgroundColor: colors.cardSoft,
  },
  coverImageLarge: {
    width: 210,
    height: 300,
    borderRadius: 24,
    backgroundColor: colors.cardSoft,
    alignSelf: 'center',
    marginBottom: 24,
  },
  coverImagePlayer: {
    width: 170,
    height: 240,
    borderRadius: 24,
    backgroundColor: colors.cardSoft,
    alignSelf: 'center',
    marginBottom: 18,
  },
  coverFallback: {
    width: 132,
    height: 190,
    borderRadius: 18,
    backgroundColor: '#101723',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  coverFallbackLarge: {
    width: 210,
    height: 300,
    borderRadius: 24,
    backgroundColor: '#101723',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    alignSelf: 'center',
    marginBottom: 24,
  },
  coverFallbackPlayer: {
    width: 170,
    height: 240,
    borderRadius: 24,
    backgroundColor: '#101723',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    alignSelf: 'center',
    marginBottom: 18,
  },
  coverFallbackNumber: {
    color: colors.text,
    fontSize: 52,
    fontWeight: '900',
  },
  coverFallbackText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  searchInput: {
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 22,
  },
  practiceCard: {
    borderRadius: 26,
    padding: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  practiceLabel: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  practiceTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    marginBottom: 10,
  },
  practiceText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  emptyCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  settingsCard: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  settingsRowLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 5,
  },
  settingsRowValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  backButtonCompact: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  backButtonCompactText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  playerScreenCard: {
    backgroundColor: '#071426',
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  playerBookTitle: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  playerBookAuthor: {
    color: colors.gold,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
  },
  progressTouchArea: {
    height: 34,
    justifyContent: 'center',
    marginTop: 2,
  },
  progressTrackLarge: {
    height: 10,
    backgroundColor: '#1B2535',
    borderRadius: 999,
    overflow: 'visible',
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
  },
  progressThumb: {
    position: 'absolute',
    top: -5,
    width: 20,
    height: 20,
    marginLeft: -10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  playerTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 18,
  },
  playerTime: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  playerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconControlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#101A2A',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconControlText: {
    color: colors.gold,
    fontSize: 22,
    fontWeight: '900',
  },
  seekControlButton: {
    width: 52,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#101A2A',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekControlText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '900',
  },
  playCircleButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircleText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginLeft: 2,
  },
  speedCompactButton: {
    width: 58,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#101A2A',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedCompactText: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900',
  },
  twoPartCardCompact: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  partLabel: {
    color: colors.gold,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  partTitle: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    marginBottom: 10,
  },
  partText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  lessonList: {
    gap: 12,
  },
  lessonCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 18,
    padding: 14,
    backgroundColor: colors.cardSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.goldDark,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 15,
    fontWeight: '900',
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
  },
  lessonText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    marginTop: 5,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#080D17',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    paddingBottom: 22,
    paddingHorizontal: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 18,
  },
  navItemActive: {
    backgroundColor: '#0C1420',
  },
  navIcon: {
    color: colors.muted,
    fontSize: 26,
    fontWeight: '900',
    marginBottom: 4,
  },
  navIconActive: {
    color: colors.gold,
  },
  navLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  navLabelActive: {
    color: colors.gold,
  },
});