export const getSelectedText = (): string => {
  const selection = window.getSelection();

  if (!selection) {
    return '';
  }

  return selection.toString().trim();
};