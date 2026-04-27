import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';

import { SplashScreen } from './screens/SplashScreen';
import { OracleIntroScreen } from './screens/OracleIntroScreen';
import { BiodataScreen } from './screens/BiodataScreen';
import { HobbyCardsScreen } from './screens/HobbyCardsScreen';
import { BirthStarScreen } from './screens/BirthStarScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultRevealScreen } from './screens/ResultRevealScreen';
import { ClassResultScreen } from './screens/ClassResultScreen';
import { CenayangChatScreen } from './screens/CenayangChatScreen';
import { resultFromScores } from './data/results';
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
  });
  const [fontsLoaded] = useFonts({
    Cinzel: require('../assets/fonts/Cinzel-VariableFont_wght.ttf'),
    CrimsonText: require('../assets/fonts/CrimsonText-Regular.ttf'),
    CrimsonTextItalic: require('../assets/fonts/CrimsonText-Italic.ttf'),
    CrimsonTextSemiBold: require('../assets/fonts/CrimsonText-SemiBold.ttf'),
    CrimsonTextBold: require('../assets/fonts/CrimsonText-Bold.ttf'),
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
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
    setRoute('birthstar');
  }, []);

  const handleQuizDone = useCallback(({ answers, scores }) => {
    const result = resultFromScores(scores);
    setAppState((current) => ({
      ...current,
      quizAnswers: answers,
      quizScores: scores,
      classId: result.klass.id,
    }));
    setRoute('reveal');
  }, []);

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
    });
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
