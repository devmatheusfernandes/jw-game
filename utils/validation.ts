export function nonEmpty(s: string) {
  return s.trim().length > 0
}

export function uniqueTopicName(name: string, topics: Array<{ name: string }>) {
  const n = name.trim().toLowerCase()
  return !topics.some((t) => t.name.trim().toLowerCase() === n)
}

export function validateDeck(title: string, topicId: string, qIds: string[]) {
  return nonEmpty(title) && nonEmpty(topicId) && qIds.length > 0
}

export function validateQuestion(title: string, options: string[], answerIndex: number) {
  const cleaned = options.map((o) => o.trim()).filter((o) => o.length > 0)
  const idxValid = !Number.isNaN(answerIndex) && answerIndex >= 0 && answerIndex < cleaned.length
  return nonEmpty(title) && cleaned.length >= 2 && idxValid
}

