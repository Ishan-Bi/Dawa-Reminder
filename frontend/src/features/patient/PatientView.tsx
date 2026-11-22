import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Dose } from '@/types';
import { apiRequest } from '@/lib/api';
import { Check, X, Volume2, Globe2, ShieldCheck, Heart, AlertCircle } from 'lucide-react';

interface PatientTodayData {
  patient: {
    id: number;
    name: string;
    preferred_language: 'en' | 'hi';
  };
  doses: Dose[];
  date: string;
}

export function PatientView() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PatientTodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'hi' | 'en'>('hi');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchTodayDoses = async () => {
    if (!token) return;
    try {
      const res = await apiRequest<PatientTodayData>(`/p/${token}/today`);
      setData(res);
      setLang(res.patient.preferred_language || 'hi');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired link. Please ask your family member for a new link.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayDoses();
  }, [token]);

  // Voice synthesis read-out helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAction = async (dose: Dose, action: 'taken' | 'skipped') => {
    if (!token) return;
    setActionLoadingId(dose.id);
    try {
      await apiRequest(`/p/${token}/doses/${dose.id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({
          client_event_id: `cli_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        }),
      });

      const message =
        action === 'taken'
          ? lang === 'hi'
            ? `${dose.medication_name} ले ली गई है। बहुत बढ़िया!`
            : `${dose.medication_name} marked as taken. Well done!`
          : lang === 'hi'
          ? `${dose.medication_name} छोड़ दी गई है।`
          : `${dose.medication_name} skipped.`;

      setSuccessMessage(message);
      speakText(message);
      fetchTodayDoses();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to record dose action');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <div className="w-16 h-16 border-4 border-[#167C53] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-2xl font-bold text-gray-800">
            {lang === 'hi' ? 'दवाइयाँ लोड हो रही हैं...' : 'Loading your medicines...'}
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-red-200 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">
            {lang === 'hi' ? 'लिंक अमान्य है' : 'Link Invalid or Expired'}
          </h2>
          <p className="text-base text-gray-600">{error}</p>
          <p className="text-sm text-gray-500">
            {lang === 'hi'
              ? 'कृपया अपने परिवार के सदस्य (केयरगिवर) से नया लिंक मांगें।'
              : 'Please request an updated access link from your caregiver.'}
          </p>
        </div>
      </main>
    );
  }

  // Translations
  const t = {
    hi: {
      greeting: `नमस्ते, ${data.patient.name} जी 🙏`,
      title: 'आज की दवाइयाँ',
      empty: 'आज के लिए कोई दवाई बाकी नहीं है। आप स्वस्थ रहें!',
      beforeFood: 'खाना खाने से पहले',
      afterFood: 'खाना खाने के बाद',
      anyFood: 'किसी भी समय',
      takenBtn: 'दवाई ले ली',
      skipBtn: 'छोड़ दी',
      alreadyTaken: 'ले ली गई ✅',
      alreadySkipped: 'छोड़ दी गई',
      speakBtn: 'बोलकर बताएं',
      disclaimer: 'यह एक रिमाइंडर टूल है, चिकित्सकीय सलाह नहीं।',
    },
    en: {
      greeting: `Hello, ${data.patient.name} 🙏`,
      title: "Today's Medicines",
      empty: 'No medicines remaining for today. Stay healthy!',
      beforeFood: 'Before food',
      afterFood: 'After food',
      anyFood: 'Any time',
      takenBtn: 'I Took This',
      skipBtn: 'Skip',
      alreadyTaken: 'Taken ✅',
      alreadySkipped: 'Skipped',
      speakBtn: 'Read Aloud',
      disclaimer: 'This is a reminder tool, not medical advice.',
    },
  }[lang];

  return (
    <div className="min-h-screen bg-[#F8FAF9] text-[#202824] flex flex-col justify-between p-4 sm:p-8 max-w-2xl mx-auto">
      {/* Top Header */}
      <header className="py-4 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#167C53] flex items-center justify-center text-white font-black text-2xl shadow-sm">
            द
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">DawaReminder</h1>
            <p className="text-sm font-semibold text-[#167C53]">{t.greeting}</p>
          </div>
        </div>

        {/* Hindi / English Toggle Button */}
        <button
          onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-2xl text-sm font-bold text-gray-800 hover:bg-gray-50 shadow-2xs"
        >
          <Globe2 className="w-4 h-4 text-[#167C53]" />
          <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </header>

      {/* Floating Success Banner */}
      {successMessage && (
        <div className="my-4 p-5 bg-[#E6F9F0] border-2 border-[#167C53] rounded-2xl text-[#0E6245] flex items-center gap-3 animate-bounce">
          <ShieldCheck className="w-8 h-8 text-[#167C53] shrink-0" />
          <p className="text-xl font-bold">{successMessage}</p>
        </div>
      )}

      {/* Doses List — High Contrast, Large Type */}
      <main className="my-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {t.title}
          </h2>
          <span className="text-base font-bold text-gray-500 bg-white px-3 py-1 rounded-xl border">
            {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>

        {data.doses.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-gray-200 text-center space-y-3">
            <Heart className="w-16 h-16 text-[#167C53] mx-auto" />
            <p className="text-xl font-bold text-gray-800">{t.empty}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.doses.map((dose) => {
              const isTaken = dose.status === 'taken';
              const isSkipped = dose.status === 'skipped';
              const scheduledTime = new Date(dose.scheduled_at).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              const foodInstruction =
                dose.food_instruction === 'before_food'
                  ? t.beforeFood
                  : dose.food_instruction === 'after_food'
                  ? t.afterFood
                  : t.anyFood;

              return (
                <article
                  key={dose.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 border-2 transition shadow-sm space-y-6 ${
                    isTaken
                      ? 'border-[#167C53] bg-emerald-50/30'
                      : isSkipped
                      ? 'border-gray-300 opacity-60'
                      : 'border-gray-300 hover:border-[#167C53]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {dose.medication_photo ? (
                        <img
                          src={dose.medication_photo}
                          alt={dose.medication_name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-gray-200 shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#E9F5EF] text-[#167C53] flex items-center justify-center font-black text-3xl shrink-0">
                          द
                        </div>
                      )}
                      <div className="space-y-1">
                        <h3 className="text-2xl sm:text-3xl font-black text-gray-900">
                          {dose.medication_name}
                        </h3>
                        {dose.medication_strength && (
                          <p className="text-lg font-bold text-gray-600">
                            {dose.medication_strength}
                          </p>
                        )}
                        <p className="text-base font-semibold text-gray-500">
                          {dose.medication_instructions || '1 dose'}
                        </p>
                      </div>
                    </div>

                    {/* Voice Read-out Button */}
                    <button
                      onClick={() =>
                        speakText(
                          lang === 'hi'
                            ? `${scheduledTime} पर ${dose.medication_name} ${dose.medication_strength || ''}, ${foodInstruction}`
                            : `At ${scheduledTime}, take ${dose.medication_name} ${dose.medication_strength || ''}, ${foodInstruction}`
                        )
                      }
                      title={t.speakBtn}
                      className="p-3 bg-gray-100 hover:bg-[#E9F5EF] text-[#167C53] rounded-2xl shrink-0 transition"
                    >
                      <Volume2 className="w-7 h-7" />
                    </button>
                  </div>

                  {/* Badges: Time & Food instruction in large text */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-4 py-2 bg-[#F8FAF9] border-2 border-gray-200 text-gray-900 rounded-2xl text-lg font-black tracking-wide">
                      ⏰ {scheduledTime}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-2xl text-lg font-black border-2 ${
                        dose.food_instruction === 'before_food'
                          ? 'bg-[#FFF4D6] border-amber-300 text-[#B45309]'
                          : 'bg-[#E6F9F0] border-emerald-300 text-[#0E6245]'
                      }`}
                    >
                      🍲 {foodInstruction}
                    </span>
                  </div>

                  {/* Huge Action Buttons (48px+ Touch targets for elderly) */}
                  {isTaken ? (
                    <div className="w-full py-4 bg-[#E6F9F0] border-2 border-[#167C53] text-[#0E6245] rounded-2xl font-black text-2xl text-center flex items-center justify-center gap-2">
                      <Check className="w-8 h-8 stroke-[3]" />
                      <span>{t.alreadyTaken}</span>
                    </div>
                  ) : isSkipped ? (
                    <div className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-xl text-center">
                      {t.alreadySkipped}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <button
                        onClick={() => handleAction(dose, 'taken')}
                        disabled={actionLoadingId === dose.id}
                        className="min-h-16 py-4 bg-[#167C53] hover:bg-[#0D4E34] text-white rounded-2xl font-black text-xl sm:text-2xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
                      >
                        <Check className="w-7 h-7 stroke-[3]" />
                        <span>{t.takenBtn}</span>
                      </button>

                      <button
                        onClick={() => handleAction(dose, 'skipped')}
                        disabled={actionLoadingId === dose.id}
                        className="min-h-16 py-4 bg-white hover:bg-gray-100 border-2 border-gray-300 text-gray-700 rounded-2xl font-bold text-lg sm:text-xl flex items-center justify-center gap-2 transition active:scale-95"
                      >
                        <X className="w-6 h-6 stroke-[3]" />
                        <span>{t.skipBtn}</span>
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Reassuring Footer & Disclaimer */}
      <footer className="py-6 border-t border-gray-200 text-center text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700">{t.disclaimer}</p>
        <p>DawaReminder &copy; 2026 — Family configures. Elderly follows.</p>
      </footer>
    </div>
  );
}
