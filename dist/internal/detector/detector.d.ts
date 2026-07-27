import { AIToolType, type DetectResult } from './types.js';
/** Interface for detecting AI coding environments */
export interface DetectorService {
    detect(workingDir?: string): DetectResult;
    getConfigDirPath(tool: AIToolType, workingDir: string): string;
}
/** Default detector implementation */
export declare class DefaultDetector implements DetectorService {
    detect(workingDir?: string): DetectResult;
    getConfigDirPath(tool: AIToolType, workingDir: string): string;
}
//# sourceMappingURL=detector.d.ts.map