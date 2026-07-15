import React, { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";

import {
  Upload,
  Download,
  Search,
  ExternalLink,
  Layers,
  CheckCircle2,
  Loader2,
  FileText,
  BarChart3,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { motion, AnimatePresence } from "motion/react";

import {
    uploadJD,
    uploadCV,
    getStatus,
    getResults,
    downloadResults,
} from "./api";

import logo from "./resunexus-logo.png";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const scoreColor = (score) => {
  if (score >= 7.5) return "bg-emerald-500";
  if (score >= 5) return "bg-amber-400";
  return "bg-rose-400";
};

const scoreBadge = (score) => {
  if (score >= 7.5)
    return "text-emerald-700 bg-emerald-50 border-emerald-200";

  if (score >= 5)
    return "text-amber-700 bg-amber-50 border-amber-200";

  return "text-rose-700 bg-rose-50 border-rose-200";
};

export default function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [skills, setSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processing, setProcessing] = useState(false);
  const [workflowStep, setWorkflowStep] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "total_score",
    dir: "desc",
  });
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [processedCandidates, setProcessedCandidates] = useState(0);

  const pollingRef = useRef(null);
  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);

  useEffect(() => {
    loadResults();
    return () => {
      clearInterval(pollingRef.current);
    };
  }, []);

  const loadResults = async () => {
    try {
      const data = await getResults();
      setResults(data.rows || []);
      setSkills(data.skills || []);
      if ((data.rows || []).length > 0) {
        setActiveTab("results");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setMessage(`Selected: ${file.name}`);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
        setProcessing(true);

        if (workflowStep < 3) {

            const data = await uploadJD(selectedFile);

            setSkills(data.skills);

            setWorkflowStep(3);

            setMessage("JD uploaded successfully.");

        } else {

            const data = await uploadCV(selectedFile);

            setResults(data.results);

            setWorkflowStep(5);

            setActiveTab("results");

            setMessage("Processing complete.");
        }

    } catch (err) {

        console.error(err);

        setMessage("Upload failed.");

    } finally {

        setProcessing(false);

        setSelectedFile(null);

    }
};
  const startPolling = useCallback(() => {
    clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const status = await getStatus();
        setProcessedCandidates(status.processed);
        setTotalCandidates(status.total);

        const data = await getResults();
        setResults(data.rows || []);
        setSkills(data.skills || []);

        if (status.processed>=status.total && status.processed!=0) {
          clearInterval(pollingRef.current);
          setProcessing(false);
          setWorkflowStep(5);
          setMessage("Processing Complete!");
          setActiveTab("results")
        }
      } catch (err) {
        console.error(err);
        clearInterval(pollingRef.current);
        setProcessing(false);
      }
    }, 3000);
  }, []);

  const handleDownload = async () => {
    try {
      await downloadResults();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    try {
      const status = await getStatus();
      setProcessing(status.processing);
      setProcessedCandidates(status.processed);
      setTotalCandidates(status.total);

      const data = await getResults();
      setResults(data.rows || []);
      setSkills(data.skills || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key
        ? {
            key,
            dir: prev.dir === "desc" ? "asc" : "desc",
          }
        : {
            key,
            dir: "desc",
          }
    );
  };

  const sortedResults = [...results]
    .filter((r) =>
      r.cv_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const mul = sortConfig.dir === "desc" ? -1 : 1;

      if (sortConfig.key === "cv_name") {
        return (
          mul * (a.cv_name ?? "").localeCompare(b.cv_name ?? "")
        );
      }

      if (sortConfig.key === "total_score") {
        return (
          mul * ((a.total_score ?? 0) - (b.total_score ?? 0))
        );
      }

      const idx = Number(sortConfig.key.replace("skill_", ""));

      return (
        mul *
        ((a.scores?.[idx] ?? 0) - (b.scores?.[idx] ?? 0))
      );
    });

  const workflowSteps = [
    "Upload JD",
    "JD Processing",
    "Upload CV ZIP",
    "CV Processing",
    "Live Results",
  ];

  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey)
      return (
        <ChevronDown
          size={12}
          className="opacity-30 ml-1 inline"
        />
      );

    return sortConfig.dir === "desc" ? (
      <ChevronDown
        size={12}
        className="ml-1 inline text-indigo-500"
      />
    ) : (
      <ChevronUp
        size={12}
        className="ml-1 inline text-indigo-500"
      />
    );
  };

  const handleTopScroll = (e) => {
    if (bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft =
        e.target.scrollLeft;
    }
  };

  const handleBottomScroll = (e) => {
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft =
        e.target.scrollLeft;
    }
  };

  return (
  <div className="flex bg-slate-50 min-h-screen font-sans">
    {/* SIDEBAR */}
    <aside className="w-72 bg-slate-900 text-white hidden lg:flex flex-col flex-shrink-0">
      <div className="px-8 py-8 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="logo"
            className="w-12 h-12 rounded-xl object-cover"
          />

          <div>
            <h2 className="font-bold text-xl tracking-tight">
              ResuNexus
            </h2>

            <p className="text-slate-400 text-sm">
              Resume Intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-8">

        <p className="uppercase text-xs tracking-widest text-slate-500 mb-6">
          Workflow
        </p>

        <div className="space-y-5">

          {workflowSteps.map((step, index) => {
            const stepNumber = index+1;
            const active = workflowStep > index;
            const current = workflowStep === stepNumber;

            const clickable =
                stepNumber === 1 || stepNumber === 5;


            return (

               <div
                  key={step}
                  onClick={() => {

                      if (!clickable) return;

                      if (stepNumber === 1) {
                          setActiveTab("upload");
                      }

                      if (stepNumber === 5) {
                          setActiveTab("results");
                      }

                  }}
                  className={`flex items-start gap-4 ${
                      clickable
                          ? "cursor-pointer hover:bg-slate-800 rounded-xl p-2 transition-colors"
                          : ""
                  }`}
              >

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all
                  ${
                    active
                      ? "bg-emerald-500 border-emerald-500"
                      : current
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-slate-800 border-slate-700"
                  }`}
                >

                  {active ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <span className="text-sm font-semibold">
                      {index + 1}
                    </span>
                  )}

                </div>

                <div>

                  <p
                    className={`font-medium ${
                      active || current
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {step}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {index === 0 &&
                      "Upload Job Description"}

                    {index === 1 &&
                      "Extract required skills"}

                    {index === 2 &&
                      "Upload resumes"}

                    {index === 3 &&
                      "AI evaluates candidates"}

                    {index === 4 &&
                      "View ranked results"}
                  </p>

                </div>

              </div>

            );

          })}

        </div>

        <div className="mt-12 rounded-xl bg-slate-800 p-5">

          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={18} />
            <span className="font-semibold">
              Session
            </span>
          </div>

          <div className="space-y-2 text-sm">

            <div className="flex justify-between">
              <span className="text-slate-400">
                Candidates
              </span>

              <span>
                {processedCandidates}/{totalCandidates}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Skills
              </span>

              <span>
                {skills.length}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Results
              </span>

              <span>
                {results.length}
              </span>
            </div>

          </div>

        </div>

      </div>
    </aside>

    {/*MAIN SECTION*/}
    <main className="flex-1 flex flex-col min-w-0">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <img
            src={logo}
            alt="logo"
            className="w-9 h-9 rounded-xl object-cover"
          />
          <div>
            <h1 className="font-bold text-slate-800 leading-none">
              ResuNexus
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              JD-CV Intelligence Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {processing && (
            <span className="text-sm font-medium text-indigo-600 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Processing...
            </span>
          )}

          {activeTab === "results" && (
            <>
              <button
                onClick={handleRefresh}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
              >
                <Download size={14} />
                Download XLSX
              </button>
            </>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {/* Upload Tab */}
          {activeTab === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto p-8"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900">
                  Upload Documents
                </h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Upload the Job Description PDF first, then upload the candidate ZIP.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <label
                  htmlFor="fileUpload"
                  className="block border-2 border-dashed border-slate-200 rounded-xl m-4 p-12 flex flex-col items-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                    {selectedFile ? (
                      <FileText size={28} className="text-indigo-500" />
                    ) : (
                      <Upload size={28} className="text-indigo-400" />
                    )}
                  </div>

                  <p className="font-semibold text-slate-800">
                    {selectedFile
                      ? selectedFile.name
                      : "Click to browse files"}
                  </p>

                  <p className="text-slate-400 text-sm mt-1">
                    PDF (JD) or ZIP (CV batch)
                  </p>

                  <input
                    id="fileUpload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.zip"
                    onChange={handleFileChange}
                  />
                </label>

                <div className="px-4 pb-4 flex justify-end">
                  <button
                    disabled={!selectedFile || processing}
                    onClick={handleUpload}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload size={14} />
                        Upload & Process
                      </>
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div
                    key="msg"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl px-5 py-4 text-sm font-medium"
                  >
                    {message}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText
                      size={18}
                      className="text-indigo-500"
                    />
                    <span className="font-semibold text-slate-800 text-sm">
                      Step 1 — Upload JD
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload a Job Description PDF. The AI extracts the required skills
                    automatically.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3
                      size={18}
                      className="text-emerald-500"
                    />
                    <span className="font-semibold text-slate-800 text-sm">
                      Step 2 — Upload CV ZIP
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload a ZIP containing resumes. Every resume is evaluated against
                    the uploaded JD.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Tab */}
          {activeTab === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6 h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Candidate Results
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {totalCandidates > 0
                      ? `${processedCandidates}/${totalCandidates} candidates graded`
                      : `${results.length} candidates graded`}
                    {processing && (
                      <span className="ml-2 text-indigo-500 font-medium">
                        · live updating...
                      </span>
                    )}
                  </p>
                </div>

                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    placeholder="Search candidates..."
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
                  />
                </div>
              </div>

              <div
                ref={topScrollRef}
                onScroll={handleTopScroll}
                className="overflow-x-auto overflow-y-hidden sticky top-0 z-20 bg-white border-b border-slate-200"
                style={{ height: "16px" }}
              >
                <div
                  style={{
                    width: `${1200 + skills.length * 130}px`,
                    height: "1px",
                  }}
                />
              </div>

              <div
                ref={bottomScrollRef}
                onScroll={handleBottomScroll}
                className="flex-1 overflow-auto rounded-xl border border-slate-200 shadow-sm bg-white"
              >
                {sortedResults.length > 0 &&  (
                  <div className="flex-1 flex flex-col gap-0">
                    <div
                      ref={topScrollRef}
                      onScroll={handleTopScroll}
                      className="overflow-x-auto overflow-y-hidden sticky top-0 z-20 bg-white border-b border-slate-200"
                      style={{ height: "16px" }}
                    >
                      <div style={{ width: `${1200 + skills.length * 130}px`, height: "1px" }} />
                    </div>
                     {/* Table container */}
                    <div
                      ref={bottomScrollRef}
                      onScroll={handleBottomScroll}
                      className="flex-1 overflow-auto rounded-xl border border-slate-200 shadow-sm bg-white"
                    >
                      <table className="w-full text-sm border-collapse">          
                                              <thead className="sticky top-0 z-10">
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                                                    <button
                                                      onClick={() => handleSort("cv_name")}
                                                      className="flex items-center hover:text-slate-900"
                                                    >
                                                      Candidate <SortIcon colKey="cv_name" />
                                                    </button>
                                                  </th>
                      
                                                  {skills.map((skill, i) => (
                                                    <th
                                                      key={i}
                                                      className="px-3 py-3 font-semibold text-slate-600 whitespace-nowrap min-w-[130px] text-center"
                                                    >
                                                      <button
                                                        onClick={() => handleSort(`skill_${i}`)}
                                                        className="flex items-center justify-center w-full hover:text-slate-900 leading-snug"
                                                        title={skill}
                                                      >
                                                        <span className="max-w-[110px] truncate text-xs">{skill}</span>
                                                        <SortIcon colKey={`skill_${i}`} />
                                                      </button>
                                                    </th>
                                                  ))}
                      
                                                  <th className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap sticky right-0 bg-slate-50 z-10 text-center min-w-[110px]">
                                                    <button
                                                      onClick={() => handleSort("total_score")}
                                                      className="flex items-center justify-center w-full hover:text-slate-900"
                                                    >
                                                      Total <SortIcon colKey="total_score" />
                                                    </button>
                                                  </th>
                                                </tr>
                                              </thead>
                      
                                              <tbody>
                                                <AnimatePresence initial={false}>
                                                  {sortedResults.map((row, rowIdx) => {
                                                    const isExpanded = expandedRow === rowIdx;
                                                    return (
                                                      <React.Fragment key={`${row.cv_name}-${rowIdx}`}>
                                                        <motion.tr
                                                          initial={{ opacity: 0, y: 6 }}
                                                          animate={{ opacity: 1, y: 0 }}
                                                          transition={{ delay: rowIdx * 0.03 }}
                                                          onClick={() =>
                                                            setExpandedRow(isExpanded ? null : rowIdx)
                                                          }
                                                          className={`border-b border-slate-100 cursor-pointer transition-colors ${
                                                            isExpanded
                                                              ? "bg-indigo-50"
                                                              : "hover:bg-slate-50"
                                                          }`}
                                                        >
                                                          <td className="px-4 py-3 sticky left-0 bg-inherit z-10">
                                                            <a
                                                              href={row.resumeUrl || "#"}
                                                              target="_blank"
                                                              rel="noreferrer"
                                                              onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (!row.resumeUrl) e.preventDefault();
                                                              }}
                                                              className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                                                            >
                                                              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                                <FileText size={13} className="text-slate-500" />
                                                              </div>
                                                              <span
                                                                className="font-medium text-slate-800 max-w-[160px] truncate"
                                                                title={row.cv_name}
                                                              >
                                                                {row.cv_name}
                                                              </span>
                                                            </a>
                                                          </td>
                      
                                                          {(row.scores || []).map((score, si) => (
                                                            <td key={si} className="px-3 py-3 text-center">
                                                              <div className="flex flex-col items-center gap-1">
                                                                <span className="font-semibold text-slate-700 text-xs">
                                                                  {typeof score === "number"
                                                                    ? score.toFixed(1)
                                                                    : "—"}
                                                                </span>
                                                                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                                  <div
                                                                    className={`h-full rounded-full ${scoreColor(score)}`}
                                                                    style={{ width: `${(score / 10) * 100}%` }}
                                                                  />
                                                                </div>
                                                              </div>
                                                            </td>
                                                          ))}
                      
                                                          <td className="px-4 py-3 sticky right-0 bg-inherit z-10 text-center">
                                                            <span
                                                              className={`inline-block px-2.5 py-1 rounded-lg border text-xs font-bold ${scoreBadge(
                                                                row.total_score ?? 0
                                                              )}`}
                                                            >
                                                              {typeof row.total_score === "number"
                                                                ? row.total_score.toFixed(2)
                                                                : "—"}
                                                              <span className="font-normal opacity-60">/10</span>
                                                            </span>
                                                          </td>
                                                        </motion.tr>                                                                            
                                                        <AnimatePresence>
                                                          {isExpanded && (
                                                            <motion.tr
                                                              key={`exp-${rowIdx}`}
                                                              initial={{ opacity: 0 }}
                                                              animate={{ opacity: 1 }}
                                                              exit={{ opacity: 0 }}
                                                            >
                                                              <td
                                                                colSpan={skills.length + 2}
                                                                className="px-6 py-4 bg-indigo-50 border-b border-indigo-100"
                                                              >
                                                                <div className="flex flex-wrap gap-3">
                                                                  {skills.map((skill, si) => (
                                                                    <div
                                                                      key={si}
                                                                      className="bg-white rounded-lg border border-slate-200 px-3 py-2 text-xs min-w-[140px]"
                                                                    >
                                                                      <div
                                                                        className="text-slate-500 mb-1 truncate"
                                                                        title={skill}
                                                                      >
                                                                        {skill}
                                                                      </div>
                                                                      <div className="flex items-center gap-2">
                                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                          <div
                                                                            className={`h-full rounded-full ${scoreColor(
                                                                              row.scores?.[si] ?? 0
                                                                            )}`}
                                                                            style={{
                                                                              width: `${
                                                                                ((row.scores?.[si] ?? 0) / 10) * 100
                                                                              }%`,
                                                                            }}
                                                                          />
                                                                        </div>
                                                                        <span className="font-bold text-slate-700">
                                                                          {typeof row.scores?.[si] === "number"
                                                                            ? row.scores[si].toFixed(1)
                                                                            : "—"}
                                                                        </span>
                                                                      </div>
                                                                    </div>
                                                                  ))}
                      
                                                                  {row.resumeUrl && (
                                                                    <a
                                                                      href={row.resumeUrl}
                                                                      target="_blank"
                                                                      rel="noreferrer"
                                                                      onClick={(e) => e.stopPropagation()}
                                                                      className="flex items-center gap-1.5 bg-slate-900 text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-slate-700 transition-colors self-end ml-auto"
                                                                    >
                                                                      <ExternalLink size={12} /> Open CV
                                                                    </a>
                                                                  )}
                                                                </div>
                                                              </td>
                                                            </motion.tr>
                                                          )}
                                                        </AnimatePresence>
                                                      </React.Fragment>
                                                    );
                                                  })}
                                                </AnimatePresence>
                                              </tbody>
                                            </table>
                                            </div>
                                            </div>
                                            )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  </div>
);
}
