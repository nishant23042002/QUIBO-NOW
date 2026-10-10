import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { newUuid } from '@/orders/ids';
import { readSetting, writeSetting } from '@/storage';
import { buildReport, parseReports, serialiseReports, type Draft, type Report } from './report';

/** Where the phone keeps the problems the shopper reported, until there is a server to send them to (Phase 2). */
const REPORTS_KEY = 'quibo.reports';

export interface Reports {
  /** False until the saved reports have been read back, so a list does not first look empty and then fill. */
  loaded: boolean;
  /** Every report sent from this phone, newest first. */
  reports: readonly Report[];
  /** Sends a report. Null when the draft is not complete. */
  submit: (draft: Draft) => Report | null;
  /** The reports about one order. */
  forOrder: (orderId: string) => Report[];
}

const ReportsContext = createContext<Reports | null>(null);

/** Holds the problems the shopper reported. Each is linked to its order, and kept on the phone for now. */
export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<readonly Report[]>([]);
  const [loaded, setLoaded] = useState(false);
  const current = useRef<readonly Report[]>([]);
  // A report sent before the saved ones have been read back must not be written over by them.
  const touched = useRef(false);

  useEffect(() => {
    let live = true;
    void readSetting(REPORTS_KEY).then((saved) => {
      if (!live) return;
      if (!touched.current) {
        const read = parseReports(saved);
        current.current = read;
        setReports(read);
      }
      setLoaded(true);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void writeSetting(REPORTS_KEY, serialiseReports(reports));
  }, [loaded, reports]);

  const submit = useCallback((draft: Draft): Report | null => {
    const report = buildReport(draft, newUuid(), new Date());
    if (report === null) return null;
    touched.current = true;
    current.current = [report, ...current.current];
    setReports(current.current);
    return report;
  }, []);

  const forOrder = useCallback(
    (orderId: string) => reports.filter((report) => report.orderId === orderId),
    [reports],
  );

  return (
    <ReportsContext.Provider value={{ loaded, reports, submit, forOrder }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports(): Reports {
  const reports = useContext(ReportsContext);
  if (reports === null) throw new Error('useReports must be used inside ReportsProvider');
  return reports;
}
