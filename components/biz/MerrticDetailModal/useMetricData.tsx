import { ReactNode, useCallback, useMemo, useState } from 'react';

import { ALL_METRICS } from '@/constants/metrics';

// Metric data mapping based on the documentation
const METRIC_DATA: Record<string, { title: string; content: ReactNode }> = {
  [ALL_METRICS.COMMUNITY_ACCEPTANCE]: {
    title: ALL_METRICS.COMMUNITY_ACCEPTANCE,
    content: (
      <div>
        <p>
          Refers to the extent to which a project or decision is publicly
          endorsed or recognized by its broader community or ecosystem.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          When a protocol's roadmap or leadership is supported by signatures,
          endorsements, or integrations from other major DAOs or developer
          communities, it reflects acceptance. A multisig wallet signatory list
          that includes respected figures in the space also signals this
          legitimacy.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.COMMUNITY_PARTICIPATION]: {
    title: ALL_METRICS.COMMUNITY_PARTICIPATION,
    content: (
      <div>
        <p>
          Measures whether the community can actively contribute to or influence
          the development, governance, or use of the system.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          If a project's governance allows token holders to submit and vote on
          proposals, or contributors can co-edit documentation and reports via
          tools like GitHub or Aragon, this Item demonstrates participatory
          legitimacy. The presence of open contribution paths is a key signal.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.LEGITIMACY_BY_CONTINUITY]: {
    title: ALL_METRICS.LEGITIMACY_BY_CONTINUITY,
    content: (
      <div>
        <p>
          Refers to sustained operation, presence, or historical consistency of
          a project, team, or mechanism over time.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          A core team or multisig that has remained unchanged and active over
          several years signals stability. Audit histories, grant rounds, or
          treasury reports dating back multiple years also provide proof of
          continuity-based legitimacy.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.LEGITIMACY_BY_PROCESS]: {
    title: ALL_METRICS.LEGITIMACY_BY_PROCESS,
    content: (
      <div>
        <p>
          Concerns the use of recognized, verifiable, and fair processes to
          reach decisions or validate actions.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          If a DAO disburses funds only after passing a formal governance
          proposal with recorded votes and quorum thresholds, or a smart
          contract is deployed only after code review via standard audits or
          community sign-off, this demonstrates procedural legitimacy.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.LEGITIMACY_BY_PERFORMANCE]: {
    title: ALL_METRICS.LEGITIMACY_BY_PERFORMANCE,
    content: (
      <div>
        <p>
          Measures whether the project has achieved its stated outcomes or
          goals, showing effectiveness and reliability.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          A ReFi project that claimed it would retire 10,000 carbon credits and
          shows an onchain record doing so demonstrates legitimacy by
          performance. Similarly, if a treasury diversification plan is executed
          exactly as voted upon, the performance is verifiable.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.TRANSPARENCY]: {
    title: ALL_METRICS.TRANSPARENCY,
    content: (
      <div>
        <p>
          Refers to the visibility of important data, decisions, and records to
          external observers or stakeholders.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          A DAO with a treasury on Gnosis Safe, where anyone can view
          transactions, and a public proposal archive with links to all
          decisions, fulfills the transparency metric. Likewise, publishing
          monthly contributor payments or audit trails on IPFS or GitHub adds
          transparency.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.WEB3_RESILIENCE]: {
    title: ALL_METRICS.WEB3_RESILIENCE,
    content: (
      <div>
        <p>
          Measures whether the information or operations rely on decentralized
          infrastructure rather than centralized services.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          If governance votes are stored onchain, content is hosted via IPFS or
          Arweave, and contracts are upgradeable only through DAO-controlled
          logic, the project is resilient to censorship or service failure. This
          metric is about how trust-minimized and durable the information is.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.PARTICIPATION]: {
    title: ALL_METRICS.PARTICIPATION,
    content: (
      <div>
        <p>
          Indicates whether users and stakeholders can directly engage in
          shaping, reviewing, or contesting the provided information.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          If a project roadmap allows public commentary and proposals on GitHub
          or through forum discussion, and community members are credited or
          cited, the Item shows participatory accountability. Anonymous or
          hidden processes fail this metric.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.COMPLAINTS_AND_REDRESS]: {
    title: ALL_METRICS.COMPLAINTS_AND_REDRESS,
    content: (
      <div>
        <p>
          Refers to the ability for users to flag issues, contest decisions, or
          seek correction and response.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          A DAO that has a dispute resolution module (e.g., Reality.eth-style
          challenge mechanism) or allows contributors to contest funding
          rejections publicly demonstrates this metric. Systems without any
          process for appeal or correction lack this layer of accountability.
        </p>
      </div>
    ),
  },
  [ALL_METRICS.PERFORMANCE]: {
    title: ALL_METRICS.PERFORMANCE,
    content: (
      <div>
        <p>
          Measures if the outcomes promised or implied by the information can be
          tracked and confirmed.
        </p>
        <br />
        <p>
          <strong>Example:</strong>
        </p>
        <p>
          If a funding proposal claims it will launch a protocol feature by a
          certain date, and that feature is deployed and verified onchain (or
          publicly linked), the Item shows performance-based accountability.
          Ongoing reporting or metrics dashboards also strengthen this.
        </p>
      </div>
    ),
  },
};

export interface UseMetricDataReturn {
  isModalOpen: boolean;
  selectedMetric: string;
  metricTitle: string;
  metricContent: ReactNode;
  openModal: (metricName: string) => void;
  closeModal: () => void;
}

/**
 * Hook for managing metric modal data and state
 */
export function useMetricData(): UseMetricDataReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('');

  // Get current metric data
  const currentMetricData = useMemo(() => {
    if (!selectedMetric) return null;

    // Direct match
    if (METRIC_DATA[selectedMetric]) {
      return METRIC_DATA[selectedMetric];
    }

    // Case-insensitive search
    const lowerMetric = selectedMetric.toLowerCase();
    const matchingKey = Object.keys(METRIC_DATA).find(
      (key) => key.toLowerCase() === lowerMetric,
    );

    if (matchingKey) {
      return METRIC_DATA[matchingKey];
    }

    return null;
  }, [selectedMetric]);

  // Computed values for the modal
  const metricTitle = useMemo(() => {
    return currentMetricData?.title || selectedMetric || 'Metric Details';
  }, [currentMetricData, selectedMetric]);

  const metricContent = useMemo(() => {
    return currentMetricData?.content || null;
  }, [currentMetricData]);

  // Modal control functions
  const openModal = useCallback((metricName: string) => {
    setSelectedMetric(metricName);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedMetric('');
  }, []);

  return {
    isModalOpen,
    selectedMetric,
    metricTitle,
    metricContent,
    openModal,
    closeModal,
  };
}
