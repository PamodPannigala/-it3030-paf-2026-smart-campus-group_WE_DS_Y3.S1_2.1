import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, QrCode, Camera, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const scannerRef = useRef(null);

  const verifyScannedCode = async (decodedText) => {
    const qrData = typeof decodedText === 'string' ? decodedText.trim() : decodedText;
    return api.post('/bookings/verify-checkin', { qrData });
  };

  const previewScannedCode = async (decodedText) => {
    const qrData = typeof decodedText === 'string' ? decodedText.trim() : decodedText;
    return api.post('/bookings/verify-checkin/preview', { qrData });
  };

  const processScan = async (decodedText) => {
    try {
      setLoading(true);
      const previewResponse = await previewScannedCode(decodedText);
      const previewDetails = previewResponse.data || {};
      const resourceName = previewDetails.resourceName || "Unknown resource";

      const confirmed = window.confirm(`Is this the resource (${resourceName}) ?`);

      if (!confirmed) {
        setScanResult({
          success: false,
          message: "Check-in failed: this is not the right resource.",
          bookingDetails: previewDetails
        });
        return;
      }

      const verifyResponse = await verifyScannedCode(decodedText);
      if (verifyResponse.data) {
        setScanResult({
          success: true,
          message: verifyResponse.data.message || "✓ Checked in successfully!",
          bookingDetails: verifyResponse.data
        });
      }
    } catch (error) {
      const fallbackDetails = error?.response?.data && typeof error.response.data === "object"
        ? error.response.data
        : null;
      setScanResult({
        success: false,
        message: error.response?.data?.message || "Invalid QR code",
        bookingDetails: fallbackDetails
      });
    } finally {
      setLoading(false);
      // Message stays until next scan - no auto-clear
    }
  };

  useEffect(() => {
    // Initialize scanner only once
    if (!scannerInitialized) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 280, height: 280 },
        fps: 10,
        aspectRatio: 1.0,
      });

      const onScanSuccess = async (decodedText) => {
        await processScan(decodedText);
      };

      const onScanError = (error) => {
        console.error("Scan error:", error);
      };

      scanner.render(onScanSuccess, onScanError);
      scannerRef.current = scanner;
      setScannerInitialized(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [scannerInitialized]);

  const handleResetScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      setScannerInitialized(false);
      setScanResult(null);
      // Re-initialize
      setTimeout(() => {
        const newScanner = new Html5QrcodeScanner('reader', {
          qrbox: { width: 280, height: 280 },
          fps: 10,
          aspectRatio: 1.0,
        });
        
        const onScanSuccess = async (decodedText) => {
          await processScan(decodedText);
        };
        
        newScanner.render(onScanSuccess, () => {});
        scannerRef.current = newScanner;
        setScannerInitialized(true);
      }, 100);
    }
  };

  return (
    <div className="container py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-xl-8 col-lg-9">
          <div className="d-flex justify-content-start mb-3">
            <button
              onClick={() => navigate("/admin/bookings")}
              className="btn btn-outline-dark d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
              style={{ fontWeight: "500" }}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>

          {/* Header Card */}
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '20px' }}>
            <div className="card-body p-4 p-lg-5 text-center">
              <div className="mb-3">
                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(13,110,253,0.15)" }}
                >
                  <QrCode size={48} className="text-primary" />
                </div>
              </div>
              <h2 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>QR Code Check-in</h2>
              <p className="text-muted mb-0">Position the QR code within the frame and hold steady for instant verification</p>
            </div>
          </div>

          {/* Scanner Card */}
          <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div className="card-body p-4 p-lg-5">
              <div className="text-center mb-3">
                <Camera size={24} className="text-primary me-2" />
                <span className="fw-semibold">Scanner Active</span>
              </div>
              <div
                id="reader"
                style={{
                  width: "100%",
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: "1px solid #e9ecef",
                  padding: "6px",
                }}
              ></div>
              
              {loading && (
                <div className="text-center mt-4">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2 text-muted">Verifying QR code...</p>
                </div>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <div className="text-center mb-4">
            <button 
              onClick={handleResetScanner}
              className="btn btn-outline-secondary px-4 py-2 rounded-pill"
              style={{ fontWeight: '500' }}
            >
              <RefreshCw size={16} className="me-2" />
              Reset Scanner
            </button>
          </div>

          {/* Result Message - Persistent until next scan */}
          {scanResult && (
            <div className={`card shadow-sm border-0 ${scanResult.success ? 'border-success' : 'border-danger'}`} style={{ borderRadius: '20px' }}>
              <div className={`card-body p-4 ${scanResult.success ? 'bg-success bg-opacity-10' : 'bg-danger bg-opacity-10'}`}>
                <div className="d-flex align-items-center">
                  <div className="flex-shrink-0">
                    {scanResult.success ? (
                      <CheckCircle size={40} className="text-success" />
                    ) : (
                      <XCircle size={40} className="text-danger" />
                    )}
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className={`mb-1 ${scanResult.success ? 'text-success' : 'text-danger'}`}>
                      {scanResult.success ? 'Check-in Successful!' : 'Check-in Failed'}
                    </h5>
                    <p className="mb-0 text-dark">{scanResult.message}</p>
                  </div>
                </div>

                {/* Booking Details on Success */}
                {scanResult.success && scanResult.bookingDetails && (
                  <div className="mt-3 pt-3 border-top">
                    <h6 className="fw-semibold mb-2">Booking Details:</h6>
                    <div className="row g-2">
                      <div className="col-sm-6">
                        <small className="text-muted">Booking ID</small>
                        <p className="mb-0 fw-semibold">#{scanResult.bookingDetails.bookingId}</p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Resource</small>
                        <p className="mb-0 fw-semibold">{scanResult.bookingDetails.resourceName || 'N/A'}</p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Booked By</small>
                        <p className="mb-0 fw-semibold">
                          {scanResult.bookingDetails.bookedByName || 'N/A'}
                        </p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Checked In At</small>
                        <p className="mb-0 fw-semibold">
                          {scanResult.bookingDetails.checkedInAt 
                            ? new Date(scanResult.bookingDetails.checkedInAt).toLocaleTimeString()
                            : new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Status</small>
                        <p className="mb-0">
                          <span className="badge bg-success">Checked In</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* More Details on Failure (when available) */}
                {!scanResult.success && scanResult.bookingDetails && (
                  <div className="mt-3 pt-3 border-top">
                    <h6 className="fw-semibold mb-2">Verification Context:</h6>
                    <div className="row g-2">
                      <div className="col-sm-6">
                        <small className="text-muted">Resource</small>
                        <p className="mb-0 fw-semibold">
                          {scanResult.bookingDetails.resourceName || 'N/A'}
                        </p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Booking ID</small>
                        <p className="mb-0 fw-semibold">
                          {scanResult.bookingDetails.bookingId
                            ? `#${scanResult.bookingDetails.bookingId}`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Booked By</small>
                        <p className="mb-0 fw-semibold">
                          {scanResult.bookingDetails.bookedByName || 'N/A'}
                        </p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Scheduled Date</small>
                        <p className="mb-0 fw-semibold">
                          {scanResult.bookingDetails.bookingDate || 'N/A'}
                        </p>
                      </div>
                      <div className="col-sm-6">
                        <small className="text-muted">Scheduled Time</small>
                        <p className="mb-0 fw-semibold">
                          {scanResult.bookingDetails.startTime && scanResult.bookingDetails.endTime
                            ? `${scanResult.bookingDetails.startTime} - ${scanResult.bookingDetails.endTime}`
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="card shadow-sm border-0 mt-4" style={{ borderRadius: '20px', backgroundColor: '#f8f9fa' }}>
            <div className="card-body p-3">
              <small className="text-muted d-block text-center">
                <strong>Instructions:</strong> Hold the QR code steady in front of the camera. 
                The scanner will automatically detect and process the QR code.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
