export function validateUserName(name: string): boolean {
  // 1-50文字
  if (name.length < 1 || name.length > 50) {
    return false;
  }

  // 空白のみ禁止
  if (name.trim().length === 0) {
    return false;
  }

  return true;
}

export function validateMessageContent(content: string): boolean {
  // 1-1000文字
  if (content.length < 1 || content.length > 1000) {
    return false;
  }

  // 空白のみ禁止
  if (content.trim().length === 0) {
    return false;
  }

  return true;
}

export function getValidationError(field: 'name' | 'message', value: string): string | null {
  if (field === 'name') {
    if (!validateUserName(value)) {
      if (value.length === 0 || value.trim().length === 0) {
        return 'ユーザー名を入力してください';
      }
      if (value.length > 50) {
        return 'ユーザー名は50文字以内で入力してください';
      }
      return 'ユーザー名が無効です';
    }
  }

  if (field === 'message') {
    if (!validateMessageContent(value)) {
      if (value.length === 0 || value.trim().length === 0) {
        return 'メッセージを入力してください';
      }
      if (value.length > 1000) {
        return 'メッセージは1000文字以内で入力してください';
      }
      return 'メッセージが無効です';
    }
  }

  return null;
}
