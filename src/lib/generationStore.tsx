import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { DemoPhoto } from '../data/mockDemoPhotos';
import { getProjectTypeLabel, type ProjectTypeId } from '../data/mockProjectTypes';
import { getUpgradePlanResult, type UpgradePlanResult } from '../data/mockUpgradeResults';
import type { PickedImage, PickedImageSource } from './imagePicker';
import {
  completeGenerationJobMock,
  createGenerationJob,
  failGenerationJob,
  getGenerationJob,
  type GenerationJob,
  type GenerationJobError,
  type GenerationJobStatus,
} from './generationJobs';
import {
  StorageUploadError,
  uploadDesignInputImage,
  type UploadDesignInputResult,
} from './storage';

export type GenerationStatus = 'idle' | 'generating' | 'completed' | 'failed';

export type ProjectStatus = 'active' | 'completed' | 'draft';

export type SavedMockProject = {
  id: string;
  title: string;
  projectType: string;
  projectTypeLabel: string;
  goal: string;
  resultImageUrl: string;
  inputImageUri: string;
  inputPublicUrl?: string;
  jobId?: string;
  jobStatus?: GenerationJobStatus;
  status: ProjectStatus;
  budgetRange?: string;
  source: PickedImageSource;
  createdAt: string;
  /** @deprecated Use title */
  toolName?: string;
  /** @deprecated Use projectType */
  toolId?: string;
};

type GenerationState = {
  selectedProjectTypeId?: ProjectTypeId;
  selectedGoal?: string;
  selectedBudgetRange?: string;
  selectedNotes?: string;
  currentUpgradePlan?: UpgradePlanResult;
  selectedToolId?: string;
  selectedStyleId?: string;
  selectedInputImage?: PickedImage;
  selectedDemoPhoto?: DemoPhoto;
  generationStatus: GenerationStatus;
  mockResultImageUrl?: string;
  mockResultIndex: number;
  lastGeneratedProject?: SavedMockProject;
  savedProjects: SavedMockProject[];
  currentJobId?: string;
  currentJob?: GenerationJob;
  uploadedInputPublicUrl?: string;
  uploadedInputStoragePath?: string;
  generationError?: string;
  toolName?: string;
  roomType?: string;
  designStyle?: string;
};

type CreateJobInput = {
  projectTypeId: ProjectTypeId;
  goal: string;
  budgetRange?: string;
  projectTitle?: string;
};

