import { useState } from 'react';import { AnimatePresence, motion } from 'framer-motion';
import PatientInputScreen from './components/screens/PatientInputScreen';
import AIProcessingScreen from './components/screens/AIProcessingScreen';
import DSDResultsScreen from './components/screens/DSDResultsScreen';
import TDPSResultsScreen from './components/screens/TDPSResultsScreen';
import SHAPExplainabilityScreen from './components/screens/SHAPExplainabilityScreen';
import ClinicianValidationScreen from './components/screens/ClinicianValidationScreen';
import type { PatientData, PredictionData, Screen } from './types';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('input');
  const [patientData, setPatientData] = useState<PatientData>({
    name: 'R. Manikanta',
    age: 27,
    sex: 'Male',
    skeletalClass: 'Class I',
    molarRelation: 'Class II',
    canineRelation: 'Class II',
    growthPattern: 'Horizontal',
    overjet: 3,
    overbite: 25,
    anb: 4,
    u1na: 34,
    l1nb: 45,
    interincisalAngle: 98,
    tongueThrustHabit: true,
    scissorBite: true,
  });

  const predictionData: PredictionData = {
    dsdPredictions: [
      { label: 'Class I Malocclusion', confidence: 94 },
      { label: 'Class II Division 1', confidence: 88 },
      { label: 'Horizontal Growth Pattern', confidence: 89 },
      { label: 'Non-Extraction Treatment', confidence: 72 },
    ],
    tdpsDuration: '18-24',
    tdpsFactors: [
      'Adult Patient',
      'Tongue Thrust Habit',
      'Scissor Bite',
      'Gingivitis',
      'Detailed Finishing Mechanics',
    ],
    shapFeatures: [
      { feature: 'U1-NA Angle', importance: 28 },
      { feature: 'ANB Angle', importance: 24 },
      { feature: 'Tongue Thrust Habit', importance: 18 },
      { feature: 'Interincisal Angle', importance: 15 },
      { feature: 'Growth Pattern', importance: 10 },
      { feature: 'Scissor Bite', importance: 5 },
    ],
  };

  const screenVariants = {
    initial: { opacity: 0, y: 18, scale: 0.995 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -18, scale: 0.995 },
  };

  const handleContinue = (nextScreen: Screen) => {
    setCurrentScreen(nextScreen);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#0B1120] text-slate-50">
      <AnimatePresence initial={false} mode="wait">
        {currentScreen === 'input' && (
          <motion.div
            key="input"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
          >
            <PatientInputScreen
              patientData={patientData}
              setPatientData={setPatientData}
              onRunAnalysis={() => setCurrentScreen('processing')}
            />
          </motion.div>
        )}

        {currentScreen === 'processing' && (
          <motion.div
            key="processing"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
          >
            <AIProcessingScreen onComplete={() => handleContinue('dsd')} />
          </motion.div>
        )}

        {currentScreen === 'dsd' && (
          <motion.div
            key="dsd"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
          >
            <DSDResultsScreen
              predictions={predictionData.dsdPredictions}
              onContinue={() => handleContinue('tdps')}
            />
          </motion.div>
        )}

        {currentScreen === 'tdps' && (
          <motion.div
            key="tdps"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
          >
            <TDPSResultsScreen
              duration={predictionData.tdpsDuration}
              factors={predictionData.tdpsFactors}
              onContinue={() => handleContinue('shap')}
            />
          </motion.div>
        )}

        {currentScreen === 'shap' && (
          <motion.div
            key="shap"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
          >
            <SHAPExplainabilityScreen
              features={predictionData.shapFeatures}
              onContinue={() => handleContinue('clinician')}
            />
          </motion.div>
        )}

        {currentScreen === 'clinician' && (
          <motion.div
            key="clinician"
            variants={screenVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
          >
            <ClinicianValidationScreen
              patientData={patientData}
              predictions={predictionData}
              onRestart={() => setCurrentScreen('input')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
