import type { SelectedTextOperation } from './prompts';

export type SelectedTextRequest = {
  type: 'SELECTED_TEXT_PROCESS';
  text: string;
  operation: SelectedTextOperation;
};

export type SelectedTextResponse = {
  success: boolean;
  result?: string;
  error?: string;
};