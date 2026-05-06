import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { resolvePublicId } from '@/storage/pets/pet-helpers';
import { routes } from '@/routes';
import { formatReportStatus, reportStatusBadgeClass } from '@/lib/formatters';
import { ReportDecisionModal } from './ReportDecisionModal';
import { Report } from '@/Models/Report';

export function ReportsTab() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [decisionModalData, setDecisionModalData] = useState<Report | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await api.get('/admin/reports');
      setReports(response.data ?? []);
    } catch (_error) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const resolveReport = async (
    reportId: string,
    status: 'APPROVED' | 'REJECTED',
    blockPet = false,
  ) => {
    try {
      setIsSubmittingDecision(true);
      await api.post(`/admin/reports/${reportId}/resolve`, { status, blockPet });
      fetchReports();
    } catch (_error) {
      /* empty */
    } finally {
      setIsSubmittingDecision(false);
      setDecisionModalData(null);
    }
  };

  if (loading) return <div>Carregando denúncias...</div>;

  return (
    <div className="space-y-4">
      {reports.length === 0 && (
        <p className="text-gray-500 text-center py-8">Nenhuma denúncia encontrada.</p>
      )}
      {reports.map((report) => (
        <div
          key={report.id}
          className={`p-4 border rounded-lg ${report.status === 'PENDING' ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-5 w-5 ${report.status === 'PENDING' ? 'text-amber-500' : 'text-gray-400'}`}
              />
              <span className="font-bold text-gray-900">Denúncia de {report.targetType}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${reportStatusBadgeClass(report.status)}`}
              >
                {formatReportStatus(report.status)}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(report.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            <span className="font-semibold text-gray-900">Motivo:</span> {report.reason}
          </p>

          {report.targetType === 'PET' && (
            <div className="mb-3">
              <a
                href={routes.pets.detail.build(resolvePublicId(report.targetId))}
                className="text-sm text-blue-600 hover:underline"
              >
                Ver pet
              </a>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Reportado por: {report.reporter?.fullName}</p>
            {report.status === 'PENDING' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setDecisionModalData(report)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-800"
                >
                  <CheckCircle className="h-4 w-4" />
                  Validar
                </button>
              </div>
            ) : (
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Resolvido por {report.resolvedBy?.fullName}
              </p>
            )}
          </div>
        </div>
      ))}

      {decisionModalData && (
        <ReportDecisionModal
          key={decisionModalData.id}
          modalData={{
            id: decisionModalData.id,
            petName: decisionModalData.petName,
            targetType: decisionModalData.targetType,
          }}
          isSubmitting={isSubmittingDecision}
          onCancel={() => setDecisionModalData(null)}
          onConfirm={(status, blockPet) => resolveReport(decisionModalData.id, status, blockPet)}
        />
      )}
    </div>
  );
}
