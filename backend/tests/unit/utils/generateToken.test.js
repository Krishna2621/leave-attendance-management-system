const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../../../utils/generateToken");

describe("Token Generation", () => {
  const user = {
    _id: "507f191e810c19729de860ea",
    role: "employee",
  };

  beforeAll(() => {
    process.env.JWT_SECRET = "test-access-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  });

  describe("generateAccessToken", () => {
    test("should generate a valid access token", () => {
      // Arrange
      const expectedId = user._id;
      const expectedRole = user.role;

      // Act
      const token = generateAccessToken(user);

      // Assert
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      expect(decoded.id).toBe(expectedId);
      expect(decoded.role).toBe(expectedRole);
    });
  });

  describe("generateRefreshToken", () => {
    test("should generate a valid refresh token", () => {
      // Arrange
      const expectedId = user._id;

      // Act
      const token = generateRefreshToken(user);

      // Assert
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

      expect(decoded.id).toBe(expectedId);
      expect(decoded.jti).toBeDefined();
    });
  });
});
