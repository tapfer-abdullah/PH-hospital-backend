import jwt, { type JwtPayload } from "jsonwebtoken";

export const generateToken = (
  payload: any,
  secret: string,
  expiresIn: string | number
) => {
  const options: any = {
    expiresIn,
  };
  const token = jwt.sign(payload, secret, options);

  return token;
};

export const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};
