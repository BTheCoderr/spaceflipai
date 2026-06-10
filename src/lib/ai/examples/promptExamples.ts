import { buildPrompt } from '../promptBuilder';
import type { PromptParams } from '../types';

export type PromptExample = {
  id: string;
  label: string;
  params: PromptParams;
  expectedPrompt: string;
};

export const promptExamples: PromptExample[] = [
  {
    id: 'airbnb-bedroom',
    label: 'Airbnb bedroom staging',
    params: {
      spaceType: 'airbnb',
      style: 'cozy',
      task: 'redesign',
      roomLabel: 'bedroom',
      constraints: ['add_furniture', 'remove_clutter', 'preserve_room_structure'],
    },
    expectedPrompt: buildPrompt({
      spaceType: 'airbnb',
      style: 'cozy',
      task: 'redesign',
      roomLabel: 'bedroom',
      constraints: ['add_furniture', 'remove_clutter', 'preserve_room_structure'],
    }),
  },
  {
    id: 'commercial-office',
    label: 'Commercial office layout',
    params: {
      spaceType: 'office',
      style: 'commercial',
      task: 'rearrange',
      roomLabel: 'open office',
      constraints: ['preserve_walls', 'preserve_windows', 'add_furniture'],
    },
    expectedPrompt: buildPrompt({
      spaceType: 'office',
      style: 'commercial',
      task: 'rearrange',
      roomLabel: 'open office',
      constraints: ['preserve_walls', 'preserve_windows', 'add_furniture'],
    }),
  },
  {
    id: 'small-retail',
    label: 'Small retail display',
    params: {
      spaceType: 'retail',
      style: 'modern',
      task: 'decor',
      roomLabel: 'boutique floor',
      constraints: ['add_furniture', 'preserve_room_structure'],
    },
    expectedPrompt: buildPrompt({
      spaceType: 'retail',
      style: 'modern',
      task: 'decor',
      roomLabel: 'boutique floor',
      constraints: ['add_furniture', 'preserve_room_structure'],
    }),
  },
  {
    id: 'backyard-landscaping',
    label: 'Backyard landscaping',
    params: {
      spaceType: 'garden',
      style: 'minimalist',
      task: 'redesign',
      roomLabel: 'backyard',
      constraints: ['preserve_room_structure'],
    },
    expectedPrompt: buildPrompt({
      spaceType: 'garden',
      style: 'minimalist',
      task: 'redesign',
      roomLabel: 'backyard',
      constraints: ['preserve_room_structure'],
    }),
  },
  {
    id: 'living-room-redesign',
    label: 'Living room redesign',
    params: {
      spaceType: 'interior',
      style: 'scandinavian',
      task: 'redesign',
      roomLabel: 'living room',
      constraints: ['preserve_windows', 'preserve_doors', 'add_furniture'],
    },
    expectedPrompt: buildPrompt({
      spaceType: 'interior',
      style: 'scandinavian',
      task: 'redesign',
      roomLabel: 'living room',
      constraints: ['preserve_windows', 'preserve_doors', 'add_furniture'],
    }),
  },
  {
    id: 'declutter-cleanup',
    label: 'Declutter and cleanup',
    params: {
      spaceType: 'interior',
      style: 'minimalist',
      task: 'declutter',
      roomLabel: 'living room',
      constraints: ['remove_clutter', 'preserve_room_structure'],
    },
    expectedPrompt: buildPrompt({
      spaceType: 'interior',
      style: 'minimalist',
      task: 'declutter',
      roomLabel: 'living room',
      constraints: ['remove_clutter', 'preserve_room_structure'],
    }),
  },
  {
    id: 'replace-sofa',
    label: 'Replace sofa',
    params: {
      spaceType: 'interior',
      style: 'modern',
      task: 'replace',
      roomLabel: 'living room',
      targetItem: 'sofa',
      constraints: ['preserve_walls', 'keep_existing_flooring'],
    },
    expectedPrompt: buildPrompt({
      spaceType: 'interior',
      style: 'modern',
      task: 'replace',
      roomLabel: 'living room',
      targetItem: 'sofa',
      constraints: ['preserve_walls', 'keep_existing_flooring'],
    }),
  },
  {
    id: 'rearrange-furniture',
    label: 'Rearrange furniture',
    params: {
      spaceType: 'interior',
      style: 'cozy',
      task: 'rearrange',
      roomLabel: 'living room',
      constraints: ['preserve_walls', 'preserve_windows', 'preserve_doors'],
    },
    expectedPrompt: buildPrompt({
      spaceType: 'interior',
      style: 'cozy',
      task: 'rearrange',
      roomLabel: 'living room',
      constraints: ['preserve_walls', 'preserve_windows', 'preserve_doors'],
    }),
  },
];
