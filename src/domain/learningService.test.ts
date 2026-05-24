import { describe, expect, it } from 'vitest'
import { businesses, entrepreneurs } from '../data/mockData'
import { learningLessons } from '../data/learningContent'
import { buildLearningPath } from './learningService'

describe('learningService', () => {
  it('prioriza aulas de MEI para empreendedora informal', () => {
    const entrepreneur = entrepreneurs.find((person) => person.formalizationStage === 'informal')!
    const business = businesses.find((item) => item.ownerId === entrepreneur.id)
    const path = buildLearningPath({ entrepreneur, business, lessons: learningLessons })

    expect(path.nextLesson.tags).toContain('mei')
    expect(path.nextLesson.sebraeCourseUrl).toContain('loja.sebrae.com.br')
    expect(path.nextAction).toContain('MEI')
    expect(path.levels).toHaveLength(3)
  })

  it('avanca para credito e crescimento quando a empreendedora ja esta formalizada', () => {
    const entrepreneur = entrepreneurs.find((person) => person.formalizationStage === 'formalizada')!
    const business = businesses.find((item) => item.ownerId === entrepreneur.id)
    const path = buildLearningPath({ entrepreneur, business, lessons: learningLessons })

    expect(path.progressPercent).toBeGreaterThan(80)
    expect(path.levels.find((level) => level.level === 'avancado')?.lessons.length).toBeGreaterThan(0)
  })
})
