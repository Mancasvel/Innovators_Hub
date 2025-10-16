"use client";

import { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * QR Scanner page for organizers
 * Scans and validates event tickets
 */

interface ValidationResult {
  success: boolean;
  ticket?: {
    userName: string;
    userEmail: string;
    eventTitle: string;
    eventDate: string;
  };
  error?: string;
  code?: string;
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    [],
  );
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  // Function to intelligently select back camera index
  const selectBackCameraIndex = (devices: MediaDeviceInfo[]) => {
    const backCameraPatterns = [
      /back/i,
      /rear/i,
      /environment/i,
      /facing back/i,
      /camera2/i,
      /1$/i,
    ];

    // First try to find by label patterns
    for (let i = 0; i < devices.length; i++) {
      const label = devices[i].label.toLowerCase();
      if (backCameraPatterns.some((pattern) => pattern.test(label))) {
        return i;
      }
    }

    // If no pattern matches, prefer the last device (often back camera on mobile)
    if (devices.length > 1) {
      return devices.length - 1;
    }

    // Fallback to first device
    return 0;
  };

  // Function to change camera
  const changeCamera = async () => {
    if (availableCameras.length <= 1) return;

    const nextIndex = (selectedCameraIndex + 1) % availableCameras.length;
    setSelectedCameraIndex(nextIndex);

    // Stop current scanning
    stopScanning();

    // Restart with new camera
    setTimeout(() => {
      startScanningWithCamera(availableCameras[nextIndex]);
    }, 100);
  };

  // Helper function to start scanning with specific camera
  const startScanningWithCamera = async (selectedDevice: MediaDeviceInfo) => {
    try {
      setScanning(true);
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      console.log(
        "📷 Switching to camera:",
        selectedDevice.label,
        "ID:",
        selectedDevice.deviceId,
      );

      codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        async (result, error) => {
          if (result) {
            const qrCode = result.getText();
            // Validate ticket (this will stop the camera automatically)
            await validateTicket(qrCode);
          }
        },
      );
    } catch (error) {
      console.error("Error switching camera:", error);
      alert("Failed to switch camera. Please try again.");
      setScanning(false);
    }
  };

  const startScanning = async () => {
    try {
      setScanning(true);
      setResult(null);

      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices =
        await BrowserMultiFormatReader.listVideoInputDevices();
      setAvailableCameras(videoInputDevices);

      if (videoInputDevices.length === 0) {
        alert("No camera found on this device");
        setScanning(false);
        return;
      }

      // Initialize selected camera index to prefer back camera
      if (selectedCameraIndex === 0) {
        const backCameraIndex = selectBackCameraIndex(videoInputDevices);
        setSelectedCameraIndex(backCameraIndex);
      }

      const selectedDevice = videoInputDevices[selectedCameraIndex];
      console.log(
        "📷 Selected camera:",
        selectedDevice.label,
        "ID:",
        selectedDevice.deviceId,
      );

      codeReader.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        async (result, error) => {
          if (result) {
            const qrCode = result.getText();
            // Validate ticket (this will stop the camera automatically)
            await validateTicket(qrCode);
          }
        },
      );
    } catch (error) {
      console.error("Error starting scanner:", error);
      alert("Failed to start camera. Please check permissions.");
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      videoRef.current.srcObject = null;
    }
    if (codeReaderRef.current) {
      codeReaderRef.current = null;
    }
    setScanning(false);
    setAvailableCameras([]);
    setSelectedCameraIndex(0);
  };

  const validateTicket = async (qrCode: string) => {
    setValidating(true);

    // Stop the video stream to freeze the camera
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setScanning(false);

    try {
      console.log("🎫 Validating ticket with QR:", qrCode);

      const response = await fetch("/api/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrCode }),
      });

      const data = await response.json();

      console.log("📡 API Response:", {
        status: response.status,
        ok: response.ok,
        data: data,
      });

      if (response.ok) {
        console.log("✅ Ticket validated successfully:", data.ticket);
        setResult({
          success: true,
          ticket: data.ticket,
        });
        // Play success sound (optional)
        playSound("success");

        // For successful validation, show result for 3 seconds before allowing next scan
        if (response.ok) {
          setTimeout(() => {
            setResult(null);
          }, 3000);
        }
      } else {
        console.log(
          "❌ Ticket validation failed:",
          data.error,
          "Code:",
          data.code,
        );
        setResult({
          success: false,
          error: data.error,
          code: data.code,
        });
        // Play error sound (optional)
        playSound("error");
      }
    } catch (error) {
      console.error("❌ Validation error:", error);
      setResult({
        success: false,
        error: "Failed to validate ticket. Please try again.",
      });
    } finally {
      setValidating(false);
    }
  };

  const playSound = (type: "success" | "error") => {
    // Optional: Add audio feedback
    const audio = new Audio(
      type === "success" ? "/sounds/success.mp3" : "/sounds/error.mp3",
    );
    audio.play().catch(() => {});
  };

  const handleManualEntry = async () => {
    const qrCode = prompt("Enter QR code manually:");
    if (qrCode) {
      await validateTicket(qrCode);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-light-gray">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-4xl font-bold mb-8 text-center">
              Scan Tickets
            </h1>

            <div className="card">
              {/* Scanner Area */}
              <div className="scanner-container mb-6">
                {scanning && !result ? (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg"
                      style={{ maxHeight: "400px" }}
                    />
                    <div className="scanner-overlay"></div>
                    {validating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="text-white text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                          <p>Validating...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : !result ? (
                  <div className="bg-gray-100 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">📷</div>
                    <p className="text-gray-600 mb-6">
                      Click below to start scanning QR codes
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Controls */}
              {!result && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {!scanning ? (
                    <>
                      <button
                        onClick={startScanning}
                        className="flex-1 btn btn-primary"
                      >
                        Start Scanning
                      </button>
                      <button
                        onClick={handleManualEntry}
                        className="flex-1 btn btn-secondary"
                      >
                        Manual Entry
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={stopScanning}
                        className="flex-1 btn bg-red-600 text-white hover:bg-red-700"
                      >
                        Stop Scanning
                      </button>
                      {availableCameras.length > 1 && (
                        <button
                          onClick={changeCamera}
                          className="flex-1 btn btn-secondary"
                        >
                          🔄 Change Camera ({selectedCameraIndex + 1}/
                          {availableCameras.length})
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Validation Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`mt-6 p-6 rounded-lg ${
                    result.success
                      ? "bg-green-50 border-2 border-green-500"
                      : "bg-red-50 border-2 border-red-500"
                  }`}
                >
                  {result.success ? (
                    <>
                      <div className="text-center mb-4">
                        <div className="text-6xl mb-2">✅</div>
                        <h3 className="text-2xl font-bold text-green-800">
                          Valid Ticket
                        </h3>
                      </div>
                      <div className="space-y-2 text-gray-800">
                        <p>
                          <strong>Name:</strong> {result.ticket?.userName}
                        </p>
                        <p>
                          <strong>Email:</strong> {result.ticket?.userEmail}
                        </p>
                        <p>
                          <strong>Event:</strong> {result.ticket?.eventTitle}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {result.ticket?.eventDate &&
                            formatDate(result.ticket.eventDate)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-4">
                        <div className="text-6xl mb-2">❌</div>
                        <h3 className="text-2xl font-bold text-red-800">
                          {result.code === "ALREADY_USED"
                            ? "Already Used"
                            : result.code === "NOT_FOUND"
                              ? "Not Found"
                              : "Invalid Ticket"}
                        </h3>
                      </div>
                      <p className="text-center text-gray-800">
                        {result.error}
                      </p>
                    </>
                  )}
                  {result?.success && (
                    <div className="text-center text-sm text-green-600 mt-4">
                      ✅ Ticket validated successfully! Next scan available in a
                      few seconds...
                    </div>
                  )}
                  <button
                    onClick={() => {
                      // Clear result first
                      setResult(null);
                      // Small delay to allow UI to update
                      setTimeout(() => {
                        if (availableCameras.length > 0) {
                          startScanningWithCamera(
                            availableCameras[selectedCameraIndex],
                          );
                        } else {
                          startScanning();
                        }
                      }, 100);
                    }}
                    className="mt-6 w-full btn btn-primary"
                    disabled={result?.success}
                  >
                    {result?.success ? "Please Wait..." : "Scan Next Ticket"}
                  </button>
                </motion.div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📋 Instructions
                </h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Point the camera at the QR code on the ticket</li>
                  <li>The ticket will be validated automatically</li>
                  <li>Green = Valid, Red = Invalid or already used</li>
                  <li>Use "Manual Entry" if camera doesn't work</li>
                  <li>
                    Use "🔄 Change Camera" to switch between front/back cameras
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
