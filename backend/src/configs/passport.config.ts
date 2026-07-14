import passport from "passport";
import { JWTAuthStrategy, LocalAuthStrategy, OTPAuthStrategy } from "@/utils/auth.util.js";

passport.use("local", LocalAuthStrategy);
passport.use("otp", OTPAuthStrategy);
passport.use("jwt", JWTAuthStrategy);
