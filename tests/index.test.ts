import { beforeEach, describe, expect, test } from "vitest"

import {
  APIKey,
  checkAPIKey,
  extractLongToken,
  extractLongTokenHash,
  extractShortToken,
  generateAPIKey,
  getTokenComponents,
  hashLongToken,
} from "../src/index"

declare module "vitest" {
  export interface TestContext {
    key: APIKey
  }
}

describe("function", () => {
  beforeEach(async (context) => {
    context.key = await generateAPIKey({ keyPrefix: "my_company" })
  })

  describe("generateAPIKey", () => {
    test("should return object with key properties", async (context) => {
      const { key } = context

      expect(key).not.toBeNull()
      expect(key).toHaveProperty("longToken")
      expect(key).toHaveProperty("longTokenHash")
      expect(key).toHaveProperty("shortToken")
      expect(key).toHaveProperty("token")
    })

    test("should accept and validate keyPrefix arg with chars [a-z0-9_]", async (context) => {
      const key = await generateAPIKey({ keyPrefix: "my_company_1_2_three" })

      expect(key).not.toBeNull()
      expect(key).toHaveProperty("longToken")
      expect(key).toHaveProperty("longTokenHash")
      expect(key).toHaveProperty("shortToken")
      expect(key).toHaveProperty("token")
      expect(checkAPIKey(key.token, key.longTokenHash)).toEqual(true)
    })

    test("should accept and validate shortTokenPrefix arg with chars [a-z0-9]", async (context) => {
      const key = await generateAPIKey({
        keyPrefix: "my_company",
        shortTokenPrefix: "myprefix123",
      })

      expect(key).not.toBeNull()
      expect(key).toHaveProperty("shortToken")
      expect(key.shortToken).toMatch(/^myprefix123/)
      expect(checkAPIKey(key.token, key.longTokenHash)).toEqual(true)
    })

    test("should accept and validate shortTokenLength arg with 4", async (context) => {
      const key = await generateAPIKey({
        keyPrefix: "my_company",
        shortTokenLength: 4,
      })

      expect(key).not.toBeNull()
      expect(key).toHaveProperty("shortToken")
      expect(key.shortToken.length).toEqual(4)
      expect(checkAPIKey(key.token, key.longTokenHash)).toEqual(true)
    })

    test("should accept and validate shortTokenLength arg with 24", async (context) => {
      const key = await generateAPIKey({
        keyPrefix: "my_company",
        shortTokenLength: 24,
      })

      expect(key).not.toBeNull()
      expect(key).toHaveProperty("shortToken")
      expect(key.shortToken.length).toEqual(24)
      expect(checkAPIKey(key.token, key.longTokenHash)).toEqual(true)
    })

    test("should accept and validate longTokenLength arg with 4", async (context) => {
      const key = await generateAPIKey({
        keyPrefix: "my_company",
        longTokenLength: 4,
      })

      expect(key).not.toBeNull()
      expect(key).toHaveProperty("shortToken")
      expect(key.longToken.length).toEqual(4)
      expect(checkAPIKey(key.token, key.longTokenHash)).toEqual(true)
    })

    test("should accept and validate longTokenLength arg with 24", async (context) => {
      const key = await generateAPIKey({
        keyPrefix: "my_company",
        longTokenLength: 24,
      })

      expect(key).not.toBeNull()
      expect(key).toHaveProperty("longToken")
      expect(key.longToken.length).toEqual(24)
      expect(checkAPIKey(key.token, key.longTokenHash)).toEqual(true)
    })

    test("should throw if no object arg is provided", async (context) => {
      // @ts-expect-error
      expect(async () => await generateAPIKey()).rejects.toThrowError(
        "options object is required"
      )
    })

    test("should throw if keyPrefix arg is missing", async (context) => {
      // @ts-expect-error
      expect(async () => await generateAPIKey({})).rejects.toThrowError(
        "keyPrefix is required"
      )
    })

    test("should throw if keyPrefix arg is not a string", async (context) => {
      expect(
        // @ts-expect-error
        async () => await generateAPIKey({ keyPrefix: 1 })
      ).rejects.toThrowError("keyPrefix is required")
    })

    test("should throw if keyPrefix has an invalid character", async (context) => {
      expect(
        async () => await generateAPIKey({ keyPrefix: "foo*bar" })
      ).rejects.toThrowError("keyPrefix is required")
    })

    test("should throw if shortTokenPrefix has an invalid character", async (context) => {
      expect(
        async () =>
          await generateAPIKey({
            keyPrefix: "my_company",
            shortTokenPrefix: "foo*bar",
          })
      ).rejects.toThrowError(
        "shortTokenPrefix must only contain lowercase letters and numbers"
      )
    })

    test("should throw if shortTokenLength is not a number", async (context) => {
      // prettier-ignore
      expect(
        async () =>
        // @ts-ignore-error
        await generateAPIKey({ keyPrefix: "my_company", shortTokenLength: "1" })
      ).rejects.toThrowError(
        "shortTokenLength must be a number between 4 and 24"
      )
    })

    test("should throw if shortTokenLength is < 4", async (context) => {
      expect(
        async () =>
          await generateAPIKey({
            keyPrefix: "my_company",
            shortTokenLength: 3,
          })
      ).rejects.toThrowError(
        "shortTokenLength must be a number between 4 and 24"
      )
    })

    test("should throw if shortTokenLength is > 24", async (context) => {
      expect(
        async () =>
          await generateAPIKey({
            keyPrefix: "my_company",
            shortTokenLength: 25,
          })
      ).rejects.toThrowError(
        "shortTokenLength must be a number between 4 and 24"
      )
    })

    test("should throw if longTokenLength is not a number", async (context) => {
      // prettier-ignore
      expect(
        async () =>
        // @ts-ignore-error
        await generateAPIKey({ keyPrefix: "my_company", longTokenLength: "1" })
      ).rejects.toThrowError(
        "longTokenLength must be a number between 4 and 24"
      )
    })

    test("should throw if longTokenLength is < 4", async (context) => {
      expect(
        async () =>
          await generateAPIKey({
            keyPrefix: "my_company",
            longTokenLength: 3,
          })
      ).rejects.toThrowError(
        "longTokenLength must be a number between 4 and 24"
      )
    })

    test("should throw if longTokenLength is > 24", async (context) => {
      expect(
        async () =>
          await generateAPIKey({
            keyPrefix: "my_company",
            longTokenLength: 25,
          })
      ).rejects.toThrowError(
        "longTokenLength must be a number between 4 and 24"
      )
    })
  })

  describe("checkAPIKey", () => {
    test("should return true if long token hash matches", async (context) => {
      const { key } = context

      expect(checkAPIKey(key.token, key.longTokenHash)).toEqual(true)
    })

    test("should return false if long token hash does not match", async (context) => {
      const { key } = context

      expect(checkAPIKey(key.token, "foo")).toEqual(false)
    })
  })

  describe("extractLongToken", () => {
    test("should return long token", async (context) => {
      const { key } = context

      expect(extractLongToken(key.token)).toEqual(key.longToken)
    })
  })

  describe("extractLongTokenHash", () => {
    test("should return long token hash", async (context) => {
      const { key } = context

      expect(extractLongTokenHash(key.token)).toEqual(key.longTokenHash)
    })
  })

  describe("extractShortToken", () => {
    test("should return short token", async (context) => {
      const { key } = context

      expect(extractShortToken(key.token)).toEqual(key.shortToken)
    })
  })

  describe("getTokenComponents", () => {
    test("should return object with key components", async (context) => {
      const { key } = context

      expect(getTokenComponents(key.token)).toEqual(key)
    })

    test("should return correct components of a known token", async () => {
      const exampleKey = {
        shortToken: "BRTRKFsL",
        longToken: "51FwqftsmMDHHbJAMEXXHCgG",
        longTokenHash:
          "d70d981d87b449c107327c2a2afbf00d4b58070d6ba571aac35d7ea3e7c79f37",
        token: "my_company_BRTRKFsL_51FwqftsmMDHHbJAMEXXHCgG",
      }

      expect(getTokenComponents(exampleKey.token)).toEqual(exampleKey)
    })
  })

  describe("hashLongToken", () => {
    test("should return hash of long token", async (context) => {
      const { key } = context

      expect(hashLongToken(key.longToken)).toEqual(key.longTokenHash)
    })
  })
})
