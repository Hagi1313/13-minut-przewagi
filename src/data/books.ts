export type PracticalLesson = {
    title: string;
    description: string;
  };
  
  export type Book = {
    id: string;
    title: string;
    author: string;
    categories: string[];
    durationMinutes: number;
    description: string;
    bookSummaryTitle: string;
    bookSummaryDescription: string;
    practicalLessonsTitle: string;
    practicalLessons: PracticalLesson[];
    coverTitle: string;
    coverSubtitle: string;
    coverColor: string;
coverImage?: string;
    isFeatured?: boolean;
    isNew?: boolean;
    isCompleted?: boolean;
    progressPercent?: number;
  };
  
  export const userName = 'Łukasz';
  
  export const categories = [
    'Motywacja',
    'Finanse i inwestowanie',
    'Rozwój osobisty',
    'Przedsiębiorczość',
    'Kariera i sukces',
    'Psychologia',
    'Produktywność',
    'Nawyki',
    'Zdrowie i odżywianie',
    'Rodzicielstwo',
    'Uważność i szczęście',
    'Marketing i sprzedaż',
    'Zarządzanie i przywództwo',
    'Relacje',
    'Umiejętności komunikacyjne',
  ];
  
  export const books: Book[] = [
    {
      id: 'jak-zdobyc-przyjaciol',
      title: 'Jak zdobyć przyjaciół i zjednać sobie ludzi',
      author: 'Dale Carnegie',
      categories: ['Relacje', 'Umiejętności komunikacyjne', 'Kariera i sukces'],
      durationMinutes: 13,
      description:
        'Klasyczna książka o relacjach, rozmowie, wpływie i budowaniu sympatii bez manipulacji.',
      bookSummaryTitle: '13 minut książki',
      bookSummaryDescription:
        'Najważniejsze idee z książki w krótkiej lekcji audio. Słuchasz, rozumiesz główny sens i od razu przechodzisz do praktyki.',
      practicalLessonsTitle:
        'Praktyczne lekcje z książki „Jak zdobyć przyjaciół i zjednać sobie ludzi”',
      practicalLessons: [
        {
          title: 'Jak rozmawiać bez krytykowania',
          description:
            'Zamiast zaczynać od błędu drugiej osoby, zacznij od zrozumienia jej intencji i sytuacji.',
        },
        {
          title: 'Jak sprawić, żeby druga osoba poczuła się ważna',
          description:
            'Użyj szczerego uznania, konkretnego pytania i aktywnego słuchania, zanim przejdziesz do własnego celu.',
        },
        {
          title: 'Jak przekonywać bez nacisku',
          description:
            'Prowadź rozmowę tak, żeby druga osoba sama zobaczyła korzyść, zamiast czuła się przepychana do decyzji.',
        },
      ],
      coverTitle: 'Jak zdobyć przyjaciół',
      coverSubtitle: 'i zjednać sobie ludzi',
      coverColor: '#F4C2D2',
      coverImage: 'carnegie.png',
      isFeatured: true,
      progressPercent: 45,
    },
    {
      id: 'potega-nawyku',
      title: 'Potęga nawyku',
      author: 'Charles Duhigg',
      categories: ['Nawyki', 'Produktywność', 'Psychologia'],
      durationMinutes: 13,
      description:
        'Książka o tym, jak działają nawyki i dlaczego tak trudno je zmienić samą silną wolą.',
      bookSummaryTitle: '13 minut książki',
      bookSummaryDescription:
        'Krótka lekcja audio o pętli nawyku: sygnale, rutynie i nagrodzie.',
      practicalLessonsTitle: 'Praktyczne lekcje z książki „Potęga nawyku”',
      practicalLessons: [
        {
          title: 'Jak rozpoznać sygnał nawyku',
          description:
            'Zapisz, kiedy pojawia się nawyk: pora dnia, emocja, miejsce, osoba albo konkretna sytuacja.',
        },
        {
          title: 'Jak podmienić rutynę',
          description:
            'Nie walcz z całym nawykiem. Zostaw sygnał i nagrodę, ale zmień zachowanie pośrodku.',
        },
        {
          title: 'Jak utrwalić nowy schemat',
          description:
            'Ustaw prostą nagrodę po wykonaniu nowej rutyny, żeby mózg miał powód, aby ją powtarzać.',
        },
      ],
      coverTitle: 'Potęga',
      coverSubtitle: 'nawyku',
      coverImage: 'potega-nawyku.png',
      coverColor: '#E8F1D8',
      isNew: true,
      progressPercent: 20,
    },
    {
      id: 'atomowe-nawyki',
      title: 'Atomowe nawyki',
      author: 'James Clear',
      categories: ['Produktywność', 'Rozwój osobisty', 'Nawyki'],
      durationMinutes: 13,
      description:
        'Książka o małych zmianach, które z czasem dają bardzo duże efekty.',
      bookSummaryTitle: '13 minut książki',
      bookSummaryDescription:
        'Najważniejsze zasady budowania systemów, które pomagają działać bez ciągłego polegania na motywacji.',
      practicalLessonsTitle: 'Praktyczne lekcje z książki „Atomowe nawyki”',
      practicalLessons: [
        {
          title: 'Jak zacząć od dwóch minut',
          description:
            'Zmniejsz pierwszy krok tak bardzo, żeby nie dało się powiedzieć, że nie masz czasu.',
        },
        {
          title: 'Jak zaprojektować otoczenie',
          description:
            'Ułatw dobre zachowanie i utrudnij złe. Środowisko ma pracować za Ciebie.',
        },
        {
          title: 'Jak połączyć nowy nawyk ze starym',
          description:
            'Podepnij nowy nawyk pod czynność, którą i tak robisz codziennie.',
        },
      ],
      coverTitle: 'Atomowe',
      coverSubtitle: 'nawyki',
      coverColor: '#D7E6FF',
      isCompleted: true,
    },
    {
      id: 'esencjalista',
      title: 'Esencjalista',
      author: 'Greg McKeown',
      categories: ['Produktywność', 'Rozwój osobisty', 'Kariera i sukces'],
      durationMinutes: 13,
      description:
        'Książka o wybieraniu tego, co naprawdę ważne, i odcinaniu zadań drugorzędnych.',
      bookSummaryTitle: '13 minut książki',
      bookSummaryDescription:
        'Krótka lekcja audio o skupieniu, rezygnacji i robieniu mniej, ale lepiej.',
      practicalLessonsTitle: 'Praktyczne lekcje z książki „Esencjalista”',
      practicalLessons: [
        {
          title: 'Jak wybrać jedną rzecz najważniejszą',
          description:
            'Zamiast pytać, co jeszcze możesz zrobić, zapytaj, co naprawdę przesuwa Cię do przodu.',
        },
        {
          title: 'Jak powiedzieć nie bez poczucia winy',
          description:
            'Oddziel odmowę zadania od relacji z człowiekiem. Możesz szanować osobę i nie przyjąć zadania.',
        },
        {
          title: 'Jak odzyskać czas na pracę głęboką',
          description:
            'Zarezerwuj blok czasu na najważniejszą rzecz i chroń go jak spotkanie z klientem.',
        },
      ],
      coverTitle: 'Esencjalista',
      coverSubtitle: 'mniej, ale lepiej',
      coverColor: '#E6E2F4',
      isNew: true,
    },
  ];