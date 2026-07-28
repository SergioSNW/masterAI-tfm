import { fetchAttachments, openAttachment } from '../../src/services/attachmentService'

describe('attachmentService', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('fetchAttachments returns attachments for r1', async () => {
    const promise = fetchAttachments('r1')
    jest.advanceTimersByTime(500)
    const attachments = await promise
    expect(attachments.length).toBe(2)
    expect(attachments[0].fileName).toBe('Script_Scene_1.pdf')
  })

  it('fetchAttachments returns attachments for r2', async () => {
    const promise = fetchAttachments('r2')
    jest.advanceTimersByTime(500)
    const attachments = await promise
    expect(attachments.length).toBe(1)
    expect(attachments[0].fileName).toBe('Character_Brief.pdf')
  })

  it('fetchAttachments returns empty array for unknown round', async () => {
    const promise = fetchAttachments('r999')
    jest.advanceTimersByTime(500)
    const attachments = await promise
    expect(attachments).toEqual([])
  })

  it('each attachment has required fields', async () => {
    const promise = fetchAttachments('r1')
    jest.advanceTimersByTime(500)
    const attachments = await promise
    for (const a of attachments) {
      expect(a).toHaveProperty('id')
      expect(a).toHaveProperty('roundId')
      expect(a).toHaveProperty('fileName')
      expect(a).toHaveProperty('fileType')
      expect(a).toHaveProperty('url')
      expect(a).toHaveProperty('fileSize')
      expect(a).toHaveProperty('createdAt')
    }
  })
})
