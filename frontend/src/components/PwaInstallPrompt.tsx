import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!installEvent || dismissed || installed) return null;

  const install = async () => {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallEvent(null);
  };

  return (
    <aside aria-label="Install DawaReminder" className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-xl sm:inset-x-auto sm:right-5">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-[#167C53]">
        <Download aria-hidden="true" className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-gray-900">Install DawaReminder</p>
        <p className="text-sm text-gray-600">Add it to your home screen for quick access.</p>
      </div>
      <Button type="button" onClick={install} className="min-h-11 shrink-0 px-4">Install</Button>
      <button type="button" aria-label="Dismiss install prompt" onClick={() => setDismissed(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-gray-500 hover:bg-gray-100">
        <X aria-hidden="true" className="h-5 w-5" />
      </button>
    </aside>
  );
}