type GenerationContextValue = GenerationState & {
  setProjectIntake: (input: {
    projectTypeId: ProjectTypeId;
    goal: string;
    budgetRange?: string;
    notes?: string;
    projectTitle?: string;
  }) => void;
  setSelectedTool: (toolId: string, toolName?: string) => void;
  setSelectedInputImage: (image: PickedImage, demoPhoto?: DemoPhoto) => void;
  clearSelectedInputImage: () => void;
  uploadSelectedImage: () => Promise<UploadDesignInputResult>;
  createJobForSelectedImage: (input: CreateJobInput) => Promise<GenerationJob>;
  startMockGeneration: (input: {
    jobId: string;
    projectTypeId?: ProjectTypeId;
    projectTitle?: string;
    goal?: string;
  }) => void;
  completeCurrentJobMock: (resultUrl: string, resultIndex?: number) => Promise<void>;
  failCurrentJob: (message: string) => Promise<void>;
  clearGenerationError: () => void;
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
  const stateRef = useRef(state);
  stateRef.current = state;

  const setProjectIntake = useCallback(
    (input: {
      projectTypeId: ProjectTypeId;
      goal: string;
      budgetRange?: string;
      notes?: string;
      projectTitle?: string;
    }) => {
      setState((prev) => ({
        ...prev,
        selectedProjectTypeId: input.projectTypeId,
        selectedGoal: input.goal,
        selectedBudgetRange: input.budgetRange,
        selectedNotes: input.notes,
        toolName: input.projectTitle ?? getProjectTypeLabel(input.projectTypeId),
        selectedToolId: input.projectTypeId,
      }));
    },
    []
  );

  const setSelectedTool = useCallback((toolId: string, toolName?: string) => {
    setState((prev) => ({
      ...prev,
      selectedToolId: toolId,
      toolName: toolName ?? prev.toolName,
    }));
  }, []);

  const setSelectedInputImage = useCallback((image: PickedImage, demoPhoto?: DemoPhoto) => {
    setState((prev) => ({
      ...prev,
      selectedInputImage: image,
      selectedDemoPhoto: demoPhoto,
      uploadedInputPublicUrl: undefined,
      uploadedInputStoragePath: undefined,
      generationError: undefined,
    }));
  }, []);

  const clearSelectedInputImage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedInputImage: undefined,
      selectedDemoPhoto: undefined,
      uploadedInputPublicUrl: undefined,
      uploadedInputStoragePath: undefined,
    }));
  }, []);

  const clearGenerationError = useCallback(() => {
    setState((prev) => ({ ...prev, generationError: undefined }));
  }, []);

  const uploadSelectedImage = useCallback(async (): Promise<UploadDesignInputResult> => {
    const image = stateRef.current.selectedInputImage;
    if (!image) {
      throw new StorageUploadError('No photo selected. Please choose an image first.', 'missing_image');
    }

    try {
      const upload = await uploadDesignInputImage(image);
      setState((prev) => ({
        ...prev,
        uploadedInputPublicUrl: upload.publicUrl,
        uploadedInputStoragePath: upload.storagePath,
        generationError: undefined,
      }));
      return upload;
    } catch (error) {
      const message =
        error instanceof StorageUploadError
          ? error.message
          : 'We could not upload your photo. Please try again.';
      setState((prev) => ({ ...prev, generationError: message }));
      throw error;
    }
  }, []);

  const createJobForSelectedImage = useCallback(
    async (input: CreateJobInput): Promise<GenerationJob> => {
      const current = stateRef.current;
      const image = current.selectedInputImage;
      if (!image) {
        const err = {
          code: 'missing_image',
          message: 'No photo selected. Please choose an image first.',
        } as GenerationJobError;
        setState((prev) => ({ ...prev, generationError: err.message }));
        throw err;
      }

      if (!input.projectTypeId) {
        const err = {
          code: 'missing_tool',
          message: 'Project type is missing. Please go back and try again.',
        } as GenerationJobError;
        setState((prev) => ({ ...prev, generationError: err.message }));
        throw err;
      }

      const upgradePlan = getUpgradePlanResult(
        input.projectTypeId,
        input.goal,
        input.budgetRange ?? current.selectedBudgetRange
      );

      try {
        const job = await createGenerationJob({
          toolId: input.projectTypeId,
          styleId: input.goal,
          inputImageUri: image.uri,
          inputStoragePath: current.uploadedInputStoragePath,
          inputPublicUrl: current.uploadedInputPublicUrl ?? image.uri,
          source: image.source,
        });

        setState((prev) => ({
          ...prev,
          currentJobId: job.id,
          currentJob: job,
          currentUpgradePlan: upgradePlan,
          selectedProjectTypeId: input.projectTypeId,
          selectedGoal: input.goal,
          selectedBudgetRange: input.budgetRange ?? prev.selectedBudgetRange,
          selectedToolId: input.projectTypeId,
          toolName: input.projectTitle ?? getProjectTypeLabel(input.projectTypeId),
          generationError: undefined,
        }));

        return job;
      } catch (error) {
        const err = error as GenerationJobError;
        const message = err.message ?? 'Could not create your design job. Please try again.';
        setState((prev) => ({ ...prev, generationError: message }));
        throw error;
      }
    },
    []
  );

  const startMockGeneration = useCallback(
    (input: {
      jobId: string;
      projectTypeId?: ProjectTypeId;
      projectTitle?: string;
      goal?: string;
    }) => {
      setState((prev) => ({
        ...prev,
        generationStatus: 'generating',
        currentJobId: input.jobId,
        selectedProjectTypeId: input.projectTypeId ?? prev.selectedProjectTypeId,
        selectedGoal: input.goal ?? prev.selectedGoal,
        toolName: input.projectTitle ?? prev.toolName,
        selectedToolId: input.projectTypeId ?? prev.selectedToolId,
        mockResultImageUrl: undefined,
        mockResultIndex: 0,
        generationError: undefined,
      }));
    },
    []
  );

  const completeCurrentJobMock = useCallback(
    async (resultUrl: string, resultIndex = 0) => {
      const jobId = stateRef.current.currentJobId;
      if (!jobId) {
        setState((prev) => ({
          ...prev,
          generationStatus: 'completed',
          mockResultImageUrl: resultUrl,
          mockResultIndex: resultIndex,
        }));
        return;
      }

      const job = await completeGenerationJobMock(jobId, {
        resultIndex,
        resultImageUrl: resultUrl,
      });

      setState((prev) => ({
        ...prev,
        generationStatus: 'completed',
        currentJob: job,
        mockResultImageUrl: resultUrl,
        mockResultIndex: resultIndex,
        generationError: undefined,
      }));
    },
    []
  );

  const failCurrentJob = useCallback(async (message: string) => {
    const jobId = stateRef.current.currentJobId;
    if (jobId) {
      const job = await failGenerationJob(jobId, message);
      setState((prev) => ({
        ...prev,
        generationStatus: 'failed',
        currentJob: job,
        generationError: message,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      generationStatus: 'failed',
      generationError: message,
    }));
  }, []);

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
      setProjectIntake,
      setSelectedTool,
      setSelectedInputImage,
      clearSelectedInputImage,
      uploadSelectedImage,
      createJobForSelectedImage,
      startMockGeneration,
      completeCurrentJobMock,
      failCurrentJob,
      clearGenerationError,
      completeMockGeneration,
      cycleMockResult,
      saveProject,
      resetGeneration,
    }),
    [
      state,
      setProjectIntake,
      setSelectedTool,
      setSelectedInputImage,
      clearSelectedInputImage,
      uploadSelectedImage,
      createJobForSelectedImage,
      startMockGeneration,
      completeCurrentJobMock,
      failCurrentJob,
      clearGenerationError,
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

export async function refreshCurrentJob(jobId: string): Promise<GenerationJob | null> {
  return getGenerationJob(jobId);
}
