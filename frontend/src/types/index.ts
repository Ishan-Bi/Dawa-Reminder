export interface Caregiver {
  id: number;
  name: string;
  email: string;
}

export interface Patient {
  id: number;
  caregiver_id: number;
  name: string;
  age: number | null;
  preferred_language: 'en' | 'hi';
  notes: string | null;
  access_token: string;
  created_at: string;
}

export interface Schedule {
  id: number;
  medication_id: number;
  times: string[]; // ["08:00", "21:00"]
  food_instruction: 'before_food' | 'after_food' | 'any';
  start_date: string;
  end_date: string | null;
  active: boolean;
}

export interface Medication {
  id: number;
  patient_id: number;
  name: string;
  strength: string | null;
  dosage_instructions: string | null;
  purpose: string | null;
  photo_url: string | null;
  prescription_notes: string | null;
  active: boolean;
  created_at: string;
  schedules?: Schedule[];
}

export interface Dose {
  id: number;
  patient_id: number;
  medication_id: number;
  schedule_id: number;
  scheduled_at: string;
  status: 'pending' | 'taken' | 'skipped' | 'missed';
  acted_at: string | null;
  acted_by: 'patient' | 'caregiver' | null;
  client_event_id: string | null;
  medication_name?: string;
  medication_strength?: string;
  medication_instructions?: string;
  medication_purpose?: string;
  medication_photo?: string;
  food_instruction?: 'before_food' | 'after_food' | 'any';
}
