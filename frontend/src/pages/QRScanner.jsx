import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
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
            message: response.data.message || "✓ Checked in successfully!"
          });
        }
      } catch (error) {
        setScanResult({
          success: false,
          message: error.response?.data?.message || "Invalid QR code"
        });
      } finally {
        setLoading(false);
        setTimeout(() => setScanResult(null), 3000);
      }
    };

    const onScanError = (error) => {
      console.error("Scan error:", error);
    };

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear();
    };
  }, []);

  return (
    <div className="container py-4">
      <h2>QR Code Check-in</h2>
      <p>Scan the QR code from the user's booking</p>
      
      <div id="reader" style={{ width: "500px" }}></div>
      
      {loading && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      
      {scanResult && (
        <div className={`alert mt-3 ${scanResult.success ? 'alert-success' : 'alert-danger'}`}>
          {scanResult.message}
        </div>
      )}
    </div>
  );
};

export default QRScanner;