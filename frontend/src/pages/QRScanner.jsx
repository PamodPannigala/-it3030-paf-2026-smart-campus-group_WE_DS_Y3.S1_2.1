import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle, XCircle, QrCode, Camera, RefreshCw } from 'lucide-react';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Initialize scanner only once
    if (!scannerInitialized) {
      const scanner = new Html5QrcodeScanner('reader', {
        qrbox: { width: 280, height: 280 },
        fps: 10,
        aspectRatio: 1.0,
      });

      const onScanSuccess = async (decodedText) => {
        try {
          setLoading(true);
          const response = await axios.post('http://localhost:8080/api/bookings/verify-checkin', {
            qrData: decodedText
          });
          
          if (response.data) {
            setScanResult({
              success: true,
              message: response.data.message || "✓ Checked in successfully!",
              bookingDetails: response.data
            });
          }
        } catch (error) {
          setScanResult({
            success: false,
            message: error.response?.data?.message || "Invalid QR code",
            bookingDetails: null
          });
        } finally {
          setLoading(false);
          // Message stays until next scan - no auto-clear
        }
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
          try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/api/bookings/verify-checkin', {
              qrData: decodedText
            });
            
            if (response.data) {
              setScanResult({
                success: true,
                message: response.data.message || "✓ Checked in successfully!",
                bookingDetails: response.data
              });
            }
          } catch (error) {
            setScanResult({
              success: false,
              message: error.response?.data?.message || "Invalid QR code",
              bookingDetails: null
            });
          } finally {
            setLoading(false);
          }
        };
        
        newScanner.render(onScanSuccess, () => {});
        scannerRef.current = newScanner;
        setScannerInitialized(true);
      }, 100);
    }
  };

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header Card */}
          <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '20px' }}>
            <div className="card-body p-4 text-center">
              <div className="mb-3">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3">
                  <QrCode size={48} className="text-primary" />
                </div>
              </div>
              <h2 className="fw-bold mb-2" style={{ color: '#1a1a2e' }}>QR Code Check-in</h2>
              <p className="text-muted mb-0">Position the QR code within the frame to scan</p>
            </div>
          </div>

          {/* Scanner Card */}
          <div className="card shadow-lg border-0 mb-4" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div className="card-body p-4">
              <div className="text-center mb-3">
                <Camera size={24} className="text-primary me-2" />
                <span className="fw-semibold">Scanner Active</span>
              </div>
              <div id="reader" style={{ width: "100%", borderRadius: '16px', overflow: 'hidden' }}></div>
              
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
            <div className={`card shadow-lg border-0 ${scanResult.success ? 'border-success' : 'border-danger'}`} style={{ borderRadius: '20px' }}>
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