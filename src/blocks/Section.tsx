import { z } from 'zod'
import { createElement } from 'react'
import { inlineSequence, InlineSequence } from '../inlines'
import { blockSequence, BlockSequence } from './Blocks'
import { Paragraph } from './Paragraph'
import { Heading } from './Heading'
import { Block } from './Block'
import { key } from '../lib/keys'

export type SectionProps = {
  title: InlineSequence
  abstract?: InlineSequence
  blocks?: BlockSequence
  sections?: SectionSequence
}

export const sectionSequence: z.ZodSchema<SectionSequence> = z.lazy(() =>
  z.array(sectionProps)
)

export const sectionProps = z.object({
  title: inlineSequence,
  abstract: inlineSequence.optional(),
  blocks: blockSequence.optional(),
  sections: sectionSequence.optional(),
})

export type SectionSequence = SectionProps[]

const topLevelSectionProps = z.object({
  className: z.string().optional(),
  level: z.number().default(2),
  as: z.string().default('section'),
})

type TopLevelSectionProps = z.infer<typeof topLevelSectionProps>

// TODO: understand zod better
export const sectionComponentProps = topLevelSectionProps.merge(sectionProps)

export type SectionComponentProps = Partial<TopLevelSectionProps> & SectionProps

export const Section = (props: SectionComponentProps) => {
  const { title, abstract, sections, blocks, className, as, level } =
    sectionComponentProps.parse(props)
  return createElement(
    as,
    { className },
    <>
      {title && <Heading paragraph={title} level={level ?? 2} />}
      {abstract && <Paragraph paragraph={abstract} />}
      {(blocks || []).map((block) => (
        <Block {...block} key={key(block)} />
      ))}
      {(sections || []).map((section, s) => (
        <Section {...section} key={key(section)} as={as} level={level + 1} />
      ))}
    </>
  )
}

export const MainSection = (props: SectionComponentProps) => (
  <Section {...props} as="main" level={1} />
)
