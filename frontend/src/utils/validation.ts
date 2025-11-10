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
