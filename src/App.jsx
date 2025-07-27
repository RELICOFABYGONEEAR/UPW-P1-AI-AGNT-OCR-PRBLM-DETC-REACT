import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Trash2,
  BarChart3,
} from "lucide-react";

const API_BASE_URL = "https://upw-p1-ai-agnt-ocr-prblm-detc-fapi.onrender.com";

const FinancialAnalyzer = () => {
  const [currentView, setCurrentView] = useState("upload"); // 'upload', 'results'
  const [uploadStatus, setUploadStatus] = useState("idle"); // 'idle', 'uploading', 'processing', 'completed', 'error'
  const [analysisId, setAnalysisId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Poll for analysis completion
  useEffect(() => {
    if (analysisId && uploadStatus === "processing") {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/analysis/${analysisId}`
          );
          const data = await response.json();

          if (data.status === "completed") {
            setAnalysisResult(data.result);
            setUploadStatus("completed");
            setCurrentView("results");
            clearInterval(pollInterval);
          } else if (data.status === "failed") {
            setError(data.error_message || "Analysis failed");
            setUploadStatus("error");
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    }
  }, [analysisId, uploadStatus]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) return;

    setUploadStatus("uploading");
    setError(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setAnalysisId(data.analysis_id);
      setUploadStatus("processing");
    } catch (err) {
      setError(err.message);
      setUploadStatus("error");
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus("idle");
    setAnalysisId(null);
    setAnalysisResult(null);
    setError(null);
    setCurrentView("upload");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "HIGH":
        return "text-red-600 bg-red-50";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-50";
      case "LOW":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "HIGH":
        return "🔴";
      case "MEDIUM":
        return "🟡";
      case "LOW":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const UploadView = () => (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Financial Document Analyzer
          </h1>
        </div>
        <p className="text-gray-600">
          Detect duplicates, hidden fees, and overcharges automatically
        </p>
        <div className="flex items-center justify-center mt-4 space-x-6">
          <div className="flex items-center text-sm text-gray-500">
            <CheckCircle className="w-4 h-4 mr-1" />
            Smart Analysis
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Issue Detection
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="space-y-4"
        >
          {!selectedFile ? (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Financial Document
                </h3>
                <p className="text-gray-500 mb-4">
                  Drag and drop your bank statement, credit card bill, or
                  utility invoice
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Choose File
                </button>
                <p className="text-sm text-gray-400 mt-2">
                  Supports JPG, PNG, PDF files
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <FileText className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedFile.name}
                </h3>
                <p className="text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {uploadStatus === "idle" && (
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={uploadFile}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Analyze Document
                  </button>
                  <button
                    onClick={resetUpload}
                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Change File
                  </button>
                </div>
              )}

              {uploadStatus === "uploading" && (
                <div className="flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                  <span className="text-blue-600">Uploading...</span>
                </div>
              )}

              {uploadStatus === "processing" && (
                <div className="flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
                  <span className="text-blue-600">Analyzing document...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );

  const ResultsView = () => (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Analysis Complete
          </h1>
          <p className="text-gray-600">Financial document analysis results</p>
        </div>
        <button
          onClick={resetUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Analyze New Document
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-3xl font-bold text-blue-600">
            {analysisResult?.summary?.total_issues || 0}
          </h3>
          <p className="text-blue-800 font-medium">Total Issues Found</p>
          <p className="text-blue-600 text-sm mt-1">
            {analysisResult?.summary?.total_transactions || 0} transactions
            analyzed
          </p>
        </div>

        <div className="bg-red-50 p-6 rounded-lg">
          <h3 className="text-3xl font-bold text-red-600">
            {analysisResult?.summary?.high_priority_count || 0}
          </h3>
          <p className="text-red-800 font-medium">High Priority Issues</p>
          <p className="text-red-600 text-sm mt-1">
            {analysisResult?.summary?.medium_priority_count || 0} medium,{" "}
            {analysisResult?.summary?.low_priority_count || 0} low
          </p>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <h3 className="text-3xl font-bold text-yellow-600">
            {(analysisResult?.summary?.duplicate_transactions || 0) +
              (analysisResult?.summary?.hidden_fees || 0)}
          </h3>
          <p className="text-yellow-800 font-medium">Billing Issues</p>
          <p className="text-yellow-600 text-sm mt-1">
            {analysisResult?.summary?.duplicate_transactions || 0} duplicates,{" "}
            {analysisResult?.summary?.hidden_fees || 0} hidden fees
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-3xl font-bold text-green-600">
            {analysisResult?.summary?.estimated_total_savings || "£0.00"}
          </h3>
          <p className="text-green-800 font-medium">Potential Savings</p>
          <p className="text-green-600 text-sm mt-1">
            Immediate recovery possible
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      {analysisResult?.red_flags?.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisResult.red_flags.filter((f) => f.severity === "HIGH")
              .length > 0 && (
              <div className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-red-600 text-sm">🔴</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Address High Priority Issues
                  </div>
                  <div className="text-sm text-gray-600">
                    {
                      analysisResult.red_flags.filter(
                        (f) => f.severity === "HIGH"
                      ).length
                    }{" "}
                    critical issues need attention
                  </div>
                </div>
              </div>
            )}

            {analysisResult.red_flags.filter(
              (f) => f.type === "duplicate_charge"
            ).length > 0 && (
              <div className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-600 text-sm">💰</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    Request Refunds
                  </div>
                  <div className="text-sm text-gray-600">
                    Contact providers about duplicate charges
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm">📊</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  Monitor Future Bills
                </div>
                <div className="text-sm text-gray-600">
                  Watch for similar issues going forward
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Analysis */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Transaction Analysis
            </h3>

            {/* Severity Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-red-100 border border-red-300 rounded-full mr-1"></span>
                <span className="text-red-600 font-medium mr-1">🔴</span>
                <span className="text-gray-600">High Priority</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-full mr-1"></span>
                <span className="text-yellow-600 font-medium mr-1">🟡</span>
                <span className="text-gray-600">Medium Priority</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-100 border border-green-300 rounded-full mr-1"></span>
                <span className="text-green-600 font-medium mr-1">🟢</span>
                <span className="text-gray-600">Low Priority</span>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analysisResult?.red_flags?.map((flag, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flag.transaction_date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {flag.transaction_description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {flag.transaction_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flag.transaction_type}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                        flag.severity
                      )}`}
                    >
                      {getSeverityIcon(flag.severity)} {flag.description}
                    </span>
                  </td>
                </tr>
              ))}

              {(!analysisResult?.red_flags ||
                analysisResult.red_flags.length === 0) && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    No problematic transactions detected in this document
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Next Steps */}
      {analysisResult?.summary?.next_steps?.length > 0 && (
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Recommended Next Steps:
          </h3>
          <ul className="space-y-2">
            {analysisResult.summary.next_steps.map((step, index) => (
              <li key={index} className="text-blue-800">
                {index + 1}. {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {currentView === "upload" ? <UploadView /> : <ResultsView />}
    </div>
  );
};

export default FinancialAnalyzer;
