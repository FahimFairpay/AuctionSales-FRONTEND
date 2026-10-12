import { describe, expect, it } from "vitest";
import { checkPassword, passwordMeetsPolicy } from "./passwordPolicy";
import { mapSignUpError } from "./session";
import { paths } from "../routes/paths";

describe("Sign Up Password Policy", () => {
  it("rejects passwords under 10 characters", () => {
    const check = checkPassword("Aa1!56789");
    expect(check.minLength).toBe(false);
    expect(passwordMeetsPolicy("Aa1!56789")).toBe(false);
  });

  it("accepts valid passwords with 10+ characters, uppercase, lowercase, number, symbol", () => {
    const valid = "FairSales2026!";
    const check = checkPassword(valid);
    expect(check.minLength).toBe(true);
    expect(check.upper).toBe(true);
    expect(check.lower).toBe(true);
    expect(check.number).toBe(true);
    expect(check.symbol).toBe(true);
    expect(passwordMeetsPolicy(valid)).toBe(true);
  });

  it("identifies specific missing requirements", () => {
    // Missing symbol
    const noSymbol = checkPassword("FairSales2026");
    expect(noSymbol.symbol).toBe(false);
    expect(noSymbol.upper).toBe(true);

    // Missing uppercase
    const noUpper = checkPassword("fairsales2026!");
    expect(noUpper.upper).toBe(false);

    // Missing number
    const noNumber = checkPassword("FairSalesPass!");
    expect(noNumber.number).toBe(false);
  });
});

describe("Sign Up Error Mapping", () => {
  it("maps UsernameExistsException to clear user-friendly message", () => {
    const err = { name: "UsernameExistsException", message: "User already exists" };
    expect(mapSignUpError(err)).toContain("An account with this email address already exists");
  });

  it("maps CodeMismatchException", () => {
    const err = { name: "CodeMismatchException", message: "Invalid code" };
    expect(mapSignUpError(err)).toContain("Invalid verification code");
  });

  it("maps ExpiredCodeException", () => {
    const err = { name: "ExpiredCodeException", message: "Code has expired" };
    expect(mapSignUpError(err)).toContain("This verification code has expired");
  });

  it("maps LimitExceededException", () => {
    const err = { name: "LimitExceededException", message: "Attempt limit exceeded" };
    expect(mapSignUpError(err)).toContain("Too many attempts");
  });
});

describe("Sign Up Paths", () => {
  it("defines signUp path correctly", () => {
    expect(paths.signUp).toBe("/sign-up");
  });
});
