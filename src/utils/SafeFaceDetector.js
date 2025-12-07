// expo-face-detector is incompatible with New Architecture and has been removed.
// We are using a safe mock here to allow the app to build and run.
// Future TODO: Implement react-native-vision-camera for real face detection on New Architecture.

const FaceDetector = {
    detectFacesAsync: async (uri) => {
        console.log("Mock Face Detected (Safe Mode)");
        // Simulate 1 face found for testing flow
        return {
            faces: [
                {
                    faceID: 1,
                    bounds: { origin: { x: 100, y: 100 }, size: { width: 200, height: 200 } },
                    rollAngle: 0,
                    yawAngle: 0
                }
            ]
        };
    },
    Constants: {},
    FaceDetectorMode: { fast: 1, accurate: 2 },
    FaceDetectorLandmarks: { none: 0, all: 1 },
    FaceDetectorClassifications: { none: 0, all: 1 }
};

export const detectFacesAsync = FaceDetector.detectFacesAsync;
export const FaceDetectorMode = FaceDetector.FaceDetectorMode;
export default FaceDetector;
