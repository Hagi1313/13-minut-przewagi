import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Lesson = {
  id: string;
  title: string;
  source: string;
  category: string;
  durationMinutes: number;
  description: string;
  keyTakeaway: string;
  actionSteps: string[];
};

type Screen = 'home' | 'library' | 'lesson';

const lessons: Lesson[] = [
  {
    id: 'jak-zjednywac-sobie-ludzi',
    title: 'Jak zjednywać sobie ludzi',
    source: 'Dale Carnegie',
    category: 'Relacje',
    durationMinutes: 13,
    description:
      'Lekcja o tym, jak budować lepsze relacje, rozmawiać bez niepotrzebnych konfliktów i sprawiać, żeby ludzie chętniej z Tobą współpracowali.',
    keyTakeaway:
      'Ludzie rzadko zmieniają zdanie pod wpływem krytyki. Znacznie częściej otwierają się wtedy, gdy czują się ważni, wysłuchani i docenieni.',
    actionSteps: [
      'Dziś w jednej rozmowie świadomie nie przerywaj drugiej osobie.',
      'Zanim skrytykujesz, znajdź jedną rzecz, którą możesz szczerze docenić.',
      'Zadaj komuś pytanie o jego punkt widzenia i naprawdę wysłuchaj odpowiedzi.',
    ],
  },
  {
    id: 'potega-nawyku',
    title: 'Potęga nawyku',
    source: 'Charles Duhigg',
    category: 'Nawyki',
    durationMinutes: 13,
    description:
      'Lekcja o pętli nawyku: sygnale, rutynie i nagrodzie. Pokazuje, dlaczego złe nawyki wracają i jak można je przebudować.',
    keyTakeaway:
      'Nie musisz walczyć z całym nawykiem. Najczęściej wystarczy zostawić ten sam sygnał i nagrodę, ale podmienić rutynę.',
    actionSteps: [
      'Wybierz jeden nawyk, który chcesz zmienić.',
      'Zapisz, co go uruchamia: pora dnia, emocja, miejsce albo osoba.',
      'Zaprojektuj jedną prostą rutynę zastępczą na najbliższe dwadzieścia cztery godziny.',
    ],
  },
  {
    id: 'atomowe-nawyki',
    title: 'Atomowe nawyki',
    source: 'James Clear',
    category: 'Produktywność',
    durationMinutes: 13,
    description:
      'Lekcja o małych zmianach, które z czasem dają ogromny efekt. Skupia się na systemach, nie na chwilowej motywacji.',
    keyTakeaway:
      'Nie spadasz do poziomu swoich celów. Spadasz do poziomu swoich systemów. Dlatego projektuj środowisko, a nie licz wyłącznie na silną wolę.',
    actionSteps: [
      'Wybierz jeden mikro-nawyk, który zajmie mniej niż dwie minuty.',
      'Połącz go z czynnością, którą i tak robisz codziennie.',
      'Usuń z otoczenia jedną przeszkodę, która utrudnia Ci dobry wybór.',
    ],
  },
  {
    id: 'esencjalista',
    title: 'Esencjalista',
    source: 'Greg McKeown',
    category: 'Skupienie',
    durationMinutes: 13,
    description:
      'Lekcja o świadomym wybieraniu tego, co naprawdę ważne. Pomaga odcinać zadania, które zabierają energię, ale nie dają realnego postępu.',
    keyTakeaway:
      'Nie wszystko, co pilne, jest ważne. Przewaga często nie polega na robieniu więcej, tylko na odważnym rezygnowaniu z rzeczy drugorzędnych.',
    actionSteps: [
      'Wypisz trzy rzeczy, które dziś zabierają Ci uwagę.',
      'Wybierz jedną rzecz, której dzisiaj świadomie nie zrobisz.',
      'Zarezerwuj trzydzieści minut na zadanie, które realnie przesuwa Cię do przodu.',
    ],
  },
];

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const openLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setScreen('lesson');
  };

  return (
    <View style={styles.app}>
      <StatusBar style="light" />

      {screen === 'home' && (
        <HomeScreen
          featuredLesson={lessons[0]}
          onOpenLibrary={() => setScreen('library')}
          onOpenLesson={openLesson}
        />
      )}

      {screen === 'library' && (
        <LibraryScreen
          lessons={lessons}
          onBackHome={() => setScreen('home')}
          onOpenLesson={openLesson}
        />
      )}

      {screen === 'lesson' && selectedLesson && (
        <LessonDetailScreen
          lesson={selectedLesson}
          onBackLibrary={() => setScreen('library')}
        />
      )}
    </View>
  );
}

