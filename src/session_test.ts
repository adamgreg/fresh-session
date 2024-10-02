import { assert, assertEquals, assertFalse } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { FakeTime } from "@std/testing/time";

import type { SessionObject } from "./session.ts";
import { Session } from "./session.ts";

describe("Session", () => {
  describe("constructor", () => {
    it("should set passed session object to property", () => {
      using _time = new FakeTime("2222-02-02T00:00:00.000Z");

      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: new Date().toISOString(),
      });

      const sessionObject = session.getSessionObject();

      assertEquals(sessionObject.data.test.value, "this_is_session_data");
      assertEquals(sessionObject.data.test.flash, true);
      assertEquals(sessionObject.expire, new Date().toISOString());
    });

    it("should set the default values to property", () => {
      const session = new Session();

      const sessionObject = session.getSessionObject();

      assertEquals(sessionObject.data, {});
      assertEquals(sessionObject.expire, null);
    });
  });

  describe("setSessionObject", () => {
    it("should set the session object correctly", () => {
      using _time = new FakeTime("2222-02-02T00:00:00.000Z");

      const sessionObject: SessionObject = {
        data: { test: { value: "this_is_session_data", flash: false } },
        expire: new Date().toISOString(),
      };

      const session = new Session();
      session.setSessionObject(sessionObject);

      const result = session.getSessionObject();

      assertEquals(sessionObject.data.test.value, "this_is_session_data");
      assertEquals(result.expire, new Date().toISOString());
    });
  });

  describe("getSessionObject", () => {
    it("should get the session object correctly", () => {
      using _time = new FakeTime("2222-02-02T00:00:00.000Z");

      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: new Date().toISOString(),
      });

      const sessionObject = session.getSessionObject();

      assertEquals(sessionObject.data.test.value, "this_is_session_data");
      assertEquals(sessionObject.data.test.flash, true);
      assertEquals(sessionObject.expire, new Date().toISOString());
    });
  });

  describe("reset", () => {
    it("should reset the session object correctly with expiration time", () => {
      using _time = new FakeTime("2222-02-02T00:00:00.000Z");

      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: new Date().toISOString(),
      });

      session.reset(60);

      const sessionObject = session.getSessionObject();

      assertEquals(sessionObject.data, {});
      assertEquals(sessionObject.expire, "2222-02-02T00:01:00.000Z");
    });

    it("should reset the session object correctly without expiration time", () => {
      using _time = new FakeTime("2222-02-02T00:00:00.000Z");

      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: new Date().toISOString(),
      });

      session.reset();

      const sessionObject = session.getSessionObject();

      assertEquals(sessionObject.data, {});
      assertEquals(sessionObject.expire, null);
    });
  });

  describe("refresh", () => {
    it("should refresh the session and set new expiration time", () => {
      using _time = new FakeTime("2222-02-02T00:00:00.000Z");

      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: new Date().toISOString(),
      });

      session.refresh(60);

      const sessionObject = session.getSessionObject();

      assertEquals(sessionObject.expire, "2222-02-02T00:01:00.000Z");
    });
  });

  describe("isExpired", () => {
    it("should return false when session is not expired", () => {
      using _time = new FakeTime("2222-02-02T00:00:00.000Z");

      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: "2222-02-02T00:01:00.000Z",
      });

      assertFalse(session.isExpired());
    });

    it("should return true when session is not expired", () => {
      using _time = new FakeTime("2222-02-02T00:02:00.000Z");

      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: "2222-02-02T00:01:00.000Z",
      });

      assert(session.isExpired());
    });

    it("should return false when expire is not set in session", () => {
      using _time = new FakeTime("2222-02-02T00:00:00.000Z");

      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: null,
      });

      assertFalse(session.isExpired());
    });
  });

  describe("get", () => {
    it("should return the value of the key and it remains in session when flash flag is off", () => {
      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: false } },
        expire: null,
      });

      const result = session.get("test");
      const result2 = session.get("test");

      assertEquals(result, "this_is_session_data");
      assertEquals(result2, "this_is_session_data");
    });

    it("should return the value of the key and delete it when flash flag on", () => {
      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: null,
      });

      const result = session.get("test");
      const result2 = session.get("test");

      assertEquals(result, "this_is_session_data");
      assertEquals(result2, null);
    });

    it("should return null when the key does not exist", () => {
      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: null,
      });

      const result = session.get("not_exist");

      assertEquals(result, null);
    });
  });

  describe("set", () => {
    it("should set the value of the key and flash flag is off", () => {
      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: true } },
        expire: null,
      });

      session.set("test", "new_data");

      const result = session.get("test");
      const result2 = session.get("test");

      assertEquals(result, "new_data");
      assertEquals(result2, "new_data");
    });
  });

  describe("flash", () => {
    it("should set the value of the key and flash flag is on", () => {
      const session = new Session({
        data: { test: { value: "this_is_session_data", flash: false } },
        expire: null,
      });

      session.flash("test", "new_data");

      const result = session.get("test");
      const result2 = session.get("test");

      assertEquals(result, "new_data");
      assertEquals(result2, null);
    });
  });
});
