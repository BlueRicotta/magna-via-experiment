import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

import { SplashScreen } from './screens/SplashScreen';
import { OracleIntroScreen } from './screens/OracleIntroScreen';
import { BiodataScreen } from './screens/BiodataScreen';
import { HobbyCardsScreen } from './screens/HobbyCardsScreen';
import { BirthStarScreen } from './screens/BirthStarScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultRevealScreen } from './screens/ResultRevealScreen';
import { ClassResultScreen } from './screens/ClassResultScreen';
import { CenayangChatScreen } from './screens/CenayangChatScreen';
import { applyPersonalizationBonuses, resultFromScores } from './data/results';
import { submitAssessment } from './services/api';
import { colors, fonts } from './theme/tokens';

export default function App() {
  const [route, setRoute] = useState('splash');
  const [appState, setAppState] = useState({
    user: {},
    hobbyCards: [],
    birthStar: null,
    quizAnswers: {},
    quizScores: null,
    classId: null,
    assessmentId: null,
  });
  const [submission, setSubmission] = useState({
    loading: false,
    error: '',
  });
  const [fontsLoaded] = useFonts({
    Cinzel: require('@expo-google-fonts/cinzel/400Regular/Cinzel_400Regular.ttf'),
    CinzelSemiBold: require('@expo-google-fonts/cinzel/600SemiBold/Cinzel_600SemiBold.ttf'),
    CinzelBold: require('@expo-google-fonts/cinzel/700Bold/Cinzel_700Bold.ttf'),
    CrimsonText: require('../assets/fonts/CrimsonText-Regular.ttf'),
    CrimsonTextItalic: require('../assets/fonts/CrimsonText-Italic.ttf'),
    CrimsonTextSemiBold: require('../assets/fonts/CrimsonText-SemiBold.ttf'),
    CrimsonTextBold: require('../assets/fonts/CrimsonText-Bold.ttf'),
    Nunito_400Regular: require('@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf'),
    Nunito_500Medium: require('@expo-google-fonts/nunito/500Medium/Nunito_500Medium.ttf'),
    Nunito_600SemiBold: require('@expo-google-fonts/nunito/600SemiBold/Nunito_600SemiBold.ttf'),
    Nunito_700Bold: require('@expo-google-fonts/nunito/700Bold/Nunito_700Bold.ttf'),
  });

  const handleLaunch = useCallback(() => {
    setRoute('oracle-intro');
  }, []);

  const handleIntroBack = useCallback(() => {
    setRoute('splash');
  }, []);

  const handleIntroDone = useCallback(() => {
    setRoute('biodata');
  }, []);

  const handleBiodataBack = useCallback(() => {
    setRoute('oracle-intro');
  }, []);

  const handleBiodataDone = useCallback((user) => {
    setAppState((current) => ({ ...current, user }));
    setRoute('hobby');
  }, []);

  const handleHobbyBack = useCallback(() => {
    setRoute('biodata');
  }, []);

  const handleHobbyDone = useCallback((hobbyCards) => {
    setAppState((current) => ({ ...current, hobbyCards }));
    setRoute('birthstar');
  }, []);

  const handleBirthStarBack = useCallback(() => {
    setRoute('hobby');
  }, []);

  const handleBirthStarDone = useCallback((birthStar) => {
    setAppState((current) => ({ ...current, birthStar }));
    setRoute('quiz');
  }, []);

  const handleQuizBack = useCallback(() => {
    if (submission.loading) return;
    setRoute('birthstar');
  }, [submission.loading]);

  const handleQuizDone = useCallback(async ({ answers, scores }) => {
    if (submission.loading) return;

    setSubmission({ loading: true, error: '' });
    try {
      const assessment = await submitAssessment({
        user: appState.user,
        hobbyCards: appState.hobbyCards,
        birthStar: appState.birthStar,
        quizAnswers: answers,
      });
      const fallbackScores = applyPersonalizationBonuses(
        scores,
        appState.hobbyCards,
        appState.birthStar,
      );
      const fallback = resultFromScores(fallbackScores);
      setAppState((current) => ({
        ...current,
        quizAnswers: answers,
        quizScores: assessment.scores || fallbackScores,
        classId: assessment.result?.id || fallback.klass.id,
        assessmentId: assessment.id || null,
      }));
      setRoute('reveal');
    } catch (error) {
      setSubmission({
        loading: false,
        error: error?.message || 'Gagal menyimpan perjalananmu. Coba lagi.',
      });
      return;
    }
    setSubmission({ loading: false, error: '' });
  }, [appState.birthStar, appState.hobbyCards, appState.user, submission.loading]);

  const handleRevealDone = useCallback(() => {
    setRoute('result');
  }, []);

  const handleResultBack = useCallback(() => {
    setRoute('reveal');
  }, []);

  const handleResultChat = useCallback(() => {
    setRoute('chat');
  }, []);

  const handleRestart = useCallback(() => {
    setAppState({
      user: {},
      hobbyCards: [],
      birthStar: null,
      quizAnswers: {},
      quizScores: null,
      classId: null,
      assessmentId: null,
    });
    setSubmission({ loading: false, error: '' });
    setRoute('splash');
  }, []);

  const handleChatBack = useCallback(() => {
    setRoute('result');
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.loading} />;
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      {route === 'splash' ? (
        <SplashScreen onLaunch={handleLaunch} />
      ) : route === 'oracle-intro' ? (
        <OracleIntroScreen onBack={handleIntroBack} onDone={handleIntroDone} />
      ) : route === 'biodata' ? (
        <BiodataScreen
          user={appState.user}
          onBack={handleBiodataBack}
          onDone={handleBiodataDone}
        />
      ) : route === 'hobby' ? (
        <HobbyCardsScreen
          selectedCards={appState.hobbyCards}
          onBack={handleHobbyBack}
          onDone={handleHobbyDone}
        />
      ) : route === 'birthstar' ? (
        <BirthStarScreen
          value={appState.birthStar}
          onBack={handleBirthStarBack}
          onDone={handleBirthStarDone}
        />
      ) : route === 'quiz' ? (
        <QuizScreen
          savedAnswers={appState.quizAnswers}
          submitting={submission.loading}
          submitError={submission.error}
          onBack={handleQuizBack}
          onDone={handleQuizDone}
        />
      ) : route === 'reveal' ? (
        <ResultRevealScreen onDone={handleRevealDone} />
      ) : route === 'result' ? (
        <ClassResultScreen
          scores={appState.quizScores}
          onBack={handleResultBack}
          onChat={handleResultChat}
          onRestart={handleRestart}
        />
      ) : route === 'chat' ? (
        <CenayangChatScreen
          scores={appState.quizScores}
          classId={appState.classId}
          onBack={handleChatBack}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderEyebrow}>MAGNA VIA</Text>
          <Text style={styles.placeholderTitle}>Route Not Found</Text>
          <Text style={styles.placeholderCopy}>The stars lost this path for a moment.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  loading: {
    flex: 1,
    backgroundColor: '#050509',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: colors.bgPrimary,
  },
  placeholderEyebrow: {
    color: colors.textMuted,
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    letterSpacing: 3,
  },
  placeholderTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 30,
    letterSpacing: 1.2,
  },
  placeholderCopy: {
    color: colors.textSecondary,
    fontFamily: fonts.oracleItalic,
    fontSize: 18,
    textAlign: 'center',
  },
});
