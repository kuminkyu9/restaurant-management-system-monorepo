import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';

const App: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [counter, setCounter] = useState<number>(0);

  const handlePress = (): void => {
    Alert.alert('안녕하세요!', `${name}님, 카운터: ${counter}`);
  };

  const incrementCounter = (): void => {
    setCounter(counter + 1);
  };

  const resetCounter = (): void => {
    setCounter(0);
    setName('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>React Native 앱</Text>
          <Text style={styles.subtitle}>기본 컴포넌트 예제</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: 'https://reactnative.dev/img/tiny_logo.png',
            }}
            style={styles.logo}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>사용자 정보</Text>
          <TextInput
            style={styles.textInput}
            placeholder="이름을 입력하세요"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>카운터</Text>
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>{counter}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={incrementCounter}>
                <Text style={styles.buttonText}>+1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={resetCounter}>
                <Text style={[styles.buttonText, styles.resetButtonText]}>초기화</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handlePress}>
          <Text style={styles.primaryButtonText}>인사하기</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>앱 정보</Text>
          <Text style={styles.infoText}>• React Native + TypeScript</Text>
          <Text style={styles.infoText}>• useState 상태 관리</Text>
          <Text style={styles.infoText}>• 터치 이벤트 처리</Text>
          <Text style={styles.infoText}>• 스타일링 예제</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  counterContainer: {
    alignItems: 'center',
  },
  counterText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#FF3B30',
  },
  resetButtonText: {
    color: 'white',
  },
  primaryButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
});

export default App;