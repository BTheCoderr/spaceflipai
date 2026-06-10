import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { DemoPhoto } from '../data/mockDemoPhotos';
import type { LoadingType } from './mockGenerationSteps';
import type { PickedImage, PickedImageSource } from './imagePicker';

export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'failed';

export type SavedMockProject = {
  id: string;
  toolName: string;
  toolId?: string;
  resultImageUrl: string;
  inputImageUri: string;
  source: PickedImageSource;
  createdAt: string;
};

type GenerationState = {
  selectedToolId?: string;
  selectedStyleId?: string;
  selectedInputImage?: PickedImage;
  selectedDemoPhoto?: DemoPhoto;
  generationStatus: GenerationStatus;
  mockResultImageUrl?: string;
  mockResultIndex: number;
  lastGeneratedProject?: SavedMockProject;
  savedProjects: SavedMockProject[];
  jobId?: string;
  loadingType?: LoadingType;
  toolName?: string;
  roomType?: string;
  designStyle?: string;
};

type GenerationContextValue = GenerationState & {
  setSelectedTool: (toolId: string, toolName?: string, loadingType?: LoadingType) => void;
  setSelectedStyle: (styleId: string) => void;
  setSelectedInputImage: (image: PickedImage, demoPhoto?: DemoPhoto) => void;
  clearSelectedInputImage: () => void;
  startMockGeneration: (input: {
    jobId: string;
    toolId?: string;
    toolName?: string;
    loadingType?: LoadingType;
    roomType?: string;
    designStyle?: string;
  }) => void;
  completeMockGeneration: (resultUrl: string, resultIndex?: number) => void;
  cycleMockResult: (urls: string[]) => string;
  saveProject: (project: Omit<SavedMockProject, 'id' | 'createdAt'>) => SavedMockProject;
  resetGeneration: () => void;
};

const initialState: GenerationState = {
  generationStatus: 'idle',
  mockResultIndex: 0,
  savedProjects: [],
};

const GenerationContext = createContext<GenerationContextValue | null>(null);

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GenerationState>(initialState);

  const setSelectedTool = useCallback(
    (toolId: string, toolName?: string, loadingType?: LoadingType) => {
      setState((prev) => ({
        ...prev,
        selectedToolId: toolId,
        toolName: toolName ?? prev.toolName,
        loadingType: loadingType ?? prev.loadingType,
      }));
    },
    []
  );

  const setSelectedStyle = useCallback((styleId: string) => {
    setState((prev) => ({ ...prev, selectedStyleId: styleId }));
  }, []);

  const setSelectedInputImage = useCallback((image: PickedImage, demoPhoto?: DemoPhoto) => {
    setState((prev) => ({
      ...prev,
      selectedInputImage: image,
      selectedDemoPhoto: demoPhoto,
    }));
  }, []);

  const clearSelectedInputImage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedInputImage: undefined,
      selectedDemoPhoto: undefined,
    }));
  }, []);

  const startMockGeneration = useCallback(
    (input: {
      jobId: string;
      toolId?: string;
      toolName?: string;
      loadingType?: LoadingType;
      roomType?: string;
      designStyle?: string;
    }) => {
      setState((prev) => ({
        ...prev,
        generationStatus: 'generating',
        jobId: input.jobId,
        selectedToolId: input.toolId ?? prev.selectedToolId,
        toolName: input.toolName ?? prev.toolName,
        loadingType: input.loadingType ?? prev.loadingType,
        roomType: input.roomType ?? prev.roomType,
        designStyle: input.designStyle ?? prev.designStyle,
        mockResultImageUrl: undefined,
        mockResultIndex: 0,
      }));
    },
    []
  );

  const completeMockGeneration = useCallback((resultUrl: string, resultIndex = 0) => {
    setState((prev) => ({
      ...prev,
      generationStatus: 'completed',
      mockResultImageUrl: resultUrl,
      mockResultIndex: resultIndex,
    }));
  }, []);

  const cycleMockResult = useCallback((urls: string[]) => {
    let nextUrl = urls[0];
    setState((prev) => {
      const nextIndex = (prev.mockResultIndex + 1) % urls.length;
      nextUrl = urls[nextIndex] ?? urls[0];
      return {
        ...prev,
        mockResultIndex: nextIndex,
        mockResultImageUrl: nextUrl,
      };
    });
    return nextUrl;
  }, []);

  const saveProject = useCallback(
    (project: Omit<SavedMockProject, 'id' | 'createdAt'>): SavedMockProject => {
      const saved: SavedMockProject = {
        ...project,
        id: `proj-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => ({
        ...prev,
        savedProjects: [saved, ...prev.savedProjects],
        lastGeneratedProject: saved,
      }));
      return saved;
    },
    []
  );

  const resetGeneration = useCallback(() => {
    setState((prev) => ({
      ...initialState,
      savedProjects: prev.savedProjects,
    }));
  }, []);

  const value = useMemo<GenerationContextValue>(
    () => ({
      ...state,
      setSelectedTool,
      setSelectedStyle,
      setSelectedInputImage,
      clearSelectedInputImage,
      startMockGeneration,
      completeMockGeneration,
      cycleMockResult,
      saveProject,
      resetGeneration,
    }),
    [
      state,
      setSelectedTool,
      setSelectedStyle,
      setSelectedInputImage,
      clearSelectedInputImage,
      startMockGeneration,
      completeMockGeneration,
      cycleMockResult,
      saveProject,
      resetGeneration,
    ]
  );

  return (
    <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>
  );
}

export function useGenerationStore(): GenerationContextValue {
  const ctx = useContext(GenerationContext);
  if (!ctx) {
    throw new Error('useGenerationStore must be used within GenerationProvider');
  }
  return ctx;
}
