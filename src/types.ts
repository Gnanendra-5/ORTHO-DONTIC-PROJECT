export type Screen = 'input' | 'processing' | 'dsd' | 'tdps' | 'shap' | 'clinician';

export interface PatientData {
  name: string;
  age: number;
  sex: 'Male' | 'Female';
  skeletalClass: string;
  molarRelation: string;
  canineRelation: string;
  growthPattern: string;
  overjet: number;
  overbite: number;
  anb: number;
  u1na: number;
  l1nb: number;
  interincisalAngle: number;
  tongueThrustHabit: boolean;
  scissorBite: boolean;
}

export interface DSDPrediction {
  label: string;
  confidence: number;
}

export interface ShapFeature {
  feature: string;
  importance: number;
}

export interface PredictionData {
  dsdPredictions: DSDPrediction[];
  tdpsDuration: string;
  tdpsFactors: string[];
  shapFeatures: ShapFeature[];
}
