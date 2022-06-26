import benchmark from 'benchmark'

export default function createSuite (description) {
  const suite = new benchmark.Suite()
  suite.start = () => suite.run()
  console.log(description)
  return suite
    .on('cycle', ({ target }) => {
      const { error, name } = target
      if (error) {
        console.error(`  ${name} failed`)
      } else {
        console.log(`  ${target}`)
      }
    })
    .on('error', ({ target }) => console.warn(target.error))
}
