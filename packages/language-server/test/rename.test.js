/**
 * @typedef {import('@volar/test-utils').LanguageServerHandle} LanguageServerHandle
 */
import assert from 'node:assert/strict'
import {afterEach, beforeEach, test} from 'node:test'
import {createServer, fixturePath, fixtureUri, tsdk} from './utils.js'

/** @type {LanguageServerHandle} */
let serverHandle

beforeEach(async () => {
  serverHandle = createServer()
  await serverHandle.initialize(fixtureUri('node16'), {typescript: {tsdk}})
})

afterEach(() => {
  serverHandle.connection.dispose()
})

test('handle rename request of variable for opened references', async () => {
  await serverHandle.openTextDocument(fixturePath('node16/b.mdx'), 'mdx')
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/a.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendRenameRequest(
    uri,
    {line: 4, character: 3},
    'renamed'
  )

  assert.deepEqual(result, {
    changes: {
      [fixtureUri('node16/a.mdx')]: [
        {
          newText: 'renamed',
          range: {
            start: {line: 11, character: 1},
            end: {line: 11, character: 2}
          }
        },
        {
          newText: 'renamed',
          range: {
            start: {line: 4, character: 2},
            end: {line: 4, character: 3}
          }
        },
        {
          newText: 'renamed',
          range: {
            start: {line: 1, character: 16},
            end: {line: 1, character: 17}
          }
        }
      ],
      [fixtureUri('node16/b.mdx')]: [
        {
          newText: 'renamed',
          range: {
            start: {line: 0, character: 9},
            end: {line: 0, character: 10}
          }
        }
      ],
      [fixtureUri('node16/mixed.mdx')]: [
        {
          newText: 'renamed',
          range: {
            start: {line: 0, character: 9},
            end: {line: 0, character: 10}
          }
        }
      ]
    }
  })
})

test('handle undefined rename request', async () => {
  const {uri} = await serverHandle.openTextDocument(
    fixturePath('node16/undefined-props.mdx'),
    'mdx'
  )
  const result = await serverHandle.sendRenameRequest(
    uri,
    {line: 4, character: 3},
    'renamed'
  )

  assert.deepEqual(result, null)
})

test('ignore non-existent mdx files', async () => {
  const uri = fixtureUri('node16/non-existent.mdx')
  const result = await serverHandle.sendRenameRequest(
    uri,
    {line: 7, character: 15},
    'renamed'
  )

  assert.deepEqual(result, null)
})