function HomeScreen({
  featuredLesson,
  onOpenLibrary,
  onOpenLesson,
}: {
  featuredLesson: Lesson;
  onOpenLibrary: () => void;
  onOpenLesson: (lesson: Lesson) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.heroCard}>
        <Text style={styles.badge}>MVP 0.3
      </Text>

        <Text style={styles.title}>13 Minut Przewagi</Text>

        <Text style={styles.subtitle}>
          Krótkie lekcje audio z książek, podcastów i praktycznej wiedzy.
        </Text>

        <Text style={styles.description}>
          Nie tylko słuchasz. Wdrażasz. Po każdej lekcji dostajesz konkretny
          wniosek i trzy rzeczy do zrobienia.
        </Text>

        <AppButton label="Przejdź do biblioteki" onPress={onOpenLibrary} />

        <View style={styles.spacer24} />

        <SectionTitle title="Dzisiejsza przewaga" />

        <LessonCard lesson={featuredLesson} onPress={() => onOpenLesson(featuredLesson)} />
      </View>
    </ScrollView>
  );
}

function LibraryScreen({
  lessons,
  onBackHome,
  onOpenLesson,
}: {
  lessons: Lesson[];
  onBackHome: () => void;
  onOpenLesson: (lesson: Lesson) => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.contentCard}>
        <Text style={styles.screenTitle}>Biblioteka</Text>
        <Text style={styles.screenLead}>
          Wybierz lekcję, odsłuchaj najważniejsze idee i od razu przejdź do
          działania.
        </Text>

        <View style={styles.spacer16} />

        {lessons.map((lesson) => (
          <View key={lesson.id} style={styles.cardSpacing}>
            <LessonCard lesson={lesson} onPress={() => onOpenLesson(lesson)} />
          </View>
        ))}

        <View style={styles.spacer16} />

        <AppButton label="Wróć na start" onPress={onBackHome} secondary />
      </View>
    </ScrollView>
  );
}

function LessonDetailScreen({
  lesson,
  onBackLibrary,
}: {
  lesson: Lesson;
  onBackLibrary: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.contentCard}>
        <Text style={styles.badge}>{lesson.category}</Text>
        <Text style={styles.screenTitle}>{lesson.title}</Text>

        <Text style={styles.meta}>
          {lesson.source} • {lesson.durationMinutes} minut
        </Text>

        <Text style={styles.screenLead}>{lesson.description}</Text>

        <View style={styles.playerCard}>
          <Text style={styles.playerTitle}>Odtwarzacz audio</Text>
          <Text style={styles.playerTime}>00:00 / 13:00</Text>

          <Pressable style={styles.playButton}>
            <Text style={styles.playButtonText}>Odtwórz</Text>
          </Pressable>
        </View>

        <SectionTitle title="Najważniejszy wniosek" />
        <Text style={styles.bodyText}>{lesson.keyTakeaway}</Text>

        <View style={styles.spacer24} />

        <SectionTitle title="3 rzeczy do wdrożenia" />

        {lesson.actionSteps.map((step, index) => (
          <View key={step} style={styles.actionStep}>
            <Text style={styles.actionNumber}>{index + 1}</Text>
            <Text style={styles.actionText}>{step}</Text>
          </View>
        ))}

        <View style={styles.spacer16} />

        <AppButton label="Wróć do biblioteki" onPress={onBackLibrary} secondary />
      </View>
    </ScrollView>
  );
}

function AppButton({
  label,
  onPress,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={secondary ? styles.secondaryButton : styles.primaryButton}
    >
      <Text style={secondary ? styles.secondaryButtonText : styles.primaryButtonText}>
        {label}
      </Text>
    </Pressable>
  );
}

function LessonCard({
  lesson,
  onPress,
}: {
  lesson: Lesson;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.lessonCard}>
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonCategory}>{lesson.category}</Text>
        <Text style={styles.lessonDuration}>{lesson.durationMinutes} min</Text>
      </View>

      <Text style={styles.lessonTitle}>{lesson.title}</Text>
      <Text style={styles.lessonSource}>{lesson.source}</Text>
      <Text style={styles.lessonDescription}>{lesson.description}</Text>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  page: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heroCard: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  contentCard: {
    width: '100%',
    maxWidth: 720,
    backgroundColor: '#111827',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    color: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
    marginBottom: 16,
  },
  subtitle: {
    color: '#CBD5E1',
    fontSize: 20,
    lineHeight: 30,
    marginBottom: 18,
  },
  description: {
    color: '#94A3B8',
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 28,
  },
  screenTitle: {
    color: '#F8FAFC',
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: 12,
  },
  screenLead: {
    color: '#CBD5E1',
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 16,
  },
  meta: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 18,
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 17,
    lineHeight: 27,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 21,
    fontWeight: '900',
    marginBottom: 12,
  },
  lessonCard: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 22,
    padding: 20,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lessonCategory: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  lessonDuration: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  lessonTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
  },
  lessonSource: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  lessonDescription: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 23,
  },
  playerCard: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 22,
    padding: 20,
    marginTop: 8,
    marginBottom: 28,
  },
  playerTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  playerTime: {
    color: '#CBD5E1',
    fontSize: 16,
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  playButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  actionStep: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  actionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F59E0B',
    color: '#111827',
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '900',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 23,
  },
  primaryButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#475569',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  spacer16: {
    height: 16,
  },
  spacer24: {
    height: 24,
  },
  cardSpacing: {
    marginBottom: 14,
  },
});