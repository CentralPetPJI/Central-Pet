import { routes } from '@/routes';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { SITE_NAME } from '@/lib/site-config.ts';

export default function TermsOfResponsibility() {
  const { currentUser, acceptTerms, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const needsAcceptance = isAuthenticated && currentUser && !currentUser.acceptedTermsAt;

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await acceptTerms();
      navigate(routes.home.path);
    } catch (_error) {
      alert('Ocorreu um erro ao aceitar os termos. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-2xl p-8 sm:p-12">
        <div className="mb-8 border-b border-slate-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest-brand text-primary-400">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            Termo de Responsabilidade e Privacidade
          </h1>
          <p className="mt-2 text-sm text-slate-500">Última atualização: 21 de abril de 2026</p>
        </div>

        <div className="space-y-6 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Bases Legais e Introdução</h2>
            <p>
              O {SITE_NAME} é uma plataforma{' '}
              <strong>totalmente gratuita e sem fins lucrativos</strong> que conecta pessoas e
              organizações para adoção e doação responsável. O tratamento de seus dados pessoais
              ocorre com base no seu <strong>consentimento</strong> e na{' '}
              <strong>execução dos serviços</strong> oferecidos pela plataforma.
            </p>
            <p className="mt-2">
              <strong>Capacidade Legal:</strong> O uso da plataforma é permitido apenas para maiores
              de 18 anos ou menores devidamente autorizados por seus responsáveis legais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Natureza Não Comercial</h2>
            <p>
              O {SITE_NAME} é um ecossistema dedicado exclusivamente à <strong>causa animal</strong>{' '}
              e à <strong>adoção responsável</strong>.
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-2 font-medium">
              <li>
                <span className="text-slate-900">Venda Proibida:</span> É estritamente proibido
                cobrar por animais, serviços ou realizar qualquer transação financeira através da
                plataforma.
              </li>
              <li>
                <span className="text-slate-900">Gratuidade:</span> O uso da plataforma é e sempre
                será gratuito para adotantes, protetores e organizações.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Uso e Proteção de Dados</h2>
            <p>Coletamos apenas informações necessárias para o processo de adoção. Seus dados:</p>
            <ul className="list-disc ml-6 mt-2 space-y-2 font-medium">
              <li>
                <span className="text-slate-900">Não são vendidos:</span> Nunca comercializamos suas
                informações.
              </li>
              <li>
                <span className="text-slate-900">Não são usados para IA:</span> Seus dados não são
                usados para treinamento de modelos de inteligência artificial.
              </li>
              <li>
                <span className="text-slate-900">Estão protegidos:</span> Adotamos medidas técnicas
                e administrativas para proteger seus dados contra acessos não autorizados e uso
                indevido.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              4. Compartilhamento e Responsabilidades
            </h2>
            <p>
              O compartilhamento de contato (telefone/e-mail) entre usuários **somente ocorre com
              consentimento expresso** de ambas as partes.
            </p>
            <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm">
              <p>
                <strong>Limitação de Responsabilidade:</strong> O {SITE_NAME} atua como
                intermediário. Não garantimos a conduta dos usuários ou a veracidade de informações
                fornecidas por terceiros. A responsabilidade pelo bem-estar do animal e pela
                veracidade dos dados informados é dos respectivos usuários.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Seus Direitos</h2>
            <p>Você possui controle total sobre seus dados e pode solicitar a qualquer momento:</p>
            <ul className="list-disc ml-6 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              <li>Acesso e confirmação de tratamento.</li>
              <li>Correção de dados incompletos.</li>
              <li>Eliminação de dados pessoais.</li>
              <li>Revogação do consentimento.</li>
              <li>Anonimização de dados desnecessários.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              6. Retenção, Contato e Atualizações
            </h2>
            <p>
              <strong>Retenção:</strong> Após a desativação da conta, os dados são mantidos por 90
              dias para fins de auditoria e segurança em processos concluídos, antes da exclusão
              permanente.
            </p>
            <p className="mt-2">
              <strong>Contato:</strong> Para exercer seus direitos, envie um e-mail para{' '}
              <span className="font-bold text-primary-400">central.pet.adote@gmail.com</span>.
            </p>
            <p className="mt-2 text-sm text-slate-500 italic">
              Este termo pode ser atualizado. Mudanças significativas serão comunicadas por e-mail e
              notificadas em seu próximo acesso.
            </p>
          </section>

          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {needsAcceptance
                ? 'Para continuar utilizando a plataforma, você precisa aceitar os novos termos.'
                : 'Dúvidas sobre nossa política? Entre em contato conosco.'}
            </p>
            <div className="flex gap-3">
              {needsAcceptance ? (
                <button
                  onClick={handleAccept}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-sm font-bold text-slate-900 transition hover:bg-primary-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Aceitando...' : 'Li e aceito os termos'}
                </button>
              ) : (
                <Link
                  to={isAuthenticated ? routes.home.path : routes.register.path}
                  className="px-6 py-2.5 rounded-xl bg-primary text-sm font-bold text-slate-900 transition hover:bg-primary-600"
                >
                  {isAuthenticated ? 'Voltar ao Início' : 'Voltar ao Cadastro'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
