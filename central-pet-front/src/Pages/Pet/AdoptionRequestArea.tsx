import { useState } from 'react';
import { api } from '@/lib/api';
import { resolveBackendId } from '@/storage/pets';
import type { PetRegisterFormData } from '@/storage/pets';

interface AdoptionRequestAreaProps {
  petId?: string | undefined;
  formData: PetRegisterFormData;
  setDisplayMessage: (msg: string) => void;
}

export default function AdoptionRequestArea({
  petId,
  formData,
  setDisplayMessage,
}: AdoptionRequestAreaProps) {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendId = petId ? resolveBackendId(petId) : undefined;

  const handleSubmit = async () => {
    if (!backendId) {
      setError('ID do pet inválido');
      return;
    }

    // consentimento é obrigatório
    if (!consent) {
      setError(
        'É necessário autorizar o compartilhamento do seu contato para enviar a solicitação.',
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const resp = await api.post('/adoption-requests', {
        petId: String(backendId),
        message: message || undefined,
        adopterContactShareConsent: consent,
      });

      setDisplayMessage(resp.data?.message ?? 'Solicitação enviada com sucesso');
      setShowForm(false);
      setMessage('');
      setConsent(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {!showForm ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setShowForm(true)}
          >
            Solicitar Adoção
          </button>
          <p className="text-sm text-slate-600">
            Interessado? Envie uma solicitação ao tutor do pet.
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold">Enviar solicitação de adoção</h3>
          <textarea
            className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm"
            rows={4}
            placeholder={`Escreva uma breve mensagem para o tutor de ${formData.name} (opcional)`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 bg-white"
            />
            <span>
              Autorizo o compartilhamento do meu contato com o tutor/responsável pelo pet para que
              possam me contatar sobre a adoção.
            </span>
          </label>

          <p className="mt-2 text-sm text-slate-500">
            Não é necessário incluir seu contato na mensagem — o tutor utilizará as informações de
            contato cadastradas em sua conta na plataforma.
          </p>

          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
            </button>
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm"
              onClick={() => {
                setShowForm(false);
                setError(null);
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
